// Capas de mapas de la NASA y USGS para el Cráter Gale y superficie marciana

export const MARS_LAYERS = [
  {
    id: 'mars-global-custom',
    name: 'Mapa Satelital de Superficie (Global)',
    description: 'Mapeo cilíndrico de alta fidelidad de la superficie marciana con casquetes polares, cañones y cráteres.',
    attribution: 'Misión NASA / MRO / Viking',
    isImageOverlay: true,
    imageUrl: '/mars-map.png',
    bounds: [[-85.05, -180], [85.05, 180]],
    maxZoom: 18,
    minZoom: 1,
    type: 'optical-global',
  },
  {
    id: 'viking-color',
    name: 'Viking MDIM2.1 Color',
    description: 'Mosaico en color natural calibrado de las misiones Viking Orbiter de la NASA.',
    attribution: 'NASA/JPL/USGS',
    // NASA Mars Trek WMTS tile URL
    url: 'https://trek.nasa.gov/tiles/Mars/EQ/Mars_Viking_MDIM21_ClrMosaic_global_232m/1.0.0/default/default028mm/{z}/{y}/{x}.jpg',
    maxZoom: 14,
    minZoom: 4,
    type: 'optical',
  },
  {
    id: 'mola-color',
    name: 'MOLA Topografía Shaded',
    description: 'Relieve coloreado por elevación del altímetro láser MOLA de Mars Global Surveyor.',
    attribution: 'NASA/GSFC MOLA Science Team',
    url: 'https://trek.nasa.gov/tiles/Mars/EQ/Mars_MGS_MOLA_ClrShade_merge_global_463m/1.0.0/default/default028mm/{z}/{y}/{x}.jpg',
    maxZoom: 14,
    minZoom: 4,
    type: 'topographic',
  },
  {
    id: 'themis-ir-day',
    name: 'THEMIS Infrarrojo Diurno',
    description: 'Imagen infrarroja diurna de Mars Odyssey que resalta la inercia térmica y tipo de roca.',
    attribution: 'NASA/JPL/Arizona State Univ.',
    url: 'https://trek.nasa.gov/tiles/Mars/EQ/Mars_MO_THEMIS-IR-Day_mosaic_global_100m_v2/1.0.0/default/default028mm/{z}/{y}/{x}.jpg',
    maxZoom: 15,
    minZoom: 4,
    type: 'thermal',
  },
  {
    id: 'mola-hillshade',
    name: 'MOLA Sombreado de Colina',
    description: 'Mapa de relieve sombreado en escala de grises con pendientes nítidas y crestas.',
    attribution: 'NASA/GSFC',
    url: 'https://trek.nasa.gov/tiles/Mars/EQ/Mars_MGS_MOLA_DEM_mosaic_global_463m/1.0.0/default/default028mm/{z}/{y}/{x}.jpg',
    maxZoom: 14,
    minZoom: 4,
    type: 'topographic',
  },
  {
    id: 'ctx-gale',
    name: 'CTX / HiRISE Gale Alta Resolución',
    description: 'Mosaico de alta resolución de la cámara de contexto (CTX) del Cráter Gale.',
    attribution: 'NASA/JPL-Caltech/MSSS',
    url: 'https://trek.nasa.gov/tiles/Mars/EQ/Mars_MRO_CTX_Gale_Crater_Mosaic_6m/1.0.0/default/default028mm/{z}/{y}/{x}.jpg',
    maxZoom: 17,
    minZoom: 8,
    type: 'high-res',
  }
];

// Capas de superposición de datos científicos (Overlays)
export const SCIENTIFIC_OVERLAYS = [
  {
    id: 'curiosity-path',
    name: 'Ruta Histórica Curiosity (NASA MSL)',
    description: 'Trayectoria real recorrida por el rover Curiosity desde el Sol 0 hasta el presente.',
    color: '#FF9F0A',
    enabledDefault: true,
  },
  {
    id: 'pois',
    name: 'Puntos de Interés y Campamentos',
    description: 'Afloramientos científicos, unidades geológicas y sitio de hábitat humano.',
    color: '#0071E3',
    enabledDefault: true,
  },
  {
    id: 'minerals',
    name: 'Zonas Espectrales de Minerales (CRISM)',
    description: 'Depósitos de filosilicatos (arcillas), hematita y sulfatos polihidratados.',
    color: '#30D158',
    enabledDefault: true,
  },
  {
    id: 'hazard-zones',
    name: 'Áreas de Riesgo y Terreno Escarpado',
    description: 'Campos de dunas activas y pendientes >20° no recomendadas para caminata.',
    color: '#FF453A',
    enabledDefault: true,
  }
];
