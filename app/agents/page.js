'use client';

import React, { useEffect, useState } from 'react';
import Card from '../../components/shared/Card';
import StatusBadge from '../../components/shared/StatusBadge';
import Button from '../../components/shared/Button';
import Modal from '../../components/shared/Modal';
import { agentService } from '../../services/agentService';
import { useUI } from '../../context/UIContext';
import {
  Bot,
  Shield,
  AlertTriangle,
  Cpu,
  Play,
  Pause,
  Sparkles,
  Sliders,
  Terminal,
  Activity,
  Award,
} from 'lucide-react';

export default function AgentManagementPage() {
  const { showToast } = useUI();
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
        `${agent.name} is now ${nextStatus === 'ACTIVE' ? 'Active' : 'Suspended'}!`,
        nextStatus === 'ACTIVE' ? 'success' : 'error'
      );
    } catch {
      showToast('Status modified in local runtime.', 'info');
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-100 flex items-center gap-2">
            <Bot className="w-6 h-6 text-indigo-400 shrink-0" /> Multi-Agent Management Matrix
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Monitor, inspect, and configure the four independent autonomous agents powered by Google Gemini API.
          </p>
        </div>
      </div>

      {/* Agents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {agents.map((agent) => {
          const isMalicious = agent.agentType === 'SELLER_C_MALICIOUS';
          const isBuyer = agent.agentType === 'BUYER';
          const isSuspended = agent.status === 'SUSPENDED';

          return (
            <Card
              key={agent.id}
              className={`relative overflow-hidden transition-all duration-200 ${
                isSuspended ? 'opacity-85 border-rose-900/40 bg-slate-950/80' : ''
              }`}
            >
              {/* Agent Header */}
              <div className="flex items-start justify-between pb-3.5 border-b border-slate-800">
                <div className="flex items-center gap-3">
                  <div
                    className={`p-3 rounded-2xl border ${
                      isBuyer
                        ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-400'
                        : isMalicious
                        ? 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                        : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                    }`}
                  >
                    <Bot className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-100 text-sm">{agent.name}</h3>
                    <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                      <span className="font-mono text-[11px] text-indigo-300 flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-indigo-400" />
                        {agent.modelName || 'gemini-2.0-flash'}
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
                    <span className="text-slate-400">Zero-Trust Reliability Index</span>
                    <span
                      className={`font-mono font-bold ${
                        agent.trustScore < 50 ? 'text-rose-400' : 'text-emerald-400'
                      }`}
                    >
                      {agent.trustScore} / 100
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${
                        agent.trustScore < 50 ? 'bg-rose-500' : 'bg-emerald-500'
                      }`}
                      style={{ width: `${Math.min(100, agent.trustScore)}%` }}
                    />
                  </div>
                </div>

                {/* Persona & Role */}
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-slate-500 block">Agent Persona:</span>
                    <span className="text-slate-200 font-medium">
                      {agent.agentType?.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Temperature:</span>
                    <span className="font-mono text-slate-300">{agent.temperature || 0.2}</span>
                  </div>
                </div>

                {/* Directive Box */}
                <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-[11px] text-slate-400 space-y-1">
                  <div className="flex items-center gap-1.5 text-slate-300 font-semibold mb-0.5">
                    <Cpu className="w-3.5 h-3.5 text-indigo-400" /> Operational Directive:
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
              <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedAgent(agent)}
                  className="gap-1.5 text-xs"
                >
                  <Terminal className="w-3.5 h-3.5" /> Prompt Config
                </Button>

                {!isBuyer && (
                  <Button
                    variant={agent.status === 'ACTIVE' ? 'danger' : 'success'}
                    size="sm"
                    onClick={() => toggleAgentStatus(agent)}
                    className="gap-1.5 text-xs"
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

      {/* Agent Details & Prompt Inspection Modal */}
      <Modal
        isOpen={Boolean(selectedAgent)}
        onClose={() => setSelectedAgent(null)}
        title={selectedAgent?.name || 'Agent System Configuration'}
        subtitle="Gemini 2.0 Prompt Instructions & Runtime Parameters"
      >
        {selectedAgent && (
          <div className="space-y-4 text-xs text-slate-300">
            <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-slate-950 border border-slate-800 font-mono text-[11px]">
              <div>
                <span className="text-slate-500 block">LLM Model:</span>
                <span className="text-indigo-400">{selectedAgent.modelName || 'gemini-2.0-flash'}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Status:</span>
                <span className="text-emerald-400">{selectedAgent.status}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Temperature:</span>
                <span>{selectedAgent.temperature || 0.2}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Trust Score:</span>
                <span className="text-emerald-400">{selectedAgent.trustScore} / 100</span>
              </div>
            </div>

            <div>
              <span className="text-xs font-semibold text-slate-200 block mb-1">
                System Prompt Instructions
              </span>
              <pre className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-[11px] font-mono text-slate-300 whitespace-pre-wrap leading-relaxed max-h-48 overflow-y-auto">
                {selectedAgent.systemPromptSnippet ||
                  'You are an autonomous B2B commercial representative. Conduct negotiations strictly conforming to Agent Communication Protocol (ACP) v1.0.'}
              </pre>
            </div>

            {selectedAgent.agentType === 'SELLER_C_MALICIOUS' && (
              <div className="p-3 rounded-xl bg-rose-950/30 border border-rose-800 text-[11px] text-rose-300 space-y-1">
                <span className="font-bold block flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-400" /> Adversarial Simulation Profile:
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
