'use client';

import React from 'react';
import { Loader2 } from 'lucide-react';

const VARIANTS = {
  primary:
    'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-500/25 shadow-md border-transparent focus:ring-2 focus:ring-indigo-500/40',
  secondary:
    'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700 hover:border-slate-600 focus:ring-2 focus:ring-slate-500/30',
  success:
    'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-500/25 shadow-md border-transparent focus:ring-2 focus:ring-emerald-500/40',
  danger:
    'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-500/25 shadow-md border-transparent focus:ring-2 focus:ring-rose-500/40',
  outline:
    'bg-transparent hover:bg-slate-850 text-slate-300 border-slate-700/80 hover:border-slate-600 hover:text-white',
  ghost:
    'bg-transparent hover:bg-slate-800 text-slate-400 hover:text-slate-100 border-transparent',
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
    xs: 'px-2.5 py-1 text-[11px] gap-1 rounded-md',
    sm: 'px-3 py-1.5 text-xs gap-1.5 rounded-lg',
    md: 'px-4 py-2 text-xs sm:text-sm gap-2 rounded-xl',
    lg: 'px-5 py-2.5 text-sm sm:text-base gap-2.5 rounded-xl',
  };

  const sizeClass = sizeClasses[size] || sizeClasses.md;
  const variantClass = VARIANTS[variant] || VARIANTS.primary;

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      title={title}
      className={`inline-flex items-center justify-center font-medium border transition-all duration-150 select-none active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 ${sizeClass} ${variantClass} ${className}`}
    >
      {loading ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin shrink-0" />
          <span>{children}</span>
        </>
      ) : (
        <>
          {Icon && <Icon className="w-4 h-4 shrink-0" />}
          <span>{children}</span>
        </>
      )}
    </button>
  );
}
