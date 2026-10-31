'use client';

import React from 'react';

const BADGE_STYLES = {
  ACTIVE: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
  SETTLED: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
  ACCEPTED: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
  CLEAN: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
  VERIFIED: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
  LOW: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',

  PENDING: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
  PENDING_APPROVAL: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
  PENDING_HUMAN_APPROVAL: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
  SOLICITING_BIDS: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
  INITIATED: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30',
  IN_PROGRESS: 'bg-blue-500/10 text-blue-400 border-blue-500/30',

  FLAGGED: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
  FLAGGED_HIDDEN_FEE: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
  SUSPENDED: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
  REJECTED: 'bg-slate-500/10 text-slate-400 border-slate-500/30',
  HIGH: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
  CRITICAL: 'bg-rose-600/20 text-rose-300 border-rose-500/50',
};

export default function StatusBadge({ status, label, pulse = true, size = 'sm' }) {
  const normalized = status ? String(status).toUpperCase() : 'PENDING';
  const style = BADGE_STYLES[normalized] || 'bg-slate-500/10 text-slate-300 border-slate-500/30';

  const sizeClass = size === 'xs' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-0.5 text-xs';

  return (
    <span className={`inline-flex items-center rounded-full font-medium border font-mono ${sizeClass} ${style}`}>
      {pulse && (
        <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5 animate-pulse shrink-0" />
      )}
      {label || status?.replace(/_/g, ' ')}
    </span>
  );
}
