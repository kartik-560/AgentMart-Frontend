'use client';

import React from 'react';
import Card from '../shared/Card';
import Button from '../shared/Button';
import { formatINR } from '../../utils/formatters';
import Link from 'next/link';
import {
  CheckCircle2,
  Clock,
  Award,
  AlertTriangle,
  Scale,
} from 'lucide-react';

export default function OfferCards({ offers = [], onSelectOffer }) {
  return (
    <Card
      title="Competing Supplier Quotes"
      subtitle="Evaluated with deterministic multi-attribute utility function"
      headerAction={
        <Link href="/comparison">
          <Button variant="outline" size="sm" className="gap-1.5 text-xs">
            <Scale className="w-3.5 h-3.5" /> Full Matrix
          </Button>
        </Link>
      }
    >
      <div className="space-y-3.5">
        {offers.map((offer) => {
          const isWinner = offer.isRecommended;
          const isMalicious = offer.sellerAgentId?.includes('seller-c') || offer.hiddenFeeDetected;

          return (
            <div
              key={offer.id || offer.sellerAgentId}
              className={`p-4 rounded-2xl border transition-all ${
                isWinner
                  ? 'bg-emerald-950/25 border-emerald-500/40 shadow-lg shadow-emerald-950/30'
                  : isMalicious
                  ? 'bg-rose-950/20 border-rose-900/50'
                  : 'bg-slate-950/80 border-slate-800/90 hover:border-slate-700'
              }`}
            >
              {/* Header: Seller name + Tag */}
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold text-xs text-slate-100">
                      {offer.sellerName || offer.name}
                    </h4>
                    {isWinner && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold">
                        <CheckCircle2 className="w-3 h-3" /> OPTIMAL DEAL
                      </span>
                    )}
                    {isMalicious && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/30 text-[10px] font-bold">
                        <AlertTriangle className="w-3 h-3" /> ANOMALY
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">
                    Round {offer.roundNumber || 2} Quote
                  </span>
                </div>

                <div className="text-right">
                  <span className="text-[10px] text-slate-400 block font-mono">Utility Score</span>
                  <span
                    className={`font-mono font-bold text-sm ${
                      isWinner ? 'text-emerald-400' : isMalicious ? 'text-rose-400' : 'text-blue-400'
                    }`}
                  >
                    {offer.utilityScore ? Number(offer.utilityScore).toFixed(1) : '85.0'} / 100
                  </span>
                </div>
              </div>

              {/* Price Row */}
              <div className="flex items-baseline justify-between py-2 border-y border-slate-800/60 my-2">
                <div>
                  <span className="text-xl font-bold font-mono text-slate-100">
                    {formatINR(offer.totalPrice)}
                  </span>
                  <span className="text-[11px] text-slate-400 font-mono ml-2">
                    ({formatINR(offer.unitPrice)} / unit)
                  </span>
                </div>
                <div className="text-right text-[11px]">
                  <span className="text-slate-500 block text-[10px]">Projected Margin</span>
                  <span className={`font-mono font-bold ${Number(offer.resaleMarginProjected || 0) >= 24 ? 'text-emerald-400' : 'text-amber-400'}`}>
                    {offer.resaleMarginProjected ? `${offer.resaleMarginProjected}%` : '21.0%'}
                  </span>
                </div>
              </div>

              {/* Key Attributes */}
              <div className="grid grid-cols-3 gap-2 text-[11px] text-slate-400">
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                  <span>{offer.deliveryHours}h Delivery</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                  <span>{offer.qualityGrade || 'Enterprise'}</span>
                </div>
                <div className="text-right font-mono">
                  {offer.withinBudget !== false ? (
                    <span className="text-emerald-400">Within Budget</span>
                  ) : (
                    <span className="text-rose-400 font-bold">Over Budget</span>
                  )}
                </div>
              </div>

              {/* Anomaly note if detected */}
              {isMalicious && (
                <div className="mt-2.5 p-2 rounded-lg bg-rose-950/60 border border-rose-800 text-[10px] text-rose-300 font-mono">
                  {offer.rejectionReason || 'Security Alert: Disguised fee detected violating platform boundaries'}
                </div>
              )}

              {/* Select & Proceed Button */}
              <div className="mt-3 pt-2.5 border-t border-slate-800/60 flex items-center justify-between">
                <span className="text-[10px] text-slate-500 font-mono">
                  Terms: {offer.paymentTerms || 'MOCK_UPI'}
                </span>
                <Button
                  size="xs"
                  variant={isWinner ? 'success' : 'outline'}
                  onClick={() => onSelectOffer && onSelectOffer(offer)}
                  disabled={isMalicious}
                  className="gap-1 text-[11px]"
                >
                  <CheckCircle2 className="w-3 h-3" />
                  {isWinner ? 'Approve Deal' : `Select Deal (${formatINR(offer.totalPrice)})`}
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
