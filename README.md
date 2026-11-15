# GeoTrend | MarsWalk Navigator 🚀🔴
### Sistema Táctico de Navegación y Planificación de Rutas en Marte
**GeoTrend Team • NASA Space Apps Challenge**

**GeoTrend MarsWalk Navigator** es una plataforma web interactiva diseñada para la primera tripulación humana que explorará la superficie de Marte (Marswalk). Integra conjuntos de datos de múltiples misiones científicas de la NASA (MGS MOLA, Viking, CTX, THEMIS, Curiosity REMS, RAD, CRISM) sobre el Cráter Gale y el Monte Sharp (Aeolis Mons).

---

## 🌟 Características Principales

1. **Navegación GPS Superficial de Punto A a Punto B:**
   - Selección de puntos de partida y llegada mediante menú táctico o haciendo clic directamente sobre el mapa satelital.
   - Algoritmo de enrutamiento multicriterio: minimiza la distancia, penaliza pendientes empinadas (>12°), esquiva laderas intransitables (>25°) y campos de dunas activas (Dunas de Namib), e incorpora el apantallamiento atmosférico de radiación en cotas bajas.

2. **Visualización Cartográfica 2D:**
   - Mapas base en mosaico WMTS de **NASA Mars Trek**: Viking MDIM2.1 en color natural, Topografía sombreada MOLA, Infrarrojo diurno THEMIS y mosaicos de alta resolución CTX.
   - Superposición de capas científicas: Ruta histórica del rover Curiosity (NASA MSL), unidades minerales de filosilicatos/hematita/sulfatos (CRISM) y zonas de peligro de tracción.
   - Modos de clic configurables para fijar Punto A o Punto B al tocar el terreno.

3. **Visualizador Tridimensional del Recorrido (3D Route Corridor):**
   - **Enfoque de alto rendimiento:** En lugar de renderizar un pesado globo 3D completo de Marte, modela en Three.js el **corredor y perfil de elevación de la ruta**:
     - Tubería y nodos 3D coloreados según la pendiente local (Verde <12°, Ámbar 12°-20°, Rojo >20°).
     - Cortina vertical tridimensional del terreno (sección geológica de estratos).
     - Marcadores de partida, destino y cursor de inspección interactivo en tiempo real.
     - Controles de órbita (rotación 360°, inclinación y zoom libre).

4. **Gráfico de Perfil Longitudinal Altimétrico:**
   - Gráfico de área interactivo (Recharts) que sincroniza el cursor entre el mapa 2D, el visor 3D y la telemetría en tiempo real.
   - Inspección milimétrica de elevación MOLA, inclinación en grados y porcentaje, tipo de terreno y tasa de radiación.

5. **Monitoreo Científico y Soporte Vital (NASA REMS & RAD):**
   - **REMS:** Temperatura de aire y suelo marciano, presión atmosférica, velocidad de viento y opacidad por polvo (Tau).
   - **RAD:** Tasa horaria de radiación cósmica (GCR), estado de partículas solares (SEP) y atenuación por columna atmosférica según altitud.
   - **Soporte Vital:** Cálculo de margen de oxígeno en traje PLSS (reserva de 2h de contingencia), consumo de agua refrigerante y energía de batería.

6. **Diseño de Interfaz Apple:**
   - Paleta sobria (`#000000`, `#1D1D1F`, `#2C2C2E`), botón de acción azul Apple (`#0071E3`), botones pastilla (`rounded: 980px`), tipografía SF Pro / Inter, tarjetas con radio de 18px y efectos frosted glass.
   - **100% en Español.**

---

## 🛠️ Tecnologías Empleadas

- **Frontend:** React 18, Vite 5
- **Estilos:** Tailwind CSS, Lucide Icons, Apple Design Tokens
- **Cartografía 2D:** Leaflet, React-Leaflet, NASA Mars Trek WMTS Services
- **Gráficos 3D:** Three.js, @react-three/fiber, @react-three/drei
- **Visualización de Datos:** Recharts
- **Geodesia Marciana:** Radio elipsoidal de Marte (3389.5 km), Datum Areoide MOLA

---

## 🚀 Cómo Ejecutar la Aplicación

1. **Instalar dependencias:**
   ```bash
   npm install
   ```

2. **Iniciar servidor de desarrollo:**
   ```bash
   npm run dev
   ```
   Abrirá la plataforma en [http://localhost:3000](http://localhost:3000).

3. **Compilar para producción:**
   ```bash
   npm run build
   ```
