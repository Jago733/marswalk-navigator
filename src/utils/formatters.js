/**
 * Formateadores para visualización clara y uniforme de unidades del sistema internacional en español.
 */

export function formatDistance(meters) {
  if (meters === undefined || meters === null) return '--';
  if (meters >= 1000) {
    return `${(meters / 1000).toLocaleString('es-ES', { minimumFractionDigits: 1, maximumFractionDigits: 2 })} km`;
  }
  return `${Math.round(meters)} m`;
}

export function formatElevation(meters) {
  if (meters === undefined || meters === null) return '--';
  const prefix = meters > 0 ? '+' : '';
  return `${prefix}${meters.toLocaleString('es-ES')} m`;
}

export function formatTime(minutes) {
  if (!minutes && minutes !== 0) return '--';
  const hrs = Math.floor(minutes / 60);
  const mins = Math.round(minutes % 60);
  if (hrs > 0) {
    return `${hrs} h ${mins} min`;
  }
  return `${mins} min`;
}

export function formatSlope(degrees) {
  if (degrees === undefined || degrees === null) return '--';
  return `${Number(degrees).toFixed(1)}°`;
}

export function formatRadiation(microSv) {
  if (microSv === undefined || microSv === null) return '--';
  if (microSv >= 1000) {
    return `${(microSv / 1000).toFixed(2)} mSv`;
  }
  return `${Number(microSv).toFixed(1)} µSv`;
}

export function formatTemperature(celsius) {
  if (celsius === undefined || celsius === null) return '--';
  return `${celsius > 0 ? '+' : ''}${Math.round(celsius)}°C`;
}

export function formatPressure(pascals) {
  if (!pascals && pascals !== 0) return '--';
  return `${Math.round(pascals)} Pa`;
}
