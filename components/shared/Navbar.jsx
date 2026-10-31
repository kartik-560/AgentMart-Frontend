'use client';

import React from 'react';
import { useSocketContext } from '../../context/SocketContext';
import { useBusiness } from '../../context/BusinessContext';
import { formatINR } from '../../utils/formatters';
import { ShieldAlert, Radio, Landmark } from 'lucide-react';

export default function Navbar() {
  const { isConnected } = useSocketContext() || {};
  const { profile } = useBusiness() || {};

  return (
    <header className="h-16 border-b border-slate-800/80 bg-slate-950/60 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-20">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 text-sm text-slate-300 font-medium">
          <Landmark className="w-4 h-4 text-indigo-400" />
          <span>{profile?.name || 'Apex Retail Enterprises'}</span>
        </div>
        <span className="text-slate-600">|</span>
        <div className="text-xs text-slate-400">
          Budget Ceiling: <span className="text-emerald-400 font-mono font-semibold">{formatINR(profile?.budgetLimit || 50000)}</span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Socket status */}
        <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800 text-xs">
          <Radio className={`w-3.5 h-3.5 ${isConnected ? 'text-emerald-400 animate-pulse' : 'text-rose-500'}`} />
          <span className="text-slate-300 font-mono text-[11px]">
            {isConnected ? 'LIVE FEED ACTIVE' : 'RECONNECTING...'}
          </span>
        </div>

        {/* Zero-Trust Badge */}
        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-950/50 border border-indigo-800/50 text-[11px] text-indigo-300 font-mono">
          <ShieldAlert className="w-3.5 h-3.5 text-indigo-400" />
          <span>Zero-Trust Protocol v1.0</span>
        </div>
      </div>
    </header>
  );
}

