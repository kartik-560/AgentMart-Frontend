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
      className={`bg-[#fffdf9] border border-[#1e3a8a]/20 rounded-xl p-4 sm:p-5 shadow-xs transition-all duration-150 text-[#172554] ${className}`}
    >
      {(title || headerAction || badge || Icon) && (
        <div className="flex items-center justify-between gap-3 pb-3 mb-4 border-b border-[#1e3a8a]/15">
          <div className="flex items-center gap-2.5 min-w-0">
            {Icon && (
              <div className="p-1.5 rounded-lg bg-[#faf7ee] border border-[#1e3a8a]/25 text-[#1d4ed8] shrink-0">
                <Icon className="w-4 h-4" />
              </div>
            )}
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                {title && (
                  <h3 className="font-bold text-[#172554] text-xs sm:text-sm tracking-tight truncate">
                    {title}
                  </h3>
                )}
                {badge && <div>{badge}</div>}
              </div>
              {subtitle && (
                <p className="text-[11px] text-[#1e3a8a]/80 mt-0.5 line-clamp-1">
                  {subtitle}
                </p>
              )}
            </div>
          </div>
          {headerAction && <div className="shrink-0">{headerAction}</div>}
        </div>
      )}
      {children}
    </div>
  );
}
