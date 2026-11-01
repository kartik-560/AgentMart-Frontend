'use client';

import React from 'react';
import Card from '../shared/Card';
import StatusBadge from '../shared/StatusBadge';
import Link from 'next/link';
import Button from '../shared/Button';
import { ShieldAlert, ArrowRight, AlertTriangle } from 'lucide-react';

export default function RecentAlertsWidget({ alerts = [], loading = false }) {
  return (
    <Card
      title="Security & Trust Interceptions"
      subtitle="Adversarial anomalies quarantined by Zero-Trust scanner"
      headerAction={
        <Link href="/security">
          <Button variant="outline" size="sm" className="gap-1.5 text-xs py-1 px-2.5">
            Trust Radar <ArrowRight className="w-3.5 h-3.5" />
          </Button>
        </Link>
      }
    >
      {/* Loader state if data is still fetching */}
      {loading ? (
        <div className="space-y-3 py-1">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="p-3.5 rounded-xl bg-[#faf7ee] border border-[#1e3a8a]/15 animate-pulse flex items-start gap-3"
            >
              <div className="w-8 h-8 rounded-xl bg-[#f4efe3] shrink-0 mt-0.5" />
              <div className="flex-1 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="h-3.5 bg-[#f4efe3] rounded w-1/3" />
                  <div className="h-3.5 bg-[#f4efe3] rounded w-16" />
                </div>
                <div className="h-3 bg-[#f4efe3] rounded w-4/5" />
                <div className="h-2.5 bg-[#f4efe3] rounded w-1/2" />
              </div>
            </div>
          ))}
          <div className="text-center py-2 text-[11px] text-[#1e3a8a] font-mono flex items-center justify-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#1d4ed8] animate-ping" />
            <span>Scanning real-time Zero-Trust telemetry...</span>
          </div>
        </div>
      ) : (
        <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1 custom-scrollbar">
          {alerts.length === 0 ? (
            <div className="text-center py-8 px-4 rounded-xl bg-[#faf7ee] border border-[#1e3a8a]/20 space-y-1.5">
              <ShieldAlert className="w-7 h-7 text-[#1d4ed8] mx-auto" />
              <p className="text-xs font-bold text-[#172554]">Zero Threat Anomalies Detected</p>
              <p className="text-[11px] text-[#1e3a8a]">
                Zero-Trust filters active. Prompt injections and hidden fees are continually quarantined.
              </p>
            </div>
          ) : (
            alerts.map((alert) => (
              <div
                key={alert.id}
                className="p-3 rounded-xl bg-[#faf7ee] border border-[#172554]/25 hover:border-[#1d4ed8] transition-all flex items-start gap-3 text-xs text-[#172554] shadow-xs"
              >
                <div className="p-2 rounded-xl bg-[#f4efe3] text-[#1d4ed8] border border-[#1e3a8a]/20 shrink-0 mt-0.5">
                  <AlertTriangle className="w-4 h-4 text-[#1d4ed8]" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono font-bold text-[#172554] text-[11px] px-1.5 py-0.2 bg-[#f4efe3] rounded border border-[#1e3a8a]/20">
                      {alert.threatType}
                    </span>
                    <StatusBadge status={alert.severity || 'HIGH'} size="xs" />
                  </div>
                  <p className="text-[#172554] mt-1 line-clamp-2 leading-relaxed text-[11px]">
                    {alert.description}
                  </p>
                  <div className="mt-1.5 flex items-center justify-between text-[10px] text-[#1e3a8a] font-mono">
                    <span className="truncate max-w-[65%]">
                      Offender: {alert.offendingAgent?.name || 'Seller Agent C (ShadowBot)'}
                    </span>
                    <span className="text-[#1d4ed8] font-bold shrink-0">AUTO-REJECTED</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </Card>
  );
}
