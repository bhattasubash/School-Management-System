'use client';

import React from 'react';
import Link from 'next/link';
import {
  Clock,
  MapPin,
  Users,
  AlertCircle,
  CheckCircle,
  ArrowRight,
  BookOpen,
} from 'lucide-react';
import { TeacherPageHeader } from '@/components/teacher/TeacherPageHeader';
import { TeacherCard, StatusBadge } from '@/components/teacher/TeacherComponents';

export default function TodaySchedulePage() {
  const periods = [
    {
      order: 1,
      time: '09:00 AM - 09:45 AM',
      subject: 'Mathematics',
      grade: 'Grade 8',
      section: 'Section A',
      room: 'Room 204',
      status: 'COMPLETED' as const,
      isBreak: false,
    },
    {
      order: 2,
      time: '09:45 AM - 10:30 AM',
      subject: 'Physics',
      grade: 'Grade 9',
      section: 'Section B',
      room: 'Room 103',
      status: 'ACTIVE' as const,
      isBreak: false,
    },
    {
      order: 3,
      time: '10:30 AM - 11:15 AM',
      subject: 'Classroom Substitution: Algebra',
      grade: 'Grade 8',
      section: 'Section B',
      room: 'Room 204',
      status: 'PENDING' as const,
      isSubstitution: true,
      isBreak: false,
    },
    {
      order: 4,
      time: '11:15 AM - 11:45 AM',
      subject: 'Morning Recess / Break',
      grade: '--',
      section: '--',
      room: 'Staff Room',
      status: 'COMPLETED' as const,
      isBreak: true,
    },
    {
      order: 5,
      time: '11:45 AM - 12:30 PM',
      subject: 'Advanced Geometry',
      grade: 'Grade 10',
      section: 'Section A',
      room: 'Room 305',
      status: 'PENDING' as const,
      isBreak: false,
    },
    {
      order: 6,
      time: '12:30 PM - 01:15 PM',
      subject: 'Computer Science Practical',
      grade: 'Grade 9',
      section: 'Section A',
      room: 'Lab 2',
      status: 'PENDING' as const,
      isBreak: false,
    },
  ];

  return (
    <div className="space-y-6">
      <TeacherPageHeader
        title="Today's Schedule"
        description="Your classes and teaching periods for today."
        breadcrumbs={[
          { label: 'Workspace', href: '/teacher' },
          { label: "Today's Schedule" },
        ]}
        action={
          <Link
            href="/teacher/timetable"
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-[#102A56] hover:bg-slate-50 transition-colors"
          >
            <span>Full Timetable</span>
            <ArrowRight className="w-3.5 h-3.5 text-[#64748B]" />
          </Link>
        }
      />

      {/* Emergency Substitution Banner (Section 29) */}
      <div className="bg-amber-50/90 border border-amber-200/80 rounded-[22px] p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center text-amber-800 shrink-0">
            <AlertCircle className="w-5 h-5 stroke-[2]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold text-amber-800 bg-amber-200/60 px-2 py-0.5 rounded-full uppercase tracking-wider">
                Substitution Assigned
              </span>
              <span className="text-xs text-amber-900 font-medium">10:30 AM – 11:15 AM</span>
            </div>
            <h4 className="text-sm font-bold text-[#102A56] mt-1">
              You are covering Grade 8 — Section B (Algebra)
            </h4>
            <p className="text-xs text-[#64748B] mt-0.5">
              Room 204 • Covering for Rajesh Nambiar (On Leave)
            </p>
          </div>
        </div>

        <Link
          href="/teacher/class-attendance"
          className="self-start md:self-auto px-4 py-2 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-semibold shadow-xs transition-colors shrink-0"
        >
          View Class Roll Call
        </Link>
      </div>

      {/* Schedule Timeline */}
      <TeacherCard>
        <div className="flex items-center justify-between pb-4 border-b border-[#EEF2F6]">
          <div>
            <h3 className="text-base font-bold text-[#102A56]">Periods Timeline</h3>
            <p className="text-xs text-[#64748B] mt-0.5">Tuesday • 6 Scheduled Periods</p>
          </div>
          <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
            Period 2 Currently Active
          </span>
        </div>

        <div className="mt-5 space-y-3.5">
          {periods.map((p, idx) => (
            <div
              key={idx}
              className={`p-4 rounded-[18px] border transition-all ${
                p.status === 'ACTIVE'
                  ? 'bg-blue-50/60 border-[#2563EB] shadow-xs'
                  : p.isSubstitution
                  ? 'bg-amber-50/40 border-amber-200'
                  : p.isBreak
                  ? 'bg-slate-50/80 border-slate-200/60'
                  : 'bg-white border-[#E2EAF3] hover:border-slate-300'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-start sm:items-center gap-4">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                      p.status === 'ACTIVE'
                        ? 'bg-[#2563EB] text-white'
                        : p.status === 'COMPLETED'
                        ? 'bg-slate-100 text-slate-600'
                        : 'bg-slate-100 text-[#102A56]'
                    }`}
                  >
                    P{p.order}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-[14.5px] font-bold text-[#102A56] leading-tight">
                        {p.subject}
                      </h4>
                      {p.isSubstitution && (
                        <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
                          Substitution
                        </span>
                      )}
                    </div>

                    {!p.isBreak && (
                      <div className="flex flex-wrap items-center gap-4 text-xs text-[#64748B] mt-1 font-medium">
                        <span className="flex items-center gap-1">
                          <Users className="w-3.5 h-3.5 text-[#2563EB]" />
                          {p.grade} — {p.section}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-[#64748B]" />
                          {p.room}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-4 self-end sm:self-auto">
                  <div className="flex items-center gap-1.5 text-xs text-[#64748B] font-mono">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{p.time}</span>
                  </div>
                  <StatusBadge status={p.status} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </TeacherCard>
    </div>
  );
}
