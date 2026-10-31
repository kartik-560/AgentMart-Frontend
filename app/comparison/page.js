'use client';

import React, { useEffect, useState } from 'react';
import Card from '../../components/shared/Card';
import Button from '../../components/shared/Button';
import StatusBadge from '../../components/shared/StatusBadge';
import { negotiationService } from '../../services/negotiationService';
import { formatINR, formatPercentage } from '../../utils/formatters';
import Link from 'next/link';
import { Scale, CheckCircle2, XCircle, AlertTriangle, ArrowRight, ShieldCheck } from 'lucide-react';

export default function OfferComparisonPage() {
  const [comparison, setComparison] = useState(null);

  useEffect(() => {
    negotiationService.getComparison('neg-demo-001')
      .then((res) => {
        if (res?.data) setComparison(res.data);
      })
      .catch(() => {});
  }, []);

  const offers = comparison?.offers || [
    {
      agentId: 'seller-a-price',
      name: 'Prism PriceBot (Agent A)',
      strategy: 'Low Margin / Price Priority',
      unitPrice: 3700.00,
      quantity: 12,
      totalPrice: 44400.00,
      deliveryHours: 40,
      qualityGrade: 'Enterprise',
      resaleMarginProjected: 24.50,
      utilityScore: 88.5,
      withinBudget: true,
      withinSla: true,
      securityStatus: 'CLEAN',
      isRecommended: true,
    },
    {
      agentId: 'seller-b-speed-quality',
      name: 'Swift CourierBot (Agent B)',
      strategy: 'Speed & Premium Quality Priority',
      unitPrice: 3950.00,
      quantity: 12,
      totalPrice: 47400.00,
      deliveryHours: 20,
      qualityGrade: 'Enterprise-Plus',
      resaleMarginProjected: 21.00,
      utilityScore: 85.0,
      withinBudget: true,
      withinSla: true,
      securityStatus: 'CLEAN',
      isRecommended: false,
    },
    {
      agentId: 'seller-c-malicious',
      name: 'ShadowBot (Agent C - Malicious)',
      strategy: 'Adversarial Simulation',
      unitPrice: 3200.00,
      quantity: 12,
      totalPrice: 50400.00,
      deliveryHours: 12,
      qualityGrade: 'Uncertified',
      resaleMarginProjected: 5.00,
      utilityScore: 22.0,
      withinBudget: false,
      withinSla: true,
      securityStatus: 'FLAGGED_HIDDEN_FEE',
      isRecommended: false,
      flagReason: 'Hidden fee of ₹12,000 detected; exceeds ₹50,000 limit.',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
            <Scale className="w-6 h-6 text-indigo-400" /> Multi-Attribute Offer Comparison Matrix
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Side-by-side evaluation across competing supplier quotes, utility formulas, and safety boundaries.
          </p>
        </div>
        <Link href="/approvals">
          <Button variant="success" className="gap-2 text-xs">
            <ShieldCheck className="w-4 h-4" /> Proceed to Human Approval
          </Button>
        </Link>
      </div>

      {/* Recommended Deal Spotlight */}
      <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-800/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-emerald-300">
              Optimal Deal Recommendation: Prism Wholesale Direct (Agent A)
            </h4>
            <p className="text-xs text-slate-300 mt-0.5">
              Achieves highest normalized utility score (88.5/100) with ₹44,400 total cost (₹5,600 below budget cap) and 24.5% projected resale margin.
            </p>
          </div>
        </div>
        <span className="font-mono text-xl font-bold text-emerald-400">{formatINR(44400)}</span>
      </div>

      {/* Side-by-Side Comparison Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400">
                <th className="py-3 px-4 font-medium">Evaluation Criterion</th>
                <th className="py-3 px-4 font-medium text-emerald-400">Seller A (Price Focus)</th>
                <th className="py-3 px-4 font-medium text-blue-400">Seller B (Speed/Quality)</th>
                <th className="py-3 px-4 font-medium text-rose-400">Seller C (Malicious Simulation)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono text-slate-200">
              <tr>
                <td className="py-3 px-4 font-sans text-slate-400">Strategy Persona</td>
                <td className="py-3 px-4">Low Margin Wholesale</td>
                <td className="py-3 px-4">Fast-Track Enterprise</td>
                <td className="py-3 px-4 text-rose-400">Adversarial Simulator</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-sans text-slate-400">Offered Unit Price</td>
                <td className="py-3 px-4 text-emerald-400 font-semibold">{formatINR(3700)}</td>
                <td className="py-3 px-4">{formatINR(3950)}</td>
                <td className="py-3 px-4 line-through text-rose-400">{formatINR(3200)}</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-sans text-slate-400">Total Price (12 Units)</td>
                <td className="py-3 px-4 text-emerald-400 font-bold">{formatINR(44400)}</td>
                <td className="py-3 px-4">{formatINR(47400)}</td>
                <td className="py-3 px-4 text-rose-400 font-bold">{formatINR(50400)} *</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-sans text-slate-400">Under ₹50,000 Budget?</td>
                <td className="py-3 px-4 text-emerald-400">✓ YES (₹5,600 buffer)</td>
                <td className="py-3 px-4 text-emerald-400">✓ YES (₹2,600 buffer)</td>
                <td className="py-3 px-4 text-rose-400">✗ BREACH (+₹400 over cap)</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-sans text-slate-400">Delivery Lead Time</td>
                <td className="py-3 px-4">40 Hours (Under 48h limit)</td>
                <td className="py-3 px-4 text-blue-400 font-bold">20 Hours (Ultra Fast)</td>
                <td className="py-3 px-4 text-slate-400">12 Hours (Unverified)</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-sans text-slate-400">Quality Classification</td>
                <td className="py-3 px-4">Enterprise</td>
                <td className="py-3 px-4 text-blue-400">Enterprise-Plus</td>
                <td className="py-3 px-4 text-rose-400">Uncertified</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-sans text-slate-400">Projected Resale Margin</td>
                <td className="py-3 px-4 text-emerald-400 font-bold">24.50%</td>
                <td className="py-3 px-4">21.00%</td>
                <td className="py-3 px-4 text-rose-400">5.00%</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-sans text-slate-400">Security Inspection</td>
                <td className="py-3 px-4 text-emerald-400">VERIFIED</td>
                <td className="py-3 px-4 text-emerald-400">VERIFIED</td>
                <td className="py-3 px-4 text-rose-400">FLAGGED: ₹12k Hidden Fee</td>
              </tr>
              <tr className="bg-slate-950/60">
                <td className="py-3.5 px-4 font-sans font-bold text-slate-100">Deterministic Utility Score</td>
                <td className="py-3.5 px-4 text-emerald-400 font-bold text-base">88.5 / 100</td>
                <td className="py-3.5 px-4 text-blue-400 font-bold text-base">85.0 / 100</td>
                <td className="py-3.5 px-4 text-rose-400 font-bold text-base">22.0 / 100</td>
              </tr>
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

