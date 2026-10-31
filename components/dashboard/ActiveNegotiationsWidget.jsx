'use client';

import React from 'react';
import Card from '../shared/Card';
import StatusBadge from '../shared/StatusBadge';
import Button from '../shared/Button';
import Link from 'next/link';
import { formatINR } from '../../utils/formatters';
import { ArrowRight, Clock, Box, Play, CheckCircle2 } from 'lucide-react';

export default function ActiveNegotiationsWidget({ negotiations = [] }) {
  return (
    <Card
      title="Active Multi-Agent Negotiations"
      subtitle="Autonomous sessions across competing suppliers"
      headerAction={
        <Link href="/negotiation">
          <Button variant="outline" size="sm" className="gap-1.5 text-xs">
            Enter Live Room <ArrowRight className="w-3.5 h-3.5" />
          </Button>
        </Link>
      }
    >
      <div className="space-y-3">
        {negotiations.length === 0 ? (
          <p className="text-sm text-slate-400 py-6 text-center">No active negotiation sessions.</p>
        ) : (
          negotiations.map((item) => (
            <div
              key={item.id}
              className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 hover:border-slate-700/80 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3.5"
            >
              <div className="flex items-start gap-3">
                <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 shrink-0 mt-0.5">
                  <Box className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-xs sm:text-sm font-semibold text-slate-100">{item.title}</h4>
                  </div>
                  <div className="flex flex-wrap items-center gap-2.5 text-xs text-slate-400 mt-1 font-mono">
                    <span className="text-indigo-400 font-semibold">Round {item.currentRound || 2}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-500" /> Max {item.maxDeliveryHours || 48}h SLA
                    </span>
                    <span>•</span>
                    <span className="text-emerald-400">Budget: {formatINR(item.maxBudget || 50000)}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                <StatusBadge status={item.status || 'PENDING_HUMAN_APPROVAL'} size="xs" />
                <Link href={`/negotiation?id=${item.id}`}>
                  <Button variant="primary" size="sm" className="text-xs gap-1.5">
                    <Play className="w-3 h-3" /> Live Feed
                  </Button>
                </Link>
              </div>
            </div>
          ))
        )}
      </div>
    </Card>
  );
}
