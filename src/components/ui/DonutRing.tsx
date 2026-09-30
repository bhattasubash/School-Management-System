'use client';

import React, { useEffect, useState } from 'react';
import { clsx } from 'clsx';

export interface DonutRingProps {
  percentage: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  trackColor?: string;
  label?: string;
  animate?: boolean;
  className?: string;
}

export default function DonutRing({
  percentage,
  size = 120,
  strokeWidth = 10,
  color,
  trackColor = '#E2E8F0',
  label,
  animate = true,
  className,
}: DonutRingProps) {
  const [animatedPercentage, setAnimatedPercentage] = useState(animate ? 0 : percentage);

  const clampedPercentage = Math.min(100, Math.max(0, animatedPercentage));
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (clampedPercentage / 100) * circumference;
  const center = size / 2;

  // Auto color based on percentage threshold
  const resolvedColor = color || (percentage >= 75 ? '#16A34A' : '#D97706');

  useEffect(() => {
    if (!animate) {
      setAnimatedPercentage(percentage);
      return;
    }
    // Small delay then animate
    const timer = setTimeout(() => setAnimatedPercentage(percentage), 100);
    return () => clearTimeout(timer);
  }, [percentage, animate]);

  return (
    <div className={clsx('inline-flex flex-col items-center gap-2', className)}>
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          {/* Track */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke={trackColor}
            strokeWidth={strokeWidth}
          />
          {/* Progress */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke={resolvedColor}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            style={{
              transition: animate ? 'stroke-dashoffset 800ms ease-out' : 'none',
            }}
          />
        </svg>
        {/* Center text */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xl font-bold text-brand-dark">
            {Math.round(clampedPercentage)}%
          </span>
        </div>
      </div>
      {label && <span className="text-caption text-brand-muted font-medium">{label}</span>}
    </div>
  );
}

export { DonutRing };
