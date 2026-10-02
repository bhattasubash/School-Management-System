'use client';

import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import PortalPageHeader from '../PortalPageHeader';

interface AttendanceCalendarScreenProps {
  onBackToDashboard: () => void;
  onSelectNav: (id: string) => void;
}

export default function AttendanceCalendarScreen({
  onBackToDashboard,
  onSelectNav,
}: AttendanceCalendarScreenProps) {
  const [currentMonthIndex, setCurrentMonthIndex] = useState(9); // October (0-indexed)
  const [currentYear, setCurrentYear] = useState(2026);

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const handlePrevMonth = () => {
    if (currentMonthIndex === 0) {
      setCurrentMonthIndex(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonthIndex((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonthIndex === 11) {
      setCurrentMonthIndex(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonthIndex((m) => m + 1);
    }
  };

  // Mock deterministic statuses for days in month
  const getDayStatus = (day: number) => {
    const dayOfWeek = (day + 3) % 7; // Mock day of week offset
    if (dayOfWeek === 0) return 'Holiday'; // Sunday
    if (day === 2) return 'Gandhi Jayanti'; // Oct 2
    if (day === 14) return 'Late';
    if (day === 21) return 'Absent';
    if (day === 28) return 'Late';
    return 'Present';
  };

  const daysInMonth = new Date(currentYear, currentMonthIndex + 1, 0).getDate();
  const firstDayOfWeek = new Date(currentYear, currentMonthIndex, 1).getDay();

  return (
    <div className="space-y-6">
      <PortalPageHeader
        title="Attendance Calendar"
        subtitle="Monthly day-by-day attendance visualizer with status badges"
        onBackToDashboard={onBackToDashboard}
      >
        <button
          type="button"
          onClick={() => onSelectNav('my-attendance')}
          className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-xs transition-colors"
        >
          View Aggregate Stats
        </button>
      </PortalPageHeader>

      {/* Calendar Card */}
      <div className="bg-white rounded-[22px] shadow-[0_4px_20px_rgba(0,100,200,0.06)] border border-blue-50/80 p-6 space-y-6">
        {/* Month Navigation Bar */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <CalendarIcon className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                {monthNames[currentMonthIndex]} {currentYear}
              </h2>
              <p className="text-xs text-slate-400">Class 10 - Section A</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrevMonth}
              className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors"
              title="Previous Month"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleNextMonth}
              className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors"
              title="Next Month"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 sm:gap-6 flex-wrap text-xs font-medium">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-emerald-500" />
            <span className="text-slate-600">Present</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-rose-500" />
            <span className="text-slate-600">Absent</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-amber-500" />
            <span className="text-slate-600">Late / Half-Day</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-purple-500" />
            <span className="text-slate-600">Holiday / Weekend</span>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-2 text-center text-xs">
          {/* Day Headers */}
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
            <div key={d} className="font-bold text-slate-400 uppercase text-[10px] tracking-wider py-2">
              {d}
            </div>
          ))}

          {/* Blank cells for offset */}
          {Array.from({ length: firstDayOfWeek }).map((_, i) => (
            <div key={`blank-${i}`} className="p-3 rounded-xl bg-transparent" />
          ))}

          {/* Date cells */}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const dayNum = i + 1;
            const status = getDayStatus(dayNum);

            let statusBg = 'bg-emerald-50 text-emerald-800 border-emerald-200';
            let dotColor = 'bg-emerald-500';

            if (status === 'Absent') {
              statusBg = 'bg-rose-50 text-rose-800 border-rose-200';
              dotColor = 'bg-rose-500';
            } else if (status === 'Late') {
              statusBg = 'bg-amber-50 text-amber-800 border-amber-200';
              dotColor = 'bg-amber-500';
            } else if (status === 'Holiday' || status === 'Gandhi Jayanti') {
              statusBg = 'bg-purple-50 text-purple-800 border-purple-200';
              dotColor = 'bg-purple-500';
            }

            return (
              <div
                key={dayNum}
                className={`min-h-[64px] sm:min-h-[72px] p-2 rounded-xl border flex flex-col items-center justify-between transition-all hover:scale-105 hover:shadow-xs ${statusBg}`}
              >
                <div className="flex items-center justify-between w-full">
                  <span className="font-bold text-xs">{dayNum}</span>
                  <span className={`w-2 h-2 rounded-full ${dotColor}`} />
                </div>
                <span className="text-[10px] font-semibold truncate w-full">{status}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
