import React from 'react';
import { clsx } from 'clsx';

const defaultColorMap: Record<string, string> = {
  // Positive
  ACTIVE: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
  PRESENT: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
  PAID: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
  APPROVED: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
  SUCCESS: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
  ENROLLED: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
  COMPLETED: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
  VERIFIED: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
  // Negative
  INACTIVE: 'bg-red-50 text-red-700 ring-red-600/20',
  ABSENT: 'bg-red-50 text-red-700 ring-red-600/20',
  REJECTED: 'bg-red-50 text-red-700 ring-red-600/20',
  FAILED: 'bg-red-50 text-red-700 ring-red-600/20',
  CANCELLED: 'bg-red-50 text-red-700 ring-red-600/20',
  SUSPENDED: 'bg-red-50 text-red-700 ring-red-600/20',
  OVERDUE: 'bg-red-50 text-red-700 ring-red-600/20',
  // Warning / In-progress
  PENDING: 'bg-amber-50 text-amber-700 ring-amber-600/20',
  DRAFT: 'bg-amber-50 text-amber-700 ring-amber-600/20',
  PARTIAL: 'bg-amber-50 text-amber-700 ring-amber-600/20',
  LATE: 'bg-amber-50 text-amber-700 ring-amber-600/20',
  HALF_DAY: 'bg-amber-50 text-amber-700 ring-amber-600/20',
  IN_PROGRESS: 'bg-amber-50 text-amber-700 ring-amber-600/20',
  SUBMITTED: 'bg-blue-50 text-blue-700 ring-blue-600/20',
  // Info
  ASSIGNED: 'bg-blue-50 text-blue-700 ring-blue-600/20',
  DOCUMENT_VERIFIED: 'bg-blue-50 text-blue-700 ring-blue-600/20',
  INTERVIEW_SCHEDULED: 'bg-purple-50 text-purple-700 ring-purple-600/20',
  EXCUSED: 'bg-gray-50 text-gray-600 ring-gray-500/20',
};

export interface StatusBadgeProps {
  status: string;
  colorMap?: Record<string, string>;
  className?: string;
  size?: 'sm' | 'md';
}

export default function StatusBadge({ status, colorMap, className, size = 'sm' }: StatusBadgeProps) {
  const merged = { ...defaultColorMap, ...colorMap };
  const colors = merged[status] || 'bg-gray-50 text-gray-600 ring-gray-500/20';
  const displayText = status.replace(/_/g, ' ');

  return (
    <span
      className={clsx(
        'inline-flex items-center font-semibold ring-1 ring-inset rounded-full capitalize',
        size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-badge',
        colors,
        className
      )}
    >
      {displayText}
    </span>
  );
}

export { StatusBadge };
