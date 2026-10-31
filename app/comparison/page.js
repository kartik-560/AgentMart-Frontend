'use client';

import React, { useEffect, useState } from 'react';
import Card from '../../components/shared/Card';
import Button from '../../components/shared/Button';
import StatusBadge from '../../components/shared/StatusBadge';
import { UtilityBreakdownChart } from '../../components/shared/Charts';
import { negotiationService } from '../../services/negotiationService';
import { useUI } from '../../context/UIContext';
import { formatINR, formatPercentage } from '../../utils/formatters';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { transactionService } from '../../services/transactionService';
import {
  Scale,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  Download,
  Sliders,
  Sparkles,
} from 'lucide-react';

function OfferComparisonContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const negotiationId = searchParams.get('id') || searchParams.get('negotiationId');

  const { showToast } = useUI();
  const [comparison, setComparison] = useState(null);
  const [loading, setLoading] = useState(true);
  const [proceeding, setProceeding] = useState(false);

  // Dynamic weight simulation sliders for Decision Engine testing
  const [weights, setWeights] = useState({
    price: 40,
    delivery: 25,
    quality: 20,
    reliability: 15,
  });

  useEffect(() => {
    let mounted = true;

    async function loadComparison() {
      try {
        let targetId = negotiationId;
        if (!targetId) {
          const list = await negotiationService.getAll();
          if (list?.data?.length > 0) {
            targetId = list.data[0].id;
          }
        }
        const res = await negotiationService.getComparison(targetId || 'neg-demo-001');
        if (mounted && res?.data) {
          setComparison(res.data);
        }
      } catch (err) {}
      finally {
        if (mounted) setLoading(false);
      }
    }

    loadComparison();
    return () => {
      mounted = false;
    };
  }, [negotiationId]);

  const handleProceedToApproval = async () => {
    setProceeding(true);
    const currentNegId = negotiationId || comparison?.negotiationId;
    try {
      if (currentNegId) {
        const txRes = await transactionService.create({ negotiationId: currentNegId });
        if (txRes?.data?.id) {
          router.push(`/approvals?id=${txRes.data.id}&negotiationId=${currentNegId}`);
          return;
        }
      }
      router.push(`/approvals${currentNegId ? `?negotiationId=${currentNegId}` : ''}`);
    } catch (err) {
      router.push('/approvals');
    } finally {
      setProceeding(false);
    }
  };

  const offers = comparison?.offers || [
    {
      agentId: 'seller-a-price',
      sellerName: 'Prism Wholesale Direct (Agent A)',
      strategy: 'Low Margin / Wholesale Volume',
      unitPrice: 3700.0,
      quantity: 12,
      totalPrice: 44400.0,
      deliveryHours: 40,
      qualityGrade: 'Enterprise',
      resaleMarginProjected: 24.5,
      utilityScore: 88.5,
      withinBudget: true,
      withinSla: true,
      securityStatus: 'CLEAN',
      isRecommended: true,
      subScores: { price: 93.3, delivery: 83.3, quality: 85.0, reliability: 92.0 },
    },
    {
      agentId: 'seller-b-speed-quality',
      sellerName: 'SwiftQuality Logistics (Agent B)',
      strategy: 'Speed & Premium Quality SLA',
      unitPrice: 3950.0,
      quantity: 12,
      totalPrice: 47400.0,
      deliveryHours: 20,
      qualityGrade: 'Enterprise-Plus',
      resaleMarginProjected: 21.0,
      utilityScore: 85.0,
      withinBudget: true,
      withinSla: true,
      securityStatus: 'CLEAN',
      isRecommended: false,
      subScores: { price: 74.3, delivery: 100.0, quality: 100.0, reliability: 98.0 },
    },
    {
      agentId: 'seller-c-malicious',
      sellerName: 'ShadowBot (Agent C - Adversarial)',
      strategy: 'Adversarial Simulation',
      unitPrice: 3200.0,
      quantity: 12,
      totalPrice: 50400.0, // 3200*12 + 12000 hidden fee
      deliveryHours: 12,
      qualityGrade: 'Uncertified',
      resaleMarginProjected: 5.0,
      utilityScore: 22.0,
      withinBudget: false,
      withinSla: true,
      securityStatus: 'FLAGGED_HIDDEN_FEE',
      isRecommended: false,
      flagReason: 'SecurityEngine flagged: ₹12,000 disguised logistics handling fee.',
      subScores: { price: 0.0, delivery: 100.0, quality: 0.0, reliability: 38.0 },
    },
  ];

  // Dynamic utility score calculator based on weight sliders
  const calculateDynamicScore = (subScores) => {
    if (!subScores) return 0;
    const wP = weights.price / 100;
    const wD = weights.delivery / 100;
    const wQ = weights.quality / 100;
    const wR = weights.reliability / 100;
    const score = (wP * subScores.price) + (wD * subScores.delivery) + (wQ * subScores.quality) + (wR * subScores.reliability);
    return Math.round(score * 10) / 10;
  };

  const getOfferScore = (offer) => {
    if (!offer) return 0;
    if (offer.subScores) {
      const dynamic = calculateDynamicScore(offer.subScores);
      if (dynamic > 0) return dynamic;
    }
    return offer.utilityScore ? Math.round(Number(offer.utilityScore) * 10) / 10 : 85.0;
  };

  const handleExportCsv = () => {
    const headers = 'Criterion,Seller A,Seller B,Seller C\n';
    const rows = [
      'Strategy,Low Margin Wholesale,Fast-Track Enterprise,Adversarial Simulator',
      `Unit Price,3700,3950,3200 (Disguised)`,
      `Total Price,44400,47400,50400 (Breach)`,
      'Under 50k Budget,Yes,Yes,No (+400)',
      'Delivery SLA,40 Hours,20 Hours,12 Hours (Unverified)',
      'Quality Grade,Enterprise,Enterprise-Plus,Uncertified',
      'Resale Margin,24.5%,21.0%,5.0%',
      'Utility Score,88.5,85.0,22.0',
    ].join('\n');

    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `agentmart-offer-comparison-${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast('Exported offer comparison matrix to CSV!', 'success');
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-100 flex items-center gap-2">
            <Scale className="w-6 h-6 text-indigo-400 shrink-0" /> Multi-Attribute Offer Comparison Matrix
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Side-by-side evaluation across competing supplier quotes, utility formulas, and safety boundaries.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button variant="outline" size="sm" onClick={handleExportCsv} className="gap-1.5 text-xs">
            <Download className="w-3.5 h-3.5" /> Export CSV
          </Button>

          <Button
            variant="success"
            size="sm"
            onClick={handleProceedToApproval}
            loading={proceeding}
            className="gap-2 text-xs shadow-emerald-500/20 shadow-md"
          >
            <ShieldCheck className="w-4 h-4" /> Proceed to Human Approval
          </Button>
        </div>
      </div>

      {/* Recommended Deal Spotlight */}
      <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-slate-900 to-indigo-950/40 border border-emerald-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-lg">
        <div className="flex items-start sm:items-center gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-sm sm:text-base font-bold text-emerald-300">
                Optimal Recommendation: Prism Wholesale Direct (Agent A)
              </h4>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 text-[10px] font-mono font-bold">
                RECOMMENDED
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-1 max-w-3xl leading-relaxed">
              Highest combined utility score (88.5/100) with ₹44,400 total commitment (₹5,600 below budget cap), 40h delivery (well under 48h SLA), and 24.5% projected resale margin.
            </p>
          </div>
        </div>
        <div className="text-right shrink-0">
          <span className="text-[11px] text-slate-400 block font-mono">Total Quote</span>
          <span className="font-mono text-2xl font-bold text-emerald-400">{formatINR(44400)}</span>
        </div>
      </div>

      {/* Side-by-Side Comparison Matrix Table */}
      <Card title="Supplier Evaluation Matrix" subtitle="Strict deterministic validation across all criteria">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400">
                <th className="py-3.5 px-4 font-semibold">Evaluation Criterion</th>
                <th className="py-3.5 px-4 font-semibold text-emerald-400 bg-emerald-950/10">
                  Seller A (Prism PriceBot)
                </th>
                <th className="py-3.5 px-4 font-semibold text-blue-400 bg-blue-950/10">
                  Seller B (Swift CourierBot)
                </th>
                <th className="py-3.5 px-4 font-semibold text-rose-400 bg-rose-950/10">
                  Seller C (ShadowBot)
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/70 font-mono text-slate-200">
              <tr className="hover:bg-slate-900/40">
                <td className="py-3 px-4 font-sans text-slate-400 font-medium">Bidding Strategy</td>
                <td className="py-3 px-4 bg-emerald-950/5">Wholesale Price Priority</td>
                <td className="py-3 px-4 bg-blue-950/5">Expedited Quality Priority</td>
                <td className="py-3 px-4 text-rose-400 bg-rose-950/5">Adversarial Simulation</td>
              </tr>
              <tr className="hover:bg-slate-900/40">
                <td className="py-3 px-4 font-sans text-slate-400 font-medium">Offered Unit Rate</td>
                <td className="py-3 px-4 text-emerald-400 font-bold bg-emerald-950/5">{formatINR(3700)}</td>
                <td className="py-3 px-4 font-semibold bg-blue-950/5">{formatINR(3950)}</td>
                <td className="py-3 px-4 text-rose-400 line-through bg-rose-950/5">{formatINR(3200)}</td>
              </tr>
              <tr className="hover:bg-slate-900/40">
                <td className="py-3 px-4 font-sans text-slate-400 font-medium">Total Price (12 Units)</td>
                <td className="py-3 px-4 text-emerald-400 font-bold text-sm bg-emerald-950/5">{formatINR(44400)}</td>
                <td className="py-3 px-4 font-bold text-sm bg-blue-950/5">{formatINR(47400)}</td>
                <td className="py-3 px-4 text-rose-400 font-bold text-sm bg-rose-950/5">{formatINR(50400)} *</td>
              </tr>
              <tr className="hover:bg-slate-900/40">
                <td className="py-3 px-4 font-sans text-slate-400 font-medium">Budget Check (&lt;= ₹50k)</td>
                <td className="py-3 px-4 text-emerald-400 bg-emerald-950/5">✓ PASS (₹5,600 buffer)</td>
                <td className="py-3 px-4 text-emerald-400 bg-blue-950/5">✓ PASS (₹2,600 buffer)</td>
                <td className="py-3 px-4 text-rose-400 font-bold bg-rose-950/5">✗ BREACH (+₹400 over)</td>
              </tr>
              <tr className="hover:bg-slate-900/40">
                <td className="py-3 px-4 font-sans text-slate-400 font-medium">Fulfillment SLA Lead Time</td>
                <td className="py-3 px-4 bg-emerald-950/5">40 Hours (Passes 48h limit)</td>
                <td className="py-3 px-4 text-blue-400 font-bold bg-blue-950/5">20 Hours (Ultra Fast)</td>
                <td className="py-3 px-4 text-slate-400 bg-rose-950/5">12 Hours (Unverified)</td>
              </tr>
              <tr className="hover:bg-slate-900/40">
                <td className="py-3 px-4 font-sans text-slate-400 font-medium">Build Quality & Warranty</td>
                <td className="py-3 px-4 bg-emerald-950/5">Enterprise (24m Warranty)</td>
                <td className="py-3 px-4 text-blue-400 bg-blue-950/5">Enterprise-Plus (36m)</td>
                <td className="py-3 px-4 text-rose-400 bg-rose-950/5">Uncertified (6m)</td>
              </tr>
              <tr className="hover:bg-slate-900/40">
                <td className="py-3 px-4 font-sans text-slate-400 font-medium">Projected Resale Margin</td>
                <td className="py-3 px-4 text-emerald-400 font-bold bg-emerald-950/5">24.50%</td>
                <td className="py-3 px-4 font-semibold bg-blue-950/5">21.00%</td>
                <td className="py-3 px-4 text-rose-400 bg-rose-950/5">5.00%</td>
              </tr>
              <tr className="hover:bg-slate-900/40">
                <td className="py-3 px-4 font-sans text-slate-400 font-medium">Zero-Trust Inspection</td>
                <td className="py-3 px-4 text-emerald-400 bg-emerald-950/5">PASSED / VERIFIED</td>
                <td className="py-3 px-4 text-emerald-400 bg-blue-950/5">PASSED / VERIFIED</td>
                <td className="py-3 px-4 text-rose-400 font-bold bg-rose-950/5">FLAGGED: +₹12k Disguised Fee</td>
              </tr>
              <tr className="bg-slate-950/80">
                <td className="py-4 px-4 font-sans font-bold text-slate-100">Deterministic Utility Score</td>
                <td className="py-4 px-4 text-emerald-400 font-bold text-base bg-emerald-950/20">
                  {getOfferScore(offers[0])} / 100
                </td>
                <td className="py-4 px-4 text-blue-400 font-bold text-base bg-blue-950/20">
                  {getOfferScore(offers[1])} / 100
                </td>
                <td className="py-4 px-4 text-rose-400 font-bold text-base bg-rose-950/20">
                  {getOfferScore(offers[2])} / 100
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </Card>

      {/* Interactive Weighting Tuner & Multi-Attribute Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sliders Card */}
        <Card
          title="Interactive Weight Tuning Simulator"
          subtitle="Adjust criteria weights to evaluate sensitivity of the utility function"
        >
          <div className="space-y-3.5 text-xs">
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-slate-300 font-medium">Price Weight: {weights.price}%</span>
                <span className="font-mono text-emerald-400">{weights.price}%</span>
              </div>
              <input
                type="range"
                min="10"
                max="60"
                value={weights.price}
                onChange={(e) => setWeights({ ...weights, price: Number(e.target.value) })}
                className="w-full h-1.5 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-emerald-500"
              />
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <span className="text-slate-300 font-medium">Delivery SLA Weight: {weights.delivery}%</span>
                <span className="font-mono text-blue-400">{weights.delivery}%</span>
              </div>
              <input
                type="range"
                min="10"
                max="50"
                value={weights.delivery}
                onChange={(e) => setWeights({ ...weights, delivery: Number(e.target.value) })}
                className="w-full h-1.5 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <span className="text-slate-300 font-medium">Quality & Warranty Weight: {weights.quality}%</span>
                <span className="font-mono text-indigo-400">{weights.quality}%</span>
              </div>
              <input
                type="range"
                min="5"
                max="40"
                value={weights.quality}
                onChange={(e) => setWeights({ ...weights, quality: Number(e.target.value) })}
                className="w-full h-1.5 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-indigo-500"
              />
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <span className="text-slate-300 font-medium">Supplier Reliability Weight: {weights.reliability}%</span>
                <span className="font-mono text-amber-400">{weights.reliability}%</span>
              </div>
              <input
                type="range"
                min="5"
                max="30"
                value={weights.reliability}
                onChange={(e) => setWeights({ ...weights, reliability: Number(e.target.value) })}
                className="w-full h-1.5 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-amber-500"
              />
            </div>

            <div className="pt-2 flex justify-end">
              <Button
                variant="outline"
                size="xs"
                onClick={() => setWeights({ price: 40, delivery: 25, quality: 20, reliability: 15 })}
                className="text-slate-400"
              >
                Reset Default Weights (40/25/20/15)
              </Button>
            </div>
          </div>
        </Card>

        {/* Breakdown Visualizer */}
        <Card
          title="Dynamic Utility Score Sub-Attributes"
          subtitle="Real-time multi-criteria contribution"
        >
          <UtilityBreakdownChart offers={offers} />
        </Card>
      </div>
    </div>
  );
}

export default function OfferComparisonPage() {
  return (
    <React.Suspense fallback={<div className="p-8 text-slate-500 font-mono text-xs text-center">Loading Offer Comparison...</div>}>
      <OfferComparisonContent />
    </React.Suspense>
  );
}
