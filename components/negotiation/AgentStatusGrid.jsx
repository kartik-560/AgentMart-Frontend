'use client';

import React from 'react';
import { Bot, ShieldAlert, Cpu, Sparkles, CheckCircle2, AlertTriangle, Clock } from 'lucide-react';
import StatusBadge from '../shared/StatusBadge';

export default function AgentStatusGrid({ agents = [], activeRound = 2 }) {
  const getAgentActivity = (agentType) => {
    switch (agentType) {
      case 'BUYER':
        return activeRound >= 2
          ? 'Evaluating Round 2 quotes against ₹50k ceiling & 25% margin target'
          : 'Broadcasting RFQ across 3 competing supplier agents';
      case 'SELLER_A_PRICE':
        return activeRound >= 2
          ? 'Countered with volume concession: ₹3,700/unit (40h SLA)'
          : 'Submitted initial bid of ₹3,850/unit';
      case 'SELLER_B_SPEED_QUALITY':
        return activeRound >= 2
          ? 'Firm floor reached at ₹3,950/unit (20h expedited SLA)'
          : 'Submitted expedited quote of ₹4,100/unit';
      case 'SELLER_C_MALICIOUS':
        return 'QUARANTINED: Disguised ₹12,000 logistics fee intercepted by Zero-Trust Engine';
      default:
        return 'Monitoring negotiation channel';
    }
  };

  const getAgentLabel = (agentType) => {
    switch (agentType) {
      case 'BUYER':
        return 'Enterprise Buyer';
      case 'SELLER_A_PRICE':
        return 'Seller A (Price Focus)';
      case 'SELLER_B_SPEED_QUALITY':
        return 'Seller B (Speed/Quality)';
      case 'SELLER_C_MALICIOUS':
        return 'Seller C (Adversarial)';
      default:
        return 'Autonomous Agent';
    }
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
      {agents.map((agent) => {
        const isMalicious = agent.agentType === 'SELLER_C_MALICIOUS';
        const activity = getAgentActivity(agent.agentType);
        const label = getAgentLabel(agent.agentType);

        return (
          <div
            key={agent.id}
            className="p-3.5 rounded-2xl border border-[#1e3a8a]/20 bg-[#fffdf9] shadow-xs relative overflow-hidden flex flex-col justify-between text-[#172554]"
          >
            <div>
              {/* Top Row: Icon + Name + Status */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl border border-[#1e3a8a]/20 bg-[#f4efe3] text-[#1d4ed8]">
                    <Bot className="w-4 h-4 text-[#1d4ed8]" />
                  </div>
                  <div>
                    <h4 className="font-bold text-[#172554] text-xs truncate max-w-[120px]">
                      {agent.name.split(' (')[0]}
                    </h4>
                    <span className="text-[10px] text-[#1e3a8a] font-mono block">
                      {label}
                    </span>
                  </div>
                </div>
                <StatusBadge
                  status={isMalicious ? 'FLAGGED' : agent.status}
                  size="xs"
                />
              </div>

              {/* Trust Score */}
              <div className="mt-3 pt-2 border-t border-[#1e3a8a]/15 flex items-center justify-between text-[11px]">
                <span className="font-mono text-[#1e3a8a] flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-[#1d4ed8]" />
                  {label}
                </span>
                <span className="font-mono font-bold text-[#172554]">
                  Trust: {agent.trustScore}%
                </span>
              </div>

              {/* Progress bar for trust */}
              <div className="w-full h-1.5 bg-[#f4efe3] rounded-full overflow-hidden mt-1.5">
                <div
                  className="h-full bg-[#1d4ed8]"
                  style={{ width: `${Math.min(100, agent.trustScore)}%` }}
                />
              </div>

              {/* Current Activity */}
              <div className="mt-2.5 p-2 rounded-lg bg-[#faf7ee] border border-[#1e3a8a]/20 text-[10px] leading-relaxed">
                <div className="flex items-center gap-1 font-mono text-[#1e3a8a] mb-0.5">
                  {isMalicious ? (
                    <AlertTriangle className="w-3 h-3 text-[#1d4ed8] shrink-0" />
                  ) : (
                    <Clock className="w-3 h-3 text-[#1d4ed8] shrink-0" />
                  )}
                  <span className="font-bold">Live Status:</span>
                </div>
                <p className="text-[#172554]">
                  {activity}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
