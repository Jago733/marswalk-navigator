import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { formatElevation, formatDistance, formatSlope, formatRadiation } from '../../utils/formatters';

export function ElevationChart({ calculatedRoute, hoveredPoint, onHoverPoint }) {
  if (!calculatedRoute || !calculatedRoute.waypoints || calculatedRoute.waypoints.length === 0) {
    return (
      <div className="h-32 flex items-center justify-center text-xs text-[#86868B]">
        No hay datos de elevación disponibles para graficar.
      </div>
    );
  }

  const chartData = calculatedRoute.waypoints.map((w, idx) => ({
    index: idx,
    distanceKm: w.distanceKm,
    elevation: w.elevation,
    slopeDegrees: w.slopeDegrees,
    radiationRate: w.radiationRate,
    terrainType: w.terrainType,
    lat: w.lat,
    lng: w.lng,
  }));

  const minElev = Math.min(...chartData.map((d) => d.elevation)) - 20;
  const maxElev = Math.max(...chartData.map((d) => d.elevation)) + 20;

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-[#1D1D1F]/95 backdrop-blur-xl border border-white/15 rounded-2xl p-3 shadow-apple-float text-xs text-[#F5F5F7] space-y-1">
          <div className="font-semibold text-[#0071E3] flex justify-between gap-4">
            <span>Distancia: {data.distanceKm} km</span>
            <span className="font-mono text-[#F5F5F7]">{formatElevation(data.elevation)}</span>
          </div>
          <div className="text-[11px] text-[#86868B] flex justify-between">
            <span>Pendiente:</span>
            <span
              className={`font-medium ${
                data.slopeDegrees > 20
                  ? 'text-[#FF453A]'
                  : data.slopeDegrees > 12
                  ? 'text-[#FF9F0A]'
                  : 'text-[#30D158]'
              }`}
            >
              {formatSlope(data.slopeDegrees)}
            </span>
          </div>
          <div className="text-[11px] text-[#86868B] flex justify-between">
            <span>Radiación:</span>
            <span className="font-mono text-[#F5F5F7]">{formatRadiation(data.radiationRate)}/h</span>
          </div>
          <div className="text-[10px] text-[#86868B] pt-1 border-t border-white/10 max-w-[200px] truncate">
            {data.terrainType}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-full flex flex-col justify-between p-3 select-none">
      <div className="flex items-center justify-between mb-1 px-2 text-xs">
        <span className="font-medium text-[#86868B] uppercase tracking-wider text-[10px]">
          Perfil Altimétrico Longitudinal (MOLA)
        </span>
        <div className="flex items-center gap-4 text-[11px]">
          <span className="text-[#86868B]">
            Mín: <span className="text-[#F5F5F7] font-mono">{formatElevation(minElev + 20)}</span>
          </span>
          <span className="text-[#86868B]">
            Máx: <span className="text-[#F5F5F7] font-mono">{formatElevation(maxElev - 20)}</span>
          </span>
        </div>
      </div>

      <div className="flex-1 w-full min-h-[140px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={chartData}
            margin={{ top: 10, right: 15, left: 0, bottom: 0 }}
            onMouseMove={(e) => {
              if (e && e.activePayload && e.activePayload[0]) {
                const pt = e.activePayload[0].payload;
                if (onHoverPoint) {
                  onHoverPoint(pt);
                }
              }
            }}
          >
            <defs>
              <linearGradient id="elevationGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stop-color="#0071E3" stopOpacity={0.6} />
                <stop offset="95%" stop-color="#C1440E" stopOpacity={0.05} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />

            <XAxis
              dataKey="distanceKm"
              tick={{ fill: '#86868B', fontSize: 10 }}
              tickFormatter={(v) => `${v} km`}
              axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
            />

            <YAxis
              domain={[minElev, maxElev]}
              tick={{ fill: '#86868B', fontSize: 10 }}
              tickFormatter={(v) => `${v}m`}
              axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
              width={50}
            />

            <Tooltip content={<CustomTooltip />} />

            {hoveredPoint && hoveredPoint.distanceKm !== undefined && (
              <ReferenceLine
                x={hoveredPoint.distanceKm}
                stroke="#FF9F0A"
                strokeWidth={1.5}
                strokeDasharray="3 3"
              />
            )}

            <Area
              type="monotone"
              dataKey="elevation"
              stroke="#0071E3"
              strokeWidth={2.5}
              fillOpacity={1}
              fill="url(#elevationGrad)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
