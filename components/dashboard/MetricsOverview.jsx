'use client';

import React from 'react';
import Card from '../shared/Card';
import { formatINR } from '../../utils/formatters';
import { Wallet, TrendingUp, ShieldAlert, Award, ArrowUpRight, ArrowDownRight } from 'lucide-react';

export default function MetricsOverview({ metrics = {} }) {
  const cards = [
    {
      title: 'Procurement Budget Ceiling',
      value: formatINR(metrics.budgetCap || 50000),
      subtitle: 'Deterministic hard limit',
      delta: '₹5,600 Headroom',
      deltaType: 'positive',
      icon: Wallet,
      color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20',
      sparkline: [30, 40, 35, 50, 49, 60, 44],
      strokeColor: '#818cf8',
    },
    {
      title: 'Target Resale Margin',
      value: `${metrics.targetMargin || 25.0}%`,
      subtitle: 'Minimum floor: 18.0%',
      delta: '+2.4% vs benchmark',
      deltaType: 'positive',
      icon: TrendingUp,
      color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
      sparkline: [18, 20, 22, 23, 24, 24.5, 25],
      strokeColor: '#34d399',
    },
    {
      title: 'Adversarial Threats Quarantined',
      value: metrics.threatsCount || 3,
      subtitle: 'Disguised fees & injections',
      delta: '100% Intercepted',
      deltaType: 'neutral',
      icon: ShieldAlert,
      color: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
      sparkline: [1, 2, 0, 1, 3, 2, 3],
      strokeColor: '#f43f5e',
    },
    {
      title: 'Supplier Trust Index',
      value: '86.8 / 100',
      subtitle: 'Learned Business Memory',
      delta: '+4.2 pts this month',
      deltaType: 'positive',
      icon: Award,
      color: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
      sparkline: [75, 78, 80, 82, 84, 85, 86.8],
      strokeColor: '#fbbf24',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((item, idx) => {
        const Icon = item.icon;
        return (
          <Card key={idx} className="relative overflow-hidden group hover:border-slate-700/80 transition-all">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium text-slate-400">{item.title}</p>
                <h4 className="text-2xl font-bold text-slate-100 mt-1 font-mono tracking-tight">
                  {item.value}
                </h4>
              </div>
              <div className={`p-2.5 rounded-xl border ${item.color}`}>
                <Icon className="w-5 h-5" />
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
              <span className="text-slate-400">{item.subtitle}</span>
              <span
                className={`font-mono font-medium flex items-center gap-0.5 ${
                  item.deltaType === 'positive'
                    ? 'text-emerald-400'
                    : item.deltaType === 'negative'
                    ? 'text-rose-400'
                    : 'text-indigo-400'
                }`}
              >
                {item.deltaType === 'positive' && <ArrowUpRight className="w-3 h-3" />}
                {item.delta}
              </span>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
