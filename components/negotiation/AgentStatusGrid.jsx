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
        return 'QUARANTINED: Disguised ₹12,000 logistics fee intercepted by SecurityEngine';
      default:
        return 'Monitoring negotiation channel';
    }
  };

  const getAgentTheme = (agentType) => {
    switch (agentType) {
      case 'BUYER':
        return {
          border: 'border-indigo-500/40 bg-indigo-950/20',
          iconColor: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20',
          badgeText: 'Enterprise Buyer',
          accent: 'text-indigo-400',
        };
      case 'SELLER_A_PRICE':
        return {
          border: 'border-emerald-500/40 bg-emerald-950/20',
          iconColor: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
          badgeText: 'Seller A (Price Focus)',
          accent: 'text-emerald-400',
        };
      case 'SELLER_B_SPEED_QUALITY':
        return {
          border: 'border-blue-500/40 bg-blue-950/20',
          iconColor: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
          badgeText: 'Seller B (Speed/Quality)',
          accent: 'text-blue-400',
        };
      case 'SELLER_C_MALICIOUS':
        return {
          border: 'border-rose-500/40 bg-rose-950/20',
          iconColor: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
          badgeText: 'Seller C (Adversarial)',
          accent: 'text-rose-400',
        };
      default:
        return {
          border: 'border-slate-800 bg-slate-900',
          iconColor: 'text-slate-400 bg-slate-800',
          badgeText: 'Independent Agent',
          accent: 'text-slate-400',
        };
    }
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
      {agents.map((agent) => {
        const theme = getAgentTheme(agent.agentType);
        const isMalicious = agent.agentType === 'SELLER_C_MALICIOUS';
        const activity = getAgentActivity(agent.agentType);

        return (
          <div
            key={agent.id}
            className={`p-3.5 rounded-2xl border ${theme.border} backdrop-blur-sm relative overflow-hidden flex flex-col justify-between`}
          >
            <div>
              {/* Top Row: Icon + Name + Status */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div className={`p-2 rounded-xl border ${theme.iconColor}`}>
                    <Bot className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-100 text-xs truncate max-w-[120px]">
                      {agent.name.split(' (')[0]}
                    </h4>
                    <span className="text-[10px] text-slate-400 font-mono block">
                      {theme.badgeText}
                    </span>
                  </div>
                </div>
                <StatusBadge
                  status={isMalicious ? 'FLAGGED' : agent.status}
                  size="xs"
                />
              </div>

              {/* Model & Trust Score */}
              <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
                <span className="font-mono text-slate-400 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-indigo-400" />
                  {agent.modelName || 'gemini-2.0-flash'}
                </span>
                <span
                  className={`font-mono font-bold ${
                    agent.trustScore < 50 ? 'text-rose-400' : 'text-emerald-400'
                  }`}
                >
                  Trust: {agent.trustScore}%
                </span>
              </div>

              {/* Progress bar for trust */}
              <div className="w-full h-1 bg-slate-950 rounded-full overflow-hidden mt-1.5">
                <div
                  className={`h-full ${
                    agent.trustScore < 50 ? 'bg-rose-500' : 'bg-emerald-500'
                  }`}
                  style={{ width: `${Math.min(100, agent.trustScore)}%` }}
                />
              </div>

              {/* Current Activity */}
              <div className="mt-2.5 p-2 rounded-lg bg-slate-950/70 border border-slate-800/70 text-[10px] leading-relaxed">
                <div className="flex items-center gap-1 font-mono text-slate-400 mb-0.5">
                  {isMalicious ? (
                    <AlertTriangle className="w-3 h-3 text-rose-400 shrink-0" />
                  ) : (
                    <Clock className="w-3 h-3 text-indigo-400 shrink-0" />
                  )}
                  <span>Live Status:</span>
                </div>
                <p className={isMalicious ? 'text-rose-300 font-medium' : 'text-slate-300'}>
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

