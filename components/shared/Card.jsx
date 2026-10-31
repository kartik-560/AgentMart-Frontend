'use client';

import React from 'react';

export default function Card({
  children,
  className = '',
  title,
  subtitle,
  headerAction,
  badge,
  icon: Icon,
}) {
  return (
    <div
      className={`bg-slate-900/70 border border-slate-800/90 rounded-2xl p-5 shadow-sm backdrop-blur-sm transition-all duration-200 ${className}`}
    >
      {(title || headerAction || badge || Icon) && (
        <div className="flex items-start sm:items-center justify-between gap-3 pb-4 mb-4 border-b border-slate-800/80">
          <div className="flex items-center gap-2.5 min-w-0">
            {Icon && (
              <div className="p-2 rounded-xl bg-slate-800/80 text-indigo-400 border border-slate-700/60 shrink-0">
                <Icon className="w-4 h-4" />
              </div>
            )}
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                {title && <h3 className="font-semibold text-slate-100 text-sm sm:text-base truncate">{title}</h3>}
                {badge && <div>{badge}</div>}
              </div>
              {subtitle && <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">{subtitle}</p>}
            </div>
          </div>
          {headerAction && <div className="shrink-0">{headerAction}</div>}
        </div>
      )}
      {children}
    </div>
  );
}
