'use client';

import React, { useState, useEffect } from 'react';
import Card from '../../components/shared/Card';
import Button from '../../components/shared/Button';
import StatusBadge from '../../components/shared/StatusBadge';
import { useBusiness } from '../../context/BusinessContext';
import { useUI } from '../../context/UIContext';
import { businessService } from '../../services/agentService';
import {
  Building2,
  Save,
  Brain,
  Award,
} from 'lucide-react';

export default function BusinessProfilePage() {
  const { profile, setProfile } = useBusiness();
  const { showToast } = useUI();

  const [formData, setFormData] = useState({
    name: 'Apex Retail Enterprises',
    businessType: 'RETAIL_ENTERPRISE',
    registrationNumber: 'IN-APX-2024-8891',
    budgetLimit: 50000,
    targetResaleMargin: 25.0,
    minAcceptableMargin: 18.0,
    maxDeliveryHours: 48,
    qualityTierRequirement: 'Enterprise',
    riskTolerance: 'BALANCED',
    contactEmail: 'procurement@apexretail.in',
    contactPhone: '+91 98765 43210',
  });

  const [weights, setWeights] = useState({
    price: 40,
    delivery: 25,
    quality: 20,
    reliability: 15,
  });

  const [learnedPolicies, setLearnedPolicies] = useState([
    {
      id: 'pol-01',
      title: 'Supplier A Volume Loyalty Advantage',
      description: 'Prism Wholesale consistently offers 24.5% margin on orders exceeding 10 units. Recommend setting default benchmark target to 26%.',
      suggestedDate: '2026-10-28',
      status: 'PENDING_APPROVAL',
      impactScore: '+2.1% Net Margin',
    },
    {
      id: 'pol-02',
      title: 'Expedited SLA Priority Trigger',
      description: 'For IT Infrastructure categories, SwiftQuality 20h dispatch eliminates enterprise downtime risk even at a 6.8% price premium.',
      suggestedDate: '2026-10-25',
      status: 'ADOPTED',
      impactScore: 'Zero Late Shipments',
    },
    {
      id: 'pol-03',
      title: 'Zero-Tolerance Surcharge Guardrail',
      description: 'Auto-isolate any supplier payload containing fee keywords (clearance, administrative, handling) in unstructured free-text.',
      suggestedDate: '2026-10-20',
      status: 'ACTIVE_GUARDRAIL',
      impactScore: '100% Interception',
    },
  ]);

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (profile) {
      setFormData((prev) => ({ ...prev, ...profile }));
    }
  }, [profile]);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await businessService.updateProfile({
        ...formData,
        utilityWeights: {
          price: weights.price / 100,
          delivery: weights.delivery / 100,
          quality: weights.quality / 100,
          reliability: weights.reliability / 100,
        },
      });
      if (res?.data) {
        setProfile(res.data);
      }
      showToast('Business profile and deterministic parameters saved!', 'success');
    } catch {
      showToast('Saved profile preferences in local session cache.', 'info');
    } finally {
      setSaving(false);
    }
  };

  const handleAdoptPolicy = (policyId) => {
    setLearnedPolicies((prev) =>
      prev.map((p) => (p.id === policyId ? { ...p, status: 'ADOPTED' } : p))
    );
    showToast('Business Memory policy adopted into procurement rules.', 'success');
  };

  const totalWeight = weights.price + weights.delivery + weights.quality + weights.reliability;

  return (
    <div className="space-y-6 text-[#172554]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-[#172554] flex items-center gap-2">
            <Building2 className="w-6 h-6 text-[#1d4ed8] shrink-0" /> Business Profile & Procurement Intelligence
          </h1>
          <p className="text-xs sm:text-sm text-[#1e3a8a] mt-1">
            Enterprise procurement identity, deterministic constraints, multi-criteria objective weights, and Business Memory.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Commercial Constraints & Weighting Sliders */}
        <div className="lg:col-span-7 xl:col-span-8 space-y-6">
          {/* Main Parameters Form */}
          <Card
            title="Commercial & Purchasing Constraints"
            subtitle="Deterministic boundaries enforced by the financial validator"
          >
            <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#172554] mb-1">
                    Enterprise Legal Name
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 bg-[#faf7ee] border border-[#1e3a8a]/30 rounded-lg text-[#172554] text-xs focus:outline-none focus:border-[#1d4ed8]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#172554] mb-1">
                    GST / Business Registration ID
                  </label>
                  <input
                    type="text"
                    readOnly
                    value={formData.registrationNumber}
                    className="w-full px-3 py-2 bg-[#f4efe3] border border-[#1e3a8a]/20 rounded-lg text-[#1e3a8a] font-mono text-xs cursor-not-allowed"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-bold text-[#172554] mb-1">
                    Budget Ceiling (INR)
                  </label>
                  <input
                    type="number"
                    value={formData.budgetLimit}
                    onChange={(e) => setFormData({ ...formData, budgetLimit: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-[#faf7ee] border border-[#1e3a8a]/30 rounded-lg text-[#1d4ed8] font-mono font-bold text-xs focus:outline-none focus:border-[#1d4ed8]"
                  />
                  <span className="text-[10px] text-[#1e3a8a]">Unrestricted Procurement Budget</span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#172554] mb-1">
                    Target Resale Margin (%)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    value={formData.targetResaleMargin}
                    onChange={(e) => setFormData({ ...formData, targetResaleMargin: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-[#faf7ee] border border-[#1e3a8a]/30 rounded-lg text-[#172554] font-mono text-xs focus:outline-none focus:border-[#1d4ed8]"
                  />
                  <span className="text-[10px] text-[#1e3a8a]">Minimum Floor: 18.0%</span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#172554] mb-1">
                    Max Delivery SLA (Hours)
                  </label>
                  <input
                    type="number"
                    value={formData.maxDeliveryHours}
                    onChange={(e) => setFormData({ ...formData, maxDeliveryHours: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-[#faf7ee] border border-[#1e3a8a]/30 rounded-lg text-[#172554] font-mono text-xs focus:outline-none focus:border-[#1d4ed8]"
                  />
                  <span className="text-[10px] text-[#1e3a8a]">Max limit: 48 hours</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-bold text-[#172554] mb-1">
                    Risk Tolerance Strategy
                  </label>
                  <select
                    value={formData.riskTolerance}
                    onChange={(e) => setFormData({ ...formData, riskTolerance: e.target.value })}
                    className="w-full px-3 py-2 bg-[#faf7ee] border border-[#1e3a8a]/30 rounded-lg text-[#172554] text-xs focus:outline-none focus:border-[#1d4ed8]"
                  >
                    <option value="CONSERVATIVE">Conservative (Strict Quality & SLA)</option>
                    <option value="BALANCED">Balanced (Optimized Value & Speed)</option>
                    <option value="AGGRESSIVE">Aggressive (Price-First Maximization)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#172554] mb-1">
                    Settlement Protocol
                  </label>
                  <input
                    type="text"
                    readOnly
                    value="MOCK_UPI (Mandatory Escrow Validation)"
                    className="w-full px-3 py-2 bg-[#f4efe3] border border-[#1e3a8a]/20 rounded-lg text-[#1d4ed8] font-mono text-xs cursor-not-allowed font-bold"
                  />
                </div>
              </div>

              <div className="pt-3 flex justify-end">
                <Button type="submit" variant="primary" size="sm" loading={saving} className="gap-2 font-bold">
                  <Save className="w-4 h-4" /> Save Profile Constraints
                </Button>
              </div>
            </form>
          </Card>

          {/* Buyer Preferences: Objective Weighting Sliders */}
          <Card
            title="Decision Engine Objective Function Weights"
            subtitle="Tune multi-attribute utility weights: U = wp·Sp + wd·Sd + wq·Sq + wr·Sr"
            headerAction={
              <span
                className={`font-mono text-xs px-2.5 py-0.5 rounded-full border ${
                  totalWeight === 100
                    ? 'bg-[#f4efe3] text-[#1d4ed8] border-[#1e3a8a]/30 font-bold'
                    : 'bg-[#faf7ee] text-[#172554] border-[#1e3a8a]/20'
                }`}
              >
                Sum: {totalWeight}% {totalWeight === 100 ? '✓' : '(Must equal 100%)'}
              </span>
            }
          >
            <div className="space-y-4 text-xs">
              {/* Price weight */}
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-[#172554] font-bold">Price & Resale Margin Weight (wp)</span>
                  <span className="font-mono text-[#1d4ed8] font-bold">{weights.price}%</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="70"
                  value={weights.price}
                  onChange={(e) => setWeights({ ...weights, price: Number(e.target.value) })}
                  className="w-full h-1.5 bg-[#f4efe3] rounded-lg appearance-none cursor-pointer accent-[#1d4ed8]"
                />
              </div>

              {/* Delivery weight */}
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-[#172554] font-bold">Delivery Speed SLA Weight (wd)</span>
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

              {/* Quality weight */}
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-[#172554] font-bold">Product Quality & Warranty Weight (wq)</span>
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

              {/* Reliability weight */}
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-[#172554] font-bold">Supplier Historical Reliability (wr)</span>
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
            </div>
          </Card>

          {/* Seller Objectives Matrix */}
          <Card
            title="Seller Objectives & Strategies"
            subtitle="Comparing underlying enterprise postures across competing supplier bots"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 text-xs">
              <div className="p-3.5 rounded-xl bg-[#faf7ee] border border-[#1e3a8a]/20 space-y-2">
                <span className="text-xs font-bold text-[#172554] block">
                  Prism Wholesale (Seller A)
                </span>
                <p className="text-[#1e3a8a] text-[11px] leading-relaxed">
                  <strong>Objective:</strong> High inventory turnover and volume lock-in. Concedes on price down to 10% gross margin with 40h standard fulfillment.
                </p>
                <div className="text-[10px] font-mono text-[#172554] pt-1 border-t border-[#1e3a8a]/15 font-bold">
                  Floor Price: ₹3,500 | Min Margin: 10%
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-[#faf7ee] border border-[#1e3a8a]/20 space-y-2">
                <span className="text-xs font-bold text-[#172554] block">
                  SwiftQuality (Seller B)
                </span>
                <p className="text-[#1e3a8a] text-[11px] leading-relaxed">
                  <strong>Objective:</strong> Premium positioning. Defends higher margins (18-25%) by offering 20-hour rapid dispatch and 3-year enterprise warranties.
                </p>
                <div className="text-[10px] font-mono text-[#172554] pt-1 border-t border-[#1e3a8a]/15 font-bold">
                  Floor Price: ₹3,950 | Min Margin: 18%
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-[#faf7ee] border border-[#172554]/30 space-y-2">
                <span className="text-xs font-bold text-[#172554] block">
                  Vortex Trade (Seller C)
                </span>
                <p className="text-[#1e3a8a] text-[11px] leading-relaxed">
                  <strong>Objective:</strong> Adversarial simulation. Tests buyer defenses by quoting artificially low unit rates combined with hidden logistics clearance surcharges.
                </p>
                <div className="text-[10px] font-mono text-[#172554] pt-1 border-t border-[#1e3a8a]/15 font-bold">
                  Status: Monitored Threat Simulation
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column: Business Memory & Supplier Reliability */}
        <div className="lg:col-span-5 xl:col-span-4 space-y-6">
          {/* Business Memory Insights Card */}
          <Card
            title="Business Memory Engine"
            subtitle="Learned policies from historical multi-agent interactions"
            icon={Brain}
          >
            <div className="space-y-3.5">
              {learnedPolicies.map((policy) => {
                const isAdopted = policy.status === 'ADOPTED' || policy.status === 'ACTIVE_GUARDRAIL';

                return (
                  <div
                    key={policy.id}
                    className="p-3.5 rounded-xl bg-[#faf7ee] border border-[#1e3a8a]/20 text-xs space-y-2 text-[#172554]"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[#172554] text-xs">{policy.title}</span>
                      <StatusBadge status={isAdopted ? 'ACTIVE' : 'PENDING'} size="xs" />
                    </div>

                    <p className="text-[11px] text-[#1e3a8a] leading-relaxed">
                      &ldquo;{policy.description}&rdquo;
                    </p>

                    <div className="flex items-center justify-between pt-1 border-t border-[#1e3a8a]/15 text-[10px]">
                      <span className="text-[#1d4ed8] font-mono font-bold">{policy.impactScore}</span>
                      {!isAdopted ? (
                        <Button
                          variant="outline"
                          size="xs"
                          onClick={() => handleAdoptPolicy(policy.id)}
                          className="text-[10px] py-0.5 font-bold"
                        >
                          Adopt Policy
                        </Button>
                      ) : (
                        <span className="text-[#172554] font-mono font-bold">Enforced</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Supplier Historical Reliability Scorecards */}
          <Card
            title="Supplier Reliability Scores"
            subtitle="Business Memory continuous tracking"
            icon={Award}
          >
            <div className="space-y-3 text-xs text-[#172554]">
              <div className="p-3 rounded-xl bg-[#faf7ee] border border-[#1e3a8a]/20 space-y-1.5">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-[#172554]">Prism Wholesale Direct</span>
                  <span className="font-mono text-[#1d4ed8] font-bold">92 / 100</span>
                </div>
                <div className="flex justify-between text-[11px] text-[#1e3a8a]">
                  <span>On-Time: 94.2%</span>
                  <span>Disputes: 0</span>
                  <span>Quality: 88%</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-[#faf7ee] border border-[#1e3a8a]/20 space-y-1.5">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-[#172554]">SwiftQuality Logistics</span>
                  <span className="font-mono text-[#1d4ed8] font-bold">98 / 100</span>
                </div>
                <div className="flex justify-between text-[11px] text-[#1e3a8a]">
                  <span>On-Time: 99.4%</span>
                  <span>Disputes: 0</span>
                  <span>Quality: 98%</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-[#faf7ee] border border-[#172554]/30 space-y-1.5">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-[#172554]">Vortex Dynamic Trade (Agent C)</span>
                  <span className="font-mono text-[#172554] font-bold">38 / 100</span>
                </div>
                <div className="flex justify-between text-[11px] text-[#1e3a8a]">
                  <span>On-Time: 40.0%</span>
                  <span>Disputes: 4</span>
                  <span>Anomalies: 9</span>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
