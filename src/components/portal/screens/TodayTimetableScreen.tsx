'use client';

import React from 'react';
import { Clock, MapPin, User, AlertCircle, Download, CheckCircle2 } from 'lucide-react';
import PortalPageHeader from '../PortalPageHeader';

interface TodayTimetableScreenProps {
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
  onBackToDashboard: () => void;
  onSelectNav: (id: string) => void;
}

export default function TodayTimetableScreen({
  todaySchedule,
  onBackToDashboard,
  onSelectNav,
}: TodayTimetableScreenProps) {
  const todayFormatted = new Date().toLocaleDateString('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="space-y-6">
      <PortalPageHeader
        title="Today's Timetable"
        subtitle={`Scheduled classes and laboratories for ${todayFormatted}`}
        onBackToDashboard={onBackToDashboard}
      >
        <button
          type="button"
          onClick={() => onSelectNav('weekly-timetable')}
          className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-xs transition-colors"
        >
          View Weekly Timetable
        </button>
        <button
          type="button"
          onClick={() => alert('Timetable schedule downloaded as PDF.')}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-semibold shadow-xs transition-colors"
        >
          <Download className="w-4 h-4" />
          <span>Download PDF</span>
        </button>
      </PortalPageHeader>

      {/* Date & Period Summary Card */}
      <div className="bg-white rounded-[22px] shadow-[0_4px_20px_rgba(0,100,200,0.06)] border border-blue-50/80 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider block">
            Academic Schedule
          </span>
          <h2 className="text-xl font-bold text-slate-900 mt-0.5">{todayFormatted}</h2>
          <p className="text-xs text-slate-500 mt-1">
            Section: <span className="font-semibold text-slate-700">10-A</span> &nbsp;•&nbsp; Total Periods Scheduled:{' '}
            <span className="font-semibold text-slate-700">{todaySchedule.length}</span>
          </p>
        </div>

        <div className="flex items-center gap-2 bg-emerald-50 text-emerald-700 border border-emerald-200 px-3.5 py-2 rounded-xl text-xs font-semibold shrink-0">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Campus Sessions Active</span>
        </div>
      </div>

      {/* Timeline of Periods */}
      <div className="space-y-3.5">
        {todaySchedule.map((period, index) => {
          const isLab = period.type.toLowerCase().includes('practical') || period.type.toLowerCase().includes('lab');

          return (
            <div
              key={index}
              className={`bg-white rounded-[20px] shadow-[0_4px_16px_rgba(0,100,200,0.05)] border p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all hover:border-blue-200 ${
                period.isSubstitute ? 'border-amber-200 bg-amber-50/20' : 'border-slate-100'
              }`}
            >
              {/* Left: Time & Period Indicator */}
              <div className="flex items-center gap-4 shrink-0">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#2563EB] flex items-center justify-center font-bold text-sm">
                  P{index + 1}
                </div>
                <div>
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>{period.time}</span>
                  </div>
                  <span
                    className={`inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                      isLab
                        ? 'bg-purple-50 text-purple-700 border border-purple-200'
                        : 'bg-blue-50 text-blue-700 border border-blue-200'
                    }`}
                  >
                    {period.type}
                  </span>
                </div>
              </div>

              {/* Center: Subject & Room */}
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-base font-bold text-slate-900">{period.subject}</h3>
                  <span className="text-[11px] font-mono text-slate-400 px-2 py-0.5 rounded bg-slate-100">
                    {period.code}
                  </span>
                  {period.isSubstitute && (
                    <span className="flex items-center gap-1 text-[11px] font-semibold text-amber-700 bg-amber-100/70 px-2 py-0.5 rounded-full">
                      <AlertCircle className="w-3 h-3" />
                      <span>Substitute Faculty</span>
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-4 text-xs text-slate-500 mt-1">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span>{period.room}</span>
                  </span>
                  <span>•</span>
                  <span>Section {period.section}</span>
                </div>
              </div>

              {/* Right: Teacher */}
              <div className="flex items-center gap-2.5 md:border-l md:border-slate-100 md:pl-5 shrink-0">
                <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center text-xs font-bold">
                  {period.teacher.charAt(0)}
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 block font-medium">Instructor</span>
                  <span className="text-xs font-bold text-slate-800 flex items-center gap-1">
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    <span>{period.teacher}</span>
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
