'use client';

import React, { useState } from 'react';
import Card from '../shared/Card';
import { formatINR, formatDateTime } from '../../utils/formatters';
import {
  Bot,
  AlertTriangle,
  Sparkles,
  ShieldAlert,
  ArrowRight,
  Package,
  Clock,
  Award,
  Filter,
} from 'lucide-react';

export default function DiscourseFeed({ messages = [], onInspectAlert }) {
  const [selectedSender, setSelectedSender] = useState('ALL');
  const [selectedRound, setSelectedRound] = useState('ALL');

  const filteredMessages = messages.filter((msg) => {
    const matchesSender = selectedSender === 'ALL' || msg.senderRole === selectedSender;
    const matchesRound = selectedRound === 'ALL' || String(msg.roundNumber) === String(selectedRound);
    return matchesSender && matchesRound;
  });

  const getRoleConfig = (role) => {
    switch (role) {
      case 'BUYER':
        return {
          label: 'Apex Autonomous Buyer',
          tag: 'Buyer Agent',
          color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/30',
          bubbleBg: 'bg-indigo-950/20 border-indigo-900/50',
        };
      case 'SELLER_A_PRICE':
        return {
          label: 'Prism PriceBot',
          tag: 'Seller A (Price Focus)',
          color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
          bubbleBg: 'bg-slate-950 border-emerald-950/80',
        };
      case 'SELLER_B_SPEED_QUALITY':
        return {
          label: 'Swift CourierBot',
          tag: 'Seller B (Speed/Quality)',
          color: 'text-blue-400 bg-blue-500/10 border-blue-500/30',
          bubbleBg: 'bg-slate-950 border-blue-950/80',
        };
      case 'SELLER_C_MALICIOUS':
        return {
          label: 'ShadowBot (Agent C)',
          tag: 'Adversarial Simulator',
          color: 'text-rose-400 bg-rose-500/10 border-rose-500/30',
          bubbleBg: 'bg-rose-950/20 border-rose-900/60',
        };
      default:
        return {
          label: role?.replace(/_/g, ' ') || 'Agent',
          tag: 'Agent',
          color: 'text-slate-400 bg-slate-800 border-slate-700',
          bubbleBg: 'bg-slate-950 border-slate-800',
        };
    }
  };

  return (
    <Card
      title="Live Multi-Agent Negotiation Discourse"
      subtitle="Google Gemini 2.0 autonomous reasoning stream"
      headerAction={
        <div className="flex flex-wrap items-center gap-2">
          {/* Filter by Round */}
          <select
            value={selectedRound}
            onChange={(e) => setSelectedRound(e.target.value)}
            className="px-2.5 py-1 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
          >
            <option value="ALL">All Rounds</option>
            <option value="1">Round 1</option>
            <option value="2">Round 2</option>
            <option value="3">Round 3 (Final)</option>
          </select>

          {/* Filter by Sender */}
          <select
            value={selectedSender}
            onChange={(e) => setSelectedSender(e.target.value)}
            className="px-2.5 py-1 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
          >
            <option value="ALL">All Agents</option>
            <option value="BUYER">Apex Buyer</option>
            <option value="SELLER_A_PRICE">Seller A (Prism)</option>
            <option value="SELLER_B_SPEED_QUALITY">Seller B (Swift)</option>
            <option value="SELLER_C_MALICIOUS">Seller C (ShadowBot)</option>
          </select>
        </div>
      }
    >
      <div className="space-y-4 max-h-[580px] overflow-y-auto pr-1">
        {filteredMessages.length === 0 ? (
          <p className="text-center text-xs text-slate-500 py-8">No messages match selected filters.</p>
        ) : (
          filteredMessages.map((msg, idx) => {
            const roleCfg = getRoleConfig(msg.senderRole);
            const isBuyer = msg.senderRole === 'BUYER';
            const isMalicious = msg.senderRole === 'SELLER_C_MALICIOUS';

            return (
              <div
                key={msg.id || idx}
                className={`p-4 rounded-2xl border transition-all ${roleCfg.bubbleBg} ${
                  isBuyer ? 'sm:ml-6' : 'sm:mr-6'
                }`}
              >
                {/* Header row */}
                <div className="flex flex-wrap items-center justify-between gap-2 mb-2 pb-2 border-b border-slate-800/60">
                  <div className="flex items-center gap-2">
                    <span className={`p-1.5 rounded-lg border ${roleCfg.color}`}>
                      <Bot className="w-3.5 h-3.5" />
                    </span>
                    <div>
                      <span className="font-semibold text-xs text-slate-100">{roleCfg.label}</span>
                      <span className="text-[10px] text-slate-400 font-mono ml-2">
                        {roleCfg.tag}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-[10px] font-mono text-slate-400">
                    {msg.intent && (
                      <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300">
                        {msg.intent}
                      </span>
                    )}
                    <span className="px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-bold">
                      Round {msg.roundNumber || 1}
                    </span>
                  </div>
                </div>

                {/* Message Body */}
                <p className="text-xs text-slate-200 leading-relaxed whitespace-pre-wrap">
                  {msg.content}
                </p>

                {/* Embedded Proposal Details if attached */}
                {msg.proposal && (
                  <div className="mt-3 p-3 rounded-xl bg-slate-950/80 border border-slate-800/90 text-xs grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <div>
                      <span className="text-[10px] text-slate-500 block">Quoted Unit Price</span>
                      <span className="font-mono font-bold text-slate-100">{formatINR(msg.proposal.unitPrice)}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block">Total Price ({msg.proposal.quantity || 12}x)</span>
                      <span className={`font-mono font-bold ${isMalicious ? 'text-rose-400' : 'text-emerald-400'}`}>
                        {formatINR(msg.proposal.totalPrice)}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block">Delivery SLA</span>
                      <span className="font-mono text-slate-200">{msg.proposal.deliveryHours} Hours</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block">Quality Grade</span>
                      <span className="text-slate-200">{msg.proposal.qualityGrade || 'Enterprise'}</span>
                    </div>
                  </div>
                )}

                {/* Threat Warning Banner on Malicious Msg */}
                {isMalicious && (
                  <div className="mt-3 p-3 rounded-xl bg-rose-950/40 border border-rose-800/80 text-xs text-rose-300 flex items-start justify-between gap-3">
                    <div className="flex items-start gap-2.5">
                      <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                      <div>
                        <strong className="font-semibold block">SecurityEngine Interception:</strong>
                        <span className="text-[11px] text-rose-300">
                          Disguised surcharge of ₹12,000 detected in unstructured text. Adjusted total ₹50,400 breaches the ₹50,000 hard budget cap.
                        </span>
                      </div>
                    </div>
                    {onInspectAlert && (
                      <button
                        onClick={() => onInspectAlert(msg)}
                        className="px-2 py-1 rounded bg-rose-900/60 hover:bg-rose-900 border border-rose-700 text-[10px] text-rose-200 shrink-0 font-medium"
                      >
                        Inspect Anomaly
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </Card>
  );
}

