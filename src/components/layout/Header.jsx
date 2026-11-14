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
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#C1440E] to-[#FF7B54] p-[1.5px] shadow-lg shadow-orange-500/20 flex items-center justify-center">
            <div className="w-full h-full rounded-full bg-black/60 flex items-center justify-center">
              <Compass size={18} className="text-[#FF7B54]" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-semibold tracking-tight text-[#F5F5F7]">
                MarsWalk <span className="font-normal text-[#86868B]">Navigator</span>
              </h1>
              <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full bg-gradient-to-r from-[#0071E3]/20 to-[#BF5AF2]/20 border border-[#0071E3]/30 text-[#0071E3]">
                NASA Space Apps
              </span>
            </div>
            <p className="text-[11px] text-[#86868B] hidden sm:block">
              Sistema GPS y Análisis Táctico de Terreno Marciano • Cráter Gale
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
