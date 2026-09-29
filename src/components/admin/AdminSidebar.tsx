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
    badge: null,
  },
  {
    name: 'Student Directory',
    href: '/admin/students',
    icon: Users,
    badge: '10-A',
  },
  {
    name: 'Staff & Faculty',
    href: '/admin/teachers',
    icon: GraduationCap,
    badge: null,
  },
  {
    name: 'Fee Counter & Ledger',
    href: '/admin/fees',
    icon: CreditCard,
    badge: 'Q2 Open',
  },
  {
    name: 'Admissions Intake',
    href: '/admin/admissions',
    icon: UserPlus,
    badge: 'New',
  },
  {
    name: 'Academic & Timetable',
    href: '/admin/academics',
    icon: CalendarDays,
    badge: null,
  },
  {
    name: 'Circulars & Notices',
    href: '/admin/notices',
    icon: Megaphone,
    badge: null,
  },
  {
    name: 'Security & Audit Logs',
    href: '/admin/audit',
    icon: ShieldCheck,
    badge: null,
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
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 md:w-72 bg-[#111C2D] text-white flex flex-col justify-between border-r border-slate-800 transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand / Logo Header */}
        <div className="p-5 border-b border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#FF7555] to-[#FA896B] flex items-center justify-center text-white shadow-md shadow-[#FF7555]/20 font-black text-lg">
              D
            </div>
            <div>
              <h2 className="text-sm font-extrabold tracking-tight leading-none text-white truncate max-w-[150px]">
                {schoolName}
              </h2>
              <div className="flex items-center gap-1.5 mt-1">
                <span className="text-[10px] font-bold text-[#FF7555] tracking-wider uppercase">
                  {board}
                </span>
                <span className="text-[10px] text-slate-400">•</span>
                <span className="text-[10px] text-slate-400 font-medium">
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
          <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
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
                className={`group flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-[#FF7555] text-white shadow-md shadow-[#FF7555]/25 font-bold'
                    : 'text-slate-300 hover:bg-slate-800/70 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Icon
                    className={`w-4 h-4 shrink-0 transition-colors ${
                      isActive ? 'text-white' : 'text-slate-400 group-hover:text-[#FF7555]'
                    }`}
                  />
                  <span className="truncate">{item.name}</span>
                </div>

                {item.badge && (
                  <span
                    className={`text-[9px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                      isActive
                        ? 'bg-white/20 text-white'
                        : 'bg-slate-800 text-[#FF7555] border border-slate-700'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}

          <div className="pt-4 px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            External Portals
          </div>

          <Link
            href="/"
            target="_blank"
            className="group flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-300 hover:bg-slate-800/70 hover:text-white transition-all"
          >
            <div className="flex items-center gap-3">
              <Building2 className="w-4 h-4 text-slate-400 group-hover:text-[#FF7555]" />
              <span>Student / Parent View</span>
            </div>
            <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
          </Link>

          <Link
            href="/teacher"
            target="_blank"
            className="group flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-300 hover:bg-slate-800/70 hover:text-white transition-all"
          >
            <div className="flex items-center gap-3">
              <GraduationCap className="w-4 h-4 text-slate-400 group-hover:text-[#FF7555]" />
              <span>Teacher Portal View</span>
            </div>
            <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
          </Link>
        </div>

        {/* Footer Session Badge */}
        <div className="p-4 border-t border-slate-800/80 bg-slate-950/40">
          <div className="flex items-center justify-between text-[11px] text-slate-400 font-medium">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              CBSE Affiliated
            </span>
            <span className="font-mono text-[10px] text-slate-400">No. 2730018</span>
          </div>
          <p className="text-[10px] text-slate-400 mt-1">
            Zero-Trust Multi-Tenancy Scoped
          </p>
        </div>
      </aside>
    </>
  );
}
