'use client';

import React from 'react';
import { clsx } from 'clsx';

const defaultColorMap: Record<string, { bg: string; dot?: string }> = {
  // Positive
  ACTIVE: { bg: 'bg-emerald-50 text-emerald-700 border-emerald-200/80', dot: 'bg-emerald-500' },
  PRESENT: { bg: 'bg-emerald-50 text-emerald-700 border-emerald-200/80', dot: 'bg-emerald-500' },
  PAID: { bg: 'bg-emerald-50 text-emerald-700 border-emerald-200/80', dot: 'bg-emerald-500' },
  APPROVED: { bg: 'bg-emerald-50 text-emerald-700 border-emerald-200/80', dot: 'bg-emerald-500' },
  SUCCESS: { bg: 'bg-emerald-50 text-emerald-700 border-emerald-200/80', dot: 'bg-emerald-500' },
  ENROLLED: { bg: 'bg-emerald-50 text-emerald-700 border-emerald-200/80', dot: 'bg-emerald-500' },
  COMPLETED: { bg: 'bg-emerald-50 text-emerald-700 border-emerald-200/80', dot: 'bg-emerald-500' },
  VERIFIED: { bg: 'bg-emerald-50 text-emerald-700 border-emerald-200/80', dot: 'bg-emerald-500' },
  // Negative
  INACTIVE: { bg: 'bg-rose-50 text-rose-700 border-rose-200/80', dot: 'bg-rose-500' },
  ABSENT: { bg: 'bg-rose-50 text-rose-700 border-rose-200/80', dot: 'bg-rose-500' },
  REJECTED: { bg: 'bg-rose-50 text-rose-700 border-rose-200/80', dot: 'bg-rose-500' },
  FAILED: { bg: 'bg-rose-50 text-rose-700 border-rose-200/80', dot: 'bg-rose-500' },
  CANCELLED: { bg: 'bg-rose-50 text-rose-700 border-rose-200/80', dot: 'bg-rose-500' },
  SUSPENDED: { bg: 'bg-rose-50 text-rose-700 border-rose-200/80', dot: 'bg-rose-500' },
  OVERDUE: { bg: 'bg-rose-50 text-rose-700 border-rose-200/80', dot: 'bg-rose-500' },
  // Warning / In-progress
  PENDING: { bg: 'bg-amber-50 text-amber-700 border-amber-200/80', dot: 'bg-amber-500' },
  DRAFT: { bg: 'bg-amber-50 text-amber-700 border-amber-200/80', dot: 'bg-amber-500' },
  PARTIAL: { bg: 'bg-amber-50 text-amber-700 border-amber-200/80', dot: 'bg-amber-500' },
  LATE: { bg: 'bg-amber-50 text-amber-700 border-amber-200/80', dot: 'bg-amber-500' },
  HALF_DAY: { bg: 'bg-amber-50 text-amber-700 border-amber-200/80', dot: 'bg-amber-500' },
  IN_PROGRESS: { bg: 'bg-amber-50 text-amber-700 border-amber-200/80', dot: 'bg-amber-500' },
  SUBMITTED: { bg: 'bg-sky-50 text-[#0284C7] border-sky-200/80', dot: 'bg-[#0284C7]' },
  // Info
  ASSIGNED: { bg: 'bg-sky-50 text-[#0284C7] border-sky-200/80', dot: 'bg-[#0284C7]' },
  DOCUMENT_VERIFIED: { bg: 'bg-sky-50 text-[#0284C7] border-sky-200/80', dot: 'bg-[#0284C7]' },
  INTERVIEW_SCHEDULED: { bg: 'bg-purple-50 text-purple-700 border-purple-200/80', dot: 'bg-purple-500' },
  EXCUSED: { bg: 'bg-slate-100 text-slate-700 border-slate-200/80', dot: 'bg-slate-400' },
};

export interface StatusBadgeProps {
  status: string;
  colorMap?: Record<string, string | { bg: string; dot?: string }>;
  className?: string;
  size?: 'sm' | 'md';
  showDot?: boolean;
  children?: React.ReactNode;
}

export default function StatusBadge({
  status,
  colorMap,
  className,
  size = 'sm',
  showDot = true,
  children,
}: StatusBadgeProps) {
  let bgClass = 'bg-slate-100 text-slate-700 border-slate-200/80';
  let dotClass = 'bg-slate-400';

  if (colorMap && colorMap[status]) {
    const custom = colorMap[status];
    if (typeof custom === 'string') {
      bgClass = custom;
    } else {
      bgClass = custom.bg;
      if (custom.dot) dotClass = custom.dot;
    }
  } else if (defaultColorMap[status]) {
    bgClass = defaultColorMap[status].bg;
    if (defaultColorMap[status].dot) dotClass = defaultColorMap[status].dot!;
  }

  const displayText = children || status.replace(/_/g, ' ');

  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1.5 font-semibold rounded-full border capitalize',
        size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs',
        bgClass,
        className
      )}
    >
      {showDot && <span className={clsx('w-1.5 h-1.5 rounded-full shrink-0', dotClass)} />}
      <span>{displayText}</span>
    </span>
  );
}

export { StatusBadge };
