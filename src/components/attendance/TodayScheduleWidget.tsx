'use client';

import React, { useState, useTransition, useMemo } from 'react';
import {
  Clock,
  Calendar,
  ShieldAlert,
  CheckCircle2,
  Loader2,
  BookOpen,
  User,
  MapPin,
  Sparkles,
} from 'lucide-react';
import type { TeacherPeriodScheduleItem } from '@/services/attendance.service';
import type { DayOfWeek } from '@prisma/client';
import { acknowledgeSubstitutionAction } from '@/actions/attendance';
import { StatusBadge } from '@/components/ui';

interface TodayScheduleWidgetProps {
  dayOfWeek: DayOfWeek;
  schedule: TeacherPeriodScheduleItem[];
  substitutions: TeacherPeriodScheduleItem[];
  studentView?: boolean;
}

type TimeSlotTab = 'all' | '8-12' | '12-3' | '3-6';

export function TodayScheduleWidget({
  dayOfWeek,
  schedule,
  substitutions,
  studentView = false,
}: TodayScheduleWidgetProps) {
  const [activeTab, setActiveTab] = useState<TimeSlotTab>('all');
  const [acknowledgedIds, setAcknowledgedIds] = useState<Record<string, boolean>>({});
  const [isPending, startTransition] = useTransition();

  const handleAcknowledge = (substitutionId: string) => {
    startTransition(async () => {
      const res = await acknowledgeSubstitutionAction(substitutionId);
      if (res.success) {
        setAcknowledgedIds((prev) => ({ ...prev, [substitutionId]: true }));
      }
    });
  };

  const hasSubstitutions = substitutions.length > 0;

  // Format day name nicely
  const dayName =
    dayOfWeek.charAt(0).toUpperCase() + dayOfWeek.slice(1).toLowerCase();

  // Helper to determine if a period is currently in session
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

  // Filter periods by time slot tab
  const filteredSchedule = useMemo(() => {
    if (activeTab === 'all') return schedule;

    return schedule.filter((item) => {
      const [h] = item.startTime.split(':').map(Number);
      if (isNaN(h)) return true;

      if (activeTab === '8-12') return h >= 8 && h < 12;
      if (activeTab === '12-3') return h >= 12 && h < 15;
      if (activeTab === '3-6') return h >= 15 && h < 18;
      return true;
    });
  }, [schedule, activeTab]);

  return (
    <div className="space-y-4">
      {/* 1. Substitution Cover Alert (if assigned for today) */}
      {!studentView && hasSubstitutions && (
        <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-4 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-amber-600" />
              <h4 className="text-xs font-bold text-amber-900 uppercase tracking-wider">
                Staff Cover Assignment
              </h4>
            </div>
            <span className="text-xs font-semibold text-amber-700 bg-amber-100/70 px-2 py-0.5 rounded-full">
              {substitutions.length} Period{substitutions.length > 1 ? 's' : ''} Today
            </span>
          </div>

          <div className="space-y-2">
            {substitutions.map((sub) => {
              const isAcknowledged = acknowledgedIds[sub.id];

              return (
                <div
                  key={sub.id}
                  className="bg-white p-3.5 rounded-lg border border-amber-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                >
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-bold text-slate-900">
                        {sub.className} - {sub.sectionName}
                      </span>
                      <span className="text-slate-300">•</span>
                      <span className="font-semibold text-slate-700">
                        {sub.subjectName} ({sub.subjectCode})
                      </span>
                      <span className="whitespace-nowrap px-2 py-0.5 rounded bg-amber-100 text-amber-800 text-xs font-medium">
                        {sub.startTime} - {sub.endTime}
                      </span>
                    </div>

                    <div className="text-xs text-slate-500">
                      <span>Covering for: <strong className="text-slate-700">{sub.originalTeacherName}</strong></span>
                      <span className="mx-1 text-slate-300">•</span>
                      <span className="text-slate-600">On approved leave</span>
                    </div>
                  </div>

                  <div className="shrink-0 self-start sm:self-center">
                    {isAcknowledged ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        Acknowledged
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleAcknowledge(sub.id)}
                        disabled={isPending}
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#FA896B] hover:bg-[#f87552] text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer disabled:opacity-50"
                      >
                        {isPending ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            <span>Saving...</span>
                          </>
                        ) : (
                          'Acknowledge Cover'
                        )}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 2. Today's Period Timetable */}
      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 mb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center">
              <Clock className="w-4 h-4 text-[#FA896B]" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Today&apos;s Class Schedule</h3>
              <p className="text-xs text-slate-500">{dayName} Timetable</p>
            </div>
          </div>

          {/* Time Slot Tabs */}
          <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg self-start sm:self-center text-xs">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-2.5 py-1 rounded-md font-semibold transition-all ${
                activeTab === 'all'
                  ? 'bg-[#FA896B] text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setActiveTab('8-12')}
              className={`px-2.5 py-1 rounded-md font-semibold transition-all ${
                activeTab === '8-12'
                  ? 'bg-[#FA896B] text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              8 to 12
            </button>
            <button
              onClick={() => setActiveTab('12-3')}
              className={`px-2.5 py-1 rounded-md font-semibold transition-all ${
                activeTab === '12-3'
                  ? 'bg-[#FA896B] text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              12 to 3
            </button>
            <button
              onClick={() => setActiveTab('3-6')}
              className={`px-2.5 py-1 rounded-md font-semibold transition-all ${
                activeTab === '3-6'
                  ? 'bg-[#FA896B] text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              3 to 6
            </button>
          </div>
        </div>

        {filteredSchedule.length === 0 ? (
          <div className="py-8 text-center text-slate-400">
            <Calendar className="w-8 h-8 mx-auto text-slate-300 mb-2" />
            <p className="text-xs font-medium">No periods scheduled in this time interval.</p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {filteredSchedule.map((item) => {
              const isCurrent = isPeriodActiveNow(item.startTime, item.endTime);

              return (
                <div
                  key={item.id}
                  className={`p-3.5 rounded-lg border flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 transition-all ${
                    item.isBreak
                      ? 'bg-amber-50/50 border-amber-200 text-amber-800'
                      : isCurrent
                      ? 'bg-white border-l-4 border-l-[#FA896B] border-slate-300 shadow-md ring-1 ring-[#FA896B]/20 animate-pulse'
                      : 'bg-white border-l-4 border-l-[#FA896B] border-slate-200/80 hover:border-slate-300 hover:shadow-2xs text-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 text-center shrink-0">
                      <span className="text-[10px] font-semibold text-slate-400 block uppercase">
                        Period
                      </span>
                      <span className="text-sm font-bold text-slate-900 leading-none">
                        {item.order}
                      </span>
                    </div>

                    <div className="h-8 w-px bg-slate-200 shrink-0" />

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900 truncate">
                          {item.subjectName}
                        </span>
                        {item.subjectCode && (
                          <span className="text-[10px] font-mono bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded shrink-0">
                            {item.subjectCode}
                          </span>
                        )}
                        {item.isSubstitution && (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                            Sub
                          </span>
                        )}
                        {isCurrent && (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                            <Sparkles className="w-2.5 h-2.5" />
                            Live Now
                          </span>
                        )}
                      </div>

                      <div className="text-xs text-slate-500 mt-1 flex flex-wrap items-center gap-2">
                        <span>{item.className} - {item.sectionName}</span>
                        {item.roomNumber && (
                          <>
                            <span className="text-slate-300">•</span>
                            <span className="flex items-center gap-0.5">
                              <MapPin className="w-2.5 h-2.5 text-slate-400" />
                              Room {item.roomNumber}
                            </span>
                          </>
                        )}
                        {item.isSubstitution && item.originalTeacherName && (
                          <>
                            <span className="text-slate-300">•</span>
                            <span className="text-amber-700 font-medium">
                              Sub for {item.originalTeacherName}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="whitespace-nowrap text-xs font-mono font-medium text-slate-600 bg-slate-50 px-2.5 py-1 rounded-md border border-slate-200 self-start sm:self-center">
                    {item.startTime} – {item.endTime}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default TodayScheduleWidget;
