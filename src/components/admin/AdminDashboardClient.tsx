'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Users,
  GraduationCap,
  CalendarCheck,
  CreditCard,
  PlusCircle,
  ArrowUpRight,
  TrendingUp,
  Megaphone,
  ShieldCheck,
  CheckCircle2,
  Clock,
  ChevronRight,
  Sparkles,
  BookOpen,
  Send,
  X,
  AlertTriangle,
} from 'lucide-react';
import { publishNoticeAction, type PublishNoticeInput } from '@/actions/admin';

export interface AdminDashboardClientProps {
  metrics: {
    totalStudents: number;
    totalTeachers: number;
    attendanceRate: number;
    presentCount: number;
    totalFeeCollected: number;
    totalFeePending: number;
    totalFeeInvoiced: number;
    collectionPercentage: number;
    totalNotices: number;
    activeSubstitutions: number;
  };
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
  }>;
}

export default function AdminDashboardClient({
  metrics,
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
      setNoticeFeedback({ success: true, message: 'Circular published successfully!' });
      setTimeout(() => {
        setIsNoticeModalOpen(false);
        setNoticeFeedback(null);
        setNoticeForm({ title: '', content: '', priority: 'NORMAL', targetAudience: 'ALL' });
      }, 1200);
    } else {
      setNoticeFeedback({ success: false, message: res.error || 'Failed to publish notice.' });
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. HERO OPERATIONAL WELCOME BANNER */}
      <div className="bg-gradient-to-r from-[#111C2D] via-[#1a2942] to-[#111C2D] text-white rounded-3xl p-6 md:p-8 shadow-lg relative overflow-hidden">
        {/* Coral decorative gradient shape */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-[#FF7555]/20 to-transparent rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-extrabold uppercase tracking-widest bg-[#FF7555] text-white px-2.5 py-0.5 rounded-full shadow-xs">
                Delhi Public School • Main Campus
              </span>
              <span className="text-xs text-slate-400 font-medium">
                Academic Year 2026-27
              </span>
            </div>

            <h1 className="text-2xl md:text-3xl font-black tracking-tight mt-2.5 text-white">
              Institutional Operations Command Center
            </h1>
            <p className="text-xs md:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
              Real-time synchronization across Student records, Class 10-A attendance registers, CBSE compliance, and quarterly fee collections.
            </p>
          </div>

          {/* Quick Action Pill Buttons */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              onClick={() => setIsNoticeModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#FF7555] hover:bg-[#e05e3f] text-white text-xs font-bold transition-all shadow-md shadow-[#FF7555]/20 cursor-pointer"
            >
              <Megaphone className="w-4 h-4" />
              <span>Publish Circular</span>
            </button>

            <Link
              href="/admin/fees"
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition-all border border-white/10"
            >
              <CreditCard className="w-4 h-4 text-[#FF7555]" />
              <span>Fee Counter</span>
            </Link>

            <Link
              href="/admin/students"
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition-all border border-white/10"
            >
              <Users className="w-4 h-4 text-emerald-400" />
              <span>Roster View</span>
            </Link>
          </div>
        </div>
      </div>

      {/* 2. EXECUTIVE LIVE KPI CARDS (4 Cards Grid) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
        {/* Card 1: Total Enrolled Students */}
        <div className="bg-white rounded-2xl p-5 border border-[#EBF0F5] shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Enrolled Students
            </span>
            <div className="w-9 h-9 rounded-xl bg-[#FFF2EE] text-[#FF7555] flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>

          <div className="mt-4">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-[#111C2D]">
                {metrics.totalStudents}
              </span>
              <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                100% Active
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1 font-medium">
              Class 10-A • Secondary Wing
            </p>
          </div>
        </div>

        {/* Card 2: Faculty & Staff */}
        <div className="bg-white rounded-2xl p-5 border border-[#EBF0F5] shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Teaching Staff
            </span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <GraduationCap className="w-4 h-4" />
            </div>
          </div>

          <div className="mt-4">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-[#111C2D]">
                {metrics.totalTeachers}
              </span>
              <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
                {metrics.activeSubstitutions} Sub Active
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1 font-medium">
              Mathematics & Science Faculty
            </p>
          </div>
        </div>

        {/* Card 3: Today's Attendance Rate */}
        <div className="bg-white rounded-2xl p-5 border border-[#EBF0F5] shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Today's Attendance
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CalendarCheck className="w-4 h-4" />
            </div>
          </div>

          <div className="mt-4">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-[#111C2D]">
                {metrics.attendanceRate}%
              </span>
              <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                Eligible
              </span>
            </div>
            <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2.5 overflow-hidden">
              <div
                className="bg-[#26C281] h-full rounded-full transition-all"
                style={{ width: `${metrics.attendanceRate}%` }}
              />
            </div>
          </div>
        </div>

        {/* Card 4: Fee Revenue Health */}
        <div className="bg-white rounded-2xl p-5 border border-[#EBF0F5] shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Fee Collections
            </span>
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>

          <div className="mt-4">
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-black text-[#111C2D]">
                ₹{metrics.totalFeeCollected.toLocaleString('en-IN')}
              </span>
              <span className="text-[11px] font-bold text-slate-500">
                / ₹{metrics.totalFeeInvoiced.toLocaleString('en-IN')}
              </span>
            </div>
            <p className="text-[11px] text-[#FF7555] font-semibold mt-1">
              ₹{metrics.totalFeePending.toLocaleString('en-IN')} Pending (Term 2)
            </p>
          </div>
        </div>
      </div>

      {/* 3. MIDDLE DUAL PANELS: Academic Sections & Fee Health */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Left (7 cols): Academic Class Structure */}
        <div className="lg:col-span-7 bg-white rounded-2xl p-6 border border-[#EBF0F5] shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-bold text-[#111C2D]">
                  Active Classes & Sections
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Academic Year 2026-27 • CBSE Secondary Program
                </p>
              </div>

              <Link
                href="/admin/students"
                className="text-xs font-bold text-[#FF7555] hover:underline flex items-center gap-1"
              >
                View Roster <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="space-y-3">
              {classSections.map((sec) => (
                <div
                  key={sec.id}
                  className="bg-[#FAFCFE] border border-[#EEF2F6] rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-[#111C2D] text-white flex items-center justify-center font-bold text-xs shrink-0">
                      {sec.className.replace('Class ', '')}
                      {sec.sectionName}
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-[#111C2D]">
                        {sec.className} - Section {sec.sectionName}
                      </h3>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Class Teacher:{' '}
                        <span className="font-semibold text-slate-700">
                          {sec.classTeacherName}
                        </span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 self-end sm:self-auto">
                    <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">
                      {sec.studentCount} Students
                    </span>
                    <Link
                      href="/admin/students"
                      className="px-3 py-1 rounded-lg text-xs font-semibold text-[#111C2D] bg-white border border-slate-200 hover:bg-slate-50 transition-colors"
                    >
                      Manage
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>5 Core CBSE Subjects active (Math, Science, English, SST, Hindi)</span>
            <span className="font-semibold text-[#111C2D]">Timetable Verified</span>
          </div>
        </div>

        {/* Right (5 cols): Fee Engine Health & Overdue Summary */}
        <div className="lg:col-span-5 bg-white rounded-2xl p-6 border border-[#EBF0F5] shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-bold text-[#111C2D]">Fee Collections Health</h2>
                <p className="text-xs text-slate-500 mt-0.5">Term 1 (Paid) & Term 2 (Active)</p>
              </div>

              <Link
                href="/admin/fees"
                className="text-xs font-bold text-[#FF7555] hover:underline flex items-center gap-1"
              >
                Fee Ledger <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="p-4 rounded-xl bg-gradient-to-br from-[#FFFDF7] to-[#FFF6ED] border border-[#F6E7D2] space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-600 font-medium">Term 1 Composite Tuition:</span>
                <span className="font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                  100% Realized
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-600 font-medium">Term 2 Tuition Invoiced:</span>
                <span className="font-bold text-[#FF7555]">
                  ₹{metrics.totalFeePending.toLocaleString('en-IN')} Pending
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-600 font-medium">Late Fine Policy:</span>
                <span className="font-medium text-slate-700">10-Day Grace • ₹50 + ₹10/day</span>
              </div>
            </div>
          </div>

          <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-600">
              Need to record counter fees?
            </span>
            <Link
              href="/admin/fees"
              className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#111C2D] hover:bg-[#1a2942] transition-colors"
            >
              Counter Payment →
            </Link>
          </div>
        </div>
      </div>

      {/* 4. BOTTOM DUAL PANELS: Circulars & Audit Trail */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Left (6 cols): Recent Circulars */}
        <div className="lg:col-span-6 bg-white rounded-2xl p-6 border border-[#EBF0F5] shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Megaphone className="w-4 h-4 text-[#FF7555]" />
                <h2 className="text-base font-bold text-[#111C2D]">
                  Institutional Circulars ({recentNotices.length})
                </h2>
              </div>

              <button
                onClick={() => setIsNoticeModalOpen(true)}
                className="text-xs font-bold text-[#FF7555] hover:underline"
              >
                + New Notice
              </button>
            </div>

            <div className="divide-y divide-slate-100">
              {recentNotices.slice(0, 4).map((notice) => (
                <div key={notice.id} className="py-3 flex items-start justify-between gap-3">
                  <div className="min-w-0 pr-2">
                    <p className="text-xs font-bold text-[#111C2D] truncate">
                      {notice.title}
                    </p>
                    <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                      {notice.content}
                    </p>
                  </div>
                  <div className="flex flex-col items-end shrink-0">
                    <span
                      className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                        notice.priority === 'URGENT'
                          ? 'bg-red-50 text-red-600 border border-red-100'
                          : notice.priority === 'IMPORTANT'
                          ? 'bg-amber-50 text-amber-700 border border-amber-100'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {notice.priority}
                    </span>
                    <span className="text-[10px] text-slate-400 mt-1 font-medium">
                      {notice.date}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 text-right">
            <Link
              href="/admin/notices"
              className="text-xs font-bold text-[#FF7555] hover:underline"
            >
              View All Circulars →
            </Link>
          </div>
        </div>

        {/* Right (6 cols): Security & Operational Audit Log */}
        <div className="lg:col-span-6 bg-white rounded-2xl p-6 border border-[#EBF0F5] shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <h2 className="text-base font-bold text-[#111C2D]">
                  Operational Audit Trail
                </h2>
              </div>
              <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                DPDP Compliant
              </span>
            </div>

            <div className="divide-y divide-slate-100">
              {recentAuditLogs.slice(0, 4).map((log) => (
                <div key={log.id} className="py-3 flex items-center justify-between text-xs">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[10px] font-bold text-[#111C2D] bg-slate-100 px-1.5 py-0.5 rounded">
                        {log.action}
                      </span>
                      <span className="text-[11px] text-slate-600 font-medium">
                        by {log.userName}
                      </span>
                    </div>
                    {log.ipAddress && (
                      <p className="text-[10px] text-slate-400 mt-0.5 font-mono">
                        IP: {log.ipAddress}
                      </p>
                    )}
                  </div>
                  <span className="text-[10px] text-slate-400 font-medium shrink-0">
                    {log.timestamp}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 text-right">
            <Link
              href="/admin/audit"
              className="text-xs font-bold text-[#FF7555] hover:underline"
            >
              View Full Audit Log →
            </Link>
          </div>
        </div>
      </div>

      {/* 5. PUBLISH NOTICE MODAL */}
      {isNoticeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 md:p-8 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#FFF2EE] text-[#FF7555] flex items-center justify-center">
                  <Megaphone className="w-4 h-4" />
                </div>
                <h3 className="text-base font-bold text-[#111C2D]">Publish Official Circular</h3>
              </div>
              <button
                onClick={() => setIsNoticeModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handlePublishNotice} className="mt-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Circular Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. CBSE Term-1 Pre-Board Schedule Released"
                  value={noticeForm.title}
                  onChange={(e) => setNoticeForm({ ...noticeForm, title: e.target.value })}
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-[#FF7555] focus:outline-none transition-colors"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Priority</label>
                  <select
                    value={noticeForm.priority}
                    onChange={(e) =>
                      setNoticeForm({ ...noticeForm, priority: e.target.value as any })
                    }
                    className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-300 focus:border-[#FF7555] focus:outline-none"
                  >
                    <option value="NORMAL">Normal</option>
                    <option value="IMPORTANT">Important</option>
                    <option value="URGENT">Urgent</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Audience</label>
                  <select
                    value={noticeForm.targetAudience}
                    onChange={(e) =>
                      setNoticeForm({ ...noticeForm, targetAudience: e.target.value as any })
                    }
                    className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-300 focus:border-[#FF7555] focus:outline-none"
                  >
                    <option value="ALL">All (School-Wide)</option>
                    <option value="PARENTS">Parents Only</option>
                    <option value="TEACHERS">Teachers Only</option>
                    <option value="STUDENTS">Students Only</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Detailed Circular Body *
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Enter the official notification details..."
                  value={noticeForm.content}
                  onChange={(e) => setNoticeForm({ ...noticeForm, content: e.target.value })}
                  className="w-full text-xs p-3.5 rounded-xl border border-slate-300 focus:border-[#FF7555] focus:outline-none"
                />
              </div>

              {noticeFeedback && (
                <div
                  className={`p-3 rounded-xl text-xs font-semibold ${
                    noticeFeedback.success
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-red-50 text-red-700 border border-red-200'
                  }`}
                >
                  {noticeFeedback.message}
                </div>
              )}

              <div className="pt-3 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsNoticeModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingNotice}
                  className="flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-bold text-white bg-[#FF7555] hover:bg-[#e05e3f] disabled:opacity-50 transition-colors shadow-md shadow-[#FF7555]/20 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isSubmittingNotice ? 'Publishing...' : 'Publish Circular'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
