'use client';

import React from 'react';
import { Calendar, Clock, MapPin, Download, AlertCircle, FileCheck } from 'lucide-react';
import PortalPageHeader from '../PortalPageHeader';

interface ExamDateSheetScreenProps {
  onBackToDashboard: () => void;
  onSelectNav: (id: string) => void;
}

const EXAM_SCHEDULE = [
  { date: '15 Oct 2026', day: 'Thursday', time: '09:30 AM - 12:30 PM', reporting: '09:00 AM', subject: 'Mathematics (Standard / Basic)', code: 'MATH-041', room: 'Hall A (Senior Wing)', maxMarks: 80, daysLeft: 13 },
  { date: '18 Oct 2026', day: 'Sunday', time: '09:30 AM - 12:30 PM', reporting: '09:00 AM', subject: 'English Language & Literature', code: 'ENG-184', room: 'Hall A (Senior Wing)', maxMarks: 80, daysLeft: 16 },
  { date: '21 Oct 2026', day: 'Wednesday', time: '09:30 AM - 12:30 PM', reporting: '09:00 AM', subject: 'Science (Theory)', code: 'SCI-086', room: 'Hall B (Science Wing)', maxMarks: 80, daysLeft: 19 },
  { date: '24 Oct 2026', day: 'Saturday', time: '09:30 AM - 12:30 PM', reporting: '09:00 AM', subject: 'Social Science', code: 'SOC-087', room: 'Hall A (Senior Wing)', maxMarks: 80, daysLeft: 22 },
  { date: '27 Oct 2026', day: 'Tuesday', time: '09:30 AM - 12:30 PM', reporting: '09:00 AM', subject: 'Hindi Course A', code: 'HIN-002', room: 'Hall A (Senior Wing)', maxMarks: 80, daysLeft: 25 },
  { date: '30 Oct 2026', day: 'Friday', time: '09:30 AM - 11:30 AM', reporting: '09:00 AM', subject: 'Computer Applications', code: 'CA-165', room: 'Computer Lab 1', maxMarks: 50, daysLeft: 28 },
];

export default function ExamDateSheetScreen({
  onBackToDashboard,
  onSelectNav,
}: ExamDateSheetScreenProps) {
  return (
    <div className="space-y-6">
      <PortalPageHeader
        title="Exam Date Sheet"
        subtitle="Official timetable and room allocations for CBSE Term-1 Pre-Board Examinations 2026-27"
        onBackToDashboard={onBackToDashboard}
      >
        <button
          type="button"
          onClick={() => onSelectNav('exam-guidelines')}
          className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-xs transition-colors"
        >
          Exam Guidelines
        </button>
        <button
          type="button"
          onClick={() => alert('Official Admit Card downloaded as PDF.')}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-semibold shadow-xs transition-colors"
        >
          <Download className="w-4 h-4" />
          <span>Download Admit Card</span>
        </button>
      </PortalPageHeader>

      {/* Prominent Next Exam Countdown Card */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 rounded-[24px] shadow-[0_8px_30px_rgba(37,99,235,0.2)] p-6 sm:p-8 text-white flex flex-col sm:flex-row items-center justify-between gap-6">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-blue-200 bg-white/10 px-3 py-1 rounded-full">
            Upcoming Examination
          </span>
          <h2 className="text-2xl font-bold mt-2">Mathematics (Standard / Basic)</h2>
          <p className="text-xs text-blue-100 mt-1 flex items-center gap-3">
            <span>Thursday, 15 Oct 2026</span>
            <span>•</span>
            <span>09:30 AM - 12:30 PM</span>
            <span>•</span>
            <span>Hall A (Senior Wing)</span>
          </p>
        </div>

        <div className="flex items-center gap-3 bg-white/10 rounded-2xl p-4 border border-white/20 text-center shrink-0">
          <div>
            <span className="text-3xl font-extrabold block">13</span>
            <span className="text-[10px] uppercase font-semibold text-blue-200">Days Remaining</span>
          </div>
        </div>
      </div>

      {/* Date Sheet Table */}
      <div className="bg-white rounded-[22px] shadow-[0_4px_20px_rgba(0,100,200,0.06)] border border-blue-50/80 p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="text-base font-bold text-slate-900">Term 1 Assessment Date Sheet</h3>
          <span className="text-xs text-slate-400 font-medium">Class 10 - All Sections</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 font-semibold uppercase text-[10px] tracking-wider">
                <th className="py-3 px-4">Date & Day</th>
                <th className="py-3 px-4">Subject & Code</th>
                <th className="py-3 px-4">Timings</th>
                <th className="py-3 px-4">Reporting</th>
                <th className="py-3 px-4">Exam Hall</th>
                <th className="py-3 px-4 text-right">Max Marks</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {EXAM_SCHEDULE.map((exam, idx) => (
                <tr key={idx} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3.5 px-4">
                    <span className="font-bold text-slate-900 block">{exam.date}</span>
                    <span className="text-[11px] text-slate-400">{exam.day}</span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="font-bold text-blue-700 block">{exam.subject}</span>
                    <span className="text-[10px] font-mono text-slate-400">{exam.code}</span>
                  </td>
                  <td className="py-3.5 px-4 font-medium text-slate-700">{exam.time}</td>
                  <td className="py-3.5 px-4 font-semibold text-rose-600">{exam.reporting}</td>
                  <td className="py-3.5 px-4 text-slate-600">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      <span>{exam.room}</span>
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right font-bold text-slate-900">
                    {exam.maxMarks}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
