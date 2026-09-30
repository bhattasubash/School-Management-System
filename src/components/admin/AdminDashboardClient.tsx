'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Users,
  GraduationCap,
  CalendarCheck,
  CreditCard,
  Plus,
  ArrowUpRight,
  Megaphone,
  ShieldCheck,
  CheckCircle2,
  Clock,
  ChevronRight,
  Send,
  X,
  AlertTriangle,
  UserCheck,
} from 'lucide-react';
import { publishNoticeAction, type PublishNoticeInput } from '@/actions/admin';

export interface AdminDashboardClientProps {
  schoolName: string;
  board: string;
  metrics: {
    totalStudents: number;
    totalTeachers: number;
    attendanceRate: number;
    submittedSectionsCount: number;
    totalSectionsCount: number;
    presentCount: number;
    totalFeeCollected: number;
    totalFeePending: number;
    totalFeeInvoiced: number;
    totalOverdueAmount: number;
    overdueCount: number;
    collectionPercentage: number;
    totalNotices: number;
    activeSubstitutions: number;
    pendingAdmissionsCount: number;
  };
  unsubmittedSections: Array<{
    id: string;
    name: string;
  }>;
  recentNotices: Array<{
    id: string;
    title: string;
    content: string;
    date: string;
    priority: string;
    targetAudience: string;
  }>;
  recentAuditLogs: Array<{
    id: string;
    action: string;
    entityType: string;
    timestamp: string;
    ipAddress?: string | null;
    userName: string;
  }>;
  classSections: Array<{
    id: string;
    className: string;
    sectionName: string;
    studentCount: number;
    classTeacherName: string;
    isSubmittedToday: boolean;
  }>;
}

export default function AdminDashboardClient({
  schoolName,
  board,
  metrics,
  unsubmittedSections,
  recentNotices,
  recentAuditLogs,
  classSections,
}: AdminDashboardClientProps) {
  const [isNoticeModalOpen, setIsNoticeModalOpen] = useState(false);
  const [noticeForm, setNoticeForm] = useState<PublishNoticeInput>({
    title: '',
    content: '',
    priority: 'NORMAL',
    targetAudience: 'ALL',
  });
  const [isSubmittingNotice, setIsSubmittingNotice] = useState(false);
  const [noticeFeedback, setNoticeFeedback] = useState<{
    success?: boolean;
    message?: string;
  } | null>(null);

  const handlePublishNotice = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingNotice(true);
    setNoticeFeedback(null);

    const res = await publishNoticeAction(noticeForm);
    setIsSubmittingNotice(false);

    if (res.success) {
      setNoticeFeedback({ success: true, message: 'Circular published successfully.' });
      setTimeout(() => {
        setIsNoticeModalOpen(false);
        setNoticeFeedback(null);
        setNoticeForm({ title: '', content: '', priority: 'NORMAL', targetAudience: 'ALL' });
      }, 1000);
    } else {
      setNoticeFeedback({ success: false, message: res.error || 'Failed to publish circular.' });
    }
  };

  const hasExceptions =
    unsubmittedSections.length > 0 ||
    metrics.overdueCount > 0 ||
    metrics.activeSubstitutions > 0 ||
    metrics.pendingAdmissionsCount > 0;

  return (
    <div className="space-y-6">
      {/* 1. CLEAN 56-72PX PAGE HEADER WITH SINGLE PRIMARY ACTION */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              {schoolName}
            </h1>
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
              {board}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Operational Overview • Academic Year 2026-27
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsNoticeModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#C2410C] hover:bg-[#9A3412] text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer self-start sm:self-center"
        >
          <Plus className="w-4 h-4" />
          <span>New Circular</span>
        </button>
      </div>

      {/* 2. REAL-DATA "NEEDS ATTENTION" STRIP */}
      {hasExceptions ? (
        <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-4 shadow-xs space-y-2.5">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0" />
            <h2 className="text-xs font-bold text-amber-900 uppercase tracking-wider">
              Needs Attention Today
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 pt-1">
            {/* Exception 1: Attendance not submitted */}
            {unsubmittedSections.length > 0 ? (
              <div className="p-3 bg-white rounded-lg border border-amber-200 text-xs space-y-1">
                <span className="font-semibold text-slate-700 block">Attendance Pending</span>
                <p className="text-amber-800 font-medium">
                  {unsubmittedSections.map((s) => s.name).join(', ')}
                </p>
                <Link
                  href="/teacher"
                  className="text-xs font-semibold text-[#C2410C] hover:underline inline-block pt-0.5"
                >
                  Open Register →
                </Link>
              </div>
            ) : null}

            {/* Exception 2: Overdue fees */}
            {metrics.overdueCount > 0 ? (
              <div className="p-3 bg-white rounded-lg border border-amber-200 text-xs space-y-1">
                <span className="font-semibold text-slate-700 block">Overdue Fees</span>
                <p className="text-red-700 font-bold">
                  ₹{metrics.totalOverdueAmount.toLocaleString('en-IN')}
                </p>
                <span className="text-slate-500 block">
                  {metrics.overdueCount} account{metrics.overdueCount > 1 ? 's' : ''} past due date
                </span>
              </div>
            ) : null}

            {/* Exception 3: Active substitutions needing cover */}
            {metrics.activeSubstitutions > 0 ? (
              <div className="p-3 bg-white rounded-lg border border-amber-200 text-xs space-y-1">
                <span className="font-semibold text-slate-700 block">Active Staff Cover</span>
                <p className="text-slate-900 font-medium">
                  {metrics.activeSubstitutions} class period{metrics.activeSubstitutions > 1 ? 's' : ''} covered today
                </p>
                <Link
                  href="/teacher#schedule"
                  className="text-xs font-semibold text-[#C2410C] hover:underline inline-block pt-0.5"
                >
                  View Cover Details →
                </Link>
              </div>
            ) : null}

            {/* Exception 4: Pending admissions intake */}
            {metrics.pendingAdmissionsCount > 0 ? (
              <div className="p-3 bg-white rounded-lg border border-amber-200 text-xs space-y-1">
                <span className="font-semibold text-slate-700 block">Admissions Intake</span>
                <p className="text-slate-900 font-medium">
                  {metrics.pendingAdmissionsCount} application{metrics.pendingAdmissionsCount > 1 ? 's' : ''} awaiting review
                </p>
                <Link
                  href="/admin/admissions"
                  className="text-xs font-semibold text-[#C2410C] hover:underline inline-block pt-0.5"
                >
                  Review Applications →
                </Link>
              </div>
            ) : null}
          </div>
        </div>
      ) : (
        <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs text-slate-600">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span className="font-semibold text-slate-800">All Operations Normal</span>
            <span className="text-slate-400">•</span>
            <span>All morning attendance submitted, no unresolved cover alerts</span>
          </div>
          <span className="text-slate-400 font-mono text-xs">Updated just now</span>
        </div>
      )}

      {/* 3. EXECUTIVE KPI CARDS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Enrolled Students */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Enrolled Students
            </span>
            <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>

          <div className="mt-4">
            <div className="text-2xl font-bold text-slate-900">
              {metrics.totalStudents}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Active student directory
            </p>
          </div>
        </div>

        {/* Card 2: Faculty Staff */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Teaching Staff
            </span>
            <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center">
              <GraduationCap className="w-4 h-4" />
            </div>
          </div>

          <div className="mt-4">
            <div className="text-2xl font-bold text-slate-900">
              {metrics.totalTeachers}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Teaching & faculty members
            </p>
          </div>
        </div>

        {/* Card 3: Today's Attendance */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Today's Attendance
            </span>
            <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center">
              <CalendarCheck className="w-4 h-4" />
            </div>
          </div>

          <div className="mt-4">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-slate-900">
                {metrics.submittedSectionsCount}/{metrics.totalSectionsCount}
              </span>
              <span className="text-xs text-slate-500 font-medium">Sections</span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {metrics.attendanceRate}% present in marked sections
            </p>
          </div>
        </div>

        {/* Card 4: Fee Revenue Progress */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Fee Collections
            </span>
            <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>

          <div className="mt-4">
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-bold text-slate-900">
                ₹{metrics.totalFeeCollected.toLocaleString('en-IN')}
              </span>
            </div>
            <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2 overflow-hidden">
              <div
                className="bg-emerald-600 h-full rounded-full"
                style={{ width: `${Math.min(100, metrics.collectionPercentage)}%` }}
              />
            </div>
            <p className="text-xs text-slate-500 mt-1.5">
              {metrics.collectionPercentage}% of total invoiced
            </p>
          </div>
        </div>
      </div>

      {/* 4. SCALABLE CLASSES & SECTIONS TABLE */}
      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-900">
              Classes & Daily Attendance Status
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Morning register submission tracking across class sections
            </p>
          </div>

          <Link
            href="/admin/students"
            className="text-xs font-semibold text-[#C2410C] hover:underline flex items-center gap-1"
          >
            <span>View Student Directory</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 uppercase font-semibold text-xs">
                <th className="py-2.5 pl-2">Class & Section</th>
                <th className="py-2.5 px-3">Class Teacher</th>
                <th className="py-2.5 px-3">Students</th>
                <th className="py-2.5 px-3">Today's Attendance</th>
                <th className="py-2.5 pr-2 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {classSections.map((sec) => (
                <tr key={sec.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3 pl-2">
                    <span className="font-bold text-slate-900">
                      {sec.className} - {sec.sectionName}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-slate-700 font-medium">
                    {sec.classTeacherName}
                  </td>
                  <td className="py-3 px-3 text-slate-800 font-semibold">
                    {sec.studentCount}
                  </td>
                  <td className="py-3 px-3">
                    {sec.isSubmittedToday ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 font-semibold text-xs">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        Submitted
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 font-semibold text-xs">
                        <Clock className="w-3 h-3 text-amber-600" />
                        Pending
                      </span>
                    )}
                  </td>
                  <td className="py-3 pr-2 text-right">
                    <Link
                      href="/teacher"
                      className="text-xs font-semibold text-[#C2410C] hover:underline"
                    >
                      {sec.isSubmittedToday ? 'View Register' : 'Record'}
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. BOTTOM DUAL PANELS: Circulars & Operational Audit */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Left (6 cols): Circulars */}
        <div className="lg:col-span-6 bg-white rounded-xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Megaphone className="w-4 h-4 text-slate-700" />
                <h3 className="text-sm font-bold text-slate-900">
                  Institutional Circulars ({recentNotices.length})
                </h3>
              </div>

              <Link
                href="/admin/notices"
                className="text-xs font-semibold text-[#C2410C] hover:underline"
              >
                View all →
              </Link>
            </div>

            <div className="divide-y divide-slate-100">
              {recentNotices.length === 0 ? (
                <p className="text-xs text-slate-400 py-6 text-center">No circulars published yet.</p>
              ) : (
                recentNotices.slice(0, 4).map((notice) => (
                  <div key={notice.id} className="py-2.5 flex items-start justify-between gap-3">
                    <div className="min-w-0 pr-2">
                      <p className="text-xs font-semibold text-slate-900 truncate">
                        {notice.title}
                      </p>
                      <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">
                        {notice.content}
                      </p>
                    </div>
                    <div className="flex flex-col items-end shrink-0">
                      {notice.priority !== 'NORMAL' && (
                        <span
                          className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                            notice.priority === 'URGENT'
                              ? 'bg-red-50 text-red-700 border border-red-200'
                              : 'bg-amber-50 text-amber-800 border border-amber-200'
                          }`}
                        >
                          {notice.priority}
                        </span>
                      )}
                      <span className="text-xs text-slate-400 mt-0.5">
                        {notice.date}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right (6 cols): Operational Audit */}
        <div className="lg:col-span-6 bg-white rounded-xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-slate-700" />
                <h3 className="text-sm font-bold text-slate-900">
                  Operational Activity Log
                </h3>
              </div>

              <Link
                href="/admin/audit"
                className="text-xs font-semibold text-[#C2410C] hover:underline"
              >
                View full audit →
              </Link>
            </div>

            <div className="divide-y divide-slate-100">
              {recentAuditLogs.length === 0 ? (
                <p className="text-xs text-slate-400 py-6 text-center">No recent administrative events.</p>
              ) : (
                recentAuditLogs.slice(0, 4).map((log) => (
                  <div key={log.id} className="py-2.5 flex items-center justify-between text-xs">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-800">
                          {log.action}
                        </span>
                        <span className="text-slate-400">•</span>
                        <span className="text-slate-600">
                          {log.userName}
                        </span>
                      </div>
                      {log.ipAddress && (
                        <span className="text-xs text-slate-400 font-mono">
                          {log.ipAddress}
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-slate-400 shrink-0">
                      {log.timestamp}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 6. PUBLISH CIRCULAR MODAL */}
      {isNoticeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-xl border border-slate-200">
            <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Megaphone className="w-4 h-4 text-[#C2410C]" />
                <h3 className="text-sm font-bold text-slate-900">Publish Official Circular</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsNoticeModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handlePublishNotice} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Circular Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Winter Vacation Timetable"
                  value={noticeForm.title}
                  onChange={(e) => setNoticeForm({ ...noticeForm, title: e.target.value })}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:border-[#C2410C] focus:outline-none transition-colors"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Priority</label>
                  <select
                    value={noticeForm.priority}
                    onChange={(e) =>
                      setNoticeForm({ ...noticeForm, priority: e.target.value as any })
                    }
                    className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:border-[#C2410C] focus:outline-none"
                  >
                    <option value="NORMAL">Normal</option>
                    <option value="IMPORTANT">Important</option>
                    <option value="URGENT">Urgent</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Audience</label>
                  <select
                    value={noticeForm.targetAudience}
                    onChange={(e) =>
                      setNoticeForm({ ...noticeForm, targetAudience: e.target.value as any })
                    }
                    className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:border-[#C2410C] focus:outline-none"
                  >
                    <option value="ALL">All (School-Wide)</option>
                    <option value="PARENTS">Parents Only</option>
                    <option value="TEACHERS">Teachers Only</option>
                    <option value="STUDENTS">Students Only</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Circular Details *
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Enter the official notification details..."
                  value={noticeForm.content}
                  onChange={(e) => setNoticeForm({ ...noticeForm, content: e.target.value })}
                  className="w-full text-xs p-3 rounded-lg border border-slate-300 focus:border-[#C2410C] focus:outline-none"
                />
              </div>

              {noticeFeedback && (
                <div
                  className={`p-3 rounded-lg text-xs font-medium ${
                    noticeFeedback.success
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      : 'bg-red-50 text-red-800 border border-red-200'
                  }`}
                >
                  {noticeFeedback.message}
                </div>
              )}

              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsNoticeModalOpen(false)}
                  className="px-3.5 py-2 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingNotice}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold text-white bg-[#C2410C] hover:bg-[#9A3412] disabled:opacity-50 transition-colors shadow-xs cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isSubmittingNotice ? 'Publishing...' : 'Publish'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
