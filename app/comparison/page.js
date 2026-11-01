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

  const handleProceedToApproval = async (chosenOffer = null) => {
    setProceeding(true);
    const currentNegId = negotiationId || comparison?.negotiationId;
    const targetOffer = chosenOffer || offers.find((o) => o.isRecommended) || offers[0];

    try {
      if (currentNegId) {
        const payload = {
          negotiationId: currentNegId,
          offerId: targetOffer?.id,
        };
        const txRes = await transactionService.create(payload);
        if (txRes?.data?.id) {
          router.push(`/approvals?id=${txRes.data.id}`);
          return;
        }
      }
      router.push(`/approvals${currentNegId ? `?negotiationId=${currentNegId}` : ''}`);
    } catch (err) {
      console.error('Failed to create transaction from comparison:', err);
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
          <h1 className="text-xl sm:text-2xl font-bold text-[#172554] flex items-center gap-2">
            <Scale className="w-6 h-6 text-[#1d4ed8] shrink-0" /> Multi-Attribute Offer Comparison Matrix
          </h1>
          <p className="text-xs sm:text-sm text-[#1e3a8a] mt-1">
            Side-by-side evaluation across competing supplier quotes, utility formulas, and safety boundaries.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button variant="outline" size="sm" onClick={handleExportCsv} className="gap-1.5 text-xs">
            <Download className="w-3.5 h-3.5" /> Export CSV
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={handleProceedToApproval}
            loading={proceeding}
            className="gap-2 text-xs shadow-xs"
          >
            <ShieldCheck className="w-4 h-4" /> Proceed to Human Approval
          </Button>
        </div>
      </div>

      {/* Recommended Deal Spotlight */}
      {(() => {
        const recommendedOffer = offers.find((o) => o.isRecommended) || offers[0];
        const budgetCap = comparison?.constraints?.maxBudget || 50000;
        const totalQuote = comparison?.recommendationSummary?.recommendedPrice || recommendedOffer?.totalPrice || 44400;
        const savings = Math.max(0, budgetCap - totalQuote);

        return (
          <div className="p-4 sm:p-5 rounded-2xl bg-[#fffdf9] border-2 border-[#1d4ed8] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs text-[#172554]">
            <div className="flex items-start sm:items-center gap-3">
              <div className="p-2.5 rounded-xl bg-[#f4efe3] text-[#1d4ed8] border border-[#1e3a8a]/20 shrink-0">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-sm sm:text-base font-bold text-[#172554]">
                    Optimal Recommendation: {comparison?.recommendationSummary?.sellerName || recommendedOffer?.sellerName || 'Prism Wholesale Direct'}
                  </h4>
                  <span className="px-2 py-0.5 rounded-full bg-[#f4efe3] text-[#1d4ed8] border border-[#1e3a8a]/20 text-[10px] font-mono font-bold">
                    RECOMMENDED
                  </span>
                </div>
                <p className="text-xs text-[#1e3a8a] mt-1 max-w-3xl leading-relaxed">
                  {comparison?.recommendationSummary?.reasoning ||
                    `Highest combined utility score (${getOfferScore(recommendedOffer)}/100) with ${formatINR(totalQuote)} total commitment (${formatINR(savings)} below budget cap), ${recommendedOffer?.deliveryHours || 40}h delivery, and ${recommendedOffer?.resaleMarginProjected || 24.5}% projected resale margin.`}
                </p>
              </div>
            </div>
            <div className="text-right shrink-0">
              <span className="text-[11px] text-[#1e3a8a] block font-mono">Total Quote</span>
              <span className="font-mono text-2xl font-bold text-[#1d4ed8]">{formatINR(totalQuote)}</span>
            </div>
          </div>
        );
      })()}

      {/* Side-by-Side Comparison Matrix Table */}
      <Card title="Supplier Evaluation Matrix" subtitle="Strict deterministic validation across all criteria">
        <div className="overflow-x-auto text-[#172554]">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#1e3a8a]/20 bg-[#f4efe3] text-[#172554]">
                <th className="py-3.5 px-4 font-bold">Evaluation Criterion</th>
                {offers.map((offer, idx) => {
                  const isRec = offer.isRecommended;
                  return (
                    <th key={offer.id || idx} className={`py-3.5 px-4 font-bold ${isRec ? 'text-[#1d4ed8] bg-[#f4efe3]' : 'text-[#172554]'}`}>
                      {offer.sellerName || offer.name || `Seller ${String.fromCharCode(65 + idx)}`}
                      {isRec && <span className="ml-2 text-[10px] px-1.5 py-0.5 rounded bg-[#1d4ed8] text-[#faf7ee] font-bold">RECOMMENDED</span>}
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1e3a8a]/15 font-mono text-[#172554]">
              <tr className="hover:bg-[#faf7ee]">
                <td className="py-3 px-4 font-sans text-[#1e3a8a] font-bold">Bidding Strategy</td>
                {offers.map((offer, idx) => (
                  <td key={idx} className={`py-3 px-4 ${offer.isRecommended ? 'bg-[#f4efe3]/40 font-bold' : ''}`}>
                    {offer.strategy || 'Wholesale Supply'}
                  </td>
                ))}
              </tr>
              <tr className="hover:bg-[#faf7ee]">
                <td className="py-3 px-4 font-sans text-[#1e3a8a] font-bold">Offered Unit Rate</td>
                {offers.map((offer, idx) => (
                  <td key={idx} className={`py-3 px-4 font-bold ${offer.isRecommended ? 'text-[#1d4ed8] bg-[#f4efe3]/40' : offer.securityStatus !== 'CLEAN' ? 'text-[#172554] line-through' : 'text-[#172554]'}`}>
                    {formatINR(offer.unitPrice)}
                  </td>
                ))}
              </tr>
              <tr className="hover:bg-[#faf7ee]">
                <td className="py-3 px-4 font-sans text-[#1e3a8a] font-bold">Total Price ({offers[0]?.quantity || 1} Units)</td>
                {offers.map((offer, idx) => (
                  <td key={idx} className={`py-3 px-4 font-bold text-sm ${offer.isRecommended ? 'text-[#1d4ed8] bg-[#f4efe3]/40' : 'text-[#172554]'}`}>
                    {formatINR(offer.totalPrice)} {offer.securityStatus !== 'CLEAN' ? '*' : ''}
                  </td>
                ))}
              </tr>
              <tr className="hover:bg-[#faf7ee]">
                {(() => {
                  const budgetCap = comparison?.constraints?.maxBudget || 50000;
                  return (
                    <>
                      <td className="py-3 px-4 font-sans text-[#1e3a8a] font-bold">Budget Check ({'<='} {formatINR(budgetCap)})</td>
                      {offers.map((offer, idx) => {
                        const diff = budgetCap - offer.totalPrice;
                        const passes = diff >= 0 && offer.withinBudget !== false;
                        return (
                          <td key={idx} className={`py-3 px-4 font-bold ${passes ? 'text-[#1d4ed8] bg-[#f4efe3]/40' : 'text-[#172554]'}`}>
                            {passes ? `✓ PASS (${formatINR(diff)} buffer)` : `✗ BREACH (+${formatINR(Math.abs(diff))} over)`}
                          </td>
                        );
                      })}
                    </>
                  );
                })()}
              </tr>
              <tr className="hover:bg-[#faf7ee]">
                <td className="py-3 px-4 font-sans text-[#1e3a8a] font-bold">Fulfillment SLA Lead Time</td>
                {offers.map((offer, idx) => (
                  <td key={idx} className={`py-3 px-4 ${offer.isRecommended ? 'text-[#1d4ed8] bg-[#f4efe3]/40 font-bold' : 'text-[#172554]'}`}>
                    {offer.deliveryHours} Hours {offer.withinSla ? '(Passes SLA)' : '(Breaches SLA)'}
                  </td>
                ))}
              </tr>
              <tr className="hover:bg-[#faf7ee]">
                <td className="py-3 px-4 font-sans text-[#1e3a8a] font-bold">Build Quality & Warranty</td>
                {offers.map((offer, idx) => (
                  <td key={idx} className={`py-3 px-4 ${offer.isRecommended ? 'text-[#1d4ed8] bg-[#f4efe3]/40 font-bold' : 'text-[#172554]'}`}>
                    {offer.qualityGrade || 'Enterprise'}
                  </td>
                ))}
              </tr>
              <tr className="hover:bg-[#faf7ee]">
                <td className="py-3 px-4 font-sans text-[#1e3a8a] font-bold">Projected Resale Margin</td>
                {offers.map((offer, idx) => (
                  <td key={idx} className={`py-3 px-4 ${offer.isRecommended ? 'text-[#1d4ed8] font-bold bg-[#f4efe3]/40' : 'text-[#172554]'}`}>
                    {Number(offer.resaleMarginProjected || 0).toFixed(2)}%
                  </td>
                ))}
              </tr>
              <tr className="hover:bg-[#faf7ee]">
                <td className="py-3 px-4 font-sans text-[#1e3a8a] font-bold">Zero-Trust Inspection</td>
                {offers.map((offer, idx) => (
                  <td key={idx} className={`py-3 px-4 font-bold ${offer.securityStatus === 'CLEAN' ? 'text-[#1d4ed8] bg-[#f4efe3]/40' : 'text-[#172554]'}`}>
                    {offer.securityStatus === 'CLEAN' ? 'PASSED / VERIFIED' : offer.flagReason || 'FLAGGED: Suspicious terms'}
                  </td>
                ))}
              </tr>
              <tr className="bg-[#f4efe3]">
                <td className="py-4 px-4 font-sans font-black text-[#172554]">Deterministic Utility Score</td>
                {offers.map((offer, idx) => (
                  <td key={idx} className={`py-4 px-4 font-black text-base ${offer.isRecommended ? 'text-[#1d4ed8] bg-[#f4efe3]' : 'text-[#172554]'}`}>
                    {getOfferScore(offer)} / 100
                  </td>
                ))}
              </tr>
              <tr className="hover:bg-[#faf7ee]">
                <td className="py-3.5 px-4 font-sans font-bold text-[#172554]">Authorize Selected Deal</td>
                {offers.map((offer, idx) => (
                  <td key={idx} className="py-3.5 px-4">
                    <Button
                      variant={offer.isRecommended ? 'primary' : 'outline'}
                      size="xs"
                      onClick={() => handleProceedToApproval(offer)}
                      disabled={proceeding || offer.securityStatus !== 'CLEAN'}
                      className="w-full text-[11px] gap-1.5 font-bold shadow-xs"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      {offer.isRecommended ? 'Approve Optimal Deal' : `Select Deal (${formatINR(offer.totalPrice)})`}
                    </Button>
                  </td>
                ))}
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
          <div className="space-y-3.5 text-xs text-[#172554]">
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-[#172554] font-bold">Price Weight: {weights.price}%</span>
                <span className="font-mono text-[#1d4ed8] font-bold">{weights.price}%</span>
              </div>
              <input
                type="range"
                min="10"
                max="60"
                value={weights.price}
                onChange={(e) => setWeights({ ...weights, price: Number(e.target.value) })}
                className="w-full h-1.5 bg-[#f4efe3] rounded-lg appearance-none cursor-pointer accent-[#1d4ed8]"
              />
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <span className="text-[#172554] font-bold">Delivery SLA Weight: {weights.delivery}%</span>
                <span className="font-mono text-[#1d4ed8] font-bold">{weights.delivery}%</span>
              </div>
              <input
                type="range"
                min="10"
                max="50"
                value={weights.delivery}
                onChange={(e) => setWeights({ ...weights, delivery: Number(e.target.value) })}
                className="w-full h-1.5 bg-[#f4efe3] rounded-lg appearance-none cursor-pointer accent-[#1d4ed8]"
              />
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <span className="text-[#172554] font-bold">Quality & Warranty Weight: {weights.quality}%</span>
                <span className="font-mono text-[#1d4ed8] font-bold">{weights.quality}%</span>
              </div>
              <input
                type="range"
                min="5"
                max="40"
                value={weights.quality}
                onChange={(e) => setWeights({ ...weights, quality: Number(e.target.value) })}
                className="w-full h-1.5 bg-[#f4efe3] rounded-lg appearance-none cursor-pointer accent-[#1d4ed8]"
              />
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <span className="text-[#172554] font-bold">Supplier Reliability Weight: {weights.reliability}%</span>
                <span className="font-mono text-[#1d4ed8] font-bold">{weights.reliability}%</span>
              </div>
              <input
                type="range"
                min="5"
                max="30"
                value={weights.reliability}
                onChange={(e) => setWeights({ ...weights, reliability: Number(e.target.value) })}
                className="w-full h-1.5 bg-[#f4efe3] rounded-lg appearance-none cursor-pointer accent-[#1d4ed8]"
              />
            </div>

            <div className="pt-2 flex justify-end">
              <Button
                variant="outline"
                size="xs"
                onClick={() => setWeights({ price: 40, delivery: 25, quality: 20, reliability: 15 })}
                className="text-[#172554] font-bold"
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
    <React.Suspense fallback={<div className="p-8 text-[#1e3a8a] font-mono text-xs text-center">Loading Offer Comparison...</div>}>
      <OfferComparisonContent />
    </React.Suspense>
  );
}
