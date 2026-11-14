import React from 'react';
import {
  Shield,
  Activity,
  AlertCircle,
  Layers,
  HelpCircle,
  Radio,
} from 'lucide-react';
import { formatRadiation } from '../../utils/formatters';

export function RadiationPanel({ radiation }) {
  if (!radiation) {
    return (
      <div className="p-4 text-center text-xs text-[#86868B]">
        Cargando telemetría del instrumento RAD de Curiosity...
      </div>
    );
  }

  const { currentReading, safetyThresholds, elevationShieldingModel, materialsShieldingFactor } = radiation;

  return (
    <div className="space-y-4 text-[#F5F5F7]">
      {/* Tasa Actual de Dosis */}
      <div className="bg-[#1D1D1F]/80 backdrop-blur-xl border border-white/10 rounded-[18px] p-4 shadow-apple-card">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold tracking-wider text-[#86868B] uppercase">
            Instrumento NASA RAD
          </span>
          <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#30D158]/15 border border-[#30D158]/30 text-[#30D158] flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#30D158] animate-pulse" />
            SEP Nominal
          </span>
        </div>

        <div className="flex items-baseline gap-2 mt-2">
          <span className="text-3xl font-bold tracking-tight text-[#F5F5F7]">
            {currentReading.doseRateMicroSvPerHour}
          </span>
          <span className="text-sm font-medium text-[#86868B]">µSv / hora</span>
        </div>

        <p className="text-xs text-[#86868B] mt-1">
          Flujo constante de rayos cósmicos galácticos (GCR) en el fondo del cráter
        </p>

        <div className="mt-3 pt-3 border-t border-white/10 grid grid-cols-2 gap-2 text-xs">
          <div>
            <span className="text-[#86868B] block text-[10px]">Dosis Diaria (24h)</span>
            <span className="font-semibold text-[#F5F5F7]">
              {currentReading.dailyDoseMilliSv} mSv/día
            </span>
          </div>
          <div>
            <span className="text-[#86868B] block text-[10px]">Límite Carrera NASA</span>
            <span className="font-semibold text-[#0071E3]">
              {safetyThresholds.careerLimitMilliSv} mSv
            </span>
          </div>
        </div>
      </div>

      {/* Modelo de Apantallamiento Atmosférico de Marte */}
      <div className="bg-[#1D1D1F]/80 backdrop-blur-xl border border-white/10 rounded-[18px] p-4 shadow-apple-card space-y-2.5">
        <div className="flex items-center gap-2 text-xs font-semibold text-[#86868B] uppercase">
          <Shield size={14} className="text-[#0071E3]" />
          <span>Blindaje Pasivo por Altitud</span>
        </div>

        <p className="text-xs text-[#F5F5F7] leading-relaxed">
          {elevationShieldingModel.description}
        </p>

        <div className="p-2.5 rounded-xl bg-white/5 text-[11px] space-y-1">
          <div className="flex justify-between">
            <span className="text-[#86868B]">Fondo del Cráter (-4,500 m):</span>
            <span className="font-mono text-[#30D158]">~26.5 µSv/h (Óptimo)</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#86868B]">Cima Monte Sharp (-1,000 m):</span>
            <span className="font-mono text-[#FF9F0A]">~30.7 µSv/h (+16%)</span>
          </div>
        </div>
      </div>

      {/* Factores de Atenuación de Materiales */}
      <div className="bg-[#1D1D1F]/80 backdrop-blur-xl border border-white/10 rounded-[18px] p-3.5 space-y-2">
        <span className="text-[11px] font-semibold tracking-wider text-[#86868B] uppercase block">
          Atenuación por Equipamiento
        </span>
        <div className="space-y-2 text-xs">
          {materialsShieldingFactor.map((mat, idx) => (
            <div key={idx} className="p-2 rounded-xl bg-white/5">
              <span className="font-medium text-[#F5F5F7] block text-[11px] mb-0.5">
                {mat.material}
              </span>
              <span className="text-[10px] text-[#86868B]">{mat.attenuation}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
