'use client';

import React from 'react';
import Button from '../shared/Button';
import Link from 'next/link';
import { formatINR } from '../../utils/formatters';
import {
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  ArrowRight,
  TrendingUp,
  Cpu,
  Clock,
} from 'lucide-react';

export default function AIRecommendationBanner({ recommendation, negotiationId = 'neg-demo-001' }) {
  return (
    <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-slate-900 to-indigo-950/40 border border-emerald-500/30 shadow-xl space-y-4">
      {/* Top Banner Row */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-emerald-900/40">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shadow-md">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-slate-100 text-sm sm:text-base">
                Autonomous Deal Recommendation: Prism Wholesale Direct (Agent A)
              </h3>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 text-[10px] font-mono font-bold">
                SCORE: 88.5 / 100
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              Multi-Attribute Decision Engine converged on optimal balance of budget savings, delivery SLA, and target resale margin.
            </p>
          </div>
        </div>

        <div className="text-right shrink-0">
          <span className="text-[11px] text-slate-400 block font-mono">Recommended Settlement</span>
          <span className="text-2xl font-bold font-mono text-emerald-400">{formatINR(44400)}</span>
          <span className="text-[11px] text-emerald-300 block font-mono">Saves ₹5,600 under cap</span>
        </div>
      </div>

      {/* Decision Explanation Reasoning 3-Card Split */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
        {/* Why Seller A Won */}
        <div className="p-3 rounded-xl bg-slate-950/70 border border-emerald-500/20 space-y-1">
          <div className="flex items-center gap-1.5 text-emerald-400 font-semibold text-[11px]">
            <CheckCircle2 className="w-3.5 h-3.5" /> 1. Selected Deal: Seller A
          </div>
          <p className="text-slate-300 text-[11px] leading-relaxed">
            Offered ₹3,700/unit (₹44,400 total). Meets 24.5% projected margin (exceeds 18% floor) and delivers in 40 hours within 48h deadline.
          </p>
        </div>

        {/* Why Seller B Lost */}
        <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1">
          <div className="flex items-center gap-1.5 text-blue-400 font-semibold text-[11px]">
            <Clock className="w-3.5 h-3.5" /> 2. Runner-Up: Seller B
          </div>
          <p className="text-slate-400 text-[11px] leading-relaxed">
            Exceptional 20h SLA and Enterprise-Plus build, but ₹47,400 total price yields lower utility (85.0) and narrower margin (21.0%).
          </p>
        </div>

        {/* Why Seller C Was Rejected */}
        <div className="p-3 rounded-xl bg-slate-950/70 border border-rose-900/40 space-y-1">
          <div className="flex items-center gap-1.5 text-rose-400 font-semibold text-[11px]">
            <ShieldCheck className="w-3.5 h-3.5" /> 3. Quarantined: Seller C
          </div>
          <p className="text-slate-400 text-[11px] leading-relaxed">
            Auto-rejected by Zero-Trust scanner due to ₹12,000 disguised handling fee, pushing effective total to ₹50,400 (breaches ₹50k hard cap).
          </p>
        </div>
      </div>

      {/* Action CTA */}
      <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Mandatory Human Sign-off required prior to automated Mock UPI dispatch.</span>
        </div>

        <Link href={`/approvals`}>
          <Button variant="success" size="md" className="gap-2 shadow-emerald-500/20 shadow-lg text-xs sm:text-sm py-2 sm:py-2.5">
            <CheckCircle2 className="w-4 h-4" /> Proceed to Human Approval & Mock UPI <ArrowRight className="w-4 h-4" />
          </Button>
        </Link>
      </div>
    </div>
  );
}

