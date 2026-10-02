'use client';

import React from 'react';
import { TeacherPageHeader } from '@/components/teacher/TeacherPageHeader';
import { TeacherCard } from '@/components/teacher/TeacherComponents';
import { Download, Calendar, Clock, MapPin } from 'lucide-react';

export default function WeeklyTimetablePage() {
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const periods = [
    { name: 'Period 1', time: '09:00 - 09:45' },
    { name: 'Period 2', time: '09:45 - 10:30' },
    { name: 'Period 3', time: '10:30 - 11:15' },
    { name: 'Break', time: '11:15 - 11:45', isBreak: true },
    { name: 'Period 4', time: '11:45 - 12:30' },
    { name: 'Period 5', time: '12:30 - 01:15' },
    { name: 'Lunch', time: '01:15 - 02:00', isBreak: true },
    { name: 'Period 6', time: '02:00 - 02:45' },
  ];

  // Grid mapping for Sanjay Yadav
  const scheduleGrid: Record<string, Record<number, { subject: string; classSec: string; room: string } | null>> = {
    Monday: {
      0: { subject: 'Mathematics', classSec: '8-A', room: 'R-204' },
      1: { subject: 'Physics', classSec: '9-B', room: 'R-103' },
      2: null,
      4: { subject: 'Geometry', classSec: '10-A', room: 'R-305' },
      5: { subject: 'Comp. Sci Lab', classSec: '9-A', room: 'Lab-2' },
      7: null,
    },
    Tuesday: {
      0: { subject: 'Mathematics', classSec: '8-A', room: 'R-204' },
      1: { subject: 'Physics', classSec: '9-B', room: 'R-103' },
      2: { subject: 'Substitution: Alg.', classSec: '8-B', room: 'R-204' },
      4: { subject: 'Geometry', classSec: '10-A', room: 'R-305' },
      5: { subject: 'Comp. Sci Lab', classSec: '9-A', room: 'Lab-2' },
      7: { subject: 'Mathematics', classSec: '7-C', room: 'R-108' },
    },
    Wednesday: {
      0: null,
      1: { subject: 'Mathematics', classSec: '8-A', room: 'R-204' },
      2: { subject: 'Geometry', classSec: '10-A', room: 'R-305' },
      4: { subject: 'Physics', classSec: '9-B', room: 'R-103' },
      5: null,
      7: { subject: 'Remedial Class', classSec: '8-A', room: 'R-204' },
    },
    Thursday: {
      0: { subject: 'Mathematics', classSec: '8-A', room: 'R-204' },
      1: { subject: 'Comp. Sci Lab', classSec: '9-A', room: 'Lab-2' },
      2: null,
      4: { subject: 'Physics', classSec: '9-B', room: 'R-103' },
      5: { subject: 'Geometry', classSec: '10-A', room: 'R-305' },
      7: null,
    },
    Friday: {
      0: { subject: 'Mathematics', classSec: '8-A', room: 'R-204' },
      1: { subject: 'Physics', classSec: '9-B', room: 'R-103' },
      2: { subject: 'Geometry', classSec: '10-A', room: 'R-305' },
      4: null,
      5: { subject: 'Staff Meeting', classSec: 'Faculty', room: 'Conf. Hall' },
      7: null,
    },
    Saturday: {
      0: { subject: 'Mathematics', classSec: '8-A', room: 'R-204' },
      1: { subject: 'Doubt Clearing', classSec: '10-A', room: 'R-305' },
      2: null,
      4: null,
      5: null,
      7: null,
    },
  };

  return (
    <div className="space-y-6">
      <TeacherPageHeader
        title="Weekly Timetable"
        description="Comprehensive 6-day teaching schedule and room allocations."
        breadcrumbs={[
          { label: 'Workspace', href: '/teacher' },
          { label: 'Timetable' },
        ]}
        action={
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-[#102A56] hover:bg-slate-50 transition-colors shadow-xs"
          >
            <Download className="w-3.5 h-3.5 text-[#2563EB]" />
            <span>Export PDF</span>
          </button>
        }
      />

      <TeacherCard>
        <div className="flex items-center justify-between pb-4 border-b border-[#EEF2F6]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-[#2563EB] flex items-center justify-center font-bold text-xs">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#102A56]">Faculty Schedule Grid</h3>
              <p className="text-xs text-[#64748B]">Academic Year 2025-2026 • Term 2</p>
            </div>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <span className="flex items-center gap-1.5 text-[#102A56] font-medium">
              <span className="w-3 h-3 rounded-md bg-[#2563EB]/15 border border-[#2563EB]/30 inline-block" />
              Class Session
            </span>
            <span className="flex items-center gap-1.5 text-[#64748B] font-medium">
              <span className="w-3 h-3 rounded-md bg-slate-100 border border-slate-200 inline-block" />
              Free Period
            </span>
          </div>
        </div>

        <div className="overflow-x-auto mt-4">
          <table className="w-full border-collapse min-w-[800px]">
            <thead>
              <tr className="border-b border-[#EEF2F6]">
                <th className="py-3 px-3 text-left text-[11px] font-bold text-[#64748B] uppercase tracking-wider w-32">
                  Time / Slot
                </th>
                {days.map((day) => (
                  <th
                    key={day}
                    className={`py-3 px-3 text-center text-[12px] font-bold tracking-wide ${
                      day === 'Tuesday' ? 'text-[#2563EB] bg-blue-50/50 rounded-t-xl' : 'text-[#102A56]'
                    }`}
                  >
                    {day}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EEF2F6] text-xs">
              {periods.map((period, pIdx) => (
                <tr key={pIdx} className={period.isBreak ? 'bg-slate-50/70' : 'hover:bg-slate-50/40'}>
                  <td className="py-3 px-3 font-semibold text-[#102A56]">
                    <div>{period.name}</div>
                    <div className="text-[10px] text-[#64748B] font-mono mt-0.5">{period.time}</div>
                  </td>

                  {period.isBreak ? (
                    <td
                      colSpan={6}
                      className="py-2.5 px-4 text-center text-xs font-semibold text-[#64748B] tracking-wider uppercase bg-slate-100/60"
                    >
                      {period.name}
                    </td>
                  ) : (
                    days.map((day) => {
                      const slot = scheduleGrid[day]?.[pIdx];
                      const isToday = day === 'Tuesday';

                      return (
                        <td
                          key={day}
                          className={`p-2 text-center align-top ${
                            isToday ? 'bg-blue-50/20' : ''
                          }`}
                        >
                          {slot ? (
                            <div className="p-2.5 rounded-xl bg-white border border-[#E2EAF3] shadow-xs text-left hover:border-[#2563EB]/40 transition-colors">
                              <p className="font-bold text-[#102A56] text-[12.5px] truncate">
                                {slot.subject}
                              </p>
                              <div className="flex items-center justify-between text-[11px] text-[#64748B] mt-1 font-medium">
                                <span className="bg-sky-50 text-[#0284C7] font-semibold px-1.5 py-0.5 rounded-md">
                                  {slot.classSec}
                                </span>
                                <span>{slot.room}</span>
                              </div>
                            </div>
                          ) : (
                            <div className="h-16 rounded-xl border border-dashed border-slate-200/80 flex items-center justify-center text-[11px] text-slate-400">
                              Free
                            </div>
                          )}
                        </td>
                      );
                    })
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </TeacherCard>
    </div>
  );
}
