import { EVA_SAFETY } from '../data/constants';

/**
 * Realiza un análisis exhaustivo de seguridad para la caminata espacial sobre Marte (Marswalk).
 */
export function analyzeRouteSafety(routeData) {
  if (!routeData || !routeData.waypoints || routeData.waypoints.length === 0) {
    return null;
  }

  const {
    totalDistanceKm,
    estimatedTimeHours,
    maxSlopeDegrees,
    totalRadiationDoseUsv,
    waypoints,
  } = routeData;

  const alerts = [];

  // 1. Análisis de tiempo y soporte vital (PLSS)
  const o2NominalLiters = 450; // Capacidad estándar PLSS tanque de O2
  const estO2Consumed = Math.round(
    estimatedTimeHours * EVA_SAFETY.O2_CONSUMPTION_FLAT_L_H +
    (routeData.totalAscentMeters / 100) * 8
  );
  const o2RemainingPercent = Math.max(0, Math.round(((o2NominalLiters - estO2Consumed) / o2NominalLiters) * 100));

  if (estimatedTimeHours > EVA_SAFETY.RECOMMENDED_MAX_EVA_HOURS) {
    alerts.push({
      type: 'danger',
      title: 'Límite EVA Excedido',
      message: `El tiempo estimado (${estimatedTimeHours} h) excede las ${EVA_SAFETY.RECOMMENDED_MAX_EVA_HOURS} horas recomendadas por la NASA. Margen de contingencia de oxígeno comprometido.`,
    });
  } else if (estimatedTimeHours > 4.5) {
    alerts.push({
      type: 'warning',
      title: 'EVA de Larga Duración',
      message: `Salida de ${estimatedTimeHours} h. Requiere paradas de hidratación y monitoreo continuo de presión PLSS cada 45 minutos.`,
    });
  } else {
    alerts.push({
      type: 'success',
      title: 'Margen de Tiempo Nominal',
      message: `La duración prevista (${estimatedTimeHours} h) se encuentra dentro de la ventana de alta seguridad para la tripulación.`,
    });
  }

  // 2. Análisis de pendientes y riesgos mecánicos
  const steepSegments = waypoints.filter((w) => w.slopeDegrees > 20).length;
  if (maxSlopeDegrees > EVA_SAFETY.MAX_SAFE_SLOPE_DEG) {
    alerts.push({
      type: 'critical',
      title: 'Pendiente Crítica Infranqueable',
      message: `Se detectaron inclinaciones de ${maxSlopeDegrees}° (límite máximo permitido: 25°). Riesgo extremo de caída e impacto contra roca afilada con despresurización de traje.`,
    });
  } else if (maxSlopeDegrees > 16) {
    alerts.push({
      type: 'warning',
      title: 'Tramos Escarpados',
      message: `Se registran ${steepSegments} tramos con pendiente superior a 16°. Aumenta la carga metabólica y el riesgo de abrasión en articulaciones del traje.`,
    });
  }

  // 3. Análisis de dosis de radiación
  if (totalRadiationDoseUsv > EVA_SAFETY.DAILY_EVA_LIMIT_USV) {
    alerts.push({
      type: 'danger',
      title: 'Dosis Radiológica Elevada',
      message: `Dosis acumulada prevista de ${totalRadiationDoseUsv} µSv supera el umbral diario sugerido para una sola salida (${EVA_SAFETY.DAILY_EVA_LIMIT_USV} µSv).`,
    });
  } else {
    alerts.push({
      type: 'info',
      title: 'Exposición a Radiación Segura',
      message: `Dosis prevista: ${totalRadiationDoseUsv} µSv (${((totalRadiationDoseUsv / EVA_SAFETY.DAILY_EVA_LIMIT_USV) * 100).toFixed(0)}% del límite diario). Blindaje de traje y columna atmosférica efectivos.`,
    });
  }

  // 4. Recursos consumidos estimados
  const waterConsumedLiters = Number((estimatedTimeHours * 0.75).toFixed(1));
  const batteryConsumedWh = Math.round(estimatedTimeHours * 85);

  return {
    alerts,
    o2RemainingPercent,
    estO2ConsumedLiters: estO2Consumed,
    waterConsumedLiters,
    batteryConsumedWh,
    steepSegmentsCount: steepSegments,
    isSafeOverall: maxSlopeDegrees <= EVA_SAFETY.MAX_SAFE_SLOPE_DEG && estimatedTimeHours <= EVA_SAFETY.PLSS_OXYGEN_HOURS,
  };
}
