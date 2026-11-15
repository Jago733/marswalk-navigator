import React from 'react';
import {
  Compass,
  Layers,
  Box,
  LayoutGrid,
  ShieldAlert,
  Flame,
  Globe2,
  Radio,
} from 'lucide-react';
import { SegmentControl } from '../ui/SegmentControl';

export function Header({ activeTab, onTabChange, sol = 4120 }) {
  const tabOptions = [
    { id: 'dual', label: 'Vista Dual (2D + 3D)', icon: LayoutGrid },
    { id: 'map2d', label: 'Mapa Satelital 2D', icon: Layers },
    { id: 'viewer3d', label: 'Perfil 3D del Terreno', icon: Box },
    { id: 'mission', label: 'Consola Científica', icon: ShieldAlert },
  ];

  return (
    <header className="relative z-30 h-16 w-full px-5 bg-black/75 backdrop-blur-2xl border-b border-white/10 flex items-center justify-between select-none">
      {/* Brand & NASA identification */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="relative group cursor-pointer shrink-0">
            <div className="absolute -inset-1 bg-gradient-to-r from-[#C1440E] to-[#FF7B54] rounded-full blur-md opacity-40 group-hover:opacity-80 transition duration-300" />
            <img
              src="/logo-geotrend.png"
              alt="GeoTrend Logo"
              className="relative w-10 h-10 object-contain drop-shadow-[0_2px_10px_rgba(193,68,14,0.5)] transition-transform duration-300 group-hover:scale-105"
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold tracking-tight text-[#F5F5F7]">
                GeoTrend <span className="font-light text-[#E26D5C]">|</span> <span className="font-semibold text-[#F5F5F7]">MarsWalk</span> <span className="font-normal text-[#86868B]">Navigator</span>
              </h1>
              <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full bg-gradient-to-r from-[#C1440E]/20 to-[#FF7B54]/20 border border-[#C1440E]/40 text-[#FF7B54]">
                NASA Space Apps
              </span>
            </div>
            <p className="text-[11px] text-[#86868B] hidden sm:block">
              Navegación Táctica de Superficie Marciana by GeoTrend • Cráter Gale
            </p>
          </div>
        </div>
      </div>

      {/* Main navigation switcher */}
      <div className="hidden md:flex items-center">
        <SegmentControl
          options={tabOptions}
          value={activeTab}
          onChange={onTabChange}
        />
      </div>

      {/* Status Indicators / telemetry summary */}
      <div className="flex items-center gap-3">
        {/* Sol indicator */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#1D1D1F]/90 border border-white/10 text-xs">
          <span className="w-2 h-2 rounded-full bg-[#30D158] animate-pulse" />
          <span className="font-mono text-[#F5F5F7]">Sol {sol}</span>
          <span className="text-[#86868B] hidden lg:inline">| Gale Crater</span>
        </div>

        {/* Telemetry link status */}
        <div className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#1D1D1F]/60 border border-white/5 text-xs text-[#86868B]">
          <Radio size={13} className="text-[#30D158]" />
          <span>NASA DSN Enlace Activo</span>
        </div>
      </div>
    </header>
  );
}
