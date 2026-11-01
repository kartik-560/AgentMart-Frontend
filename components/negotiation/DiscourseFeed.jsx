'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import Card from '../shared/Card';
import Button from '../shared/Button';
import CommercialProposalCard from './CommercialProposalCard';
import { formatINR, cleanMessageContent, extractProposal } from '../../utils/formatters';
import Link from 'next/link';
import {
  Bot,
  User,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  Lock,
  Tag,
  TrendingDown,
  ShieldCheck,
  Building2,
  Store,
  Layers,
} from 'lucide-react';

const cleanAgentName = (name) => {
  if (!name) return '';
  return name.replace(/\s*\(?gemini[- ]?2\.0\)?/gi, '').trim();
};

export default function DiscourseFeed({
  messages = [],
  negotiation = null,
  agents = [],
  onInspectAlert,
  isTyping = false,
  typingText = 'Autonomous reasoning and formulating proposal...',
  recommendedOffer = null,
  onProceedToApproval = null,
  negotiationStatus = 'IN_PROGRESS',
}) {
  const [selectedSender, setSelectedSender] = useState('ALL');
  const [selectedRound, setSelectedRound] = useState('ALL');
  const messagesEndRef = useRef(null);

  // Auto-scroll to latest message or typing indicator
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  /**
   * Authoritative Agent Registry Map
   * Resolves agent identity strictly using unique database UUIDs (id),
   * never array positions, hardcoded labels, or generic role fallbacks.
   */
  const agentMap = useMemo(() => {
    const map = new Map();

    // 1. Ingest all agents loaded from database (/api/agents)
    (agents || []).forEach((a) => {
      if (a?.id) {
        map.set(a.id, {
          id: a.id,
          name: a.name,
          agentType: a.agentType,
          businessId: a.businessId || a.business?.id,
          businessName: a.business?.name || a.name,
          trustScore: a.trustScore,
        });
      }
    });

    // 2. Ingest buyer agent from active negotiation record
    if (negotiation?.buyerAgent?.id) {
      map.set(negotiation.buyerAgent.id, {
        id: negotiation.buyerAgent.id,
        name: negotiation.buyerAgent.name,
        agentType: 'BUYER',
        businessId: negotiation.buyerBusinessId || negotiation.buyerBusiness?.id,
        businessName: negotiation.buyerBusiness?.name || 'Buyer Enterprise',
        trustScore: negotiation.buyerAgent.trustScore || 98.5,
      });
    }

    // 3. Ingest seller agents from submitted negotiation offers
    (negotiation?.offers || []).forEach((o) => {
      const sId = o.sellerAgentId || o.sellerAgent?.id;
      if (sId && !map.has(sId)) {
        map.set(sId, {
          id: sId,
          name: o.sellerAgent?.name || 'Verified Supplier Agent',
          agentType: o.sellerAgent?.agentType || o.sellerType || 'SELLER',
          businessId: o.sellerBusinessId || o.sellerBusiness?.id,
          businessName: o.sellerBusiness?.name || o.sellerAgent?.name || 'Supplier Enterprise',
          trustScore: o.sellerAgent?.trustScore || 90.0,
        });
      }
    });

    // 4. Ingest agents from message sender profiles
    (messages || []).forEach((m) => {
      const aId = m.agentId || m.sender?.agentId || m.agent?.id;
      if (aId && !map.has(aId)) {
        const isBuyerMsg = m.senderRole === 'BUYER' || m.sender?.role === 'BUYER';
        map.set(aId, {
          id: aId,
          name: m.sender?.name || m.agent?.name || (isBuyerMsg ? 'Buyer Agent' : 'Supplier Agent'),
          agentType: m.senderRole || m.sender?.role || (isBuyerMsg ? 'BUYER' : 'SELLER'),
          businessId: m.sender?.businessId || m.agent?.businessId,
          businessName: m.sender?.businessName || m.agent?.business?.name || (isBuyerMsg ? 'Buyer Enterprise' : 'Supplier Enterprise'),
          trustScore: 90.0,
        });
      }
    });

    return map;
  }, [agents, negotiation, messages]);

  /**
   * Filtered list of all supplier agents participating in this session (strictly deduplicated)
   */
  const sellerAgents = useMemo(() => {
    const list = [];
    const seenKeys = new Set();
    const eligible = negotiation?.metadata?.eligibleParticipants;

    if (eligible && Array.isArray(eligible) && eligible.length > 0) {
      eligible.forEach((p) => {
        const key = p.agentId || p.businessId;
        if (key && !seenKeys.has(key)) {
          seenKeys.add(key);
          list.push({
            id: p.agentId,
            name: p.agentName,
            agentType: p.agentType,
            businessId: p.businessId,
            businessName: p.businessName,
            trustScore: p.trustScore,
            sku: p.sku,
            availableQuantity: p.availableQuantity,
          });
        }
      });
      return list;
    }

    if (negotiation?.status === 'NO_ELIGIBLE_SELLERS' || negotiation?.metadata?.noEligibleSellers) {
      return [];
    }

    agentMap.forEach((agent) => {
      if (agent.agentType !== 'BUYER') {
        const key = agent.id || agent.businessId;
        if (key && !seenKeys.has(key)) {
          seenKeys.add(key);
          list.push(agent);
        }
      }
    });
    return list;
  }, [agentMap, negotiation]);

  /**
   * Active seller when a specific conversation thread is selected
   */
  const activeSeller = useMemo(() => {
    if (!selectedSender || selectedSender === 'ALL' || selectedSender === 'BUYER') {
      return null;
    }
    return agentMap.get(selectedSender) || null;
  }, [selectedSender, agentMap]);

  /**
   * Filter messages based on round and selected seller channel
   */
  const filteredMessages = useMemo(() => {
    return messages.filter((msg) => {
      const isBuyerMsg = msg.senderRole === 'BUYER' || msg.sender?.role === 'BUYER';
      const msgAgentId = msg.agentId || msg.sender?.agentId || msg.agent?.id;

      let matchesSender = true;
      if (selectedSender === 'ALL') {
        matchesSender = true;
      } else if (selectedSender === 'BUYER') {
        matchesSender = isBuyerMsg;
      } else {
        // When a seller channel is selected, strictly display:
        // 1. The Buyer's RFQs & counteroffers (so dialogue context is preserved)
        // 2. Only messages originating from this exact seller agent ID
        matchesSender = isBuyerMsg || msgAgentId === selectedSender;
      }

      const matchesRound = selectedRound === 'ALL' || String(msg.roundNumber) === String(selectedRound);
      return matchesSender && matchesRound;
    });
  }, [messages, selectedSender, selectedRound]);

  /**
   * Visual style configurations based on participant type (Royal Blue / Cream)
   */
  const getRoleStyle = (isBuyer, isMalicious) => {
    if (isBuyer) {
      return {
        color: 'text-[#1d4ed8] bg-[#f4efe3] border-[#1e3a8a]/20',
        bubbleBg: 'bg-[#fffdf9] border border-[#1e3a8a]/30 shadow-xs',
        alignment: 'ml-0 sm:ml-4 border-l-4 border-l-[#1d4ed8]',
      };
    }
    if (isMalicious) {
      return {
        color: 'text-[#172554] bg-[#f4efe3] border-[#1e3a8a]/30',
        bubbleBg: 'bg-[#faf7ee] border border-[#1e3a8a]/35 shadow-xs',
        alignment: 'mr-0 sm:mr-4 border-l-4 border-l-[#172554]',
      };
    }
    return {
      color: 'text-[#1e3a8a] bg-[#f4efe3] border-[#1e3a8a]/20',
      bubbleBg: 'bg-[#faf7ee] border border-[#1e3a8a]/25 shadow-xs',
      alignment: 'mr-0 sm:mr-4 border-l-4 border-l-[#1e3a8a]',
    };
  };

  return (
    <Card
      title="Live Multi-Agent Negotiation Stream"
      subtitle="Autonomous peer-to-peer commercial discourse"
      headerAction={
        <div className="flex flex-wrap items-center gap-2">
          {/* Filter by Round */}
          <select
            value={selectedRound}
            onChange={(e) => setSelectedRound(e.target.value)}
            className="px-2.5 py-1 bg-[#fffdf9] border border-[#1e3a8a]/30 rounded-lg text-xs text-[#172554] focus:outline-none focus:border-[#1d4ed8] font-mono font-bold"
          >
            <option value="ALL">All Rounds</option>
            <option value="0">Round 0 (RFQ)</option>
            <option value="1">Round 1</option>
            <option value="2">Round 2</option>
            <option value="3">Round 3 (Final)</option>
          </select>

          {/* Filter by Sender / Channel */}
          <select
            value={selectedSender}
            onChange={(e) => setSelectedSender(e.target.value)}
            className="px-2.5 py-1 bg-[#fffdf9] border border-[#1e3a8a]/30 rounded-lg text-xs text-[#172554] focus:outline-none focus:border-[#1d4ed8] font-mono font-bold max-w-[240px]"
          >
            <option value="ALL">All Agents</option>
            <option value="BUYER">
              {cleanAgentName(negotiation?.buyerAgent?.name) || 'Buyer Agent'} ({negotiation?.buyerBusiness?.name || 'Buyer'})
            </option>
            {sellerAgents.map((seller) => (
              <option key={seller.id} value={seller.id}>
                {seller.businessName || cleanAgentName(seller.name)}
              </option>
            ))}
          </select>
        </div>
      }
    >
      {/* Dynamic Agent Conversation Thread Selectors */}
      <div className="flex flex-wrap gap-1.5 p-1 bg-[#f4efe3] border border-[#1e3a8a]/20 rounded-xl mb-4 text-xs font-semibold">
        <button
          type="button"
          onClick={() => setSelectedSender('ALL')}
          className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
            selectedSender === 'ALL'
              ? 'bg-[#1d4ed8] text-[#faf7ee] font-bold shadow-xs'
              : 'text-[#1e3a8a] hover:bg-[#eadecc]'
          }`}
        >
          <Bot className="w-3.5 h-3.5" />
          <span>All Discourse</span>
          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-[#172554] text-[#faf7ee]">
            {messages.length}
          </span>
        </button>

        {sellerAgents.map((seller) => {
          const isSelected = selectedSender === seller.id;
          const shortName = seller.businessName || cleanAgentName(seller.name);
          return (
            <button
              key={seller.id}
              type="button"
              onClick={() => setSelectedSender(seller.id)}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                isSelected
                  ? 'bg-[#1d4ed8] text-[#faf7ee] font-bold shadow-xs'
                  : 'text-[#1e3a8a] hover:bg-[#eadecc]'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${isSelected ? 'bg-[#faf7ee]' : 'bg-[#1d4ed8]'}`} />
              <span className="truncate max-w-[170px]">{shortName} Thread</span>
            </button>
          );
        })}
      </div>

      {/* Selected Seller P2P Conversation Header Banner */}
      {activeSeller && (
        <div className="mb-4 p-3.5 rounded-xl bg-[#fffdf9] border-2 border-[#1d4ed8]/40 shadow-xs text-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-[#f4efe3] border border-[#1e3a8a]/20 flex items-center justify-center text-[#1d4ed8] shadow-xs shrink-0">
                <Store className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-bold text-sm text-[#172554] truncate">
                    {cleanAgentName(activeSeller.name)}
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-[#f4efe3] text-[#1e3a8a] border border-[#1e3a8a]/20 font-bold shrink-0">
                    {activeSeller.businessName}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[10px] text-[#1e3a8a] font-mono mt-0.5">
                  <span>Agent ID: <span className="font-semibold text-[#172554]">{activeSeller.id}</span></span>
                  {activeSeller.businessId && (
                    <span className="hidden sm:inline">• Business ID: <span className="font-semibold text-[#172554]">{activeSeller.businessId.substring(0, 8)}...</span></span>
                  )}
                  {activeSeller.trustScore !== undefined && (
                    <span>• Trust Index: <span className="font-bold text-[#1d4ed8]">{activeSeller.trustScore}%</span></span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
              <span className="text-[10px] font-mono px-2.5 py-1 rounded-lg bg-[#1d4ed8] text-[#faf7ee] font-bold shadow-xs flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#faf7ee] animate-pulse" />
                <span>Isolated P2P Channel</span>
              </span>
              <button
                type="button"
                onClick={() => setSelectedSender('ALL')}
                className="px-2 py-1 text-[11px] text-[#1e3a8a] hover:text-[#1d4ed8] hover:bg-[#f4efe3] rounded-md font-semibold transition-all border border-[#1e3a8a]/15"
              >
                View All
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Messages Stream */}
      <div className="space-y-4 max-h-[620px] overflow-y-auto pr-1.5">
        {filteredMessages.length === 0 && !isTyping ? (
          <div className="text-center py-12 px-4 rounded-xl bg-[#faf7ee] border border-dashed border-[#1e3a8a]/30">
            <Bot className="w-10 h-10 text-[#1d4ed8] mx-auto mb-2.5 animate-pulse" />
            <p className="text-xs text-[#172554] font-bold">Negotiation session starting...</p>
            <p className="text-[11px] text-[#1e3a8a] font-mono mt-1">
              Autonomous agents are initializing peer communication protocols.
            </p>
          </div>
        ) : (
          filteredMessages.map((msg, idx) => {
            const role = msg.senderRole || msg.sender?.role;
            const isBuyer = role === 'BUYER';
            const msgAgentId = msg.agentId || msg.sender?.agentId || msg.agent?.id;

            // Resolve agent identity strictly using unique database UUID
            const resolvedAgent = msgAgentId ? agentMap.get(msgAgentId) : null;

            let displayName = '';
            let displayBiz = '';

            if (isBuyer) {
              displayName = cleanAgentName(
                resolvedAgent?.name ||
                msg.agent?.name ||
                msg.sender?.name ||
                negotiation?.buyerAgent?.name ||
                'Buyer Autonomous Agent'
              );
              displayBiz = (
                resolvedAgent?.businessName ||
                msg.agent?.business?.name ||
                msg.sender?.businessName ||
                negotiation?.buyerBusiness?.name ||
                'Procurement'
              );
            } else {
              displayName = cleanAgentName(
                resolvedAgent?.name ||
                msg.agent?.name ||
                msg.sender?.name ||
                'Supplier Autonomous Agent'
              );
              displayBiz = (
                resolvedAgent?.businessName ||
                msg.agent?.business?.name ||
                msg.sender?.businessName ||
                'Wholesale Supplier'
              );
            }

            const isMalicious = msg.securityValidation?.status === 'FLAGGED' || role === 'SELLER_C_MALICIOUS';
            const styleCfg = getRoleStyle(isBuyer, isMalicious);
            const proposal = extractProposal(msg.content, msg.proposal || msg.structuredProposal);
            const cleanText = cleanMessageContent(msg.content);

            const anomalyText = msg.threatAlert?.description ||
              (proposal?.declaredFees ? `Disguised surcharge of ${formatINR(proposal.declaredFees)} detected in unstructured text payload.` : null) ||
              'Adversarial anomaly intercepted by Zero-Trust Engine. System override and disguised fee blocked.';

            return (
              <div
                key={msg.id || idx}
                className={`p-4 rounded-xl border transition-all text-[#172554] ${styleCfg.bubbleBg} ${styleCfg.alignment}`}
              >
                {/* Header row */}
                <div className="flex flex-wrap items-center justify-between gap-2 mb-2.5 pb-2 border-b border-[#1e3a8a]/15">
                  <div className="flex items-center gap-2">
                    <span className={`p-1.5 rounded-lg border ${styleCfg.color}`}>
                      {isBuyer ? (
                        <Building2 className="w-3.5 h-3.5 text-[#1d4ed8]" />
                      ) : isMalicious ? (
                        <ShieldAlert className="w-3.5 h-3.5 text-[#172554]" />
                      ) : (
                        <Store className="w-3.5 h-3.5 text-[#1e3a8a]" />
                      )}
                    </span>
                    <div>
                      <span className="font-bold text-xs text-[#172554]">
                        {displayName}
                      </span>
                      <span className="text-[10px] text-[#1e3a8a] font-mono ml-2">
                        {displayBiz ? `(${displayBiz})` : ''}
                      </span>
                      {msgAgentId && (
                        <span className="text-[9px] text-[#1e3a8a]/60 font-mono ml-1.5 hidden md:inline">
                          [{msgAgentId.substring(0, 8)}]
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-[10px] font-mono text-[#1e3a8a]">
                    <span className="px-2 py-0.5 rounded bg-[#f4efe3] border border-[#1e3a8a]/20 text-[#172554] font-semibold">
                      {isBuyer ? 'Buyer Procurement Agent' : (displayBiz ? `${displayBiz} Rep` : 'Supplier Agent')}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-[#1d4ed8] text-[#faf7ee] font-bold">
                      {msg.roundNumber === 0 ? 'RFQ Launch' : `Round ${msg.roundNumber || 1}`}
                    </span>
                  </div>
                </div>

                {/* Clean Conversational Message Body */}
                {cleanText && (
                  <p className="text-xs text-[#172554] leading-relaxed whitespace-pre-wrap">
                    {cleanText}
                  </p>
                )}

                {/* High-Fidelity Commercial Proposal Specification Card */}
                {proposal && (
                  <CommercialProposalCard
                    proposal={proposal}
                    isMalicious={isMalicious}
                    senderRole={role}
                  />
                )}

                {/* Threat Warning Banner on Malicious Msg */}
                {isMalicious && (
                  <div className="mt-3 p-3 rounded-xl bg-[#fffdf9] border-2 border-[#172554] text-xs text-[#172554] flex items-start justify-between gap-3 shadow-xs">
                    <div className="flex items-start gap-2.5">
                      <AlertTriangle className="w-4 h-4 text-[#1d4ed8] shrink-0 mt-0.5" />
                      <div>
                        <strong className="font-bold block flex items-center gap-1.5 text-[#172554]">
                          <ShieldAlert className="w-3.5 h-3.5 text-[#1d4ed8]" />
                          Zero-Trust Security Interception:
                        </strong>
                        <span className="text-[11px] text-[#1e3a8a]">
                          {anomalyText}
                        </span>
                      </div>
                    </div>
                    {onInspectAlert && (
                      <button
                        onClick={() => onInspectAlert(msg)}
                        className="px-2.5 py-1 rounded bg-[#172554] hover:bg-[#1e3a8a] text-[10px] text-[#faf7ee] shrink-0 font-bold"
                      >
                        Inspect Threat
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}

        {/* Live Typing Indicator */}
        {isTyping && (
          <div className="p-3.5 rounded-xl bg-[#f4efe3] border border-[#1e3a8a]/20 text-xs flex items-center gap-3 animate-pulse text-[#172554]">
            <Bot className="w-4 h-4 text-[#1d4ed8] animate-spin" />
            <div className="flex-1">
              <span className="font-bold text-[#172554]">
                Autonomous Discourse in Progress:
              </span>
              <span className="ml-1.5 text-[#1e3a8a] font-mono text-[11px]">
                {typingText}
              </span>
            </div>
            <span className="flex gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#1d4ed8] animate-bounce" />
              <span className="w-1.5 h-1.5 rounded-full bg-[#1d4ed8] animate-bounce [animation-delay:0.2s]" />
              <span className="w-1.5 h-1.5 rounded-full bg-[#1d4ed8] animate-bounce [animation-delay:0.4s]" />
            </span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Recommended Deal Action Banner */}
      {recommendedOffer && (negotiationStatus === 'DEAL_RECOMMENDED' || negotiationStatus === 'PENDING_HUMAN_APPROVAL') && (
        <div className="mt-4 p-4 rounded-xl bg-[#fffdf9] border-2 border-[#1d4ed8] shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-[#172554]">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-[#1d4ed8] shrink-0" />
            <div>
              <div className="text-xs font-bold text-[#172554]">
                Consensus Reached: Optimal Offer Identified ({formatINR(recommendedOffer.totalPrice)})
              </div>
              <div className="text-[11px] text-[#1e3a8a]">
                Multi-agent negotiation converged. Mandatory human authorization required for settlement.
              </div>
            </div>
          </div>
          {onProceedToApproval && (
            <Button
              onClick={onProceedToApproval}
              variant="primary"
              size="sm"
              className="text-xs font-bold shrink-0 self-end sm:self-center"
            >
              Review & Authorize Deal <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Button>
          )}
        </div>
      )}
    </Card>
  );
}
