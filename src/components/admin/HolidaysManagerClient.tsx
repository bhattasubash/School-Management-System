'use client';

import React, { useState, useMemo } from 'react';
import {
  CalendarDays,
  Plus,
  Search,
  Filter,
  Trash2,
  X,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
  Repeat,
} from 'lucide-react';
import { createHolidayAction, deleteHolidayAction } from '@/actions/holidays';
import { HolidayType } from '@prisma/client';

export interface HolidayItem {
  id: string;
  name: string;
  date: string;
  type: HolidayType;
  isRecurring: boolean;
  sessionId: string;
}

export interface AcademicSessionOption {
  id: string;
  name: string;
  isCurrent: boolean;
}

interface HolidaysManagerClientProps {
  initialHolidays: HolidayItem[];
  sessions: AcademicSessionOption[];
  activeSessionId: string;
}

export default function HolidaysManagerClient({
  initialHolidays,
  sessions,
  activeSessionId,
}: HolidaysManagerClientProps) {
  const [holidays, setHolidays] = useState<HolidayItem[]>(initialHolidays);
  const [selectedSessionId, setSelectedSessionId] = useState<string>(activeSessionId);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('ALL');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [date, setDate] = useState('');
  const [type, setType] = useState<HolidayType>(HolidayType.NATIONAL);
  const [isRecurring, setIsRecurring] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ success?: string; error?: string } | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Filtered
  const filteredHolidays = useMemo(() => {
    return holidays.filter((h) => {
      const matchSession = !selectedSessionId || h.sessionId === selectedSessionId;
      const matchSearch =
        searchTerm === '' || h.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchType = selectedType === 'ALL' || h.type === selectedType;

      return matchSession && matchSearch && matchType;
    });
  }, [holidays, selectedSessionId, searchTerm, selectedType]);

  // Upcoming holiday calculation
  const todayStr = new Date().toISOString().split('T')[0];
  const upcomingHolidays = useMemo(() => {
    return filteredHolidays
      .filter((h) => h.date >= todayStr)
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [filteredHolidays, todayStr]);

  const nextHoliday = upcomingHolidays[0] || null;

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !date.trim()) {
      setFeedback({ error: 'Holiday name and date are required.' });
      return;
    }

    setIsSubmitting(true);
    setFeedback(null);

    const res = await createHolidayAction({
      sessionId: selectedSessionId,
      name: name.trim(),
      date,
      type,
      isRecurring,
    });

    setIsSubmitting(false);

    if (res.success && res.holiday) {
      const newHoliday: HolidayItem = {
        id: res.holiday.id,
        name: res.holiday.name,
        date: res.holiday.date.toISOString().split('T')[0],
        type: res.holiday.type,
        isRecurring: res.holiday.isRecurring,
        sessionId: res.holiday.sessionId,
      };

      setHolidays((prev) => [...prev, newHoliday].sort((a, b) => a.date.localeCompare(b.date)));
      setIsModalOpen(false);
      setName('');
      setDate('');
    } else {
      setFeedback({ error: res.error || 'Failed to record holiday.' });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to remove this holiday?')) return;
    setDeletingId(id);
    const res = await deleteHolidayAction(id);
    setDeletingId(null);
    if (res.success) {
      setHolidays((prev) => prev.filter((h) => h.id !== id));
    }
  };

  const getTypeBadge = (hType: HolidayType) => {
    switch (hType) {
      case 'NATIONAL':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">NATIONAL</span>;
      case 'STATE':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">STATE</span>;
      case 'SCHOOL':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#EBF5FF] text-[#0B72E7] border border-[#0B72E7]/30">SCHOOL</span>;
      case 'EXAM_BREAK':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200">EXAM BREAK</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#0B72E7]/10 text-[#0B72E7] flex items-center justify-center font-bold">
            <CalendarDays className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-black text-[#111C2D] tracking-tight">Academic Calendar & Holidays</h1>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Manage gazetted, regional, and institutional breaks with automatic attendance lockouts
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            setFeedback(null);
            setName('');
            setDate('');
            setType(HolidayType.NATIONAL);
            setIsRecurring(false);
            setIsModalOpen(true);
          }}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#0B72E7] hover:bg-[#0960C4] text-white font-bold text-xs shadow-xs transition-all active:scale-[0.98]"
        >
          <Plus className="w-4 h-4" />
          <span>Add Holiday</span>
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Holidays</span>
          <p className="text-2xl font-black text-[#111C2D] mt-2">{filteredHolidays.length}</p>
          <span className="text-[11px] text-slate-400 font-medium">Scheduled for this academic session</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Next Upcoming Break</span>
          <p className="text-base font-black text-[#0B72E7] mt-2 truncate">
            {nextHoliday ? nextHoliday.name : 'No Upcoming Breaks'}
          </p>
          <span className="text-[11px] text-slate-400 font-medium">
            {nextHoliday
              ? new Date(nextHoliday.date).toLocaleDateString('en-IN', {
                  weekday: 'short',
                  day: 'numeric',
                  month: 'short',
                })
              : 'All scheduled holidays passed'}
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">National / Gazetted</span>
          <p className="text-2xl font-black text-[#111C2D] mt-2">
            {filteredHolidays.filter((h) => h.type === 'NATIONAL').length}
          </p>
          <span className="text-[11px] text-slate-400 font-medium">Mandatory government closures</span>
        </div>
      </div>

      {/* Filter / Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 shrink-0" />
          <input
            type="text"
            placeholder="Search holiday by name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-transparent border-none outline-none w-full text-xs text-[#111C2D]"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          {/* Session Selector */}
          <select
            value={selectedSessionId}
            onChange={(e) => setSelectedSessionId(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-700 outline-none"
          >
            {sessions.map((s) => (
              <option key={s.id} value={s.id}>
                Session: {s.name} {s.isCurrent ? '(Active)' : ''}
              </option>
            ))}
          </select>

          {/* Type Selector */}
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-700 outline-none"
          >
            <option value="ALL">All Types</option>
            <option value="NATIONAL">National</option>
            <option value="STATE">State</option>
            <option value="SCHOOL">School</option>
            <option value="EXAM_BREAK">Exam Break</option>
          </select>
        </div>
      </div>

      {/* Holidays Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Day</th>
                <th className="py-3 px-4">Holiday Name</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Recurring</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredHolidays.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400 font-medium">
                    No holidays found for this selection.
                  </td>
                </tr>
              ) : (
                filteredHolidays.map((holiday) => {
                  const d = new Date(holiday.date);
                  const isPast = holiday.date < todayStr;

                  return (
                    <tr
                      key={holiday.id}
                      className={`hover:bg-slate-50/60 transition-colors ${
                        isPast ? 'opacity-65' : ''
                      }`}
                    >
                      <td className="py-3 px-4 whitespace-nowrap font-bold text-[#111C2D]">
                        {d.toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap font-medium text-slate-500">
                        {d.toLocaleDateString('en-IN', { weekday: 'long' })}
                      </td>
                      <td className="py-3 px-4 font-bold text-slate-800">
                        <div className="flex items-center gap-2">
                          <span>{holiday.name}</span>
                          {!isPast && (
                            <span className="w-1.5 h-1.5 rounded-full bg-[#0B72E7]" title="Upcoming holiday" />
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">{getTypeBadge(holiday.type)}</td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        {holiday.isRecurring ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600">
                            <Repeat className="w-3 h-3" /> Annual
                          </span>
                        ) : (
                          <span className="text-slate-400 text-[11px]">One-time</span>
                        )}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap text-right">
                        <button
                          type="button"
                          onClick={() => handleDelete(holiday.id)}
                          disabled={deletingId === holiday.id}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors disabled:opacity-50"
                          title="Delete holiday"
                        >
                          {deletingId === holiday.id ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Trash2 className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Holiday Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in-50 duration-150">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-md w-full shadow-2xl overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#EBF5FF] text-[#0B72E7] flex items-center justify-center font-bold">
                  <CalendarDays className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-[#111C2D]">Add Academic Holiday</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="p-6 space-y-4 text-xs">
              {feedback?.error && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{feedback.error}</span>
                </div>
              )}

              {/* Name */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Holiday Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Diwali / Deepavali Break"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 font-medium text-slate-800 outline-none focus:border-[#0B72E7]"
                />
              </div>

              {/* Date */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Date *</label>
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 font-medium text-slate-800 outline-none focus:border-[#0B72E7]"
                />
              </div>

              {/* Type */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Category Type *</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as HolidayType)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 font-medium text-slate-800 outline-none focus:border-[#0B72E7]"
                >
                  <option value="NATIONAL">National Gazetted Holiday</option>
                  <option value="STATE">State / Regional Holiday</option>
                  <option value="SCHOOL">School Institutional Break</option>
                  <option value="EXAM_BREAK">Exam Study Break</option>
                </select>
              </div>

              {/* Recurring */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="recurringCheck"
                  checked={isRecurring}
                  onChange={(e) => setIsRecurring(e.target.checked)}
                  className="w-4 h-4 rounded-sm text-[#0B72E7] focus:ring-[#0B72E7] border-slate-300"
                />
                <label htmlFor="recurringCheck" className="font-semibold text-slate-800 cursor-pointer">
                  Annual recurring holiday (repeats next academic session)
                </label>
              </div>

              {/* Buttons */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-[#0B72E7] hover:bg-[#0960C4] text-white font-bold transition-all flex items-center gap-2 shadow-xs disabled:opacity-50"
                >
                  {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Save Holiday</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
