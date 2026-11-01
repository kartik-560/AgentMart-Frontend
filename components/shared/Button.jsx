'use client';

import React from 'react';
import { Loader2 } from 'lucide-react';

const VARIANTS = {
  primary:
    'bg-[#1d4ed8] hover:bg-[#1e3a8a] text-[#faf7ee] border border-[#1d4ed8] shadow-xs focus:ring-1 focus:ring-[#1d4ed8]',
  secondary:
    'bg-[#f4efe3] hover:bg-[#ede5d4] text-[#172554] border border-[#1e3a8a]/25 shadow-xs focus:ring-1 focus:ring-[#1e3a8a]',
  success:
    'bg-[#1e3a8a] hover:bg-[#172554] text-[#faf7ee] border border-[#1e3a8a] shadow-xs focus:ring-1 focus:ring-[#1e3a8a]',
  danger:
    'bg-[#172554] hover:bg-[#0f172a] text-[#faf7ee] border border-[#172554] shadow-xs focus:ring-1 focus:ring-[#172554]',
  outline:
    'bg-[#fffdf9] hover:bg-[#f4efe3] text-[#1d4ed8] border border-[#1d4ed8] hover:text-[#1e3a8a]',
  ghost:
    'bg-transparent hover:bg-[#f4efe3] text-[#1e3a8a] hover:text-[#172554] border-transparent',
};

export default function Button({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  className = '',
  type = 'button',
  icon: Icon,
  title,
}) {
  const sizeClasses = {
    xs: 'px-2 py-1 text-[11px] gap-1 rounded-md h-6',
    sm: 'px-2.5 py-1 text-xs gap-1.5 rounded-lg h-7 sm:h-8',
    md: 'px-3.5 py-1.5 text-xs sm:text-sm gap-2 rounded-lg h-8 sm:h-9',
    lg: 'px-4 py-2 text-sm gap-2 rounded-lg h-10',
  };

  const sizeClass = sizeClasses[size] || sizeClasses.md;
  const variantClass = VARIANTS[variant] || VARIANTS.primary;

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      title={title}
      className={`inline-flex items-center justify-center font-semibold transition-colors select-none active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 shrink-0 ${sizeClass} ${variantClass} ${className}`}
    >
      {loading ? (
        <Loader2 className="w-3.5 h-3.5 animate-spin shrink-0" />
      ) : Icon ? (
        <Icon className="w-3.5 h-3.5 shrink-0" />
      ) : null}
      {children}
    </button>
  );
}
