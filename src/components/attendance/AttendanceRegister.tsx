'use client';

import React, { useState, useEffect, useTransition, useCallback } from 'react';
import {
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  Users,
  Calendar,
  Save,
  Loader2,
  Check,
  Search,
  MessageSquare,
  ChevronDown,
  RotateCcw,
  RefreshCw,
  Lock,
  Edit2,
} from 'lucide-react';
import {
  markDailyAttendanceAction,
  getSectionAttendanceRosterAction,
} from '@/actions/attendance';
import type { SectionInfo, StudentRosterItem } from '@/services/attendance.service';
import type { AttendanceStatus } from '@prisma/client';

interface AttendanceRegisterProps {
  initialSections: SectionInfo[];
  defaultSectionId?: string;
  defaultDate?: string;
}

export function AttendanceRegister({
  initialSections,
  defaultSectionId,
  defaultDate,
}: AttendanceRegisterProps) {
  const todayStr = defaultDate || new Date().toISOString().split('T')[0];

  const [sections] = useState<SectionInfo[]>(initialSections);
  const [selectedSectionId, setSelectedSectionId] = useState<string>(
    defaultSectionId || initialSections[0]?.id || ''
  );
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);

  const [students, setStudents] = useState<StudentRosterItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoadingRoster, setIsLoadingRoster] = useState(false);
  const [isAlreadyMarked, setIsAlreadyMarked] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [lastSavedTimestamp, setLastSavedTimestamp] = useState<string | null>(null);

  // Status feedback: null | success | error
  const [statusMessage, setStatusMessage] = useState<{
    type: 'success' | 'error';
    text: string;
    canRetry?: boolean;
  } | null>(null);

  const [isPending, startTransition] = useTransition();

  // Load roster whenever section or date changes
  const loadRoster = useCallback(() => {
    if (!selectedSectionId) return;

    setIsLoadingRoster(true);
    setStatusMessage(null);
    setIsDirty(false);

    getSectionAttendanceRosterAction(selectedSectionId, selectedDate)
      .then((res) => {
        if (res.success && res.data) {
          setStudents(res.data.students);
          setIsAlreadyMarked(res.data.isAlreadyMarked);
          setIsEditMode(!res.data.isAlreadyMarked);
          if (res.data.isAlreadyMarked) {
            setLastSavedTimestamp(new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }));
          }
        } else {
          setStatusMessage({
            type: 'error',
            text: res.error || 'Failed to load student roster.',
            canRetry: true,
          });
        }
      })
      .catch(() => {
        setStatusMessage({
          type: 'error',
          text: 'Unable to connect to server. Please check your connection.',
          canRetry: true,
        });
      })
      .finally(() => {
        setIsLoadingRoster(false);
      });
  }, [selectedSectionId, selectedDate]);

  useEffect(() => {
    loadRoster();
  }, [loadRoster]);

  // Unsaved changes guard: beforeunload listener
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty]);

  // Fast-path: Mark All Present
  const handleMarkAllPresent = () => {
    setStudents((prev) =>
      prev.map((student) => ({
        ...student,
        status: 'PRESENT' as AttendanceStatus,
      }))
    );
    setIsDirty(true);
    setStatusMessage(null);
  };

  // Reset all with explicit confirmation
  const handleResetAll = () => {
    if (window.confirm('Reset all students to Absent? You will need to submit to save changes.')) {
      setStudents((prev) =>
        prev.map((student) => ({
          ...student,
          status: 'ABSENT' as AttendanceStatus,
        }))
      );
      setIsDirty(true);
      setStatusMessage(null);
    }
  };

  // Single-tap toggle per student
  const handleToggleStatus = (studentId: string, status: AttendanceStatus) => {
    if (!isEditMode && isAlreadyMarked) return;

    setStudents((prev) =>
      prev.map((student) =>
        student.id === studentId ? { ...student, status } : student
      )
    );
    setIsDirty(true);
    setStatusMessage(null);
  };

  // Remark change
  const handleRemarkChange = (studentId: string, remarks: string) => {
    if (!isEditMode && isAlreadyMarked) return;

    setStudents((prev) =>
      prev.map((student) =>
        student.id === studentId ? { ...student, remarks } : student
      )
    );
    setIsDirty(true);
  };

  // Save attendance atomically with complete lifecycle feedback
  const handleSaveAttendance = () => {
    if (!selectedSectionId || students.length === 0) return;

    setStatusMessage(null);
    startTransition(async () => {
      const payload = {
        sectionId: selectedSectionId,
        date: selectedDate,
        records: students.map((s) => ({
          studentId: s.id,
          status: s.status,
          remarks: s.remarks || undefined,
        })),
      };

      try {
        const res = await markDailyAttendanceAction(payload);
        if (res.success) {
          setIsAlreadyMarked(true);
          setIsEditMode(false);
          setIsDirty(false);
          const timeStr = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
          setLastSavedTimestamp(timeStr);
          setStatusMessage({
            type: 'success',
            text: `Attendance recorded successfully at ${timeStr} for ${res.count} students.`,
          });
        } else {
          setStatusMessage({
            type: 'error',
            text: res.error || 'Failed to submit attendance.',
            canRetry: true,
          });
        }
      } catch {
        setStatusMessage({
          type: 'error',
          text: 'Network error occurred while saving attendance. Your selections are preserved. Please click retry.',
          canRetry: true,
        });
      }
    });
  };

  // Metrics calculation
  const totalCount = students.length;
  const presentCount = students.filter((s) => s.status === 'PRESENT').length;
  const absentCount = students.filter((s) => s.status === 'ABSENT').length;
  const lateCount = students.filter((s) => s.status === 'LATE').length;
  const halfDayCount = students.filter((s) => s.status === 'HALF_DAY').length;
  const hasExceptions = absentCount > 0 || lateCount > 0 || halfDayCount > 0;

  // Filtered students
  const filteredStudents = students.filter((s) => {
    const fullName = `${s.firstName} ${s.lastName}`.toLowerCase();
    const query = searchQuery.toLowerCase().trim();
    return (
      fullName.includes(query) ||
      s.admissionNumber.toLowerCase().includes(query) ||
      (s.rollNumber && s.rollNumber.toString().includes(query))
    );
  });

  // Selected section object
  const currentSection = sections.find((s) => s.id === selectedSectionId);

  // Format date display (Indian format)
  const formattedDisplayDate = new Date(selectedDate + 'T00:00:00').toLocaleDateString(
    'en-IN',
    {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }
  );

  return (
    <div className="bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden">
      {/* Header Bar */}
      <div className="p-5 md:p-6 border-b border-slate-100 bg-white space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-slate-900">
                Daily Attendance Register
              </h2>
              {isAlreadyMarked && !isEditMode ? (
                <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  Submitted for {formattedDisplayDate}
                </span>
              ) : isDirty ? (
                <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                  Unsaved changes
                </span>
              ) : (
                <span className="text-xs text-slate-500">
                  Defaults to all present
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {currentSection?.classGradeName} - {currentSection?.name} • Class Roll-Call
            </p>
          </div>

          {/* Section & Date Pickers */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Section Picker */}
            <div className="relative">
              <select
                value={selectedSectionId}
                onChange={(e) => setSelectedSectionId(e.target.value)}
                aria-label="Select Class Section"
                className="bg-slate-50 hover:bg-slate-100 text-xs font-semibold text-slate-800 py-2 pl-3 pr-8 rounded-lg border border-slate-200 appearance-none cursor-pointer focus:outline-none focus:border-[#C2410C]"
              >
                {sections.map((sec) => (
                  <option key={sec.id} value={sec.id}>
                    {sec.classGradeName} - {sec.name} {sec.isClassTeacher ? '(Class Teacher)' : ''}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* Date Picker */}
            <div className="relative flex items-center bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 focus-within:border-[#C2410C]">
              <Calendar className="w-3.5 h-3.5 text-slate-400 mr-2 shrink-0" />
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                aria-label="Attendance Date"
                className="bg-transparent text-xs font-semibold text-slate-800 outline-none cursor-pointer"
              />
            </div>

            {/* Lock / Edit Mode Toggle if already marked */}
            {isAlreadyMarked && (
              <button
                type="button"
                onClick={() => setIsEditMode(!isEditMode)}
                className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
                  isEditMode
                    ? 'bg-amber-50 text-amber-800 border-amber-200'
                    : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
                }`}
              >
                {isEditMode ? (
                  <>
                    <Lock className="w-3.5 h-3.5 text-amber-600" />
                    <span>Lock Register</span>
                  </>
                ) : (
                  <>
                    <Edit2 className="w-3.5 h-3.5 text-slate-500" />
                    <span>Edit Attendance</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Compact Single-Line Metric Summary Strip */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs">
          <div className="flex flex-wrap items-center gap-4">
            <span className="text-slate-600 font-medium">
              Total Enrolled: <strong className="text-slate-900">{totalCount}</strong>
            </span>
            <span className="text-slate-300">•</span>
            <span className="text-emerald-700 font-medium">
              Present: <strong className="text-emerald-800">{presentCount}</strong>
            </span>
            <span className="text-slate-300">•</span>
            <span className={`${absentCount > 0 ? 'text-red-700 font-bold' : 'text-slate-500 font-medium'}`}>
              Absent: <strong>{absentCount}</strong>
            </span>
            <span className="text-slate-300">•</span>
            <span className={`${lateCount > 0 ? 'text-amber-700 font-bold' : 'text-slate-500 font-medium'}`}>
              Late: <strong>{lateCount}</strong>
            </span>
            <span className="text-slate-300">•</span>
            <span className={`${halfDayCount > 0 ? 'text-sky-700 font-bold' : 'text-slate-500 font-medium'}`}>
              Half Day: <strong>{halfDayCount}</strong>
            </span>
          </div>

          {/* Quick Legend */}
          <div className="hidden sm:flex items-center gap-2 text-slate-500 text-xs">
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-sm bg-emerald-600 inline-block" /> Present
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-sm bg-red-600 inline-block" /> Absent
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-sm bg-amber-500 inline-block" /> Late
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-sm bg-sky-600 inline-block" /> Half Day
            </span>
          </div>
        </div>

        {/* Toolbar: Actions & Search */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
          <div className="flex items-center gap-2">
            {/* Show Mark All Present only when there are exceptions */}
            {hasExceptions && isEditMode && (
              <button
                type="button"
                onClick={handleMarkAllPresent}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 transition-colors cursor-pointer"
              >
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span>Mark All Present</span>
              </button>
            )}

            {isEditMode && (
              <button
                type="button"
                onClick={handleResetAll}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-600 hover:text-slate-900 bg-transparent hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
                <span>Reset All</span>
              </button>
            )}
          </div>

          {/* Quick Search */}
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search by student name or roll..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 focus:bg-white rounded-lg border border-slate-200 focus:border-[#C2410C] outline-none text-slate-900 transition-colors"
            />
          </div>
        </div>
      </div>

      {/* Status Feedback Banner */}
      {statusMessage && (
        <div
          className={`p-3.5 text-xs font-medium flex items-center justify-between border-b ${
            statusMessage.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-100'
              : 'bg-red-50 text-red-800 border-red-200'
          }`}
        >
          <div className="flex items-center gap-2">
            {statusMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
            )}
            <span>{statusMessage.text}</span>
          </div>

          <div className="flex items-center gap-2">
            {statusMessage.canRetry && (
              <button
                type="button"
                onClick={handleSaveAttendance}
                disabled={isPending}
                className="px-2.5 py-1 rounded bg-red-600 text-white font-semibold text-xs hover:bg-red-700 transition-colors"
              >
                Retry
              </button>
            )}
            <button
              type="button"
              onClick={() => setStatusMessage(null)}
              className="text-xs hover:opacity-75 font-bold px-1"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Student List View */}
      <div className="p-4 md:p-6 divide-y divide-slate-100 max-w-4xl mx-auto">
        {isLoadingRoster ? (
          <div className="py-16 text-center text-slate-400">
            <Loader2 className="w-7 h-7 animate-spin mx-auto text-[#C2410C] mb-2" />
            <span className="text-xs font-medium">Loading class roster...</span>
          </div>
        ) : filteredStudents.length === 0 ? (
          <div className="py-12 text-center text-slate-400">
            <Users className="w-8 h-8 mx-auto text-slate-300 mb-2" />
            <p className="text-xs font-medium">No students match current search criteria.</p>
          </div>
        ) : (
          filteredStudents.map((student) => {
            const isPresent = student.status === 'PRESENT';
            const isAbsent = student.status === 'ABSENT';
            const isLate = student.status === 'LATE';
            const isHalfDay = student.status === 'HALF_DAY';
            const isException = !isPresent;

            return (
              <div
                key={student.id}
                className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/80 transition-colors rounded-lg px-2"
              >
                {/* Student Info */}
                <div className="flex items-center gap-3 min-w-0">
                  {/* Roll Number */}
                  <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 font-bold text-xs flex items-center justify-center shrink-0">
                    {student.rollNumber || '—'}
                  </div>

                  <div className="min-w-0">
                    <h3 className="text-xs font-bold text-slate-900 leading-tight truncate">
                      {student.firstName} {student.lastName}
                    </h3>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-slate-400 font-mono">
                        {student.admissionNumber}
                      </span>
                      {student.remarks && (
                        <span className="text-xs bg-amber-50 text-amber-800 px-1.5 py-0.2 rounded font-medium border border-amber-200 flex items-center gap-1">
                          <MessageSquare className="w-3 h-3 text-amber-600" />
                          {student.remarks}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Status Toggle Button Group with ≥44px touch targets */}
                <div className="flex items-center gap-1.5 self-end sm:self-center shrink-0">
                  {/* Present Button (≥44px touch target) */}
                  <button
                    type="button"
                    disabled={!isEditMode && isAlreadyMarked}
                    onClick={() => handleToggleStatus(student.id, 'PRESENT')}
                    title="Mark Present"
                    className={`min-w-[44px] h-[44px] px-3 rounded-lg text-xs font-bold transition-all cursor-pointer disabled:cursor-not-allowed ${
                      isPresent
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    P
                  </button>

                  {/* Absent Button (≥44px touch target) */}
                  <button
                    type="button"
                    disabled={!isEditMode && isAlreadyMarked}
                    onClick={() => handleToggleStatus(student.id, 'ABSENT')}
                    title="Mark Absent"
                    className={`min-w-[44px] h-[44px] px-3 rounded-lg text-xs font-bold transition-all cursor-pointer disabled:cursor-not-allowed ${
                      isAbsent
                        ? 'bg-red-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    A
                  </button>

                  {/* Late Button (≥44px touch target) */}
                  <button
                    type="button"
                    disabled={!isEditMode && isAlreadyMarked}
                    onClick={() => handleToggleStatus(student.id, 'LATE')}
                    title="Mark Late"
                    className={`min-w-[44px] h-[44px] px-3 rounded-lg text-xs font-bold transition-all cursor-pointer disabled:cursor-not-allowed ${
                      isLate
                        ? 'bg-amber-500 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    L
                  </button>

                  {/* Half Day Button (≥44px touch target) */}
                  <button
                    type="button"
                    disabled={!isEditMode && isAlreadyMarked}
                    onClick={() => handleToggleStatus(student.id, 'HALF_DAY')}
                    title="Mark Half Day"
                    className={`min-w-[44px] h-[44px] px-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer disabled:cursor-not-allowed ${
                      isHalfDay
                        ? 'bg-sky-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    HD
                  </button>

                  {/* Progressive Disclosure: Remark input reveals only on exception */}
                  {isException && (
                    <input
                      type="text"
                      disabled={!isEditMode && isAlreadyMarked}
                      placeholder="Note..."
                      value={student.remarks || ''}
                      onChange={(e) => handleRemarkChange(student.id, e.target.value)}
                      className="w-24 sm:w-32 text-xs bg-slate-50 focus:bg-white focus:border-[#C2410C] rounded-lg px-2.5 py-2.5 border border-slate-200 outline-none ml-1 text-slate-900 placeholder:text-slate-400 transition-colors"
                    />
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Sticky Bottom Save Action Bar */}
      <div className="sticky bottom-0 z-20 p-4 border-t border-slate-200 bg-white/95 backdrop-blur-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
        <div className="text-xs text-slate-600">
          <span>{presentCount} Present</span>
          <span className="mx-1.5 text-slate-300">•</span>
          <span className={absentCount > 0 ? 'text-red-700 font-semibold' : ''}>
            {absentCount} Absent
          </span>
          {lastSavedTimestamp && !isDirty && (
            <span className="ml-2 text-slate-400">
              (Saved at {lastSavedTimestamp})
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={handleSaveAttendance}
          disabled={isPending || students.length === 0 || (!isDirty && isAlreadyMarked && !isEditMode)}
          className="inline-flex items-center justify-center gap-2 bg-[#C2410C] hover:bg-[#9A3412] active:scale-[0.99] text-white font-semibold py-2.5 px-6 rounded-lg shadow-xs transition-colors text-xs cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isPending ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Submitting Attendance...</span>
            </>
          ) : isAlreadyMarked && !isDirty ? (
            <>
              <CheckCircle2 className="w-4 h-4 text-white" />
              <span>Attendance Submitted</span>
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              <span>Submit Attendance</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
