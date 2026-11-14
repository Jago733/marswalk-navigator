import React, { Suspense, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { RouteScene3D } from './RouteScene3D';
import { ElevationChart } from './ElevationChart';
import {
  RotateCcw,
  Eye,
  Box,
  Compass,
  Layers,
  Sparkles,
} from 'lucide-react';

export function RouteViewer3D({ calculatedRoute, hoveredPoint, onHoverPoint }) {
  if (!calculatedRoute || !calculatedRoute.waypoints || calculatedRoute.waypoints.length === 0) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center text-[#86868B] space-y-2">
        <Box size={32} className="text-white/20 animate-pulse" />
        <p className="text-sm">Seleccione un Punto A y un Punto B para generar el modelo tridimensional de la ruta.</p>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full flex flex-col bg-black select-none overflow-hidden">
      {/* 3D Canvas Viewport (Upper 65-70%) */}
      <div className="relative flex-1 w-full min-h-[300px]">
        <Canvas
          camera={{ position: [0, 18, 32], fov: 45 }}
          className="w-full h-full"
        >
          <Suspense fallback={null}>
            <RouteScene3D
              calculatedRoute={calculatedRoute}
              hoveredPoint={hoveredPoint}
              onHoverPoint={onHoverPoint}
            />
          </Suspense>
        </Canvas>

        {/* Floating Top Controls Overlay */}
        <div className="absolute top-4 left-4 z-10 flex items-center gap-2">
          <div className="bg-[#1D1D1F]/90 backdrop-blur-xl border border-white/10 rounded-full px-3 py-1.5 shadow-apple-card flex items-center gap-2 text-xs text-[#F5F5F7]">
            <Box size={14} className="text-[#0071E3]" />
            <span className="font-semibold">Perfil Tridimensional del Recorrido</span>
            <span className="text-[10px] text-[#86868B] hidden sm:inline">
              | Arrastre para rotar • Rueda para zoom
            </span>
          </div>
        </div>

        {/* Legend Overlay on Top Right */}
        <div className="absolute top-4 right-4 z-10 bg-[#1D1D1F]/90 backdrop-blur-xl border border-white/10 rounded-2xl px-3 py-2 shadow-apple-card flex items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#30D158]" />
            <span className="text-[#86868B] text-[11px]">Seguro</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#FF9F0A]" />
            <span className="text-[#86868B] text-[11px]">Moderado</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#FF453A]" />
            <span className="text-[#86868B] text-[11px]">Escarpado (&gt;20°)</span>
          </div>
        </div>
      </div>

      {/* Elevation Profile Chart Bar (Lower 30-35%) */}
      <div className="h-44 w-full bg-[#161617]/95 backdrop-blur-2xl border-t border-white/10 shrink-0">
        <ElevationChart
          calculatedRoute={calculatedRoute}
          hoveredPoint={hoveredPoint}
          onHoverPoint={onHoverPoint}
        />
      </div>
    </div>
  );
}
