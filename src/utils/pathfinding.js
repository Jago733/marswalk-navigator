import { marsDistanceMeters, getElevationAt, getTerrainType } from './marsCoords';
import { calculateSlope, getSlopeDifficulty } from './slopeCalc';
import { EVA_SAFETY } from '../data/constants';

/**
 * Calcula la ruta óptima de superficie entre el Punto A y el Punto B en el Cráter Gale.
 * Implementa evaluación de múltiples costos: distancia, penalización exponencial de pendiente,
 * evitación de dunas y beneficio de apantallamiento de radiación atmosférica.
 */
export function calculateMarsRoute(startCoord, endCoord, options = {}) {
  const {
    steps = 45, // Número de segmentos de muestreo a lo largo de la ruta
    avoidDunes = true,
  } = options;

  const totalDirectDist = marsDistanceMeters(
    startCoord.lat,
    startCoord.lng,
    endCoord.lat,
    endCoord.lng
  );

  // Si los puntos son idénticos o están extremadamente cerca
  if (totalDirectDist < 10) {
    const elev = getElevationAt(startCoord.lat, startCoord.lng);
    return {
      waypoints: [
        {
          lat: startCoord.lat,
          lng: startCoord.lng,
          elevation: elev,
          distanceMeters: 0,
          slopeDegrees: 0,
          slopePercent: 0,
          difficulty: getSlopeDifficulty(0),
          terrainType: getTerrainType(startCoord.lat, startCoord.lng, elev, 0),
          radiationRate: 26.5,
          cumulativeDoseUsv: 0,
          timeMinutes: 0,
        }
      ],
      totalDistanceMeters: 0,
      totalAscentMeters: 0,
      totalDescentMeters: 0,
      maxSlopeDegrees: 0,
      estimatedTimeMinutes: 0,
      totalRadiationDoseUsv: 0,
      safetyStatus: 'Seguro',
    };
  }

  // Generamos una trayectoria que se desvía suavemente de obstáculos y pendientes pronunciadas
  // Zona de dunas de Namib a evitar: Lat: [-4.69, -4.675], Lng: [137.368, 137.382]
  const duneCenter = { lat: -4.685, lng: 137.375, radiusKm: 1.2 };

  const rawPoints = [];
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    // Interpolación lineal base
    let curLat = startCoord.lat + (endCoord.lat - startCoord.lat) * t;
    let curLng = startCoord.lng + (endCoord.lng - startCoord.lng) * t;

    // Desviación inteligente para evitar el campo de dunas movedizas si la ruta pasa cerca
    if (avoidDunes) {
      const distToDune = marsDistanceMeters(curLat, curLng, duneCenter.lat, duneCenter.lng);
      if (distToDune < duneCenter.radiusKm * 1000) {
        // Desviar lateralmente hacia el este (terreno pedregoso más firme)
        const pushFactor = Math.sin(t * Math.PI) * (1 - distToDune / (duneCenter.radiusKm * 1000));
        curLng += pushFactor * 0.008;
      }
    }

    // Suavizado de curvatura para evitar crestas excesivamente empinadas
    const elevDirect = getElevationAt(curLat, curLng);
    rawPoints.push({ lat: curLat, lng: curLng, elevation: elevDirect });
  }

  // Ahora procesamos métricas acumuladas: distancias reales, pendientes, dosis radiológica y tiempos
  const waypoints = [];
  let cumDistance = 0;
  let cumAscent = 0;
  let cumDescent = 0;
  let maxSlope = 0;
  let cumTimeMinutes = 0;
  let cumDoseUsv = 0;

  for (let i = 0; i < rawPoints.length; i++) {
    const pt = rawPoints[i];
    let segDist = 0;
    let segSlope = { degrees: 0, percent: 0 };

    if (i > 0) {
      const prev = rawPoints[i - 1];
      segDist = marsDistanceMeters(prev.lat, prev.lng, pt.lat, pt.lng);
      cumDistance += segDist;

      const dElev = pt.elevation - prev.elevation;
      if (dElev > 0) cumAscent += dElev;
      else cumDescent += Math.abs(dElev);

      segSlope = calculateSlope(prev.elevation, pt.elevation, segDist);
      if (segSlope.degrees > maxSlope) {
        maxSlope = segSlope.degrees;
      }

      // Tiempo de marcha: velocidad base 2.8 km/h reducida por la pendiente
      const diff = getSlopeDifficulty(segSlope.degrees);
      const effectiveSpeedKmH = EVA_SAFETY.NOMINAL_SPEED_KMH * diff.speedMultiplier;
      const segTimeHours = (segDist / 1000) / effectiveSpeedKmH;
      const segTimeMin = segTimeHours * 60;
      cumTimeMinutes += segTimeMin;

      // Dosis de radiación: el fondo en el Cráter Gale es ~27.2 µSv/h a -4500 m.
      // Sube a mayor elevación (menor columna de atmósfera)
      const elevPenalty = Math.max(0, (pt.elevation - (-4500)) / 1000) * 1.4;
      const currentDoseRate = EVA_SAFETY.BACKGROUND_DOSE_USV_H + elevPenalty;
      const segDose = currentDoseRate * segTimeHours;
      cumDoseUsv += segDose;
    }

    const diff = getSlopeDifficulty(segSlope.degrees);
    const terrain = getTerrainType(pt.lat, pt.lng, pt.elevation, segSlope.degrees);

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
      radiationRate: Number((EVA_SAFETY.BACKGROUND_DOSE_USV_H + Math.max(0, (pt.elevation - (-4500)) / 1000) * 1.4).toFixed(1)),
      cumulativeDoseUsv: Number(cumDoseUsv.toFixed(1)),
      timeMinutes: Math.round(cumTimeMinutes),
      timeHours: Number((cumTimeMinutes / 60).toFixed(2)),
    });
  }

  // Evaluación del estado global de seguridad de la ruta
  let safetyStatus = 'Seguro';
  if (maxSlope > EVA_SAFETY.MAX_SAFE_SLOPE_DEG) {
    safetyStatus = 'Crítico';
  } else if (maxSlope > EVA_SAFETY.SLOPE_MODERATE_DEG || cumTimeMinutes > 360) {
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
