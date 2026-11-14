import React from 'react';

export function SegmentControl({ options, value, onChange, className = '' }) {
  return (
    <div
      className={`inline-flex items-center p-1 bg-[#161617]/90 backdrop-blur-md rounded-full border border-white/10 ${className}`}
    >
      {options.map((opt) => {
        const isActive = opt.id === value;
        const Icon = opt.icon;
        return (
          <button
            key={opt.id}
            type="button"
            onClick={() => onChange(opt.id)}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-medium transition-all duration-200 ${
              isActive
                ? 'bg-[#0071E3] text-white shadow-apple-glow'
                : 'text-[#86868B] hover:text-[#F5F5F7] hover:bg-white/5'
            }`}
          >
            {Icon && <Icon size={14} />}
            <span>{opt.label}</span>
          </button>
        );
      })}
    </div>
  );
}
