'use client';

import React, { useEffect, useState } from 'react';
import { clsx } from 'clsx';

export interface ProgressPillProps {
  label: string;
  percentage: number;
  color?: string;
  showValue?: boolean;
  size?: 'sm' | 'md';
  className?: string;
}

export default function ProgressPill({
  label,
  percentage,
  color,
  showValue = true,
  size = 'sm',
  className,
}: ProgressPillProps) {
  const [animatedWidth, setAnimatedWidth] = useState(0);
  const clamped = Math.min(100, Math.max(0, percentage));
  const resolvedColor = color || (clamped >= 75 ? 'bg-emerald-500' : clamped >= 50 ? 'bg-amber-500' : 'bg-red-500');

  useEffect(() => {
    const timer = setTimeout(() => setAnimatedWidth(clamped), 100);
    return () => clearTimeout(timer);
  }, [clamped]);

  return (
    <div className={clsx('w-full', className)}>
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-caption text-brand-dark font-medium truncate">{label}</span>
        {showValue && <span className="text-caption text-brand-muted font-semibold ml-2">{Math.round(clamped)}%</span>}
      </div>
      <div className={clsx('w-full rounded-full bg-gray-100 overflow-hidden', size === 'sm' ? 'h-2' : 'h-3')}>
        <div
          className={clsx('h-full rounded-full transition-all duration-700 ease-out', typeof color === 'string' && color.startsWith('bg-') ? color : resolvedColor)}
          style={{
            width: `${animatedWidth}%`,
            ...(color && !color.startsWith('bg-') ? { backgroundColor: color } : {}),
          }}
        />
      </div>
    </div>
  );
}

export { ProgressPill };
