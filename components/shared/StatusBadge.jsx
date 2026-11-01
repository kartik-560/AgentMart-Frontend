'use client';

import React from 'react';

export default function StatusBadge({ status, label, pulse = false, size = 'sm' }) {
  const normalized = status ? String(status).toUpperCase() : 'PENDING';
  const displayLabel = label || status?.replace(/_/g, ' ');

  const sizeClass = size === 'xs' ? 'px-2 py-0.5 text-[10px] gap-1' : 'px-2.5 py-0.5 text-xs gap-1.5';

  return (
    <span
      className={`inline-flex items-center rounded-md font-semibold font-mono tracking-tight shrink-0 select-none bg-[#f4efe3] text-[#1e3a8a] border border-[#1e3a8a]/30 ${sizeClass}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-[#1d4ed8] shrink-0" />
      <span>{displayLabel}</span>
    </span>
  );
}
