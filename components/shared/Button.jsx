'use client';

import React from 'react';

const VARIANTS = {
  primary: 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-500/20 shadow-md border-transparent',
  secondary: 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700',
  success: 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-500/20 shadow-md border-transparent',
  danger: 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-500/20 shadow-md border-transparent',
  outline: 'bg-transparent hover:bg-slate-800 text-slate-300 border-slate-700',
};

export default function Button({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  disabled = false,
  className = '',
  type = 'button',
}) {
  const sizeClass = size === 'sm' ? 'px-3 py-1.5 text-xs' : size === 'lg' ? 'px-5 py-2.5 text-base' : 'px-4 py-2 text-sm';
  const variantClass = VARIANTS[variant] || VARIANTS.primary;

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center justify-center font-medium rounded-lg border transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed ${sizeClass} ${variantClass} ${className}`}
    >
      {children}
    </button>
  );
}

