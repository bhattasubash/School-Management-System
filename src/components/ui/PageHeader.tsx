'use client';

import React from 'react';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { clsx } from 'clsx';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export interface PageHeaderProps {
  title: string;
  subtitle?: string;
  breadcrumbs?: BreadcrumbItem[];
  actions?: React.ReactNode;
  className?: string;
}

export default function PageHeader({
  title,
  subtitle,
  breadcrumbs,
  actions,
  className,
}: PageHeaderProps) {
  return (
    <div
      className={clsx(
        'pb-4 mb-5 border-b border-[#E2EEF8]/80 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4',
        className
      )}
    >
      <div>
        {breadcrumbs && breadcrumbs.length > 0 && (
          <nav className="flex items-center gap-1.5 text-xs text-slate-400 mb-1.5 font-medium">
            <Link href="/admin" className="hover:text-[#0B72E7] transition-colors">
              Dashboard
            </Link>
            {breadcrumbs.map((crumb, index) => (
              <React.Fragment key={index}>
                <ChevronRight className="w-3.5 h-3.5 text-slate-300 shrink-0" />
                {crumb.href && index < breadcrumbs.length - 1 ? (
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

        <h1 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight leading-tight">
          {title}
        </h1>
        {subtitle && (
          <p className="text-xs md:text-sm text-slate-500 font-normal mt-0.5 leading-normal">
            {subtitle}
          </p>
        )}
      </div>

      {actions && (
        <div className="flex items-center gap-2.5 shrink-0 self-start sm:self-center">
          {actions}
        </div>
      )}
    </div>
  );
}

export { PageHeader };
