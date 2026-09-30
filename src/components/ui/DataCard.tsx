'use client';

import React from 'react';
import { clsx } from 'clsx';

export interface DataCardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  onClick?: () => void;
}

const paddingMap = {
  none: '',
  sm: 'p-3',
  md: 'p-4 sm:p-5',
  lg: 'p-5 sm:p-6',
};

export default function DataCard({ children, className, hover = true, padding = 'md', onClick }: DataCardProps) {
  return (
    <div
      className={clsx(
        'bg-white rounded-xl shadow-card',
        hover && 'transition-all duration-200 hover:shadow-card-hover hover:-translate-y-0.5',
        onClick && 'cursor-pointer',
        paddingMap[padding],
        className
      )}
      onClick={onClick}
    >
      {children}
    </div>
  );
}

export { DataCard };
