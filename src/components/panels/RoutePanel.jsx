import React from 'react';
import {
  MapPin,
  Navigation,
  Compass,
  ArrowRight,
  TrendingUp,
  Clock,
  Shield,
  RotateCcw,
  Sparkles,
  Mountain,
} from 'lucide-react';
import { AlertBadge } from '../ui/AlertBadge';
import { formatDistance, formatElevation, formatTime, formatSlope, formatRadiation } from '../../utils/formatters';

export function RoutePanel({ routeHook, pois, activeLayer, onLayerChange }) {
  const {
    startPoint,
    setStartPoint,
    endPoint,
    setEndPoint,
    calculatedRoute,
    isCalculating,
    computeRoute,
    resetRoute,
  } = routeHook;

  const handleSelectStart = (e) => {
    const selected = pois.find((p) => p.id === e.target.value);
    if (selected) {
      setStartPoint(selected);
      computeRoute(selected, endPoint);
    }
  };

  const handleSelectEnd = (e) => {
    const selected = pois.find((p) => p.id === e.target.value);
    if (selected) {
      setEndPoint(selected);
      computeRoute(startPoint, selected);
    }
  };

  const loadPresetRoute = (fromId, toId) => {
    const pStart = pois.find((p) => p.id === fromId);
    const pEnd = pois.find((p) => p.id === toId);
    if (pStart && pEnd) {
      setStartPoint(pStart);
      setEndPoint(pEnd);
      computeRoute(pStart, pEnd);
    }
  };

  return (
    <div className="space-y-4 text-[#F5F5F7]">
      {/* Selector de Puntos */}
      <div className="bg-[#1D1D1F]/80 backdrop-blur-xl border border-white/10 rounded-[18px] p-4 space-y-3.5 shadow-apple-card">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <img src="/mars-logo.png" alt="MarsWalk" className="w-4 h-4 object-contain" />
            <span className="text-xs font-semibold tracking-wider text-[#86868B] uppercase">
              Planificador MarsWalk
            </span>
          </div>
          <button
            type="button"
            onClick={resetRoute}
            className="text-xs text-[#86868B] hover:text-[#F5F5F7] flex items-center gap-1 transition-colors"
            title="Restablecer puntos"
          >
            <RotateCcw size={12} />
            <span>Limpiar</span>
          </button>
        </div>

        {/* Punto A (Origen) */}
        <div>
          <label className="text-xs text-[#86868B] mb-1.5 flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#30D158] inline-block" />
            <span className="font-medium text-[#F5F5F7]">Punto A (Partida):</span>
          </label>
          <select
            value={startPoint?.id || ''}
            onChange={handleSelectStart}
            className="w-full bg-[#2C2C2E] border border-white/10 rounded-xl px-3 py-2 text-xs text-[#F5F5F7] focus:outline-none focus:border-[#0071E3] transition-colors"
          >
            <option value="">Seleccione punto de salida...</option>
            {pois.map((poi) => (
              <option key={poi.id} value={poi.id}>
                {poi.name} ({formatElevation(poi.elevation)})
              </option>
            ))}
          </select>
        </div>

        {/* Punto B (Destino) */}
        <div>
          <label className="text-xs text-[#86868B] mb-1.5 flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#0071E3] inline-block" />
            <span className="font-medium text-[#F5F5F7]">Punto B (Destino):</span>
          </label>
          <select
            value={endPoint?.id || ''}
            onChange={handleSelectEnd}
            className="w-full bg-[#2C2C2E] border border-white/10 rounded-xl px-3 py-2 text-xs text-[#F5F5F7] focus:outline-none focus:border-[#0071E3] transition-colors"
          >
            <option value="">Seleccione punto de llegada...</option>
            {pois.map((poi) => (
              <option key={poi.id} value={poi.id}>
                {poi.name} ({formatElevation(poi.elevation)})
              </option>
            ))}
          </select>
        </div>

        {/* Botón Acción Principal */}
        <button
          type="button"
          onClick={() => computeRoute()}
          disabled={!startPoint || !endPoint || isCalculating}
          className="w-full py-2.5 px-4 btn-marswalk text-xs font-semibold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isCalculating ? (
            <>
              <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Calculando Ruta Óptima...</span>
            </>
          ) : (
            <>
              <Navigation size={14} />
              <span>Calcular Ruta Óptima</span>
            </>
          )}
        </button>

        {/* Tip interactivo */}
        <p className="text-[11px] text-[#86868B] text-center">
          O haga clic directamente en el mapa 2D para fijar puntos.
        </p>
      </div>

      {/* Rutas Preconfiguradas de Misión */}
      <div className="bg-[#1D1D1F]/80 backdrop-blur-xl border border-white/10 rounded-[18px] p-3.5 shadow-apple-card">
        <span className="text-[11px] font-semibold tracking-wider text-[#86868B] uppercase block mb-2.5">
          Rutas de Misión Sugeridas
        </span>
        <div className="space-y-1.5">
          <button
            type="button"
            onClick={() => loadPresetRoute('base-camp', 'yellowknife-bay')}
            className="w-full text-left p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors text-xs flex items-center justify-between"
          >
            <div>
              <span className="font-medium text-[#F5F5F7] block">Base Camp → Bahía Yellowknife</span>
              <span className="text-[10px] text-[#86868B]">Búsqueda de arcillas lacustres (Fácil)</span>
            </div>
            <ArrowRight size={13} className="text-[#0071E3]" />
          </button>

          <button
            type="button"
            onClick={() => loadPresetRoute('base-camp', 'vera-rubin-ridge')}
            className="w-full text-left p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors text-xs flex items-center justify-between"
          >
            <div>
              <span className="font-medium text-[#F5F5F7] block">Base Camp → Cresta Vera Rubin</span>
              <span className="text-[10px] text-[#86868B]">Exploración de hematita (+280m ascenso)</span>
            </div>
            <ArrowRight size={13} className="text-[#0071E3]" />
          </button>

          <button
            type="button"
            onClick={() => loadPresetRoute('glen-torridon', 'gediz-vallis')}
            className="w-full text-left p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors text-xs flex items-center justify-between"
          >
            <div>
              <span className="font-medium text-[#F5F5F7] block">Glen Torridon → Gediz Vallis</span>
              <span className="text-[10px] text-[#86868B]">Formaciones Boxwork (Desafío NASA 2025)</span>
            </div>
            <ArrowRight size={13} className="text-[#0071E3]" />
          </button>
        </div>
      </div>

      {/* Métricas de la Ruta Calculada */}
      {calculatedRoute && (
        <div className="bg-[#1D1D1F]/90 backdrop-blur-xl border border-white/10 rounded-[18px] p-4 shadow-apple-card space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold tracking-wider text-[#86868B] uppercase">
              Resumen de Marswalk
            </span>
            <AlertBadge
              level={calculatedRoute.safetyStatus}
              text={calculatedRoute.safetyStatus}
            />
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div className="p-2.5 rounded-xl bg-white/5">
              <div className="flex items-center gap-1.5 text-[11px] text-[#86868B] mb-1">
                <Navigation size={12} className="text-[#0071E3]" />
                <span>Distancia Total</span>
              </div>
              <span className="text-base font-semibold text-[#F5F5F7]">
                {formatDistance(calculatedRoute.totalDistanceMeters)}
              </span>
            </div>

            <div className="p-2.5 rounded-xl bg-white/5">
              <div className="flex items-center gap-1.5 text-[11px] text-[#86868B] mb-1">
                <Clock size={12} className="text-[#30D158]" />
                <span>Tiempo Est.</span>
              </div>
              <span className="text-base font-semibold text-[#F5F5F7]">
                {formatTime(calculatedRoute.estimatedTimeMinutes)}
              </span>
            </div>

            <div className="p-2.5 rounded-xl bg-white/5">
              <div className="flex items-center gap-1.5 text-[11px] text-[#86868B] mb-1">
                <Mountain size={12} className="text-[#FF9F0A]" />
                <span>Desnivel Asc.</span>
              </div>
              <span className="text-base font-semibold text-[#F5F5F7]">
                +{formatElevation(calculatedRoute.totalAscentMeters)}
              </span>
            </div>

            <div className="p-2.5 rounded-xl bg-white/5">
              <div className="flex items-center gap-1.5 text-[11px] text-[#86868B] mb-1">
                <TrendingUp size={12} className="text-[#E26D5C]" />
                <span>Pendiente Máx.</span>
              </div>
              <span className="text-base font-semibold text-[#F5F5F7]">
                {formatSlope(calculatedRoute.maxSlopeDegrees)}
              </span>
            </div>
          </div>

          {/* Dosis estimada */}
          <div className="p-2.5 rounded-xl bg-[#0071E3]/10 border border-[#0071E3]/20 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield size={16} className="text-[#0071E3]" />
              <div>
                <span className="text-xs font-medium text-[#F5F5F7] block">Dosis Radiológica Prevista</span>
                <span className="text-[10px] text-[#86868B]">Cálculo con modelo atmosférico MOLA</span>
              </div>
            </div>
            <span className="text-sm font-semibold text-[#F5F5F7]">
              {formatRadiation(calculatedRoute.totalRadiationDoseUsv)}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
