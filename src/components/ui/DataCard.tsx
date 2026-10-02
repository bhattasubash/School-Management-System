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
  sm: 'p-3.5',
  md: 'p-5 lg:p-6',
  lg: 'p-6 lg:p-7',
};

export default function DataCard({
  children,
  className,
  hover = true,
  padding = 'md',
  onClick,
}: DataCardProps) {
  return (
    <div
      className={clsx(
        'bg-white rounded-[24px] border border-[#E2EEF8]/80 shadow-[0_4px_24px_rgba(30,64,175,0.04)]',
        hover &&
          'transition-all duration-200 hover:shadow-[0_8px_30px_rgba(30,64,175,0.08)] hover:-translate-y-0.5',
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
