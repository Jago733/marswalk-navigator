import React, { useEffect, useRef, useState } from 'react';
import {
  MapContainer,
  TileLayer,
  ImageOverlay,
  Polyline,
  Marker,
  Popup,
  Circle,
  useMapEvents,
  useMap,
} from 'react-leaflet';
import L from 'leaflet';
import { MARS_LAYERS } from '../../data/marsLayers';
import { getElevationAt, getTerrainType, formatCoords } from '../../utils/marsCoords';
import { calculateSlope, getSlopeDifficulty } from '../../utils/slopeCalc';
import { formatElevation, formatSlope, formatDistance, formatRadiation } from '../../utils/formatters';
import {
  Layers,
  MapPin,
  Compass,
  AlertTriangle,
  Info,
  Flame,
  Shield,
  Eye,
  Globe2,
  Crosshair,
} from 'lucide-react';

// Custom Leaflet Icons using pure SVG
const createCustomIcon = (color, text, isStartOrEnd = false) => {
  const size = isStartOrEnd ? 32 : 24;
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="${color}" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="filter: drop-shadow(0 4px 8px rgba(0,0,0,0.6));">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
      <circle cx="12" cy="10" r="3" fill="#ffffff"></circle>
    </svg>
  `;
  return L.divIcon({
    html: svg,
    className: 'custom-mars-marker',
    iconSize: [size, size],
    iconAnchor: [size / 2, size],
    popupAnchor: [0, -size],
  });
};

// Custom Leaflet Markers styled with the MarsWalk Pin
const createMarsWalkMarker = (label, badgeColor) => {
  return L.divIcon({
    html: `
      <div style="position: relative; width: 38px; height: 38px; filter: drop-shadow(0 4px 12px rgba(0,0,0,0.85));">
        <img src="/mars-logo.png" style="width: 100%; height: 100%; object-fit: contain;" alt="MarsWalk Pin" />
        <span style="position: absolute; top: -2px; right: -2px; width: 17px; height: 17px; border-radius: 999px; background: ${badgeColor}; border: 2px solid #000; color: #fff; font-size: 10px; font-weight: 800; display: flex; align-items: center; justify-content: center; box-shadow: 0 0 10px ${badgeColor};">
          ${label}
        </span>
      </div>
    `,
    className: 'custom-marswalk-pin',
    iconSize: [38, 38],
    iconAnchor: [19, 38],
    popupAnchor: [0, -38],
  });
};

const iconStart = createMarsWalkMarker('A', '#30D158');
const iconEnd = createMarsWalkMarker('B', '#0071E3');
const iconPoi = createCustomIcon('#BF5AF2', 'POI', false);
const iconHover = createCustomIcon('#FF9F0A', 'X', false);

// Component to handle map clicks and mouse movement
function MapEventHandler({ onMapClick, onMapHover }) {
  useMapEvents({
    click(e) {
      onMapClick(e.latlng.lat, e.latlng.lng);
    },
    mousemove(e) {
      onMapHover(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

// Controller to smoothly fit bounds when route changes
function RouteBoundsController({ waypoints }) {
  const map = useMap();
  useEffect(() => {
    if (waypoints && waypoints.length > 1) {
      const bounds = L.latLngBounds(waypoints.map((w) => [w.lat, w.lng]));
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 14 });
    }
  }, [waypoints, map]);
  return null;
}

// Controller to smoothly navigate between Global and Gale Crater views
function MapNavigationHelper({ targetView, onAutoLayerSwitch }) {
  const map = useMap();
  useEffect(() => {
    if (!targetView) return;
    if (targetView.type === 'global') {
      map.flyTo([0, 0], 2, { duration: 1.5 });
    } else if (targetView.type === 'gale') {
      // Al ir a Gale Crater, cambiar automáticamente a Viking para mejor resolución
      if (onAutoLayerSwitch) onAutoLayerSwitch('viking-color');
      map.flyTo([-4.68, 137.38], 11, { duration: 1.5 });
    }
  }, [targetView, map, onAutoLayerSwitch]);
  return null;
}

export function MarsMap2D({
  routeHook,
  pois,
  curiosityRoute,
  minerals,
  activeLayer = 'mars-global-custom',
  onLayerChange,
}) {
  const {
    startPoint,
    endPoint,
    calculatedRoute,
    hoveredPoint,
    setHoveredPoint,
    setCustomPoint,
  } = routeHook;

  const [currentLayerId, setCurrentLayerId] = useState(activeLayer);
  const [targetView, setTargetView] = useState(null);
  const [showCuriosity, setShowCuriosity] = useState(true);
  const [showMinerals, setShowMinerals] = useState(true);
  const [showHazards, setShowHazards] = useState(true);
  const [clickMode, setClickMode] = useState('end'); // 'start' o 'end'

  useEffect(() => {
    if (activeLayer) {
      setCurrentLayerId(activeLayer);
    }
  }, [activeLayer]);

  const selectedTileLayer =
    MARS_LAYERS.find((l) => l.id === currentLayerId) || MARS_LAYERS[0];

  const handleMapHover = (lat, lng) => {
    const elev = getElevationAt(lat, lng);
    const terrain = getTerrainType(lat, lng, elev, 0);
    setHoveredPoint({
      lat: Number(lat.toFixed(5)),
      lng: Number(lng.toFixed(5)),
      elevation: elev,
      slopeDegrees: 0,
      terrainType: terrain,
      radiationRate: 27.2,
    });
  };

  const handleMapClick = (lat, lng) => {
    if (clickMode === 'start') {
      setCustomPoint('start', lat, lng, `Punto A (${lat.toFixed(3)}°, ${lng.toFixed(3)}°)`);
      setClickMode('end');
    } else {
      setCustomPoint('end', lat, lng, `Punto B (${lat.toFixed(3)}°, ${lng.toFixed(3)}°)`);
      setClickMode('start');
    }
  };

  // Convert waypoints into colored segments based on local slope
  const routeSegments = [];
  if (calculatedRoute && calculatedRoute.waypoints && calculatedRoute.waypoints.length > 1) {
    const pts = calculatedRoute.waypoints;
    for (let i = 0; i < pts.length - 1; i++) {
      const p1 = pts[i];
      const p2 = pts[i + 1];
      const color =
        p2.slopeDegrees > 20
          ? '#FF453A'
          : p2.slopeDegrees > 12
          ? '#FF9F0A'
          : '#30D158';

      routeSegments.push({
        positions: [
          [p1.lat, p1.lng],
          [p2.lat, p2.lng],
        ],
        color,
        p2,
      });
    }
  }

  // Curiosity rover polyline coordinates
  const curiosityCoords = curiosityRoute?.map((pt) => [pt.lat, pt.lng]) || [];

  return (
    <div className="relative w-full h-full bg-black select-none overflow-hidden">
      {/* Leaflet Map Canvas */}
      <MapContainer
        center={[-4.68, 137.38]}
        zoom={4}
        minZoom={1}
        maxZoom={18}
        scrollWheelZoom={true}
        className="w-full h-full"
        zoomControl={false}
      >
        <MapNavigationHelper
          targetView={targetView}
          onAutoLayerSwitch={(layerId) => {
            setCurrentLayerId(layerId);
            if (onLayerChange) onLayerChange(layerId);
          }}
        />

        <MapEventHandler
          onMapClick={handleMapClick}
          onMapHover={handleMapHover}
        />

        {calculatedRoute && calculatedRoute.waypoints && (
          <RouteBoundsController waypoints={calculatedRoute.waypoints} />
        )}

        {/* Base Layer: Global Mars Image Overlay or NASA WMTS Tile Layer */}
        {selectedTileLayer.isImageOverlay ? (
          <ImageOverlay
            key={selectedTileLayer.id}
            url={selectedTileLayer.imageUrl}
            bounds={selectedTileLayer.bounds}
            opacity={1}
            zIndex={1}
          />
        ) : (
          <TileLayer
            key={selectedTileLayer.id}
            url={selectedTileLayer.url}
            attribution={selectedTileLayer.attribution}
            maxZoom={selectedTileLayer.maxZoom}
            minZoom={selectedTileLayer.minZoom}
            tileSize={256}
            noWrap={true}
          />
        )}

        {/* Fallback procedural dark Mars styling if tiles are pending */}
        <div className="leaflet-tile-pane opacity-90" />

        {/* Historic Curiosity Rover Traverse */}
        {showCuriosity && curiosityCoords.length > 0 && (
          <Polyline
            positions={curiosityCoords}
            pathOptions={{
              color: '#FF9F0A',
              weight: 2.5,
              opacity: 0.85,
              dashArray: '6, 8',
            }}
          />
        )}

        {/* Route Segments colored by slope */}
        {routeSegments.map((seg, idx) => (
          <Polyline
            key={idx}
            positions={seg.positions}
            pathOptions={{
              color: seg.color,
              weight: 5,
              opacity: 0.95,
              lineCap: 'round',
            }}
            eventHandlers={{
              mouseover: () => {
                setHoveredPoint(seg.p2);
              },
            }}
          />
        ))}

        {/* Start Point A Marker */}
        {startPoint && (
          <Marker position={[startPoint.lat, startPoint.lng]} icon={iconStart}>
            <Popup>
              <div className="text-xs space-y-1">
                <span className="font-bold text-[#30D158] block">PUNTO DE SALIDA (A)</span>
                <span className="font-medium text-[#F5F5F7] block">{startPoint.name}</span>
                <span className="text-[#86868B] block">
                  Elevación: {formatElevation(startPoint.elevation)}
                </span>
                <span className="text-[#86868B] block font-mono">
                  {formatCoords(startPoint.lat, startPoint.lng)}
                </span>
              </div>
            </Popup>
          </Marker>
        )}

        {/* End Point B Marker */}
        {endPoint && (
          <Marker position={[endPoint.lat, endPoint.lng]} icon={iconEnd}>
            <Popup>
              <div className="text-xs space-y-1">
                <span className="font-bold text-[#0071E3] block">DESTINO FINAL (B)</span>
                <span className="font-medium text-[#F5F5F7] block">{endPoint.name}</span>
                <span className="text-[#86868B] block">
                  Elevación: {formatElevation(endPoint.elevation)}
                </span>
                <span className="text-[#86868B] block font-mono">
                  {formatCoords(endPoint.lat, endPoint.lng)}
                </span>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Points of Interest Markers */}
        {pois &&
          pois.map((poi) => (
            <Marker key={poi.id} position={[poi.lat, poi.lng]} icon={iconPoi}>
              <Popup>
                <div className="text-xs space-y-1.5 max-w-[220px]">
                  <span className="text-[10px] uppercase font-semibold text-[#BF5AF2] block">
                    {poi.category}
                  </span>
                  <span className="font-bold text-[#F5F5F7] block">{poi.name}</span>
                  <p className="text-[11px] text-[#86868B]">{poi.description}</p>
                  <div className="pt-1 border-t border-white/10 flex justify-between text-[10px]">
                    <span className="text-[#86868B]">Elevación:</span>
                    <span className="font-mono text-[#F5F5F7]">{formatElevation(poi.elevation)}</span>
                  </div>
                  <div className="flex gap-1 pt-1">
                    <button
                      type="button"
                      onClick={() => setCustomPoint('start', poi.lat, poi.lng, poi.name)}
                      className="px-2 py-0.5 rounded-full bg-[#30D158]/20 text-[#30D158] text-[10px] font-medium"
                    >
                      Fijar Origen
                    </button>
                    <button
                      type="button"
                      onClick={() => setCustomPoint('end', poi.lat, poi.lng, poi.name)}
                      className="px-2 py-0.5 rounded-full bg-[#0071E3]/20 text-[#0071E3] text-[10px] font-medium"
                    >
                      Fijar Destino
                    </button>
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}

        {/* Hazard Zone: Namib Dunes */}
        {showHazards && (
          <Circle
            center={[-4.685, 137.375]}
            radius={1200}
            pathOptions={{
              color: '#FF453A',
              fillColor: '#FF453A',
              fillOpacity: 0.18,
              dashArray: '4, 6',
            }}
          >
            <Popup>
              <div className="text-xs space-y-1">
                <span className="font-bold text-[#FF453A] block">ZONA DE RIESGO: DUNAS DE NAMIB</span>
                <span className="text-[#86868B] block">
                  Campo de dunas activas con arena muy suelta. Riesgo crítico de atascamiento.
                </span>
              </div>
            </Popup>
          </Circle>
        )}

        {/* Mineral overlays */}
        {showMinerals &&
          minerals &&
          minerals.map((m) =>
            m.regions.map((reg, idx) => (
              <Circle
                key={`${m.id}-${idx}`}
                center={[reg.lat, reg.lng]}
                radius={reg.radiusMeters}
                pathOptions={{
                  color: m.color,
                  fillColor: m.color,
                  fillOpacity: 0.12,
                  weight: 1.5,
                }}
              >
                <Popup>
                  <div className="text-xs space-y-1">
                    <span className="font-bold text-[#F5F5F7]" style={{ color: m.color }}>
                      {m.name}
                    </span>
                    <span className="text-[#86868B] block">{reg.name}</span>
                    <span className="text-[10px] text-[#86868B] block">
                      Abundancia espectral: {reg.abundance}
                    </span>
                  </div>
                </Popup>
              </Circle>
            ))
          )}
      </MapContainer>

      {/* Floating Map Controls HUD */}
      <div className="absolute top-4 left-4 z-20 space-y-2">
        {/* Quick View Switcher: Global vs Gale Crater */}
        <div className="bg-[#1D1D1F]/90 backdrop-blur-xl border border-white/10 rounded-2xl p-1.5 shadow-apple-card flex items-center gap-1">
          <button
            type="button"
            onClick={() => setTargetView({ type: 'global', timestamp: Date.now() })}
            className="flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-medium text-[#86868B] hover:text-[#F5F5F7] hover:bg-white/10 transition-all"
            title="Ver el planeta Marte completo con el mapa satelital global"
          >
            <Globe2 size={13} className="text-[#0071E3]" />
            <span>Vista Global</span>
          </button>
          <button
            type="button"
            onClick={() => setTargetView({ type: 'gale', timestamp: Date.now() })}
            className="flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-medium text-[#86868B] hover:text-[#F5F5F7] hover:bg-white/10 transition-all"
            title="Centrar en el Cráter Gale y la ruta activa"
          >
            <Crosshair size={13} className="text-[#30D158]" />
            <span>Cráter Gale</span>
          </button>
        </div>

        {/* Layer Selector Dropdown */}
        <div className="bg-[#1D1D1F]/90 backdrop-blur-xl border border-white/10 rounded-2xl p-2 shadow-apple-card flex items-center gap-2">
          <Layers size={14} className="text-[#0071E3] ml-1" />
          <select
            value={currentLayerId}
            onChange={(e) => {
              setCurrentLayerId(e.target.value);
              if (onLayerChange) onLayerChange(e.target.value);
            }}
            className="bg-transparent text-xs text-[#F5F5F7] font-medium focus:outline-none pr-3 cursor-pointer"
          >
            {MARS_LAYERS.map((layer) => (
              <option key={layer.id} value={layer.id} className="bg-[#1D1D1F] text-[#F5F5F7]">
                {layer.name}
              </option>
            ))}
          </select>
        </div>

        {/* Overlay toggles */}
        <div className="bg-[#1D1D1F]/90 backdrop-blur-xl border border-white/10 rounded-2xl p-2.5 shadow-apple-card space-y-2 text-xs">
          <span className="text-[10px] uppercase font-semibold text-[#86868B] block tracking-wider">
            Capas Científicas
          </span>

          <label className="flex items-center gap-2 cursor-pointer text-[#F5F5F7]">
            <input
              type="checkbox"
              checked={showCuriosity}
              onChange={(e) => setShowCuriosity(e.target.checked)}
              className="accent-[#FF9F0A] rounded"
            />
            <span className="w-2 h-2 rounded-full bg-[#FF9F0A]" />
            <span>Ruta Curiosity MSL</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer text-[#F5F5F7]">
            <input
              type="checkbox"
              checked={showMinerals}
              onChange={(e) => setShowMinerals(e.target.checked)}
              className="accent-[#30D158] rounded"
            />
            <span className="w-2 h-2 rounded-full bg-[#30D158]" />
            <span>Minerales CRISM</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer text-[#F5F5F7]">
            <input
              type="checkbox"
              checked={showHazards}
              onChange={(e) => setShowHazards(e.target.checked)}
              className="accent-[#FF453A] rounded"
            />
            <span className="w-2 h-2 rounded-full bg-[#FF453A]" />
            <span>Zonas de Riesgo</span>
          </label>
        </div>
      </div>

      {/* Floating Click Mode Selector (Set A or Set B) */}
      <div className="absolute top-4 right-4 z-20">
        <div className="bg-[#1D1D1F]/90 backdrop-blur-xl border border-white/10 rounded-full px-3 py-1.5 shadow-apple-card flex items-center gap-2 text-xs">
          <span className="text-[#86868B]">Clic fijará:</span>
          <button
            type="button"
            onClick={() => setClickMode('start')}
            className={`px-2 py-0.5 rounded-full font-medium transition-all ${
              clickMode === 'start'
                ? 'bg-[#30D158] text-black font-semibold'
                : 'text-[#86868B] hover:text-[#F5F5F7]'
            }`}
          >
            Punto A
          </button>
          <button
            type="button"
            onClick={() => setClickMode('end')}
            className={`px-2 py-0.5 rounded-full font-medium transition-all ${
              clickMode === 'end'
                ? 'bg-[#0071E3] text-white font-semibold'
                : 'text-[#86868B] hover:text-[#F5F5F7]'
            }`}
          >
            Punto B
          </button>
        </div>
      </div>

      {/* Slope Legend Badge on Bottom Left */}
      <div className="absolute bottom-3 left-4 z-20 bg-[#1D1D1F]/90 backdrop-blur-xl border border-white/10 rounded-2xl px-3 py-2 shadow-apple-card flex items-center gap-4 text-[11px]">
        <span className="text-[#86868B] font-medium">Pendientes:</span>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#30D158]" />
          <span className="text-[#F5F5F7]">&lt;12° Seguro</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#FF9F0A]" />
          <span className="text-[#F5F5F7]">12°-20° Moderado</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#FF453A]" />
          <span className="text-[#F5F5F7]">&gt;20° Escarpado</span>
        </div>
      </div>
    </div>
  );
}
