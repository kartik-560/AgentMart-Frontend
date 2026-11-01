'use client';

import React from 'react';
import { Bot, ShieldAlert, Zap, Building2, Tag, ShieldCheck, AlertTriangle, Package, Boxes, CheckCircle2 } from 'lucide-react';
import StatusBadge from '../shared/StatusBadge';

const cleanAgentName = (name) => {
  if (!name) return '';
  return name.replace(/\s*\(?gemini[- ]?2\.0\)?/gi, '').trim();
};

export default function AgentParticipantsBar({
  agents = [],
  negotiation = null,
  activeRound = 1,
  activeAgent = null,
  isAutonomous = true,
}) {
  // 1. Resolve Buyer Agent
  const buyerAgent = agents.find((a) => a.agentType === 'BUYER') || (
    negotiation?.buyerAgent ? {
      id: negotiation.buyerAgent.id,
      name: negotiation.buyerAgent.name,
      agentType: 'BUYER',
      business: negotiation.buyerBusiness,
      trustScore: negotiation.buyerAgent.trustScore || 98.5,
      status: 'ACTIVE',
    } : {
      id: 'buyer-default',
      name: 'Buyer Autonomous Agent',
      agentType: 'BUYER',
      business: { name: negotiation?.buyerBusiness?.name || 'Enterprise Buyer' },
      trustScore: 98.5,
      status: 'ACTIVE',
    }
  );

  // 2. Resolve ONLY Eligible Seller Agents from negotiation metadata or participants (strictly deduplicated)
  const eligibleSellers = negotiation?.metadata?.eligibleParticipants || [];
  const targetProduct = negotiation?.targetProduct;
  const targetQuantity = negotiation?.targetQuantity || 1;

  // Deduplicate strictly by businessId or agentId to prevent any duplicate participant cards
  const uniqueSellersMap = new Map();
  (eligibleSellers.length > 0 ? eligibleSellers : agents.filter((a) => a.agentType !== 'BUYER')).forEach((s) => {
    const key = s.businessId || s.agentId || s.id;
    if (key && !uniqueSellersMap.has(key)) {
      uniqueSellersMap.set(key, s);
    }
  });
  const participatingSellers = Array.from(uniqueSellersMap.values());

  const noEligibleSellers = eligibleSellers.length === 0 && (
    negotiation?.status === 'NO_ELIGIBLE_SELLERS' ||
    negotiation?.metadata?.noEligibleSellers ||
    (negotiation && participatingSellers.length === 0)
  );

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${noEligibleSellers ? 'bg-amber-500' : 'bg-[#1d4ed8]'}`} />
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#172554] font-mono">
            Autonomous Room Participants ({1 + participatingSellers.length})
          </span>
        </div>
        <div className="flex items-center gap-2 text-[10px] font-mono text-[#1e3a8a]">
          <span>Product-Gated Participation</span>
          <span>•</span>
          <span className="font-bold">Zero-Trust Guard: ACTIVE</span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {/* Buyer Agent Card */}
        <div className="px-3.5 py-3 rounded-xl border border-[#1e3a8a]/20 bg-[#fffdf9] flex items-center justify-between gap-2.5 text-[#172554] shadow-xs">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="p-2 rounded-lg border text-[#1d4ed8] bg-[#f4efe3] border-[#1e3a8a]/20 relative shrink-0">
              <Building2 className="w-4 h-4" />
              <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-[#1d4ed8]" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <h4 className="text-xs font-bold text-[#172554] truncate">
                  {cleanAgentName(buyerAgent.name)}
                </h4>
                <span className="px-1.5 py-0.2 rounded bg-[#f4efe3] text-[9px] font-mono font-bold text-[#1d4ed8] border border-[#1e3a8a]/20 shrink-0">
                  BUYER
                </span>
              </div>
              <div className="text-[10px] text-[#1e3a8a] truncate mt-0.5">
                {buyerAgent.business?.name || 'Enterprise Procurement'}
              </div>
              <div className="text-[10px] text-emerald-700 font-mono mt-0.5 font-bold">
                Seeking {targetQuantity}x {targetProduct?.name || 'Item'}
              </div>
            </div>
          </div>
          <div className="shrink-0">
            <StatusBadge status="ACTIVE" size="xs" />
          </div>
        </div>

        {/* Eligible Seller Agent Cards */}
        {participatingSellers.map((seller) => {
          const bizName = seller.businessName || seller.business?.name || 'Verified Supplier';
          const agentName = cleanAgentName(seller.agentName || seller.name || 'Sales Agent');
          const productName = seller.productName || targetProduct?.name || 'Matched Product';
          const sku = seller.sku || targetProduct?.sku || 'SKU';
          const availableStock = seller.availableQuantity ?? seller.inventory?.stockQuantity ?? 'Available';
          const isMalicious = seller.agentType === 'SELLER_C_MALICIOUS';

          return (
            <div
              key={seller.agentId || seller.id || seller.businessId}
              className={`px-3.5 py-3 rounded-xl border transition-all bg-[#fffdf9] ${
                isMalicious
                  ? 'border-amber-300 bg-amber-50/30'
                  : 'border-[#1e3a8a]/20 hover:border-[#1d4ed8]'
              } flex items-center justify-between gap-2.5 text-[#172554] shadow-xs`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div
                  className={`p-2 rounded-lg border relative shrink-0 ${
                    isMalicious
                      ? 'text-amber-700 bg-amber-100 border-amber-300'
                      : 'text-[#1d4ed8] bg-[#f4efe3] border-[#1e3a8a]/20'
                  }`}
                >
                  {isMalicious ? <ShieldAlert className="w-4 h-4" /> : <Tag className="w-4 h-4" />}
                  <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-[#1d4ed8]" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <h4 className="text-xs font-bold text-[#172554] truncate" title={agentName}>
                      {agentName}
                    </h4>
                    <span className="px-1.5 py-0.2 rounded bg-[#f4efe3] text-[9px] font-mono font-bold text-[#1e3a8a] border border-[#1e3a8a]/20 shrink-0">
                      SELLER
                    </span>
                  </div>
                  <div className="text-[10px] text-[#1e3a8a] font-semibold truncate mt-0.5" title={bizName}>
                    {bizName}
                  </div>
                  <div className="flex items-center gap-1 text-[10px] text-[#172554] mt-0.5 truncate">
                    <Package className="w-2.5 h-2.5 text-[#1d4ed8] shrink-0" />
                    <span className="font-mono text-[#1d4ed8] font-bold shrink-0">{sku}</span>
                    <span className="text-[#1e3a8a] truncate">• Stock: {availableStock}</span>
                  </div>
                </div>
              </div>

              <div className="shrink-0 flex flex-col items-end gap-1">
                <StatusBadge status={isMalicious ? 'FLAGGED' : 'ACTIVE'} size="xs" />
                <span className="text-[9px] font-mono text-[#1e3a8a] font-bold">
                  {seller.trustScore || 98}% Trust
                </span>
              </div>
            </div>
          );
        })}

        {/* Empty State Banner if NO sellers matched */}
        {noEligibleSellers && (
          <div className="sm:col-span-1 md:col-span-2 lg:col-span-3 p-3.5 rounded-xl border border-dashed border-amber-300 bg-amber-50/60 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-100 text-amber-700 shrink-0">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h4 className="text-xs font-bold text-amber-900">
                No eligible sellers found for this product.
              </h4>
              <p className="text-[11px] text-amber-800 mt-0.5">
                No registered seller has {targetProduct?.name ? <span className="font-semibold">&quot;{targetProduct.name}&quot;</span> : 'this product'} (SKU: {targetProduct?.sku || 'N/A'}) with at least {targetQuantity} units available in their active catalogue.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
