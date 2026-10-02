'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Briefcase,
  Calendar,
  FileText,
  Send,
  CheckCircle2,
  Clock,
  HeartPulse,
  SunMedium,
  Upload,
} from 'lucide-react';
import { TeacherPageHeader } from '@/components/teacher/TeacherPageHeader';
import { StatCard, TeacherCard } from '@/components/teacher/TeacherComponents';

export default function ApplyLeavePage() {
  const router = useRouter();
  const [leaveType, setLeaveType] = useState('CASUAL');
  const [startDate, setStartDate] = useState('2026-01-15');
  const [endDate, setEndDate] = useState('2026-01-16');
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) {
      setFeedback('Please provide a reason for the leave request.');
      return;
    }
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setFeedback('Leave request submitted to Academic Head for approval.');
      setTimeout(() => {
        router.push('/teacher/leave/status');
      }, 1500);
    }, 700);
  };

  return (
    <div className="space-y-6">
      <TeacherPageHeader
        title="Apply Leave"
        description="Submit a formal leave application for school principal and HR approval."
        breadcrumbs={[
          { label: 'Workspace', href: '/teacher' },
          { label: 'Apply Leave' },
        ]}
        action={
          <Link
            href="/teacher/leave/status"
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-[#102A56] hover:bg-slate-50 transition-colors shadow-xs"
          >
            <span>View Leave History</span>
          </Link>
        }
      />

      {feedback && (
        <div className="p-3 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-2xl text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{feedback}</span>
        </div>
      )}

      {/* Leave Balance Counters */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          label="CASUAL LEAVE"
          value="8 Days"
          subtext="Available balance for 2026"
          icon={SunMedium}
          variant="yellow"
        />
        <StatCard
          label="SICK LEAVE"
          value="10 Days"
          subtext="Medical leave available"
          icon={HeartPulse}
          variant="peach"
        />
        <StatCard
          label="EARNED LEAVE"
          value="14 Days"
          subtext="Annual accrued leave"
          icon={Briefcase}
          variant="purple"
        />
      </div>

      {/* Leave Request Form */}
      <TeacherCard className="max-w-2xl">
        <div className="pb-4 border-b border-[#EEF2F6]">
          <h3 className="text-base font-bold text-[#102A56]">Leave Application Form</h3>
          <p className="text-xs text-[#64748B]">All fields are reviewed by Principal & Timetable Coordinator</p>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label className="block text-[11px] font-bold text-[#64748B] uppercase tracking-wider mb-1.5">
              Leave Category
            </label>
            <select
              value={leaveType}
              onChange={(e) => setLeaveType(e.target.value)}
              className="w-full h-11 px-3.5 rounded-[14px] bg-slate-50 border border-slate-200 text-xs font-semibold text-[#102A56] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/30"
            >
              <option value="CASUAL">Casual Leave (CL)</option>
              <option value="SICK">Sick / Medical Leave (SL)</option>
              <option value="EARNED">Earned / Privilege Leave (EL)</option>
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold text-[#64748B] uppercase tracking-wider mb-1.5">
                From Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full h-11 px-3.5 rounded-[14px] bg-slate-50 border border-slate-200 text-xs font-semibold text-[#102A56] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/30"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-[#64748B] uppercase tracking-wider mb-1.5">
                To Date
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full h-11 px-3.5 rounded-[14px] bg-slate-50 border border-slate-200 text-xs font-semibold text-[#102A56] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/30"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-[#64748B] uppercase tracking-wider mb-1.5">
              Reason for Absence
            </label>
            <textarea
              rows={4}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="State the reason for leave (e.g. family function, medical appointment)..."
              className="w-full p-3.5 rounded-[14px] bg-slate-50 border border-slate-200 text-xs text-[#102A56] placeholder-[#94A3B8] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2563EB]/30 leading-relaxed"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-[#64748B] uppercase tracking-wider mb-1.5">
              Supporting Document (Optional for Sick Leave)
            </label>
            <div className="border border-dashed border-slate-200 rounded-[14px] p-4 text-center bg-slate-50/50 hover:bg-slate-50 transition-colors cursor-pointer">
              <Upload className="w-5 h-5 text-[#64748B] mx-auto mb-1" />
              <p className="text-xs font-semibold text-[#102A56]">Upload medical slip / note</p>
              <p className="text-[11px] text-[#64748B]">PDF, PNG, JPG up to 5MB</p>
            </div>
          </div>

          <div className="pt-3 border-t border-[#EEF2F6] flex justify-end gap-3">
            <Link
              href="/teacher"
              className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-[#102A56] transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isSubmitting ? 'Submitting...' : 'Submit Leave Request'}</span>
            </button>
          </div>
        </form>
      </TeacherCard>
    </div>
  );
}
