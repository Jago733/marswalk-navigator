import { marsDistanceMeters, getElevationAt, getTerrainType } from './marsCoords';
import { calculateSlope, getSlopeDifficulty } from './slopeCalc';
import { EVA_SAFETY, MARS_RADIUS_KM } from '../data/constants';

/**
 * Interpolación Spline Catmull-Rom centripetal para generar curvas suaves
 * y naturales a través de los puntos de control del terreno.
 */
function catmullRom(p0, p1, p2, p3, t) {
  const t2 = t * t;
  const t3 = t2 * t;
  const lat =
    0.5 *
    (2 * p1.lat +
      (-p0.lat + p2.lat) * t +
      (2 * p0.lat - 5 * p1.lat + 4 * p2.lat - p3.lat) * t2 +
      (-p0.lat + 3 * p1.lat - 3 * p2.lat + p3.lat) * t3);
  const lng =
    0.5 *
    (2 * p1.lng +
      (-p0.lng + p2.lng) * t +
      (2 * p0.lng - 5 * p1.lng + 4 * p2.lng - p3.lng) * t2 +
      (-p0.lng + 3 * p1.lng - 3 * p2.lng + p3.lng) * t3);
  return { lat, lng };
}

function getControlPoint(pts, index) {
  if (index < 0) {
    return {
      lat: 2 * pts[0].lat - pts[1].lat,
      lng: 2 * pts[0].lng - pts[1].lng,
    };
  }
  if (index >= pts.length) {
    const last = pts.length - 1;
    return {
      lat: 2 * pts[last].lat - pts[last - 1].lat,
      lng: 2 * pts[last].lng - pts[last - 1].lng,
    };
  }
  return pts[index];
}

/**
 * Zonas críticas de riesgo geológico en el Cráter Gale que la ruta debe bordear/esquivar.
 */
const CRITICAL_HAZARDS = [
  {
    name: 'Campo de Dunas Activas de Namib (Arena Suelta / Atascamiento)',
    lat: -4.685,
    lng: 137.375,
    radiusMeters: 1400,
    costWeight: 9000,
  },
  {
    name: 'Escarpe Abrupto Norte de la Cresta Vera Rubin (>24°)',
    lat: -4.728,
    lng: 137.362,
    radiusMeters: 950,
    costWeight: 7500,
  },
  {
    name: 'Laderas Inestables del Pedimento de Greenheugh',
    lat: -4.745,
    lng: 137.345,
    radiusMeters: 1100,
    costWeight: 8000,
  },
  {
    name: 'Garganta Rocosa Cerrada de Gediz Vallis',
    lat: -4.782,
    lng: 137.352,
    radiusMeters: 1200,
    costWeight: 6500,
  },
];

// Metros por grado de latitud sobre el radio medio de Marte
const M_PER_DEG_LAT = (2 * Math.PI * MARS_RADIUS_KM * 1000) / 360;

/**
 * Rugosidad topográfica determinista (microdunas, afloramientos y pavimento rocoso).
 * Devuelve un valor normalizado 0-1 que hace que el sendero serpenteé de forma
 * orgánica en lugar de buscar siempre la línea recta.
 */
function terrainRoughnessAt(lat, lng) {
  const value =
    Math.sin(lat * 760 + lng * 420 + 1.7) * 0.45 +
    Math.sin(lat * 380 - lng * 900 + 4.2) * 0.32 +
    Math.sin(lat * 1180 + lng * 610 + 2.3) * 0.23;

  return (value + 1) / 2;
}

/**
 * Perfil de meandro base: una curva suave y determinista que actúa como
 * "corredor natural" preferido. La búsqueda A* puede separarse de él cuando
 * encuentra una pendiente o un peligro geológico que merece la pena evitar.
 */
function createMeanderProfile(startCoord, endCoord, directDist) {
  const seed =
    Math.abs(
      Math.sin(
        startCoord.lat * 12.9898 +
          startCoord.lng * 78.233 +
          endCoord.lat * 37.719 +
          endCoord.lng * 11.135
      )
    ) % 1;

  const amplitude = Math.min(450, Math.max(45, directDist * 0.1));
  const cycles = 0.85 + seed * 0.55;
  const phaseA = seed * Math.PI * 2;
  const phaseB = (seed * 5.7 + 1.3) % (Math.PI * 2);

  return (t) => {
    const clamped = Math.min(1, Math.max(0, t));
    const envelope = Math.pow(Math.sin(Math.PI * clamped), 0.7);

    return (
      envelope *
      amplitude *
      (0.82 * Math.sin(Math.PI * 2 * cycles * clamped + phaseA) +
        0.18 * Math.sin(Math.PI * 2 * cycles * 1.7 * clamped + phaseB))
    );
  };
}

/**
 * Montículo binario mínimo para la cola de prioridad del algoritmo A*.
 */
class MinHeap {
  constructor() {
    this.items = [];
  }

  get size() {
    return this.items.length;
  }

  push(item) {
    this.items.push(item);
    let index = this.items.length - 1;

    while (index > 0) {
      const parent = (index - 1) >> 1;
      if (this.items[parent].f <= this.items[index].f) break;
      [this.items[parent], this.items[index]] = [
        this.items[index],
        this.items[parent],
      ];
      index = parent;
    }
  }

  pop() {
    const top = this.items[0];
    const last = this.items.pop();

    if (this.items.length > 0) {
      this.items[0] = last;
      let index = 0;

      while (true) {
        const left = index * 2 + 1;
        const right = left + 1;
        let smallest = index;

        if (left < this.items.length && this.items[left].f < this.items[smallest].f) {
          smallest = left;
        }
        if (right < this.items.length && this.items[right].f < this.items[smallest].f) {
          smallest = right;
        }
        if (smallest === index) break;

        [this.items[smallest], this.items[index]] = [
          this.items[index],
          this.items[smallest],
        ];
        index = smallest;
      }
    }

    return top;
  }
}

/**
 * Suavizado binomial de una polilínea manteniendo fijos los extremos.
 */
function smoothPath(points, passes = 3) {
  let current = points.map((p) => ({ lat: p.lat, lng: p.lng }));

  for (let pass = 0; pass < passes; pass++) {
    const next = current.map((p) => ({ lat: p.lat, lng: p.lng }));

    for (let i = 1; i < current.length - 1; i++) {
      next[i].lat =
        current[i - 1].lat * 0.25 + current[i].lat * 0.5 + current[i + 1].lat * 0.25;
      next[i].lng =
        current[i - 1].lng * 0.25 + current[i].lng * 0.5 + current[i + 1].lng * 0.25;
    }

    current = next;
  }

  return current;
}

/**
 * Simplificación Ramer-Douglas-Peucker sobre coordenadas locales en metros.
 */
function simplifyPathRDP(points, epsilon) {
  if (points.length < 3) return points;

  const first = points[0];
  const last = points[points.length - 1];
  const latScale = M_PER_DEG_LAT;
  const lngScale = M_PER_DEG_LAT * Math.cos((first.lat * Math.PI) / 180);
  const bx = (last.lng - first.lng) * lngScale;
  const by = (last.lat - first.lat) * latScale;
  const baseLength = Math.hypot(bx, by);

  let maxDistance = 0;
  let farthestIndex = -1;

  for (let i = 1; i < points.length - 1; i++) {
    const px = (points[i].lng - first.lng) * lngScale;
    const py = (points[i].lat - first.lat) * latScale;
    const distance =
      baseLength === 0
        ? Math.hypot(px, py)
        : Math.abs(px * by - py * bx) / baseLength;

    if (distance > maxDistance) {
      maxDistance = distance;
      farthestIndex = i;
    }
  }

  if (maxDistance > epsilon && farthestIndex > 0) {
    const left = simplifyPathRDP(points.slice(0, farthestIndex + 1), epsilon);
    const right = simplifyPathRDP(points.slice(farthestIndex), epsilon);
    return left.slice(0, -1).concat(right);
  }

  return [first, last];
}

/**
 * Calcula un corredor de mínimo costo sobre el DEM local mediante A*.
 * El costo de cada celda combina distancia, pendiente, proximidad a zonas
 * peligrosas, rugosidad topográfica y alejamiento del meandro natural.
 * Devuelve puntos de control ya suavizados para el spline Catmull-Rom.
 */
function buildTerrainAwareControlPoints(
  startCoord,
  endCoord,
  directDist,
  startElev,
  endElev,
  avoidDunes
) {
  if (directDist < 80) return null;

  const midLat = (startCoord.lat + endCoord.lat) / 2;
  const mPerDegLng = M_PER_DEG_LAT * Math.cos((midLat * Math.PI) / 180);

  if (!Number.isFinite(mPerDegLng) || mPerDegLng <= 0) return null;

  const padding = Math.max(220, directDist * 0.28);
  const minLat = Math.min(startCoord.lat, endCoord.lat) - padding / M_PER_DEG_LAT;
  const maxLat = Math.max(startCoord.lat, endCoord.lat) + padding / M_PER_DEG_LAT;
  const minLng = Math.min(startCoord.lng, endCoord.lng) - padding / mPerDegLng;
  const maxLng = Math.max(startCoord.lng, endCoord.lng) + padding / mPerDegLng;

  const spanX = Math.max(1, (maxLng - minLng) * mPerDegLng);
  const spanY = Math.max(1, (maxLat - minLat) * M_PER_DEG_LAT);
  const cellSize = Math.max(spanX, spanY) / 88;
  const cols = Math.max(2, Math.ceil(spanX / cellSize) + 1);
  const rows = Math.max(2, Math.ceil(spanY / cellSize) + 1);
  const dx = spanX / (cols - 1);
  const dy = spanY / (rows - 1);
  const nodeCount = rows * cols;

  const coordAt = (r, c) => ({
    lat: minLat + (r / (rows - 1)) * (maxLat - minLat),
    lng: minLng + (c / (cols - 1)) * (maxLng - minLng),
  });

  const elevations = new Float64Array(nodeCount);
  const hazardCosts = new Float64Array(nodeCount);
  const roughness = new Float64Array(nodeCount);

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const index = r * cols + c;
      const { lat, lng } = coordAt(r, c);
      elevations[index] = getElevationAt(lat, lng);
      roughness[index] = terrainRoughnessAt(lat, lng);

      let hazard = 0;
      if (avoidDunes) {
        for (const zone of CRITICAL_HAZARDS) {
          const distance = marsDistanceMeters(lat, lng, zone.lat, zone.lng);
          if (distance < zone.radiusMeters) {
            const factor = 1 - distance / zone.radiusMeters;
            hazard += factor * factor * (zone.costWeight / 1000);
          }
        }
      }
      hazardCosts[index] = hazard;
    }
  }

  const toCell = (coord) => ({
    r: Math.round(((coord.lat - minLat) / (maxLat - minLat)) * (rows - 1)),
    c: Math.round(((coord.lng - minLng) / (maxLng - minLng)) * (cols - 1)),
  });

  const startCell = toCell(startCoord);
  const endCell = toCell(endCoord);
  const startIndex = startCell.r * cols + startCell.c;
  const endIndex = endCell.r * cols + endCell.c;

  const gScore = new Float64Array(nodeCount).fill(Infinity);
  const cameFrom = new Int32Array(nodeCount).fill(-1);
  const closed = new Uint8Array(nodeCount);
  gScore[startIndex] = 0;

  const heuristic = (r, c) =>
    Math.hypot((endCell.c - c) * dx, (endCell.r - r) * dy);

  const open = new MinHeap();
  open.push({ index: startIndex, f: heuristic(startCell.r, startCell.c) });

  const neighbors = [
    [-1, 0],
    [1, 0],
    [0, -1],
    [0, 1],
    [-1, -1],
    [-1, 1],
    [1, -1],
    [1, 1],
  ];

  const ux = ((endCoord.lng - startCoord.lng) * mPerDegLng) / directDist;
  const uy = ((endCoord.lat - startCoord.lat) * M_PER_DEG_LAT) / directDist;
  const meander = createMeanderProfile(startCoord, endCoord, directDist);
  const meanderAmplitude = Math.min(450, Math.max(45, directDist * 0.1));

  while (open.size > 0) {
    const current = open.pop();
    if (closed[current.index]) continue;
    closed[current.index] = 1;
    if (current.index === endIndex) break;

    const r = Math.floor(current.index / cols);
    const c = current.index % cols;

    for (const [dr, dc] of neighbors) {
      const nr = r + dr;
      const nc = c + dc;
      if (nr < 0 || nr >= rows || nc < 0 || nc >= cols) continue;

      const nextIndex = nr * cols + nc;
      if (closed[nextIndex]) continue;

      const stepDistance = Math.hypot(dr * dy, dc * dx);
      const elevationDelta = Math.abs(elevations[nextIndex] - elevations[current.index]);
      const slopeDegrees =
        (Math.atan2(elevationDelta, stepDistance) * 180) / Math.PI;

      let slopeMultiplier = 1;
      if (slopeDegrees > 6) {
        slopeMultiplier += Math.pow((slopeDegrees - 6) / 10, 2) * 4;
      }
      if (slopeDegrees > 15) {
        slopeMultiplier += Math.pow((slopeDegrees - 15) / 10, 2) * 14;
      }
      if (slopeDegrees > 25) {
        slopeMultiplier += 6;
      }

      const hazardMultiplier =
        1 + (hazardCosts[current.index] + hazardCosts[nextIndex]) / 2;
      const roughnessMultiplier =
        1 + ((roughness[current.index] + roughness[nextIndex]) / 2) * 0.9;

      const point = coordAt(nr, nc);
      const vx = (point.lng - startCoord.lng) * mPerDegLng;
      const vy = (point.lat - startCoord.lat) * M_PER_DEG_LAT;
      const along = (vx * ux + vy * uy) / directDist;
      const cross = vx * -uy + vy * ux;
      const t = Math.min(1, Math.max(0, along));
      const crossError = (cross - meander(t)) / (meanderAmplitude * 0.75);
      const corridorMultiplier = 1 + crossError * crossError * 2.4;

      const stepCost =
        stepDistance *
        slopeMultiplier *
        hazardMultiplier *
        roughnessMultiplier *
        corridorMultiplier;
      const tentativeScore = gScore[current.index] + stepCost;

      if (tentativeScore < gScore[nextIndex]) {
        gScore[nextIndex] = tentativeScore;
        cameFrom[nextIndex] = current.index;
        open.push({
          index: nextIndex,
          f: tentativeScore + heuristic(nr, nc),
        });
      }
    }
  }

  if (cameFrom[endIndex] === -1 && endIndex !== startIndex) return null;

  const rawPath = [];
  let cursor = endIndex;

  while (cursor !== -1) {
    const r = Math.floor(cursor / cols);
    const c = cursor % cols;
    rawPath.push(coordAt(r, c));
    if (cursor === startIndex) break;
    cursor = cameFrom[cursor];
  }

  rawPath.reverse();
  if (rawPath.length < 3) return null;

  rawPath[0] = { lat: startCoord.lat, lng: startCoord.lng };
  rawPath[rawPath.length - 1] = { lat: endCoord.lat, lng: endCoord.lng };

  const smoothed = smoothPath(rawPath, 4);
  const simplified = simplifyPathRDP(smoothed, Math.max(5, cellSize * 0.45));
  const controlPoints = smoothPath(simplified, 2);

  controlPoints[0] = { lat: startCoord.lat, lng: startCoord.lng };
  controlPoints[controlPoints.length - 1] = {
    lat: endCoord.lat,
    lng: endCoord.lng,
  };

  if (controlPoints.length < 3) return null;

  return controlPoints.map((point, index) => ({
    lat: point.lat,
    lng: point.lng,
    elevation:
      index === 0
        ? startElev
        : index === controlPoints.length - 1
        ? endElev
        : getElevationAt(point.lat, point.lng),
  }));
}

/**
 * Generador de respaldo: explora desplazamientos laterales discretos buscando
 * el corredor de menor costo. Se usa para rutas muy cortas o si la malla A*
 * no encuentra un camino válido.
 */
function buildFallbackControlPoints(
  startCoord,
  endCoord,
  startElev,
  endElev,
  totalDirectDist,
  dLat,
  dLng,
  dirMag,
  pLat,
  pLng,
  avoidDunes
) {
  // Determinar número de segmentos de control para la generación del sendero
  const numCtrlSegments = Math.min(
    18,
    Math.max(8, Math.round(totalDirectDist / 380))
  );

  // Rango máximo de exploración lateral (hasta ~20% de la distancia o 900m)
  const maxLateralDegrees = Math.min(0.015, dirMag * 0.24);

  // Generar puntos de control buscando el corredor de menor costo energético y menor pendiente
  const controlPoints = [
    {
      lat: startCoord.lat,
      lng: startCoord.lng,
      elevation: startElev,
    },
  ];

  let prevOffset = 0;
  let prevElev = startElev;
  let prevLat = startCoord.lat;
  let prevLng = startCoord.lng;

  // Ratios de prueba lateral: izquierda, centro y derecha
  const candidateRatios = [
    -1.0, -0.75, -0.5, -0.3, -0.15, 0, 0.15, 0.3, 0.5, 0.75, 1.0,
  ];

  for (let k = 1; k < numCtrlSegments; k++) {
    const t = k / numCtrlSegments;
    const baseLat = startCoord.lat + dLat * t;
    const baseLng = startCoord.lng + dLng * t;

    // Envolvente sinusoidal para anclar los extremos en 0
    const envelope = Math.sin(t * Math.PI);

    let bestPoint = null;
    let minCost = Infinity;

    for (const ratio of candidateRatios) {
      const lateralShift = ratio * maxLateralDegrees * envelope;
      const candLat = baseLat + pLat * lateralShift;
      const candLng = baseLng + pLng * lateralShift;
      const candElev = getElevationAt(candLat, candLng);

      // Distancia y pendiente desde el punto de control previo
      const distPrev = marsDistanceMeters(prevLat, prevLng, candLat, candLng);
      const deltaElev = Math.abs(candElev - prevElev);
      const slopeDeg =
        distPrev > 0
          ? (Math.atan2(deltaElev, distPrev) * 180) / Math.PI
          : 0;

      // 1. Costo por pendiente (penalización no-lineal: queremos pendientes < 12°)
      let slopeCost = slopeDeg * 3;
      if (slopeDeg > 12) {
        slopeCost += Math.pow(slopeDeg - 12, 1.8) * 45;
      }
      if (slopeDeg > 20) {
        slopeCost += 2500;
      }

      // 2. Costo por zonas de peligro geomorfológico (Dunas de arena / Escarpes)
      let hazardCost = 0;
      if (avoidDunes) {
        for (const hazard of CRITICAL_HAZARDS) {
          const dHazard = marsDistanceMeters(
            candLat,
            candLng,
            hazard.lat,
            hazard.lng
          );
          if (dHazard < hazard.radiusMeters) {
            const factor = 1 - dHazard / hazard.radiusMeters;
            hazardCost += factor * factor * hazard.costWeight;
          }
        }
      }

      // 3. Regularización de meandros naturales del terreno (Wandering de sendero realista)
      // Genera sinuosidades orgánicas continuas en función de las coordenadas geográficas
      const organicWave =
        Math.sin(candLat * 1800 + candLng * 1400) * 8 +
        Math.cos(candLat * 950 - candLng * 2200) * 6;

      // 4. Inercia y suavidad de curvatura (evitar zig-zags bruscos)
      const momentumCost = Math.pow(ratio - prevOffset, 2) * 22;

      // 5. Penalización por alejarse excesivamente de la línea directa
      const directnessCost = Math.pow(ratio, 2) * 15;

      const totalCost =
        slopeCost + hazardCost + organicWave + momentumCost + directnessCost;

      if (totalCost < minCost) {
        minCost = totalCost;
        bestPoint = {
          lat: candLat,
          lng: candLng,
          elevation: candElev,
          ratio,
        };
      }
    }

    if (bestPoint) {
      controlPoints.push({
        lat: bestPoint.lat,
        lng: bestPoint.lng,
        elevation: bestPoint.elevation,
      });
      prevOffset = bestPoint.ratio;
      prevElev = bestPoint.elevation;
      prevLat = bestPoint.lat;
      prevLng = bestPoint.lng;
    }
  }

  // Agregar punto final garantizado
  controlPoints.push({
    lat: endCoord.lat,
    lng: endCoord.lng,
    elevation: endElev,
  });

  return controlPoints;
}

/**
 * Calcula la ruta óptima y realista de superficie entre el Punto A y el Punto B en Marte.
 * 
 * En lugar de trazar una línea recta teórica, genera un sendero sinuoso realista que:
 * 1. Bordea obstáculos geológicos (campos de dunas activas y acantilados pronunciados).
 * 2. Busca collados, pasos naturales y curvas de nivel con menor pendiente.
 * 3. Incorpora meandros orgánicos continuos adaptados al regolito firme.
 * 4. Interpola mediante Spline Catmull-Rom para garantizar curvas fluidas y continuas.
 */
export function calculateMarsRoute(startCoord, endCoord, options = {}) {
  const {
    density = 60, // Número final de muestras suaves a lo largo del sendero
    avoidDunes = true,
  } = options;

  const totalDirectDist = marsDistanceMeters(
    startCoord.lat,
    startCoord.lng,
    endCoord.lat,
    endCoord.lng
  );

  const startElev = getElevationAt(startCoord.lat, startCoord.lng);
  const endElev = getElevationAt(endCoord.lat, endCoord.lng);

  // Si los puntos están a menos de 25 metros
  if (totalDirectDist < 25) {
    const singleWaypoint = {
      lat: startCoord.lat,
      lng: startCoord.lng,
      elevation: startElev,
      distanceMeters: 0,
      distanceKm: 0,
      slopeDegrees: 0,
      slopePercent: 0,
      difficulty: getSlopeDifficulty(0),
      terrainType: getTerrainType(startCoord.lat, startCoord.lng, startElev, 0),
      radiationRate: 26.5,
      cumulativeDoseUsv: 0,
      timeMinutes: 0,
      timeHours: 0,
    };

    return {
      waypoints: [singleWaypoint],
      totalDistanceMeters: 0,
      totalDistanceKm: 0,
      totalAscentMeters: 0,
      totalDescentMeters: 0,
      maxSlopeDegrees: 0,
      estimatedTimeMinutes: 0,
      estimatedTimeHours: 0,
      totalRadiationDoseUsv: 0,
      safetyStatus: 'Seguro',
    };
  }

  // Vector director y vector normal perpendicular
  const dLat = endCoord.lat - startCoord.lat;
  const dLng = endCoord.lng - startCoord.lng;
  const dirMag = Math.hypot(dLat, dLng);

  const uLat = dLat / dirMag;
  const uLng = dLng / dirMag;

  // Vector perpendicular normalizado (-uLng, uLat)
  const pLat = -uLng;
  const pLng = uLat;

  // Puntos de control del sendero: A* sobre el DEM local con respaldo lateral.
  const controlPoints =
    buildTerrainAwareControlPoints(
      startCoord,
      endCoord,
      totalDirectDist,
      startElev,
      endElev,
      avoidDunes
    ) ||
    buildFallbackControlPoints(
      startCoord,
      endCoord,
      startElev,
      endElev,
      totalDirectDist,
      dLat,
      dLng,
      dirMag,
      pLat,
      pLng,
      avoidDunes
    );

  // Generar la trayectoria suave interpolada usando Splines Catmull-Rom
  const finalSteps = Math.max(density, (controlPoints.length - 1) * 4);
  const smoothPoints = [];

  for (let i = 0; i <= finalSteps; i++) {
    const globalT = i / finalSteps;
    const scaledU = globalT * (controlPoints.length - 1);
    const segIdx = Math.min(
      Math.floor(scaledU),
      controlPoints.length - 2
    );
    const localT = scaledU - segIdx;

    const p0 = getControlPoint(controlPoints, segIdx - 1);
    const p1 = getControlPoint(controlPoints, segIdx);
    const p2 = getControlPoint(controlPoints, segIdx + 1);
    const p3 = getControlPoint(controlPoints, segIdx + 2);

    const interp = catmullRom(p0, p1, p2, p3, localT);

    // Los extremos deben ser idénticos a los puntos seleccionados por el usuario
    if (i === 0) {
      smoothPoints.push({
        lat: startCoord.lat,
        lng: startCoord.lng,
        elevation: startElev,
      });
    } else if (i === finalSteps) {
      smoothPoints.push({
        lat: endCoord.lat,
        lng: endCoord.lng,
        elevation: endElev,
      });
    } else {
      const elev = getElevationAt(interp.lat, interp.lng);
      smoothPoints.push({
        lat: interp.lat,
        lng: interp.lng,
        elevation: elev,
      });
    }
  }

  // Procesar métricas acumuladas del recorrido sinuoso
  const waypoints = [];
  let cumDistance = 0;
  let cumAscent = 0;
  let cumDescent = 0;
  let maxSlope = 0;
  let cumTimeMinutes = 0;
  let cumDoseUsv = 0;

  for (let i = 0; i < smoothPoints.length; i++) {
    const pt = smoothPoints[i];
    let segDist = 0;
    let segSlope = { degrees: 0, percent: 0 };

    if (i > 0) {
      const prev = smoothPoints[i - 1];
      segDist = marsDistanceMeters(prev.lat, prev.lng, pt.lat, pt.lng);
      cumDistance += segDist;

      const dElev = pt.elevation - prev.elevation;
      if (dElev > 0) cumAscent += dElev;
      else cumDescent += Math.abs(dElev);

      segSlope = calculateSlope(prev.elevation, pt.elevation, segDist);
      if (segSlope.degrees > maxSlope) {
        maxSlope = segSlope.degrees;
      }

      // Velocidad base 2.8 km/h modulada por la pendiente local
      const diff = getSlopeDifficulty(segSlope.degrees);
      const effectiveSpeedKmH =
        EVA_SAFETY.NOMINAL_SPEED_KMH * diff.speedMultiplier;
      const segTimeHours = segDist / 1000 / effectiveSpeedKmH;
      const segTimeMin = segTimeHours * 60;
      cumTimeMinutes += segTimeMin;

      // Dosis de radiación cósmica: fondo a -4500 m es ~27.2 µSv/h
      // Incrementa con menor presión atmosférica en cotas más altas
      const elevPenalty =
        Math.max(0, (pt.elevation - -4500) / 1000) * 1.4;
      const currentDoseRate =
        EVA_SAFETY.BACKGROUND_DOSE_USV_H + elevPenalty;
      const segDose = currentDoseRate * segTimeHours;
      cumDoseUsv += segDose;
    }

    const diff = getSlopeDifficulty(segSlope.degrees);
    const terrain = getTerrainType(
      pt.lat,
      pt.lng,
      pt.elevation,
      segSlope.degrees
    );

    waypoints.push({
      index: i,
      lat: Number(pt.lat.toFixed(5)),
      lng: Number(pt.lng.toFixed(5)),
      elevation: pt.elevation,
      distanceMeters: Math.round(cumDistance),
      distanceKm: Number((cumDistance / 1000).toFixed(2)),
      slopeDegrees: segSlope.degrees,
      slopePercent: segSlope.percent,
      difficulty: diff,
      terrainType: terrain,
      radiationRate: Number(
        (
          EVA_SAFETY.BACKGROUND_DOSE_USV_H +
          Math.max(0, (pt.elevation - -4500) / 1000) * 1.4
        ).toFixed(1)
      ),
      cumulativeDoseUsv: Number(cumDoseUsv.toFixed(1)),
      timeMinutes: Math.round(cumTimeMinutes),
      timeHours: Number((cumTimeMinutes / 60).toFixed(2)),
    });
  }

  // Evaluación general de la seguridad de la ruta resultante
  let safetyStatus = 'Seguro';
  if (maxSlope > EVA_SAFETY.MAX_SAFE_SLOPE_DEG) {
    safetyStatus = 'Crítico';
  } else if (
    maxSlope > EVA_SAFETY.SLOPE_MODERATE_DEG ||
    cumTimeMinutes > 360
  ) {
    safetyStatus = 'Precaución';
  } else if (maxSlope > EVA_SAFETY.SLOPE_SAFE_DEG) {
    safetyStatus = 'Moderado';
  }

  return {
    waypoints,
    totalDistanceMeters: Math.round(cumDistance),
    totalDistanceKm: Number((cumDistance / 1000).toFixed(2)),
    totalAscentMeters: Math.round(cumAscent),
    totalDescentMeters: Math.round(cumDescent),
    maxSlopeDegrees: Number(maxSlope.toFixed(1)),
    estimatedTimeMinutes: Math.round(cumTimeMinutes),
    estimatedTimeHours: Number((cumTimeMinutes / 60).toFixed(2)),
    totalRadiationDoseUsv: Number(cumDoseUsv.toFixed(1)),
    safetyStatus,
  };
}
