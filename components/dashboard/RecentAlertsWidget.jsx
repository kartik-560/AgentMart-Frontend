'use client';

import React from 'react';
import Card from '../shared/Card';
import StatusBadge from '../shared/StatusBadge';
import Link from 'next/link';
import Button from '../shared/Button';
import { ShieldAlert, ArrowRight, AlertTriangle } from 'lucide-react';

export default function RecentAlertsWidget({ alerts = [] }) {
  return (
    <Card
      title="Security & Trust Interceptions"
      subtitle="Adversarial anomalies quarantined in real-time"
      headerAction={
        <Link href="/security">
          <Button variant="outline" size="sm" className="gap-1.5 text-xs">
            Trust Center <ArrowRight className="w-3.5 h-3.5" />
          </Button>
        </Link>
      }
    >
      <div className="space-y-3">
        {alerts.length === 0 ? (
          <p className="text-sm text-slate-400 py-4 text-center">Zero threat anomalies detected.</p>
        ) : (
          alerts.map((alert) => (
            <div
              key={alert.id}
              className="p-3.5 rounded-lg bg-rose-950/20 border border-rose-900/40 flex items-start gap-3"
            >
              <div className="p-2 rounded-lg bg-rose-500/10 text-rose-400 shrink-0 mt-0.5">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="text-xs font-semibold text-rose-300 font-mono">{alert.threatType}</h4>
                  <StatusBadge status={alert.severity || 'CRITICAL'} />
                </div>
                <p className="text-xs text-slate-300 mt-1 line-clamp-2">{alert.description}</p>
                <div className="mt-1.5 text-[11px] text-slate-400 font-mono">
                  Offender: {alert.offendingAgent?.name || 'Seller Agent C (ShadowBot)'}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </Card>
  );
}

