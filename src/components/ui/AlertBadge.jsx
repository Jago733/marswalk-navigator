import React from 'react';

export function AlertBadge({ level = 'Seguro', text, size = 'sm' }) {
  const styles = {
    Seguro: 'bg-[#30D158]/15 text-[#30D158] border-[#30D158]/30',
    Moderado: 'bg-[#FF9F0A]/15 text-[#FF9F0A] border-[#FF9F0A]/30',
    Peligroso: 'bg-[#E26D5C]/15 text-[#E26D5C] border-[#E26D5C]/30',
    Crítico: 'bg-[#FF453A]/15 text-[#FF453A] border-[#FF453A]/30',
    info: 'bg-[#0071E3]/15 text-[#0071E3] border-[#0071E3]/30',
  };

  const styleClass = styles[level] || styles.info;
  const sizeClass = size === 'sm' ? 'text-xs px-2.5 py-0.5' : 'text-sm px-3.5 py-1';

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium rounded-full border ${styleClass} ${sizeClass}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
      {text || level}
    </span>
  );
}
