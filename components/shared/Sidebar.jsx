'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useUI } from '../../context/UIContext';
import { useAuth } from '../../context/AuthContext';
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
  Package,
  X,
  Store,
  LogOut,
  LogIn,
  Sliders,
  ChevronRight,
} from 'lucide-react';

export default function Sidebar() {
  const pathname = usePathname();
  const { sidebarOpen, closeSidebar } = useUI();
  const { user, isSeller, isAuthenticated, logout } = useAuth();
  const [pendingCount, setPendingCount] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    let mounted = true;
    if (!isSeller) {
      transactionService
        .getAll()
        .then((res) => {
          if (mounted && res?.data && Array.isArray(res.data)) {
            const count = res.data.filter((t) => t.settlementStatus === 'PENDING_APPROVAL').length;
            setPendingCount(count);
          }
        })
        .catch(() => {});
    }

    return () => {
      mounted = false;
    };
  }, [pathname, isSeller]);

  // Buyer Navigation
  const buyerSections = [
    {
      heading: 'Procurement',
      items: [
        { href: '/', label: 'Overview', icon: LayoutDashboard },
        {
          href: '/negotiation',
          label: 'Live Negotiation',
          icon: MessageSquareCode,
          badge: 'Live',
        },
        { href: '/comparison', label: 'Offer Comparison', icon: Scale },
        {
          href: '/approvals',
          label: 'Approvals',
          icon: CheckCircle2,
          badge: pendingCount > 0 ? String(pendingCount) : null,
        },
      ],
    },
    {
      heading: 'Directory',
      items: [
        { href: '/marketplace', label: 'Marketplace', icon: ShoppingBag, count: '40' },
        { href: '/agents', label: 'AI Agents', icon: Bot, count: '4' },
        { href: '/profile', label: 'Organization', icon: Building2 },
      ],
    },
    {
      heading: 'Security & Audit',
      items: [
        {
          href: '/security',
          label: 'Security Radar',
          icon: ShieldCheck,
          badge: 'Zero-Trust',
        },
        { href: '/history', label: 'Transactions', icon: History },
        { href: '/audit', label: 'Audit Log', icon: FileText },
      ],
    },
  ];

  // Seller Navigation
  const sellerSections = [
    {
      heading: 'Supplier Operations',
      items: [
        { href: '/seller/dashboard', label: 'Supplier Hub', icon: Store },
        { href: '/seller/products', label: 'Product Catalogue', icon: Package },
        {
          href: '/seller/negotiation',
          label: 'Autonomous RFQs',
          icon: MessageSquareCode,
          badge: 'Live',
        },
        { href: '/seller/settings', label: 'Agent Settings', icon: Sliders },
      ],
    },
    {
      heading: 'Agent & Network',
      items: [
        { href: '/agents', label: 'My AI Agent', icon: Bot },
      ],
    },
    {
      heading: 'Settlement & Radar',
      items: [
        {
          href: '/security',
          label: 'Security Radar',
          icon: ShieldCheck,
          badge: 'Zero-Trust',
        },
        { href: '/history', label: 'History', icon: History },
        { href: '/audit', label: 'Audit Log', icon: FileText },
      ],
    },
  ];

  const currentSections = isSeller ? sellerSections : buyerSections;
  const isExpanded = isHovered || sidebarOpen;

  return (
    <>
      {/* Mobile Backdrop */}
      {sidebarOpen && (
        <div
          onClick={closeSidebar}
          className="fixed inset-0 bg-[#172554]/60 z-30 lg:hidden"
        />
      )}

      {/* Main Sidebar - Fixed Height (h-screen), Hover to Open/Close on Desktop */}
      <aside
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`fixed lg:sticky top-0 left-0 h-screen z-40 bg-[#172554] border-r border-[#1e3a8a] text-[#faf7ee] flex flex-col justify-between shrink-0 transition-[width] duration-300 ease-in-out select-none shadow-xl lg:shadow-none ${
          sidebarOpen ? 'translate-x-0 w-60' : '-translate-x-full lg:translate-x-0'
        } ${
          isHovered ? 'lg:w-60' : 'lg:w-[68px]'
        }`}
      >
        {/* ========================================================= */}
        {/* TOP: Brand Header                                         */}
        {/* ========================================================= */}
        <div className="h-14 min-h-[56px] max-h-[56px] shrink-0 px-3.5 border-b border-[#1e3a8a] flex items-center justify-between">
          <Link
            href={isSeller ? '/seller/dashboard' : '/'}
            className={`flex items-center gap-2.5 overflow-hidden ${isExpanded ? '' : 'justify-center w-full'}`}
          >
            <div className="w-8 h-8 rounded-lg bg-[#faf7ee] flex items-center justify-center text-[#172554] font-bold text-xs shrink-0 shadow-xs">
              <Boxes className="w-4 h-4 text-[#172554]" />
            </div>
            {isExpanded && (
              <div className="flex items-center gap-1.5 transition-opacity duration-200">
                <span className="text-sm font-bold text-[#faf7ee] tracking-tight">AgentMart</span>
                <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-[#1e3a8a] text-[#faf7ee] border border-[#2563eb]/40 font-semibold">
                  B2B
                </span>
              </div>
            )}
          </Link>

          {/* Mobile Close Button */}
          {sidebarOpen && (
            <button
              onClick={closeSidebar}
              className="lg:hidden p-1 rounded-md text-[#dbeafe] hover:text-[#faf7ee] hover:bg-[#1e3a8a]"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* ========================================================= */}
        {/* PORTAL / ORGANIZATION STATUS PILL                         */}
        {/* ========================================================= */}
        <div className="px-2.5 pt-2 pb-1 shrink-0">
          {isExpanded ? (
            <div className="px-2.5 py-1.5 rounded-lg bg-[#1e3a8a] border border-[#2563eb]/40 flex items-center justify-between text-xs text-[#faf7ee]">
              <div className="flex items-center gap-2 min-w-0">
                <span className="w-2 h-2 rounded-full bg-[#faf7ee] shrink-0" />
                <span className="text-[#faf7ee] font-medium truncate text-[11px]">
                  {isSeller ? (user?.business?.name || 'Supplier Network') : (user?.business?.name || 'Enterprise')}
                </span>
              </div>
              <span className="text-[9px] font-mono uppercase px-1 rounded bg-[#172554] text-[#faf7ee] border border-[#2563eb]/30 shrink-0">
                {isSeller ? 'Seller' : 'Buyer'}
              </span>
            </div>
          ) : (
            <div
              title={isSeller ? `Seller: ${user?.business?.name || 'Supplier'}` : `Buyer: ${user?.business?.name || 'Enterprise'}`}
              className="w-9 h-7 rounded-lg bg-[#1e3a8a] border border-[#2563eb]/30 mx-auto flex items-center justify-center text-[10px] font-mono font-bold text-[#faf7ee]"
            >
              {isSeller ? 'S' : 'B'}
            </div>
          )}
        </div>

        {/* ========================================================= */}
        {/* MIDDLE: Nav Sections (Only this inner list scrolls if tiny)*/}
        {/* ========================================================= */}
        <div className="flex-1 px-2.5 py-2 space-y-3 overflow-y-auto overflow-x-hidden custom-scrollbar">
          {currentSections.map((sec, sIdx) => (
            <div key={sIdx} className="space-y-0.5">
              {isExpanded ? (
                <div className="px-2 py-1 text-[10px] font-semibold text-[#bfdbfe] uppercase tracking-wider font-mono">
                  {sec.heading}
                </div>
              ) : (
                sIdx > 0 && <div className="h-px bg-[#1e3a8a]/40 my-2 mx-1" />
              )}

              {sec.items.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;

                return isExpanded ? (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={closeSidebar}
                    className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      isActive
                        ? 'bg-[#faf7ee] text-[#172554] font-semibold shadow-xs'
                        : 'text-[#dbeafe] hover:text-[#faf7ee] hover:bg-[#1e3a8a]'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Icon
                        className={`w-4 h-4 shrink-0 ${
                          isActive ? 'text-[#172554]' : 'text-[#bfdbfe]'
                        }`}
                      />
                      <span className="truncate whitespace-nowrap">{item.label}</span>
                    </div>

                    {item.badge ? (
                      <span
                        className={`text-[9px] px-1.5 py-0.2 rounded font-mono font-medium border shrink-0 ${
                          isActive
                            ? 'bg-[#172554] text-[#faf7ee] border-[#172554]'
                            : 'bg-[#1e3a8a] text-[#faf7ee] border-[#2563eb]/50'
                        }`}
                      >
                        {item.badge}
                      </span>
                    ) : item.count ? (
                      <span className={`text-[10px] font-mono shrink-0 ${isActive ? 'text-[#172554]' : 'text-[#bfdbfe]'}`}>
                        {item.count}
                      </span>
                    ) : null}
                  </Link>
                ) : (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={closeSidebar}
                    title={item.label}
                    className={`flex items-center justify-center w-10 h-9 mx-auto rounded-lg transition-colors relative ${
                      isActive
                        ? 'bg-[#faf7ee] text-[#172554] shadow-xs'
                        : 'text-[#bfdbfe] hover:text-[#faf7ee] hover:bg-[#1e3a8a]'
                    }`}
                  >
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-[#172554]' : 'text-[#bfdbfe]'}`} />
                    {item.badge && (
                      <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-[#1d4ed8]" />
                    )}
                  </Link>
                );
              })}
            </div>
          ))}
        </div>

        {/* ========================================================= */}
        {/* BOTTOM: Pinned User Footer & Logout Button (Always Visible) */}
        {/* ========================================================= */}
        <div className="shrink-0 p-2.5 border-t border-[#1e3a8a] bg-[#131f47]">
          {isAuthenticated ? (
            isExpanded ? (
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-7 h-7 rounded-md flex items-center justify-center bg-[#faf7ee] text-[#172554] shrink-0 font-bold text-xs shadow-xs">
                    {user?.name ? user.name[0].toUpperCase() : 'U'}
                  </div>
                  <div className="min-w-0">
                    <div className="text-[#faf7ee] font-semibold text-xs truncate leading-tight">
                      {user?.name}
                    </div>
                    <div className="text-[10px] text-[#bfdbfe] truncate font-mono">
                      {user?.accountType || (isSeller ? 'SELLER' : 'BUYER')}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={logout}
                    title="Sign Out"
                    className="p-1.5 rounded-md text-[#bfdbfe] hover:text-[#faf7ee] hover:bg-[#1e3a8a] transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-1.5 py-0.5">
                <div
                  title={`${user?.name} (${user?.accountType || (isSeller ? 'SELLER' : 'BUYER')})`}
                  className="w-7 h-7 rounded-md flex items-center justify-center bg-[#faf7ee] text-[#172554] shrink-0 font-bold text-xs shadow-xs"
                >
                  {user?.name ? user.name[0].toUpperCase() : 'U'}
                </div>
                <button
                  onClick={logout}
                  title="Sign Out"
                  className="p-1.5 rounded-md text-[#bfdbfe] hover:text-[#faf7ee] hover:bg-[#1e3a8a] transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            )
          ) : (
            <Link
              href="/login"
              title="Sign In"
              className={`rounded-lg bg-[#faf7ee] text-[#172554] font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors ${
                isExpanded ? 'w-full py-1.5 px-3' : 'w-9 h-8 mx-auto'
              }`}
            >
              <LogIn className="w-3.5 h-3.5 text-[#172554]" />
              {isExpanded && <span>Sign In</span>}
            </Link>
          )}
        </div>
      </aside>
    </>
  );
}
