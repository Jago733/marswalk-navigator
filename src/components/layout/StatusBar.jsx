import React from 'react';
import {
  Compass,
  Mountain,
  TrendingUp,
  Shield,
  Layers,
  Thermometer,
  Wind,
} from 'lucide-react';
import { formatElevation, formatSlope, formatRadiation } from '../../utils/formatters';
import { formatCoords } from '../../utils/marsCoords';

export function StatusBar({ hoveredPoint, defaultCoords = { lat: -4.6800, lng: 137.3800, elevation: -4450 } }) {
  const current = hoveredPoint || defaultCoords;
  const lat = current.lat;
  const lng = current.lng;
  const elevation = current.elevation !== undefined ? current.elevation : -4450;
  const slope = current.slopeDegrees !== undefined ? current.slopeDegrees : 0;
  const terrain = current.terrainType || 'Regolito Consolidado con Pavimento Pedregoso';
  const radiationRate = current.radiationRate || 27.2;

  return (
    <footer className="relative z-30 h-10 w-full px-5 bg-black/85 backdrop-blur-xl border-t border-white/10 flex items-center justify-between text-xs text-[#86868B] select-none">
      {/* Left: Position & Elevation */}
      <div className="flex items-center gap-6 overflow-hidden">
        <div className="flex items-center gap-1.5 font-mono text-[#F5F5F7] whitespace-nowrap">
          <Compass size={13} className="text-[#0071E3]" />
          <span>{formatCoords(lat, lng)}</span>
        </div>

        <div className="flex items-center gap-1.5 whitespace-nowrap">
          <Mountain size={13} className="text-[#30D158]" />
          <span>Elevación MOLA:</span>
          <span className="font-mono font-medium text-[#F5F5F7]">
            {formatElevation(elevation)}
          </span>
        </div>

        <div className="flex items-center gap-1.5 whitespace-nowrap hidden sm:flex">
          <TrendingUp size={13} className={slope > 18 ? 'text-[#FF453A]' : 'text-[#FF9F0A]'} />
          <span>Inclinación:</span>
          <span className="font-mono font-medium text-[#F5F5F7]">
            {formatSlope(slope)}
          </span>
        </div>
      </div>

      {/* Center: Terrain description */}
      <div className="hidden xl:flex items-center gap-2 truncate max-w-md text-[11px] text-[#86868B]">
        <Layers size={13} className="text-[#BF5AF2] shrink-0" />
        <span className="truncate">{terrain}</span>
      </div>

      {/* Right: Radiation & Shielding factor */}
      <div className="flex items-center gap-5 whitespace-nowrap">
        <div className="flex items-center gap-1.5">
          <Shield size={13} className="text-[#0071E3]" />
          <span className="hidden md:inline">Tasa RAD:</span>
          <span className="font-mono font-medium text-[#F5F5F7]">
            {formatRadiation(radiationRate)}/h
          </span>
        </div>

        <div className="flex items-center gap-1.5 text-[10px] text-[#86868B] hidden md:flex">
          <img src="/logo-geotrend.png" alt="GeoTrend" className="w-3.5 h-3.5 object-contain" />
          <span>GeoTrend • Datum: Areoide MOLA</span>
        </div>
      </div>
    </footer>
  );
}
