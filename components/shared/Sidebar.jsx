'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Building2,
  Bot,
  MessageSquareCode,
  ShoppingBag,
  Scale,
  ShieldCheck,
  CheckCircle2,
  History,
  FileText,
  Boxes,
} from 'lucide-react';

const NAV_ITEMS = [
  { href: '/', label: 'Overview Dashboard', icon: LayoutDashboard },
  { href: '/profile', label: 'Business Profile', icon: Building2 },
  { href: '/agents', label: 'Agent Management', icon: Bot },
  { href: '/negotiation', label: 'Live Negotiation', icon: MessageSquareCode },
  { href: '/marketplace', label: 'Marketplace & SKUs', icon: ShoppingBag },
  { href: '/comparison', label: 'Offer Comparison', icon: Scale },
  { href: '/security', label: 'Security & Trust', icon: ShieldCheck },
  { href: '/approvals', label: 'Transaction Approval', icon: CheckCircle2 },
  { href: '/history', label: 'Transaction History', icon: History },
  { href: '/audit', label: 'Audit Logs', icon: FileText },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-slate-950/90 border-r border-slate-800/80 flex flex-col shrink-0 min-h-screen">
      {/* Brand Header */}
      <div className="h-16 flex items-center px-6 border-b border-slate-800/80 gap-3">
        <div className="w-9 h-9 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-indigo-500/30 shadow-md">
          <Boxes className="w-5 h-5" />
        </div>
        <div>
          <span className="font-bold text-slate-100 tracking-tight text-lg">AgentMart</span>
          <span className="block text-[10px] text-indigo-400 font-mono font-medium uppercase tracking-wider">Autonomous B2B</span>
        </div>
      </div>

      {/* Nav List */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <div className="px-3 pb-2 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
          Enterprise Ops
        </div>
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-indigo-600/15 text-indigo-400 border border-indigo-500/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-400' : 'text-slate-400'}`} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer Info */}
      <div className="p-4 border-t border-slate-800/80 text-xs text-slate-500">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-slate-400">Gemini 2.0 Multi-Agent</span>
        </div>
        <div className="mt-1 text-[11px] text-slate-500 font-mono">
          Demo: Max ₹50,000 / 48h SLA
        </div>
      </div>
    </aside>
  );
}

