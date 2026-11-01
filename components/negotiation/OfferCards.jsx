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
  Package,
} from 'lucide-react';

export default function OfferCards({
  offers = [],
  onSelectOffer,
  isSecuringDeal = false,
  isClosed = false,
}) {
  return (
    <Card
      title="Competing Supplier Quotes"
      subtitle="Evaluated with deterministic multi-attribute utility function"
      headerAction={
        <Link href="/comparison">
          <Button variant="outline" size="sm" className="gap-1.5 text-xs font-medium">
            <Scale className="w-3.5 h-3.5" /> Full Matrix
          </Button>
        </Link>
      }
    >
      <div className="space-y-3.5">
        {offers.length === 0 ? (
          <div className="py-8 px-4 text-center bg-[#faf7ee] rounded-xl border border-dashed border-[#1e3a8a]/20">
            <Package className="w-6 h-6 text-[#1d4ed8] mx-auto mb-2 opacity-70" />
            <h4 className="font-bold text-xs text-[#172554]">No Supplier Quotes Submitted Yet</h4>
            <p className="text-[11px] text-[#1e3a8a] mt-0.5 max-w-xs mx-auto">
              Only eligible suppliers with the exact product in their active catalogue and sufficient inventory receive this RFQ.
            </p>
          </div>
        ) : (
          offers.map((offer) => {
            const isWinner = offer.isRecommended;
            const isMalicious = offer.sellerAgentId?.includes('seller-c') || offer.hiddenFeeDetected;

            return (
              <div
                key={offer.id || offer.sellerAgentId}
                className={`p-4 rounded-xl border transition-all text-[#172554] ${
                  isWinner
                    ? 'bg-[#fffdf9] border-2 border-[#1d4ed8] shadow-xs'
                    : isMalicious
                    ? 'bg-[#f4efe3] border border-[#172554]'
                    : 'bg-[#fffdf9] border border-[#1e3a8a]/20 hover:border-[#1d4ed8]'
                }`}
              >
                {/* Round Badge + Utility Score */}
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] text-[#1e3a8a] font-mono">
                    Round {offer.roundNumber} Quote
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] text-[#1e3a8a] font-mono">Utility Score</span>
                    <span
                      className={`text-xs font-mono font-bold ${
                        (offer.utilityScore || 0) >= 80 ? 'text-[#1d4ed8]' : 'text-[#172554]'
                      }`}
                    >
                      {offer.utilityScore ? offer.utilityScore.toFixed(1) : '—'} / 100
                    </span>
                  </div>
                </div>

                {/* Pricing & Units */}
                <div className="flex items-baseline justify-between mb-3">
                  <div>
                    <span className="text-xl font-bold font-mono text-[#172554]">
                      {formatINR(offer.totalPrice)}
                    </span>
                    <span className="text-xs text-[#1e3a8a] font-mono ml-2">
                      ({formatINR(offer.unitPrice)} / unit)
                    </span>
                  </div>
                  {offer.resaleMarginProjected !== null && offer.resaleMarginProjected !== undefined && (
                    <div className="text-right">
                      <span className="text-[10px] text-[#1e3a8a] block">Projected Margin</span>
                      <span className="text-xs font-mono font-bold text-[#1d4ed8]">
                        {Number(offer.resaleMarginProjected).toFixed(2)}%
                      </span>
                    </div>
                  )}
                </div>

                {/* Fulfillment SLA & Quality */}
                <div className="grid grid-cols-2 gap-2 text-xs py-2 border-y border-[#1e3a8a]/10 mb-3 text-[#172554]">
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-[#1e3a8a]" />
                    <span>{offer.deliveryHours}h Delivery</span>
                  </div>
                  <div className="flex items-center gap-1.5 justify-end">
                    <Award className="w-3.5 h-3.5 text-[#1e3a8a]" />
                    <span>{offer.qualityGrade || 'Standard'}</span>
                  </div>
                </div>

                {/* Security Flags */}
                {offer.hiddenFeeDetected && (
                  <div className="p-2 mb-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-800 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                    <span>Hidden Logistics Surcharge Detected</span>
                  </div>
                )}

                {/* Winner Badge or Accept CTA */}
                {isWinner ? (
                  <div className="flex items-center justify-between pt-1">
                    <div className="flex items-center gap-1.5 text-xs text-[#1d4ed8] font-bold">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Recommended Proposal</span>
                    </div>
                    {!isClosed && onSelectOffer && (
                      <Button
                        variant="primary"
                        size="sm"
                        disabled={isSecuringDeal}
                        onClick={() => onSelectOffer(offer)}
                        className="gap-1.5 text-xs font-bold"
                      >
                        {isSecuringDeal ? 'Securing Deal...' : `Select Deal (${formatINR(offer.totalPrice)})`}
                      </Button>
                    )}
                  </div>
                ) : (
                  !isClosed && onSelectOffer && (
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={isSecuringDeal}
                      onClick={() => onSelectOffer(offer)}
                      className="w-full text-xs font-bold"
                    >
                      {isSecuringDeal ? 'Securing Deal...' : `Select Deal (${formatINR(offer.totalPrice)})`}
                    </Button>
                  )
                )}
              </div>
            );
          })
        )}
      </div>
    </Card>
  );
}
