'use client';

import React from 'react';
import Link from 'next/link';
import {
  Users,
  Presentation,
  BookOpen,
  CalendarDays,
  CreditCard,
  BarChart3,
} from 'lucide-react';

export const quickActionItems = [
  {
    id: 'students',
    href: '/admin/students',
    label1: 'Manage',
    label2: 'Students',
    icon: Users,
    bgGradient: 'from-[#FF6584] to-[#FF4365]',
    shadowColor: 'rgba(255, 67, 101, 0.25)',
  },
  {
    id: 'teachers',
    href: '/admin/teachers',
    label1: 'Manage',
    label2: 'Teachers',
    icon: Presentation,
    bgGradient: 'from-[#A855F7] to-[#7E22CE]',
    shadowColor: 'rgba(147, 51, 234, 0.25)',
  },
  {
    id: 'classes',
    href: '/admin/academics',
    label1: 'Manage',
    label2: 'Classes',
    icon: BookOpen,
    bgGradient: 'from-[#34D399] to-[#059669]',
    shadowColor: 'rgba(16, 185, 129, 0.25)',
  },
  {
    id: 'calendar',
    href: '/admin/events',
    label1: 'Academic',
    label2: 'Calendar',
    icon: CalendarDays,
    bgGradient: 'from-[#60A5FA] to-[#2563EB]',
    shadowColor: 'rgba(37, 99, 235, 0.25)',
  },
  {
    id: 'fees',
    href: '/admin/fees',
    label1: 'Fees',
    label2: 'Management',
    icon: CreditCard,
    bgGradient: 'from-[#FBBF24] to-[#D97706]',
    shadowColor: 'rgba(217, 119, 6, 0.25)',
  },
  {
    id: 'reports',
    href: '/admin/audit',
    label1: 'View',
    label2: 'Reports',
    icon: BarChart3,
    bgGradient: 'from-[#FB7185] to-[#E11D48]',
    shadowColor: 'rgba(225, 29, 72, 0.25)',
  },
];

export default function AdminQuickActions() {
  return (
    <div className="w-full bg-white rounded-[26px] border border-white/70 shadow-[0_4px_24px_rgba(30,64,175,0.04)] px-6 py-4">
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 sm:gap-4 items-center justify-between">
        {quickActionItems.map((action) => {
          const Icon = action.icon;
          return (
            <Link
              key={action.id}
              href={action.href}
              className="group flex flex-col items-center text-center transition-transform hover:-translate-y-1"
            >
              {/* Colored Circular Icon Container */}
              <div
                className={`w-13 h-13 sm:w-14 sm:h-14 rounded-full bg-gradient-to-br ${action.bgGradient} flex items-center justify-center text-white shadow-md transition-shadow group-hover:shadow-lg`}
                style={{
                  boxShadow: `0 6px 14px -3px ${action.shadowColor}`,
                }}
              >
                <Icon className="w-6 h-6 stroke-[2.2] text-white" />
              </div>

              {/* Two-line text label */}
              <div className="mt-2">
                <span className="block text-[12px] font-semibold text-slate-700 leading-tight group-hover:text-[#0B72E7] transition-colors">
                  {action.label1}
                </span>
                <span className="block text-[12px] font-semibold text-slate-700 leading-tight group-hover:text-[#0B72E7] transition-colors">
                  {action.label2}
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
