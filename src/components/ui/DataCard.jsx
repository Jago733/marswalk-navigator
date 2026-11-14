import React from 'react';

export function DataCard({
  title,
  value,
  unit,
  subtext,
  icon: Icon,
  trend,
  className = '',
  action,
}) {
  return (
    <div
      className={`bg-[#1D1D1F]/80 backdrop-blur-xl border border-white/10 rounded-[18px] p-4 shadow-apple-card transition-all duration-200 hover:border-white/20 hover:bg-[#1D1D1F] ${className}`}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-[12px] font-medium tracking-wide text-[#86868B] uppercase">
          {title}
        </span>
        {Icon && (
          <div className="w-7 h-7 rounded-full bg-white/5 flex items-center justify-center text-[#F5F5F7]">
            <Icon size={15} />
          </div>
        )}
      </div>

      <div className="flex items-baseline gap-1.5">
        <span className="text-2xl font-semibold tracking-tight text-[#F5F5F7]">
          {value}
        </span>
        {unit && (
          <span className="text-sm font-medium text-[#86868B]">
            {unit}
          </span>
        )}
      </div>

      {(subtext || trend || action) && (
        <div className="mt-2 pt-2 border-t border-white/5 flex items-center justify-between text-xs text-[#86868B]">
          {subtext && <span>{subtext}</span>}
          {action}
        </div>
      )}
    </div>
  );
}
