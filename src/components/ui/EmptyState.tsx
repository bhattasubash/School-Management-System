'use client';

import React from 'react';
import { type LucideIcon, Inbox } from 'lucide-react';
import { clsx } from 'clsx';

export interface EmptyStateProps {
  icon?: LucideIcon | React.ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
    icon?: LucideIcon;
  };
  className?: string;
}

export default function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  const isLucideIcon = typeof icon === 'function';
  const IconComponent = isLucideIcon ? (icon as LucideIcon) : Inbox;

  return (
    <div className={clsx('flex flex-col items-center justify-center py-12 px-4 text-center', className)}>
      <div className="w-14 h-14 rounded-2xl bg-[#EBF4FE] text-[#0B72E7] flex items-center justify-center mb-3.5 shadow-xs">
        {React.isValidElement(icon) ? (
          icon
        ) : (
          <IconComponent className="w-7 h-7 stroke-[1.8]" />
        )}
      </div>
      <h3 className="text-base font-bold text-slate-900 mb-1">{title}</h3>
      {description && (
        <p className="text-xs md:text-sm text-slate-500 max-w-sm leading-relaxed">{description}</p>
      )}
      {action && (
        <button
          type="button"
          onClick={action.onClick}
          className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#0B72E7] text-white text-xs font-semibold hover:bg-[#0960C4] shadow-xs transition-colors cursor-pointer"
        >
          {action.icon && <action.icon className="w-4 h-4" />}
          <span>{action.label}</span>
        </button>
      )}
    </div>
  );
}

export { EmptyState };
