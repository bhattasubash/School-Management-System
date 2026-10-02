'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  Users,
  UserCheck,
  FilePlus,
  BookOpen,
  Calendar,
  ClipboardList,
  GraduationCap,
  CalendarMinus,
  CreditCard,
  Receipt,
  MessageSquare,
  Smartphone,
  CalendarCheck,
  Gift,
  FileSpreadsheet,
  ShieldCheck,
  PhoneCall,
  Settings,
  ChevronRight,
  X,
} from 'lucide-react';
import SchoolLogo from './illustrations/SchoolLogo';

interface AdminSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  schoolName?: string;
  tagline?: string;
}

interface NavSection {
  title: string;
  items: Array<{
    name: string;
    href: string;
    icon: React.ComponentType<{ className?: string }>;
  }>;
}

const navSections: NavSection[] = [
  {
    title: 'STUDENT & PARENT MANAGEMENT',
    items: [
      { name: 'Students', href: '/admin/students', icon: Users },
      { name: 'Parents & Guardians', href: '/admin/parents', icon: UserCheck },
      { name: 'Admissions', href: '/admin/admissions', icon: FilePlus },
    ],
  },
  {
    title: 'ACADEMIC MANAGEMENT',
    items: [
      { name: 'Classes & Sections', href: '/admin/academics', icon: BookOpen },
      { name: 'Timetable & Substitution', href: '/admin/timetable', icon: Calendar },
      { name: 'Exams & Report Cards', href: '/admin/exams', icon: ClipboardList },
    ],
  },
  {
    title: 'STAFF MANAGEMENT',
    items: [
      { name: 'Teachers & Staff', href: '/admin/teachers', icon: GraduationCap },
      { name: 'Leave Management', href: '/admin/leave', icon: CalendarMinus },
    ],
  },
  {
    title: 'FEES & FINANCE',
    items: [
      { name: 'Fee Management', href: '/admin/fees', icon: CreditCard },
      { name: 'Invoices & Receipts', href: '/admin/fees#invoices', icon: Receipt },
    ],
  },
  {
    title: 'COMMUNICATION',
    items: [
      { name: 'Notices & Circulars', href: '/admin/notices', icon: MessageSquare },
      { name: 'Notifications (SMS/WhatsApp)', href: '/admin/notifications', icon: Smartphone },
      { name: 'Appointments', href: '/admin/events#appointments', icon: CalendarCheck },
    ],
  },
  {
    title: 'OPERATIONS & ADMIN',
    items: [
      { name: 'Events & Holidays', href: '/admin/events', icon: Gift },
      { name: 'Bulk Import (Excel)', href: '/admin/bulk-import', icon: FileSpreadsheet },
      { name: 'Audit Trail', href: '/admin/audit', icon: ShieldCheck },
      { name: 'Emergency Directory', href: '/admin/emergency', icon: PhoneCall },
      { name: 'Settings', href: '/admin/settings', icon: Settings },
    ],
  },
];

export default function AdminSidebar({
  isOpen,
  onClose,
  schoolName = 'Sunrise Public School',
  tagline = 'Learn · Grow · Excel',
}: AdminSidebarProps) {
  const pathname = usePathname();

  const isDashboardActive = pathname === '/admin';

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-slate-900/40 z-40 lg:hidden backdrop-blur-xs transition-opacity"
          aria-hidden="true"
        />
      )}

      {/* Floating Standalone Sidebar Card */}
      <aside
        className={`fixed top-3 bottom-3 left-3 z-50 w-72 bg-white rounded-[28px] shadow-[0_4px_24px_rgba(30,64,175,0.06)] border border-white/80 flex flex-col justify-between transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-[110%]'
        }`}
      >
        {/* Top Branding Section */}
        <div className="pt-5 px-5 pb-3 flex items-center justify-between">
          <Link href="/admin" className="flex items-center gap-3 group">
            <SchoolLogo size={42} />
            <div className="min-w-0">
              <h2 className="text-[15px] font-bold text-slate-900 leading-tight tracking-tight group-hover:text-[#0B72E7] transition-colors truncate">
                {schoolName}
              </h2>
              <p className="text-[11px] font-medium text-slate-400 tracking-tight leading-tight mt-0.5">
                {tagline}
              </p>
            </div>
          </Link>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 lg:hidden transition-colors"
            aria-label="Close sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Navigation Area */}
        <div className="flex-1 overflow-y-auto px-4 py-1.5 space-y-3 no-scrollbar">
          {/* Active Dashboard Button */}
          <div>
            <Link
              href="/admin"
              onClick={onClose}
              className={`flex items-center gap-3 px-3.5 py-2 rounded-2xl text-[13px] font-semibold transition-all ${
                isDashboardActive
                  ? 'bg-[#0B72E7] text-white shadow-[0_4px_14px_rgba(11,114,231,0.3)]'
                  : 'text-slate-600 hover:text-[#0B72E7] hover:bg-[#F0F7FE]'
              }`}
            >
              <Home
                className={`w-4 h-4 shrink-0 stroke-[2.2] ${
                  isDashboardActive ? 'text-white' : 'text-slate-500'
                }`}
              />
              <span>Dashboard</span>
            </Link>
          </div>

          {/* Navigation Section Groups */}
          {navSections.map((section) => (
            <div key={section.title} className="space-y-0.5">
              <div className="px-3 text-[9.5px] font-bold uppercase tracking-wider text-slate-400 select-none pb-0.5">
                {section.title}
              </div>

              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive =
                  !isDashboardActive &&
                  (pathname === item.href || pathname.startsWith(`${item.href}/`));

                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={onClose}
                    className={`group flex items-center justify-between px-3 py-1.5 rounded-xl text-[12px] font-medium transition-colors ${
                      isActive
                        ? 'bg-[#EBF4FE] text-[#0B72E7] font-semibold'
                        : 'text-slate-600 hover:text-[#0B72E7] hover:bg-[#F0F7FE]'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Icon
                        className={`w-3.5 h-3.5 shrink-0 transition-colors ${
                          isActive
                            ? 'text-[#0B72E7]'
                            : 'text-slate-400 group-hover:text-[#0B72E7]'
                        }`}
                      />
                      <span className="truncate">{item.name}</span>
                    </div>
                  </Link>
                );
              })}
            </div>
          ))}
        </div>

        {/* Bottom Help & Support Section */}
        <div className="p-3.5 border-t border-slate-100 bg-[#FAFCFE] rounded-b-[28px]">
          <Link
            href="/admin/settings"
            onClick={onClose}
            className="flex items-center justify-between p-2 rounded-xl text-slate-600 hover:text-[#0B72E7] hover:bg-[#F0F7FE] transition-colors group"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#E0F2FE] text-[#0284C7] flex items-center justify-center shrink-0">
                <BookOpen className="w-4 h-4" />
              </div>
              <span className="text-[12.5px] font-semibold">Help & Support</span>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-[#0B72E7] group-hover:translate-x-0.5 transition-all" />
          </Link>
        </div>
      </aside>
    </>
  );
}
