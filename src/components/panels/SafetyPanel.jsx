import React from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Battery,
  Droplets,
  Wind,
  Flame,
  ArrowUpRight,
} from 'lucide-react';
import { AlertBadge } from '../ui/AlertBadge';

export function SafetyPanel({ safetyAnalysis, calculatedRoute }) {
  if (!safetyAnalysis || !calculatedRoute) {
    return (
      <div className="p-4 text-center text-xs text-[#86868B]">
        Calcule una ruta para ver el análisis de contingencia y soporte vital.
      </div>
    );
  }

  const {
    alerts,
    o2RemainingPercent,
    estO2ConsumedLiters,
    waterConsumedLiters,
    batteryConsumedWh,
    isSafeOverall,
  } = safetyAnalysis;

  return (
    <div className="space-y-4 text-[#F5F5F7]">
      {/* Estado General de la Caminata */}
      <div className="bg-[#1D1D1F]/80 backdrop-blur-xl border border-white/10 rounded-[18px] p-4 shadow-apple-card">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold tracking-wider text-[#86868B] uppercase">
            Protocolo de Seguridad EVA
          </span>
          <AlertBadge
            level={isSafeOverall ? 'Seguro' : 'Peligroso'}
            text={isSafeOverall ? 'Aprobada' : 'Revisión Necesaria'}
          />
        </div>

        <p className="text-xs text-[#86868B]">
          Evaluación automatizada conforme a los estándares de exploración de superficie de la NASA.
        </p>
      </div>

      {/* Soporte Vital PLSS */}
      <div className="bg-[#1D1D1F]/80 backdrop-blur-xl border border-white/10 rounded-[18px] p-4 shadow-apple-card space-y-3">
        <span className="text-xs font-semibold tracking-wider text-[#86868B] uppercase block">
          Consumibles Estimados del Traje
        </span>

        {/* Barra de Oxígeno */}
        <div>
          <div className="flex justify-between text-xs mb-1">
            <span className="text-[#86868B] flex items-center gap-1.5">
              <Wind size={13} className="text-[#0071E3]" />
              <span>Reserva de O₂ en Tanque:</span>
            </span>
            <span className="font-semibold text-[#F5F5F7]">{o2RemainingPercent}%</span>
          </div>
          <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                o2RemainingPercent > 40 ? 'bg-[#30D158]' : o2RemainingPercent > 20 ? 'bg-[#FF9F0A]' : 'bg-[#FF453A]'
              }`}
              style={{ width: `${o2RemainingPercent}%` }}
            />
          </div>
          <div className="flex justify-between text-[10px] text-[#86868B] mt-1">
            <span>Consumo est.: {estO2ConsumedLiters} L</span>
            <span>Reserva de emergencia: 2.0 h</span>
          </div>
        </div>

        {/* Agua y Batería */}
        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/10 text-xs">
          <div className="p-2 rounded-xl bg-white/5">
            <div className="flex items-center gap-1 text-[11px] text-[#86868B] mb-0.5">
              <Droplets size={12} className="text-[#0071E3]" />
              <span>Agua Enfriamiento</span>
            </div>
            <span className="font-semibold text-[#F5F5F7]">{waterConsumedLiters} L</span>
            <span className="text-[10px] text-[#86868B] block">de 6.0 L totales</span>
          </div>

          <div className="p-2 rounded-xl bg-white/5">
            <div className="flex items-center gap-1 text-[11px] text-[#86868B] mb-0.5">
              <Battery size={12} className="text-[#30D158]" />
              <span>Energía Traje</span>
            </div>
            <span className="font-semibold text-[#F5F5F7]">{batteryConsumedWh} Wh</span>
            <span className="text-[10px] text-[#86868B] block">de 400 Wh batería</span>
          </div>
        </div>
      </div>

      {/* Alertas y Advertencias Detectadas */}
      <div className="bg-[#1D1D1F]/80 backdrop-blur-xl border border-white/10 rounded-[18px] p-4 shadow-apple-card space-y-2.5">
        <span className="text-xs font-semibold tracking-wider text-[#86868B] uppercase block">
          Dictámenes de Ruta ({alerts.length})
        </span>

        <div className="space-y-2">
          {alerts.map((alert, idx) => {
            const isDanger = alert.type === 'danger' || alert.type === 'critical';
            const isWarning = alert.type === 'warning';
            return (
              <div
                key={idx}
                className={`p-2.5 rounded-xl border text-xs ${
                  isDanger
                    ? 'bg-rose-500/10 border-rose-500/25 text-rose-300'
                    : isWarning
                    ? 'bg-amber-500/10 border-amber-500/25 text-amber-300'
                    : 'bg-emerald-500/10 border-emerald-500/25 text-emerald-300'
                }`}
              >
                <div className="font-semibold mb-0.5 flex items-center gap-1.5">
                  {isDanger ? (
                    <AlertTriangle size={13} className="text-[#FF453A]" />
                  ) : (
                    <ShieldCheck size={13} className="text-[#30D158]" />
                  )}
                  <span>{alert.title}</span>
                </div>
                <p className="text-[11px] leading-relaxed opacity-90">
                  {alert.message}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
