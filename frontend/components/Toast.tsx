"use client";

import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertCircle, X } from 'lucide-react';
import { useEffect } from 'react';

export type ToastType = 'success' | 'error';

interface ToastProps {
  message: string;
  type: ToastType;
  isVisible: boolean;
  onClose: () => void;
}

export const Toast = ({ message, type, isVisible, onClose }: ToastProps) => {
  // Auto-close after 3 seconds
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(onClose, 3000);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
          className="fixed bottom-8 right-8 z-[100]"
        >
          <div className={`flex items-center gap-3 p-4 rounded-2xl shadow-2xl border ${
            type === 'success' 
              ? 'bg-white border-emerald-100 text-emerald-800' 
              : 'bg-white border-red-100 text-red-800'
          }`}>
            <div className={type === 'success' ? 'text-emerald-500' : 'text-red-500'}>
              {type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
            </div>
            <span className="font-bold text-sm pr-4">{message}</span>
            <button 
              onClick={onClose} 
              className="hover:bg-slate-100 p-1 rounded-lg transition-colors text-slate-400"
            >
              <X size={16} />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};