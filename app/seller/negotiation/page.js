'use client';

import React, { useEffect, useState, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '../../../context/AuthContext';
import { useSocketContext } from '../../../context/SocketContext';
import { useUI } from '../../../context/UIContext';
import { negotiationService } from '../../../services/negotiationService';
import { agentService } from '../../../services/agentService';
import { formatINR, formatDateTime, cleanMessageContent, extractProposal } from '../../../utils/formatters';
import CommercialProposalCard from '../../../components/negotiation/CommercialProposalCard';
import Link from 'next/link';
import {
  Store,
  Bot,
  MessageSquareCode,
  ShieldCheck,
  CheckCircle2,
  Clock,
  IndianRupee,
  Truck,
  ArrowLeft,
  Sparkles,
  AlertCircle,
  Package,
  Layers,
  TrendingUp,
  RefreshCw,
  Zap,
} from 'lucide-react';

function SellerNegotiationContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryId = searchParams.get('id') || searchParams.get('negotiationId');

  const { user, isSeller, isAuthenticated, isLoading: authLoading } = useAuth();
  const { socket, isConnected } = useSocketContext() || {};
  const { showToast } = useUI();

  const [negotiation, setNegotiation] = useState(null);
  const [myAgent, setMyAgent] = useState(null);
  const [messages, setMessages] = useState([]);
  const [myOffers, setMyOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [currentRound, setCurrentRound] = useState(1);
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom of conversation
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Fetch real negotiation records and seller's agent from PostgreSQL
  const loadNegotiationData = async () => {
    try {
      let targetNeg = null;
      if (queryId) {
        const res = await negotiationService.getById(queryId);
        targetNeg = res?.data;
      } else {
        const listRes = await negotiationService.getAll();
        if (listRes?.data?.length > 0) {
          const activeList = listRes.data.filter((n) => n.status !== 'APPROVED' && n.status !== 'SETTLED');
          const latest = activeList.length > 0 ? activeList[0] : listRes.data[0];
          const singleRes = await negotiationService.getById(latest.id);
          targetNeg = singleRes?.data || latest;
        }
      }

      // Fetch agents (backend will automatically return only this seller's agent)
      const agentRes = await agentService.getAll();
      const myOwnedAgent = agentRes?.data && agentRes.data.length > 0 ? agentRes.data[0] : null;

      if (targetNeg) {
        setNegotiation(targetNeg);
        setMessages(targetNeg.messages || targetNeg.agentMessages || []);
        setMyOffers(targetNeg.offers || []);
        setCurrentRound(targetNeg.currentRound || 1);
      }
      if (myOwnedAgent) {
        setMyAgent(myOwnedAgent);
      }
    } catch (err) {
      console.error('Failed to load seller negotiation data:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (!authLoading) {
      if (isAuthenticated && isSeller) {
        loadNegotiationData();
      } else {
        setLoading(false);
      }
    }
  }, [authLoading, isAuthenticated, isSeller, queryId]);

  // Socket.IO real-time event subscriptions
  useEffect(() => {
    if (!socket || !negotiation?.id || !user?.businessId) return;

    // Join room with seller identity
    socket.emit('negotiation:join', {
      negotiationId: negotiation.id,
      businessId: user.businessId,
      role: 'SELLER',
      accountType: 'SELLER',
    });

    function handleIncomingMessage(msg) {
      // Data isolation guard: Seller only processes messages from BUYER or their own dedicated agent
      const isFromBuyer = msg.sender?.role === 'BUYER' || msg.senderRole === 'BUYER';
      const msgAgentId = msg.sender?.agentId || msg.agentId;
      const isFromMyAgent =
        (msg.sender?.businessId && msg.sender.businessId === user.businessId) ||
        (myAgent?.id && msgAgentId === myAgent.id);

      if (isFromBuyer || isFromMyAgent) {
        setMessages((prev) => {
          const exists = prev.some((m) => {
            if (m.id && msg.id && m.id === msg.id) return true;
            const prevAgentId = m.agentId || m.sender?.agentId;
            if (prevAgentId && msgAgentId && prevAgentId === msgAgentId && m.roundNumber === msg.roundNumber) {
              return true;
            }
            return false;
          });
          if (exists) return prev;
          return [...prev, { ...msg, id: msg.id || `msg-${Date.now()}` }];
        });
      }
    }

    function handleRoundCompleted(data) {
      if (data?.round) setCurrentRound(data.round);
      if (data?.offers && Array.isArray(data.offers)) {
        // Keep only my offers
        const filtered = data.offers.filter((o) => o.sellerBusinessId === user.businessId || o.sellerType === myAgent?.agentType);
        if (filtered.length > 0) {
          setMyOffers(filtered);
        }
      }
      if (data?.status) {
        setNegotiation((prev) => ({ ...prev, status: data.status }));
      }
    }

    function handleTransactionSettled(data) {
      if (data?.negotiationId === negotiation?.id || data?.id === negotiation?.id) {
        setNegotiation((prev) => ({ ...prev, status: 'APPROVED' }));
        showToast('Procurement deal approved and settled!', 'success');
      }
    }

    socket.on('negotiation:message', handleIncomingMessage);
    socket.on('negotiation:round_completed', handleRoundCompleted);
    socket.on('transaction:settled', handleTransactionSettled);

    return () => {
      socket.off('negotiation:message', handleIncomingMessage);
      socket.off('negotiation:round_completed', handleRoundCompleted);
      socket.off('transaction:settled', handleTransactionSettled);
      socket.emit('negotiation:leave', { negotiationId: negotiation.id });
    };
  }, [socket, negotiation?.id, user?.businessId, myAgent, showToast]);

  const handleRefresh = () => {
    setRefreshing(true);
    loadNegotiationData();
  };

  // Auth Guards
  if (!authLoading && !isAuthenticated) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-center p-6 bg-[#fffdf9] rounded-2xl border border-[#1e3a8a]/20">
        <Store className="w-12 h-12 text-[#1d4ed8] mb-4" />
        <h2 className="text-xl font-bold text-[#172554] mb-2">Seller Authentication Required</h2>
        <p className="text-sm text-[#1e3a8a] max-w-md mb-6">
          Please sign in to your Supplier account to access the private RFQ conversation stream.
        </p>
        <Link
          href="/login?portal=SELLER"
          className="px-6 py-2.5 rounded-xl bg-[#1d4ed8] hover:bg-[#1e3a8a] text-[#faf7ee] font-semibold text-sm transition-all"
        >
          Sign In to Seller Portal
        </Link>
      </div>
    );
  }

  if (!authLoading && isAuthenticated && !isSeller) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-center p-6 bg-[#fffdf9] rounded-2xl border border-[#1e3a8a]/20">
        <ShieldCheck className="w-12 h-12 text-[#1d4ed8] mb-4" />
        <h2 className="text-xl font-bold text-[#172554] mb-2">Buyer Account Detected</h2>
        <p className="text-sm text-[#1e3a8a] max-w-md mb-6">
          You are currently signed in as an Enterprise Buyer. Please proceed to the Buyer Negotiation Room to manage multi-agent procurement.
        </p>
        <Link
          href="/negotiation"
          className="px-6 py-2.5 rounded-xl bg-[#1d4ed8] hover:bg-[#1e3a8a] text-[#faf7ee] font-semibold text-sm transition-all"
        >
          Go to Buyer Negotiation Room
        </Link>
      </div>
    );
  }

  if (loading || authLoading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#1d4ed8] border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-xs text-[#1e3a8a]">Loading autonomous RFQ stream & agent conversation...</p>
      </div>
    );
  }

  const isWon =
    negotiation?.recommendedOfferId &&
    myOffers.some((o) => o.id === negotiation.recommendedOfferId);

  return (
    <div className="space-y-6 text-[#172554]">
      {/* Product Catalogue Ineligibility Notice */}
      {negotiation?.isEligible === false && (
        <div className="bg-amber-50 border border-amber-300 rounded-2xl p-5 text-xs text-amber-900 flex items-start gap-3 shadow-xs">
          <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-bold text-sm">Product Catalogue Ineligibility Notice</h4>
            <p className="mt-1 text-amber-800">
              {negotiation?.ineligibilityNotice || 'Your organization was not invited to this negotiation: Your product catalogue does not contain this exact product with sufficient available inventory.'}
            </p>
            <Link
              href="/seller/products"
              className="inline-flex items-center gap-1.5 mt-3 px-3.5 py-1.5 rounded-lg bg-[#1d4ed8] text-[#faf7ee] font-semibold text-xs hover:bg-[#1e3a8a] transition-all shadow-xs"
            >
              <Package className="w-3.5 h-3.5" />
              <span>Configure Product Catalogue</span>
            </Link>
          </div>
        </div>
      )}

      {/* Top Header & Breadcrumb */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-[#fffdf9] border border-[#1e3a8a]/20 rounded-2xl p-5 shadow-xs">
        <div className="flex items-center gap-3">
          <Link
            href="/seller/dashboard"
            className="p-2 rounded-xl bg-[#f4efe3] hover:bg-[#eadecc] text-[#172554] border border-[#1e3a8a]/20 transition-colors"
            title="Return to Supplier Hub"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-full bg-[#f4efe3] text-[#1d4ed8] border border-[#1e3a8a]/20 text-[10px] font-bold uppercase tracking-wider">
                Seller Private Stream
              </span>
              <span className="text-xs text-[#1e3a8a] font-mono">
                {negotiation?.id ? `RFQ #${negotiation.id.slice(-8)}` : 'ACTIVE RFQ'}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-[#172554] mt-0.5">
              {negotiation?.title || 'Autonomous Procurement Session'}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="p-2.5 rounded-xl bg-[#f4efe3] hover:bg-[#eadecc] text-[#172554] border border-[#1e3a8a]/20 text-xs font-semibold flex items-center gap-2 transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh Stream</span>
          </button>

          <div className="px-3 py-1.5 rounded-xl bg-[#f4efe3] border border-[#1e3a8a]/20 text-xs font-mono text-[#172554] flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#1d4ed8] animate-pulse" />
            <span>Round {currentRound} of 3</span>
          </div>
        </div>
      </div>

      {/* 2-Agent Peer Identity Bar (Strictly Buyer Agent <-> This Seller's Agent) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Left: Buyer Agent Counterpart */}
        <div className="bg-[#fffdf9] border border-[#1e3a8a]/20 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-[#f4efe3] border border-[#1e3a8a]/20 flex items-center justify-center text-[#1d4ed8]">
                <Bot className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-bold text-[#172554]">
                  {negotiation?.buyerAgent?.name?.replace(/\s*\(?gemini[- ]?2\.0\)?/gi, '') || 'Enterprise Buyer Agent'}
                </span>
                <span className="block text-[10px] text-[#1e3a8a] font-medium">
                  Buyer Organization: {negotiation?.buyerBusiness?.name || 'Enterprise Buyer'}
                </span>
              </div>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#f4efe3] text-[#1d4ed8] border border-[#1e3a8a]/20 font-bold">
              Procurement Officer
            </span>
          </div>
          <div className="text-[11px] text-[#1e3a8a] flex items-center justify-between pt-2 border-t border-[#1e3a8a]/15">
            <span>Constraint: ₹50,000 Budget Ceiling</span>
            <span className="font-mono text-[#172554] font-semibold">Target Margin: ≥ 25%</span>
          </div>
        </div>

        {/* Right: Seller's Own Dedicated AI Agent */}
        <div className="bg-[#fffdf9] border border-[#1e3a8a]/20 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-[#f4efe3] border border-[#1e3a8a]/20 flex items-center justify-center text-[#1d4ed8]">
                <Store className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-bold text-[#172554]">{myAgent?.name || 'My Autonomous Selling Agent'}</span>
                <span className="block text-[10px] text-[#1d4ed8] font-medium">
                  {user?.business?.name || 'Verified Supplier'}
                </span>
              </div>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#f4efe3] text-[#1e3a8a] border border-[#1e3a8a]/20 font-bold">
              {myAgent?.agentType || 'SUPPLIER_REP'}
            </span>
          </div>
          <div className="text-[11px] text-[#1e3a8a] flex items-center justify-between pt-2 border-t border-[#1e3a8a]/15">
            <span>Autonomous Engine: Standardized Protocol</span>
            <span className="text-[#1d4ed8] font-semibold">Trust Score: {myAgent?.trustScore || 95}%</span>
          </div>
        </div>
      </div>

      {/* Won Deal Banner */}
      {isWon && (
        <div className="p-4 rounded-2xl bg-[#f4efe3] border border-[#1d4ed8]/30 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-6 h-6 text-[#1d4ed8] shrink-0" />
            <div>
              <div className="text-sm font-bold text-[#172554]">Your Agent Quote Was Selected & Recommended!</div>
              <div className="text-xs text-[#1e3a8a] mt-0.5">
                The buyer agent has accepted your terms. Deal forwarded for mandatory human settlement sign-off.
              </div>
            </div>
          </div>
          <Link
            href="/seller/dashboard"
            className="px-4 py-2 rounded-xl bg-[#1d4ed8] hover:bg-[#1e3a8a] text-[#faf7ee] font-semibold text-xs transition-all shrink-0 shadow-xs"
          >
            View Settlement
          </Link>
        </div>
      )}

      {/* Main Grid: Conversation Stream & My Agent's Submitted Quotes */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Private Conversation Stream */}
        <div className="lg:col-span-8 bg-[#fffdf9] border border-[#1e3a8a]/20 rounded-2xl p-6 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-[#1e3a8a]/15 mb-4">
            <div className="flex items-center gap-2 text-sm font-bold text-[#172554]">
              <MessageSquareCode className="w-4 h-4 text-[#1d4ed8]" />
              <span>Isolated P2P Conversation Stream</span>
            </div>
            <span className="text-[11px] text-[#1e3a8a] font-mono">
              Strictly between Buyer Agent & Your Agent
            </span>
          </div>

          <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
            {messages.length === 0 ? (
              <div className="text-center py-12 text-[#1e3a8a] text-xs">
                Waiting for the procurement session to broadcast RFQ terms...
              </div>
            ) : (
              messages.map((msg, idx) => {
                const isBuyer = msg.senderRole === 'BUYER' || msg.sender?.role === 'BUYER';
                const proposal = extractProposal(msg.content, msg.structuredProposal || msg.proposal);
                const cleanText = cleanMessageContent(msg.content);

                return (
                  <div
                    key={msg.id || idx}
                    className={`p-4 rounded-xl border text-xs transition-all ${
                      isBuyer
                        ? 'bg-[#fffdf9] border-[#1e3a8a]/30 mr-6 border-l-4 border-l-[#1d4ed8] shadow-xs'
                        : 'bg-[#faf7ee] border-[#1e3a8a]/25 ml-6 border-l-4 border-l-[#1e3a8a] shadow-xs'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2 pb-1.5 border-b border-[#1e3a8a]/15">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-[#172554]">
                          {isBuyer
                            ? (negotiation?.buyerAgent?.name?.replace(/\s*\(?gemini[- ]?2\.0\)?/gi, '') || msg.sender?.name?.replace(/\s*\(?gemini[- ]?2\.0\)?/gi, '') || 'Enterprise Buyer Agent')
                            : (myAgent?.name || msg.sender?.name || 'My Autonomous Agent')}
                        </span>
                        <span className="text-[10px] text-[#1e3a8a] font-mono">
                          {isBuyer
                            ? (negotiation?.buyerBusiness?.name || 'Enterprise Buyer')
                            : (user?.business?.name || 'Supplier Rep')}
                        </span>
                      </div>
                      <span className="text-[10px] font-mono text-[#faf7ee] px-2 py-0.5 rounded bg-[#1d4ed8] font-bold">
                        Round {msg.roundNumber ?? 1}
                      </span>
                    </div>

                    {/* Clean Conversational Message Body (Raw JSON Stripped) */}
                    {cleanText && (
                      <div className="text-[#172554] leading-relaxed text-xs whitespace-pre-line mb-3">
                        {cleanText}
                      </div>
                    )}

                    {/* High-Fidelity Commercial Proposal Specification Card */}
                    {proposal && (
                      <CommercialProposalCard
                        proposal={proposal}
                        senderRole={msg.senderRole}
                      />
                    )}
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Right Column: Round-by-Round Offers & Agent Telemetry */}
        <div className="lg:col-span-4 space-y-6">
          {/* Quotes Breakdown Card */}
          <div className="bg-[#fffdf9] border border-[#1e3a8a]/20 rounded-2xl p-5 shadow-xs">
            <h2 className="text-sm font-bold text-[#172554] flex items-center gap-2 mb-1">
              <TrendingUp className="w-4 h-4 text-[#1d4ed8]" />
              <span>My Agent Bids & History</span>
            </h2>
            <p className="text-[11px] text-[#1e3a8a] mb-4">
              Round-by-round quotes submitted on behalf of {user?.business?.name}.
            </p>

            <div className="space-y-3">
              {myOffers.length === 0 ? (
                <div className="text-center py-6 text-[#1e3a8a] text-xs">
                  No bids recorded yet for this session.
                </div>
              ) : (
                myOffers.map((off, idx) => (
                  <div
                    key={off.id || idx}
                    className="p-3.5 rounded-xl bg-[#faf7ee] border border-[#1e3a8a]/20 text-xs hover:border-[#1d4ed8] transition-colors"
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-bold text-[#172554]">Round {off.roundNumber} Bid</span>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${
                          off.isRecommended
                            ? 'bg-[#1d4ed8] text-[#faf7ee]'
                            : 'bg-[#f4efe3] text-[#172554] border border-[#1e3a8a]/20'
                        }`}
                      >
                        {off.isRecommended ? 'Selected' : off.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[11px] text-[#1e3a8a]">
                      <div>
                        Unit Price: <span className="font-bold text-[#172554]">{formatINR(off.unitPrice)}</span>
                      </div>
                      <div>
                        Total: <span className="font-bold text-[#1d4ed8]">{formatINR(off.totalPrice)}</span>
                      </div>
                      <div>
                        Delivery: <span className="text-[#172554]">{off.deliveryHours}h</span>
                      </div>
                      <div>
                        Resale Margin: <span className="text-[#172554] font-mono">{Number(off.resaleMarginProjected || 22)}%</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Confidentiality Guarantee Badge */}
          <div className="p-4 rounded-2xl bg-[#f4efe3] border border-[#1e3a8a]/20 text-xs space-y-2">
            <div className="flex items-center gap-2 text-[#1d4ed8] font-bold text-xs">
              <ShieldCheck className="w-4 h-4" />
              <span>B2B Confidentiality Enforced</span>
            </div>
            <p className="text-[11px] text-[#1e3a8a] leading-relaxed">
              Your bidding strategies, floor costs, and conversational reasoning are private to {user?.business?.name}. Competing suppliers have zero visibility into your submissions.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SellerNegotiationPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[80vh] flex flex-col items-center justify-center">
          <div className="w-8 h-8 border-2 border-[#1d4ed8] border-t-transparent rounded-full animate-spin mb-2" />
          <p className="text-xs text-[#1e3a8a]">Loading Seller Negotiation Stream...</p>
        </div>
      }
    >
      <SellerNegotiationContent />
    </Suspense>
  );
}

