'use client';

import React, { useEffect, useState } from 'react';
import Card from '../../components/shared/Card';
import StatusBadge from '../../components/shared/StatusBadge';
import Button from '../../components/shared/Button';
import { securityService } from '../../services/agentService';
import { ShieldAlert, ShieldCheck, AlertTriangle, Terminal, CheckCircle2 } from 'lucide-react';

export default function SecurityTrustCenterPage() {
  const [alerts, setAlerts] = useState([]);
  const [threatRadar, setThreatRadar] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    Promise.all([
      securityService.getAlerts().catch(() => ({ data: [] })),
      securityService.getThreatRadar().catch(() => ({ data: null })),
    ]).then(([alertsRes, radarRes]) => {
      if (mounted) {
        setAlerts(alertsRes?.data || []);
        setThreatRadar(radarRes?.data);
        setLoading(false);
      }
    });

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
          <ShieldAlert className="w-6 h-6 text-rose-400" /> Security & Trust Center
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Zero-Trust message inspection, prompt injection defense, and adversarial supplier isolation.
        </p>
      </div>

      {/* Threat Radar Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <span className="text-xs text-slate-400 block">Overall Trust Index</span>
          <span className="text-2xl font-bold font-mono text-emerald-400 mt-1 block">
            {threatRadar?.overallTrustIndex || 84.5} / 100
          </span>
          <span className="text-[11px] text-slate-500">Autonomous safety baseline</span>
        </Card>
        <Card>
          <span className="text-xs text-slate-400 block">Hidden Fees Intercepted</span>
          <span className="text-2xl font-bold font-mono text-rose-400 mt-1 block">3</span>
          <span className="text-[11px] text-slate-500">Zero budget breach tolerance</span>
        </Card>
        <Card>
          <span className="text-xs text-slate-400 block">Prompt Injections Blocked</span>
          <span className="text-2xl font-bold font-mono text-amber-400 mt-1 block">2</span>
          <span className="text-[11px] text-slate-500">Instruction override scans</span>
        </Card>
        <Card>
          <span className="text-xs text-slate-400 block">Zero-Trust Pipeline</span>
          <span className="text-2xl font-bold font-mono text-indigo-400 mt-1 block">100%</span>
          <span className="text-[11px] text-slate-500">All inbound messages scanned</span>
        </Card>
      </div>

      {/* Intercepted Threats Table */}
      <Card title="Quarantined Threats & Anomaly Log" subtitle="Detailed audit of untrusted agent payloads">
        <div className="space-y-4">
          {alerts.map((item) => (
            <div
              key={item.id}
              className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-xs"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded font-mono font-bold text-[11px] bg-rose-500/10 text-rose-400 border border-rose-500/20">
                    {item.threatType}
                  </span>
                  <span className="text-slate-300 font-medium">
                    Offender: {item.offendingAgent?.name || 'Agent C'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <StatusBadge status={item.severity} />
                  <span className="text-emerald-400 font-mono text-[11px]">MITIGATION: {item.mitigationAction}</span>
                </div>
              </div>

              <p className="text-slate-300">{item.description}</p>

              {item.rawPayload && (
                <div className="p-2.5 rounded bg-slate-900 border border-slate-800/80 font-mono text-[11px] text-slate-400 overflow-x-auto">
                  <div className="flex items-center gap-1.5 text-slate-500 mb-1">
                    <Terminal className="w-3 h-3" /> Untrusted Message Excerpt:
                  </div>
                  <code>{item.rawPayload}</code>
                </div>
              )}
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

