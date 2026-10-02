'use client';

import React from 'react';

interface AdminCardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  hoverEffect?: boolean;
}

export default function AdminCard({
  children,
  className = '',
  onClick,
  hoverEffect = false,
}: AdminCardProps) {
  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-[24px] border border-[#E2EEF8]/80 shadow-[0_4px_24px_rgba(30,64,175,0.04)] p-6 ${
        hoverEffect ? 'hover:shadow-[0_8px_30px_rgba(30,64,175,0.08)] transition-all cursor-pointer' : ''
      } ${className}`}
    >
      {children}
    </div>
  );
}
