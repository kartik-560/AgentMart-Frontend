'use client';

import React, { useState } from 'react';
import { useSocketContext } from '../../context/SocketContext';
import { useBusiness } from '../../context/BusinessContext';
import { useUI } from '../../context/UIContext';
import { useAuth } from '../../context/AuthContext';
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
  Store,
  LogOut,
  LogIn,
} from 'lucide-react';

export default function Navbar() {
  const { isConnected } = useSocketContext() || {};
  const { profile } = useBusiness() || {};
  const { toggleSidebar } = useUI();
  const { user, isSeller, isAuthenticated, logout } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);

  const notifications = [
    {
      id: 1,
      title: 'Optimal Offer Identified',
      desc: 'Prism Wholesale quoted ₹44,400 with 88.5 utility score.',
      time: 'Just now',
      link: isSeller ? '/seller/dashboard' : '/approvals',
    },
    {
      id: 2,
      title: 'Adversarial Threat Quarantined',
      desc: 'Seller C attempted ₹12,000 hidden surcharge in narrative text.',
      time: '3m ago',
      link: '/security',
    },
    {
      id: 3,
      title: 'Human Settlement Required',
      desc: 'Senior procurement authorization required before settlement.',
      time: '5m ago',
      link: isSeller ? '/seller/dashboard' : '/approvals',
    },
  ];

  return (
    <header className="h-14 min-h-[56px] max-h-[56px] shrink-0 border-b border-[#1e3a8a]/20 bg-[#faf7ee] px-4 sm:px-6 flex items-center justify-between sticky top-0 z-20 select-none text-[#172554]">
      {/* Left: Mobile Toggle & Enterprise / Supplier Title */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          type="button"
          onClick={toggleSidebar}
          className="lg:hidden p-1.5 rounded-md text-[#1e3a8a] hover:bg-[#f4efe3] border border-[#1e3a8a]/20"
          aria-label="Toggle navigation menu"
        >
          <Menu className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-2.5 min-w-0">
          <div className="flex items-center gap-2 text-xs sm:text-sm font-semibold truncate text-[#172554]">
            {isSeller ? (
              <Store className="w-4 h-4 text-[#1d4ed8] shrink-0" />
            ) : (
              <Landmark className="w-4 h-4 text-[#1d4ed8] shrink-0" />
            )}
            <span className="truncate max-w-[160px] sm:max-w-xs">
              {isSeller
                ? user?.business?.name || 'Verified Supplier Network'
                : user?.business?.name || profile?.name || 'Enterprise Procurement'}
            </span>
          </div>

          <span className="text-[#1e3a8a]/40 hidden sm:inline">/</span>

          {isSeller ? (
            <div className="hidden sm:flex items-center gap-1.5 text-xs text-[#1d4ed8] font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-[#1d4ed8]" />
              <span>Supplier Hub</span>
            </div>
          ) : (
            <div className="hidden sm:flex items-center gap-1.5 text-xs text-[#1e3a8a] font-mono">
              <span>Cap:</span>
              <span className="text-[#1d4ed8] font-bold">{formatINR(profile?.budgetLimit || 50000)}</span>
            </div>
          )}
        </div>
      </div>

      {/* Right: Live Socket Indicator, Notifications & User Pill */}
      <div className="flex items-center gap-2.5 shrink-0">
        {/* Real-time Socket status indicator */}
        <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-[#fffdf9] border border-[#1e3a8a]/25 text-[11px] font-mono text-[#172554]">
          <span
            className={`w-1.5 h-1.5 rounded-full shrink-0 ${
              isConnected ? 'bg-[#1d4ed8] animate-pulse' : 'bg-[#1e3a8a]/40'
            }`}
          />
          <span className="hidden sm:inline">
            {isConnected ? 'LIVE' : 'SYNCING'}
          </span>
        </div>

        {/* Role Badge */}
        <div className="hidden md:flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-mono border border-[#1d4ed8] bg-[#1d4ed8] text-[#faf7ee]">
          <span>{isSeller ? 'SELLER' : 'BUYER'}</span>
        </div>

        {/* Notifications Popover */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowNotifications((prev) => !prev)}
            className="p-1.5 rounded-md text-[#1e3a8a] hover:bg-[#f4efe3] border border-[#1e3a8a]/20 relative transition-colors"
            aria-label="Notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-[#1d4ed8]" />
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-[#fffdf9] border border-[#1e3a8a]/30 rounded-xl shadow-lg p-3 space-y-2 z-50 text-xs animate-in fade-in duration-100 text-[#172554]">
              <div className="flex items-center justify-between pb-2 border-b border-[#1e3a8a]/15">
                <span className="font-semibold text-xs">Event Notifications</span>
                <span className="text-[10px] text-[#1d4ed8] font-mono font-bold">3 unread</span>
              </div>
              <div className="space-y-1.5 max-h-72 overflow-y-auto">
                {notifications.map((n) => (
                  <Link
                    key={n.id}
                    href={n.link}
                    onClick={() => setShowNotifications(false)}
                    className="block p-2 rounded-lg bg-[#faf7ee] hover:bg-[#f4efe3] border border-[#1e3a8a]/15 transition-colors"
                  >
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <span className="font-semibold text-[#172554] text-xs">{n.title}</span>
                      <span className="text-[10px] text-[#1d4ed8] font-mono shrink-0">{n.time}</span>
                    </div>
                    <p className="text-[11px] text-[#1e3a8a] leading-snug">{n.desc}</p>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* User Pill / Login Link */}
        {isAuthenticated ? (
          <div className="hidden sm:flex items-center gap-2 pl-2 border-l border-[#1e3a8a]/20 text-xs">
            <span className="text-[#172554] font-semibold truncate max-w-[120px]">
              {user?.name}
            </span>
          </div>
        ) : (
          <Link
            href="/login"
            className="px-2.5 py-1 rounded-md bg-[#1d4ed8] hover:bg-[#1e40af] text-[#faf7ee] font-medium text-xs flex items-center gap-1.5 transition-colors"
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Sign In</span>
          </Link>
        )}
      </div>
    </header>
  );
}
