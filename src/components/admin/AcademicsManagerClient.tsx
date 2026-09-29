'use client';

import React, { useState, useMemo } from 'react';
import {
  CalendarDays,
  Clock,
  UserCheck,
  AlertCircle,
  Plus,
  X,
  CheckCircle2,
  Calendar,
  Layers,
  GraduationCap,
  Sparkles,
  BookOpen,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';
import { assignTeacherSubstitutionAction, cancelTeacherSubstitutionAction } from '@/actions/admin';
import { DayOfWeek } from '@prisma/client';

export interface TimetableSlotItem {
  id: string;
  sectionId: string;
  sectionName: string;
  classGradeName: string;
  periodName: string;
  startTime: string;
  endTime: string;
  order: number;
  isBreak: boolean;
  dayOfWeek: DayOfWeek;
  subjectName?: string | null;
  subjectCode?: string | null;
  teacherId?: string | null;
  teacherName?: string | null;
  activeSubstitution?: {
    id: string;
    substituteTeacherId: string;
    substituteTeacherName: string;
    reason?: string | null;
    status: string;
    date: string;
  } | null;
}

export interface TeacherLookupItem {
  id: string;
  name: string;
  department: string;
}

export interface SubstitutionItem {
  id: string;
  date: string;
  timetableEntryId: string;
  periodName: string;
  timeRange: string;
  classSection: string;
  subjectName: string;
  originalTeacherName: string;
  substituteTeacherName: string;
  reason?: string | null;
  status: string;
}

export interface AcademicsManagerClientProps {
  timetableSlots: TimetableSlotItem[];
  teachers: TeacherLookupItem[];
  sections: { id: string; name: string; classGradeName: string }[];
  recentSubstitutions: SubstitutionItem[];
}

const DAYS_OF_WEEK: DayOfWeek[] = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];

export default function AcademicsManagerClient({
  timetableSlots: initialSlots,
  teachers,
  sections,
  recentSubstitutions: initialSubs,
}: AcademicsManagerClientProps) {
  const [selectedSectionId, setSelectedSectionId] = useState<string>(sections[0]?.id || '');
  const [selectedDay, setSelectedDay] = useState<DayOfWeek>('MONDAY');
  const [timetableSlots, setTimetableSlots] = useState<TimetableSlotItem[]>(initialSlots);
  const [recentSubstitutions, setRecentSubstitutions] = useState<SubstitutionItem[]>(initialSubs);

  // Assign Substitution Modal
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [targetSlot, setTargetSlot] = useState<TimetableSlotItem | null>(null);
  const [subDate, setSubDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [subTeacherId, setSubTeacherId] = useState<string>('');
  const [subReason, setSubReason] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [assignError, setAssignError] = useState<string | null>(null);

  // Cancel Substitution state
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  // Filtered Slots for the selected Section & Day
  const currentSlots = useMemo(() => {
    return timetableSlots
      .filter((s) => s.sectionId === selectedSectionId && s.dayOfWeek === selectedDay)
      .sort((a, b) => a.order - b.order);
  }, [timetableSlots, selectedSectionId, selectedDay]);

  // Open modal for a specific slot
  const openAssignModal = (slot: TimetableSlotItem) => {
    setTargetSlot(slot);
    // Default to first teacher who isn't the primary teacher
    const candidate = teachers.find((t) => t.id !== slot.teacherId);
    setSubTeacherId(candidate?.id || '');
    setSubReason('Emergency substitution assigned by administration');
    setAssignError(null);
    setIsAssignModalOpen(true);
  };

  // Submit substitution assignment
  const handleAssignSubstitution = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetSlot) return;
    if (!subTeacherId) {
      setAssignError('Please select a substitute teacher.');
      return;
    }

    setIsSubmitting(true);
    setAssignError(null);

    const res = await assignTeacherSubstitutionAction({
      timetableEntryId: targetSlot.id,
      substituteTeacherId: subTeacherId,
      date: subDate,
      reason: subReason || undefined,
    });

    setIsSubmitting(false);

    if (res.success && res.substitution) {
      const subTeacher = teachers.find((t) => t.id === subTeacherId);

      // Update local timetable slot state
      setTimetableSlots((prev) =>
        prev.map((s) =>
          s.id === targetSlot.id
            ? {
                ...s,
                activeSubstitution: {
                  id: res.substitution.id,
                  substituteTeacherId: subTeacherId,
                  substituteTeacherName: subTeacher?.name || 'Substitute Teacher',
                  reason: subReason,
                  status: res.substitution.status,
                  date: res.substitution.date,
                },
              }
            : s
        )
      );

      // Add to recent substitutions table
      setRecentSubstitutions((prev) => [
        {
          id: res.substitution.id,
          date: subDate,
          timetableEntryId: targetSlot.id,
          periodName: targetSlot.periodName,
          timeRange: `${targetSlot.startTime} - ${targetSlot.endTime}`,
          classSection: `${targetSlot.classGradeName}-${targetSlot.sectionName}`,
          subjectName: targetSlot.subjectName || 'General',
          originalTeacherName: targetSlot.teacherName || 'Assigned Staff',
          substituteTeacherName: subTeacher?.name || 'Substitute Teacher',
          reason: subReason,
          status: 'ASSIGNED',
        },
        ...prev,
      ]);

      setIsAssignModalOpen(false);
      setTargetSlot(null);
    } else {
      setAssignError(res.error || 'Failed to assign substitution.');
    }
  };

  // Cancel substitution
  const handleCancelSubstitution = async (id: string) => {
    if (!confirm('Are you sure you want to cancel this substitution?')) return;
    setCancellingId(id);
    const res = await cancelTeacherSubstitutionAction(id);
    setCancellingId(null);

    if (res.success) {
      setRecentSubstitutions((prev) =>
        prev.map((s) => (s.id === id ? { ...s, status: 'CANCELLED' } : s))
      );
      setTimetableSlots((prev) =>
        prev.map((s) => (s.activeSubstitution?.id === id ? { ...s, activeSubstitution: null } : s))
      );
    } else {
      alert(res.error || 'Failed to cancel substitution.');
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              Academic Master Schedule
            </span>
            <span className="text-xs text-slate-500 font-medium">AY 2026-27</span>
          </div>
          <h1 className="text-2xl font-bold text-[#111C2D] tracking-tight">Timetable & Substitution Engine</h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage section period schedules and assign instant teacher substitutions during faculty absence.
          </p>
        </div>

        {/* Section Picker */}
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold text-slate-500">Class:</span>
          <select
            value={selectedSectionId}
            onChange={(e) => setSelectedSectionId(e.target.value)}
            className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#FF7555]/30 focus:border-[#FF7555]"
          >
            {sections.map((sec) => (
              <option key={sec.id} value={sec.id}>
                {sec.classGradeName} - Section {sec.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 2. Days of Week Navigation Strip */}
      <div className="bg-white p-2 rounded-2xl border border-slate-200/80 shadow-sm flex items-center gap-2 overflow-x-auto">
        {DAYS_OF_WEEK.map((day) => (
          <button
            key={day}
            onClick={() => setSelectedDay(day)}
            className={`flex-1 min-w-[100px] py-2.5 text-xs font-semibold rounded-xl transition-all ${
              selectedDay === day
                ? 'bg-[#111C2D] text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            {day.charAt(0) + day.slice(1).toLowerCase()}
          </button>
        ))}
      </div>

      {/* 3. Timetable Period Slots for Selected Day */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-[#111C2D] uppercase tracking-wider flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#FF7555]" />
            {selectedDay.charAt(0) + selectedDay.slice(1).toLowerCase()} Schedule Grid
          </h2>
          <span className="text-xs text-slate-500">{currentSlots.length} Scheduled Periods</span>
        </div>

        {currentSlots.length === 0 ? (
          <div className="bg-white p-12 text-center rounded-2xl border border-slate-200 text-slate-400 text-xs">
            No timetable slots configured for {selectedDay}.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {currentSlots.map((slot) => {
              if (slot.isBreak) {
                return (
                  <div
                    key={slot.id}
                    className="bg-slate-50 border border-dashed border-slate-300 rounded-2xl p-5 flex items-center justify-between"
                  >
                    <div>
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                        Interval
                      </span>
                      <h4 className="text-sm font-bold text-slate-600">{slot.periodName}</h4>
                    </div>
                    <span className="text-xs font-mono font-medium text-slate-500 bg-white px-3 py-1 rounded-xl border border-slate-200">
                      {slot.startTime} - {slot.endTime}
                    </span>
                  </div>
                );
              }

              return (
                <div
                  key={slot.id}
                  className={`bg-white rounded-2xl border p-5 shadow-sm transition-all flex flex-col justify-between ${
                    slot.activeSubstitution
                      ? 'border-amber-300 bg-amber-50/20'
                      : 'border-slate-200/80 hover:border-slate-300'
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                        {slot.periodName}
                      </span>
                      <span className="text-xs font-mono font-semibold text-slate-700 bg-slate-100 px-2.5 py-0.5 rounded-lg">
                        {slot.startTime} - {slot.endTime}
                      </span>
                    </div>

                    <div>
                      <div className="text-sm font-extrabold text-[#111C2D]">
                        {slot.subjectName || 'Self Study / Activity'}
                      </div>
                      {slot.subjectCode && (
                        <span className="text-[11px] font-mono text-slate-400 block">{slot.subjectCode}</span>
                      )}
                    </div>

                    {/* Assigned Teacher */}
                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase font-semibold">Faculty</span>
                        <span className="font-semibold text-slate-800">
                          {slot.teacherName || 'Not Assigned'}
                        </span>
                      </div>

                      {/* Substitution Pill if Active */}
                      {slot.activeSubstitution ? (
                        <div className="text-right">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                            Sub: {slot.activeSubstitution.substituteTeacherName}
                          </span>
                        </div>
                      ) : (
                        <button
                          onClick={() => openAssignModal(slot)}
                          className="px-2.5 py-1 text-[11px] font-semibold text-slate-600 hover:text-white bg-slate-100 hover:bg-[#FF7555] rounded-lg transition-colors"
                        >
                          + Substitute
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 4. Active & Recent Substitutions Audit Feed */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-emerald-600" />
            <h3 className="text-sm font-bold text-[#111C2D]">Faculty Substitution Records</h3>
          </div>
          <span className="text-xs text-slate-500 font-medium">
            {recentSubstitutions.length} recorded substitutions
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Period & Time</th>
                <th className="py-3 px-4">Class & Subject</th>
                <th className="py-3 px-4">Absent Teacher</th>
                <th className="py-3 px-4">Substitute Teacher</th>
                <th className="py-3 px-4">Reason</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recentSubstitutions.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    No active or recent substitutions recorded.
                  </td>
                </tr>
              ) : (
                recentSubstitutions.map((sub) => (
                  <tr key={sub.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3 px-4 font-mono font-medium text-slate-900">
                      {new Date(sub.date).toLocaleDateString('en-IN', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-800">{sub.periodName}</div>
                      <div className="text-[11px] text-slate-500 font-mono">{sub.timeRange}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-800">{sub.subjectName}</div>
                      <div className="text-[11px] text-slate-500">{sub.classSection}</div>
                    </td>
                    <td className="py-3 px-4 text-slate-600 line-through">{sub.originalTeacherName}</td>
                    <td className="py-3 px-4 font-bold text-emerald-700">{sub.substituteTeacherName}</td>
                    <td className="py-3 px-4 text-slate-600">{sub.reason || 'Leave'}</td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                          sub.status === 'ASSIGNED'
                            ? 'bg-amber-50 text-amber-700 border-amber-200'
                            : sub.status === 'COMPLETED'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-slate-100 text-slate-700 border-slate-200'
                        }`}
                      >
                        {sub.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      {sub.status === 'ASSIGNED' && (
                        <button
                          onClick={() => handleCancelSubstitution(sub.id)}
                          disabled={cancellingId === sub.id}
                          className="px-2.5 py-1 text-xs text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded-lg transition-colors font-medium disabled:opacity-50"
                        >
                          Revoke
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. MODAL: Assign Faculty Substitution */}
      {isAssignModalOpen && targetSlot && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
                  <UserCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-[#111C2D]">Assign Teacher Substitution</h3>
                  <p className="text-xs text-slate-500">
                    {targetSlot.periodName} ({targetSlot.startTime} - {targetSlot.endTime}) • {targetSlot.subjectName}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsAssignModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAssignSubstitution} className="p-6 space-y-4 text-xs">
              {assignError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>{assignError}</span>
                </div>
              )}

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-slate-500 block">Absent Teacher:</span>
                  <span className="font-bold text-slate-900">{targetSlot.teacherName}</span>
                </div>
                <div className="text-right">
                  <span className="text-[11px] text-slate-500 block">Class & Section:</span>
                  <span className="font-semibold text-slate-800">
                    {targetSlot.classGradeName}-{targetSlot.sectionName}
                  </span>
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Substitution Date</label>
                <input
                  type="date"
                  value={subDate}
                  onChange={(e) => setSubDate(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#FF7555]/30 focus:border-[#FF7555]"
                  required
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Select Substitute Teacher</label>
                <select
                  value={subTeacherId}
                  onChange={(e) => setSubTeacherId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#FF7555]/30 focus:border-[#FF7555]"
                  required
                >
                  {teachers
                    .filter((t) => t.id !== targetSlot.teacherId)
                    .map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name} ({t.department})
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Reason for Substitution</label>
                <input
                  type="text"
                  placeholder="e.g. Medical leave, Emergency family duty"
                  value={subReason}
                  onChange={(e) => setSubReason(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#FF7555]/30 focus:border-[#FF7555]"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 bg-[#FF7555] hover:bg-[#ff623d] text-white font-bold rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Recording Substitution...
                  </>
                ) : (
                  <>
                    <UserCheck className="w-4 h-4" />
                    Assign Substitution Now
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
