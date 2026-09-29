'use client';

import React from 'react';
import {
  Clock,
  Calendar,
  AlertCircle,
  Building,
  BookOpen,
  ArrowRight,
  ShieldAlert,
  CheckCircle,
} from 'lucide-react';
import type { TeacherPeriodScheduleItem } from '@/services/attendance.service';
import type { DayOfWeek } from '@prisma/client';

interface TodayScheduleWidgetProps {
  dayOfWeek: DayOfWeek;
  schedule: TeacherPeriodScheduleItem[];
  substitutions: TeacherPeriodScheduleItem[];
}

export function TodayScheduleWidget({
  dayOfWeek,
  schedule,
  substitutions,
}: TodayScheduleWidgetProps) {
  const hasSubstitutions = substitutions.length > 0;

  return (
    <div className="space-y-4">
      {/* 1. Substitution Alert Banner (if any assigned for today) */}
      {hasSubstitutions && (
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-l-4 border-[#FA896B] p-4 rounded-xl shadow-xs">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#FA896B] text-white flex items-center justify-center shrink-0 mt-0.5">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider bg-[#FA896B] text-white px-2 py-0.5 rounded-full">
                  Substitution Alert
                </span>
                <span className="text-xs font-bold text-gray-500">Action Required Today</span>
              </div>
              <h4 className="text-sm font-bold text-[#111C2D] mt-1">
                You have been assigned to cover {substitutions.length} class period(s) today
              </h4>

              <div className="mt-3 space-y-2">
                {substitutions.map((sub) => (
                  <div
                    key={sub.id}
                    className="bg-white p-3 rounded-lg border border-amber-200/60 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
                  >
                    <div>
                      <span className="font-extrabold text-[#FA896B]">{sub.periodName} ({sub.startTime} - {sub.endTime})</span>
                      <span className="mx-1.5 text-gray-300">•</span>
                      <span className="font-bold text-[#111C2D]">{sub.className} - {sub.sectionName}</span>
                      <span className="mx-1.5 text-gray-300">•</span>
                      <span className="font-semibold text-gray-600">{sub.subjectName} ({sub.subjectCode})</span>
                    </div>

                    <div className="flex items-center gap-2 text-[11px] text-gray-500">
                      <span>Covering for: <strong className="text-gray-800">{sub.originalTeacherName}</strong></span>
                      <span className="bg-amber-100 text-amber-800 text-[10px] px-2 py-0.5 rounded font-medium">
                        {sub.substitutionReason}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. Today's Period Timetable */}
      <div className="bg-white rounded-2xl p-5 md:p-6 border border-gray-100 shadow-sm">
        <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#111C2D]">Today&apos;s Class Schedule</h3>
              <p className="text-xs text-gray-400 capitalize">
                Day: <strong className="text-gray-700">{dayOfWeek.toLowerCase()}</strong> • Conflict Engine Verified
              </p>
            </div>
          </div>

          <span className="text-xs bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full font-semibold">
            {schedule.length} Periods Assigned
          </span>
        </div>

        {schedule.length === 0 ? (
          <div className="py-8 text-center text-gray-400">
            <Calendar className="w-8 h-8 mx-auto text-gray-300 mb-2" />
            <p className="text-xs font-semibold">No assigned periods on the master timetable for today.</p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {schedule.map((item) => (
              <div
                key={item.id}
                className={`p-3.5 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors ${
                  item.isBreak
                    ? 'bg-amber-50/40 border-amber-200 text-amber-800'
                    : 'bg-[#F9FBFC] border-gray-100 hover:border-gray-200 text-[#111C2D]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 text-center">
                    <span className="text-[10px] font-black uppercase text-gray-400 block">Period</span>
                    <span className="text-base font-black text-[#111C2D] leading-none">{item.order}</span>
                  </div>

                  <div className="h-8 w-px bg-gray-200" />

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-[#111C2D]">{item.subjectName}</span>
                      <span className="text-[10px] font-bold bg-[#EBF2F9] text-blue-700 px-1.5 py-0.2 rounded">
                        {item.subjectCode}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500 mt-0.5 flex items-center gap-2">
                      <span>{item.className} - {item.sectionName}</span>
                      <span className="text-gray-300">•</span>
                      <span>Room {item.roomNumber || '204'}</span>
                    </div>
                  </div>
                </div>

                <div className="text-xs font-semibold text-gray-600 bg-white px-3 py-1.5 rounded-lg border border-gray-200/80 self-start sm:self-center">
                  {item.startTime} - {item.endTime}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
