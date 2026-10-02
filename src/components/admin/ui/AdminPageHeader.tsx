'use client';

import React from 'react';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface AdminPageHeaderProps {
  title: string;
  description?: string;
  breadcrumbs?: BreadcrumbItem[];
  actions?: React.ReactNode;
  badge?: React.ReactNode;
  className?: string;
}

export default function AdminPageHeader({
  title,
  description,
  breadcrumbs,
  actions,
  badge,
  className = '',
}: AdminPageHeaderProps) {
  return (
    <div
      className={`flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#E2EEF8]/80 ${className}`}
    >
      <div className="space-y-1">
        {breadcrumbs && breadcrumbs.length > 0 && (
          <nav className="flex items-center gap-1.5 text-xs text-slate-400 mb-1.5 font-medium">
            <Link href="/admin" className="hover:text-[#0B72E7] transition-colors">
              Dashboard
            </Link>
            {breadcrumbs.map((crumb, idx) => (
              <React.Fragment key={idx}>
                <ChevronRight className="w-3 h-3 text-slate-300 shrink-0" />
                {crumb.href ? (
                  <Link href={crumb.href} className="hover:text-[#0B72E7] transition-colors">
                    {crumb.label}
                  </Link>
                ) : (
                  <span className="text-slate-600 font-semibold">{crumb.label}</span>
                )}
              </React.Fragment>
            ))}
          </nav>
        )}

        <div className="flex items-center gap-2.5">
          <h1 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">
            {title}
          </h1>
          {badge}
        </div>

        {description && (
          <p className="text-xs md:text-sm text-slate-500 font-normal">
            {description}
          </p>
        )}
      </div>

      {actions && (
        <div className="flex items-center gap-2.5 shrink-0 self-start md:self-center">
          {actions}
        </div>
      )}
    </div>
  );
}
