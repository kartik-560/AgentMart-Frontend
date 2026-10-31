'use client';

import React, { useState } from 'react';
import Card from '../../components/shared/Card';
import Button from '../../components/shared/Button';
import { useBusiness } from '../../context/BusinessContext';
import { formatINR } from '../../utils/formatters';
import { Building2, Save, Brain, CheckCircle, ShieldAlert } from 'lucide-react';

export default function BusinessProfilePage() {
  const { profile } = useBusiness();
  const [formData, setFormData] = useState({
    name: 'Apex Retail Enterprises',
    businessType: 'RETAIL_ENTERPRISE',
    registrationNumber: 'IN-APX-2024-8891',
    budgetLimit: 50000,
    targetResaleMargin: 25,
    minAcceptableMargin: 18,
    maxDeliveryHours: 48,
    qualityRequirement: 'Enterprise',
    riskTolerance: 'BALANCED',
    contactEmail: 'procurement@apexretail.in',
  });
  const [saved, setSaved] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
            <Building2 className="w-6 h-6 text-indigo-400" /> Business Profile & Constraints
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Enterprise procurement identity, deterministic parameters, and Business Memory settings.
          </p>
        </div>
        {saved && (
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs">
            <CheckCircle className="w-4 h-4" /> Parameters Saved
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form */}
        <div className="lg:col-span-2">
          <Card title="Commercial & Purchasing Constraints">
            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Enterprise Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Tax / Registration No.</label>
                  <input
                    type="text"
                    readOnly
                    value={formData.registrationNumber}
                    className="w-full px-3 py-2 bg-slate-950/50 border border-slate-800 rounded-lg text-sm text-slate-400 font-mono cursor-not-allowed"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Max Budget Ceiling (INR)</label>
                  <div className="relative">
                    <input
                      type="number"
                      value={formData.budgetLimit}
                      onChange={(e) => setFormData({ ...formData, budgetLimit: Number(e.target.value) })}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-emerald-400 font-mono font-semibold focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <span className="text-[10px] text-slate-500">Deterministic Hard Limit: ₹50,000</span>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Target Resale Margin (%)</label>
                  <input
                    type="number"
                    value={formData.targetResaleMargin}
                    onChange={(e) => setFormData({ ...formData, targetResaleMargin: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-100 font-mono focus:outline-none focus:border-indigo-500"
                  />
                  <span className="text-[10px] text-slate-500">Floor threshold: 18%</span>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Max Delivery SLA (Hours)</label>
                  <input
                    type="number"
                    value={formData.maxDeliveryHours}
                    onChange={(e) => setFormData({ ...formData, maxDeliveryHours: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-100 font-mono focus:outline-none focus:border-indigo-500"
                  />
                  <span className="text-[10px] text-slate-500">Max limit: 48 hours</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Risk Tolerance Strategy</label>
                  <select
                    value={formData.riskTolerance}
                    onChange={(e) => setFormData({ ...formData, riskTolerance: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="CONSERVATIVE">Conservative (Strict Quality & SLA)</option>
                    <option value="BALANCED">Balanced (Optimized Value & Speed)</option>
                    <option value="AGGRESSIVE">Aggressive (Price-First Maximization)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Payment Method</label>
                  <input
                    type="text"
                    readOnly
                    value="MOCK_UPI (Mandatory Escrow Validation)"
                    className="w-full px-3 py-2 bg-slate-950/50 border border-slate-800 rounded-lg text-sm text-indigo-400 font-mono"
                  />
                </div>
              </div>

              <div className="pt-4 flex justify-end">
                <Button type="submit" variant="primary" className="gap-2">
                  <Save className="w-4 h-4" /> Save Profile Constraints
                </Button>
              </div>
            </form>
          </Card>
        </div>

        {/* Business Memory & Continuous Learning */}
        <div className="space-y-6">
          <Card
            title="Business Memory Insights"
            subtitle="Learned from historical supplier performance"
          >
            <div className="space-y-4">
              <div className="p-3 rounded-lg bg-indigo-950/30 border border-indigo-900/50">
                <div className="flex items-center gap-2 text-indigo-300 font-semibold text-xs">
                  <Brain className="w-4 h-4" /> Policy Recommendation (Pending Approval)
                </div>
                <p className="text-xs text-slate-300 mt-1">
                  &ldquo;Seller A consistently delivers above-target margins (24.5%). Recommend raising benchmark target margin to 26%.&rdquo;
                </p>
                <div className="mt-2 text-[10px] text-amber-400 font-medium">
                  Requires explicit owner approval before activating.
                </div>
              </div>

              <div className="space-y-2">
                <span className="text-xs font-medium text-slate-400">Supplier Reliability Scoring:</span>
                <div className="p-2.5 rounded bg-slate-950/60 border border-slate-800 text-xs space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-slate-300">Prism Wholesale (Seller A)</span>
                    <span className="text-emerald-400 font-mono">88 / 100</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-300">SwiftQuality (Seller B)</span>
                    <span className="text-emerald-400 font-mono">96 / 100</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-300">Vortex Trade (Seller C)</span>
                    <span className="text-rose-400 font-mono">32 / 100 (High Risk)</span>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

