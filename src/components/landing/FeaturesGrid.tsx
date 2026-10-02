import React from 'react';
import {
  Users,
  GraduationCap,
  BookOpen,
  CalendarCheck2,
  FileText,
  FileEdit,
  CalendarDays,
  CreditCard,
  Palmtree,
  Bus,
  Mail,
  BarChart3,
} from 'lucide-react';

interface FeatureItem {
  id: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  iconColor: string;
  bgColor: string;
}

const features: FeatureItem[] = [
  // Row 1
  {
    id: 'student-mgmt',
    name: 'Student Management',
    icon: Users,
    iconColor: 'text-[#1d8cfd]',
    bgColor: 'bg-blue-100/70',
  },
  {
    id: 'teacher-mgmt',
    name: 'Teacher Management',
    icon: GraduationCap,
    iconColor: 'text-purple-600',
    bgColor: 'bg-purple-100/70',
  },
  {
    id: 'classes-sections',
    name: 'Classes & Sections',
    icon: BookOpen,
    iconColor: 'text-emerald-600',
    bgColor: 'bg-emerald-100/70',
  },
  {
    id: 'attendance-tracking',
    name: 'Attendance Tracking',
    icon: CalendarCheck2,
    iconColor: 'text-rose-500',
    bgColor: 'bg-rose-100/70',
  },
  // Row 2
  {
    id: 'exams-results',
    name: 'Exams & Results',
    icon: FileText,
    iconColor: 'text-amber-500',
    bgColor: 'bg-amber-100/70',
  },
  {
    id: 'assignments',
    name: 'Assignments',
    icon: FileEdit,
    iconColor: 'text-purple-600',
    bgColor: 'bg-purple-100/70',
  },
  {
    id: 'timetable-mgmt',
    name: 'Timetable Management',
    icon: CalendarDays,
    iconColor: 'text-[#1d8cfd]',
    bgColor: 'bg-sky-100/70',
  },
  {
    id: 'fees-payments',
    name: 'Fees & Payments',
    icon: CreditCard,
    iconColor: 'text-emerald-600',
    bgColor: 'bg-emerald-100/70',
  },
  // Row 3
  {
    id: 'leave-mgmt',
    name: 'Leave Management',
    icon: Palmtree,
    iconColor: 'text-rose-500',
    bgColor: 'bg-rose-100/70',
  },
  {
    id: 'transport-mgmt',
    name: 'Transport Management',
    icon: Bus,
    iconColor: 'text-amber-500',
    bgColor: 'bg-amber-100/70',
  },
  {
    id: 'communication',
    name: 'Communication',
    icon: Mail,
    iconColor: 'text-amber-500',
    bgColor: 'bg-amber-100/70',
  },
  {
    id: 'reports-analytics',
    name: 'Reports & Analytics',
    icon: BarChart3,
    iconColor: 'text-[#1d8cfd]',
    bgColor: 'bg-blue-100/70',
  },
];

export default function FeaturesGrid() {
  return (
    <section id="features" className="py-14 sm:py-20 bg-[#f0f7ff]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-3xl sm:rounded-[32px] p-8 sm:p-12 lg:p-16 border border-slate-100 shadow-[0_10px_40px_rgba(15,23,42,0.04)]">
          {/* Section Header */}
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-[28px] sm:text-[36px] font-extrabold text-slate-900 tracking-[-0.02em] leading-tight">
              Everything You Need
              <br />
              in <span className="text-[#1d8cfd]">One Platform</span>
            </h2>
            <p className="mt-3 text-[14px] sm:text-[15px] text-slate-500 leading-relaxed max-w-lg mx-auto">
              Manage your school operations efficiently with powerful features designed for modern education.
            </p>
          </div>

          {/* 4-column x 3-row Features Grid */}
          <div className="mt-12 sm:mt-16 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6 sm:gap-8">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.id}
                  className="group flex flex-col items-center text-center p-5 rounded-2xl hover:bg-slate-50/80 transition-all duration-200 cursor-default"
                >
                  <div
                    className={`w-16 h-16 rounded-2xl ${feature.bgColor} flex items-center justify-center transition-transform duration-200 group-hover:scale-110 shadow-xs`}
                  >
                    <Icon className={`w-8 h-8 ${feature.iconColor} stroke-[2]`} />
                  </div>
                  <h3 className="mt-4 text-[14px] font-semibold text-slate-800 leading-snug">
                    {feature.name}
                  </h3>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
