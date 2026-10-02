'use client';

import React, { useState, useEffect, useTransition, useMemo } from 'react';
import {
  CalendarDays,
  UserX,
  UserCheck,
  Clock,
  BookOpen,
  Building,
  CheckCircle2,
  AlertCircle,
  X,
  RefreshCw,
  Plus,
  Trash2,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';
import {
  PageHeader,
  SearchableSelect,
  DataCard,
  StatusBadge,
  EmptyState,
} from '@/components/ui';
import {
  getSubstitutionDayViewAction,
  getAvailableSubstitutesAction,
  assignTeacherSubstitutionAction,
  cancelTeacherSubstitutionAction,
} from '@/actions/admin/substitutions';

interface TeacherItem {
  id: string;
  name: string;
  employeeId: string;
  department: string;
  specialization?: string | null;
}

interface PeriodEntry {
  id: string;
  periodTimeSlot: {
    id: string;
    name: string;
    startTime: string;
    endTime: string;
    order: number;
  };
  section: {
    id: string;
    name: string;
    classGrade: { name: string };
  };
  subject: {
    id: string;
    name: string;
    code: string;
  } | null;
  teacher: {
    id: string;
    employeeId: string;
    department: string;
    user: { firstName: string; lastName: string };
  } | null;
}

interface SubstitutionRecord {
  id: string;
  timetableEntryId: string;
  status: string;
  date: Date;
  reason?: string | null;
  timetableEntry: {
    periodTimeSlot: { id: string; name: string; startTime: string; endTime: string; order: number };
    section: { id: string; name: string; classGrade: { name: string } };
    subject: { id: string; name: string; code: string } | null;
  };
  substituteTeacher: {
    id: string;
    employeeId: string;
    user: { firstName: string; lastName: string };
  };
}

interface SubstitutionManagerClientProps {
  schoolName: string;
  initialDate: string;
  teachers: TeacherItem[];
}

export default function SubstitutionManagerClient({
  schoolName,
  initialDate,
  teachers,
}: SubstitutionManagerClientProps) {
  const [selectedDate, setSelectedDate] = useState<string>(initialDate);
  const [isPending, startTransition] = useTransition();
  const [isLoading, setIsLoading] = useState(true);

  // Data from server for selected date
  const [dayEntries, setDayEntries] = useState<PeriodEntry[]>([]);
  const [substitutions, setSubstitutions] = useState<SubstitutionRecord[]>([]);
  const [dayOfWeekName, setDayOfWeekName] = useState<string>('');

  // Absent teachers tracking
  const [absentTeacherIds, setAbsentTeacherIds] = useState<string[]>([]);
  const [isMarkAbsentModalOpen, setIsMarkAbsentModalOpen] = useState(false);
  const [selectedAbsentTeacherId, setSelectedAbsentTeacherId] = useState('');

  // Available substitutes cache per slot: { [slotId]: TeacherItem[] }
  const [availableMap, setAvailableMap] = useState<Record<string, TeacherItem[]>>({});
  const [loadingSlotSubstitutes, setLoadingSlotSubstitutes] = useState<Record<string, boolean>>({});

  // Form selections for assigning: { [timetableEntryId]: substituteTeacherId }
  const [assignSelection, setAssignSelection] = useState<Record<string, string>>({});
  const [assignReasons, setAssignReasons] = useState<Record<string, string>>({});

  // Toast feedback
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Load day view
  const loadDayData = (dateStr: string) => {
    setIsLoading(true);
    setFeedback(null);
    getSubstitutionDayViewAction(dateStr).then((res) => {
      setIsLoading(false);
      if (res.success) {
        setDayEntries((res.entries || []) as unknown as PeriodEntry[]);
        setSubstitutions((res.substitutions || []) as unknown as SubstitutionRecord[]);
        setDayOfWeekName(res.dayOfWeek || '');

        // Derive teachers who already have substitutions marked
        const substitutedTeachers = new Set<string>();
        for (const sub of (res.substitutions || [])) {
          const entry = (res.entries || []).find((e) => e.id === sub.timetableEntryId);
          if (entry?.teacher?.id) {
            substitutedTeachers.add(entry.teacher.id);
          }
        }
        setAbsentTeacherIds((prev) => Array.from(new Set([...prev, ...Array.from(substitutedTeachers)])));
      } else {
        setFeedback({ type: 'error', message: res.error || 'Failed to load day schedule.' });
      }
    });
  };

  useEffect(() => {
    loadDayData(selectedDate);
  }, [selectedDate]);

  // Load available substitutes for a slot
  const fetchAvailableSubstitutes = async (slotId: string) => {
    if (availableMap[slotId] || loadingSlotSubstitutes[slotId]) return;

    setLoadingSlotSubstitutes((prev) => ({ ...prev, [slotId]: true }));
    const res = await getAvailableSubstitutesAction(selectedDate, slotId);
    setLoadingSlotSubstitutes((prev) => ({ ...prev, [slotId]: false }));

    if (res.success && res.teachers) {
      setAvailableMap((prev) => ({
        ...prev,
        [slotId]: res.teachers.map((t) => ({
          id: t.teacherId,
          name: t.name,
          employeeId: t.employeeId,
          department: t.department,
          specialization: t.specialization,
        })),
      }));
    }
  };

  // Mark teacher absent
  const handleMarkTeacherAbsent = () => {
    if (!selectedAbsentTeacherId) return;
    if (!absentTeacherIds.includes(selectedAbsentTeacherId)) {
      setAbsentTeacherIds((prev) => [...prev, selectedAbsentTeacherId]);
    }
    setIsMarkAbsentModalOpen(false);
    setSelectedAbsentTeacherId('');
    setFeedback({
      type: 'success',
      message: 'Teacher marked absent for this date. Review affected periods below.',
    });
  };

  // Remove teacher from absent list
  const handleRemoveAbsentTeacher = (teacherId: string) => {
    setAbsentTeacherIds((prev) => prev.filter((id) => id !== teacherId));
  };

  // Assign substitute to an entry
  const handleAssignSubstitute = (timetableEntryId: string, slotId: string) => {
    const subTeacherId = assignSelection[timetableEntryId];
    if (!subTeacherId) return;

    const reason = assignReasons[timetableEntryId] || 'Faculty Absence Cover';

    startTransition(async () => {
      const res = await assignTeacherSubstitutionAction({
        timetableEntryId,
        substituteTeacherId: subTeacherId,
        date: selectedDate,
        reason,
      });

      if (!res.success) {
        setFeedback({ type: 'error', message: res.error || 'Failed to assign substitute.' });
      } else {
        setFeedback({ type: 'success', message: 'Substitute teacher assigned successfully.' });
        loadDayData(selectedDate);
      }
    });
  };

  // Cancel substitution
  const handleCancelSubstitution = (substitutionId: string) => {
    startTransition(async () => {
      const res = await cancelTeacherSubstitutionAction(substitutionId);
      if (!res.success) {
        setFeedback({ type: 'error', message: res.error || 'Failed to cancel substitution.' });
      } else {
        setFeedback({ type: 'success', message: 'Substitution cancelled.' });
        loadDayData(selectedDate);
      }
    });
  };

  // Affected entries for absent teachers
  const affectedEntries = useMemo(() => {
    return dayEntries.filter(
      (entry) => entry.teacher && absentTeacherIds.includes(entry.teacher.id)
    );
  }, [dayEntries, absentTeacherIds]);

  const teacherOptions = teachers
    .filter((t) => !absentTeacherIds.includes(t.id))
    .map((t) => ({
      value: t.id,
      label: `${t.name} (${t.department} - ${t.employeeId})`,
    }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title="Faculty Substitution Cover Management"
        subtitle="Manage daily faculty absences, identify timetable gaps, and deploy qualified substitute teachers without scheduling clashes."
        actions={
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-white border border-slate-300 rounded-lg px-3 py-1.5 shadow-xs">
              <CalendarDays className="w-4 h-4 text-slate-500" />
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="text-xs font-semibold text-slate-800 outline-none bg-transparent"
              />
              {dayOfWeekName && (
                <span className="text-[11px] font-bold text-[#0B72E7] uppercase tracking-wider px-1.5 py-0.5 bg-orange-50 rounded">
                  {dayOfWeekName}
                </span>
              )}
            </div>

            <button
              onClick={() => setIsMarkAbsentModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-lg text-white bg-[#0F172A] hover:bg-slate-800 transition-colors shadow-xs cursor-pointer"
            >
              <UserX className="w-4 h-4 text-rose-400" />
              <span>Mark Teacher Absent</span>
            </button>
          </div>
        }
      />

      {/* Toast Feedback */}
      {feedback && (
        <div
          className={`p-3.5 rounded-lg flex items-center justify-between text-xs font-medium ${
            feedback.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-rose-50 text-rose-800 border border-rose-200'
          }`}
        >
          <div className="flex items-center gap-2">
            {feedback.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span>{feedback.message}</span>
          </div>
          <button
            onClick={() => setFeedback(null)}
            className="text-slate-400 hover:text-slate-700"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Absent Teachers Strip */}
      <DataCard padding="md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Absent Faculty on {new Date(selectedDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
            </div>
            <div className="text-xs text-slate-600 mt-0.5">
              {absentTeacherIds.length === 0
                ? 'No faculty members marked absent for today.'
                : `${absentTeacherIds.length} faculty member(s) marked absent • ${affectedEntries.length} total period(s) impacted.`}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {absentTeacherIds.map((id) => {
              const teacher = teachers.find((t) => t.id === id);
              return (
                <span
                  key={id}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-50 border border-rose-200 text-rose-800"
                >
                  <UserX className="w-3 h-3 text-rose-600" />
                  <span>{teacher?.name || 'Faculty Member'}</span>
                  <button
                    onClick={() => handleRemoveAbsentTeacher(id)}
                    className="hover:text-rose-950 p-0.5"
                    title="Remove absence"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              );
            })}
          </div>
        </div>
      </DataCard>

      {/* Grid of Affected Periods */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900">
            Periods Requiring Substitution Cover ({affectedEntries.length})
          </h3>
          <span className="text-xs text-slate-500">
            {substitutions.filter((s) => s.status === 'ASSIGNED').length} cover(s) actively assigned
          </span>
        </div>

        {isLoading ? (
          <div className="p-12 text-center text-slate-400 text-xs bg-white rounded-xl border border-slate-200 flex flex-col items-center gap-3">
            <RefreshCw className="w-6 h-6 animate-spin text-[#0B72E7]" />
            <span>Fetching schedule for {selectedDate}...</span>
          </div>
        ) : affectedEntries.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-8">
            <EmptyState
              icon={UserCheck}
              title="All Classes Fully Covered"
              description="No absent faculty with scheduled periods found for this date. If a teacher is absent, click 'Mark Teacher Absent' above."
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {affectedEntries.map((entry) => {
              const existingSub = substitutions.find(
                (s) => s.timetableEntryId === entry.id && s.status === 'ASSIGNED'
              );

              const slotId = entry.periodTimeSlot.id;
              const slotAvailableTeachers = availableMap[slotId] || [];
              const isLoadingSlotTeachers = loadingSlotSubstitutes[slotId];

              // Sort available substitutes: same department/specialization first!
              const sortedAvailable = [...slotAvailableTeachers].sort((a, b) => {
                const aMatch =
                  a.department === entry.teacher?.department ||
                  (entry.subject?.name && a.specialization?.toLowerCase().includes(entry.subject.name.toLowerCase()));
                const bMatch =
                  b.department === entry.teacher?.department ||
                  (entry.subject?.name && b.specialization?.toLowerCase().includes(entry.subject.name.toLowerCase()));
                if (aMatch && !bMatch) return -1;
                if (!aMatch && bMatch) return 1;
                return a.name.localeCompare(b.name);
              });

              const subOptions = sortedAvailable
                .filter((t) => t.id !== entry.teacher?.id && !absentTeacherIds.includes(t.id))
                .map((t) => {
                  const isSubjectMatch =
                    t.department === entry.teacher?.department ||
                    (entry.subject?.name && t.specialization?.toLowerCase().includes(entry.subject.name.toLowerCase()));
                  return {
                    value: t.id,
                    label: `${t.name} (${t.department}${isSubjectMatch ? ' ★ Match' : ''})`,
                  };
                });

              return (
                <div
                  key={entry.id}
                  className={`bg-white rounded-xl border p-4.5 transition-all shadow-xs ${
                    existingSub
                      ? 'border-emerald-200 bg-emerald-50/20'
                      : 'border-amber-200 bg-amber-50/20'
                  }`}
                >
                  {/* Top Meta */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-slate-900">
                          {entry.section.classGrade.name} - Section {entry.section.name}
                        </span>
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 text-slate-700">
                          {entry.periodTimeSlot.name} ({entry.periodTimeSlot.startTime} –{' '}
                          {entry.periodTimeSlot.endTime})
                        </span>
                      </div>
                      <div className="text-xs font-semibold text-slate-700 flex items-center gap-1.5 mt-1">
                        <BookOpen className="w-3.5 h-3.5 text-[#0B72E7]" />
                        <span>{entry.subject?.name || 'Class Period'}</span>
                        {entry.subject?.code && (
                          <span className="text-slate-400">({entry.subject.code})</span>
                        )}
                      </div>
                    </div>

                    <StatusBadge
                      status={existingSub ? 'ASSIGNED' : 'PENDING'}
                      colorMap={{
                        ASSIGNED: 'bg-emerald-100 text-emerald-800 border-emerald-300',
                        PENDING: 'bg-amber-100 text-amber-800 border-amber-300',
                      }}
                    />
                  </div>

                  {/* Primary Absent Teacher info */}
                  <div className="text-xs text-slate-600 bg-white/80 border border-slate-200 rounded-lg p-2.5 mb-3 flex items-center justify-between">
                    <div>
                      <span className="text-slate-400 font-medium">Original Teacher: </span>
                      <strong className="text-slate-900">
                        {entry.teacher
                          ? `${entry.teacher.user.firstName} ${entry.teacher.user.lastName}`
                          : 'Unassigned'}
                      </strong>
                    </div>
                    <span className="text-[11px] text-rose-600 font-semibold">Absent</span>
                  </div>

                  {/* Existing Assignment or Selection */}
                  {existingSub ? (
                    <div className="pt-2 border-t border-emerald-200/80 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs">
                          ✓
                        </div>
                        <div>
                          <div className="text-[11px] text-emerald-700 font-medium">Covering Teacher</div>
                          <div className="text-xs font-bold text-slate-900">
                            {existingSub.substituteTeacher.user.firstName}{' '}
                            {existingSub.substituteTeacher.user.lastName}
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => handleCancelSubstitution(existingSub.id)}
                        disabled={isPending}
                        className="text-xs font-semibold text-rose-600 hover:text-rose-800 hover:bg-rose-50 px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer"
                      >
                        Cancel Cover
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2.5 pt-2 border-t border-amber-200/80">
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="text-xs font-semibold text-slate-700">
                            Select Available Substitute
                          </label>
                          <button
                            type="button"
                            onClick={() => fetchAvailableSubstitutes(slotId)}
                            className="text-[11px] text-[#0B72E7] hover:underline"
                          >
                            {isLoadingSlotTeachers ? 'Checking free faculty...' : 'Check Available Teachers'}
                          </button>
                        </div>

                        <SearchableSelect
                          options={subOptions}
                          value={assignSelection[entry.id] || ''}
                          onChange={(val) => {
                            setAssignSelection((prev) => ({ ...prev, [entry.id]: val }));
                          }}
                          placeholder={
                            slotAvailableTeachers.length === 0
                              ? 'Click Check Available Teachers above'
                              : 'Select substitute teacher...'
                          }
                        />
                      </div>

                      <div className="flex items-center justify-end gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => handleAssignSubstitute(entry.id, slotId)}
                          disabled={isPending || !assignSelection[entry.id]}
                          className="px-3.5 py-1.5 text-xs font-bold text-white bg-[#0F172A] hover:bg-slate-800 disabled:opacity-50 rounded-lg transition-colors shadow-xs cursor-pointer inline-flex items-center gap-1.5"
                        >
                          <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
                          <span>{isPending ? 'Assigning...' : 'Confirm Assignment'}</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ==================================================================== */}
      {/* MARK TEACHER ABSENT MODAL                                            */}
      {/* ==================================================================== */}
      {isMarkAbsentModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-2xs">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-rose-100 text-rose-600 flex items-center justify-center font-bold">
                  <UserX className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Mark Teacher Absent</h3>
                  <p className="text-xs text-slate-500">
                    For {new Date(selectedDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsMarkAbsentModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-md"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Select Faculty Member
                </label>
                <SearchableSelect
                  options={teacherOptions}
                  value={selectedAbsentTeacherId}
                  onChange={setSelectedAbsentTeacherId}
                  placeholder="Choose teacher on leave..."
                />
              </div>

              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-slate-600 text-[11px] leading-relaxed">
                When marked absent, all scheduled classes for this faculty member on this date
                will appear in the substitution queue for substitute teacher assignment.
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsMarkAbsentModalOpen(false)}
                  className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleMarkTeacherAbsent}
                  disabled={!selectedAbsentTeacherId}
                  className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 disabled:opacity-50 rounded-lg transition-colors shadow-xs cursor-pointer"
                >
                  Confirm Absence
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
