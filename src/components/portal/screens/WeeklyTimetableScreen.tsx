'use client';

import React, { useState } from 'react';
import { Download, Calendar, MapPin, Clock } from 'lucide-react';
import PortalPageHeader from '../PortalPageHeader';

interface WeeklyTimetableScreenProps {
  onBackToDashboard: () => void;
  onSelectNav: (id: string) => void;
}

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const WEEKLY_SCHEDULE: Record<
  string,
  Array<{
    period: string;
    time: string;
    subject: string;
    code: string;
    room: string;
    teacher: string;
    type: 'Theory' | 'Practical' | 'Tutorial';
  }>
> = {
  Monday: [
    { period: '1', time: '08:30 - 09:15 AM', subject: 'Mathematics (Algebra)', code: 'MATH-041', room: 'Room 204', teacher: 'Mrs. Shalini Roy', type: 'Theory' },
    { period: '2', time: '09:15 - 10:00 AM', subject: 'Science (Physics)', code: 'SCI-086', room: 'Physics Lab 1', teacher: 'Dr. Rajesh Nambiar', type: 'Practical' },
    { period: '3', time: '10:15 - 11:00 AM', subject: 'English Literature', code: 'ENG-184', room: 'Room 204', teacher: 'Mr. Arvind Saxena', type: 'Theory' },
    { period: '4', time: '11:00 - 11:45 AM', subject: 'Social Science (Civics)', code: 'SOC-087', room: 'Room 204', teacher: 'Mrs. Meenakshi Joshi', type: 'Theory' },
    { period: '5', time: '12:15 - 01:00 PM', subject: 'Computer Applications', code: 'CA-165', room: 'Comp Lab 2', teacher: 'Mr. Deepak Sharma', type: 'Practical' },
    { period: '6', time: '01:00 - 01:45 PM', subject: 'Hindi Course A', code: 'HIN-002', room: 'Room 204', teacher: 'Dr. Kavita Verma', type: 'Theory' },
  ],
  Tuesday: [
    { period: '1', time: '08:30 - 09:15 AM', subject: 'English Language', code: 'ENG-184', room: 'Room 204', teacher: 'Mr. Arvind Saxena', type: 'Theory' },
    { period: '2', time: '09:15 - 10:00 AM', subject: 'Mathematics (Geometry)', code: 'MATH-041', room: 'Room 204', teacher: 'Mrs. Shalini Roy', type: 'Theory' },
    { period: '3', time: '10:15 - 11:00 AM', subject: 'Science (Chemistry)', code: 'SCI-086', room: 'Chemistry Lab', teacher: 'Dr. Rajesh Nambiar', type: 'Practical' },
    { period: '4', time: '11:00 - 11:45 AM', subject: 'Social Science (History)', code: 'SOC-087', room: 'Room 204', teacher: 'Mrs. Meenakshi Joshi', type: 'Theory' },
    { period: '5', time: '12:15 - 01:00 PM', subject: 'Physical Education', code: 'PE-048', room: 'Sports Complex', teacher: 'Coach R. Yadav', type: 'Practical' },
  ],
  Wednesday: [
    { period: '1', time: '08:30 - 09:15 AM', subject: 'Mathematics Problem Solving', code: 'MATH-041', room: 'Room 204', teacher: 'Mrs. Shalini Roy', type: 'Tutorial' },
    { period: '2', time: '09:15 - 10:00 AM', subject: 'Science (Biology Lab)', code: 'SCI-086', room: 'Bio Lab', teacher: 'Dr. Rajesh Nambiar', type: 'Practical' },
    { period: '3', time: '10:15 - 11:00 AM', subject: 'Social Science (Geography)', code: 'SOC-087', room: 'Room 204', teacher: 'Mrs. Meenakshi Joshi', type: 'Theory' },
    { period: '4', time: '11:00 - 11:45 AM', subject: 'English Writing Skills', code: 'ENG-184', room: 'Room 204', teacher: 'Mr. Arvind Saxena', type: 'Theory' },
    { period: '5', time: '12:15 - 01:00 PM', subject: 'Library & Reading Period', code: 'LIB-001', room: 'Central Library', teacher: 'Mrs. A. Sen', type: 'Tutorial' },
  ],
  Thursday: [
    { period: '1', time: '08:30 - 09:15 AM', subject: 'Mathematics (Algebra)', code: 'MATH-041', room: 'Room 204', teacher: 'Mrs. Shalini Roy', type: 'Theory' },
    { period: '2', time: '09:15 - 10:00 AM', subject: 'Science Lab (Physics Experiment)', code: 'SCI-086', room: 'Physics Lab 2', teacher: 'Dr. Rajesh Nambiar', type: 'Practical' },
    { period: '3', time: '10:15 - 11:00 AM', subject: 'English Language & Literature', code: 'ENG-184', room: 'Room 204', teacher: 'Mr. Arvind Saxena', type: 'Theory' },
    { period: '4', time: '11:00 - 11:45 AM', subject: 'Social Science (History & Civics)', code: 'SOC-087', room: 'Room 204', teacher: 'Mrs. Meenakshi Joshi', type: 'Theory' },
    { period: '5', time: '12:15 - 01:00 PM', subject: 'Computer Applications', code: 'CA-165', room: 'Computer Lab 1', teacher: 'Mr. Deepak Sharma', type: 'Theory' },
  ],
  Friday: [
    { period: '1', time: '08:30 - 09:15 AM', subject: 'Science (Theory Review)', code: 'SCI-086', room: 'Room 204', teacher: 'Dr. Rajesh Nambiar', type: 'Theory' },
    { period: '2', time: '09:15 - 10:00 AM', subject: 'Hindi Literature', code: 'HIN-002', room: 'Room 204', teacher: 'Dr. Kavita Verma', type: 'Theory' },
    { period: '3', time: '10:15 - 11:00 AM', subject: 'Mathematics Weekly Assessment', code: 'MATH-041', room: 'Room 204', teacher: 'Mrs. Shalini Roy', type: 'Tutorial' },
    { period: '4', time: '11:00 - 11:45 AM', subject: 'Art & Craft / Visual Arts', code: 'ART-021', room: 'Art Studio', teacher: 'Mr. T. Sen', type: 'Practical' },
    { period: '5', time: '12:15 - 01:00 PM', subject: 'Social Science (Economics)', code: 'SOC-087', room: 'Room 204', teacher: 'Mrs. Meenakshi Joshi', type: 'Theory' },
  ],
  Saturday: [
    { period: '1', time: '08:30 - 09:30 AM', subject: 'Co-Curricular Club Activity', code: 'CLUB-01', room: 'Auditorium', teacher: 'Faculty Leads', type: 'Practical' },
    { period: '2', time: '09:45 - 10:45 AM', subject: 'Remedial Class & Doubt Session', code: 'REM-10', room: 'Room 204', teacher: 'Class Mentors', type: 'Tutorial' },
    { period: '3', time: '11:00 - 12:00 PM', subject: 'Sports Practice & Drills', code: 'PE-048', room: 'Playground', teacher: 'Sports Coaches', type: 'Practical' },
  ],
};

export default function WeeklyTimetableScreen({
  onBackToDashboard,
  onSelectNav,
}: WeeklyTimetableScreenProps) {
  const [selectedDay, setSelectedDay] = useState('Thursday');
  const daySchedule = WEEKLY_SCHEDULE[selectedDay] || [];

  return (
    <div className="space-y-6">
      <PortalPageHeader
        title="Weekly Timetable"
        subtitle="Complete weekly class schedule organized by morning, midday, and afternoon periods"
        onBackToDashboard={onBackToDashboard}
      >
        <button
          type="button"
          onClick={() => onSelectNav('today-timetable')}
          className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-xs transition-colors"
        >
          View Today Only
        </button>
        <button
          type="button"
          onClick={() => alert('Full weekly timetable downloaded as PDF.')}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-semibold shadow-xs transition-colors"
        >
          <Download className="w-4 h-4" />
          <span>Download PDF</span>
        </button>
      </PortalPageHeader>

      {/* Day Selector Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
        {DAYS.map((day) => {
          const isSelected = selectedDay === day;
          return (
            <button
              key={day}
              type="button"
              onClick={() => setSelectedDay(day)}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                isSelected
                  ? 'bg-[#2563EB] text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200/80 hover:bg-slate-50'
              }`}
            >
              {day}
            </button>
          );
        })}
      </div>

      {/* Day Schedule Card */}
      <div className="bg-white rounded-[22px] shadow-[0_4px_20px_rgba(0,100,200,0.06)] border border-blue-50/80 p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2 text-slate-900 font-bold text-base">
            <Calendar className="w-5 h-5 text-blue-600" />
            <span>{selectedDay}&apos;s Class Schedule</span>
          </div>
          <span className="text-xs font-semibold text-slate-500">
            {daySchedule.length} Periods Scheduled
          </span>
        </div>

        {/* Schedule Grid Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 font-semibold uppercase text-[10px] tracking-wider">
                <th className="py-3 px-4">Period</th>
                <th className="py-3 px-4">Time Slot</th>
                <th className="py-3 px-4">Subject</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Room</th>
                <th className="py-3 px-4">Faculty</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {daySchedule.map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-3 px-4 font-bold text-blue-600">Period {row.period}</td>
                  <td className="py-3 px-4 font-medium text-slate-700 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>{row.time}</span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="font-bold text-slate-900 block">{row.subject}</span>
                    <span className="text-[10px] text-slate-400 font-mono">{row.code}</span>
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                        row.type === 'Practical'
                          ? 'bg-purple-50 text-purple-700 border border-purple-200'
                          : row.type === 'Tutorial'
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : 'bg-blue-50 text-blue-700 border border-blue-200'
                      }`}
                    >
                      {row.type}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-600 font-medium">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-slate-400" />
                      <span>{row.room}</span>
                    </span>
                  </td>
                  <td className="py-3 px-4 font-semibold text-slate-800">{row.teacher}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
