import React from 'react';
import {
  Thermometer,
  Gauge,
  Wind,
  Sun,
  Eye,
  AlertTriangle,
  Clock,
  Sparkles,
} from 'lucide-react';
import { DataCard } from '../ui/DataCard';

export function WeatherPanel({ weather }) {
  if (!weather) {
    return (
      <div className="p-4 text-center text-xs text-[#86868B]">
        Cargando telemetría meteorológica REMS de la NASA...
      </div>
    );
  }

  const { current, season, currentSol, evaSuitImpact } = weather;

  return (
    <div className="space-y-4 text-[#F5F5F7]">
      {/* Sol y Estación Marciana */}
      <div className="bg-[#1D1D1F]/80 backdrop-blur-xl border border-white/10 rounded-[18px] p-4 shadow-apple-card">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold tracking-wider text-[#86868B] uppercase">
            Estación REMS Curiosity
          </span>
          <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#30D158]/15 border border-[#30D158]/30 text-[#30D158]">
            Sol {currentSol}
          </span>
        </div>
        <p className="text-sm font-medium text-[#F5F5F7]">{season}</p>
        <p className="text-xs text-[#86868B] mt-0.5">
          Datos de la estación meteorológica REMS / NASA Curiosity
        </p>
      </div>

      {/* Grid de Métricas Principales */}
      <div className="grid grid-cols-2 gap-2.5">
        <div className="p-3 bg-[#1D1D1F]/90 border border-white/10 rounded-2xl">
          <div className="flex items-center gap-1.5 text-xs text-[#86868B] mb-1">
            <Thermometer size={14} className="text-[#0071E3]" />
            <span>Temp. Aire</span>
          </div>
          <div className="text-xl font-semibold text-[#F5F5F7]">
            {current.tempAir}°C
          </div>
          <div className="text-[10px] text-[#86868B] mt-1">
            Mín: {current.tempMin}°C | Máx: {current.tempMax}°C
          </div>
        </div>

        <div className="p-3 bg-[#1D1D1F]/90 border border-white/10 rounded-2xl">
          <div className="flex items-center gap-1.5 text-xs text-[#86868B] mb-1">
            <Thermometer size={14} className="text-[#FF9F0A]" />
            <span>Temp. Suelo</span>
          </div>
          <div className="text-xl font-semibold text-[#F5F5F7]">
            {current.tempGround}°C
          </div>
          <div className="text-[10px] text-[#86868B] mt-1">
            Contacto directo de bota
          </div>
        </div>

        <div className="p-3 bg-[#1D1D1F]/90 border border-white/10 rounded-2xl">
          <div className="flex items-center gap-1.5 text-xs text-[#86868B] mb-1">
            <Gauge size={14} className="text-[#30D158]" />
            <span>Presión</span>
          </div>
          <div className="text-xl font-semibold text-[#F5F5F7]">
            {current.pressure} <span className="text-xs font-normal text-[#86868B]">Pa</span>
          </div>
          <div className="text-[10px] text-[#86868B] mt-1">
            0.825 kPa (~0.8% terrestre)
          </div>
        </div>

        <div className="p-3 bg-[#1D1D1F]/90 border border-white/10 rounded-2xl">
          <div className="flex items-center gap-1.5 text-xs text-[#86868B] mb-1">
            <Wind size={14} className="text-[#BF5AF2]" />
            <span>Viento</span>
          </div>
          <div className="text-xl font-semibold text-[#F5F5F7]">
            {current.windSpeed} <span className="text-xs font-normal text-[#86868B]">m/s</span>
          </div>
          <div className="text-[10px] text-[#86868B] mt-1">
            {current.windDirection}
          </div>
        </div>
      </div>

      {/* Radiación UV y Polvo */}
      <div className="bg-[#1D1D1F]/80 backdrop-blur-xl border border-white/10 rounded-[18px] p-3.5 space-y-2.5">
        <div className="flex items-center justify-between text-xs">
          <span className="text-[#86868B] flex items-center gap-1.5">
            <Sun size={13} className="text-[#FF9F0A]" />
            <span>Índice Solar UV</span>
          </span>
          <span className="font-medium text-[#FF9F0A]">{current.uvIndex}</span>
        </div>

        <div className="flex items-center justify-between text-xs">
          <span className="text-[#86868B] flex items-center gap-1.5">
            <Eye size={13} className="text-[#0071E3]" />
            <span>Opacidad del Polvo (Tau)</span>
          </span>
          <span className="font-mono text-[#F5F5F7]">{current.opacityTau} (Baja)</span>
        </div>

        <div className="flex items-center justify-between text-xs">
          <span className="text-[#86868B]">Visibilidad Horizontal:</span>
          <span className="font-mono text-[#F5F5F7]">{current.visibilityKm} km</span>
        </div>
      </div>

      {/* Recomendación Operativa para Traje EVA */}
      {evaSuitImpact && (
        <div className="bg-[#0071E3]/10 border border-[#0071E3]/25 rounded-[18px] p-3.5 space-y-2 text-xs">
          <div className="flex items-center gap-2 text-[#0071E3] font-medium">
            <Clock size={15} />
            <span>Ventana EVA Recomendada</span>
          </div>
          <p className="text-[#F5F5F7] text-[11px] leading-relaxed">
            {evaSuitImpact.recommendedWindow}
          </p>
          <div className="pt-1 border-t border-white/10 text-[10px] text-[#86868B]">
            {evaSuitImpact.gloveTempWarning}
          </div>
        </div>
      )}
    </div>
  );
}
