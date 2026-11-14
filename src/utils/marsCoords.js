import { MARS_RADIUS_KM } from '../data/constants';

/**
 * Calcula la distancia ortodrómica en metros entre dos coordenadas sobre la superficie de Marte.
 * Usa el radio esférico medio de Marte (3389.5 km).
 */
export function marsDistanceMeters(lat1, lon1, lat2, lon2) {
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const rLat1 = (lat1 * Math.PI) / 180;
  const rLat2 = (lat2 * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(rLat1) * Math.cos(rLat2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return MARS_RADIUS_KM * 1000 * c;
}

/**
 * Calcula el azimut / rumbo en grados desde el punto 1 hacia el punto 2.
 */
export function marsBearing(lat1, lon1, lat2, lon2) {
  const rLat1 = (lat1 * Math.PI) / 180;
  const rLat2 = (lat2 * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;

  const y = Math.sin(dLon) * Math.cos(rLat2);
  const x =
    Math.cos(rLat1) * Math.sin(rLat2) -
    Math.sin(rLat1) * Math.cos(rLat2) * Math.cos(dLon);

  let brng = (Math.atan2(y, x) * 180) / Math.PI;
  return (brng + 360) % 360;
}

/**
 * Modelo digital de elevación (DEM) continuo para el Cráter Gale y faldas del Monte Sharp.
 * Basado en las mediciones altimétricas de NASA MOLA / HRSC.
 * @param {number} lat - Latitud en grados (-4.85 a -4.55)
 * @param {number} lng - Longitud en grados (137.30 a 137.50)
 * @returns {number} Elevación en metros con respecto al Areoide marciano (0-datum)
 */
export function getElevationAt(lat, lng) {
  // Centro aproximado de la cumbre del Monte Sharp (Aeolis Mons) al sur
  const peakLat = -5.08;
  const peakLng = 137.85;

  // Distancia normalizada hacia el pico del Monte Sharp
  const distToPeak = Math.hypot(lat - peakLat, lng - peakLng);

  // Gradiente base regional: sube desde la base del cráter (-4500 m) hacia el monte
  let elev = -4550 + (1.0 - Math.min(distToPeak / 0.55, 1.0)) * 2200;

  // Anomalía topográfica: Depresión de Yellowknife Bay (-4.59, 137.45)
  const dYellowknife = Math.hypot(lat - (-4.591), lng - 137.4485);
  if (dYellowknife < 0.02) {
    elev -= (1.0 - dYellowknife / 0.02) * 25;
  }

  // Anomalía topográfica: Cresta Vera Rubin Ridge (-4.73, 137.36)
  const dVeraRubin = Math.hypot(lat - (-4.73), (lng - 137.36) * 1.5);
  if (dVeraRubin < 0.035) {
    elev += (1.0 - dVeraRubin / 0.035) * 85;
  }

  // Anomalía topográfica: Pedimento de Greenheugh (-4.745, 137.34)
  const dGreenheugh = Math.hypot(lat - (-4.745), lng - 137.34);
  if (dGreenheugh < 0.03) {
    elev += (1.0 - dGreenheugh / 0.03) * 110;
  }

  // Anomalía topográfica: Canal de Gediz Vallis (-4.78, 137.35)
  const dGediz = Math.hypot(lat - (-4.78), lng - 137.35);
  if (dGediz < 0.04) {
    elev += (1.0 - dGediz / 0.04) * 450;
  }

  // Rugosidad microtopográfica suave (ondulación de dunas y afloramientos)
  const microWave = Math.sin(lat * 800) * Math.cos(lng * 800) * 3.5;

  return Math.round(elev + microWave);
}

/**
 * Determina el tipo de terreno geológico según ubicación y elevación.
 */
export function getTerrainType(lat, lng, elevation, slope) {
  if (slope > 20) return 'Escarpe Rocoso Inclinado (Riesgo de Deslizamiento)';
  if (lat < -4.75 && elevation > -4000) return 'Formación Boxwork / Afloramiento Escalonado';
  if (lat < -4.71 && lat > -4.74 && lng < 137.38) return 'Cresta de Hematita Cristalina';
  if (lat < -4.67 && lat > -4.70 && lng < 137.385) return 'Campo de Dunas Activas de Arena Basáltica';
  if (elevation < -4500) return 'Llanura Aluvial y Lecho Lacustre Arcilloso';
  return 'Regolito Consolidado con Pavimento Pedregoso';
}

/**
 * Formatea coordenadas en grados decimales y hemisferio.
 */
export function formatCoords(lat, lng) {
  const latStr = `${Math.abs(lat).toFixed(4)}° ${lat >= 0 ? 'N' : 'S'}`;
  const lngStr = `${Math.abs(lng).toFixed(4)}° ${lng >= 0 ? 'E' : 'O'}`;
  return `${latStr}, ${lngStr}`;
}
