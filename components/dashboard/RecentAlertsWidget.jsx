'use client';

import React from 'react';
import Card from '../shared/Card';
import StatusBadge from '../shared/StatusBadge';
import Link from 'next/link';
import Button from '../shared/Button';
import { ShieldAlert, ArrowRight, AlertTriangle, Terminal } from 'lucide-react';

export default function RecentAlertsWidget({ alerts = [] }) {
  return (
    <Card
      title="Security & Trust Interceptions"
      subtitle="Adversarial anomalies quarantined by Zero-Trust scanner"
      headerAction={
        <Link href="/security">
          <Button variant="outline" size="sm" className="gap-1.5 text-xs">
            Trust Radar <ArrowRight className="w-3.5 h-3.5" />
          </Button>
        </Link>
      }
    >
      <div className="space-y-3">
        {alerts.length === 0 ? (
          <p className="text-sm text-slate-400 py-6 text-center">Zero threat anomalies detected.</p>
        ) : (
          alerts.map((alert) => (
            <div
              key={alert.id}
              className="p-3.5 rounded-xl bg-rose-950/20 border border-rose-900/40 hover:border-rose-800/60 transition-all flex items-start gap-3 text-xs"
            >
              <div className="p-2 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20 shrink-0 mt-0.5">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono font-bold text-rose-300 text-[11px] px-1.5 py-0.2 bg-rose-500/10 rounded border border-rose-500/20">
                    {alert.threatType}
                  </span>
                  <StatusBadge status={alert.severity || 'HIGH'} size="xs" />
                </div>
                <p className="text-slate-300 mt-1 line-clamp-2 leading-relaxed">
                  {alert.description}
                </p>
                <div className="mt-2 flex items-center justify-between text-[10px] text-slate-400 font-mono">
                  <span>Offender: {alert.offendingAgent?.name || 'Seller Agent C (ShadowBot)'}</span>
                  <span className="text-emerald-400 font-semibold">AUTO-REJECTED</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </Card>
  );
}
