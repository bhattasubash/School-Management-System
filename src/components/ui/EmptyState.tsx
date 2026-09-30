import React from 'react';
import { type LucideIcon, Inbox } from 'lucide-react';
import { clsx } from 'clsx';

export interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
    icon?: LucideIcon;
  };
  className?: string;
}

export default function EmptyState({ icon: Icon = Inbox, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={clsx('flex flex-col items-center justify-center py-12 px-4 text-center', className)}>
      <div className="w-14 h-14 rounded-full bg-brand-subtle flex items-center justify-center mb-4">
        <Icon className="w-7 h-7 text-brand-muted" />
      </div>
      <h3 className="text-section-header text-brand-dark mb-1">{title}</h3>
      {description && <p className="text-body-primary text-brand-muted max-w-sm">{description}</p>}
      {action && (
        <button
          onClick={action.onClick}
          className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-brand-primary text-white text-body-primary font-medium hover:bg-brand-hover transition-colors"
        >
          {action.icon && <action.icon className="w-4 h-4" />}
          {action.label}
        </button>
      )}
    </div>
  );
}

export { EmptyState };
