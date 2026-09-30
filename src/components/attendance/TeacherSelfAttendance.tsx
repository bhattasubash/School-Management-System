'use client';

import React, { useState, useEffect, useTransition } from 'react';
import {
  Clock,
  CheckCircle2,
  LogOut,
  CalendarCheck,
  AlertCircle,
  Calendar,
  Sparkles,
} from 'lucide-react';
import {
  markTeacherCheckInAction,
  markTeacherCheckOutAction,
  getTeacherAttendanceSummaryAction,
} from '@/actions/attendance';

interface AttendanceSummaryData {
  present: number;
  absent: number;
  late: number;
  totalDays: number;
  percentage: number;
  month: number;
  year: number;
}

interface TeacherSelfAttendanceProps {
  initialSummary?: AttendanceSummaryData | null;
  initialCheckInTime?: string | null;
  initialCheckOutTime?: string | null;
}

export default function TeacherSelfAttendance({
  initialSummary,
  initialCheckInTime,
  initialCheckOutTime,
}: TeacherSelfAttendanceProps) {
  const [checkInTime, setCheckInTime] = useState<string | null>(initialCheckInTime || null);
  const [checkOutTime, setCheckOutTime] = useState<string | null>(initialCheckOutTime || null);
  const [summary, setSummary] = useState<AttendanceSummaryData | null>(initialSummary || null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  // Load summary on mount if not provided
  useEffect(() => {
    if (!initialSummary) {
      getTeacherAttendanceSummaryAction().then((res) => {
        if (res.success && res.summary) {
          setSummary(res.summary);
          if (res.todayStatus) {
            setCheckInTime(res.todayStatus.checkInTime);
            setCheckOutTime(res.todayStatus.checkOutTime);
          }
        }
      });
    }
  }, [initialSummary]);

  const handleCheckIn = () => {
    setFeedback(null);
    startTransition(async () => {
      const res = await markTeacherCheckInAction();
      if (res.success && res.checkInTime) {
        setCheckInTime(res.checkInTime);
        setFeedback('Checked in successfully for today.');
        // Refresh summary
        const sumRes = await getTeacherAttendanceSummaryAction();
        if (sumRes.success && sumRes.summary) setSummary(sumRes.summary);
      } else {
        if (res.alreadyCheckedIn && res.checkInTime) {
          setCheckInTime(res.checkInTime);
          if (res.checkOutTime) setCheckOutTime(res.checkOutTime);
        }
        setFeedback(res.error || 'Failed to check in.');
      }
    });
  };

  const handleCheckOut = () => {
    setFeedback(null);
    startTransition(async () => {
      const res = await markTeacherCheckOutAction();
      if (res.success && res.checkOutTime) {
        setCheckOutTime(res.checkOutTime);
        setFeedback('Checked out successfully.');
      } else {
        setFeedback(res.error || 'Failed to check out.');
      }
    });
  };

  const formatTime = (isoString?: string | null) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    return date.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  const currentMonthName = new Date().toLocaleString('default', { month: 'long' });

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-orange-50 text-[#FA896B] flex items-center justify-center font-bold">
            <CalendarCheck className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">Faculty Daily Self-Attendance</h3>
            <p className="text-xs text-slate-500">Record your daily shift presence</p>
          </div>
        </div>

        {checkInTime && !checkOutTime && (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
            On Duty
          </span>
        )}
      </div>

      {feedback && (
        <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-700 flex items-center gap-2">
          <AlertCircle className="w-3.5 h-3.5 text-[#FA896B] shrink-0" />
          <span>{feedback}</span>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        {!checkInTime ? (
          <button
            type="button"
            onClick={handleCheckIn}
            disabled={isPending}
            className="w-full sm:w-auto flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#FA896B] hover:bg-[#f87552] text-white text-xs font-bold shadow-xs hover:shadow-md transition-all cursor-pointer disabled:opacity-50"
          >
            <Clock className="w-4 h-4" />
            <span>{isPending ? 'Marking Attendance...' : 'Mark My Attendance'}</span>
          </button>
        ) : (
          <div className="w-full sm:w-auto flex-1 flex flex-col sm:flex-row items-center gap-2">
            <div className="w-full sm:w-auto flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Checked In ✓ at {formatTime(checkInTime)}</span>
            </div>

            {!checkOutTime ? (
              <button
                type="button"
                onClick={handleCheckOut}
                disabled={isPending}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer disabled:opacity-50"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>{isPending ? 'Checking Out...' : 'Check Out'}</span>
              </button>
            ) : (
              <div className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-semibold">
                <span>Checked Out at {formatTime(checkOutTime)}</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Monthly Summary Statistics */}
      {summary && (
        <div className="pt-3 border-t border-slate-100">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
            {currentMonthName} Summary
          </div>
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
              <div className="text-xs text-slate-500 font-medium">Present</div>
              <div className="text-sm font-bold text-emerald-600">{summary.present} days</div>
            </div>
            <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
              <div className="text-xs text-slate-500 font-medium">Absent</div>
              <div className="text-sm font-bold text-rose-600">{summary.absent} days</div>
            </div>
            <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
              <div className="text-xs text-slate-500 font-medium">Rate</div>
              <div className="text-sm font-bold text-blue-600">{summary.percentage}%</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
