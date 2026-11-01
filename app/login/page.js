'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import {
  Boxes,
  ShieldCheck,
  Building2,
  Store,
  Lock,
  Mail,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  Layers,
  Sparkles,
} from 'lucide-react';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, isAuthenticated, isSeller } = useAuth();

  const [activeTab, setActiveTab] = useState('BUYER'); // 'BUYER' | 'SELLER'
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Form fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Read URL query params if redirected with a portal preference
  useEffect(() => {
    const portal = searchParams.get('portal');
    if (portal && (portal.toUpperCase() === 'SELLER' || portal.toUpperCase() === 'BUYER')) {
      setActiveTab(portal.toUpperCase());
    }
  }, [searchParams]);

  // If already authenticated, redirect to appropriate destination
  useEffect(() => {
    if (isAuthenticated) {
      if (isSeller) {
        router.push('/seller/dashboard');
      } else {
        router.push('/');
      }
    }
  }, [isAuthenticated, isSeller, router]);

  const handleTabSwitch = (tab) => {
    setActiveTab(tab);
    setErrorMessage('');
    setSuccessMessage('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!email.trim()) {
      return setErrorMessage('Please enter your registered work email address');
    }
    if (!password) {
      return setErrorMessage('Please enter your security password');
    }

    setLoading(true);

    try {
      const user = await login({
        email: email.trim().toLowerCase(),
        password,
        accountType: activeTab,
      });

      setSuccessMessage(`Welcome back, ${user.name}! Redirecting...`);
      setTimeout(() => {
        if (user.accountType === 'SELLER' || user.role === 'SUPPLIER_REP') {
          router.push('/seller/dashboard');
        } else {
          router.push('/');
        }
      }, 800);
    } catch (err) {
      setErrorMessage(err?.message || 'Authentication failed. Please verify your credentials or register a new organization.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-[#faf7ee]">
      {/* ========================================================= */}
      {/* LEFT SIDE: Royal Blue Architectural Canvas                */}
      {/* ========================================================= */}
      <div className="hidden lg:flex lg:w-1/2 xl:w-5/12 flex-col justify-between p-8 xl:p-12 border-r border-[#1e3a8a] bg-[#172554] text-[#faf7ee] relative">
        {/* Top: Brand Header */}
        <div>
          <div className="flex items-center gap-2.5 mb-6">
            <div className="w-8 h-8 rounded-lg bg-[#faf7ee] flex items-center justify-center text-[#172554] font-bold text-sm shadow-xs">
              <Boxes className="w-4 h-4 text-[#172554]" />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-base font-bold text-[#faf7ee] tracking-tight">AgentMart</span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#1e3a8a] text-[#faf7ee] border border-[#2563eb]/40 font-semibold">
                ENTERPRISE B2B
              </span>
            </div>
          </div>

          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#1e3a8a] border border-[#2563eb]/40 text-[#faf7ee] text-xs font-mono font-medium mb-4">
            <Sparkles className="w-3.5 h-3.5 text-[#faf7ee]" />
            <span>Autonomous Commercial Negotiation Platform</span>
          </div>

          <h1 className="text-2xl xl:text-3xl font-extrabold text-[#faf7ee] tracking-tight leading-tight">
            Autonomous Multi-Agent B2B Procurement Protocol
          </h1>

          <p className="text-xs xl:text-sm text-[#dbeafe] mt-2.5 leading-relaxed max-w-lg">
            Enterprise buyers and verified suppliers negotiate commercial terms in real time through autonomous AI agents governed by deterministic zero-trust security and human authorization boundaries.
          </p>
        </div>

        {/* Middle: Architecture Summary */}
        <div className="my-6 space-y-3">
          <div className="p-4 rounded-xl bg-[#1e3a8a] border border-[#2563eb]/30 shadow-md space-y-3">
            <div className="flex items-center justify-between text-[11px] pb-2.5 border-b border-[#2563eb]/30">
              <span className="font-semibold text-[#faf7ee] font-mono flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-[#faf7ee]" />
                <span>Multi-Agent Procurement Swarm</span>
              </span>
              <span className="text-[#faf7ee] font-mono flex items-center gap-1 text-[10px] font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-[#faf7ee]" />
                Active Wire Protocol
              </span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="p-2.5 rounded-lg bg-[#172554] border border-[#2563eb]/30 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Building2 className="w-3.5 h-3.5 text-[#93c5fd]" />
                  <span className="font-medium text-[#faf7ee]">Enterprise Buyer Agents</span>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#1e3a8a] text-[#faf7ee]">
                  Autonomous RFQ
                </span>
              </div>

              <div className="p-2.5 rounded-lg bg-[#172554] border border-[#2563eb]/30 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Store className="w-3.5 h-3.5 text-[#93c5fd]" />
                  <span className="font-medium text-[#faf7ee]">Verified Supplier Agents</span>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#1e3a8a] text-[#faf7ee]">
                  Real-Time Bidding
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom: Security & Registration Footer */}
        <div className="pt-4 border-t border-[#1e3a8a] text-xs text-[#bfdbfe] flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-[#faf7ee]" />
            <span>PostgreSQL Isolated RBAC</span>
          </span>
          <Link
            href={`/register?portal=${activeTab}`}
            className="px-3 py-1.5 rounded-md bg-[#faf7ee] text-[#172554] font-bold hover:bg-[#fffdf9] transition-all flex items-center gap-1.5"
          >
            <span>Register Business</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* ========================================================= */}
      {/* RIGHT SIDE: Light Cream Interactive Sign-In Canvas        */}
      {/* ========================================================= */}
      <div className="w-full lg:w-1/2 xl:w-7/12 flex items-center justify-center p-6 sm:p-10 lg:p-12 overflow-y-auto bg-[#faf7ee] text-[#172554]">
        <div className="max-w-md w-full mx-auto space-y-6">
          {/* Mobile Header */}
          <div className="lg:hidden flex items-center justify-between pb-3 border-b border-[#1e3a8a]/20">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-[#1d4ed8] flex items-center justify-center text-[#faf7ee] font-bold text-xs">
                <Boxes className="w-4 h-4 text-[#faf7ee]" />
              </div>
              <span className="text-sm font-bold text-[#172554]">AgentMart</span>
            </div>
            <Link
              href={`/register?portal=${activeTab}`}
              className="text-xs font-semibold text-[#1d4ed8] hover:underline"
            >
              Register
            </Link>
          </div>

          {/* Segmented Account Switcher */}
          <div className="grid grid-cols-2 gap-1.5 p-1 bg-[#f4efe3] border border-[#1e3a8a]/25 rounded-lg">
            <button
              type="button"
              onClick={() => handleTabSwitch('BUYER')}
              className={`flex items-center justify-center gap-2 py-2 px-3 rounded-md text-xs font-bold transition-colors ${
                activeTab === 'BUYER'
                  ? 'bg-[#1d4ed8] text-[#faf7ee] shadow-xs'
                  : 'text-[#1e3a8a] hover:bg-[#eadecc]'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>Enterprise Buyer</span>
            </button>
            <button
              type="button"
              onClick={() => handleTabSwitch('SELLER')}
              className={`flex items-center justify-center gap-2 py-2 px-3 rounded-md text-xs font-bold transition-colors ${
                activeTab === 'SELLER'
                  ? 'bg-[#1d4ed8] text-[#faf7ee] shadow-xs'
                  : 'text-[#1e3a8a] hover:bg-[#eadecc]'
              }`}
            >
              <Store className="w-3.5 h-3.5" />
              <span>Verified Supplier</span>
            </button>
          </div>

          {/* Form Header */}
          <div className="space-y-1">
            <h2 className="text-xl sm:text-2xl font-bold text-[#172554] tracking-tight">
              Sign In to {activeTab === 'BUYER' ? 'Buyer' : 'Supplier'} Portal
            </h2>
            <p className="text-xs text-[#1e3a8a]/80">
              Enter your verified enterprise credentials to access your autonomous agent.
            </p>
          </div>

          {/* Alerts */}
          {errorMessage && (
            <div className="p-3 rounded-lg bg-[#fffdf9] border border-[#172554] text-[#172554] text-xs flex items-center gap-2 font-medium">
              <AlertCircle className="w-4 h-4 shrink-0 text-[#1d4ed8]" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-3 rounded-lg bg-[#f4efe3] border border-[#1d4ed8] text-[#1e3a8a] text-xs flex items-center gap-2 font-medium">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-[#1d4ed8]" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block text-[#172554] font-semibold mb-1">
                Work Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={activeTab === 'BUYER' ? 'procurement@apexretail.in' : 'sales@prismwholesale.in'}
                  className="w-full pl-9 pr-3 py-2.5 bg-[#fffdf9] border border-[#1e3a8a]/30 rounded-lg text-[#172554] placeholder:text-[#1e3a8a]/40 text-xs focus:outline-none focus:border-[#1d4ed8] font-mono"
                />
                <Mail className="w-4 h-4 text-[#1e3a8a]/60 absolute left-3 top-3" />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[#172554] font-semibold">
                  Password
                </label>
              </div>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-9 pr-3 py-2.5 bg-[#fffdf9] border border-[#1e3a8a]/30 rounded-lg text-[#172554] placeholder:text-[#1e3a8a]/40 text-xs focus:outline-none focus:border-[#1d4ed8] font-mono"
                />
                <Lock className="w-4 h-4 text-[#1e3a8a]/60 absolute left-3 top-3" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-lg font-bold text-xs text-[#faf7ee] bg-[#1d4ed8] hover:bg-[#1e3a8a] transition-all flex items-center justify-center gap-2 select-none disabled:opacity-50 shadow-xs"
            >
              {loading ? (
                <span className="inline-flex items-center gap-2">
                  <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Authenticating...</span>
                </span>
              ) : (
                <>
                  <span>Sign In to {activeTab === 'BUYER' ? 'Buyer' : 'Supplier'} Portal</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>

          {/* Registration Link */}
          <div className="p-4 rounded-xl bg-[#fffdf9] border border-[#1e3a8a]/20 text-center space-y-2">
            <p className="text-xs text-[#1e3a8a]">
              Don't have an enterprise account yet?
            </p>
            <Link
              href={`/register?portal=${activeTab}`}
              className="inline-flex items-center justify-center gap-1.5 w-full py-2 px-3 rounded-lg bg-[#f4efe3] hover:bg-[#eadecc] text-[#172554] font-bold text-xs border border-[#1e3a8a]/25 transition-colors"
            >
              <span>Register New Business & Launch AI Agent</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#1d4ed8]" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen w-full bg-[#faf7ee] flex items-center justify-center text-[#172554] text-xs font-mono">
          Loading authentication gateway...
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
