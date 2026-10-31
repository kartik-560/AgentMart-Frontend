'use client';

import React from 'react';
import { useUI } from '../../context/UIContext';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export default function ToastBanner() {
  const { toast, closeToast } = useUI();

  if (!toast) return null;

  const ICONS = {
    success: <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />,
    error: <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />,
    info: <Info className="w-4 h-4 text-indigo-400 shrink-0" />,
  };

  const STYLES = {
    success: 'bg-emerald-950/90 border-emerald-800 text-emerald-200',
    error: 'bg-rose-950/90 border-rose-800 text-rose-200',
    info: 'bg-indigo-950/90 border-indigo-800 text-indigo-200',
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -20, scale: 0.95 }}
        transition={{ duration: 0.2 }}
        className="fixed top-5 right-5 z-50 max-w-md"
      >
        <div
          className={`flex items-center gap-3 px-4 py-3 rounded-xl border shadow-xl backdrop-blur-md text-xs font-medium ${
            STYLES[toast.type] || STYLES.info
          }`}
        >
          {ICONS[toast.type] || ICONS.info}
          <span className="flex-1">{toast.message}</span>
          <button
            onClick={closeToast}
            className="p-1 rounded-md text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

