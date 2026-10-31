'use client';

import React from 'react';

const BADGE_STYLES = {
  ACTIVE: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
  SETTLED: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
  ACCEPTED: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
  PENDING: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
  PENDING_APPROVAL: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
  IN_PROGRESS: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
  FLAGGED: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
  SUSPENDED: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
  REJECTED: 'bg-slate-500/10 text-slate-400 border-slate-500/30',
};

export default function StatusBadge({ status, label }) {
  const normalized = status ? status.toUpperCase() : 'PENDING';
  const style = BADGE_STYLES[normalized] || 'bg-slate-500/10 text-slate-300 border-slate-500/30';

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${style}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5 animate-pulse" />
      {label || status?.replace(/_/g, ' ')}
    </span>
  );
}

