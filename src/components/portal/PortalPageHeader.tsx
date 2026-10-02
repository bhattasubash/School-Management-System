'use client';

import React from 'react';
import { ChevronRight, ArrowLeft } from 'lucide-react';

interface PortalPageHeaderProps {
  title: string;
  subtitle?: string;
  category?: string;
  onBackToDashboard?: () => void;
  children?: React.ReactNode;
}

export default function PortalPageHeader({
  title,
  subtitle,
  category = 'Student Portal',
  onBackToDashboard,
  children,
}: PortalPageHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
      <div>
        {/* Breadcrumb */}
        <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium mb-1">
          {onBackToDashboard ? (
            <button
              type="button"
              onClick={onBackToDashboard}
              className="hover:text-blue-600 transition-colors flex items-center gap-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Dashboard</span>
            </button>
          ) : (
            <span>{category}</span>
          )}
          <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
          <span className="text-blue-600 font-semibold">{title}</span>
        </div>

        {/* Title */}
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight leading-tight">
          {title}
        </h1>

        {/* Subtitle */}
        {subtitle && (
          <p className="text-xs sm:text-sm text-slate-500 font-normal mt-0.5">
            {subtitle}
          </p>
        )}
      </div>

      {/* Action Buttons */}
      {children && <div className="flex items-center gap-2.5 shrink-0">{children}</div>}
    </div>
  );
}
