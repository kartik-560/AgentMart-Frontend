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
import { useAuth } from '../context/AuthContext';
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
  const { isSeller, isAuthenticated, isLoading } = useAuth();
  const [negotiations, setNegotiations] = useState([]);

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.replace('/login');
      } else if (isSeller) {
        router.replace('/seller/dashboard');
      }
    }
  }, [isAuthenticated, isSeller, isLoading, router]);
  const [transactions, setTransactions] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // New RFQ Modal State
  const [isRfqModalOpen, setIsRfqModalOpen] = useState(false);
  const [rfqSku, setRfqSku] = useState('ELEC-RT-001');
  const [rfqQuantity, setRfqQuantity] = useState(12);
  const [rfqBudget, setRfqBudget] = useState(25000);
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
        const prods = prodRes?.data?.products || [];
        setProducts(prods);
        if (prods.length > 0) {
          const firstProd = prods.find((p) => p.sku === rfqSku) || prods[0];
          setRfqSku(firstProd.sku);
          const unitCost = Number(firstProd.baseCostPrice || 2500);
          setRfqBudget(Math.round(unitCost * 12 * 1.1));
        }
        setLoading(false);
      }
    });

    return () => {
      mounted = false;
    };
  }, []);

  const handleSkuChange = (sku) => {
    setRfqSku(sku);
    const prod = products.find((p) => p.sku === sku);
    if (prod) {
      const unitCost = Number(prod.baseCostPrice || 2500);
      setRfqBudget(Math.round(unitCost * Number(rfqQuantity || 12) * 1.1));
    }
  };

  const handleQuantityChange = (qty) => {
    setRfqQuantity(qty);
    const prod = products.find((p) => p.sku === rfqSku) || products[0];
    const unitCost = Number(prod?.baseCostPrice || 2500);
    setRfqBudget(Math.round(unitCost * Number(qty || 0) * 1.1));
  };

  const handleOpenRfqModal = () => {
    const targetSku = rfqSku || products[0]?.sku || 'ELEC-RT-001';
    const prod = products.find((p) => p.sku === targetSku) || products[0];
    const qty = 12;
    setRfqSku(targetSku);
    setRfqQuantity(qty);
    if (prod) {
      const unitCost = Number(prod.baseCostPrice || 2500);
      setRfqBudget(Math.round(unitCost * qty * 1.1));
    }
    setIsRfqModalOpen(true);
  };

  const pendingDeals = transactions.filter((t) => t.settlementStatus === 'PENDING_APPROVAL');
  const settledTotalSpend = transactions
    .filter((t) => t.settlementStatus === 'SETTLED')
    .reduce((acc, t) => acc + Number(t.settlementAmount || 0), 0);
  const activeNegotiations = negotiations.filter((n) => n.status !== 'APPROVED' && n.status !== 'SETTLED');

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
    <div className="space-y-4">
      {/* Top Banner - Compact Solid Royal Blue & Light Cream */}
      <div className="px-4 py-3 sm:px-5 sm:py-3.5 rounded-xl bg-[#fffdf9] border border-[#1e3a8a]/20 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 shadow-xs text-[#172554]">
        <div className="space-y-0.5 max-w-3xl">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-lg sm:text-xl font-black text-[#172554] tracking-tight">
              Procurement Operations Command Center
            </h1>
            <span className="inline-flex items-center px-2 py-0.5 rounded bg-[#f4efe3] border border-[#1e3a8a]/25 text-[#1e3a8a] text-[10px] font-mono font-bold uppercase tracking-wider">
              Autonomous B2B Protocol
            </span>
          </div>
          <p className="text-xs text-[#1e3a8a]/80 leading-normal">
            Autonomous buyer and seller agents conduct multi-attribute commercial negotiations governed by deterministic financial boundaries.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <Button
            variant="primary"
            size="sm"
            onClick={handleOpenRfqModal}
            className="gap-1.5 text-xs font-bold py-1.5 px-3"
          >
            <PlusCircle className="w-3.5 h-3.5" /> Launch New RFQ
          </Button>

          {pendingDeals.length > 0 ? (
            <Link href={`/approvals?id=${pendingDeals[0].id}`}>
              <Button variant="secondary" size="sm" className="gap-1.5 text-xs font-bold py-1.5 px-3">
                <ShieldCheck className="w-3.5 h-3.5" /> {pendingDeals.length} Deal{pendingDeals.length > 1 ? 's' : ''} Pending Approval
              </Button>
            </Link>
          ) : (
            <Link href="/approvals">
              <Button variant="outline" size="sm" className="gap-1.5 text-xs text-[#1e3a8a] py-1.5 px-3">
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
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start">
        <ActiveNegotiationsWidget
          negotiations={activeNegotiations}
          loading={loading}
          onOpenRfqModal={handleOpenRfqModal}
        />
        <RecentAlertsWidget
          alerts={alerts}
          loading={loading}
        />
      </div>

      {/* Quick Launch RFQ Modal */}
      <Modal
        isOpen={isRfqModalOpen}
        onClose={() => setIsRfqModalOpen(false)}
        title="Launch Autonomous RFQ Session"
        subtitle="Broadcast RFQ to competing supplier agents"
      >
        <form onSubmit={handleLaunchRfq} className="space-y-4 text-xs">
          <div>
            <label className="block text-xs font-semibold text-[#172554] mb-1">
              Select Target Product SKU
            </label>
            <select
              value={rfqSku}
              onChange={(e) => handleSkuChange(e.target.value)}
              className="w-full px-3 py-2 bg-[#fffdf9] border border-[#1e3a8a]/30 rounded-lg text-[#172554] text-xs focus:outline-none focus:border-[#1d4ed8]"
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
              <label className="block text-xs font-semibold text-[#172554] mb-1">
                Target Quantity (Units)
              </label>
              <input
                type="number"
                min="1"
                max="500"
                value={rfqQuantity}
                onChange={(e) => handleQuantityChange(e.target.value)}
                className="w-full px-3 py-2 bg-[#fffdf9] border border-[#1e3a8a]/30 rounded-lg text-[#172554] text-xs focus:outline-none focus:border-[#1d4ed8] font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#172554] mb-1">
                Budget Ceiling (INR)
              </label>
              <input
                type="number"
                value={rfqBudget}
                onChange={(e) => setRfqBudget(e.target.value)}
                className="w-full px-3 py-2 bg-[#fffdf9] border border-[#1e3a8a]/30 rounded-lg text-[#1d4ed8] text-xs font-mono font-bold focus:outline-none focus:border-[#1d4ed8]"
              />
              <span className="text-[10px] text-[#1e3a8a]">
                {Number(rfqBudget) > (profile?.budgetLimit || 50000) ? (
                  <span className="text-[#172554] font-semibold">Exceeds Enterprise Cap ({formatINR(profile?.budgetLimit || 50000)})</span>
                ) : (
                  <span>+10% buffer included • Within Enterprise Cap</span>
                )}
              </span>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-[#f4efe3] border border-[#1e3a8a]/20 text-[#172554] text-[11px] leading-relaxed">
            <strong>Autonomous Multi-Agent Handshake:</strong> Upon broadcast, Buyer Agent will solicit bids simultaneously from Seller A (Wholesale Price), Seller B (Express SLA), and scan Seller C through Zero-Trust filters.
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
