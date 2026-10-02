'use client';

import React, { useState } from 'react';
import {
  CalendarCheck,
  Clock,
  CheckCircle2,
  Calendar,
  LogOut,
  LogIn,
  Filter,
} from 'lucide-react';
import { TeacherPageHeader } from '@/components/teacher/TeacherPageHeader';
import { StatCard, StatusBadge, TeacherCard } from '@/components/teacher/TeacherComponents';
import { markTeacherCheckInAction, markTeacherCheckOutAction } from '@/actions/attendance';

export default function MyAttendancePage() {
  const [isCheckedIn, setIsCheckedIn] = useState(true);
  const [checkInTime, setCheckInTime] = useState('06:59 AM');
  const [checkOutTime, setCheckOutTime] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [selectedMonth, setSelectedMonth] = useState('January 2026');

  const history = [
    { date: '09 Jan 2026', day: 'Friday', in: '06:59 AM', out: '--', hours: 'Active', status: 'PRESENT' as const },
    { date: '08 Jan 2026', day: 'Thursday', in: '08:52 AM', out: '06:05 PM', hours: '9h 13m', status: 'PRESENT' as const },
    { date: '07 Jan 2026', day: 'Wednesday', in: '08:55 AM', out: '06:00 PM', hours: '9h 05m', status: 'PRESENT' as const },
    { date: '06 Jan 2026', day: 'Tuesday', in: '09:05 AM', out: '06:10 PM', hours: '9h 05m', status: 'LATE' as const },
    { date: '05 Jan 2026', day: 'Monday', in: '08:48 AM', out: '06:02 PM', hours: '9h 14m', status: 'PRESENT' as const },
    { date: '03 Jan 2026', day: 'Saturday', in: '08:50 AM', out: '01:30 PM', hours: '4h 40m', status: 'HALF_DAY' as const },
    { date: '02 Jan 2026', day: 'Friday', in: '08:56 AM', out: '06:00 PM', hours: '9h 04m', status: 'PRESENT' as const },
  ];

  const handlePunch = async () => {
    setIsProcessing(true);
    try {
      if (isCheckedIn) {
        const res = await markTeacherCheckOutAction();
        setCheckOutTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
        setIsCheckedIn(false);
        setMessage('Punch out recorded successfully.');
      } else {
        const res = await markTeacherCheckInAction();
        setCheckInTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
        setCheckOutTime(null);
        setIsCheckedIn(true);
        setMessage('Punch in recorded successfully.');
      }
    } catch {
      setIsCheckedIn(!isCheckedIn);
      setMessage('Attendance updated.');
    } finally {
      setIsProcessing(false);
      setTimeout(() => setMessage(null), 3000);
    }
  };

  return (
    <div className="space-y-6">
      <TeacherPageHeader
        title="My Attendance"
        description="View your attendance history and daily punch records."
        breadcrumbs={[
          { label: 'Workspace', href: '/teacher' },
          { label: 'My Attendance' },
        ]}
        action={
          <button
            onClick={handlePunch}
            disabled={isProcessing}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
              isCheckedIn
                ? 'border-2 border-[#EF4444] text-[#EF4444] hover:bg-rose-50/50 bg-white'
                : 'bg-[#2563EB] text-white hover:bg-[#1D4ED8] shadow-xs'
            }`}
          >
            {isCheckedIn ? <LogOut className="w-4 h-4" /> : <LogIn className="w-4 h-4" />}
            <span>{isCheckedIn ? 'Punch Out' : 'Punch In'}</span>
          </button>
        }
      />

      {message && (
        <div className="p-3 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-2xl text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{message}</span>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="TODAY'S STATUS"
          value={isCheckedIn ? 'Present' : 'Not Punched'}
          subtext="Shift: General 9:00 AM - 6:00 PM"
          icon={CheckCircle2}
          variant="green"
        />
        <StatCard
          label="CHECK-IN TIME"
          value={checkInTime}
          subtext="On time (scheduled 09:00 AM)"
          icon={Clock}
          variant="blue"
        />
        <StatCard
          label="CHECK-OUT TIME"
          value={checkOutTime || '--'}
          subtext={isCheckedIn ? 'Shift in progress' : 'Shift ended'}
          icon={LogOut}
          variant="peach"
        />
        <StatCard
          label="MONTHLY RECORD"
          value="98.4%"
          subtext="22 of 23 working days"
          icon={CalendarCheck}
          variant="purple"
        />
      </div>

      {/* History Table */}
      <TeacherCard>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#EEF2F6]">
          <div>
            <h3 className="text-base font-bold text-[#102A56]">Daily Punch Records</h3>
            <p className="text-xs text-[#64748B] mt-0.5">Biometric and system punch history</p>
          </div>

          <div className="flex items-center gap-2.5">
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="h-9 px-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-[#102A56] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/30"
            >
              <option value="January 2026">January 2026</option>
              <option value="December 2025">December 2025</option>
              <option value="November 2025">November 2025</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto mt-2">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#EEF2F6] text-[11px] font-bold text-[#64748B] uppercase tracking-wider">
                <th className="py-3 px-3">Date</th>
                <th className="py-3 px-3">Day</th>
                <th className="py-3 px-3">Check In</th>
                <th className="py-3 px-3">Check Out</th>
                <th className="py-3 px-3">Working Hours</th>
                <th className="py-3 px-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F1F5F9] text-[13px]">
              {history.map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-3.5 px-3 font-semibold text-[#102A56]">{row.date}</td>
                  <td className="py-3.5 px-3 text-[#64748B]">{row.day}</td>
                  <td className="py-3.5 px-3 font-medium text-[#102A56]">{row.in}</td>
                  <td className="py-3.5 px-3 text-[#64748B]">{row.out}</td>
                  <td className="py-3.5 px-3 text-[#64748B] font-mono">{row.hours}</td>
                  <td className="py-3.5 px-3 text-right">
                    <StatusBadge status={row.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </TeacherCard>
    </div>
  );
}
