import React from 'react';
import { type LucideIcon } from 'lucide-react';
import { clsx } from 'clsx';

export interface MetricTileProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  variant?: 'coral' | 'primary' | 'blue' | 'green' | 'purple' | 'amber';
  className?: string;
}

const variantStyles = {
  coral: 'bg-gradient-to-br from-[#FA896B] to-[#e87050]',
  primary: 'bg-gradient-to-br from-brand-primary to-brand-hover',
  blue: 'bg-gradient-to-br from-blue-600 to-blue-700',
  green: 'bg-gradient-to-br from-emerald-600 to-emerald-700',
  purple: 'bg-gradient-to-br from-purple-600 to-purple-700',
  amber: 'bg-gradient-to-br from-amber-500 to-amber-600',
};

export default function MetricTile({ title, value, icon: Icon, trend, variant = 'coral', className }: MetricTileProps) {
  return (
    <div className={clsx('rounded-xl p-4 sm:p-5 text-white shadow-card', variantStyles[variant], className)}>
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-caption text-white/80 uppercase tracking-wider">{title}</p>
          <p className="mt-2 text-2xl sm:text-3xl font-bold tracking-tight">{value}</p>
          {trend && (
            <p className={clsx('mt-1.5 text-caption font-medium inline-flex items-center gap-1',
              trend.isPositive ? 'text-emerald-200' : 'text-red-200'
            )}>
              <span>{trend.isPositive ? '↑' : '↓'}</span>
              <span>{Math.abs(trend.value)}%</span>
              <span className="text-white/60 ml-0.5">vs last month</span>
            </p>
          )}
        </div>
        <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-white/20 flex items-center justify-center">
          <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
        </div>
      </div>
    </div>
  );
}

export { MetricTile };
