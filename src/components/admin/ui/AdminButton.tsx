'use client';

import React from 'react';
import { Loader2 } from 'lucide-react';

interface AdminButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'destructive' | 'ghost' | 'soft-blue';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  icon?: React.ReactNode;
}

export default function AdminButton({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  icon,
  className = '',
  disabled,
  ...props
}: AdminButtonProps) {
  const baseStyles =
    'inline-flex items-center justify-center font-semibold rounded-xl transition-all cursor-pointer select-none disabled:opacity-50 disabled:cursor-not-allowed';

  const sizeStyles = {
    sm: 'text-xs px-3 py-1.5 gap-1.5',
    md: 'text-xs px-4 py-2 gap-2',
    lg: 'text-sm px-5 py-2.5 gap-2.5',
  };

  const variantStyles = {
    primary:
      'bg-[#0B72E7] hover:bg-[#0960C4] text-white shadow-xs hover:shadow-sm active:scale-[0.99]',
    secondary:
      'bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 shadow-xs hover:border-slate-300',
    destructive:
      'bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 active:scale-[0.99]',
    ghost:
      'bg-transparent hover:bg-slate-100/80 text-slate-600 hover:text-slate-900',
    'soft-blue':
      'bg-[#EBF4FE] hover:bg-[#DDF0FE] text-[#0B72E7] border border-[#BFDBFE]',
  };

  return (
    <button
      disabled={disabled || isLoading}
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="w-3.5 h-3.5 animate-spin" />
      ) : icon ? (
        <span className="shrink-0">{icon}</span>
      ) : null}
      {children}
    </button>
  );
}
