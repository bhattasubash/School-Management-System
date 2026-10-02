'use client';

import React, { useState, useEffect, useTransition, useMemo } from 'react';
import {
  CalendarDays,
  Clock,
  Copy,
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  AlertCircle,
  Settings,
  Coffee,
  BookOpen,
  User,
  MapPin,
  X,
  RefreshCw,
} from 'lucide-react';
import {
  SearchableSelect,
  PageHeader,
  ConfirmDialog,
  StatusBadge,
  DataCard,
  EmptyState,
} from '@/components/ui';
import {
  getTimetableAction,
  saveTimetableEntryAction,
  deleteTimetableEntryAction,
  cloneTimetableAction,
  createPeriodTimeSlotAction,
  updatePeriodTimeSlotAction,
  deletePeriodTimeSlotAction,
  updateWorkingDaysAction,
} from '@/actions/admin/timetable';
import type { DayOfWeek } from '@prisma/client';

export interface SectionOption {
  id: string;
  name: string;
  classGradeId: string;
  className: string;
}

export interface ClassGradeOption {
  id: string;
  name: string;
  sections: SectionOption[];
}

export interface TimeSlotItem {
  id: string;
  name: string;
  startTime: string;
  endTime: string;
  order: number;
  isBreak: boolean;
}

export interface SubjectOption {
  id: string;
  name: string;
  code?: string | null;
}

export interface TeacherOption {
  id: string;
  name: string;
  employeeId: string;
  department: string;
  specialization?: string | null;
}

export interface TimetableEntryItem {
  id: string;
  sectionId: string;
  periodTimeSlotId: string;
  subjectId?: string | null;
  teacherId?: string | null;
  dayOfWeek: DayOfWeek;
  roomNumber?: string | null;
  subject?: { id: string; name: string; code: string } | null;
  teacher?: {
    id: string;
    employeeId: string;
    user: { firstName: string; lastName: string };
  } | null;
  periodTimeSlot: {
    id: string;
    name: string;
    startTime: string;
    endTime: string;
    order: number;
    isBreak: boolean;
  };
}

interface TimetableBuilderClientProps {
  schoolName: string;
  workingDays: DayOfWeek[];
  classGrades: ClassGradeOption[];
  initialTimeSlots: TimeSlotItem[];
  subjects: SubjectOption[];
  teachers: TeacherOption[];
}

const ALL_DAYS: { key: DayOfWeek; label: string }[] = [
  { key: 'MONDAY', label: 'Monday' },
  { key: 'TUESDAY', label: 'Tuesday' },
  { key: 'WEDNESDAY', label: 'Wednesday' },
  { key: 'THURSDAY', label: 'Thursday' },
  { key: 'FRIDAY', label: 'Friday' },
  { key: 'SATURDAY', label: 'Saturday' },
  { key: 'SUNDAY', label: 'Sunday' },
];

export default function TimetableBuilderClient({
  schoolName,
  workingDays: initialWorkingDays,
  classGrades,
  initialTimeSlots,
  subjects,
  teachers,
}: TimetableBuilderClientProps) {
  // Navigation & selection state
  const [selectedClassId, setSelectedClassId] = useState<string>(classGrades[0]?.id || '');
  const availableSections = useMemo(() => {
    const cg = classGrades.find((c) => c.id === selectedClassId);
    return cg?.sections || [];
  }, [classGrades, selectedClassId]);

  const [selectedSectionId, setSelectedSectionId] = useState<string>(availableSections[0]?.id || '');

  // Keep section synced when class changes
  useEffect(() => {
    if (availableSections.length > 0 && !availableSections.some((s) => s.id === selectedSectionId)) {
      setSelectedSectionId(availableSections[0].id);
    }
  }, [availableSections, selectedSectionId]);

  // Timetable entries & time slots
  const [entries, setEntries] = useState<TimetableEntryItem[]>([]);
  const [timeSlots, setTimeSlots] = useState<TimeSlotItem[]>(initialTimeSlots);
  const [activeDays, setActiveDays] = useState<DayOfWeek[]>(initialWorkingDays);
  const [isLoadingEntries, setIsLoadingEntries] = useState(false);
  const [isPending, startTransition] = useTransition();

  // Feedback notifications
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Modals state
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [isSlotManagerOpen, setIsSlotManagerOpen] = useState(false);
  const [isCloneModalOpen, setIsCloneModalOpen] = useState(false);
  const [isDaysConfigOpen, setIsDaysConfigOpen] = useState(false);

  // Active cell being edited/created
  const [targetSlot, setTargetSlot] = useState<{
    dayOfWeek: DayOfWeek;
    periodTimeSlotId: string;
    existingEntry?: TimetableEntryItem;
  } | null>(null);

  // Form states for assignment modal
  const [assignSubjectId, setAssignSubjectId] = useState('');
  const [assignTeacherId, setAssignTeacherId] = useState('');
  const [assignRoomNumber, setAssignRoomNumber] = useState('');
  const [assignError, setAssignError] = useState<string | null>(null);

  // Clone modal state
  const [cloneSourceSectionId, setCloneSourceSectionId] = useState('');
  const [cloneError, setCloneError] = useState<string | null>(null);

  // Time slot manager form state
  const [editingSlotId, setEditingSlotId] = useState<string | null>(null);
  const [slotFormName, setSlotFormName] = useState('');
  const [slotFormStart, setSlotFormStart] = useState('08:00');
  const [slotFormEnd, setSlotFormEnd] = useState('08:45');
  const [slotFormOrder, setSlotFormOrder] = useState<number>(timeSlots.length + 1);
  const [slotFormIsBreak, setSlotFormIsBreak] = useState(false);
  const [slotError, setSlotError] = useState<string | null>(null);

  // Load timetable entries when section changes
  useEffect(() => {
    if (!selectedSectionId) {
      setEntries([]);
      return;
    }

    let isMounted = true;
    setIsLoadingEntries(true);
    setFeedback(null);

    getTimetableAction(selectedSectionId).then((res) => {
      if (isMounted) {
        setIsLoadingEntries(false);
        if (res.success && res.entries) {
          setEntries(res.entries as unknown as TimetableEntryItem[]);
        } else {
          setFeedback({ type: 'error', message: res.error || 'Failed to load timetable.' });
        }
      }
    });

    return () => {
      isMounted = false;
    };
  }, [selectedSectionId]);

  // Open Assign / Edit Modal
  const handleCellClick = (day: DayOfWeek, slotId: string) => {
    const existing = entries.find(
      (e) => e.dayOfWeek === day && e.periodTimeSlotId === slotId
    );

    setTargetSlot({
      dayOfWeek: day,
      periodTimeSlotId: slotId,
      existingEntry: existing,
    });

    setAssignSubjectId(existing?.subjectId || '');
    setAssignTeacherId(existing?.teacherId || '');
    setAssignRoomNumber(existing?.roomNumber || '');
    setAssignError(null);
    setIsAssignModalOpen(true);
  };

  // Save entry handler
  const handleSaveEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetSlot || !selectedSectionId) return;

    setAssignError(null);

    startTransition(async () => {
      const res = await saveTimetableEntryAction({
        sectionId: selectedSectionId,
        periodTimeSlotId: targetSlot.periodTimeSlotId,
        dayOfWeek: targetSlot.dayOfWeek,
        subjectId: assignSubjectId || null,
        teacherId: assignTeacherId || null,
        roomNumber: assignRoomNumber || null,
        entryId: targetSlot.existingEntry?.id,
      });

      if (!res.success) {
        setAssignError(res.error || 'Failed to save period.');
      } else {
        // Refresh timetable
        const refreshed = await getTimetableAction(selectedSectionId);
        if (refreshed.success && refreshed.entries) {
          setEntries(refreshed.entries as unknown as TimetableEntryItem[]);
        }
        setIsAssignModalOpen(false);
        setFeedback({ type: 'success', message: 'Timetable entry updated successfully.' });
      }
    });
  };

  // Delete entry handler
  const handleDeleteEntry = async () => {
    if (!targetSlot?.existingEntry) return;

    startTransition(async () => {
      const res = await deleteTimetableEntryAction(targetSlot.existingEntry!.id);
      if (!res.success) {
        setAssignError(res.error || 'Failed to delete entry.');
      } else {
        setEntries((prev) => prev.filter((e) => e.id !== targetSlot.existingEntry!.id));
        setIsAssignModalOpen(false);
        setFeedback({ type: 'success', message: 'Timetable entry removed.' });
      }
    });
  };

  // Clone timetable handler
  const handleCloneTimetable = async () => {
    if (!cloneSourceSectionId || !selectedSectionId) return;
    setCloneError(null);

    startTransition(async () => {
      const res = await cloneTimetableAction({
        fromSectionId: cloneSourceSectionId,
        toSectionId: selectedSectionId,
      });

      if (!res.success) {
        setCloneError(res.error || 'Failed to clone timetable.');
      } else {
        // Refresh entries
        const refreshed = await getTimetableAction(selectedSectionId);
        if (refreshed.success && refreshed.entries) {
          setEntries(refreshed.entries as unknown as TimetableEntryItem[]);
        }
        setIsCloneModalOpen(false);
        setFeedback({
          type: 'success',
          message: `Successfully cloned ${res.count} periods (teacher assignments cleared).`,
        });
      }
    });
  };

  // Slot management save
  const handleSaveSlot = async (e: React.FormEvent) => {
    e.preventDefault();
    setSlotError(null);

    startTransition(async () => {
      if (editingSlotId) {
        const res = await updatePeriodTimeSlotAction({
          id: editingSlotId,
          name: slotFormName,
          startTime: slotFormStart,
          endTime: slotFormEnd,
          order: Number(slotFormOrder),
          isBreak: slotFormIsBreak,
        });

        if (!res.success) {
          setSlotError(res.error || 'Failed to update time slot.');
        } else {
          setTimeSlots((prev) =>
            prev.map((s) => (s.id === editingSlotId ? { ...s, ...res.slot! } : s)).sort((a, b) => a.order - b.order)
          );
          resetSlotForm();
        }
      } else {
        const res = await createPeriodTimeSlotAction({
          name: slotFormName,
          startTime: slotFormStart,
          endTime: slotFormEnd,
          order: Number(slotFormOrder),
          isBreak: slotFormIsBreak,
        });

        if (!res.success) {
          setSlotError(res.error || 'Failed to create time slot.');
        } else {
          setTimeSlots((prev) => [...prev, res.slot!].sort((a, b) => a.order - b.order));
          resetSlotForm();
        }
      }
    });
  };

  const resetSlotForm = () => {
    setEditingSlotId(null);
    setSlotFormName('');
    setSlotFormStart('08:00');
    setSlotFormEnd('08:45');
    setSlotFormOrder(timeSlots.length + 1);
    setSlotFormIsBreak(false);
    setSlotError(null);
  };

  const handleDeleteSlot = async (slotId: string) => {
    startTransition(async () => {
      const res = await deletePeriodTimeSlotAction(slotId);
      if (!res.success) {
        setSlotError(res.error || 'Failed to delete time slot.');
      } else {
        setTimeSlots((prev) => prev.filter((s) => s.id !== slotId));
      }
    });
  };

  // Toggle active days (e.g. Saturday)
  const handleToggleDay = async (day: DayOfWeek) => {
    const updated = activeDays.includes(day)
      ? activeDays.filter((d) => d !== day)
      : [...activeDays, day];

    if (updated.length === 0) return;

    setActiveDays(updated);
    startTransition(async () => {
      const res = await updateWorkingDaysAction(updated);
      if (res.success) {
        setFeedback({ type: 'success', message: 'School working days updated.' });
      } else {
        setFeedback({ type: 'error', message: res.error || 'Failed to update working days.' });
      }
    });
  };

  // Options for selects
  const classOptions = classGrades.map((cg) => ({ value: cg.id, label: cg.name }));
  const sectionOptions = availableSections.map((sec) => ({ value: sec.id, label: `Section ${sec.name}` }));
  const allSectionsFlat = classGrades.flatMap((cg) =>
    cg.sections.map((sec) => ({
      value: sec.id,
      label: `${cg.name} - Section ${sec.name}`,
    }))
  );

  const subjectOptions = [
    { value: '', label: '-- None (Free Period) --' },
    ...subjects.map((sub) => ({
      value: sub.id,
      label: `${sub.name} ${sub.code ? `(${sub.code})` : ''}`,
    })),
  ];

  const teacherOptions = [
    { value: '', label: '-- Unassigned --' },
    ...teachers.map((t) => ({
      value: t.id,
      label: `${t.name} (${t.department}${t.specialization ? ` - ${t.specialization}` : ''})`,
    })),
  ];

  const currentSectionName = availableSections.find((s) => s.id === selectedSectionId)?.name;
  const currentClassName = classGrades.find((c) => c.id === selectedClassId)?.name;

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <PageHeader
        title="Master Timetable Builder"
        subtitle="Configure weekly period schedules, assign faculty and classrooms, and resolve timetable conflicts."
        actions={
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => setIsDaysConfigOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 transition-colors shadow-xs"
            >
              <CalendarDays className="w-3.5 h-3.5 text-slate-500" />
              <span>Working Days ({activeDays.length})</span>
            </button>
            <button
              onClick={() => setIsSlotManagerOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 transition-colors shadow-xs"
            >
              <Settings className="w-3.5 h-3.5 text-slate-500" />
              <span>Manage Period Slots</span>
            </button>
            <button
              onClick={() => {
                setCloneSourceSectionId('');
                setCloneError(null);
                setIsCloneModalOpen(true);
              }}
              disabled={!selectedSectionId}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 transition-colors shadow-xs disabled:opacity-50"
            >
              <Copy className="w-3.5 h-3.5 text-slate-500" />
              <span>Clone Timetable</span>
            </button>
          </div>
        }
      />

      {/* Notification Toast */}
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

      {/* Selectors Bar */}
      <DataCard padding="md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="w-48">
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Select Class
              </label>
              <SearchableSelect
                options={classOptions}
                value={selectedClassId}
                onChange={(val) => {
                  setSelectedClassId(val);
                }}
                placeholder="Choose Class"
              />
            </div>

            <div className="w-48">
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Select Section
              </label>
              <SearchableSelect
                options={sectionOptions}
                value={selectedSectionId}
                onChange={setSelectedSectionId}
                placeholder="Choose Section"
                disabled={availableSections.length === 0}
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="text-xs font-bold text-slate-800">
                {currentClassName ? `${currentClassName} - Section ${currentSectionName}` : 'Select a Section'}
              </div>
              <div className="text-xs text-slate-500">
                {entries.length} scheduled periods • {timeSlots.length} daily slots
              </div>
            </div>
          </div>
        </div>
      </DataCard>

      {/* Weekly Grid */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        {isLoadingEntries ? (
          <div className="p-12 text-center text-slate-400 text-xs flex flex-col items-center gap-3">
            <RefreshCw className="w-6 h-6 animate-spin text-[#0B72E7]" />
            <span>Loading section schedule...</span>
          </div>
        ) : timeSlots.length === 0 ? (
          <EmptyState
            icon={Clock}
            title="No Period Time Slots"
            description="Create daily period slots (e.g. Period 1, Break, Period 2) to build the timetable."
            action={{
              label: 'Configure Time Slots',
              onClick: () => setIsSlotManagerOpen(true),
            }}
          />
        ) : !selectedSectionId ? (
          <div className="p-12 text-center text-slate-400 text-xs">
            Please select a class and section to view or edit the timetable.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="bg-[#0F172A] text-white border-b border-slate-800">
                  <th className="p-3.5 text-xs font-bold w-44 sticky left-0 bg-[#0F172A] z-10 border-r border-slate-800">
                    Period / Time
                  </th>
                  {ALL_DAYS.filter((d) => activeDays.includes(d.key)).map((d) => (
                    <th
                      key={d.key}
                      className="p-3.5 text-xs font-bold text-center border-r border-slate-800 last:border-r-0 min-w-[160px]"
                    >
                      {d.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-xs">
                {timeSlots.map((slot) => {
                  if (slot.isBreak) {
                    return (
                      <tr key={slot.id} className="bg-amber-50/60">
                        <td className="p-3 font-semibold text-amber-900 border-r border-slate-200 sticky left-0 bg-amber-50/90 z-10">
                          <div className="flex items-center gap-2">
                            <Coffee className="w-3.5 h-3.5 text-amber-600" />
                            <span>{slot.name}</span>
                          </div>
                          <div className="text-xs text-amber-700/80 font-normal">
                            {slot.startTime} – {slot.endTime}
                          </div>
                        </td>
                        <td
                          colSpan={activeDays.length}
                          className="p-3 text-center text-amber-800 font-medium italic"
                        >
                          ☕ Recess / Break Interval ({slot.startTime} to {slot.endTime})
                        </td>
                      </tr>
                    );
                  }

                  return (
                    <tr key={slot.id} className="hover:bg-slate-50/40 transition-colors">
                      {/* Row Header */}
                      <td className="p-3.5 border-r border-slate-200 sticky left-0 bg-white z-10 shadow-xs">
                        <div className="font-bold text-slate-800 flex items-center gap-1.5">
                          <span>{slot.name}</span>
                        </div>
                        <div className="text-xs text-slate-400 font-mono mt-0.5">
                          {slot.startTime} – {slot.endTime}
                        </div>
                      </td>

                      {/* Day Columns */}
                      {ALL_DAYS.filter((d) => activeDays.includes(d.key)).map((day) => {
                        const entry = entries.find(
                          (e) => e.dayOfWeek === day.key && e.periodTimeSlotId === slot.id
                        );

                        return (
                          <td
                            key={day.key}
                            className="p-2 border-r border-slate-200 last:border-r-0 align-top"
                          >
                            {entry ? (
                              <div
                                onClick={() => handleCellClick(day.key, slot.id)}
                                className="group relative bg-white hover:bg-slate-50 border border-slate-200 hover:border-[#0B72E7] rounded-lg p-2.5 shadow-2xs hover:shadow-xs transition-all cursor-pointer border-l-4 border-l-[#0B72E7]"
                              >
                                <div className="flex items-start justify-between gap-1 mb-1">
                                  <span className="font-bold text-slate-900 line-clamp-1">
                                    {entry.subject?.name || 'Assigned'}
                                  </span>
                                  {entry.subject?.code && (
                                    <span className="text-[10px] font-mono px-1 py-0.5 bg-slate-100 text-slate-600 rounded">
                                      {entry.subject.code}
                                    </span>
                                  )}
                                </div>

                                <div className="flex items-center gap-1.5 text-xs text-slate-600 mt-1">
                                  <User className="w-3 h-3 text-slate-400 shrink-0" />
                                  <span className="truncate">
                                    {entry.teacher
                                      ? `${entry.teacher.user.firstName} ${entry.teacher.user.lastName}`
                                      : 'No teacher'}
                                  </span>
                                </div>

                                {entry.roomNumber && (
                                  <div className="flex items-center gap-1 text-[11px] text-slate-500 mt-1">
                                    <MapPin className="w-2.5 h-2.5 text-slate-400" />
                                    <span>Room {entry.roomNumber}</span>
                                  </div>
                                )}

                                <div className="absolute top-1.5 right-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <Edit2 className="w-3 h-3 text-[#0B72E7]" />
                                </div>
                              </div>
                            ) : (
                              <button
                                onClick={() => handleCellClick(day.key, slot.id)}
                                className="w-full h-full min-h-[70px] rounded-lg border border-dashed border-slate-200 hover:border-[#0B72E7] hover:bg-coral-50/10 flex flex-col items-center justify-center gap-1 text-slate-300 hover:text-[#0B72E7] transition-all cursor-pointer"
                              >
                                <Plus className="w-4 h-4" />
                                <span className="text-[10px] font-medium">Assign</span>
                              </button>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ==================================================================== */}
      {/* 1. ASSIGN / EDIT TIMETABLE MODAL                                     */}
      {/* ==================================================================== */}
      {isAssignModalOpen && targetSlot && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-2xs">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  {targetSlot.existingEntry ? 'Edit Class Session' : 'Assign Class Session'}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {ALL_DAYS.find((d) => d.key === targetSlot.dayOfWeek)?.label} •{' '}
                  {timeSlots.find((s) => s.id === targetSlot.periodTimeSlotId)?.name} (
                  {timeSlots.find((s) => s.id === targetSlot.periodTimeSlotId)?.startTime} –{' '}
                  {timeSlots.find((s) => s.id === targetSlot.periodTimeSlotId)?.endTime})
                </p>
              </div>
              <button
                onClick={() => setIsAssignModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-md"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEntry} className="p-5 space-y-4 text-xs">
              {/* Conflict Error Banner */}
              {assignError && (
                <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <div className="leading-snug">{assignError}</div>
                </div>
              )}

              {/* Subject Select */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Subject <span className="text-rose-500">*</span>
                </label>
                <SearchableSelect
                  options={subjectOptions}
                  value={assignSubjectId}
                  onChange={setAssignSubjectId}
                  placeholder="Select a subject"
                />
              </div>

              {/* Teacher Select */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Teacher / Faculty
                </label>
                <SearchableSelect
                  options={teacherOptions}
                  value={assignTeacherId}
                  onChange={setAssignTeacherId}
                  placeholder="Select teacher (optional)"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  System automatically blocks conflicting assignments across sections.
                </p>
              </div>

              {/* Room Number */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Classroom / Laboratory (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Room 204, Physics Lab"
                  value={assignRoomNumber}
                  onChange={(e) => setAssignRoomNumber(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-[#0B72E7] focus:border-transparent outline-none"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-between gap-3">
                {targetSlot.existingEntry ? (
                  <button
                    type="button"
                    onClick={handleDeleteEntry}
                    disabled={isPending}
                    className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete</span>
                  </button>
                ) : (
                  <div />
                )}

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsAssignModalOpen(false)}
                    className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isPending || !assignSubjectId}
                    className="px-4 py-2 text-xs font-bold text-white bg-[#0B72E7] hover:bg-[#0960C4] disabled:opacity-50 rounded-lg transition-colors shadow-xs cursor-pointer"
                  >
                    {isPending ? 'Saving...' : 'Save Period'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* 2. CLONE TIMETABLE MODAL                                             */}
      {/* ==================================================================== */}
      {isCloneModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-2xs">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-orange-100 text-[#0B72E7] flex items-center justify-center font-bold">
                  <Copy className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Clone Timetable</h3>
                  <p className="text-xs text-slate-500">
                    Target: {currentClassName} - Section {currentSectionName}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsCloneModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-md"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              {cloneError && (
                <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <span>{cloneError}</span>
                </div>
              )}

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Source Section to Copy From
                </label>
                <SearchableSelect
                  options={allSectionsFlat.filter((s) => s.value !== selectedSectionId)}
                  value={cloneSourceSectionId}
                  onChange={setCloneSourceSectionId}
                  placeholder="Choose source section..."
                />
              </div>

              <div className="p-3.5 rounded-lg bg-amber-50/70 border border-amber-200 text-amber-900 space-y-1.5">
                <div className="font-semibold text-amber-950 flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                  <span>Important Note on Cloning</span>
                </div>
                <p className="text-[11px] leading-relaxed text-amber-800">
                  Cloning copies all period subjects, slot mappings, and days. To avoid double-booking,
                  <strong> faculty assignments are cleared</strong> and can be assigned separately for this section.
                </p>
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCloneModalOpen(false)}
                  className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleCloneTimetable}
                  disabled={isPending || !cloneSourceSectionId}
                  className="px-4 py-2 text-xs font-bold text-white bg-[#0B72E7] hover:bg-[#0960C4] disabled:opacity-50 rounded-lg transition-colors shadow-xs cursor-pointer"
                >
                  {isPending ? 'Cloning...' : 'Confirm & Clone'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* 3. WORKING DAYS CONFIGURATION MODAL                                  */}
      {/* ==================================================================== */}
      {isDaysConfigOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-2xs">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
                  <CalendarDays className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Working Days Settings</h3>
                  <p className="text-xs text-slate-500">Configure operational timetable days</p>
                </div>
              </div>
              <button
                onClick={() => setIsDaysConfigOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-md"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <p className="text-slate-600 leading-relaxed">
                Select which days should have timetable schedules. Enable <strong>Saturday</strong> for
                weekend activities, clubs, or half-day sessions.
              </p>

              <div className="grid grid-cols-2 gap-2.5">
                {ALL_DAYS.map((day) => {
                  const isChecked = activeDays.includes(day.key);
                  return (
                    <label
                      key={day.key}
                      onClick={() => handleToggleDay(day.key)}
                      className={`flex items-center gap-2.5 p-3 rounded-lg border cursor-pointer select-none transition-all ${
                        isChecked
                          ? 'border-[#0B72E7] bg-coral-50/10 text-slate-900 font-semibold'
                          : 'border-slate-200 hover:border-slate-300 text-slate-500'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {}}
                        className="rounded border-slate-300 text-[#0B72E7] focus:ring-[#0B72E7]"
                      />
                      <span>{day.label}</span>
                    </label>
                  );
                })}
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end">
                <button
                  type="button"
                  onClick={() => setIsDaysConfigOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-white bg-[#0F172A] hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* 4. PERIOD TIME SLOT MANAGER MODAL                                    */}
      {/* ==================================================================== */}
      {isSlotManagerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-2xs">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[85vh]">
            <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center font-bold">
                  <Clock className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Period Time Slot Manager</h3>
                  <p className="text-xs text-slate-500">
                    Define daily bell schedules and recess breaks
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setIsSlotManagerOpen(false);
                  resetSlotForm();
                }}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-md"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-5 text-xs">
              {slotError && (
                <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <span>{slotError}</span>
                </div>
              )}

              {/* Slot Add / Edit Form */}
              <form onSubmit={handleSaveSlot} className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <div className="font-bold text-slate-800 text-xs">
                  {editingSlotId ? 'Edit Time Slot' : 'Add New Period Time Slot'}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-slate-600 font-semibold mb-1">
                      Period Label
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Period 1"
                      value={slotFormName}
                      onChange={(e) => setSlotFormName(e.target.value)}
                      className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs bg-white outline-none focus:ring-1 focus:ring-[#0B72E7]"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 font-semibold mb-1">
                      Start Time
                    </label>
                    <input
                      type="time"
                      required
                      value={slotFormStart}
                      onChange={(e) => setSlotFormStart(e.target.value)}
                      className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs bg-white outline-none focus:ring-1 focus:ring-[#0B72E7]"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 font-semibold mb-1">
                      End Time
                    </label>
                    <input
                      type="time"
                      required
                      value={slotFormEnd}
                      onChange={(e) => setSlotFormEnd(e.target.value)}
                      className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs bg-white outline-none focus:ring-1 focus:ring-[#0B72E7]"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 font-semibold mb-1">
                      Order / Sort
                    </label>
                    <input
                      type="number"
                      required
                      min={1}
                      value={slotFormOrder}
                      onChange={(e) => setSlotFormOrder(Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs bg-white outline-none focus:ring-1 focus:ring-[#0B72E7]"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <label className="flex items-center gap-2 cursor-pointer text-slate-700 font-medium">
                    <input
                      type="checkbox"
                      checked={slotFormIsBreak}
                      onChange={(e) => setSlotFormIsBreak(e.target.checked)}
                      className="rounded border-slate-300 text-[#0B72E7] focus:ring-[#0B72E7]"
                    />
                    <span>Mark as Break / Recess Period</span>
                  </label>

                  <div className="flex items-center gap-2">
                    {editingSlotId && (
                      <button
                        type="button"
                        onClick={resetSlotForm}
                        className="px-3 py-1.5 font-semibold text-slate-600 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
                      >
                        Cancel
                      </button>
                    )}
                    <button
                      type="submit"
                      disabled={isPending}
                      className="px-3.5 py-1.5 font-bold text-white bg-[#0F172A] hover:bg-slate-800 disabled:opacity-50 rounded-lg transition-colors cursor-pointer shadow-xs"
                    >
                      {editingSlotId ? 'Update Slot' : 'Add Slot'}
                    </button>
                  </div>
                </div>
              </form>

              {/* Slot Table List */}
              <div className="border border-slate-200 rounded-lg overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                    <tr>
                      <th className="p-2.5 w-16">Sort</th>
                      <th className="p-2.5">Name</th>
                      <th className="p-2.5">Time Range</th>
                      <th className="p-2.5">Type</th>
                      <th className="p-2.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {timeSlots.map((slot) => (
                      <tr key={slot.id} className="hover:bg-slate-50/60">
                        <td className="p-2.5 font-mono text-slate-500">#{slot.order}</td>
                        <td className="p-2.5 font-bold text-slate-800">{slot.name}</td>
                        <td className="p-2.5 text-slate-600 font-mono">
                          {slot.startTime} – {slot.endTime}
                        </td>
                        <td className="p-2.5">
                          {slot.isBreak ? (
                            <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-100 text-amber-800">
                              Break
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-100 text-blue-800">
                              Instructional
                            </span>
                          )}
                        </td>
                        <td className="p-2.5 text-right space-x-2">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingSlotId(slot.id);
                              setSlotFormName(slot.name);
                              setSlotFormStart(slot.startTime);
                              setSlotFormEnd(slot.endTime);
                              setSlotFormOrder(slot.order);
                              setSlotFormIsBreak(slot.isBreak);
                            }}
                            className="text-slate-500 hover:text-slate-800"
                          >
                            <Edit2 className="w-3.5 h-3.5 inline" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteSlot(slot.id)}
                            className="text-rose-500 hover:text-rose-700"
                          >
                            <Trash2 className="w-3.5 h-3.5 inline" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
