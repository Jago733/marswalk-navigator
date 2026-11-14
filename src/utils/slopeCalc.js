import { EVA_SAFETY, THEME_COLORS } from '../data/constants';

/**
 * Calcula la pendiente en grados y porcentaje dados dos puntos y su distancia horizontal.
 */
export function calculateSlope(elev1, elev2, horizontalDistMeters) {
  if (horizontalDistMeters <= 0) return { degrees: 0, percent: 0 };
  const dElev = Math.abs(elev2 - elev1);
  const radians = Math.atan2(dElev, horizontalDistMeters);
  const degrees = (radians * 180) / Math.PI;
  const percent = (dElev / horizontalDistMeters) * 100;

  return {
    degrees: Number(degrees.toFixed(1)),
    percent: Number(percent.toFixed(1)),
  };
}

/**
 * Clasifica la dificultad del terreno según el ángulo de inclinación para un astronauta.
 */
export function getSlopeDifficulty(degrees) {
  if (degrees <= EVA_SAFETY.SLOPE_SAFE_DEG) {
    return {
      level: 'Seguro',
      badge: 'Tránsito Óptimo',
      color: THEME_COLORS.appleGreen,
      bgClass: 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400',
      description: 'Inclinación suave. Marcha regular sin esfuerzo excesivo.',
      speedMultiplier: 1.0,
    };
  }

  if (degrees <= EVA_SAFETY.SLOPE_MODERATE_DEG) {
    return {
      level: 'Moderado',
      badge: 'Tránsito Exigente',
      color: THEME_COLORS.appleOrange,
      bgClass: 'bg-amber-500/15 border-amber-500/30 text-amber-400',
      description: 'Inclinación moderada. Se aconseja reducir ritmo y cuidar apoyo de botas.',
      speedMultiplier: 0.75,
    };
  }

  if (degrees <= EVA_SAFETY.MAX_SAFE_SLOPE_DEG) {
    return {
      level: 'Peligroso',
      badge: 'Alerta de Inclinación',
      color: THEME_COLORS.marsRed,
      bgClass: 'bg-orange-500/20 border-orange-500/40 text-orange-400',
      description: 'Pendiente pronunciada. Requiere bastones estabilizadores o apoyo de anclaje.',
      speedMultiplier: 0.45,
    };
  }

  return {
    level: 'Crítico',
    badge: 'Prohibido Sin Cuerda',
    color: THEME_COLORS.appleRed,
    bgClass: 'bg-rose-500/25 border-rose-500/50 text-rose-400',
    description: 'Excede el límite máximo de 25° para marcha a pie con traje espacial presurizado.',
    speedMultiplier: 0.2,
  };
}
