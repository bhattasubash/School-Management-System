'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Bell,
  Search,
  ChevronDown,
  Calendar,
  Clock,
  BookOpen,
  MessageSquare,
  FileText,
  Phone,
  Mail,
  GraduationCap,
  ShieldCheck,
  Megaphone,
  Compass,
  Bus,
  FileCheck2,
  LogOut,
  Check,
  UserCheck,
  AlertCircle,
  ExternalLink,
  CreditCard,
  Award,
  Layers,
  MapPin,
  ChevronRight,
} from 'lucide-react';
import { logoutAction } from '@/actions/auth';
import StudentAttendanceSection from './StudentAttendanceSection';

export interface ChildOption {
  id: string;
  name: string;
  rollNumber: number | null;
  admissionNumber: string;
  className: string;
  sectionName: string;
  isPrimary: boolean;
}

export interface StudentDashboardProps {
  student: {
    id: string;
    name: string;
    admissionNumber: string;
    rollNumber: number | null;
    sectionName: string;
    className: string;
    board: string;
    batchYear: string;
    avatarUrl?: string | null;
  };
  parentContext?: {
    isParentView: boolean;
    parentName: string;
    relationship: string;
    children: ChildOption[];
  };
  stats: {
    attendancePercentage: number;
    totalClasses: number;
    presentClasses: number;
    cgpa: number;
    feeStatus: {
      isOverdue: boolean;
      pendingAmount: number;
      nextDueDate: string;
      totalPaid: number;
      statusText: string;
    };
    counts: {
      happenings: number;
      messages: number;
      assignments: number;
      events: number;
    };
  };
  subjects: Array<{
    code: string;
    percent: number;
    name: string;
  }>;
  todaySchedule: Array<{
    type: string;
    subject: string;
    code: string;
    room: string;
    section: string;
    teacher: string;
    time: string;
    isSubstitute?: boolean;
  }>;
  notices: Array<{
    id: string;
    title: string;
    date: string;
    category: string;
    priority: string;
  }>;
  faculty: Array<{
    roleBadge: string;
    name: string;
    designation: string;
    department: string;
    email: string;
    phone: string;
  }>;
}

export default function StudentParentDashboardClient({
  student,
  parentContext,
  stats,
  subjects,
  todaySchedule,
  notices,
  faculty,
}: StudentDashboardProps) {
  const router = useRouter();
  const [siblingDropdownOpen, setSiblingDropdownOpen] = useState(false);
  const [activeAnnouncementTab, setActiveAnnouncementTab] = useState<string>('All');
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleSignOut = async () => {
    setIsLoggingOut(true);
    await logoutAction();
  };

  const filteredNotices = notices.filter(
    (n) => activeAnnouncementTab === 'All' || n.category.toLowerCase() === activeAnnouncementTab.toLowerCase()
  );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans antialiased selection:bg-[#C2410C]/10 selection:text-[#C2410C]">
      {/* ==================================================================== */}
      {/* 1. TOP GLOBAL NAVIGATION                                             */}
      {/* ==================================================================== */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-2xs">
        {/* Tier 1: Institution Brand + Sibling Switcher + User Context */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Left: School Identity */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#C2410C] text-white flex items-center justify-center font-bold text-lg shadow-2xs shrink-0">
              DPS
            </div>
            <div>
              <span className="text-sm font-bold tracking-tight text-slate-900 block leading-tight">
                Delhi Public School
              </span>
              <span className="text-[11px] font-medium text-slate-500 block leading-tight">
                CBSE Affiliated • {parentContext?.isParentView ? 'Parent Portal' : 'Student Portal'}
              </span>
            </div>
          </div>

          {/* Right: Sibling Switcher + Notifications + User Menu */}
          <div className="flex items-center gap-3">
            {/* PARENT MULTI-CHILD SIBLING SWITCHER */}
            {parentContext?.isParentView && parentContext.children.length > 0 && (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setSiblingDropdownOpen(!siblingDropdownOpen)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-orange-50 border border-orange-200 text-[#C2410C] hover:bg-orange-100 transition-colors text-xs font-semibold"
                >
                  <UserCheck className="w-3.5 h-3.5 text-[#C2410C]" />
                  <span className="hidden sm:inline text-slate-700">Child:</span>
                  <span className="max-w-[120px] truncate">{student.name}</span>
                  <span className="text-[11px] px-1.5 py-0.5 bg-[#C2410C] text-white rounded font-medium">
                    {student.className}-{student.sectionName}
                  </span>
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform ${siblingDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {siblingDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-lg border border-slate-200 py-2 z-50 animate-in fade-in duration-150">
                    <div className="px-4 py-2 border-b border-slate-100">
                      <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                        Linked Children ({parentContext.children.length})
                      </p>
                      <p className="text-xs text-slate-800 font-medium mt-0.5">
                        {parentContext.parentName} ({parentContext.relationship})
                      </p>
                    </div>

                    <div className="py-1">
                      {parentContext.children.map((child) => {
                        const isCurrent = child.id === student.id;
                        return (
                          <button
                            key={child.id}
                            type="button"
                            onClick={() => {
                              router.push(`/?child=${child.id}`);
                              setSiblingDropdownOpen(false);
                            }}
                            className={`w-full text-left px-4 py-2.5 flex items-center justify-between text-xs transition-colors ${
                              isCurrent ? 'bg-orange-50 text-[#C2410C] font-semibold' : 'text-slate-700 hover:bg-slate-50'
                            }`}
                          >
                            <div>
                              <div className="flex items-center gap-1.5">
                                <span>{child.name}</span>
                                {child.isPrimary && (
                                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-medium">
                                    Primary
                                  </span>
                                )}
                              </div>
                              <p className="text-[11px] text-slate-500 mt-0.5">
                                Class {child.className}-{child.sectionName} • Roll {child.rollNumber || '-'} • Adm {child.admissionNumber}
                              </p>
                            </div>
                            {isCurrent && <Check className="w-4 h-4 text-[#C2410C] shrink-0" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Quick Search */}
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100 text-slate-600 text-xs w-48 border border-transparent focus-within:border-slate-300 focus-within:bg-white transition-all">
              <Search className="w-3.5 h-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search portal..."
                className="bg-transparent border-none outline-none w-full text-xs text-slate-800 placeholder:text-slate-400"
              />
            </div>

            {/* Notifications */}
            <button
              type="button"
              aria-label="Notifications"
              className="relative p-2 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <Bell className="w-4 h-4" />
              {notices.length > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#C2410C]" />
              )}
            </button>

            {/* User Profile & Sign Out */}
            <div className="flex items-center gap-3 pl-3 border-l border-slate-200">
              <div className="w-8 h-8 rounded-full bg-slate-200 border border-slate-300 overflow-hidden shrink-0 flex items-center justify-center font-bold text-xs text-slate-700">
                {student.name.charAt(0)}
              </div>
              <div className="hidden lg:flex flex-col text-left">
                <span className="text-xs font-semibold text-slate-900 leading-tight">
                  {parentContext?.isParentView ? parentContext.parentName : student.name}
                </span>
                <span className="text-[11px] text-slate-500 leading-tight">
                  {student.className}-{student.sectionName} • Roll {student.rollNumber || '-'}
                </span>
              </div>
              <button
                type="button"
                onClick={handleSignOut}
                disabled={isLoggingOut}
                className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Tier 2: Category Navigation Strip */}
        <div className="border-t border-slate-100 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-10 flex items-center justify-between text-xs font-medium text-slate-600">
            <div className="flex items-center gap-6 overflow-x-auto no-scrollbar py-1">
              <span className="text-[#C2410C] font-semibold border-b-2 border-[#C2410C] py-2">
                Overview
              </span>
              <span className="hover:text-slate-900 cursor-pointer transition-colors py-2">
                Timetable
              </span>
              <span className="hover:text-slate-900 cursor-pointer transition-colors py-2">
                Academic Results
              </span>
              <span className="hover:text-slate-900 cursor-pointer transition-colors py-2">
                Fee Records
              </span>
              <span className="hover:text-slate-900 cursor-pointer transition-colors py-2">
                Circulars
              </span>
              <span className="hover:text-slate-900 cursor-pointer transition-colors py-2">
                Faculty Directory
              </span>
            </div>
            <div className="hidden sm:flex items-center gap-2 text-slate-500 text-[11px]">
              <span>Academic Year 2026-27</span>
              <span>•</span>
              <span className="font-medium text-emerald-600">Term 1 Active</span>
            </div>
          </div>
        </div>
      </header>

      {/* ==================================================================== */}
      {/* 2. MAIN BODY                                                         */}
      {/* ==================================================================== */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Student Identity Card + Quick Stat Strip */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-orange-50 border border-orange-200 text-[#C2410C] flex items-center justify-center font-bold text-xl shrink-0">
              {student.name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-lg font-bold text-slate-900">{student.name}</h1>
                <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 text-slate-700">
                  Class {student.className}-{student.sectionName}
                </span>
                <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-600">
                  Roll {student.rollNumber || '-'}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Admission No: <span className="font-semibold text-slate-700">{student.admissionNumber}</span> • Board:{' '}
                <span className="font-semibold text-slate-700">{student.board}</span> • Batch Year:{' '}
                <span className="font-semibold text-slate-700">{student.batchYear}</span>
              </p>
            </div>
          </div>

          {/* Action Links */}
          <div className="flex items-center gap-3 pt-3 md:pt-0 border-t md:border-t-0 border-slate-100">
            <button
              type="button"
              className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-slate-700 bg-slate-50 border border-slate-300 hover:bg-slate-100 transition-colors"
            >
              Request Leave
            </button>
            <button
              type="button"
              className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-slate-700 bg-slate-50 border border-slate-300 hover:bg-slate-100 transition-colors"
            >
              Contact Mentor
            </button>
          </div>
        </div>

        {/* 4 Neutral Summary Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
            <div className="flex items-center justify-between text-slate-500 mb-1">
              <span className="text-xs font-medium">Pending Tasks</span>
              <FileText className="w-4 h-4 text-slate-400" />
            </div>
            <div className="text-2xl font-bold text-slate-900">{stats.counts.assignments}</div>
            <p className="text-[11px] text-slate-500 mt-0.5">2 due by this Friday</p>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
            <div className="flex items-center justify-between text-slate-500 mb-1">
              <span className="text-xs font-medium">Messages & Notes</span>
              <MessageSquare className="w-4 h-4 text-slate-400" />
            </div>
            <div className="text-2xl font-bold text-slate-900">{stats.counts.messages}</div>
            <p className="text-[11px] text-slate-500 mt-0.5">3 unread from faculty</p>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
            <div className="flex items-center justify-between text-slate-500 mb-1">
              <span className="text-xs font-medium">Active Circulars</span>
              <Megaphone className="w-4 h-4 text-slate-400" />
            </div>
            <div className="text-2xl font-bold text-slate-900">{notices.length}</div>
            <p className="text-[11px] text-slate-500 mt-0.5">1 urgent exam notice</p>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
            <div className="flex items-center justify-between text-slate-500 mb-1">
              <span className="text-xs font-medium">School Events</span>
              <Calendar className="w-4 h-4 text-slate-400" />
            </div>
            <div className="text-2xl font-bold text-slate-900">{stats.counts.events}</div>
            <p className="text-[11px] text-slate-500 mt-0.5">Pre-Board & Sports Trial</p>
          </div>
        </div>

        {/* 2-Column Dashboard Grid: 8 Columns Left, 4 Columns Right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* ================================================================ */}
          {/* LEFT COLUMN (8 COLS): Timetable, Academic Progress, Circulars   */}
          {/* ================================================================ */}
          <div className="lg:col-span-8 space-y-6">
            {/* 1. Today's Academic Timetable */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-bold text-slate-900">Today's Class Timetable</h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {new Date().toLocaleDateString('en-IN', {
                      weekday: 'long',
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </p>
                </div>
                <span className="text-xs font-semibold px-2.5 py-1 rounded bg-slate-100 text-slate-700">
                  {todaySchedule.length} Periods Scheduled
                </span>
              </div>

              {/* Timetable Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                    <tr>
                      <th className="py-2.5 px-4 w-32">Time Slot</th>
                      <th className="py-2.5 px-4">Subject & Details</th>
                      <th className="py-2.5 px-4">Room & Section</th>
                      <th className="py-2.5 px-4">Faculty</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {todaySchedule.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="py-8 text-center text-slate-500">
                          No timetable entries scheduled for today.
                        </td>
                      </tr>
                    ) : (
                      todaySchedule.map((row, idx) => (
                        <tr
                          key={idx}
                          className={`hover:bg-slate-50/80 transition-colors ${
                            row.isSubstitute ? 'bg-amber-50/30' : ''
                          }`}
                        >
                          <td className="py-3 px-4 font-semibold text-slate-900 whitespace-nowrap">
                            <div className="flex items-center gap-1.5">
                              <Clock className="w-3.5 h-3.5 text-slate-400" />
                              <span>{row.time}</span>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-bold text-slate-900">{row.subject}</span>
                              <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-medium text-[10px]">
                                {row.code}
                              </span>
                              <span
                                className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                                  row.type === 'Practical'
                                    ? 'bg-purple-50 text-purple-700 border border-purple-200'
                                    : 'bg-blue-50 text-blue-700 border border-blue-200'
                                }`}
                              >
                                {row.type}
                              </span>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-slate-600 whitespace-nowrap">
                            <div className="flex items-center gap-1.5">
                              <MapPin className="w-3.5 h-3.5 text-slate-400" />
                              <span>{row.room}</span>
                              <span className="text-slate-400">({row.section})</span>
                            </div>
                          </td>
                          <td className="py-3 px-4 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-slate-800">{row.teacher}</span>
                              {row.isSubstitute && (
                                <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-amber-100 text-amber-800">
                                  Cover
                                </span>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* 2. Full Attendance View (Donut, Subject Pills, Monthly Dot Calendar) */}
            <StudentAttendanceSection
              studentId={student.id}
              initialPercentage={stats.attendancePercentage}
            />

            {/* 3. Subject Performance (Term 1 Scores) */}
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-sm font-bold text-slate-900">Academic Subject Performance</h2>
                  <p className="text-xs text-slate-500 mt-0.5">Term 1 Assessment & Lab Work</p>
                </div>
                <span className="text-xs text-slate-500 font-medium">5 Subjects Evaluated</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {subjects.map((subj) => (
                  <div
                    key={subj.code}
                    className="p-3.5 rounded-lg border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="font-bold text-slate-900 truncate">{subj.name}</span>
                      <span className="font-bold text-slate-900 ml-2">{subj.percent}%</span>
                    </div>
                    <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          subj.percent >= 85
                            ? 'bg-emerald-500'
                            : subj.percent >= 70
                            ? 'bg-blue-500'
                            : 'bg-amber-500'
                        }`}
                        style={{ width: `${subj.percent}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-slate-500 mt-1.5">
                      <span>{subj.code}</span>
                      <span>{subj.percent >= 90 ? 'Grade A1' : subj.percent >= 80 ? 'Grade A2' : 'Grade B1'}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 3. Institutional Circulars & Notices */}
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-sm font-bold text-slate-900">Institutional Notices & Circulars</h2>
                  <p className="text-xs text-slate-500 mt-0.5">Official communications from school administration</p>
                </div>
                <Megaphone className="w-4 h-4 text-slate-400" />
              </div>

              {/* Category Filter Tabs */}
              <div className="flex items-center gap-2 border-b border-slate-100 pb-2 mb-3 overflow-x-auto text-xs">
                {['All', 'Academic', 'Examination', 'Co-Curricular', 'Administrative'].map((tab) => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setActiveAnnouncementTab(tab)}
                    className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                      activeAnnouncementTab === tab
                        ? 'bg-[#C2410C] text-white font-semibold'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {/* Notices List */}
              <div className="divide-y divide-slate-100">
                {filteredNotices.length === 0 ? (
                  <div className="py-6 text-center text-xs text-slate-500">
                    No active circulars under this category.
                  </div>
                ) : (
                  filteredNotices.map((notice) => (
                    <div
                      key={notice.id}
                      className="py-3 flex items-start justify-between gap-4 hover:bg-slate-50/60 transition-colors rounded px-2 -mx-2"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-semibold text-slate-900 leading-snug">
                            {notice.title}
                          </span>
                          {notice.priority === 'URGENT' && (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-700">
                              Urgent
                            </span>
                          )}
                          {notice.priority === 'IMPORTANT' && (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">
                              Important
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-3 text-[11px] text-slate-500 mt-1">
                          <span>{notice.category}</span>
                          <span>•</span>
                          <span>{notice.date}</span>
                        </div>
                      </div>
                      <button
                        type="button"
                        className="text-xs font-medium text-[#C2410C] hover:underline shrink-0 flex items-center gap-1"
                      >
                        <span>View</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* ================================================================ */}
          {/* RIGHT COLUMN (4 COLS): Academic Standing, Fee Card, Quick Links  */}
          {/* ================================================================ */}
          <div className="lg:col-span-4 space-y-6">
            {/* 1. Academic Standing & Attendance Card */}
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
              <h2 className="text-sm font-bold text-slate-900">Academic Standing</h2>

              {/* Attendance Block */}
              <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200">
                <div className="flex items-center justify-between text-xs text-slate-600 mb-1">
                  <span className="font-semibold">Overall Attendance</span>
                  <span className="font-bold text-slate-900">{stats.attendancePercentage}%</span>
                </div>
                <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      stats.attendancePercentage >= 75 ? 'bg-emerald-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${Math.min(100, stats.attendancePercentage)}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-500 mt-2">
                  <span>{stats.presentClasses} of {stats.totalClasses} sessions attended</span>
                  <span className="text-emerald-700 font-semibold">Eligible (≥75%)</span>
                </div>
              </div>

              {/* CGPA Block */}
              <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200">
                <div className="flex items-center justify-between text-xs text-slate-600 mb-1">
                  <span className="font-semibold">Cumulative GPA</span>
                  <span className="font-bold text-slate-900">{stats.cgpa.toFixed(2)} / 10.0</span>
                </div>
                <p className="text-[11px] text-slate-500">
                  Performance ranks in top 5% of Class {student.className}-{student.sectionName}.
                </p>
              </div>
            </div>

            {/* 2. Outstanding Fee Summary Card */}
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Fee Balance
                </span>
                <span
                  className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                    stats.feeStatus.pendingAmount > 0
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-emerald-100 text-emerald-800'
                  }`}
                >
                  {stats.feeStatus.statusText}
                </span>
              </div>

              <div className="mb-4">
                <div className="text-2xl font-bold text-slate-900">
                  {stats.feeStatus.pendingAmount > 0
                    ? `₹${stats.feeStatus.pendingAmount.toLocaleString('en-IN')}`
                    : 'Nil Due'}
                </div>
                <p className="text-xs text-slate-500 mt-1">{stats.feeStatus.nextDueDate}</p>
              </div>

              <button
                type="button"
                disabled={stats.feeStatus.pendingAmount === 0}
                className={`w-full py-2.5 px-4 rounded-lg text-xs font-bold transition-colors ${
                  stats.feeStatus.pendingAmount > 0
                    ? 'bg-[#C2410C] hover:bg-[#9A3412] text-white shadow-2xs'
                    : 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                }`}
              >
                {stats.feeStatus.pendingAmount > 0 ? 'Pay Outstanding Fee' : 'All Dues Cleared'}
              </button>
            </div>

            {/* 3. Quick Institutional Utilities */}
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
              <h2 className="text-sm font-bold text-slate-900 mb-3">School Services</h2>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {[
                  { label: 'Syllabus 2026', icon: BookOpen },
                  { label: 'School Diary', icon: Layers },
                  { label: 'Exam Rules', icon: FileCheck2 },
                  { label: 'Holiday List', icon: Calendar },
                  { label: 'Bus Routes', icon: Bus },
                  { label: 'Leave Portal', icon: ShieldCheck },
                ].map((item, idx) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={idx}
                      type="button"
                      className="p-2.5 rounded-lg border border-slate-200 bg-slate-50/50 hover:bg-slate-100 text-slate-800 font-medium flex items-center gap-2 transition-colors text-left"
                    >
                      <Icon className="w-4 h-4 text-slate-500 shrink-0" />
                      <span className="truncate">{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 4. Key Faculty Contacts */}
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
              <h2 className="text-sm font-bold text-slate-900 mb-3">Faculty & Authorities</h2>
              <div className="space-y-3">
                {faculty.map((person, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-lg border border-slate-100 bg-slate-50/40 text-xs"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-bold text-slate-900">{person.name}</span>
                      <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 truncate max-w-[120px]">
                        {person.roleBadge}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">{person.designation}</p>
                    <div className="flex items-center gap-3 mt-2 text-[11px] text-slate-600">
                      <a
                        href={`mailto:${person.email}`}
                        className="flex items-center gap-1 text-[#C2410C] hover:underline"
                      >
                        <Mail className="w-3 h-3" />
                        <span>Email</span>
                      </a>
                      <a
                        href={`tel:${person.phone}`}
                        className="flex items-center gap-1 text-slate-600 hover:underline"
                      >
                        <Phone className="w-3 h-3" />
                        <span>{person.phone}</span>
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
