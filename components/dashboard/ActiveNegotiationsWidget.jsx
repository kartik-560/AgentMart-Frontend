'use client';

import React from 'react';
import Card from '../shared/Card';
import StatusBadge from '../shared/StatusBadge';
import Button from '../shared/Button';
import Link from 'next/link';
import { formatINR } from '../../utils/formatters';
import { ArrowRight, Clock, Box } from 'lucide-react';

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
          <p className="text-sm text-slate-400 py-4 text-center">No active negotiation sessions.</p>
        ) : (
          negotiations.map((item) => (
            <div
              key={item.id}
              className="p-3.5 rounded-lg bg-slate-950/50 border border-slate-800/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
            >
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 mt-0.5">
                  <Box className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-slate-100">{item.title}</h4>
                  <div className="flex items-center gap-3 text-xs text-slate-400 mt-1">
                    <span>Round {item.currentRound || 1}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-500" /> Max {item.maxDeliveryHours || 48}h SLA
                    </span>
                    <span>•</span>
                    <span className="font-mono text-emerald-400">Ceiling: {formatINR(item.maxBudget || 50000)}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 self-end sm:self-center">
                <StatusBadge status={item.status} />
                <Link href={`/negotiation?id=${item.id}`}>
                  <Button variant="secondary" size="sm" className="text-xs">
                    Inspect Session
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

