import React from 'react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import {
  Briefcase,
  LogOut,
  CalendarCheck,
  Clock,
  Users,
  Megaphone,
  User,
} from 'lucide-react';
import { getSessionFromCookies } from '@/lib/session';
import { logoutAction } from '@/actions/auth';
import { AttendanceService } from '@/services/attendance.service';
import { AttendanceRegister } from '@/components/attendance/AttendanceRegister';
import { TodayScheduleWidget } from '@/components/attendance/TodayScheduleWidget';
import TeacherTimetableView, { type WeeklyTeacherPeriod } from '@/components/attendance/TeacherTimetableView';
import TeacherSelfAttendance from '@/components/attendance/TeacherSelfAttendance';
import { prisma } from '@/lib/db';
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

  const today = new Date();
  const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());

  // 1. Fetch Teacher's Assigned Sections
  const [sections, scheduleData, todayAttendance, weeklyEntries] = await Promise.all([
    AttendanceService.getTeacherSections(session.sub, session.tenantId),
    AttendanceService.getTeacherTodaySchedule(session.sub, session.tenantId, today),
    prisma.staffAttendance.findFirst({
      where: {
        tenantId: session.tenantId,
        userId: session.sub,
        date: todayStart,
      },
    }),
    prisma.timetableEntry.findMany({
      where: {
        tenantId: session.tenantId,
        teacher: { userId: session.sub },
      },
      include: {
        section: { include: { classGrade: true } },
        periodTimeSlot: true,
        subject: true,
      },
      orderBy: { periodTimeSlot: { order: 'asc' } },
    }),
  ]);

  const { dayOfWeek, schedule, substitutions } = scheduleData;

  const weeklySchedule: WeeklyTeacherPeriod[] = weeklyEntries.map((e) => ({
    id: e.id,
    dayOfWeek: e.dayOfWeek,
    periodName: e.periodTimeSlot.name,
    startTime: e.periodTimeSlot.startTime,
    endTime: e.periodTimeSlot.endTime,
    order: e.periodTimeSlot.order,
    isBreak: e.periodTimeSlot.isBreak,
    className: e.section.classGrade.name,
    sectionName: e.section.name,
    subjectName: e.subject?.name || 'Class',
    subjectCode: e.subject?.code || '',
    roomNumber: e.roomNumber,
  }));

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A] font-sans antialiased">
      {/* ==================================================================== */}
      {/* 1. TOP FACULTY PORTAL NAVIGATION HEADER                              */}
      {/* ==================================================================== */}
      <header className="sticky top-0 z-40 bg-[#0F172A] text-white border-b border-slate-800 shadow-xs">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#C2410C] flex items-center justify-center text-white shadow-xs font-bold text-sm">
              <Briefcase className="w-4 h-4" />
            </div>
            <div>
              <h1 className="text-sm font-bold leading-none text-white">
                Faculty Workspace
              </h1>
              <p className="text-xs text-slate-400 mt-1">
                Class Attendance & Daily Schedule
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex flex-col text-right">
              <span className="text-xs font-semibold leading-none text-white">
                {session.firstName} {session.lastName}
              </span>
              <span className="text-xs text-slate-400 mt-0.5">
                Faculty Member
              </span>
            </div>

            <form action={logoutAction}>
              <button
                type="submit"
                className="flex items-center gap-1.5 text-xs text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            </form>
          </div>
        </div>

        {/* Persistent Sub-Navigation Tabs */}
        <div className="border-t border-slate-800 bg-[#0B1324]">
          <div className="max-w-7xl mx-auto px-6 flex items-center gap-6 overflow-x-auto text-xs">
            <Link
              href="/teacher"
              className="py-3 font-semibold text-white border-b-2 border-[#C2410C] flex items-center gap-2 whitespace-nowrap"
            >
              <CalendarCheck className="w-3.5 h-3.5 text-[#C2410C]" />
              <span>Daily Attendance</span>
            </Link>

            <Link
              href="#schedule"
              className="py-3 font-medium text-slate-400 hover:text-slate-200 border-b-2 border-transparent flex items-center gap-2 whitespace-nowrap transition-colors"
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Class Timetable</span>
            </Link>

            <Link
              href="/admin/students"
              className="py-3 font-medium text-slate-400 hover:text-slate-200 border-b-2 border-transparent flex items-center gap-2 whitespace-nowrap transition-colors"
            >
              <Users className="w-3.5 h-3.5" />
              <span>Student Roster</span>
            </Link>

            <Link
              href="/admin/notices"
              className="py-3 font-medium text-slate-400 hover:text-slate-200 border-b-2 border-transparent flex items-center gap-2 whitespace-nowrap transition-colors"
            >
              <Megaphone className="w-3.5 h-3.5" />
              <span>Circulars</span>
            </Link>
          </div>
        </div>
      </header>

      {/* ==================================================================== */}
      {/* 2. MAIN TEACHER WORKSPACE                                            */}
      {/* ==================================================================== */}
      <main className="max-w-7xl mx-auto p-6 md:p-8 space-y-6">
        {/* Clean Page Title Strip */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200/80">
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              Class Attendance Register
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Welcome back, {session.firstName || 'Teacher'}. Record morning attendance for your assigned sections.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">
              {sections.length} Section{sections.length > 1 ? 's' : ''} Assigned
            </span>
          </div>
        </div>

        {/* Two-Column Responsive Layout: Register (60%), Schedule & Substitution (40%) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Main Column: Interactive Attendance Register */}
          <div className="lg:col-span-7 xl:col-span-8">
            <AttendanceRegister
              initialSections={sections}
              defaultSectionId={sections[0]?.id}
            />
          </div>

          {/* Right Column: Self-Attendance, Schedule & Substitution Alert Widget */}
          <div id="schedule" className="lg:col-span-5 xl:col-span-4 space-y-6">
            <TeacherSelfAttendance
              initialCheckInTime={todayAttendance?.checkInTime?.toISOString()}
              initialCheckOutTime={todayAttendance?.checkOutTime?.toISOString()}
            />

            <TodayScheduleWidget
              dayOfWeek={dayOfWeek}
              schedule={schedule}
              substitutions={substitutions}
            />

            <TeacherTimetableView
              todayDayOfWeek={dayOfWeek}
              todaySchedule={schedule}
              weeklySchedule={weeklySchedule}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
