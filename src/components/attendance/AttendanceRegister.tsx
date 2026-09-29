'use client';

import React, { useState, useEffect, useTransition } from 'react';
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
  Sparkles,
  ChevronDown,
  RotateCcw,
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
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [isPending, startTransition] = useTransition();

  // Load roster whenever section or date changes
  useEffect(() => {
    if (!selectedSectionId) return;

    let isMounted = true;
    setIsLoadingRoster(true);
    setStatusMessage(null);

    getSectionAttendanceRosterAction(selectedSectionId, selectedDate)
      .then((res) => {
        if (!isMounted) return;
        if (res.success && res.data) {
          setStudents(res.data.students);
          setIsAlreadyMarked(res.data.isAlreadyMarked);
        } else {
          setStatusMessage({ type: 'error', text: res.error || 'Failed to load roster' });
        }
      })
      .finally(() => {
        if (isMounted) setIsLoadingRoster(false);
      });

    return () => {
      isMounted = false;
    };
  }, [selectedSectionId, selectedDate]);

  // Fast-path: Mark All Present (1 tap)
  const handleMarkAll = (status: AttendanceStatus) => {
    setStudents((prev) =>
      prev.map((student) => ({
        ...student,
        status,
      }))
    );
  };

  // Single-tap toggle per student
  const handleToggleStatus = (studentId: string, status: AttendanceStatus) => {
    setStudents((prev) =>
      prev.map((student) =>
        student.id === studentId ? { ...student, status } : student
      )
    );
  };

  // Remark change
  const handleRemarkChange = (studentId: string, remarks: string) => {
    setStudents((prev) =>
      prev.map((student) =>
        student.id === studentId ? { ...student, remarks } : student
      )
    );
  };

  // Save attendance atomically
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

      const res = await markDailyAttendanceAction(payload);
      if (res.success) {
        setIsAlreadyMarked(true);
        setStatusMessage({
          type: 'success',
          text: `Attendance saved successfully for ${res.count} students!`,
        });
      } else {
        setStatusMessage({
          type: 'error',
          text: res.error || 'Failed to submit attendance.',
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
  const presentPercent = totalCount > 0 ? Math.round((presentCount / totalCount) * 100) : 0;

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

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Header Bar */}
      <div className="p-5 md:p-6 border-b border-gray-100 bg-white">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#26C281]" />
              <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
                Morning Roll-Call Register
              </span>
              {isAlreadyMarked && (
                <span className="text-[10px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full font-bold border border-emerald-200">
                  Marked Today ✓
                </span>
              )}
            </div>
            <h2 className="text-xl md:text-2xl font-black text-[#111C2D] mt-1">
              Class Daily Attendance
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Mark exceptions with single-tap controls. Defaults to all present for speed.
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
                className="bg-[#F4F6F9] hover:bg-gray-100 text-xs font-bold text-[#111C2D] py-2.5 pl-3.5 pr-8 rounded-xl border border-gray-200 appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#26C281]"
              >
                {sections.map((sec) => (
                  <option key={sec.id} value={sec.id}>
                    {sec.classGradeName} - {sec.name} {sec.isClassTeacher ? '(Class Teacher)' : ''}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-gray-500 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* Date Picker */}
            <div className="relative flex items-center bg-[#F4F6F9] border border-gray-200 rounded-xl px-3 py-1.5 focus-within:ring-2 focus-within:ring-[#26C281]">
              <Calendar className="w-3.5 h-3.5 text-gray-500 mr-2 shrink-0" />
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                aria-label="Attendance Date"
                className="bg-transparent text-xs font-bold text-[#111C2D] outline-none cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Real-time Summary Metric Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 mt-5">
          <div className="bg-[#F8FAFC] border border-slate-100 p-3 rounded-xl flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-xs">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Total</div>
              <div className="text-base font-black text-[#111C2D]">{totalCount}</div>
            </div>
          </div>

          <div className="bg-emerald-50/60 border border-emerald-100 p-3 rounded-xl flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-xs">
              <Check className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider">
                Present ({presentPercent}%)
              </div>
              <div className="text-base font-black text-emerald-800">{presentCount}</div>
            </div>
          </div>

          <div className="bg-red-50/60 border border-red-100 p-3 rounded-xl flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-red-500 text-white flex items-center justify-center font-bold text-xs">
              <XCircle className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[10px] font-bold text-red-700 uppercase tracking-wider">Absent</div>
              <div className="text-base font-black text-red-800">{absentCount}</div>
            </div>
          </div>

          <div className="bg-amber-50/60 border border-amber-100 p-3 rounded-xl flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-500 text-white flex items-center justify-center font-bold text-xs">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[10px] font-bold text-amber-700 uppercase tracking-wider">Late</div>
              <div className="text-base font-black text-amber-800">{lateCount}</div>
            </div>
          </div>

          <div className="bg-blue-50/60 border border-blue-100 p-3 rounded-xl flex items-center gap-3 col-span-2 sm:col-span-1">
            <div className="w-8 h-8 rounded-lg bg-blue-500 text-white flex items-center justify-center font-bold text-xs">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[10px] font-bold text-blue-700 uppercase tracking-wider">Half Day</div>
              <div className="text-base font-black text-blue-800">{halfDayCount}</div>
            </div>
          </div>
        </div>

        {/* Quick Fast-Path Actions Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mt-4 pt-4 border-t border-gray-100">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleMarkAll('PRESENT')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-emerald-700 bg-emerald-100/70 hover:bg-emerald-200 transition-colors cursor-pointer"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              Mark All Present
            </button>

            <button
              type="button"
              onClick={() => handleMarkAll('ABSENT')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset All
            </button>
          </div>

          {/* Quick Search */}
          <div className="relative w-full sm:w-60">
            <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search student or roll..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-[#F4F6F9] rounded-lg border border-transparent focus:border-gray-300 focus:bg-white outline-none text-[#111C2D]"
            />
          </div>
        </div>
      </div>

      {/* Status Feedback Toast/Banner */}
      {statusMessage && (
        <div
          className={`p-3.5 text-xs font-semibold flex items-center justify-between ${
            statusMessage.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-b border-emerald-100'
              : 'bg-red-50 text-red-800 border-b border-red-100'
          }`}
        >
          <div className="flex items-center gap-2">
            {statusMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-red-600" />
            )}
            <span>{statusMessage.text}</span>
          </div>
          <button
            onClick={() => setStatusMessage(null)}
            className="text-xs hover:opacity-75 font-bold"
          >
            ✕
          </button>
        </div>
      )}

      {/* Student List View (Mobile-First Card Rows) */}
      <div className="p-4 md:p-6 divide-y divide-gray-100">
        {isLoadingRoster ? (
          <div className="py-16 text-center text-gray-400">
            <Loader2 className="w-8 h-8 animate-spin mx-auto text-[#26C281] mb-2" />
            <span className="text-xs font-semibold">Loading student roster...</span>
          </div>
        ) : filteredStudents.length === 0 ? (
          <div className="py-12 text-center text-gray-400">
            <Users className="w-10 h-10 mx-auto text-gray-300 mb-2" />
            <p className="text-xs font-semibold">No students found matching current criteria.</p>
          </div>
        ) : (
          filteredStudents.map((student) => {
            const isPresent = student.status === 'PRESENT';
            const isAbsent = student.status === 'ABSENT';
            const isLate = student.status === 'LATE';
            const isHalfDay = student.status === 'HALF_DAY';

            return (
              <div
                key={student.id}
                className="py-3 sm:py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-[#F9FBFC] transition-colors rounded-xl px-2"
              >
                {/* Student Info */}
                <div className="flex items-center gap-3">
                  {/* Roll Number Badge */}
                  <div className="w-8 h-8 rounded-lg bg-[#EBF2F9] text-[#111C2D] font-black text-xs flex items-center justify-center shrink-0">
                    {student.rollNumber || '—'}
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-[#111C2D] leading-tight">
                      {student.firstName} {student.lastName}
                    </h3>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[10px] font-semibold text-gray-400">
                        {student.admissionNumber}
                      </span>
                      {student.remarks && (
                        <span className="text-[10px] bg-amber-50 text-amber-700 px-1.5 py-0.2 rounded font-medium border border-amber-200 flex items-center gap-1">
                          <MessageSquare className="w-2.5 h-2.5" />
                          {student.remarks}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Status Toggle Button Group (Single-Tap Mobile Optimized) */}
                <div className="flex items-center gap-1.5 self-end sm:self-center">
                  {/* Present Button */}
                  <button
                    type="button"
                    onClick={() => handleToggleStatus(student.id, 'PRESENT')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer ${
                      isPresent
                        ? 'bg-emerald-600 text-white shadow-xs scale-105'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    P
                  </button>

                  {/* Absent Button */}
                  <button
                    type="button"
                    onClick={() => handleToggleStatus(student.id, 'ABSENT')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer ${
                      isAbsent
                        ? 'bg-red-600 text-white shadow-xs scale-105'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    A
                  </button>

                  {/* Late Button */}
                  <button
                    type="button"
                    onClick={() => handleToggleStatus(student.id, 'LATE')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer ${
                      isLate
                        ? 'bg-amber-500 text-white shadow-xs scale-105'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    L
                  </button>

                  {/* Half Day Button */}
                  <button
                    type="button"
                    onClick={() => handleToggleStatus(student.id, 'HALF_DAY')}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer ${
                      isHalfDay
                        ? 'bg-sky-600 text-white shadow-xs scale-105'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    HD
                  </button>

                  {/* Quick Remark Input (for exceptions) */}
                  <input
                    type="text"
                    placeholder="Note..."
                    value={student.remarks || ''}
                    onChange={(e) => handleRemarkChange(student.id, e.target.value)}
                    className="w-20 sm:w-28 text-[11px] bg-[#F4F6F9] focus:bg-white focus:ring-1 focus:ring-gray-300 rounded-lg px-2 py-1 border border-transparent outline-none ml-1 text-[#111C2D] placeholder-gray-400"
                  />
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Sticky Bottom Save Action Bar */}
      <div className="p-4 md:p-5 border-t border-gray-100 bg-[#FAFBFD] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="text-xs text-gray-500">
          Showing <span className="font-bold text-[#111C2D]">{filteredStudents.length}</span> of {totalCount} students • Ready to save
        </div>

        <button
          type="button"
          onClick={handleSaveAttendance}
          disabled={isPending || students.length === 0}
          className="inline-flex items-center justify-center gap-2 bg-[#26C281] hover:bg-[#20a86f] active:scale-[0.99] text-white font-bold py-2.5 px-6 rounded-xl shadow-md transition-all text-sm cursor-pointer disabled:opacity-50"
        >
          {isPending ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Recording Attendance...
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              Submit Class Attendance
            </>
          )}
        </button>
      </div>
    </div>
  );
}
