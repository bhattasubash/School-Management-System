'use client';

import React from 'react';

export type AdminBadgeVariant =
  | 'success'
  | 'warning'
  | 'danger'
  | 'info'
  | 'neutral'
  | 'purple'
  | 'orange';

interface AdminBadgeProps {
  children: React.ReactNode;
  variant?: AdminBadgeVariant;
  size?: 'sm' | 'md';
  dot?: boolean;
  className?: string;
}

export default function AdminBadge({
  children,
  variant = 'neutral',
  size = 'md',
  dot = false,
  className = '',
}: AdminBadgeProps) {
  const variantStyles: Record<AdminBadgeVariant, { bg: string; dot: string }> = {
    success: {
      bg: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
      dot: 'bg-emerald-500',
    },
    warning: {
      bg: 'bg-amber-50 text-amber-700 border-amber-200/80',
      dot: 'bg-amber-500',
    },
    danger: {
      bg: 'bg-rose-50 text-rose-700 border-rose-200/80',
      dot: 'bg-rose-500',
    },
    info: {
      bg: 'bg-sky-50 text-[#0284C7] border-sky-200/80',
      dot: 'bg-[#0284C7]',
    },
    neutral: {
      bg: 'bg-slate-100 text-slate-700 border-slate-200/80',
      dot: 'bg-slate-400',
    },
    purple: {
      bg: 'bg-purple-50 text-purple-700 border-purple-200/80',
      dot: 'bg-purple-500',
    },
    orange: {
      bg: 'bg-orange-50 text-orange-700 border-orange-200/80',
      dot: 'bg-orange-500',
    },
  };

  const sizeStyles = {
    sm: 'text-[11px] px-2 py-0.5',
    md: 'text-xs px-2.5 py-1',
  };

  const currentVariant = variantStyles[variant];

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-semibold rounded-full border ${currentVariant.bg} ${sizeStyles[size]} ${className}`}
    >
      {dot && <span className={`w-1.5 h-1.5 rounded-full ${currentVariant.dot}`} />}
      {children}
    </span>
  );
}
