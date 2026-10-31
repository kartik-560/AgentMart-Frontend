'use client';

import React from 'react';

export default function Card({ children, className = '', title, subtitle, headerAction }) {
  return (
    <div className={`bg-slate-900/70 border border-slate-800 rounded-xl p-5 shadow-sm backdrop-blur-sm ${className}`}>
      {(title || headerAction) && (
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-800/80">
          <div>
            {title && <h3 className="font-semibold text-slate-100 text-base">{title}</h3>}
            {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
          </div>
          {headerAction && <div>{headerAction}</div>}
        </div>
      )}
      {children}
    </div>
  );
}

