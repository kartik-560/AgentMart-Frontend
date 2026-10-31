'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useUI } from '../../context/UIContext';
import { transactionService } from '../../services/transactionService';
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
  X,
  Radio,
} from 'lucide-react';

export default function Sidebar() {
  const pathname = usePathname();
  const { sidebarOpen, closeSidebar } = useUI();
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    let mounted = true;
    transactionService
      .getAll()
      .then((res) => {
        if (mounted && res?.data && Array.isArray(res.data)) {
          const count = res.data.filter((t) => t.settlementStatus === 'PENDING_APPROVAL').length;
          setPendingCount(count);
        }
      })
      .catch(() => {});

    return () => {
      mounted = false;
    };
  }, [pathname]);

  const navItems = [
    { href: '/', label: 'Overview Dashboard', icon: LayoutDashboard },
    { href: '/profile', label: 'Business Profile', icon: Building2 },
    { href: '/agents', label: 'Agent Management', icon: Bot, badge: '4 Agents' },
    {
      href: '/negotiation',
      label: 'Live Negotiation Room',
      icon: MessageSquareCode,
      badge: 'Active',
      badgeColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    },
    { href: '/marketplace', label: 'Marketplace Catalog', icon: ShoppingBag, badge: '40 SKUs' },
    { href: '/comparison', label: 'Offer Comparison', icon: Scale },
    {
      href: '/security',
      label: 'Security & Trust Center',
      icon: ShieldCheck,
      badge: 'Zero-Trust',
      badgeColor: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
    },
    {
      href: '/approvals',
      label: 'Transaction Approval',
      icon: CheckCircle2,
      badge: pendingCount > 0 ? `${pendingCount} Pending` : null,
      badgeColor: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    },
    { href: '/history', label: 'Transaction History', icon: History },
    { href: '/audit', label: 'Audit Trail Logs', icon: FileText },
  ];

  const renderNavList = () => (
    <div className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
      <div className="px-3 pb-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider font-mono">
        Autonomous Procurement
      </div>
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={closeSidebar}
            className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all group ${
              isActive
                ? 'bg-indigo-600/15 text-indigo-300 border border-indigo-500/30 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
            }`}
          >
            <div className="flex items-center gap-3">
              <Icon
                className={`w-4 h-4 transition-colors ${
                  isActive ? 'text-indigo-400' : 'text-slate-400 group-hover:text-slate-300'
                }`}
              />
              <span>{item.label}</span>
            </div>
            {item.badge && (
              <span
                className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-medium border ${
                  item.badgeColor || 'bg-slate-800 text-slate-400 border-slate-700/60'
                }`}
              >
                {item.badge}
              </span>
            )}
          </Link>
        );
      })}
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside className="hidden lg:flex w-64 bg-slate-950/95 border-r border-slate-800/80 flex-col shrink-0 min-h-screen sticky top-0 h-screen">
        {/* Brand Header */}
        <div className="h-16 flex items-center px-6 border-b border-slate-800/80 gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-500 flex items-center justify-center text-white shadow-indigo-500/25 shadow-lg">
            <Boxes className="w-5 h-5" />
          </div>
          <div>
            <span className="font-bold text-slate-100 tracking-tight text-base">AgentMart</span>
            <span className="block text-[10px] text-indigo-400 font-mono font-medium uppercase tracking-wider">
              Autonomous B2B
            </span>
          </div>
        </div>

        {/* Navigation items */}
        {renderNavList()}

        {/* Footer Info */}
        <div className="p-4 border-t border-slate-800/80 bg-slate-950/60 text-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-slate-300 font-medium text-[11px]">Gemini 2.0 Engine</span>
            </div>
            <span className="text-[10px] text-slate-500 font-mono">v1.0</span>
          </div>
          <div className="mt-1.5 text-[10px] text-slate-500 font-mono">
            Autonomous Procurement / Zero-Trust
          </div>
        </div>
      </aside>

      {/* Mobile Drawer Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm transition-opacity"
            onClick={closeSidebar}
          />
          <div className="relative w-72 bg-slate-950 border-r border-slate-800 flex flex-col h-full z-10 shadow-2xl animate-in slide-in-from-left duration-200">
            <div className="h-16 flex items-center justify-between px-6 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
                  <Boxes className="w-4 h-4" />
                </div>
                <span className="font-bold text-slate-100 text-sm">AgentMart</span>
              </div>
              <button
                onClick={closeSidebar}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            {renderNavList()}
          </div>
        </div>
      )}
    </>
  );
}
