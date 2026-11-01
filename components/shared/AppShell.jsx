'use client';

import React, { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import ToastBanner from './ToastBanner';
import { Boxes } from 'lucide-react';

export default function AppShell({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated, isLoading, isSeller } = useAuth();

  const isAuthPage = pathname === '/login' || pathname === '/register';

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated && !isAuthPage) {
        router.replace('/login');
      } else if (isAuthenticated && isAuthPage) {
        if (isSeller) {
          router.replace('/seller/dashboard');
        } else {
          router.replace('/');
        }
      }
    }
  }, [isLoading, isAuthenticated, isAuthPage, isSeller, router]);

  // If on login or register page, render children full-screen without platform sidebar/navbar
  if (isAuthPage) {
    return (
      <div className="w-full min-h-screen bg-[#faf7ee] text-[#172554]">
        {children}
        <ToastBanner />
      </div>
    );
  }

  // If verifying session security, show minimal splash screen
  if (isLoading) {
    return (
      <div className="min-h-screen w-full bg-[#faf7ee] flex items-center justify-center text-[#172554]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#1d4ed8] flex items-center justify-center text-[#faf7ee] shadow-sm animate-pulse">
            <Boxes className="w-5 h-5 text-[#faf7ee]" />
          </div>
          <span className="text-xs font-mono text-[#1e3a8a]">Verifying session security...</span>
        </div>
      </div>
    );
  }

  // If not authenticated and trying to view a protected page, show redirecting state
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen w-full bg-[#faf7ee] flex items-center justify-center text-[#172554]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#1d4ed8] flex items-center justify-center text-[#faf7ee] shadow-sm animate-pulse">
            <Boxes className="w-5 h-5 text-[#faf7ee]" />
          </div>
          <span className="text-xs font-mono text-[#1e3a8a]">Authentication required. Redirecting to login...</span>
        </div>
      </div>
    );
  }

  // Authenticated user: render standard enterprise platform layout in Royal Blue & Light Cream
  return (
    <div className="flex h-screen w-full overflow-hidden bg-[#faf7ee] text-[#172554]">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto">
        <Navbar />
        <main className="flex-1 p-4 sm:p-5 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
      <ToastBanner />
    </div>
  );
}
