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
    <div className="space-y-4">
      {offers.map((offer) => {
        const isMalicious = offer.sellerAgentId?.includes('seller-c') || offer.status === 'FLAGGED';
        const isWinner = offer.isRecommended;

        return (
          <div
            key={offer.id || offer.sellerAgentId}
            className={`p-3.5 rounded-xl border text-xs ${
              isWinner
                ? 'bg-emerald-950/20 border-emerald-500/40'
                : isMalicious
                ? 'bg-rose-950/20 border-rose-900/40'
                : 'bg-slate-900/60 border-slate-800'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className={`font-semibold ${isWinner ? 'text-emerald-400' : isMalicious ? 'text-rose-400' : 'text-slate-200'}`}>
                  {offer.sellerName || offer.name || offer.sellerAgentId}
                </span>
                {isWinner && (
                  <span className="px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 text-[10px] font-mono">
                    RECOMMENDED
                  </span>
                )}
                {isMalicious && (
                  <span className="px-1.5 py-0.2 rounded bg-rose-500/10 text-rose-400 border border-rose-500/30 text-[10px] font-mono">
                    SECURITY BREACH
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-slate-400 text-[11px]">Utility:</span>
                <span className={`font-mono font-bold text-sm ${isWinner ? 'text-emerald-400' : isMalicious ? 'text-rose-400' : 'text-indigo-400'}`}>
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
                    <div className="flex justify-between text-[10px] text-slate-400">
                      <span>{cat.label}</span>
                      <span className="font-mono text-slate-300">{subScore.toFixed(0)}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          isMalicious
                            ? 'bg-rose-500'
                            : isWinner
                            ? 'bg-emerald-400'
                            : 'bg-indigo-500'
                        }`}
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
    <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2 text-xs">
      <div className="flex items-center justify-between">
        <span className="text-slate-400 font-medium">Deterministic Capital Boundary</span>
        <span className="font-mono text-slate-300">
          Ceiling: <strong className="text-white">{formatINR(budgetCap)}</strong>
        </span>
      </div>

      <div className="w-full h-3 bg-slate-900 rounded-full overflow-hidden p-0.5 border border-slate-800">
        <div
          className={`h-full rounded-full transition-all duration-500 ${
            isOver ? 'bg-rose-500' : percentUsed > 90 ? 'bg-amber-400' : 'bg-emerald-400'
          }`}
          style={{ width: `${Math.min(100, percentUsed)}%` }}
        />
      </div>

      <div className="flex justify-between items-center text-[11px]">
        <span className="text-slate-400">
          Committed: <strong className="font-mono text-slate-200">{formatINR(currentTotal)}</strong> ({percentUsed}%)
        </span>
        <span className={isOver ? 'text-rose-400 font-bold font-mono' : 'text-emerald-400 font-mono font-medium'}>
          {isOver ? `Breach: +${formatINR(Math.abs(remaining))}` : `Headroom: ${formatINR(remaining)} under cap`}
        </span>
      </div>
    </div>
  );
}

/**
 * Round-by-Round Price Convergence Trend Line Chart (SVG)
 */
export function PriceConvergenceChart() {
  const rounds = [
    { round: 'Round 1 (Initial)', sellerA: 46200, sellerB: 49200, sellerC: 52800 },
    { round: 'Round 2 (Counter)', sellerA: 44400, sellerB: 47400, sellerC: 50400 },
    { round: 'Round 3 (Final)', sellerA: 44400, sellerB: 47400, sellerC: 50400 },
  ];

  const minVal = 42000;
  const maxVal = 55000;
  const range = maxVal - minVal;

  const getY = (val) => 120 - ((val - minVal) / range) * 100;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-xs text-slate-400">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" /> Seller A (Price Focus)
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-400" /> Seller B (Speed/Quality)
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-400" /> Seller C (Malicious + Hidden Fee)
          </span>
        </div>
        <span className="font-mono text-[11px] text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded bg-amber-500/10">
          Max Budget Cap: ₹50,000
        </span>
      </div>

      <div className="relative h-36 w-full bg-slate-950/60 rounded-xl border border-slate-800 p-2">
        <svg viewBox="0 0 400 130" className="w-full h-full overflow-visible">
          {/* Budget ceiling line */}
          <line
            x1="20"
            y1={getY(50000)}
            x2="380"
            y2={getY(50000)}
            stroke="#f59e0b"
            strokeDasharray="4 4"
            strokeWidth="1.5"
          />
          <text x="382" y={getY(50000) + 3} fill="#f59e0b" fontSize="8" fontFamily="monospace">
            ₹50k Cap
          </text>

          {/* Seller A line (Emerald) */}
          <polyline
            fill="none"
            stroke="#34d399"
            strokeWidth="2.5"
            points={`50,${getY(46200)} 200,${getY(44400)} 350,${getY(44400)}`}
          />
          <circle cx="50" cy={getY(46200)} r="4" fill="#34d399" />
          <circle cx="200" cy={getY(44400)} r="4" fill="#34d399" />
          <circle cx="350" cy={getY(44400)} r="5" fill="#34d399" stroke="#0f172a" strokeWidth="2" />

          {/* Seller B line (Blue) */}
          <polyline
            fill="none"
            stroke="#60a5fa"
            strokeWidth="2.5"
            points={`50,${getY(49200)} 200,${getY(47400)} 350,${getY(47400)}`}
          />
          <circle cx="50" cy={getY(49200)} r="4" fill="#60a5fa" />
          <circle cx="200" cy={getY(47400)} r="4" fill="#60a5fa" />
          <circle cx="350" cy={getY(47400)} r="4" fill="#60a5fa" />

          {/* Seller C line (Rose) */}
          <polyline
            fill="none"
            stroke="#f43f5e"
            strokeWidth="2"
            strokeDasharray="3 3"
            points={`50,${getY(52800)} 200,${getY(50400)} 350,${getY(50400)}`}
          />
          <circle cx="50" cy={getY(52800)} r="4" fill="#f43f5e" />
          <circle cx="200" cy={getY(50400)} r="4" fill="#f43f5e" />
          <circle cx="350" cy={getY(50400)} r="4" fill="#f43f5e" />
        </svg>
      </div>

      <div className="flex justify-between text-[11px] text-slate-500 px-6 font-mono">
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
  const isHealthy = marginPercent >= 20;

  return (
    <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
      <div className="flex items-center justify-between text-xs">
        <span className="text-slate-400 font-medium">{label}</span>
        <span className={`font-mono font-bold ${isHealthy ? 'text-emerald-400' : 'text-amber-400'}`}>
          {marginPercent}%
        </span>
      </div>

      <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${
            isHealthy ? 'bg-emerald-500' : 'bg-amber-500'
          }`}
          style={{ width: `${Math.min(100, Math.max(0, marginPercent * 2.5))}%` }}
        />
      </div>

      <div className="flex justify-between text-[11px] text-slate-400 pt-0.5">
        <span>Procurement Cost: {formatINR(costPrice)}</span>
        <span>Resale: {formatINR(sellingPrice)}</span>
        <span className="text-emerald-400 font-mono font-semibold">Net Profit: +{formatINR(profit)}</span>
      </div>
    </div>
  );
}

