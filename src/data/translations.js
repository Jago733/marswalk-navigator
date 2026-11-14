// Textos completos en español para MarsWalk Navigator

export const TRANSLATIONS = {
  appTitle: 'MarsWalk Navigator',
  appSubtitle: 'Sistema Táctico de Navegación y Planificación de Rutas en Marte',
  missionBadge: 'NASA Space Apps Challenge 2026',
  regionName: 'Cráter Gale & Monte Sharp (Aeolis Mons)',

  tabs: {
    split: 'Vista Dual (2D + 3D)',
    map2d: 'Mapa Satelital 2D',
    viewer3d: 'Perfil de Elevación 3D',
    mission: 'Consola de Misión',
  },

  routePlanner: {
    title: 'Planificador de Marswalk',
    originLabel: 'Punto de Partida (A)',
    destinationLabel: 'Punto de Destino (B)',
    selectPlaceholder: 'Seleccione una ubicación...',
    calculateBtn: 'Calcular Ruta Óptima',
    calculating: 'Analizando pendientes y radiación...',
    resetBtn: 'Reiniciar',
    customPointNotice: 'Haga clic en el mapa para fijar un punto personalizado',
    statsTitle: 'Métricas del Recorrido',
    distance: 'Distancia Total',
    estimatedTime: 'Tiempo Estimado EVA',
    elevationChange: 'Desnivel Acumulado',
    maxSlope: 'Pendiente Máxima',
    radiationExposure: 'Dosis Radiológica Estimada',
    difficulty: 'Nivel de Dificultad',
  },

  cursorMetrics: {
    title: 'Telemetría del Cursor',
    latitude: 'Latitud',
    longitude: 'Longitud',
    elevation: 'Elevación MOLA',
    slope: 'Inclinación Local',
    terrainType: 'Tipo de Terreno',
    radiationShielding: 'Blindaje Atmosférico',
    hoverTip: 'Pase el cursor sobre el mapa o el perfil 3D para examinar los datos de superficie en tiempo real.',
  },

  weather: {
    title: 'Estación Meteorológica REMS',
    sol: 'Sol Marciano',
    airTemp: 'Temp. Aire',
    groundTemp: 'Temp. Suelo',
    pressure: 'Presión Atmosférica',
    wind: 'Viento en Superficie',
    uvIndex: 'Índice UV',
    dustOpacity: 'Opacidad del Polvo (Tau)',
    status: 'Condición Ambiental',
  },

  radiation: {
    title: 'Monitoreo de Radiación RAD',
    currentRate: 'Tasa Actual de Dosis',
    dailyAccumulated: 'Dosis Diaria Estimada',
    evaAccumulated: 'Dosis Prevista en Caminata',
    solarStatus: 'Estado de Partículas Solares',
    careerBudget: 'Margen de Carrera',
  },

  safetyAlerts: {
    title: 'Análisis de Seguridad y Contingencia',
    safe: 'Ruta Segura — Pendientes y parámetros dentro de los márgenes nominales del traje PLSS.',
    moderateWarning: 'Precaución — Pendientes moderadas (12°-18°). Vigile el consumo de O2 y desgaste de botas.',
    steepWarning: 'Alerta de Inclinación — Se detectaron secciones con pendiente >20°. Descenso controlado requerido.',
    criticalSlope: 'Peligro Crítico — Pendientes >25° detectadas. Se requiere desvío asistido por cuerda o rover.',
    oxygenWarning: 'Tiempo de caminata excede las 6 horas recomendadas para una sola salida EVA.',
  },

  layers: {
    baseMaps: 'Mapas Base de la NASA',
    scientificOverlays: 'Capas Científicas',
  }
};
