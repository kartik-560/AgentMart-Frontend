'use client';

import React from 'react';
import Card from '../shared/Card';
import { formatINR } from '../../utils/formatters';
import { Wallet, TrendingUp, ShieldAlert, Award } from 'lucide-react';

export default function MetricsOverview({ metrics = {} }) {
  const cards = [
    {
      title: 'Procurement Budget Cap',
      value: formatINR(metrics.budgetCap || 50000),
      subtitle: 'Strict deterministic ceiling',
      icon: Wallet,
      color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20',
    },
    {
      title: 'Target Resale Margin',
      value: `${metrics.targetMargin || 25}%`,
      subtitle: 'Minimum floor: 18%',
      icon: TrendingUp,
      color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    },
    {
      title: 'Threats Intercepted',
      value: metrics.threatsCount || 2,
      subtitle: 'Hidden fees & prompt injections',
      icon: ShieldAlert,
      color: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
    },
    {
      title: 'Supplier Trust Index',
      value: '84.5 / 100',
      subtitle: 'Learned Business Memory',
      icon: Award,
      color: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((item, idx) => {
        const Icon = item.icon;
        return (
          <Card key={idx} className="relative overflow-hidden">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-slate-400">{item.title}</p>
                <h4 className="text-2xl font-bold text-slate-100 mt-1 font-mono">{item.value}</h4>
                <p className="text-[11px] text-slate-500 mt-0.5">{item.subtitle}</p>
              </div>
              <div className={`p-3 rounded-xl border ${item.color}`}>
                <Icon className="w-5 h-5" />
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}

