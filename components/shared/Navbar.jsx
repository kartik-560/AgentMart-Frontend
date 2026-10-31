'use client';

import React, { useState } from 'react';
import { useSocketContext } from '../../context/SocketContext';
import { useBusiness } from '../../context/BusinessContext';
import { useUI } from '../../context/UIContext';
import { formatINR } from '../../utils/formatters';
import Link from 'next/link';
import {
  Menu,
  Radio,
  Landmark,
  ShieldCheck,
  Bell,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
} from 'lucide-react';

export default function Navbar() {
  const { isConnected } = useSocketContext() || {};
  const { profile } = useBusiness() || {};
  const { toggleSidebar } = useUI();
  const [showNotifications, setShowNotifications] = useState(false);

  const notifications = [
    {
      id: 1,
      title: 'Optimal Offer Identified',
      desc: 'Prism Wholesale quoted ₹44,400 with 88.5 utility score.',
      time: 'Just now',
      type: 'success',
      link: '/approvals',
    },
    {
      id: 2,
      title: 'Adversarial Threat Quarantined',
      desc: 'Seller C attempted ₹12,000 hidden surcharge in narrative text.',
      time: '3m ago',
      type: 'threat',
      link: '/security',
    },
    {
      id: 3,
      title: 'Human Approval Required',
      desc: 'Transaction #tx-demo-001 requires director signature before UPI dispatch.',
      time: '5m ago',
      type: 'action',
      link: '/approvals',
    },
  ];

  return (
    <header className="h-16 border-b border-slate-800/80 bg-slate-950/70 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between sticky top-0 z-20">
      {/* Left: Mobile Toggle & Enterprise Title */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={toggleSidebar}
          className="lg:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-900 border border-slate-800"
          aria-label="Toggle navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-200 font-semibold">
            <Landmark className="w-4 h-4 text-indigo-400 shrink-0" />
            <span className="truncate max-w-[160px] sm:max-w-xs">{profile?.name || 'Apex Retail Enterprises'}</span>
          </div>
          <span className="text-slate-700 hidden sm:inline">|</span>
          <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-400 font-mono">
            <span>Budget Ceiling:</span>
            <span className="text-emerald-400 font-bold">{formatINR(profile?.budgetLimit || 50000)}</span>
          </div>
        </div>
      </div>

      {/* Right: Live Socket Indicator, Notifications & Trust Badge */}
      <div className="flex items-center gap-3">
        {/* Real-time Socket status indicator */}
        <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800 text-xs">
          <Radio className={`w-3.5 h-3.5 ${isConnected ? 'text-emerald-400 animate-pulse' : 'text-amber-500'}`} />
          <span className="text-slate-300 font-mono text-[11px] hidden sm:inline">
            {isConnected ? 'SOCKET.IO LIVE' : 'SYNCHRONIZING'}
          </span>
        </div>

        {/* Zero-Trust Badge */}
        <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-950/40 border border-indigo-800/50 text-[11px] text-indigo-300 font-mono">
          <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
          <span>Zero-Trust v1.0</span>
        </div>

        {/* Notifications Popover */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowNotifications((prev) => !prev)}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-900 border border-slate-800 relative transition-colors"
            aria-label="Notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-slate-950" />
          </button>

          {showNotifications && (
            <>
              <div
                className="fixed inset-0 z-30"
                onClick={() => setShowNotifications(false)}
              />
              <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl p-4 z-40 text-xs space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <span className="font-semibold text-slate-100">Live Agent Notifications</span>
                  <span className="text-[10px] text-slate-400 font-mono">3 Unread Alerts</span>
                </div>

                <div className="space-y-2 max-h-72 overflow-y-auto">
                  {notifications.map((item) => (
                    <Link
                      key={item.id}
                      href={item.link}
                      onClick={() => setShowNotifications(false)}
                      className="block p-2.5 rounded-lg bg-slate-950 hover:bg-slate-800/80 border border-slate-800/80 transition-colors"
                    >
                      <div className="flex items-start gap-2.5">
                        {item.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />}
                        {item.type === 'threat' && <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />}
                        {item.type === 'action' && <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-slate-200 text-xs">{item.title}</span>
                            <span className="text-[10px] text-slate-500">{item.time}</span>
                          </div>
                          <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">{item.desc}</p>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>

                <div className="pt-1 text-center">
                  <Link
                    href="/approvals"
                    onClick={() => setShowNotifications(false)}
                    className="inline-flex items-center gap-1 text-[11px] text-indigo-400 hover:text-indigo-300 font-medium"
                  >
                    View Settlement Queue <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
