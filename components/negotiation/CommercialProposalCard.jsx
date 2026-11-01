'use client';

import React from 'react';
import { formatINR } from '../../utils/formatters';
import {
  Clock,
  ShieldCheck,
  Award,
  CreditCard,
  Package,
  Layers,
  Info,
  CheckCircle2,
  Tag,
  Truck,
  IndianRupee,
} from 'lucide-react';

export default function CommercialProposalCard({
  proposal,
  isMalicious = false,
  senderRole = 'SUPPLIER_REP',
}) {
  if (!proposal || typeof proposal !== 'object') return null;

  const unitPrice = proposal.unitPrice || 0;
  const quantity = proposal.quantity || 1;
  const totalPrice = proposal.totalPrice || unitPrice * quantity;
  const deliveryHours = proposal.deliveryLeadTimeHours || proposal.deliveryHours || 24;
  const qualityGrade = proposal.qualityGrade || 'Enterprise Grade';
  const warrantyMonths = proposal.warrantyMonths || 12;
  const paymentMethod = proposal.paymentMethodRequested || proposal.paymentMethod || 'MOCK_UPI';
  const notes = proposal.notes || '';
  const declaredFees = proposal.declaredFees || 0;

  return (
    <div className="mt-3 rounded-xl border border-[#1e3a8a]/25 bg-[#fffdf9] shadow-xs overflow-hidden text-[#172554]">
      {/* Top Banner */}
      <div className="px-3.5 py-2 bg-[#f4efe3] border-b border-[#1e3a8a]/20 flex items-center justify-between text-xs">
        <div className="flex items-center gap-1.5 font-bold text-[#172554]">
          <Tag className="w-3.5 h-3.5 text-[#1d4ed8]" />
          <span>Commercial Proposal Specifications</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-[#1e3a8a] font-mono">
            {quantity} Units × {formatINR(unitPrice)}
          </span>
          <span className="font-mono font-bold text-[#faf7ee] text-xs px-2 py-0.5 rounded bg-[#1d4ed8] border border-[#1d4ed8]">
            {formatINR(totalPrice)}
          </span>
        </div>
      </div>

      {/* Grid of Key Commercial Terms */}
      <div className="p-3.5 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div className="p-2 rounded-lg bg-[#faf7ee] border border-[#1e3a8a]/20">
          <div className="flex items-center gap-1.5 text-[#1e3a8a] text-[10px] mb-1 font-medium">
            <IndianRupee className="w-3 h-3 text-[#1d4ed8]" />
            <span>Unit Wholesale Price</span>
          </div>
          <div className="font-bold text-[#172554] font-mono text-sm">
            {formatINR(unitPrice)}
          </div>
          <div className="text-[10px] text-[#1e3a8a]/70">Per single item</div>
        </div>

        <div className="p-2 rounded-lg bg-[#faf7ee] border border-[#1e3a8a]/20">
          <div className="flex items-center gap-1.5 text-[#1e3a8a] text-[10px] mb-1 font-medium">
            <Truck className="w-3 h-3 text-[#1d4ed8]" />
            <span>Fulfillment SLA</span>
          </div>
          <div className="font-bold text-[#172554] font-mono text-sm">
            {deliveryHours} Hours
          </div>
          <div className="text-[10px] text-[#1e3a8a]/70">Guaranteed dispatch</div>
        </div>

        <div className="p-2 rounded-lg bg-[#faf7ee] border border-[#1e3a8a]/20">
          <div className="flex items-center gap-1.5 text-[#1e3a8a] text-[10px] mb-1 font-medium">
            <ShieldCheck className="w-3 h-3 text-[#1d4ed8]" />
            <span>Quality Certification</span>
          </div>
          <div className="font-bold text-[#172554] text-xs truncate">
            {qualityGrade}
          </div>
          <div className="text-[10px] text-[#1e3a8a]/70">Standard verified</div>
        </div>

        <div className="p-2 rounded-lg bg-[#faf7ee] border border-[#1e3a8a]/20">
          <div className="flex items-center gap-1.5 text-[#1e3a8a] text-[10px] mb-1 font-medium">
            <Award className="w-3 h-3 text-[#1d4ed8]" />
            <span>Warranty Coverage</span>
          </div>
          <div className="font-bold text-[#172554] font-mono text-sm">
            {warrantyMonths} Months
          </div>
          <div className="text-[10px] text-[#1e3a8a]/70">Direct replacement</div>
        </div>
      </div>

      {/* Extra Row: Settlement Method & Commercial Notes */}
      {(paymentMethod || notes || declaredFees > 0) && (
        <div className="px-3.5 py-2.5 bg-[#f4efe3] border-t border-[#1e3a8a]/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-[11px]">
          <div className="flex items-center gap-2">
            <span className="text-[#1e3a8a] font-mono">Payment Rails:</span>
            <span className="font-mono font-bold text-[#172554] bg-[#fffdf9] px-1.5 py-0.5 rounded border border-[#1e3a8a]/20">
              {paymentMethod}
            </span>
          </div>
          {notes && (
            <div className="text-[#1e3a8a] italic truncate max-w-md">
              "{notes}"
            </div>
          )}
        </div>
      )}
    </div>
  );
}
