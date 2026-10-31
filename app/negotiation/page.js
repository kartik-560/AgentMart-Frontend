'use client';

import React, { useEffect, useState } from 'react';
import Card from '../../components/shared/Card';
import Button from '../../components/shared/Button';
import StatusBadge from '../../components/shared/StatusBadge';
import { negotiationService } from '../../services/negotiationService';
import { useSocketContext } from '../../context/SocketContext';
import { formatINR } from '../../utils/formatters';
import Link from 'next/link';
import {
  MessageSquareCode,
  Play,
  CheckCircle2,
  AlertTriangle,
  Scale,
  Sparkles,
  Bot,
  UserCheck,
} from 'lucide-react';

export default function NegotiationRoomPage() {
  const { socket, isConnected } = useSocketContext() || {};
  const [negotiation, setNegotiation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [advancing, setAdvancing] = useState(false);
  const [liveAlert, setLiveAlert] = useState(null);

  useEffect(() => {
    let mounted = true;
    negotiationService.getById('neg-demo-001')
      .then((res) => {
        if (mounted && res?.data) {
          setNegotiation(res.data);
          setMessages(res.data.messages || []);
        }
      })
      .catch(() => {});

    return () => {
      mounted = false;
    };
  }, []);

  // Socket.IO event listeners
  useEffect(() => {
    if (!socket) return;

    socket.emit('negotiation:join', { negotiationId: 'neg-demo-001' });

    function handleNewMessage(msg) {
      setMessages((prev) => [...prev, { ...msg, id: `msg-${Date.now()}` }]);
    }

    function handleThreatAlert(threat) {
      setLiveAlert(threat);
    }

    socket.on('negotiation:message', handleNewMessage);
    socket.on('security:threat_alert', handleThreatAlert);

    return () => {
      socket.off('negotiation:message', handleNewMessage);
      socket.off('security:threat_alert', handleThreatAlert);
      socket.emit('negotiation:leave', { negotiationId: 'neg-demo-001' });
    };
  }, [socket]);

  const handleAdvanceRound = async () => {
    setAdvancing(true);
    try {
      const res = await negotiationService.advanceRound('neg-demo-001', {
        roundNumber: (negotiation?.currentRound || 1) + 1,
      });
      if (res?.data) {
        setNegotiation((prev) => ({
          ...prev,
          currentRound: res.data.nextRoundNumber,
          offers: res.data.offers || prev.offers,
        }));
      }
    } catch {
      // Mock round step
      setNegotiation((prev) => ({
        ...prev,
        currentRound: (prev?.currentRound || 1) + 1,
      }));
    } finally {
      setAdvancing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Session Header */}
      <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-100 flex items-center gap-2">
              <MessageSquareCode className="w-5 h-5 text-indigo-400" />
              {negotiation?.title || 'Procurement: 12x Enterprise Wi-Fi 6 Mesh Router'}
            </h1>
            <StatusBadge status={negotiation?.status || 'IN_PROGRESS'} />
          </div>
          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 mt-1">
            <span>Round {negotiation?.currentRound || 2} of 5</span>
            <span>•</span>
            <span className="text-emerald-400 font-mono">Max Budget: {formatINR(negotiation?.maxBudget || 50000)}</span>
            <span>•</span>
            <span>Delivery SLA: {negotiation?.maxDeliveryHours || 48} Hours</span>
            <span>•</span>
            <span className="text-indigo-400 font-mono">Qty: {negotiation?.targetQuantity || 12} units</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/comparison">
            <Button variant="outline" size="sm" className="gap-1.5 text-xs">
              <Scale className="w-3.5 h-3.5" /> Compare Matrix
            </Button>
          </Link>
          <Button
            variant="primary"
            size="sm"
            onClick={handleAdvanceRound}
            disabled={advancing}
            className="gap-1.5 text-xs"
          >
            <Play className="w-3.5 h-3.5" /> {advancing ? 'Executing Round...' : 'Advance Round'}
          </Button>
        </div>
      </div>

      {/* Live Threat Banner if intercepted */}
      {liveAlert && (
        <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-800 flex items-center justify-between text-xs text-rose-300">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
            <div>
              <span className="font-bold">Zero-Trust Threat Intercepted:</span> {liveAlert.threat?.description}
            </div>
          </div>
          <Button variant="danger" size="sm" onClick={() => setLiveAlert(null)} className="text-[11px] py-1">
            Dismiss
          </Button>
        </div>
      )}

      {/* 2-Column Split: Live Feed & Live Offer Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Live Conversation Feed */}
        <div className="lg:col-span-2">
          <Card title="Live Agent Discourse & Strategic Reasoning" subtitle="Real-time multi-agent negotiation stream">
            <div className="space-y-4 max-h-[560px] overflow-y-auto pr-2">
              {messages.map((msg, idx) => {
                const isBuyer = msg.senderRole === 'BUYER';
                const isMalicious = msg.senderRole === 'SELLER_C_MALICIOUS';

                return (
                  <div
                    key={msg.id || idx}
                    className={`p-4 rounded-xl border text-xs ${
                      isBuyer
                        ? 'bg-indigo-950/20 border-indigo-900/60 ml-4'
                        : isMalicious
                        ? 'bg-rose-950/20 border-rose-900/60 mr-4'
                        : 'bg-slate-950/60 border-slate-800 mr-4'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2 font-semibold">
                        <Bot className={`w-3.5 h-3.5 ${isBuyer ? 'text-indigo-400' : isMalicious ? 'text-rose-400' : 'text-emerald-400'}`} />
                        <span className={isBuyer ? 'text-indigo-300' : isMalicious ? 'text-rose-300' : 'text-slate-200'}>
                          {msg.senderRole?.replace(/_/g, ' ')}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono">
                        Round {msg.roundNumber || 1}
                      </span>
                    </div>

                    <p className="text-slate-300 leading-relaxed whitespace-pre-wrap">{msg.content}</p>

                    {/* Threat indicator if present */}
                    {isMalicious && (
                      <div className="mt-2.5 p-2 rounded bg-rose-900/30 border border-rose-700/40 text-[11px] text-rose-300 flex items-center gap-2 font-mono">
                        <AlertTriangle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                        <span>Flagged by SecurityEngine: Narrative surcharge of ₹12,000 detected.</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </Card>
        </div>

        {/* Right: Competing Supplier Quotes & Utility Score */}
        <div className="space-y-4">
          <Card title="Competing Quotes" subtitle="Evaluated with deterministic multi-attribute utility">
            <div className="space-y-3">
              {/* Seller A Quote */}
              <div className="p-3.5 rounded-xl bg-slate-950/80 border border-emerald-500/30 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-emerald-400">Prism Wholesale (Agent A)</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 font-semibold">
                    RECOMMENDED DEAL
                  </span>
                </div>
                <div className="flex items-baseline justify-between">
                  <span className="text-xl font-bold font-mono text-slate-100">{formatINR(44400)}</span>
                  <span className="text-xs text-slate-400">₹3,700 / unit</span>
                </div>
                <div className="flex justify-between text-[11px] text-slate-400">
                  <span>Delivery: 40 hrs</span>
                  <span>Margin: 24.5%</span>
                  <span className="font-mono text-emerald-400 font-bold">Utility: 88.5</span>
                </div>
              </div>

              {/* Seller B Quote */}
              <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-200">SwiftQuality (Agent B)</span>
                  <span className="text-[10px] text-slate-400 font-mono">20h Expedited</span>
                </div>
                <div className="flex items-baseline justify-between">
                  <span className="text-xl font-bold font-mono text-slate-100">{formatINR(47400)}</span>
                  <span className="text-xs text-slate-400">₹3,950 / unit</span>
                </div>
                <div className="flex justify-between text-[11px] text-slate-400">
                  <span>Delivery: 20 hrs</span>
                  <span>Margin: 21.0%</span>
                  <span className="font-mono text-blue-400 font-bold">Utility: 85.0</span>
                </div>
              </div>

              {/* Seller C Quote (Malicious) */}
              <div className="p-3.5 rounded-xl bg-slate-950/80 border border-rose-900/60 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-rose-400">ShadowBot (Agent C)</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/30">
                    ANOMALY
                  </span>
                </div>
                <div className="flex items-baseline justify-between">
                  <span className="text-xl font-bold font-mono text-rose-300">{formatINR(50400)}</span>
                  <span className="text-xs text-rose-400 line-through">₹3,200 / unit</span>
                </div>
                <div className="flex justify-between text-[11px] text-rose-400">
                  <span>+₹12k hidden fee</span>
                  <span>Breaches Budget</span>
                  <span className="font-mono font-bold">Utility: 22.0</span>
                </div>
              </div>

              {/* Settlement CTA */}
              <div className="pt-2">
                <Link href="/approvals">
                  <Button variant="success" className="w-full gap-2 text-xs py-2.5">
                    <UserCheck className="w-4 h-4" /> Authorize Deal via Mock UPI
                  </Button>
                </Link>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

