'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
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
  Building2,
  Users,
} from 'lucide-react';
import PageHeader from '@/components/ui/PageHeader';
import AdminCard from './ui/AdminCard';
import AdminButton from './ui/AdminButton';
import AdminModal from './ui/AdminModal';
import { assignTeacherSubstitutionAction, cancelTeacherSubstitutionAction } from '@/actions/admin/substitutions';
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

  const activeSubsCount = useMemo(() => {
    return recentSubstitutions.filter((s) => s.status === 'ASSIGNED').length;
  }, [recentSubstitutions]);

  // Open modal for a specific slot
  const openAssignModal = (slot: TimetableSlotItem) => {
    setTargetSlot(slot);
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
      const newSub: SubstitutionItem = {
        id: res.substitution.id,
        date: subDate,
        timetableEntryId: targetSlot.id,
        periodName: targetSlot.periodName,
        timeRange: `${targetSlot.startTime} - ${targetSlot.endTime}`,
        classSection: `${targetSlot.classGradeName}-${targetSlot.sectionName}`,
        subjectName: targetSlot.subjectName || 'General',
        originalTeacherName: targetSlot.teacherName || 'Faculty',
        substituteTeacherName: subTeacher?.name || 'Substitute',
        reason: subReason,
        status: 'ASSIGNED',
      };

      setRecentSubstitutions((prev) => [newSub, ...prev]);

      setTimetableSlots((prev) =>
        prev.map((s) => {
          if (s.id === targetSlot.id) {
            return {
              ...s,
              activeSubstitution: {
                id: res.substitution.id,
                substituteTeacherId: subTeacherId,
                substituteTeacherName: subTeacher?.name || 'Substitute',
                reason: subReason,
                status: 'ASSIGNED',
                date: subDate,
              },
            };
          }
          return s;
        })
      );

      setIsAssignModalOpen(false);
      setTargetSlot(null);
    } else {
      setAssignError(res.error || 'Failed to assign substitution.');
    }
  };

  // Cancel / Revoke substitution
  const handleCancelSubstitution = async (id: string) => {
    if (!confirm('Are you sure you want to revoke this substitution?')) return;

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
      {/* 1. Header with Breadcrumbs & Action */}
      <PageHeader
        title="Classes, Sections & Daily Schedule"
        subtitle="Manage section period rosters, daily class timetables, and on-the-fly teacher substitution coverage."
        breadcrumbs={[
          { label: 'Admin', href: '/admin' },
          { label: 'Academics' },
        ]}
        actions={
          <div className="flex items-center gap-2.5">
            <Link href="/admin/timetable">
              <AdminButton variant="secondary" icon={<Calendar className="w-3.5 h-3.5" />}>
                Master Builder
              </AdminButton>
            </Link>
            <Link href="/admin/teachers">
              <AdminButton variant="primary" icon={<GraduationCap className="w-3.5 h-3.5" />}>
                Faculty Directory
              </AdminButton>
            </Link>
          </div>
        }
      />

      {/* 2. KPI Metrics Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <AdminCard className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Sections</span>
            <div className="w-10 h-10 rounded-2xl bg-blue-50 text-[#0B72E7] flex items-center justify-center font-bold">
              <Building2 className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2">{sections.length}</div>
          <p className="text-xs font-medium text-slate-400 mt-1">Configured classrooms</p>
        </AdminCard>

        <AdminCard className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Periods</span>
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-emerald-600 mt-2">{timetableSlots.length}</div>
          <p className="text-xs font-medium text-slate-400 mt-1">Weekly instruction slots</p>
        </AdminCard>

        <AdminCard className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Active Substitutions</span>
            <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
              <UserCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-amber-600 mt-2">{activeSubsCount}</div>
          <p className="text-xs font-medium text-slate-400 mt-1">Faculty covering classes</p>
        </AdminCard>

        <AdminCard className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Faculty Available</span>
            <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-purple-600 mt-2">{teachers.length}</div>
          <p className="text-xs font-medium text-slate-400 mt-1">Teaching staff on roster</p>
        </AdminCard>
      </div>

      {/* 3. Section Selector & Day Selector Bar */}
      <AdminCard className="p-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Day of Week Navigation Strip */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
            {DAYS_OF_WEEK.map((day) => (
              <button
                key={day}
                onClick={() => setSelectedDay(day)}
                className={`px-4 py-2 text-xs font-bold rounded-xl transition-all whitespace-nowrap ${
                  selectedDay === day
                    ? 'bg-[#0B72E7] text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {day.charAt(0) + day.slice(1).toLowerCase()}
              </button>
            ))}
          </div>

          {/* Section Picker */}
          <div className="flex items-center gap-2.5 w-full md:w-auto shrink-0">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Class Section:</span>
            <select
              value={selectedSectionId}
              onChange={(e) => setSelectedSectionId(e.target.value)}
              className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:border-[#0B72E7] focus:outline-none transition-all shadow-xs"
            >
              {sections.map((sec) => (
                <option key={sec.id} value={sec.id}>
                  {sec.classGradeName} - Section {sec.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </AdminCard>

      {/* 4. Timetable Period Slots for Selected Day */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#0B72E7]" />
            {selectedDay.charAt(0) + selectedDay.slice(1).toLowerCase()} Schedule Grid
          </h2>
          <span className="text-xs font-semibold text-slate-400">{currentSlots.length} Scheduled Periods</span>
        </div>

        {currentSlots.length === 0 ? (
          <AdminCard className="p-12 text-center">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#0B72E7] flex items-center justify-center mx-auto mb-3">
              <Calendar className="w-6 h-6" />
            </div>
            <p className="text-sm font-bold text-slate-800">No timetable slots configured for {selectedDay}</p>
            <p className="text-xs text-slate-400 mt-1">Configure schedule in the Master Builder.</p>
          </AdminCard>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {currentSlots.map((slot) => {
              if (slot.isBreak) {
                return (
                  <div
                    key={slot.id}
                    className="bg-slate-50/80 border border-dashed border-slate-200 rounded-[20px] p-5 flex items-center justify-between"
                  >
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        Break Interval
                      </span>
                      <h4 className="text-sm font-bold text-slate-600">{slot.periodName}</h4>
                    </div>
                    <span className="text-xs font-mono font-bold text-slate-500 bg-white px-3 py-1 rounded-xl border border-slate-200/80 shadow-2xs">
                      {slot.startTime} - {slot.endTime}
                    </span>
                  </div>
                );
              }

              return (
                <AdminCard
                  key={slot.id}
                  className={`p-5 flex flex-col justify-between transition-all ${
                    slot.activeSubstitution
                      ? 'border-amber-200 bg-amber-50/20'
                      : 'hover:shadow-[0_8px_30px_rgba(30,64,175,0.08)]'
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                        {slot.periodName}
                      </span>
                      <span className="text-xs font-mono font-bold text-slate-700 bg-slate-50 px-2.5 py-0.5 rounded-lg border border-slate-100">
                        {slot.startTime} - {slot.endTime}
                      </span>
                    </div>

                    <div>
                      <div className="text-sm font-bold text-slate-900">
                        {slot.subjectName || 'Self Study / Activity'}
                      </div>
                      {slot.subjectCode && (
                        <span className="text-[11px] font-mono text-slate-400 block mt-0.5">{slot.subjectCode}</span>
                      )}
                    </div>

                    {/* Assigned Teacher */}
                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">Faculty</span>
                        <span className="font-bold text-slate-800">
                          {slot.teacherName || 'Not Assigned'}
                        </span>
                      </div>

                      {/* Substitution Pill if Active */}
                      {slot.activeSubstitution ? (
                        <div className="text-right">
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                            Covered by {slot.activeSubstitution.substituteTeacherName}
                          </span>
                        </div>
                      ) : (
                        <AdminButton
                          variant="secondary"
                          size="sm"
                          onClick={() => openAssignModal(slot)}
                          icon={<UserCheck className="w-3.5 h-3.5" />}
                        >
                          Substitute
                        </AdminButton>
                      )}
                    </div>
                  </div>
                </AdminCard>
              );
            })}
          </div>
        )}
      </div>

      {/* 5. Active & Recent Substitutions Audit Feed */}
      <AdminCard className="p-0 overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-[#F8FAFC]">
          <div className="flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-[#0B72E7]" />
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Faculty Substitution Records</h3>
          </div>
          <span className="text-xs text-slate-400 font-semibold">
            {recentSubstitutions.length} recorded substitutions
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F8FAFC] text-slate-400 font-bold uppercase tracking-wider text-[11px] border-b border-slate-100">
              <tr>
                <th className="py-3.5 px-5">Date</th>
                <th className="py-3.5 px-4">Period & Time</th>
                <th className="py-3.5 px-4">Class & Subject</th>
                <th className="py-3.5 px-4">Absent Teacher</th>
                <th className="py-3.5 px-4">Substitute Teacher</th>
                <th className="py-3.5 px-4">Reason</th>
                <th className="py-3.5 px-4 text-center">Status</th>
                <th className="py-3.5 px-5 text-right">Action</th>
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
                  <tr key={sub.id} className="hover:bg-blue-50/30 transition-colors">
                    <td className="py-3.5 px-5 font-mono font-bold text-slate-800">
                      {new Date(sub.date).toLocaleDateString('en-IN', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-800">{sub.periodName}</div>
                      <div className="text-[11px] text-slate-400 font-mono">{sub.timeRange}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-800">{sub.subjectName}</div>
                      <div className="text-[11px] text-slate-400">{sub.classSection}</div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-400 line-through">{sub.originalTeacherName}</td>
                    <td className="py-3.5 px-4 font-bold text-emerald-600">{sub.substituteTeacherName}</td>
                    <td className="py-3.5 px-4 text-slate-500">{sub.reason || 'Leave'}</td>
                    <td className="py-3.5 px-4 text-center">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
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
                    <td className="py-3.5 px-5 text-right">
                      {sub.status === 'ASSIGNED' && (
                        <button
                          onClick={() => handleCancelSubstitution(sub.id)}
                          disabled={cancellingId === sub.id}
                          className="px-2.5 py-1 text-xs text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded-lg transition-colors font-bold disabled:opacity-50"
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
      </AdminCard>

      {/* 6. MODAL: Assign Faculty Substitution */}
      <AdminModal
        isOpen={isAssignModalOpen && Boolean(targetSlot)}
        onClose={() => setIsAssignModalOpen(false)}
        title="Assign Faculty Substitution"
        description={targetSlot ? `${targetSlot.periodName} (${targetSlot.startTime} - ${targetSlot.endTime}) · ${targetSlot.subjectName}` : ''}
        maxWidth="md"
      >
        {targetSlot && (
          <form onSubmit={handleAssignSubstitution} className="space-y-4 text-xs">
            {assignError && (
              <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 flex items-center gap-2 font-medium">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{assignError}</span>
              </div>
            )}

            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100 flex items-center justify-between">
              <div>
                <span className="text-[11px] text-slate-400 block font-medium">Absent Teacher:</span>
                <span className="font-bold text-slate-900">{targetSlot.teacherName}</span>
              </div>
              <div className="text-right">
                <span className="text-[11px] text-slate-400 block font-medium">Class Section:</span>
                <span className="font-bold text-slate-800">
                  {targetSlot.classGradeName}-{targetSlot.sectionName}
                </span>
              </div>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Substitution Date</label>
              <input
                type="date"
                value={subDate}
                onChange={(e) => setSubDate(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-900 font-semibold focus:border-[#0B72E7] focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Select Substitute Teacher</label>
              <select
                value={subTeacherId}
                onChange={(e) => setSubTeacherId(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-900 font-semibold focus:border-[#0B72E7] focus:outline-none"
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
              <label className="font-bold text-slate-700 block mb-1">Reason for Substitution</label>
              <input
                type="text"
                placeholder="e.g. Medical leave, Emergency duty"
                value={subReason}
                onChange={(e) => setSubReason(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-900 font-semibold focus:border-[#0B72E7] focus:outline-none"
              />
            </div>

            <AdminButton
              type="submit"
              variant="primary"
              disabled={isSubmitting}
              isLoading={isSubmitting}
              icon={<UserCheck className="w-4 h-4" />}
              className="w-full py-3"
            >
              Assign Substitution Now
            </AdminButton>
          </form>
        )}
      </AdminModal>
    </div>
  );
}
