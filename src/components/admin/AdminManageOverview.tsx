'use client';

import React from 'react';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import StudentsIllustration from './illustrations/StudentsIllustration';
import TeacherIllustration from './illustrations/TeacherIllustration';
import AcademicIllustration from './illustrations/AcademicIllustration';
import AnalyticsIllustration from './illustrations/AnalyticsIllustration';

export const overviewCards = [
  {
    id: 'manage-students',
    href: '/admin/students',
    line1: 'Manage',
    line2: 'Students',
    bgGradient: 'from-[#FF8A00] to-[#FFA726]',
    shadowColor: 'rgba(255, 138, 0, 0.22)',
    arrowColor: 'text-[#EA580C]',
    illustration: StudentsIllustration,
  },
  {
    id: 'manage-teachers',
    href: '/admin/teachers',
    line1: 'Manage',
    line2: 'Teachers',
    bgGradient: 'from-[#00A3FF] to-[#0284C7]',
    shadowColor: 'rgba(2, 132, 199, 0.22)',
    arrowColor: 'text-[#0284C7]',
    illustration: TeacherIllustration,
  },
  {
    id: 'academic-management',
    href: '/admin/academics',
    line1: 'Academic',
    line2: 'Management',
    bgGradient: 'from-[#A855F7] to-[#8B5CF6]',
    shadowColor: 'rgba(139, 92, 246, 0.22)',
    arrowColor: 'text-[#8B5CF6]',
    illustration: AcademicIllustration,
  },
  {
    id: 'reports-analytics',
    href: '/admin/audit',
    line1: 'Reports &',
    line2: 'Analytics',
    bgGradient: 'from-[#10B981] to-[#059669]',
    shadowColor: 'rgba(16, 185, 129, 0.22)',
    arrowColor: 'text-[#059669]',
    illustration: AnalyticsIllustration,
  },
];

export default function AdminManageOverview() {
  return (
    <div className="w-full space-y-3">
      {/* Royal Blue Section Heading */}
      <h2 className="text-[20px] lg:text-[22px] font-extrabold text-[#0265D2] tracking-tight">
        Manage & Overview
      </h2>

      {/* 2x2 Grid of Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 lg:gap-4">
        {overviewCards.map((card) => {
          const Illustration = card.illustration;
          return (
            <Link
              key={card.id}
              href={card.href}
              className={`group relative overflow-hidden rounded-[24px] bg-gradient-to-r ${card.bgGradient} p-5 lg:p-6 flex items-center justify-between transition-all hover:scale-[1.008] hover:shadow-lg`}
              style={{
                boxShadow: `0 8px 20px -4px ${card.shadowColor}`,
                minHeight: '138px',
              }}
            >
              {/* Left: Card Typography */}
              <div className="z-10 space-y-0.5 max-w-[170px]">
                <span className="block text-[17px] lg:text-[19px] font-medium text-white/95 leading-tight">
                  {card.line1}
                </span>
                <span className="block text-[23px] lg:text-[26px] font-extrabold text-white leading-tight">
                  {card.line2}
                </span>
              </div>

              {/* Center-Right: Illustration */}
              <div className="absolute right-12 lg:right-14 inset-y-0 flex items-center justify-center select-none pointer-events-none">
                <Illustration className="w-40 h-28 lg:w-46 lg:h-32" />
              </div>

              {/* Right: Circular White Arrow Button */}
              <div className="relative z-10 ml-auto shrink-0 w-8 h-8 rounded-full bg-white group-hover:bg-white/95 shadow-sm flex items-center justify-center transition-transform group-hover:translate-x-1">
                <ChevronRight className={`w-4 h-4 stroke-[3] ${card.arrowColor}`} />
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
