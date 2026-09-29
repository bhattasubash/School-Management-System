import React from 'react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import {
  Briefcase,
  LogOut,
  ArrowRight,
  ShieldAlert,
  Users,
  Calendar,
  CheckCircle2,
  Clock,
} from 'lucide-react';
import { getSessionFromCookies } from '@/lib/session';
import { logoutAction } from '@/actions/auth';
import { AttendanceService } from '@/services/attendance.service';
import { AttendanceRegister } from '@/components/attendance/AttendanceRegister';
import { TodayScheduleWidget } from '@/components/attendance/TodayScheduleWidget';
import { Role } from '@/types';

export default async function TeacherPortalPage() {
  const session = await getSessionFromCookies();

  // Route Guard: Ensure teacher or admin session
  if (!session || !session.tenantId) {
    redirect('/login?redirect=/teacher');
  }

  if (session.role !== Role.TEACHER && session.role !== Role.SUPER_ADMIN && session.role !== Role.ADMIN) {
    redirect('/unauthorized');
  }

  // 1. Fetch Teacher's Assigned Sections
  const sections = await AttendanceService.getTeacherSections(session.sub, session.tenantId);

  // 2. Fetch Teacher's Today Schedule and Active Substitutions
  const { dayOfWeek, schedule, substitutions } = await AttendanceService.getTeacherTodaySchedule(
    session.sub,
    session.tenantId,
    new Date()
  );

  return (
    <div className="min-h-screen bg-[#F4F6F9] text-[#111C2D]">
      {/* ==================================================================== */}
      {/* 1. TOP INSTITUTIONAL NAVIGATION                                     */}
      {/* ==================================================================== */}
      <header className="sticky top-0 z-40 bg-[#111C2D] text-white border-b border-gray-800 px-6 py-4 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#FA896B] flex items-center justify-center text-white shadow-xs">
            <Briefcase className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-bold leading-none">
              Delhi Public School • Faculty Portal
            </h1>
            <p className="text-xs text-gray-400 mt-1">
              Class Attendance & Timetable Management • Academic Session 2026-27
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden sm:flex flex-col text-right">
            <span className="text-xs font-bold leading-none">
              {session.firstName} {session.lastName}
            </span>
            <span className="text-[10px] text-emerald-400 mt-0.5">
              Senior Secondary Faculty
            </span>
          </div>

          <span className="text-xs bg-[#26C281]/20 text-[#26C281] border border-[#26C281]/30 px-2.5 py-1 rounded-full font-bold">
            Role: Teacher
          </span>

          <form action={logoutAction}>
            <button
              type="submit"
              className="flex items-center gap-1.5 text-xs text-gray-300 hover:text-white bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              Sign Out
            </button>
          </form>
        </div>
      </header>

      {/* ==================================================================== */}
      {/* 2. MAIN TEACHER WORKSPACE                                            */}
      {/* ==================================================================== */}
      <main className="max-w-7xl mx-auto p-4 sm:p-6 md:p-8 space-y-6">
        {/* Welcome & Overview Header */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#26C281]">
              Daily Operations Active
            </span>
            <h2 className="text-2xl font-black text-[#111C2D] mt-1">
              Welcome back, {session.firstName || 'Teacher'}
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              Class Teacher for Class 10-A • Sub-30-Second Morning Attendance & Period Timetable
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-xs font-semibold text-[#111C2D] bg-[#F4F6F9] hover:bg-gray-200 px-4 py-2.5 rounded-xl transition-all"
            >
              Student Portal View <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Two-Column Responsive Layout: Left Attendance Register (60%), Right Schedule & Substitution Widget (40%) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Main Column: Interactive Attendance Register */}
          <div className="lg:col-span-7 xl:col-span-8">
            <AttendanceRegister
              initialSections={sections}
              defaultSectionId={sections[0]?.id}
            />
          </div>

          {/* Right Column: Schedule & Substitution Alert Widget */}
          <div className="lg:col-span-5 xl:col-span-4 space-y-6">
            <TodayScheduleWidget
              dayOfWeek={dayOfWeek}
              schedule={schedule}
              substitutions={substitutions}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
