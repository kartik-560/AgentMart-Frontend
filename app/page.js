'use client';

import React, { useEffect, useState } from 'react';
import MetricsOverview from '../components/dashboard/MetricsOverview';
import ActiveNegotiationsWidget from '../components/dashboard/ActiveNegotiationsWidget';
import RecentAlertsWidget from '../components/dashboard/RecentAlertsWidget';
import Modal from '../components/shared/Modal';
import Button from '../components/shared/Button';
import Card from '../components/shared/Card';
import { BudgetAllocationBar } from '../components/shared/Charts';
import { negotiationService } from '../services/negotiationService';
import { securityService, productService } from '../services/agentService';
import { transactionService } from '../services/transactionService';
import { useBusiness } from '../context/BusinessContext';
import { useUI } from '../context/UIContext';
import { formatINR } from '../utils/formatters';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Sparkles,
  ShoppingCart,
  ShieldCheck,
  PlusCircle,
  Building2,
  CheckCircle2,
  ArrowRight,
  TrendingUp,
  Cpu,
} from 'lucide-react';

export default function DashboardPage() {
  const router = useRouter();
  const { showToast } = useUI();
  const { profile } = useBusiness();
  const [negotiations, setNegotiations] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // New RFQ Modal State
  const [isRfqModalOpen, setIsRfqModalOpen] = useState(false);
  const [rfqSku, setRfqSku] = useState('ELEC-RT-001');
  const [rfqQuantity, setRfqQuantity] = useState(12);
  const [rfqBudget, setRfqBudget] = useState(profile?.budgetLimit || 50000);
  const [creatingRfq, setCreatingRfq] = useState(false);

  useEffect(() => {
    let mounted = true;
    Promise.all([
      negotiationService.getAll().catch(() => ({ data: [] })),
      transactionService.getAll().catch(() => ({ data: [] })),
      securityService.getAlerts().catch(() => ({ data: [] })),
      productService.getAll().catch(() => ({ data: { products: [] } })),
    ]).then(([negRes, txRes, secRes, prodRes]) => {
      if (mounted) {
        setNegotiations(negRes?.data || []);
        setTransactions(txRes?.data || []);
        setAlerts(secRes?.data || []);
        setProducts(prodRes?.data?.products || []);
        setLoading(false);
      }
    });

    return () => {
      mounted = false;
    };
  }, []);

  const pendingDeals = transactions.filter((t) => t.settlementStatus === 'PENDING_APPROVAL');
  const settledTotalSpend = transactions
    .filter((t) => t.settlementStatus === 'SETTLED')
    .reduce((acc, t) => acc + Number(t.settlementAmount || 0), 0);

  const handleLaunchRfq = async (e) => {
    e.preventDefault();
    setCreatingRfq(true);
    try {
      const selectedProd = products.find((p) => p.sku === rfqSku) || products[0];
      const res = await negotiationService.create({
        targetProductId: selectedProd?.id || 'prod-01',
        targetQuantity: Number(rfqQuantity),
        maxBudget: Number(rfqBudget),
        maxDeliveryHours: 48,
        targetResaleMargin: 25,
      });

      const newId = res?.data?.id;
      showToast('Autonomous Multi-Agent RFQ broadcast successfully!', 'success');
      setIsRfqModalOpen(false);
      router.push(newId ? `/negotiation?id=${newId}` : '/negotiation');
    } catch {
      showToast('Initialized simulated negotiation session.', 'info');
      setIsRfqModalOpen(false);
      router.push('/negotiation');
    } finally {
      setCreatingRfq(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-indigo-950/80 via-slate-900 to-slate-950 border border-indigo-900/50 flex flex-col md:flex-row items-start md:items-center justify-between gap-5 shadow-xl">
        <div className="space-y-1.5 max-w-3xl">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-mono font-medium">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            Autonomous B2B Multi-Agent Engine (Gemini 2.0)
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Procurement Operations Command Center
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Autonomous buyer and seller agents conduct multi-attribute commercial negotiations governed by deterministic financial boundaries and mandatory human sign-off.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0 w-full sm:w-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsRfqModalOpen(true)}
            className="gap-1.5 text-xs"
          >
            <PlusCircle className="w-3.5 h-3.5" /> Launch New RFQ
          </Button>

          {pendingDeals.length > 0 ? (
            <Link href={`/approvals?id=${pendingDeals[0].id}`}>
              <Button variant="success" size="sm" className="gap-1.5 text-xs shadow-emerald-500/20 shadow-md">
                <ShieldCheck className="w-3.5 h-3.5" /> {pendingDeals.length} Deal{pendingDeals.length > 1 ? 's' : ''} Pending Approval
              </Button>
            </Link>
          ) : (
            <Link href="/approvals">
              <Button variant="outline" size="sm" className="gap-1.5 text-xs text-slate-400">
                <ShieldCheck className="w-3.5 h-3.5" /> 0 Pending Approvals
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* 4 Core KPI Metrics */}
      <MetricsOverview
        metrics={{
          budgetCap: profile?.budgetLimit || 50000,
          targetMargin: profile?.targetResaleMargin || 25.0,
          threatsCount: alerts.length || 3,
        }}
      />

      {/* Budget Allocation Progress Bar */}
      <BudgetAllocationBar currentTotal={settledTotalSpend} budgetCap={profile?.budgetLimit || 50000} />

      {/* 2-Column Split: Active Negotiations & Intercepted Threats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ActiveNegotiationsWidget negotiations={negotiations} />
        <RecentAlertsWidget alerts={alerts} />
      </div>

      {/* Quick Launch RFQ Modal */}
      <Modal
        isOpen={isRfqModalOpen}
        onClose={() => setIsRfqModalOpen(false)}
        title="Launch Autonomous Procurement Negotiation"
        subtitle="Broadcast RFQ to competing supplier agents"
      >
        <form onSubmit={handleLaunchRfq} className="space-y-4 text-xs">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Select Target Product SKU
            </label>
            <select
              value={rfqSku}
              onChange={(e) => setRfqSku(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 text-xs focus:outline-none focus:border-indigo-500"
            >
              {products.map((p) => (
                <option key={p.id || p.sku} value={p.sku}>
                  [{p.sku}] {p.name} - {formatINR(p.baseCostPrice)} base
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Target Quantity (Units)
              </label>
              <input
                type="number"
                min="1"
                max="500"
                value={rfqQuantity}
                onChange={(e) => setRfqQuantity(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 text-xs focus:outline-none focus:border-indigo-500 font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Max Budget Cap (INR)
              </label>
              <input
                type="number"
                
                value={rfqBudget}
                onChange={(e) => setRfqBudget(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-emerald-400 text-xs font-mono font-bold focus:outline-none focus:border-indigo-500"
              />
              <span className="text-[10px] text-emerald-400">Unrestricted Budget</span>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-indigo-950/30 border border-indigo-900/40 text-slate-300 text-[11px] leading-relaxed">
            <strong>Orchestration Protocol:</strong> The autonomous buyer agent will solicit quotes from Prism Wholesale (Agent A), SwiftQuality (Agent B), and monitor ShadowBot (Agent C) through zero-trust filters.
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <Button variant="secondary" size="sm" onClick={() => setIsRfqModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" loading={creatingRfq}>
              Initialize Negotiation Room
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
