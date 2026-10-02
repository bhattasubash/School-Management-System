'use client';

import React from 'react';

interface AdminEmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export default function AdminEmptyState({
  icon,
  title,
  description,
  action,
  className = '',
}: AdminEmptyStateProps) {
  return (
    <div
      className={`p-10 text-center bg-white rounded-[24px] border border-dashed border-slate-200 flex flex-col items-center justify-center space-y-3 ${className}`}
    >
      {icon && (
        <div className="w-14 h-14 rounded-2xl bg-[#EBF4FE] text-[#0B72E7] flex items-center justify-center mb-1 shadow-xs">
          {icon}
        </div>
      )}
      <h3 className="text-sm font-bold text-slate-900">{title}</h3>
      {description && (
        <p className="text-xs text-slate-500 max-w-sm leading-relaxed">{description}</p>
      )}
      {action && <div className="pt-2">{action}</div>}
    </div>
  );
}
