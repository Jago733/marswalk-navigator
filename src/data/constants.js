// Constantes físicas y operacionales para la exploración de Marte y el Cráter Gale

export const MARS_RADIUS_KM = 3389.5;
export const MARS_GRAVITY = 3.72; // m/s^2 (~38% de la gravedad terrestre)

// Límites geográficos de la zona de operaciones del Cráter Gale / Monte Sharp
export const GALE_BOUNDS = {
  minLat: -4.85,
  maxLat: -4.55,
  minLng: 137.30,
  maxLng: 137.50,
  centerLat: -4.68,
  centerLng: 137.38,
  zoomDefault: 12,
  minZoom: 10,
  maxZoom: 16,
};

// Parámetros fisiológicos y de seguridad del traje EVA de astronauta
export const EVA_SAFETY = {
  // Velocidad nominal de caminata en terreno plano marciano con traje espacial
  NOMINAL_SPEED_KMH: 2.8,
  // Máxima pendiente segura que un astronauta con traje presurizado puede subir
  MAX_SAFE_SLOPE_DEG: 25.0,
  // Umbrales de clasificación de pendiente
  SLOPE_SAFE_DEG: 10.0,
  SLOPE_MODERATE_DEG: 18.0,
  SLOPE_WARNING_DEG: 22.0,
  // Capacidad del sistema de soporte vital primario (PLSS)
  PLSS_OXYGEN_HOURS: 8.0,
  RECOMMENDED_MAX_EVA_HOURS: 6.0,
  CONTINGENCY_RESERVE_HOURS: 2.0,
  // Consumo medio de oxígeno por hora (litros/hora en condiciones de esfuerzo)
  O2_CONSUMPTION_FLAT_L_H: 50,
  O2_CONSUMPTION_UPHILL_L_H: 95,
  // Dosis de radiación de referencia
  BACKGROUND_DOSE_USV_H: 27.2,
  CAREER_LIMIT_MSV: 600,
  DAILY_EVA_LIMIT_USV: 250,
};

// Colores de la paleta Apple + Mars
export const THEME_COLORS = {
  appleBlue: '#0071E3',
  appleBlueHover: '#0076DF',
  appleDark: '#1D1D1F',
  appleSurface: '#161617',
  appleCard: '#2C2C2E',
  appleText: '#F5F5F7',
  appleSecondary: '#86868B',
  appleBorder: 'rgba(255, 255, 255, 0.12)',
  appleGreen: '#30D158',
  appleOrange: '#FF9F0A',
  appleRed: '#FF453A',
  marsRust: '#C1440E',
  marsRed: '#E26D5C',
};
