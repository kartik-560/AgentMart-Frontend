'use client';

import React, { useState } from 'react';
import Button from '../shared/Button';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { transactionService } from '../../services/transactionService';
import { formatINR } from '../../utils/formatters';
import {
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  ArrowRight,
  Clock,
} from 'lucide-react';

export default function AIRecommendationBanner({
  negotiation,
  offers = [],
  negotiationId,
}) {
  const router = useRouter();
  const [proceeding, setProceeding] = useState(false);

  const currentNegId = negotiationId || negotiation?.id;
  const recommendedOffer = offers.find((o) => o.isRecommended) || offers[0];
  const runnerUpOffer = offers.find((o) => !o.isRecommended && o.securityStatus === 'CLEAN') || offers[1];
  const flaggedOffer = offers.find((o) => o.securityStatus !== 'CLEAN') || offers[2];

  const budgetCap = Number(negotiation?.maxBudget || 50000);
  const totalSettlement = recommendedOffer ? Number(recommendedOffer.totalPrice) : 44400;
  const budgetSaved = Math.max(0, budgetCap - totalSettlement);
  const utilityScore = recommendedOffer?.utilityScore
    ? Math.round(Number(recommendedOffer.utilityScore) * 10) / 10
    : 88.5;
  const winnerName = recommendedOffer?.sellerName || recommendedOffer?.name || 'Prism Wholesale Direct (Agent A)';

  const handleProceed = async () => {
    if (!currentNegId) {
      router.push('/approvals');
      return;
    }

    setProceeding(true);
    try {
      const payload = {
        negotiationId: currentNegId,
        offerId: recommendedOffer?.id,
      };
      const res = await transactionService.create(payload);
      if (res?.data?.id) {
        router.push(`/approvals?id=${res.data.id}`);
        return;
      }
      router.push(`/approvals?negotiationId=${currentNegId}`);
    } catch (err) {
      console.error('Failed to persist transaction before navigation:', err);
      router.push(`/approvals?negotiationId=${currentNegId}`);
    } finally {
      setProceeding(false);
    }
  };

  return (
    <div className="p-5 rounded-2xl bg-[#fffdf9] border-2 border-[#1d4ed8] shadow-xs space-y-4 text-[#172554]">
      {/* Top Banner Row */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-[#1e3a8a]/15">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-[#f4efe3] text-[#1d4ed8] border border-[#1e3a8a]/20 shadow-xs">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-[#172554] text-sm sm:text-base">
                Autonomous Deal Recommendation: {winnerName}
              </h3>
              <span className="px-2 py-0.5 rounded-full bg-[#f4efe3] text-[#1d4ed8] border border-[#1e3a8a]/20 text-[10px] font-mono font-bold">
                SCORE: {utilityScore} / 100
              </span>
            </div>
            <p className="text-xs text-[#1e3a8a] mt-0.5">
              Multi-Attribute Decision Engine converged on optimal balance of budget savings, delivery SLA, and target resale margin.
            </p>
          </div>
        </div>

        <div className="text-right shrink-0">
          <span className="text-[11px] text-[#1e3a8a] block font-mono">Recommended Settlement</span>
          <span className="text-2xl font-bold font-mono text-[#1d4ed8]">{formatINR(totalSettlement)}</span>
          <span className="text-[11px] text-[#172554] block font-mono font-semibold">
            {budgetSaved > 0 ? `Saves ${formatINR(budgetSaved)} under cap` : 'Within approved budget'}
          </span>
        </div>
      </div>

      {/* Decision Explanation Reasoning 3-Card Split */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
        {/* Why Winner Won */}
        <div className="p-3 rounded-xl bg-[#faf7ee] border border-[#1e3a8a]/25 space-y-1">
          <div className="flex items-center gap-1.5 text-[#1d4ed8] font-bold text-[11px]">
            <CheckCircle2 className="w-3.5 h-3.5" /> 1. Selected Deal: {winnerName}
          </div>
          <p className="text-[#172554] text-[11px] leading-relaxed">
            Offered {formatINR(recommendedOffer?.unitPrice || 3700)}/unit ({formatINR(totalSettlement)} total). Meets {recommendedOffer?.resaleMarginProjected || 24.5}% margin and delivers in {recommendedOffer?.deliveryHours || 40} hours within SLA.
          </p>
        </div>

        {/* Why Runner Up Lost */}
        <div className="p-3 rounded-xl bg-[#faf7ee] border border-[#1e3a8a]/20 space-y-1">
          <div className="flex items-center gap-1.5 text-[#1e3a8a] font-bold text-[11px]">
            <Clock className="w-3.5 h-3.5" /> 2. Runner-Up: {runnerUpOffer?.sellerName || runnerUpOffer?.name || 'SwiftQuality Logistics'}
          </div>
          <p className="text-[#1e3a8a] text-[11px] leading-relaxed">
            {runnerUpOffer
              ? `${runnerUpOffer.deliveryHours}h SLA and ${runnerUpOffer.qualityGrade || 'Enterprise'} tier, but ${formatINR(runnerUpOffer.totalPrice)} total price yields lower utility (${runnerUpOffer.utilityScore || 85.0}).`
              : 'Exceptional 20h SLA, but higher price yields lower overall multi-attribute utility.'}
          </p>
        </div>

        {/* Why Flagged Was Rejected */}
        <div className="p-3 rounded-xl bg-[#faf7ee] border border-[#172554]/30 space-y-1">
          <div className="flex items-center gap-1.5 text-[#172554] font-bold text-[11px]">
            <ShieldCheck className="w-3.5 h-3.5 text-[#1d4ed8]" /> 3. Quarantined: {flaggedOffer?.sellerName || flaggedOffer?.name || 'ShadowBot'}
          </div>
          <p className="text-[#1e3a8a] text-[11px] leading-relaxed">
            {flaggedOffer?.flagReason || 'Auto-flagged by Zero-Trust scanner due to disguised logistics surcharge violating deterministic enterprise boundaries.'}
          </p>
        </div>
      </div>

      {/* Action CTA */}
      <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs text-[#1e3a8a]">
          <ShieldCheck className="w-4 h-4 text-[#1d4ed8]" />
          <span>
            {negotiation?.status === 'APPROVED' || negotiation?.status === 'SETTLED'
              ? 'Procurement agreement authorized and settled by human sign-off. Live room closed.'
              : 'Mandatory Human Sign-off required prior to automated Mock UPI dispatch.'}
          </span>
        </div>

        {negotiation?.status === 'APPROVED' || negotiation?.status === 'SETTLED' ? (
          <Link href="/approvals">
            <Button
              variant="outline"
              size="md"
              className="gap-2 border-[#1e3a8a]/40 text-[#172554] hover:bg-[#f4efe3] text-xs sm:text-sm py-2 sm:py-2.5 font-bold"
            >
              <CheckCircle2 className="w-4 h-4 text-[#1d4ed8]" />
              View Settlement Record
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        ) : (
          <Button
            variant="primary"
            size="md"
            onClick={handleProceed}
            loading={proceeding}
            disabled={proceeding}
            className="gap-2 bg-[#1d4ed8] hover:bg-[#1e3a8a] text-[#faf7ee] text-xs sm:text-sm py-2 sm:py-2.5 font-bold shadow-xs"
          >
            <CheckCircle2 className="w-4 h-4" />
            {proceeding ? 'Persisting Selected Deal...' : 'Proceed to Human Approval & Mock UPI'}
            <ArrowRight className="w-4 h-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
