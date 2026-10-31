'use client';

import React, { useEffect, useState } from 'react';
import MetricsOverview from '../components/dashboard/MetricsOverview';
import ActiveNegotiationsWidget from '../components/dashboard/ActiveNegotiationsWidget';
import RecentAlertsWidget from '../components/dashboard/RecentAlertsWidget';
import { negotiationService } from '../services/negotiationService';
import { securityService } from '../services/agentService';
import Button from '../components/shared/Button';
import Link from 'next/link';
import { Sparkles, ShoppingCart, ShieldCheck } from 'lucide-react';

export default function DashboardPage() {
  const [negotiations, setNegotiations] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    Promise.all([
      negotiationService.getAll().catch(() => ({ data: [] })),
      securityService.getAlerts().catch(() => ({ data: [] })),
    ]).then(([negRes, secRes]) => {
      if (mounted) {
        setNegotiations(negRes?.data || []);
        setAlerts(secRes?.data || []);
        setLoading(false);
      }
    });

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-indigo-950/70 via-slate-900 to-slate-950 border border-indigo-900/40 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-medium mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            Autonomous B2B Engine Initialized
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Enterprise Procurement Command Center</h1>
          <p className="text-sm text-slate-300 mt-1 max-w-2xl">
            AI agents represent independent businesses in multi-round negotiations. Governed by deterministic boundaries, zero-trust security heuristics, and mandatory human approval.
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <Link href="/marketplace">
            <Button variant="secondary" className="gap-2">
              <ShoppingCart className="w-4 h-4" /> 40 B2B SKUs
            </Button>
          </Link>
          <Link href="/approvals">
            <Button variant="primary" className="gap-2">
              <ShieldCheck className="w-4 h-4" /> Pending Approvals
            </Button>
          </Link>
        </div>
      </div>

      {/* 4 Core Metrics */}
      <MetricsOverview
        metrics={{
          budgetCap: 50000,
          targetMargin: 25,
          threatsCount: alerts.length || 2,
        }}
      />

      {/* 2-Column Split: Active Negotiations & Intercepted Threats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ActiveNegotiationsWidget negotiations={negotiations} />
        <RecentAlertsWidget alerts={alerts} />
      </div>
    </div>
  );
}

