'use client';

import React, { useEffect, useRef } from 'react';
import { AlertTriangle, Trash2, Info, X, Loader2 } from 'lucide-react';
import { clsx } from 'clsx';

export interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'warning' | 'info';
  isLoading?: boolean;
}

const variantConfig = {
  danger: {
    icon: Trash2,
    iconBg: 'bg-rose-100',
    iconColor: 'text-rose-600',
    confirmBtn: 'bg-rose-600 hover:bg-rose-700 text-white',
  },
  warning: {
    icon: AlertTriangle,
    iconBg: 'bg-amber-100',
    iconColor: 'text-amber-600',
    confirmBtn: 'bg-amber-600 hover:bg-amber-700 text-white',
  },
  info: {
    icon: Info,
    iconBg: 'bg-blue-100',
    iconColor: 'text-[#0B72E7]',
    confirmBtn: 'bg-[#0B72E7] hover:bg-[#0960C4] text-white',
  },
};

export default function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'danger',
  isLoading = false,
}: ConfirmDialogProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const config = variantConfig[variant];
  const IconComponent = config.icon;

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isLoading) onClose();
    };
    window.addEventListener('keydown', handleEscape);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, isLoading, onClose]);

  if (!isOpen) return null;

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={(e) => {
        if (e.target === overlayRef.current && !isLoading) onClose();
      }}
    >
      <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity" />
      <div className="relative bg-white rounded-[24px] shadow-[0_20px_60px_rgba(15,23,42,0.15)] border border-slate-100 max-w-md w-full p-6 animate-in fade-in zoom-in-95 duration-200 z-10">
        <button
          onClick={onClose}
          disabled={isLoading}
          className="absolute top-4 right-4 p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
        <div className="flex items-start gap-4">
          <div
            className={clsx(
              'shrink-0 w-11 h-11 rounded-2xl flex items-center justify-center shadow-xs',
              config.iconBg
            )}
          >
            <IconComponent className={clsx('w-5 h-5', config.iconColor)} />
          </div>
          <div className="flex-1 min-w-0 pr-4">
            <h3 className="text-base font-bold text-slate-900">{title}</h3>
            {description && (
              <p className="mt-1.5 text-xs text-slate-500 leading-relaxed">{description}</p>
            )}
          </div>
        </div>
        <div className="mt-6 flex justify-end gap-2.5">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className={clsx(
              'px-4 py-2 text-xs font-semibold rounded-xl shadow-xs transition-colors inline-flex items-center gap-2 cursor-pointer',
              config.confirmBtn,
              isLoading && 'opacity-70 cursor-not-allowed'
            )}
          >
            {isLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

export { ConfirmDialog };
