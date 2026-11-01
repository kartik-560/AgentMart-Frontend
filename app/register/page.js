'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { authService } from '../../services/authService';
import {
  Boxes,
  ShieldCheck,
  Building2,
  Store,
  Lock,
  Mail,
  ArrowRight,
  ArrowLeft,
  Bot,
  AlertCircle,
  CheckCircle2,
  Phone,
  Sparkles,
  RefreshCw,
  Send,
  KeyRound,
  Layers,
} from 'lucide-react';

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { register, isAuthenticated, isSeller } = useAuth();

  const [activeTab, setActiveTab] = useState('BUYER'); // 'BUYER' | 'SELLER'
  const [step, setStep] = useState(1); // 1: Form details, 2: OTP verification
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Form Fields
  const [name, setName] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [businessType, setBusinessType] = useState('RETAIL_ENTERPRISE');
  const [contactPhone, setContactPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);

  // Read URL query params
  useEffect(() => {
    const portal = searchParams.get('portal');
    if (portal && (portal.toUpperCase() === 'SELLER' || portal.toUpperCase() === 'BUYER')) {
      setActiveTab(portal.toUpperCase());
      setBusinessType(portal.toUpperCase() === 'SELLER' ? 'DISTRIBUTOR' : 'RETAIL_ENTERPRISE');
    }
  }, [searchParams]);

  // If already authenticated, redirect
  useEffect(() => {
    if (isAuthenticated) {
      if (isSeller) {
        router.push('/seller/dashboard');
      } else {
        router.push('/');
      }
    }
  }, [isAuthenticated, isSeller, router]);

  // Resend cooldown timer
  useEffect(() => {
    let timer;
    if (resendCooldown > 0) {
      timer = setTimeout(() => setResendCooldown((prev) => prev - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  const handleTabSwitch = (tab) => {
    setActiveTab(tab);
    setBusinessType(tab === 'SELLER' ? 'DISTRIBUTOR' : 'RETAIL_ENTERPRISE');
    setErrorMessage('');
    setSuccessMessage('');
  };

  // Step 1: Validate form and dispatch OTP via SMTP
  const handleRequestOtp = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!name.trim()) return setErrorMessage('Please enter your full name');
    if (!businessName.trim()) return setErrorMessage('Please enter your business organization name');
    if (!email.trim() || !email.includes('@')) return setErrorMessage('Please enter a valid business email');
    if (password.length < 6) return setErrorMessage('Password must be at least 6 characters');
    if (password !== confirmPassword) return setErrorMessage('Passwords do not match');

    setLoading(true);
    try {
      const res = await authService.requestOtp({
        email: email.trim().toLowerCase(),
        name: name.trim(),
        purpose: 'Account Registration',
      });

      setSuccessMessage(res?.data?.message || 'Verification passcode dispatched to your email.');
      setStep(2);
      setResendCooldown(45);
    } catch (err) {
      setErrorMessage(err?.message || 'Failed to dispatch verification email. Please verify SMTP configuration or email format.');
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP
  const handleResendOtp = async () => {
    if (resendCooldown > 0) return;
    setErrorMessage('');
    setSuccessMessage('');
    setResending(true);

    try {
      const res = await authService.requestOtp({
        email: email.trim().toLowerCase(),
        name: name.trim(),
        purpose: 'Account Registration',
      });
      setSuccessMessage(res?.data?.message || 'A new verification passcode has been sent to your email.');
      setResendCooldown(45);
    } catch (err) {
      setErrorMessage(err?.message || 'Failed to resend verification passcode. Please try again later.');
    } finally {
      setResending(false);
    }
  };

  // Step 2: Verify OTP and complete registration
  const handleVerifyAndRegister = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!otp.trim() || otp.trim().length < 6) {
      return setErrorMessage('Please enter the 6-digit verification code sent to your email.');
    }

    setLoading(true);
    try {
      const user = await register({
        email: email.trim().toLowerCase(),
        password,
        name: name.trim(),
        accountType: activeTab,
        businessName: businessName.trim(),
        businessType,
        contactPhone: contactPhone.trim() || undefined,
        otp: otp.trim(),
      });

      setSuccessMessage(`Registration successful! Welcome to AgentMart, ${user.name}. Redirecting to dashboard...`);
      setTimeout(() => {
        if (user.accountType === 'SELLER' || user.role === 'SUPPLIER_REP') {
          router.push('/seller/dashboard');
        } else {
          router.push('/');
        }
      }, 1200);
    } catch (err) {
      setErrorMessage(err?.message || 'Registration verification failed. Please check your passcode and try again.');
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
                ENTERPRISE REGISTRATION
              </span>
            </div>
          </div>

          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#1e3a8a] border border-[#2563eb]/40 text-[#faf7ee] text-xs font-mono font-medium mb-4">
            <Sparkles className="w-3.5 h-3.5 text-[#faf7ee]" />
            <span>Self-Service Organization Onboarding</span>
          </div>

          <h1 className="text-2xl xl:text-3xl font-extrabold text-[#faf7ee] tracking-tight leading-tight">
            Register Your Business on the Autonomous B2B Network
          </h1>

          <p className="text-xs xl:text-sm text-[#dbeafe] mt-2.5 leading-relaxed max-w-lg">
            Empower your company with a dedicated AI negotiation agent. Autonomous commercial discourse, guaranteed SLA fulfillment, and zero-trust security boundaries.
          </p>
        </div>

        {/* Middle: Value Pillars */}
        <div className="my-6 space-y-3">
          <div className="p-4 rounded-xl bg-[#1e3a8a] border border-[#2563eb]/30 shadow-md space-y-3">
            <div className="text-xs font-bold text-[#faf7ee] flex items-center gap-2 pb-2 border-b border-[#2563eb]/30 font-mono">
              <Layers className="w-4 h-4 text-[#faf7ee]" />
              <span>What You Receive Upon Registration</span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="p-2.5 rounded-lg bg-[#172554] border border-[#2563eb]/30 flex items-start gap-2.5">
                <Bot className="w-4 h-4 text-[#93c5fd] shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold text-[#faf7ee]">Dedicated Autonomous Agent</div>
                  <div className="text-[11px] text-[#bfdbfe]">
                    An autonomous agent pre-configured to represent your business goals, discount thresholds, and SLA parameters.
                  </div>
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-[#172554] border border-[#2563eb]/30 flex items-start gap-2.5">
                <ShieldCheck className="w-4 h-4 text-[#93c5fd] shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold text-[#faf7ee]">Deterministic Zero-Trust Security</div>
                  <div className="text-[11px] text-[#bfdbfe]">
                    Automatic quarantine of hidden fees, price manipulation, and prompt injections.
                  </div>
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-[#172554] border border-[#2563eb]/30 flex items-start gap-2.5">
                <Mail className="w-4 h-4 text-[#93c5fd] shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold text-[#faf7ee]">SMTP Verified Passcode (OTP)</div>
                  <div className="text-[11px] text-[#bfdbfe]">
                    Guarantees all participating organizations are authentic and validated before joining negotiations.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom: Sign In Redirect */}
        <div className="pt-4 border-t border-[#1e3a8a] text-xs text-[#bfdbfe] flex items-center justify-between">
          <span>Already have an account?</span>
          <Link
            href="/login"
            className="px-3 py-1.5 rounded-md bg-[#faf7ee] text-[#172554] font-bold hover:bg-[#fffdf9] transition-all flex items-center gap-1.5"
          >
            <span>Sign In</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* ========================================================= */}
      {/* RIGHT SIDE: Light Cream Interactive Form Canvas           */}
      {/* ========================================================= */}
      <div className="w-full lg:w-1/2 xl:w-7/12 flex items-center justify-center p-6 sm:p-10 lg:p-12 overflow-y-auto bg-[#faf7ee] text-[#172554]">
        <div className="max-w-md w-full mx-auto space-y-6">
          {/* Mobile Logo Header */}
          <div className="lg:hidden flex items-center justify-between pb-3 border-b border-[#1e3a8a]/20">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-[#1d4ed8] flex items-center justify-center text-[#faf7ee] font-bold text-xs">
                <Boxes className="w-4 h-4 text-[#faf7ee]" />
              </div>
              <span className="text-sm font-bold text-[#172554]">AgentMart</span>
            </div>
            <Link
              href="/login"
              className="text-xs font-semibold text-[#1d4ed8] hover:underline flex items-center gap-1"
            >
              <span>Sign In</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {/* Segmented Account Type Switcher */}
          <div className="grid grid-cols-2 gap-1.5 p-1 bg-[#f4efe3] border border-[#1e3a8a]/25 rounded-lg">
            <button
              type="button"
              disabled={step === 2}
              onClick={() => handleTabSwitch('BUYER')}
              className={`flex items-center justify-center gap-2 py-2 px-3 rounded-md text-xs font-bold transition-colors ${
                activeTab === 'BUYER'
                  ? 'bg-[#1d4ed8] text-[#faf7ee] shadow-xs'
                  : 'text-[#1e3a8a] hover:bg-[#eadecc]'
              } ${step === 2 ? 'opacity-60 cursor-not-allowed' : ''}`}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>Register as Buyer</span>
            </button>
            <button
              type="button"
              disabled={step === 2}
              onClick={() => handleTabSwitch('SELLER')}
              className={`flex items-center justify-center gap-2 py-2 px-3 rounded-md text-xs font-bold transition-colors ${
                activeTab === 'SELLER'
                  ? 'bg-[#1d4ed8] text-[#faf7ee] shadow-xs'
                  : 'text-[#1e3a8a] hover:bg-[#eadecc]'
              } ${step === 2 ? 'opacity-60 cursor-not-allowed' : ''}`}
            >
              <Store className="w-3.5 h-3.5" />
              <span>Register as Supplier</span>
            </button>
          </div>

          {/* Step Progress Indicator */}
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <span
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                  step === 1 ? 'bg-[#1d4ed8] text-[#faf7ee]' : 'bg-[#172554] text-[#faf7ee]'
                }`}
              >
                1
              </span>
              <span className="text-xs font-semibold text-[#172554]">Organization Details</span>
            </div>
            <div className="h-0.5 flex-1 mx-3 bg-[#1e3a8a]/20" />
            <div className="flex items-center gap-2">
              <span
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                  step === 2 ? 'bg-[#1d4ed8] text-[#faf7ee]' : 'bg-[#f4efe3] text-[#1e3a8a] border border-[#1e3a8a]/30'
                }`}
              >
                2
              </span>
              <span className={`text-xs font-semibold ${step === 2 ? 'text-[#172554]' : 'text-[#1e3a8a]/60'}`}>
                Email Passcode (OTP)
              </span>
            </div>
          </div>

          {/* Form Header */}
          <div className="space-y-1">
            <h2 className="text-xl sm:text-2xl font-bold text-[#172554] tracking-tight">
              {step === 1
                ? `Create ${activeTab === 'BUYER' ? 'Buyer' : 'Supplier'} Organization`
                : 'Verify Email with Security Passcode'}
            </h2>
            <p className="text-xs text-[#1e3a8a]">
              {step === 1
                ? `Enter your business details to provision your enterprise profile and autonomous agent.`
                : `We dispatched a 6-digit verification code via SMTP to ${email}.`}
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
            <div className="p-3 rounded-lg bg-[#f4efe3] border border-[#1d4ed8] text-[#172554] text-xs flex items-center gap-2 font-medium">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-[#1d4ed8]" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* ========================================================= */}
          {/* STEP 1: Organization & User Information Form              */}
          {/* ========================================================= */}
          {step === 1 && (
            <form onSubmit={handleRequestOtp} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-[#172554] font-semibold mb-1">
                  Full Name / Authorized Representative
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Kartik Gupta"
                  className="w-full px-3 py-2 bg-[#fffdf9] border border-[#1e3a8a]/30 rounded-lg text-[#172554] placeholder:text-[#1e3a8a]/40 text-xs focus:outline-none focus:border-[#1d4ed8]"
                />
              </div>

              <div>
                <label className="block text-[#172554] font-semibold mb-1">
                  Company / Organization Name
                </label>
                <input
                  type="text"
                  required
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  placeholder={activeTab === 'BUYER' ? 'e.g. Apex Retail Enterprises' : 'e.g. Prism Wholesale Direct'}
                  className="w-full px-3 py-2 bg-[#fffdf9] border border-[#1e3a8a]/30 rounded-lg text-[#172554] placeholder:text-[#1e3a8a]/40 text-xs focus:outline-none focus:border-[#1d4ed8]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#172554] font-semibold mb-1">
                    Business Classification
                  </label>
                  <select
                    value={businessType}
                    onChange={(e) => setBusinessType(e.target.value)}
                    className="w-full px-3 py-2 bg-[#fffdf9] border border-[#1e3a8a]/30 rounded-lg text-[#172554] text-xs focus:outline-none focus:border-[#1d4ed8] font-medium"
                  >
                    {activeTab === 'BUYER' ? (
                      <>
                        <option value="RETAIL_ENTERPRISE">Retail Enterprise</option>
                        <option value="ECOMMERCE_OPERATOR">E-Commerce Operator</option>
                        <option value="DISTRIBUTOR">Distributor / Procurement</option>
                      </>
                    ) : (
                      <>
                        <option value="DISTRIBUTOR">Wholesale Distributor</option>
                        <option value="MANUFACTURER">Direct Manufacturer</option>
                        <option value="ECOMMERCE_OPERATOR">E-Commerce Supplier</option>
                      </>
                    )}
                  </select>
                </div>

                <div>
                  <label className="block text-[#172554] font-semibold mb-1">
                    Contact Phone (Optional)
                  </label>
                  <div className="relative">
                    <input
                      type="tel"
                      value={contactPhone}
                      onChange={(e) => setContactPhone(e.target.value)}
                      placeholder="+91-9876543210"
                      className="w-full pl-9 pr-3 py-2 bg-[#fffdf9] border border-[#1e3a8a]/30 rounded-lg text-[#172554] placeholder:text-[#1e3a8a]/40 text-xs focus:outline-none focus:border-[#1d4ed8]"
                    />
                    <Phone className="w-3.5 h-3.5 text-[#1e3a8a]/60 absolute left-3 top-2.5" />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[#172554] font-semibold mb-1">
                  Business Work Email Address
                </label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="kartik@apexretail.in"
                    className="w-full pl-9 pr-3 py-2 bg-[#fffdf9] border border-[#1e3a8a]/30 rounded-lg text-[#172554] placeholder:text-[#1e3a8a]/40 text-xs focus:outline-none focus:border-[#1d4ed8] font-mono"
                  />
                  <Mail className="w-4 h-4 text-[#1e3a8a]/60 absolute left-3 top-2.5" />
                </div>
                <p className="text-[10px] text-[#1e3a8a]/70 mt-1">
                  A 6-digit verification code will be sent to this email via SMTP.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#172554] font-semibold mb-1">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full pl-9 pr-3 py-2 bg-[#fffdf9] border border-[#1e3a8a]/30 rounded-lg text-[#172554] placeholder:text-[#1e3a8a]/40 text-xs focus:outline-none focus:border-[#1d4ed8] font-mono"
                    />
                    <Lock className="w-4 h-4 text-[#1e3a8a]/60 absolute left-3 top-2.5" />
                  </div>
                </div>

                <div>
                  <label className="block text-[#172554] font-semibold mb-1">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <input
                      type="password"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full pl-9 pr-3 py-2 bg-[#fffdf9] border border-[#1e3a8a]/30 rounded-lg text-[#172554] placeholder:text-[#1e3a8a]/40 text-xs focus:outline-none focus:border-[#1d4ed8] font-mono"
                    />
                    <Lock className="w-4 h-4 text-[#1e3a8a]/60 absolute left-3 top-2.5" />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-2.5 px-4 rounded-lg font-bold text-xs text-[#faf7ee] bg-[#1d4ed8] hover:bg-[#1e3a8a] transition-all flex items-center justify-center gap-2 select-none disabled:opacity-50 shadow-xs"
              >
                {loading ? (
                  <span className="inline-flex items-center gap-2">
                    <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Sending Verification Code via SMTP...</span>
                  </span>
                ) : (
                  <>
                    <span>Send Verification Passcode via Email</span>
                    <Send className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* ========================================================= */}
          {/* STEP 2: SMTP OTP Verification Screen                      */}
          {/* ========================================================= */}
          {step === 2 && (
            <form onSubmit={handleVerifyAndRegister} className="space-y-4 text-xs">
              <div className="p-4 rounded-xl bg-[#fffdf9] border border-[#1e3a8a]/25 text-[#172554] space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-[#1e3a8a]/15 text-xs">
                  <span className="font-semibold text-[#172554] flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-[#1d4ed8]" />
                    <span>Dispatched To:</span>
                  </span>
                  <span className="font-mono font-bold text-[#1d4ed8]">{email}</span>
                </div>

                <div>
                  <label className="block text-[#172554] font-semibold mb-2">
                    Enter 6-Digit Email Passcode (OTP)
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      maxLength={6}
                      required
                      autoFocus
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ''))}
                      placeholder="• • • • • •"
                      className="w-full text-center tracking-[12px] text-lg font-mono font-black py-3 bg-[#faf7ee] border-2 border-[#1e3a8a]/30 rounded-xl text-[#172554] placeholder:text-[#1e3a8a]/30 focus:outline-none focus:border-[#1d4ed8]"
                    />
                    <KeyRound className="w-4 h-4 text-[#1e3a8a]/50 absolute left-3 top-3.5" />
                  </div>
                  <p className="text-[11px] text-[#1e3a8a] mt-1.5">
                    Passcode valid for 10 minutes. Check your inbox or spam folder.
                  </p>
                </div>

                {/* Resend & Action Row */}
                <div className="flex items-center justify-between pt-2 border-t border-[#1e3a8a]/15 text-xs">
                  <button
                    type="button"
                    onClick={() => {
                      setStep(1);
                      setErrorMessage('');
                    }}
                    className="text-[#1e3a8a] hover:text-[#1d4ed8] font-semibold flex items-center gap-1"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Change Email</span>
                  </button>

                  <button
                    type="button"
                    disabled={resendCooldown > 0 || resending}
                    onClick={handleResendOtp}
                    className="text-[#1d4ed8] hover:underline font-semibold flex items-center gap-1 disabled:opacity-40 disabled:hover:no-underline"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${resending ? 'animate-spin' : ''}`} />
                    <span>
                      {resendCooldown > 0 ? `Resend Code (${resendCooldown}s)` : 'Resend Code'}
                    </span>
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || otp.length < 6}
                className="w-full py-3 px-4 rounded-lg font-bold text-xs text-[#faf7ee] bg-[#1d4ed8] hover:bg-[#1e3a8a] transition-all flex items-center justify-center gap-2 select-none disabled:opacity-50 shadow-xs"
              >
                {loading ? (
                  <span className="inline-flex items-center gap-2">
                    <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Verifying Passcode & Initializing Agent...</span>
                  </span>
                ) : (
                  <>
                    <span>Complete Registration & Launch Agent</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* Bottom Link to Sign In */}
          <div className="text-center pt-2 border-t border-[#1e3a8a]/15 text-xs">
            <span className="text-[#1e3a8a]">Already have an enterprise account? </span>
            <Link
              href={`/login?portal=${activeTab}`}
              className="text-[#1d4ed8] font-bold hover:underline"
            >
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen w-full bg-[#faf7ee] flex items-center justify-center text-[#172554] text-xs font-mono">
          Loading registration gateway...
        </div>
      }
    >
      <RegisterForm />
    </Suspense>
  );
}

