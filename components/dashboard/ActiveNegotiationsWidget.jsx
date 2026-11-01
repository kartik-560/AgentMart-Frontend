'use client';

import React from 'react';
import Card from '../shared/Card';
import StatusBadge from '../shared/StatusBadge';
import Button from '../shared/Button';
import Link from 'next/link';
import { formatINR } from '../../utils/formatters';
import {
  ArrowRight,
  Clock,
  Box,
  Play,
  CheckCircle2,
  Bot,
  PlusCircle,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';

export default function ActiveNegotiationsWidget({
  negotiations = [],
  loading = false,
  onOpenRfqModal,
}) {
  // Only display actively running / unconcluded negotiations
  const activeSessions = negotiations.filter(
    (item) => item.status !== 'APPROVED' && item.status !== 'SETTLED'
  );

  return (
    <Card
      title="Active Multi-Agent Negotiations"
      subtitle="Autonomous sessions across competing suppliers"
      headerAction={
        <Link href="/negotiation">
          <Button variant="outline" size="sm" className="gap-1.5 text-xs py-1 px-2.5">
            Enter Live Room <ArrowRight className="w-3.5 h-3.5" />
          </Button>
        </Link>
      }
    >
      {/* Loader state if data is still fetching */}
      {loading ? (
        <div className="space-y-3 py-1">
          {[1, 2].map((i) => (
            <div
              key={i}
              className="p-3.5 rounded-xl bg-[#faf7ee] border border-[#1e3a8a]/15 animate-pulse flex items-center justify-between"
            >
              <div className="flex items-center gap-3 flex-1">
                <div className="w-9 h-9 rounded-xl bg-[#f4efe3]" />
                <div className="space-y-1.5 flex-1 max-w-xs">
                  <div className="h-3.5 bg-[#f4efe3] rounded w-4/5" />
                  <div className="h-2.5 bg-[#f4efe3] rounded w-1/2" />
                </div>
              </div>
              <div className="w-20 h-7 bg-[#f4efe3] rounded-lg" />
            </div>
          ))}
          <div className="text-center py-2 text-[11px] text-[#1e3a8a] font-mono flex items-center justify-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#1d4ed8] animate-ping" />
            <span>Fetching live autonomous sessions...</span>
          </div>
        </div>
      ) : (
        <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1 custom-scrollbar">
          {activeSessions.length === 0 ? (
            <div className="text-center py-6 px-4 rounded-xl bg-[#faf7ee] border border-[#1e3a8a]/20 space-y-2">
              <CheckCircle2 className="w-7 h-7 text-[#1d4ed8] mx-auto" />
              <p className="text-xs font-bold text-[#172554]">No Active RFQ Sessions</p>
              <p className="text-[11px] text-[#1e3a8a] max-w-sm mx-auto">
                All previous procurement negotiations have successfully converged and been closed upon settlement authorization.
              </p>
              {onOpenRfqModal && (
                <button
                  type="button"
                  onClick={onOpenRfqModal}
                  className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1d4ed8] hover:bg-[#1e3a8a] text-[#faf7ee] text-xs font-bold transition-colors"
                >
                  <PlusCircle className="w-3.5 h-3.5" /> Launch New Procurement RFQ
                </button>
              )}
            </div>
          ) : (
            <>
              {/* Primary Active Session Cards */}
              {activeSessions.map((item) => (
                <div
                  key={item.id}
                  className="p-3.5 rounded-xl bg-[#faf7ee] border border-[#1e3a8a]/20 hover:border-[#1d4ed8] transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-[#172554] shadow-xs"
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="p-2 rounded-xl bg-[#f4efe3] text-[#1d4ed8] border border-[#1e3a8a]/20 shrink-0 mt-0.5">
                      <Box className="w-4 h-4 text-[#1d4ed8]" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs font-bold text-[#172554] truncate">
                          {item.title}
                        </h4>
                      </div>
                      <div className="flex flex-wrap items-center gap-2 text-[11px] text-[#1e3a8a] mt-1 font-mono">
                        <span className="text-[#1d4ed8] font-bold">Round {item.currentRound || 2}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-[#1e3a8a]" /> Max {item.maxDeliveryHours || 48}h SLA
                        </span>
                        <span>•</span>
                        <span className="text-[#172554] font-semibold">Budget: {formatINR(item.maxBudget || 50000)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                    <StatusBadge status={item.status || 'PENDING_HUMAN_APPROVAL'} size="xs" />
                    <Link href={`/negotiation?id=${item.id}`}>
                      <Button variant="primary" size="sm" className="text-xs py-1 px-2.5 gap-1.5 bg-[#1d4ed8] hover:bg-[#1e3a8a] text-[#faf7ee] font-bold">
                        <Play className="w-3 h-3" /> Live Feed
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}

              {/* Complementary Multi-Agent Swarm Status Panel to balance height when alerts are high */}
              {activeSessions.length === 1 && (
                <div className="p-3.5 rounded-xl bg-[#f4efe3] border border-[#1e3a8a]/25 text-[#172554] space-y-2.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-[#172554] flex items-center gap-1.5">
                      <Bot className="w-3.5 h-3.5 text-[#1d4ed8]" />
                      <span>Autonomous Negotiation Fleet Status</span>
                    </span>
                    <span className="text-[10px] font-mono text-[#1d4ed8] font-bold uppercase">
                      3 Agents Active
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px]">
                    <div className="p-2 rounded-lg bg-[#fffdf9] border border-[#1e3a8a]/20">
                      <div className="font-semibold text-[#172554] truncate">Prism Wholesale</div>
                      <div className="text-[10px] text-[#1e3a8a] flex items-center gap-1 mt-0.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#1d4ed8]" />
                        <span>Price Priority</span>
                      </div>
                    </div>

                    <div className="p-2 rounded-lg bg-[#fffdf9] border border-[#1e3a8a]/20">
                      <div className="font-semibold text-[#172554] truncate">SwiftQuality</div>
                      <div className="text-[10px] text-[#1e3a8a] flex items-center gap-1 mt-0.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#1d4ed8]" />
                        <span>20h Fast SLA</span>
                      </div>
                    </div>

                    <div className="p-2 rounded-lg bg-[#fffdf9] border border-[#1e3a8a]/20">
                      <div className="font-semibold text-[#172554] truncate">ShadowBot</div>
                      <div className="text-[10px] text-[#1e3a8a] flex items-center gap-1 mt-0.5">
                        <ShieldCheck className="w-3 h-3 text-[#1d4ed8]" />
                        <span>Quarantined</span>
                      </div>
                    </div>
                  </div>

                  {onOpenRfqModal && (
                    <div className="pt-1 flex items-center justify-between border-t border-[#1e3a8a]/15 text-[11px]">
                      <span className="text-[#1e3a8a]">Need to source additional inventory?</span>
                      <button
                        type="button"
                        onClick={onOpenRfqModal}
                        className="text-[#1d4ed8] font-bold hover:underline flex items-center gap-1"
                      >
                        <PlusCircle className="w-3 h-3" />
                        <span>Broadcast Another RFQ</span>
                      </button>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </Card>
  );
}
