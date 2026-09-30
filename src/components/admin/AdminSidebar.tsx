'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  CreditCard,
  UserPlus,
  CalendarDays,
  Clock,
  UserCheck,
  CalendarCheck,
  Megaphone,
  ShieldCheck,
  Building2,
  X,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';

interface AdminSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  schoolName: string;
  board: string;
  academicYear: string;
}

const navItems = [
  {
    name: 'Dashboard Overview',
    href: '/admin',
    icon: LayoutDashboard,
  },
  {
    name: 'Student Directory',
    href: '/admin/students',
    icon: Users,
  },
  {
    name: 'Parents Directory',
    href: '/admin/parents',
    icon: ShieldCheck,
  },
  {
    name: 'Staff & Faculty',
    href: '/admin/teachers',
    icon: GraduationCap,
  },
  {
    name: 'Bulk Data Import',
    href: '/admin/bulk-import',
    icon: UserPlus,
  },
  {
    name: 'Fee Counter & Ledger',
    href: '/admin/fees',
    icon: CreditCard,
  },
  {
    name: 'Admissions Intake',
    href: '/admin/admissions',
    icon: UserPlus,
  },
  {
    name: 'Academic Structure',
    href: '/admin/academics',
    icon: CalendarDays,
  },
  {
    name: 'Timetable Builder',
    href: '/admin/timetable',
    icon: Clock,
  },
  {
    name: 'Substitution Cover',
    href: '/admin/substitutions',
    icon: UserCheck,
  },
  {
    name: 'Attendance Oversight',
    href: '/admin/attendance',
    icon: CalendarCheck,
  },
  {
    name: 'Circulars & Notices',
    href: '/admin/notices',
    icon: Megaphone,
  },
  {
    name: 'Security & Audit Logs',
    href: '/admin/audit',
    icon: ShieldCheck,
  },
];

export default function AdminSidebar({
  isOpen,
  onClose,
  schoolName,
  board,
  academicYear,
}: AdminSidebarProps) {
  const pathname = usePathname();

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-xs transition-opacity"
          aria-hidden="true"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 bg-[#0F172A] text-white flex flex-col justify-between border-r border-slate-800 transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand / Logo Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#C2410C] flex items-center justify-center text-white shadow-xs font-black text-lg">
              {schoolName.charAt(0) || 'S'}
            </div>
            <div className="min-w-0">
              <h2 className="text-sm font-bold tracking-tight leading-none text-white truncate max-w-[160px]">
                {schoolName}
              </h2>
              <div className="flex items-center gap-1.5 mt-1">
                <span className="text-xs font-semibold text-slate-300">
                  {board}
                </span>
                <span className="text-xs text-slate-500">•</span>
                <span className="text-xs text-slate-400 font-medium">
                  AY {academicYear}
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 lg:hidden transition-colors"
            aria-label="Close sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 overflow-y-auto px-3.5 py-4 space-y-1">
          <div className="px-3 pb-2 text-xs font-bold uppercase tracking-wider text-slate-400">
            Administrative Modules
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.href === '/admin'
                ? pathname === '/admin'
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => onClose()}
                className={`group flex items-center justify-between px-3.5 py-2.5 rounded-lg text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-[#C2410C] text-white shadow-xs font-bold'
                    : 'text-slate-300 hover:bg-slate-800/70 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Icon
                    className={`w-4 h-4 shrink-0 transition-colors ${
                      isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'
                    }`}
                  />
                  <span className="truncate">{item.name}</span>
                </div>
              </Link>
            );
          })}

          <div className="pt-5 px-3 pb-2 text-xs font-bold uppercase tracking-wider text-slate-400">
            External Portals
          </div>

          <Link
            href="/"
            target="_blank"
            className="group flex items-center justify-between px-3.5 py-2.5 rounded-lg text-xs font-medium text-slate-300 hover:bg-slate-800/70 hover:text-white transition-all"
          >
            <div className="flex items-center gap-3">
              <Building2 className="w-4 h-4 text-slate-400 group-hover:text-slate-200" />
              <span>Student / Parent View</span>
            </div>
            <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
          </Link>

          <Link
            href="/teacher"
            target="_blank"
            className="group flex items-center justify-between px-3.5 py-2.5 rounded-lg text-xs font-medium text-slate-300 hover:bg-slate-800/70 hover:text-white transition-all"
          >
            <div className="flex items-center gap-3">
              <GraduationCap className="w-4 h-4 text-slate-400 group-hover:text-slate-200" />
              <span>Teacher Portal View</span>
            </div>
            <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
          </Link>
        </div>

        {/* Footer Session Info */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/40">
          <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
            <span className="text-slate-300 font-semibold">{schoolName}</span>
            <span className="text-slate-500">v1.0</span>
          </div>
        </div>
      </aside>
    </>
  );
}
