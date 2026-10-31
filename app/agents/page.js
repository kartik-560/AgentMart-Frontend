'use client';

import React, { useEffect, useState } from 'react';
import Card from '../../components/shared/Card';
import StatusBadge from '../../components/shared/StatusBadge';
import Button from '../../components/shared/Button';
import { agentService } from '../../services/agentService';
import { Bot, Shield, AlertTriangle, Cpu, Play, Pause } from 'lucide-react';

export default function AgentManagementPage() {
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    agentService.getAll()
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

  const toggleAgentStatus = (agent) => {
    const nextStatus = agent.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    agentService.updateStatus(agent.id, nextStatus)
      .then(() => {
        setAgents((prev) =>
          prev.map((a) => (a.id === agent.id ? { ...a, status: nextStatus } : a))
        );
      })
      .catch(() => {});
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
          <Bot className="w-6 h-6 text-indigo-400" /> Multi-Agent Management Matrix
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Monitor and configure autonomous B2B agents powered by Google Gemini API.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {agents.map((agent) => {
          const isMalicious = agent.agentType === 'SELLER_C_MALICIOUS';
          const isBuyer = agent.agentType === 'BUYER';

          return (
            <Card key={agent.id} className="relative overflow-hidden">
              <div className="flex items-start justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-3">
                  <div className={`p-2.5 rounded-xl border ${
                    isBuyer ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-400' :
                    isMalicious ? 'bg-rose-500/10 border-rose-500/30 text-rose-400' :
                    'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                  }`}>
                    <Bot className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-100 text-sm">{agent.name}</h3>
                    <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                      <span className="font-mono text-[11px] text-indigo-300">{agent.modelName || 'gemini-2.0-flash'}</span>
                      <span>•</span>
                      <span>{agent.business?.name || 'Independent Business'}</span>
                    </div>
                  </div>
                </div>
                <StatusBadge status={agent.status} />
              </div>

              <div className="py-3 space-y-3 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Trust & Safety Score</span>
                  <span className={`font-mono font-bold ${
                    agent.trustScore < 50 ? 'text-rose-400' : 'text-emerald-400'
                  }`}>
                    {agent.trustScore} / 100
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Agent Persona</span>
                  <span className="font-mono text-slate-300">
                    {agent.agentType?.replace(/_/g, ' ')}
                  </span>
                </div>

                <div className="p-2.5 rounded bg-slate-950 border border-slate-800 text-[11px] text-slate-400">
                  <div className="flex items-center gap-1.5 text-slate-300 font-semibold mb-1">
                    <Cpu className="w-3.5 h-3.5 text-indigo-400" /> Operational Directive:
                  </div>
                  {isBuyer && 'Secures bulk procurement <= ₹50,000 within 48h SLA. Rejects hidden fees.'}
                  {agent.agentType === 'SELLER_A_PRICE' && 'Leads with competitive volume discounts. 40h standard SLA.'}
                  {agent.agentType === 'SELLER_B_SPEED_QUALITY' && 'Guarantees 20h delivery SLA, Enterprise-Grade durability with strict price floor.'}
                  {isMalicious && 'Simulates adversarial supplier actions: hidden surcharges, prompt injections, and phantom stock.'}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
                {!isBuyer && (
                  <Button
                    variant={agent.status === 'ACTIVE' ? 'outline' : 'success'}
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
    </div>
  );
}

