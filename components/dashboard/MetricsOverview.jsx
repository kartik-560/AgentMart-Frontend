'use client';

import React from 'react';
import { formatINR } from '../../utils/formatters';
import { Wallet, TrendingUp, ShieldAlert, Award, ArrowUpRight } from 'lucide-react';

export default function MetricsOverview({ metrics = {} }) {
  const cards = [
    {
      title: 'Procurement Budget Ceiling',
      value: formatINR(metrics.budgetCap || 50000),
      subtitle: 'Deterministic hard limit',
      delta: '₹5,600 Headroom',
      icon: Wallet,
    },
    {
      title: 'Target Resale Margin',
      value: `${metrics.targetMargin || 25.0}%`,
      subtitle: 'Minimum floor: 18.0%',
      delta: '+2.4% vs benchmark',
      icon: TrendingUp,
    },
    {
      title: 'Adversarial Threats Quarantined',
      value: metrics.threatsCount || 3,
      subtitle: 'Disguised fees & injections',
      delta: '100% Intercepted',
      icon: ShieldAlert,
    },
    {
      title: 'Supplier Trust Index',
      value: '86.8 / 100',
      subtitle: 'Learned Business Memory',
      delta: '+4.2 pts this month',
      icon: Award,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
      {cards.map((item, idx) => {
        const Icon = item.icon;
        return (
          <div
            key={idx}
            className="relative overflow-hidden group hover:border-[#1d4ed8] transition-all bg-[#fffdf9] border border-[#1e3a8a]/20 rounded-xl px-4 py-2.5 shadow-xs text-[#172554]"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] font-semibold text-[#1e3a8a]">{item.title}</p>
                <h4 className="text-xl font-black text-[#172554] mt-0.5 font-mono tracking-tight leading-tight">
                  {item.value}
                </h4>
              </div>
              <div className="p-1.5 rounded-lg border border-[#1e3a8a]/20 bg-[#f4efe3] text-[#1d4ed8] shrink-0">
                <Icon className="w-4 h-4 text-[#1d4ed8]" />
              </div>
            </div>

            <div className="mt-2 pt-1.5 border-t border-[#1e3a8a]/15 flex items-center justify-between text-[10px]">
              <span className="text-[#1e3a8a] truncate max-w-[55%]">{item.subtitle}</span>
              <span className="font-mono font-bold flex items-center gap-0.5 text-[#1d4ed8] shrink-0">
                <ArrowUpRight className="w-2.5 h-2.5 text-[#1d4ed8]" />
                {item.delta}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
