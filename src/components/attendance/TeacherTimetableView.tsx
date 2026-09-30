'use client';

import React, { useState } from 'react';
import {
  Clock,
  Calendar,
  BookOpen,
  MapPin,
  CalendarDays,
  Sparkles,
} from 'lucide-react';
import type { TeacherPeriodScheduleItem } from '@/services/attendance.service';
import type { DayOfWeek } from '@prisma/client';

export interface WeeklyTeacherPeriod {
  id: string;
  dayOfWeek: DayOfWeek;
  periodName: string;
  startTime: string;
  endTime: string;
  order: number;
  isBreak: boolean;
  className: string;
  sectionName: string;
  subjectName: string;
  subjectCode: string;
  roomNumber?: string | null;
}

interface TeacherTimetableViewProps {
  todayDayOfWeek: DayOfWeek;
  todaySchedule: TeacherPeriodScheduleItem[];
  weeklySchedule?: WeeklyTeacherPeriod[];
}

const ALL_DAYS: { key: DayOfWeek; label: string }[] = [
  { key: 'MONDAY', label: 'Mon' },
  { key: 'TUESDAY', label: 'Tue' },
  { key: 'WEDNESDAY', label: 'Wed' },
  { key: 'THURSDAY', label: 'Thu' },
  { key: 'FRIDAY', label: 'Fri' },
  { key: 'SATURDAY', label: 'Sat' },
];

export default function TeacherTimetableView({
  todayDayOfWeek,
  todaySchedule,
  weeklySchedule = [],
}: TeacherTimetableViewProps) {
  const [viewMode, setViewMode] = useState<'today' | 'week'>('today');

  const isPeriodActiveNow = (startTime: string, endTime: string) => {
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    const [startH, startM] = startTime.split(':').map(Number);
    const [endH, endM] = endTime.split(':').map(Number);

    if (isNaN(startH) || isNaN(endH)) return false;

    const startTotal = startH * 60 + (startM || 0);
    const endTotal = endH * 60 + (endM || 0);

    return currentMinutes >= startTotal && currentMinutes <= endTotal;
  };

  // Unique time slots for weekly grid
  const distinctSlots = Array.from(
    new Map(
      weeklySchedule.map((w) => [
        w.order,
        { order: w.order, name: w.periodName, startTime: w.startTime, endTime: w.endTime },
      ])
    ).values()
  ).sort((a, b) => a.order - b.order);

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
      {/* Header with Today / Week Toggle */}
      <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-[#FA896B]" />
          <div>
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              {viewMode === 'today' ? "Today's Classes" : "My Weekly Schedule"}
            </h3>
            <p className="text-[11px] text-slate-500">
              {viewMode === 'today'
                ? `${todaySchedule.length} instructional periods scheduled`
                : `${weeklySchedule.length} total periods across the week`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1 bg-slate-200/80 p-0.5 rounded-lg text-xs">
          <button
            onClick={() => setViewMode('today')}
            className={`px-3 py-1 rounded-md font-semibold transition-all ${
              viewMode === 'today'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Today
          </button>
          <button
            onClick={() => setViewMode('week')}
            className={`px-3 py-1 rounded-md font-semibold transition-all ${
              viewMode === 'week'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            This Week
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {viewMode === 'today' ? (
          todaySchedule.length === 0 ? (
            <div className="py-8 text-center text-slate-400 text-xs">
              <Calendar className="w-8 h-8 mx-auto text-slate-300 mb-2" />
              <span>You have no classes scheduled for today.</span>
            </div>
          ) : (
            <div className="space-y-2.5">
              {todaySchedule.map((period) => {
                const isCurrent = isPeriodActiveNow(period.startTime, period.endTime);

                return (
                  <div
                    key={period.id}
                    className={`p-3 rounded-lg border flex items-center justify-between gap-3 text-xs transition-all ${
                      isCurrent
                        ? 'bg-white border-l-4 border-l-[#FA896B] border-slate-300 shadow-xs ring-1 ring-[#FA896B]/20 animate-pulse'
                        : 'bg-white border-l-4 border-l-[#FA896B] border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900">{period.subjectName}</span>
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                          {period.subjectCode}
                        </span>
                        {isCurrent && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                            <Sparkles className="w-2.5 h-2.5" />
                            Live
                          </span>
                        )}
                      </div>

                      <div className="text-slate-500 mt-1 flex items-center gap-2 text-[11px]">
                        <span className="font-semibold text-slate-700">
                          {period.className} - {period.sectionName}
                        </span>
                        {period.roomNumber && (
                          <>
                            <span className="text-slate-300">•</span>
                            <span className="flex items-center gap-0.5">
                              <MapPin className="w-2.5 h-2.5 text-slate-400" />
                              Room {period.roomNumber}
                            </span>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="font-mono font-semibold text-slate-700">
                        {period.startTime} – {period.endTime}
                      </div>
                      <div className="text-[10px] text-slate-400 font-medium mt-0.5">
                        Period {period.order}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )
        ) : (
          /* Weekly Grid */
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                  <th className="p-2 border-r border-slate-200">Slot</th>
                  {ALL_DAYS.map((d) => (
                    <th key={d.key} className="p-2 text-center border-r border-slate-200 last:border-r-0">
                      {d.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {distinctSlots.map((slot) => (
                  <tr key={slot.order} className="hover:bg-slate-50/50">
                    <td className="p-2 border-r border-slate-200 font-mono text-[11px] text-slate-600 bg-slate-50/50">
                      <div className="font-bold text-slate-800">{slot.name}</div>
                      <div className="text-[10px] text-slate-400">{slot.startTime}</div>
                    </td>

                    {ALL_DAYS.map((day) => {
                      const match = weeklySchedule.find(
                        (w) => w.dayOfWeek === day.key && w.order === slot.order
                      );

                      return (
                        <td
                          key={day.key}
                          className="p-1.5 border-r border-slate-200 last:border-r-0 text-center align-top min-w-[90px]"
                        >
                          {match ? (
                            <div className="bg-coral-50/30 border border-[#FA896B]/30 rounded p-1.5 text-left text-[11px]">
                              <div className="font-bold text-slate-900 truncate">
                                {match.subjectName}
                              </div>
                              <div className="text-[10px] text-slate-500 truncate">
                                {match.className}-{match.sectionName}
                              </div>
                              {match.roomNumber && (
                                <div className="text-[9px] text-slate-400 truncate">
                                  R{match.roomNumber}
                                </div>
                              )}
                            </div>
                          ) : (
                            <span className="text-slate-300 text-xs">—</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
