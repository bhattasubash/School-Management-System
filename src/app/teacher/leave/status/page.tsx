'use client';

import React from 'react';
import Link from 'next/link';
import {
  ClipboardList,
  CheckCircle2,
  Clock,
  XCircle,
  Plus,
  Calendar,
} from 'lucide-react';
import { TeacherPageHeader } from '@/components/teacher/TeacherPageHeader';
import { StatCard, StatusBadge, TeacherCard } from '@/components/teacher/TeacherComponents';

export default function LeaveStatusPage() {
  const requests = [
    { id: '1', type: 'Casual Leave', from: '15 Jan 2026', to: '16 Jan 2026', days: 2, appliedOn: '08 Jan 2026', status: 'PENDING' as const, reason: 'Family engagement' },
    { id: '2', type: 'Sick Leave', from: '22 Dec 2025', to: '23 Dec 2025', days: 2, appliedOn: '21 Dec 2025', status: 'APPROVED' as const, reason: 'Viral fever' },
    { id: '3', type: 'Earned Leave', from: '10 Nov 2025', to: '14 Nov 2025', days: 5, appliedOn: '01 Nov 2025', status: 'APPROVED' as const, reason: 'Annual travel' },
    { id: '4', type: 'Casual Leave', from: '15 Oct 2025', to: '15 Oct 2025', days: 1, appliedOn: '14 Oct 2025', status: 'REJECTED' as const, reason: 'Exam duty scheduled' },
  ];

  return (
    <div className="space-y-6">
      <TeacherPageHeader
        title="Leave Status"
        description="Track your submitted leave requests and approval audit trail."
        breadcrumbs={[
          { label: 'Workspace', href: '/teacher' },
          { label: 'Leave Status' },
        ]}
        action={
          <Link
            href="/teacher/leave/apply"
            className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-semibold shadow-xs transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Apply New Leave</span>
          </Link>
        }
      />

      {/* Summary Pills */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          label="PENDING REVIEW"
          value="1 Application"
          subtext="Under review by Principal"
          icon={Clock}
          variant="yellow"
        />
        <StatCard
          label="APPROVED LEAVES"
          value="7 Days"
          subtext="Current academic term"
          icon={CheckCircle2}
          variant="green"
        />
        <StatCard
          label="REJECTED REQUESTS"
          value="1"
          subtext="Due to exam schedule clash"
          icon={XCircle}
          variant="peach"
        />
      </div>

      {/* Requests History Table */}
      <TeacherCard>
        <div className="pb-4 border-b border-[#EEF2F6]">
          <h3 className="text-base font-bold text-[#102A56]">Submitted Applications</h3>
          <p className="text-xs text-[#64748B]">Complete history of leave records and approval remarks</p>
        </div>

        <div className="overflow-x-auto mt-2">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-[#EEF2F6] text-[11px] font-bold text-[#64748B] uppercase tracking-wider">
                <th className="py-3 px-3 text-left">Leave Type</th>
                <th className="py-3 px-3 text-left">Dates</th>
                <th className="py-3 px-3 text-center">Days</th>
                <th className="py-3 px-3 text-left">Applied On</th>
                <th className="py-3 px-3 text-left">Reason / Purpose</th>
                <th className="py-3 px-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F1F5F9] text-xs">
              {requests.map((r) => (
                <tr key={r.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="py-3.5 px-3 font-semibold text-[#102A56]">
                    {r.type}
                  </td>
                  <td className="py-3.5 px-3 font-medium text-[#102A56]">
                    {r.from} – {r.to}
                  </td>
                  <td className="py-3.5 px-3 text-center font-bold text-[#102A56]">
                    {r.days}
                  </td>
                  <td className="py-3.5 px-3 text-[#64748B]">
                    {r.appliedOn}
                  </td>
                  <td className="py-3.5 px-3 text-[#64748B] max-w-xs truncate">
                    {r.reason}
                  </td>
                  <td className="py-3.5 px-3 text-right">
                    <StatusBadge status={r.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </TeacherCard>
    </div>
  );
}
