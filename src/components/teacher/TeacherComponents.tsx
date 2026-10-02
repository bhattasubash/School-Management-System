'use client';

import React from 'react';
import { LucideIcon } from 'lucide-react';

/* ─────────────────────────────────────────────────────────────────────────────
 * STAT CARD (Matches Teacher Dashboard Quick Action & Metric Language)
 * ───────────────────────────────────────────────────────────────────────────── */
interface StatCardProps {
  label: string;
  value: string | number;
  subtext?: string;
  icon: LucideIcon;
  variant?: 'yellow' | 'purple' | 'cyan' | 'peach' | 'green' | 'blue';
}

const variantStyles = {
  yellow: { bg: 'bg-[#FEF3C7]', text: 'text-[#92400E]', ring: 'ring-amber-200' },
  purple: { bg: 'bg-[#F3E8FF]', text: 'text-[#6B21A8]', ring: 'ring-purple-200' },
  cyan: { bg: 'bg-[#CCFBF1]', text: 'text-[#0F766E]', ring: 'ring-teal-200' },
  peach: { bg: 'bg-[#FFEDD5]', text: 'text-[#9A3412]', ring: 'ring-orange-200' },
  green: { bg: 'bg-[#DCFCE7]', text: 'text-[#15803D]', ring: 'ring-emerald-200' },
  blue: { bg: 'bg-[#E0F2FE]', text: 'text-[#0369A1]', ring: 'ring-sky-200' },
};

export function StatCard({
  label,
  value,
  subtext,
  icon: Icon,
  variant = 'blue',
}: StatCardProps) {
  const style = variantStyles[variant];

  return (
    <div className="bg-white rounded-[22px] p-5 shadow-[0_2px_14px_rgba(30,100,200,0.03)] border border-white/80 flex items-center justify-between">
      <div>
        <p className="text-[11.5px] font-bold text-[#64748B] tracking-wider uppercase">
          {label}
        </p>
        <p className="text-2xl font-bold text-[#102A56] mt-1 tracking-tight">
          {value}
        </p>
        {subtext && (
          <p className="text-[11.5px] font-medium text-[#64748B] mt-0.5">{subtext}</p>
        )}
      </div>
      <div
        className={`w-12 h-12 rounded-full ${style.bg} ${style.text} flex items-center justify-center shrink-0 shadow-xs`}
      >
        <Icon className="w-5 h-5 stroke-[2]" />
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
 * STATUS BADGE (Consistent Compact Badge System)
 * ───────────────────────────────────────────────────────────────────────────── */
interface StatusBadgeProps {
  status:
    | 'PRESENT'
    | 'ABSENT'
    | 'LATE'
    | 'HALF_DAY'
    | 'EXCUSED'
    | 'PENDING'
    | 'APPROVED'
    | 'REJECTED'
    | 'ACTIVE'
    | 'COMPLETED';
  label?: string;
}

export function StatusBadge({ status, label }: StatusBadgeProps) {
  const displayLabel = label || status.replace('_', ' ');

  const config = {
    PRESENT: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    APPROVED: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    ACTIVE: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    COMPLETED: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    ABSENT: 'bg-rose-50 text-rose-700 border-rose-200',
    REJECTED: 'bg-rose-50 text-rose-700 border-rose-200',
    LATE: 'bg-amber-50 text-amber-700 border-amber-200',
    HALF_DAY: 'bg-amber-50 text-amber-700 border-amber-200',
    PENDING: 'bg-orange-50 text-orange-700 border-orange-200',
    EXCUSED: 'bg-sky-50 text-sky-700 border-sky-200',
  }[status] || 'bg-slate-50 text-slate-700 border-slate-200';

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11.5px] font-semibold border ${config} tracking-wide uppercase`}
    >
      {displayLabel}
    </span>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
 * EMPTY STATE (Human, Friendly Educational Visuals)
 * ───────────────────────────────────────────────────────────────────────────── */
interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: React.ReactNode;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: EmptyStateProps) {
  return (
    <div className="bg-white rounded-[24px] p-12 text-center shadow-[0_2px_14px_rgba(30,100,200,0.03)] border border-white/80 max-w-lg mx-auto">
      <div className="w-14 h-14 rounded-full bg-sky-50 text-[#0284C7] flex items-center justify-center mx-auto mb-4 border border-sky-100">
        <Icon className="w-6 h-6 stroke-[1.8]" />
      </div>
      <h3 className="text-base font-bold text-[#102A56]">{title}</h3>
      <p className="text-xs text-[#64748B] mt-1.5 max-w-sm mx-auto leading-relaxed">
        {description}
      </p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
 * TEACHER CARD CONTAINER
 * ───────────────────────────────────────────────────────────────────────────── */
export function TeacherCard({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`bg-white rounded-[24px] p-6 shadow-[0_2px_16px_rgba(30,100,200,0.03)] border border-white/80 ${className}`}
    >
      {children}
    </div>
  );
}
