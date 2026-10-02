'use client';

import React from 'react';
import { CheckCircle2, AlertTriangle, Calendar, Clock, Download, ArrowUpRight } from 'lucide-react';
import PortalPageHeader from '../PortalPageHeader';

interface MyAttendanceScreenProps {
  stats: {
    attendancePercentage: number;
    totalClasses: number;
    presentClasses: number;
  };
  onBackToDashboard: () => void;
  onSelectNav: (id: string) => void;
  onRequestLeave: () => void;
}

const SUBJECT_ATTENDANCE = [
  { subject: 'Mathematics (Algebra & Geometry)', code: 'MATH-041', attended: 29, total: 30, percent: 96.6 },
  { subject: 'Science (Physics, Chem & Bio)', code: 'SCI-086', attended: 28, total: 30, percent: 93.3 },
  { subject: 'English Language & Literature', code: 'ENG-184', attended: 29, total: 30, percent: 96.6 },
  { subject: 'Social Science (Hist, Civ & Geog)', code: 'SOC-087', attended: 26, total: 30, percent: 86.6 },
  { subject: 'Computer Applications', code: 'CA-165', attended: 20, total: 20, percent: 100.0 },
  { subject: 'Hindi Course A', code: 'HIN-002', attended: 18, total: 20, percent: 90.0 },
];

export default function MyAttendanceScreen({
  stats,
  onBackToDashboard,
  onSelectNav,
  onRequestLeave,
}: MyAttendanceScreenProps) {
  const percentage = stats.attendancePercentage || 93.3;
  const isHealthy = percentage >= 75;

  return (
    <div className="space-y-6">
      <PortalPageHeader
        title="My Attendance"
        subtitle="Subject-wise attendance tracking, compliance metrics, and aggregate academic presence"
        onBackToDashboard={onBackToDashboard}
      >
        <button
          type="button"
          onClick={() => onSelectNav('attendance-calendar')}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-xs transition-colors"
        >
          <Calendar className="w-4 h-4 text-slate-500" />
          <span>Attendance Calendar</span>
        </button>
        <button
          type="button"
          onClick={onRequestLeave}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-semibold shadow-xs transition-colors"
        >
          <span>Request Leave</span>
        </button>
      </PortalPageHeader>

      {/* Top Banner: Overall Score + CBSE Compliance */}
      <div className="bg-white rounded-[22px] shadow-[0_4px_20px_rgba(0,100,200,0.06)] border border-blue-50/80 p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-6">
          {/* Circular Metric Ring */}
          <div className="relative w-28 h-28 flex items-center justify-center shrink-0">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="40"
                stroke="#E2E8F0"
                strokeWidth="10"
                fill="none"
              />
              <circle
                cx="50"
                cy="50"
                r="40"
                stroke={isHealthy ? '#10B981' : '#F59E0B'}
                strokeWidth="10"
                strokeDasharray={251.2}
                strokeDashoffset={251.2 * (1 - percentage / 100)}
                strokeLinecap="round"
                fill="none"
                className="transition-all duration-1000 ease-out"
              />
            </svg>
            <div className="absolute flex flex-col items-center justify-center text-center">
              <span className="text-2xl font-bold text-slate-900 leading-none">
                {percentage}%
              </span>
              <span className="text-[10px] font-semibold text-slate-400 mt-0.5">Overall</span>
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                  isHealthy
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-amber-50 text-amber-700 border border-amber-200'
                }`}
              >
                {isHealthy ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                )}
                <span>{isHealthy ? 'CBSE Compliant (Healthy)' : 'Below 75% Requirement'}</span>
              </span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 mt-2">
              Attendance Record for Academic Year 2026-27
            </h2>
            <p className="text-xs text-slate-500 mt-0.5 max-w-xl">
              CBSE board guidelines mandate minimum 75% aggregate attendance to remain eligible for
              All India Secondary School Examinations (AISSE Class 10).
            </p>
          </div>
        </div>

        {/* Aggregate Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full md:w-auto">
          <div className="bg-slate-50 rounded-2xl p-3.5 border border-slate-100 text-center">
            <span className="text-[10px] text-slate-400 font-semibold uppercase">Total Sessions</span>
            <span className="text-lg font-bold text-slate-900 block mt-0.5">150</span>
          </div>
          <div className="bg-emerald-50/70 rounded-2xl p-3.5 border border-emerald-100 text-center">
            <span className="text-[10px] text-emerald-600 font-semibold uppercase">Present</span>
            <span className="text-lg font-bold text-emerald-700 block mt-0.5">140</span>
          </div>
          <div className="bg-rose-50/70 rounded-2xl p-3.5 border border-rose-100 text-center">
            <span className="text-[10px] text-rose-600 font-semibold uppercase">Absent</span>
            <span className="text-lg font-bold text-rose-700 block mt-0.5">8</span>
          </div>
          <div className="bg-amber-50/70 rounded-2xl p-3.5 border border-amber-100 text-center">
            <span className="text-[10px] text-amber-600 font-semibold uppercase">Late / Half</span>
            <span className="text-lg font-bold text-amber-700 block mt-0.5">2</span>
          </div>
        </div>
      </div>

      {/* Subject-wise Progress Card */}
      <div className="bg-white rounded-[22px] shadow-[0_4px_20px_rgba(0,100,200,0.06)] border border-blue-50/80 p-6 space-y-4">
        <h3 className="text-base font-bold text-slate-900">Subject-wise Class Attendance</h3>

        <div className="space-y-4">
          {SUBJECT_ATTENDANCE.map((sub) => {
            const isSubHealthy = sub.percent >= 75;

            return (
              <div key={sub.code} className="space-y-1.5 p-3 rounded-xl bg-slate-50/60 hover:bg-slate-50 transition-colors">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-800">{sub.subject}</span>
                    <span className="font-mono text-[10px] text-slate-400 bg-white px-2 py-0.2 rounded border border-slate-200">
                      {sub.code}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-slate-500 text-[11px]">
                      {sub.attended} / {sub.total} periods attended
                    </span>
                    <span
                      className={`font-bold text-xs ${
                        isSubHealthy ? 'text-emerald-700' : 'text-amber-700'
                      }`}
                    >
                      {sub.percent.toFixed(1)}%
                    </span>
                  </div>
                </div>

                <div className="w-full h-2.5 bg-slate-200/80 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      isSubHealthy
                        ? 'bg-gradient-to-r from-emerald-500 to-emerald-600'
                        : 'bg-gradient-to-r from-amber-500 to-amber-600'
                    }`}
                    style={{ width: `${sub.percent}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
