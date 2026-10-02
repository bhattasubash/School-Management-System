'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import {
  Home,
  UserCheck,
  Calendar,
  CalendarRange,
  CheckSquare,
  Users,
  FileSpreadsheet,
  UploadCloud,
  MessageSquare,
  Briefcase,
  ClipboardList,
  Bell,
  CalendarHeart,
  BookOpen,
  ChevronRight,
} from 'lucide-react';

interface TeacherSidebarProps {
  schoolName?: string;
  tagline?: string;
}

export function TeacherSidebar({
  schoolName = 'Sunrise Public School',
  tagline = 'Learn · Grow · Excel',
}: TeacherSidebarProps) {
  const pathname = usePathname();

  const isNavActive = (href: string) => {
    if (href === '/teacher') {
      return pathname === '/teacher';
    }
    return pathname.startsWith(href);
  };

  const navGroups = [
    {
      items: [
        { name: 'Dashboard', href: '/teacher', icon: Home },
        { name: 'My Attendance', href: '/teacher/attendance', icon: UserCheck },
        { name: "Today's Schedule", href: '/teacher/schedule', icon: Calendar },
        { name: 'Timetable', href: '/teacher/timetable', icon: CalendarRange },
      ],
    },
    {
      items: [
        { name: 'Class Attendance', href: '/teacher/class-attendance', icon: CheckSquare },
        { name: 'Student Roster', href: '/teacher/students', icon: Users },
        { name: 'Exam Marks Entry', href: '/teacher/marks', icon: FileSpreadsheet },
        { name: 'Bulk Marks Import', href: '/teacher/marks/import', icon: UploadCloud },
        { name: 'Student Remarks', href: '/teacher/remarks', icon: MessageSquare },
      ],
    },
    {
      items: [
        { name: 'Apply Leave', href: '/teacher/leave/apply', icon: Briefcase },
        { name: 'Leave Status', href: '/teacher/leave/status', icon: ClipboardList },
        { name: 'Notices & Circulars', href: '/teacher/notices', icon: Bell },
        { name: 'Events & Holidays', href: '/teacher/events', icon: CalendarHeart },
      ],
    },
  ];

  return (
    <aside className="w-[268px] shrink-0 bg-white rounded-[26px] p-4 flex flex-col justify-between shadow-[0_4px_24px_rgba(30,100,200,0.06)] border border-white/80 select-none">
      <div>
        {/* Brand Header */}
        <div className="flex items-center gap-3 px-2 pt-1 pb-4">
          <div className="w-10 h-10 rounded-xl bg-sky-50 flex items-center justify-center shrink-0 border border-sky-100 overflow-hidden">
            <Image
              src="/assets/teacher-dashboard/school-logo.png"
              alt="School Logo"
              width={34}
              height={34}
              className="object-contain"
            />
          </div>
          <div>
            <h1 className="text-[14.5px] font-bold text-[#102A56] leading-tight">
              {schoolName}
            </h1>
            <p className="text-[11px] font-medium text-[#64748B] mt-0.5 tracking-wide">
              {tagline}
            </p>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="space-y-1 mt-1">
          {navGroups.map((group, groupIdx) => (
            <div key={groupIdx}>
              {groupIdx > 0 && (
                <div className="my-2 border-t border-[#EEF2F6] mx-2" />
              )}
              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const active = isNavActive(item.href);
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`flex items-center gap-3 px-3.5 py-2.5 rounded-[14px] text-[13.5px] font-medium transition-all ${
                        active
                          ? 'bg-[#2563EB] text-white shadow-[0_4px_12px_rgba(37,99,235,0.28)]'
                          : 'text-[#64748B] hover:text-[#102A56] hover:bg-[#F8FAFC]'
                      }`}
                    >
                      <Icon
                        className={`w-4 h-4 shrink-0 ${
                          active ? 'text-white stroke-[2.2]' : 'text-[#64748B] stroke-[1.8]'
                        }`}
                      />
                      <span className="truncate">{item.name}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
      </div>

      {/* Bottom Help & Support */}
      <div className="pt-2">
        <Link
          href="/teacher/help"
          className="flex items-center justify-between p-2.5 rounded-[16px] bg-[#F0F9FF] hover:bg-[#E0F2FE] border border-[#E0F2FE] transition-colors group cursor-pointer"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#E0F2FE] group-hover:bg-white flex items-center justify-center text-[#0284C7] shrink-0 transition-colors">
              <BookOpen className="w-4 h-4 stroke-[2]" />
            </div>
            <span className="text-[13px] font-semibold text-[#102A56]">
              Help & Support
            </span>
          </div>
          <ChevronRight className="w-4 h-4 text-[#94A3B8] group-hover:text-[#0284C7] transition-colors" />
        </Link>
      </div>
    </aside>
  );
}
