'use client';

import React from 'react';
import { formatINR } from '../../utils/formatters';

/**
 * Modern SVG Utility Score Comparison Bar Chart
 * Displays multi-attribute scores (Price, SLA, Quality, Reliability) for competing agents.
 */
export function UtilityBreakdownChart({ offers = [] }) {
  const categories = [
    { key: 'price', label: 'Price & Margin (40%)', weight: '40%' },
    { key: 'delivery', label: 'Delivery SLA (25%)', weight: '25%' },
    { key: 'quality', label: 'Quality & Warranty (20%)', weight: '20%' },
    { key: 'reliability', label: 'Supplier Reliability (15%)', weight: '15%' },
  ];

  return (
    <div className="space-y-4 text-[#172554]">
      {offers.map((offer) => {
        const isMalicious = offer.sellerAgentId?.includes('seller-c') || offer.status === 'FLAGGED';
        const isWinner = offer.isRecommended;

        return (
          <div
            key={offer.id || offer.sellerAgentId}
            className={`p-3.5 rounded-xl border text-xs shadow-xs ${
              isWinner
                ? 'bg-[#fffdf9] border-2 border-[#1d4ed8]'
                : isMalicious
                ? 'bg-[#faf7ee] border border-[#172554]/40'
                : 'bg-[#faf7ee] border border-[#1e3a8a]/20'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="font-bold text-[#172554]">
                  {offer.sellerName || offer.name || offer.sellerAgentId}
                </span>
                {isWinner && (
                  <span className="px-1.5 py-0.2 rounded bg-[#1d4ed8] text-[#faf7ee] text-[10px] font-mono font-bold">
                    RECOMMENDED
                  </span>
                )}
                {isMalicious && (
                  <span className="px-1.5 py-0.2 rounded bg-[#f4efe3] text-[#172554] border border-[#1e3a8a]/30 text-[10px] font-mono font-bold">
                    SECURITY QUARANTINE
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[#1e3a8a] text-[11px]">Utility:</span>
                <span className="font-mono font-bold text-sm text-[#1d4ed8]">
                  {offer.utilityScore ? offer.utilityScore.toFixed(1) : '0.0'} / 100
                </span>
              </div>
            </div>

            {/* Sub-score progress bars */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 pt-1">
              {categories.map((cat) => {
                const subScore = offer.subScores ? offer.subScores[cat.key] || 0 : 0;
                return (
                  <div key={cat.key} className="space-y-1">
                    <div className="flex justify-between text-[10px] text-[#1e3a8a]">
                      <span>{cat.label}</span>
                      <span className="font-mono font-bold text-[#172554]">{subScore.toFixed(0)}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-[#f4efe3] rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full bg-[#1d4ed8] transition-all duration-500"
                        style={{ width: `${Math.min(100, Math.max(0, subScore))}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/**
 * Budget vs Actual Headroom Visual Bar
 */
export function BudgetAllocationBar({ currentTotal, budgetCap = 50000 }) {
  const percentUsed = Math.min(100, Math.round((currentTotal / budgetCap) * 100));
  const isOver = currentTotal > budgetCap;
  const remaining = budgetCap - currentTotal;

  return (
    <div className="px-4 py-2 rounded-xl bg-[#faf7ee] border border-[#1e3a8a]/20 space-y-1.5 text-xs text-[#172554]">
      <div className="flex items-center justify-between">
        <span className="text-[#1e3a8a] text-[11px] font-medium">Deterministic Capital Boundary</span>
        <span className="font-mono text-[11px] text-[#172554]">
          Ceiling: <strong className="text-[#172554] font-bold">{formatINR(budgetCap)}</strong>
        </span>
      </div>

      <div className="w-full h-2 bg-[#f4efe3] rounded-full overflow-hidden p-0.5 border border-[#1e3a8a]/20">
        <div
          className="h-full rounded-full bg-[#1d4ed8] transition-all duration-500"
          style={{ width: `${Math.min(100, percentUsed)}%` }}
        />
      </div>

      <div className="flex justify-between items-center text-[10px]">
        <span className="text-[#1e3a8a]">
          Committed: <strong className="font-mono text-[#172554] font-bold">{formatINR(currentTotal)}</strong> ({percentUsed}%)
        </span>
        <span className="font-mono font-bold text-[#1d4ed8]">
          {isOver ? `Breach: +${formatINR(Math.abs(remaining))}` : `Headroom: ${formatINR(remaining)} under cap`}
        </span>
      </div>
    </div>
  );
}

/**
 * Round-by-Round Price Convergence Trend Line Chart (SVG)
 */
export function PriceConvergenceChart({ offers = [], budgetCap = 50000 }) {
  const cap = Number(budgetCap) > 0 ? Number(budgetCap) : 50000;

  // Extract all offer total prices to dynamically scale the chart
  const validPrices = (offers || [])
    .map((o) => Number(o.totalPrice || o.unitPrice || 0))
    .filter((p) => p > 0);

  const minOffer = validPrices.length > 0 ? Math.min(...validPrices, cap * 0.85) : cap * 0.85;
  const maxOffer = validPrices.length > 0 ? Math.max(...validPrices, cap * 1.1) : cap * 1.1;

  const minVal = Math.max(0, Math.floor(minOffer * 0.95));
  const maxVal = Math.ceil(maxOffer * 1.05);
  const range = maxVal - minVal > 0 ? maxVal - minVal : 1;

  const getY = (val) => Math.max(10, Math.min(120, 120 - ((Number(val) - minVal) / range) * 100));

  // Find latest/active quotes per seller category
  const sellerAOffers = (offers || []).filter((o) => o.sellerType === 'SELLER_A_PRICE');
  const sellerBOffers = (offers || []).filter((o) => o.sellerType === 'SELLER_B_SPEED_QUALITY');
  const sellerCOffers = (offers || []).filter((o) => o.sellerType === 'SELLER_C_MALICIOUS');

  const getPriceAtRound = (sellerList, r, defaultRatio) => {
    const match = sellerList.find((o) => o.roundNumber === r);
    if (match) return Number(match.totalPrice || match.unitPrice);
    if (sellerList.length > 0) return Number(sellerList[sellerList.length - 1].totalPrice);
    return Math.round(cap * defaultRatio);
  };

  const aR1 = getPriceAtRound(sellerAOffers, 1, 0.92);
  const aR2 = getPriceAtRound(sellerAOffers, 2, 0.88);
  const aR3 = getPriceAtRound(sellerAOffers, 3, 0.88);

  const bR1 = getPriceAtRound(sellerBOffers, 1, 0.98);
  const bR2 = getPriceAtRound(sellerBOffers, 2, 0.95);
  const bR3 = getPriceAtRound(sellerBOffers, 3, 0.95);

  const cR1 = getPriceAtRound(sellerCOffers, 1, 1.05);
  const cR2 = getPriceAtRound(sellerCOffers, 2, 1.01);
  const cR3 = getPriceAtRound(sellerCOffers, 3, 1.01);

  return (
    <div className="space-y-3 text-[#172554]">
      <div className="flex flex-wrap items-center justify-between text-xs text-[#1e3a8a] gap-2">
        <div className="flex flex-wrap items-center gap-4">
          <span className="flex items-center gap-1.5 font-medium text-[#172554]">
            <span className="w-2.5 h-2.5 rounded-full bg-[#1d4ed8]" /> Seller A (Price Focus)
          </span>
          <span className="flex items-center gap-1.5 font-medium text-[#172554]">
            <span className="w-2.5 h-2.5 rounded-full bg-[#1e3a8a]" /> Seller B (Speed/Quality)
          </span>
          <span className="flex items-center gap-1.5 font-medium text-[#172554]">
            <span className="w-2.5 h-2.5 rounded-full bg-[#172554]" /> Seller C (Malicious Simulation)
          </span>
        </div>
        <span className="font-mono text-[11px] text-[#172554] border border-[#1e3a8a]/25 px-2 py-0.5 rounded bg-[#f4efe3] font-bold">
          Max Budget Cap: {formatINR(cap)}
        </span>
      </div>

      <div className="relative h-36 w-full bg-[#faf7ee] rounded-xl border border-[#1e3a8a]/20 p-2">
        <svg viewBox="0 0 400 130" className="w-full h-full overflow-visible">
          {/* Budget ceiling line */}
          <line
            x1="20"
            y1={getY(cap)}
            x2="380"
            y2={getY(cap)}
            stroke="#172554"
            strokeDasharray="4 4"
            strokeWidth="1.5"
          />
          <text x="320" y={Math.max(12, getY(cap) - 5)} fill="#172554" fontSize="8" fontFamily="monospace" fontWeight="bold">
            Cap: {formatINR(cap)}
          </text>

          {/* Seller A line (Primary Royal Blue) */}
          <polyline
            fill="none"
            stroke="#1d4ed8"
            strokeWidth="2.5"
            points={`50,${getY(aR1)} 200,${getY(aR2)} 350,${getY(aR3)}`}
          />
          <circle cx="50" cy={getY(aR1)} r="4" fill="#1d4ed8" />
          <circle cx="200" cy={getY(aR2)} r="4" fill="#1d4ed8" />
          <circle cx="350" cy={getY(aR3)} r="5" fill="#1d4ed8" stroke="#faf7ee" strokeWidth="2" />

          {/* Seller B line (Medium Royal Blue) */}
          <polyline
            fill="none"
            stroke="#1e3a8a"
            strokeWidth="2.5"
            points={`50,${getY(bR1)} 200,${getY(bR2)} 350,${getY(bR3)}`}
          />
          <circle cx="50" cy={getY(bR1)} r="4" fill="#1e3a8a" />
          <circle cx="200" cy={getY(bR2)} r="4" fill="#1e3a8a" />
          <circle cx="350" cy={getY(bR3)} r="4" fill="#1e3a8a" />

          {/* Seller C line (Deep Navy) */}
          <polyline
            fill="none"
            stroke="#172554"
            strokeWidth="2"
            strokeDasharray="3 3"
            points={`50,${getY(cR1)} 200,${getY(cR2)} 350,${getY(cR3)}`}
          />
          <circle cx="50" cy={getY(cR1)} r="4" fill="#172554" />
          <circle cx="200" cy={getY(cR2)} r="4" fill="#172554" />
          <circle cx="350" cy={getY(cR3)} r="4" fill="#172554" />
        </svg>
      </div>

      <div className="flex justify-between text-[11px] text-[#1e3a8a] px-6 font-mono font-medium">
        <span>Round 1 Quotes</span>
        <span>Round 2 Counter-Offers</span>
        <span>Round 3 Final Agreement</span>
      </div>
    </div>
  );
}

/**
 * Modern Profit Margin Calculation Card
 */
export function ProfitMarginMeter({ costPrice, sellingPrice, label = 'Projected Resale Margin' }) {
  const profit = sellingPrice - costPrice;
  const marginPercent = sellingPrice > 0 ? ((profit / sellingPrice) * 100).toFixed(1) : 0;

  return (
    <div className="p-3.5 rounded-xl bg-[#faf7ee] border border-[#1e3a8a]/20 space-y-2 text-[#172554]">
      <div className="flex items-center justify-between text-xs">
        <span className="text-[#1e3a8a] font-medium">{label}</span>
        <span className="font-mono font-bold text-[#1d4ed8]">
          {marginPercent}%
        </span>
      </div>

      <div className="w-full h-2 bg-[#f4efe3] rounded-full overflow-hidden">
        <div
          className="h-full rounded-full bg-[#1d4ed8] transition-all duration-500"
          style={{ width: `${Math.min(100, Math.max(0, marginPercent * 2.5))}%` }}
        />
      </div>

      <div className="flex justify-between text-[11px] text-[#1e3a8a] pt-0.5">
        <span>Procurement Cost: {formatINR(costPrice)}</span>
        <span>Resale: {formatINR(sellingPrice)}</span>
        <span className="text-[#1d4ed8] font-mono font-bold">Net Profit: +{formatINR(profit)}</span>
      </div>
    </div>
  );
}
