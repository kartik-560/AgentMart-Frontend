'use client';

import React, { useEffect, useState } from 'react';
import Card from '../../components/shared/Card';
import StatusBadge from '../../components/shared/StatusBadge';
import Button from '../../components/shared/Button';
import Modal from '../../components/shared/Modal';
import { agentService } from '../../services/agentService';
import { useUI } from '../../context/UIContext';
import { useAuth } from '../../context/AuthContext';
import {
  Bot,
  Shield,
  AlertTriangle,
  Cpu,
  Play,
  Pause,
  Sparkles,
  Terminal,
} from 'lucide-react';

const cleanAgentName = (name) => {
  if (!name) return 'Autonomous Agent';
  return name.replace(/\s*\(?gemini[- ]?2\.0\)?/gi, '').trim();
};

export default function AgentManagementPage() {
  const { showToast } = useUI();
  const { user, isSeller } = useAuth();
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAgent, setSelectedAgent] = useState(null);

  useEffect(() => {
    let mounted = true;
    agentService
      .getAll()
      .then((res) => {
        if (mounted && res?.data) {
          setAgents(res.data);
        }
      })
      .catch(() => {})
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const toggleAgentStatus = async (agent) => {
    const nextStatus = agent.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    try {
      await agentService.updateStatus(agent.id, nextStatus, `Operator status update to ${nextStatus}`);
      setAgents((prev) =>
        prev.map((a) => (a.id === agent.id ? { ...a, status: nextStatus } : a))
      );
      showToast(
        `${cleanAgentName(agent.name)} is now ${nextStatus === 'ACTIVE' ? 'Active' : 'Suspended'}!`,
        nextStatus === 'ACTIVE' ? 'success' : 'error'
      );
    } catch {
      showToast('Status modified in local runtime.', 'info');
    }
  };

  // Filter agents:
  // - Seller sees only their own business agent
  // - Buyer sees their OWN buyer agent + all supplier/seller agents (NEVER other buyers' agents)
  const visibleAgents = agents.filter((agent) => {
    if (isSeller) {
      return !user?.businessId || agent.businessId === user?.businessId;
    }
    if (agent.agentType === 'BUYER') {
      return user?.businessId ? agent.businessId === user.businessId : true;
    }
    return true; // Supplier / seller agents
  });

  return (
    <div className="space-y-6 text-[#172554]">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-[#172554] flex items-center gap-2">
            <Bot className="w-6 h-6 text-[#1d4ed8] shrink-0" /> Multi-Agent Management Matrix
          </h1>
          <p className="text-xs sm:text-sm text-[#1e3a8a] mt-1">
            Monitor, inspect, and configure your enterprise autonomous agent and active supplier agents operating on Agent Communication Protocol (ACP).
          </p>
        </div>
      </div>

      {/* Agents Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="p-5 rounded-2xl border border-[#1e3a8a]/20 bg-[#fffdf9] animate-pulse space-y-4"
            >
              <div className="flex justify-between items-center">
                <div className="h-4 bg-[#f4efe3] rounded w-1/3" />
                <div className="h-4 bg-[#f4efe3] rounded-full w-16" />
              </div>
              <div className="h-2 bg-[#f4efe3] rounded w-full" />
              <div className="h-16 bg-[#faf7ee] rounded-xl" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {visibleAgents.map((agent) => {
            const isBuyer = agent.agentType === 'BUYER';
            const isSuspended = agent.status === 'SUSPENDED';

            return (
              <Card
                key={agent.id}
                className={`relative overflow-hidden transition-all duration-200 bg-[#fffdf9] border border-[#1e3a8a]/20 shadow-xs ${
                  isSuspended ? 'opacity-85 border-[#172554]/40 bg-[#faf7ee]' : ''
                }`}
              >
                {/* Agent Header */}
                <div className="flex items-start justify-between pb-3.5 border-b border-[#1e3a8a]/15">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-2xl border border-[#1e3a8a]/20 bg-[#f4efe3] text-[#1d4ed8]">
                      <Bot className="w-5 h-5 text-[#1d4ed8]" />
                    </div>
                    <div>
                      <h3 className="font-bold text-[#172554] text-sm">{cleanAgentName(agent.name)}</h3>
                      <div className="flex items-center gap-2 text-xs text-[#1e3a8a] mt-0.5">
                        <span className="font-mono text-[11px] text-[#1d4ed8] font-bold flex items-center gap-1">
                          <Sparkles className="w-3 h-3 text-[#1d4ed8]" />
                          Autonomous Agent Engine
                        </span>
                        <span>•</span>
                        <span>{agent.business?.name || 'Independent Business'}</span>
                      </div>
                    </div>
                  </div>
                  <StatusBadge status={agent.status} />
                </div>

                {/* Agent Metrics & Persona */}
                <div className="py-4 space-y-3.5 text-xs">
                  {/* Trust Score */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[#1e3a8a]">Zero-Trust Reliability Index</span>
                      <span className="font-mono font-bold text-[#1d4ed8]">
                        {agent.trustScore} / 100
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-[#f4efe3] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#1d4ed8]"
                        style={{ width: `${Math.min(100, agent.trustScore)}%` }}
                      />
                    </div>
                  </div>

                  {/* Persona & Role */}
                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div>
                      <span className="text-[#1e3a8a] block">Agent Persona:</span>
                      <span className="text-[#172554] font-bold">
                        {agent.agentType?.replace(/_/g, ' ')}
                      </span>
                    </div>
                    <div>
                      <span className="text-[#1e3a8a] block">Operational Mode:</span>
                      <span className="font-mono text-[#172554] font-bold">Deterministic ACP</span>
                    </div>
                  </div>

                  {/* Directive Box */}
                  <div className="p-3 rounded-xl bg-[#faf7ee] border border-[#1e3a8a]/20 text-[11px] text-[#172554] space-y-1">
                    <div className="flex items-center gap-1.5 text-[#172554] font-bold mb-0.5">
                      <Cpu className="w-3.5 h-3.5 text-[#1d4ed8]" /> Operational Directive:
                    </div>
                    <p className="leading-relaxed">
                      {agent.operationalDirective ||
                        (isBuyer
                          ? 'Enforces bulk procurement <= ₹50,000 within 48h SLA. Rejects hidden fees.'
                          : 'Represents wholesale distributor in round-based price and SLA bidding.')}
                    </p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="pt-3 border-t border-[#1e3a8a]/15 flex items-center justify-between gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedAgent(agent)}
                    className="gap-1.5 text-xs font-bold"
                  >
                    <Terminal className="w-3.5 h-3.5" /> Instructions Config
                  </Button>

                  {!isBuyer && (
                    <Button
                      variant={agent.status === 'ACTIVE' ? 'secondary' : 'primary'}
                      size="sm"
                      onClick={() => toggleAgentStatus(agent)}
                      className="gap-1.5 text-xs font-bold"
                    >
                      {agent.status === 'ACTIVE' ? (
                        <>
                          <Pause className="w-3.5 h-3.5" /> Suspend Agent
                        </>
                      ) : (
                        <>
                          <Play className="w-3.5 h-3.5" /> Activate Agent
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Agent Details & Prompt Inspection Modal */}
      <Modal
        isOpen={Boolean(selectedAgent)}
        onClose={() => setSelectedAgent(null)}
        title={cleanAgentName(selectedAgent?.name) || 'Agent System Configuration'}
        subtitle="Prompt Instructions & Runtime Parameters"
      >
        {selectedAgent && (
          <div className="space-y-4 text-xs text-[#172554]">
            <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-[#faf7ee] border border-[#1e3a8a]/20 font-mono text-[11px]">
              <div>
                <span className="text-[#1e3a8a] block">Engine:</span>
                <span className="text-[#1d4ed8] font-bold">Autonomous ACP Engine</span>
              </div>
              <div>
                <span className="text-[#1e3a8a] block">Status:</span>
                <span className="text-[#172554] font-bold">{selectedAgent.status}</span>
              </div>
              <div>
                <span className="text-[#1e3a8a] block">Temperature:</span>
                <span className="font-bold">{selectedAgent.temperature || 0.2}</span>
              </div>
              <div>
                <span className="text-[#1e3a8a] block">Trust Score:</span>
                <span className="text-[#1d4ed8] font-bold">{selectedAgent.trustScore} / 100</span>
              </div>
            </div>

            <div>
              <span className="text-xs font-bold text-[#172554] block mb-1">
                System Prompt Instructions
              </span>
              <pre className="p-3 rounded-xl bg-[#faf7ee] border border-[#1e3a8a]/20 text-[11px] font-mono text-[#172554] whitespace-pre-wrap leading-relaxed max-h-48 overflow-y-auto">
                {selectedAgent.systemPromptSnippet ||
                  'You are an autonomous B2B commercial representative. Conduct negotiations strictly conforming to Agent Communication Protocol (ACP) v1.0.'}
              </pre>
            </div>

            {selectedAgent.agentType === 'SELLER_C_MALICIOUS' && (
              <div className="p-3 rounded-xl bg-[#f4efe3] border border-[#172554]/30 text-[11px] text-[#172554] space-y-1">
                <span className="font-bold block flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-[#1d4ed8]" /> Adversarial Simulation Profile:
                </span>
                <p>
                  This agent is intentionally programmed with adversarial heuristics to benchmark the buyer zero-trust scanner against prompt injections, hidden narrative handling fees, and phantom inventory.
                </p>
              </div>
            )}

            <div className="pt-2 flex justify-end">
              <Button variant="secondary" size="sm" onClick={() => setSelectedAgent(null)}>
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
