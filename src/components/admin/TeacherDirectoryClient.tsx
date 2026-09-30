'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Search,
  GraduationCap,
  Mail,
  Phone,
  Calendar,
  Award,
  CheckCircle2,
  Clock,
  ChevronRight,
  Plus,
  BookOpen,
  Archive,
  RotateCcw,
  Download,
  X,
} from 'lucide-react';
import { ConfirmDialog } from '@/components/ui';
import { archiveTeacherAction, reactivateTeacherAction } from '@/actions/admin';

export interface TeacherItem {
  id: string;
  name: string;
  email: string;
  phone: string;
  employeeId: string;
  department: string;
  qualification: string;
  specialization?: string | null;
  joiningDate: string;
  isActive?: boolean;
  deletedAt?: string | null;
  classTeacherSection?: string | null;
  activeSubstitution?: {
    date: string;
    originalTeacherName: string;
    reason: string;
  } | null;
}

interface TeacherDirectoryClientProps {
  teachers: TeacherItem[];
}

export default function TeacherDirectoryClient({
  teachers: initialTeachers,
}: TeacherDirectoryClientProps) {
  const [teachers, setTeachers] = useState<TeacherItem[]>(initialTeachers);
  const [activeTab, setActiveTab] = useState<'ACTIVE' | 'ARCHIVED'>('ACTIVE');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDept, setSelectedDept] = useState('ALL');

  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    action: () => Promise<void>;
    variant?: 'danger' | 'warning' | 'info';
    confirmLabel?: string;
  }>({
    isOpen: false,
    title: '',
    description: '',
    action: async () => {},
  });

  const tabTeachers = useMemo(() => {
    return teachers.filter((t) => {
      const isArchived = t.isActive === false || Boolean(t.deletedAt);
      return activeTab === 'ARCHIVED' ? isArchived : !isArchived;
    });
  }, [teachers, activeTab]);

  const departments = useMemo(() => {
    return Array.from(new Set(teachers.map((t) => t.department)));
  }, [teachers]);

  const filteredTeachers = useMemo(() => {
    return tabTeachers.filter((t) => {
      const matchesSearch =
        searchTerm === '' ||
        t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.employeeId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.email.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesDept = selectedDept === 'ALL' || t.department === selectedDept;

      return matchesSearch && matchesDept;
    });
  }, [tabTeachers, searchTerm, selectedDept]);

  const activeCount = useMemo(() => teachers.filter((t) => t.isActive !== false && !t.deletedAt).length, [teachers]);
  const archivedCount = teachers.length - activeCount;

  // Handle Archive Teacher
  const handleArchiveTeacher = (teacher: TeacherItem) => {
    setConfirmDialog({
      isOpen: true,
      title: `Deactivate Faculty: ${teacher.name}?`,
      description: `Employee ID: ${teacher.employeeId}. This will deactivate the teacher's portal access and move them to the archived roster.`,
      variant: 'danger',
      confirmLabel: 'Deactivate',
      action: async () => {
        const res = await archiveTeacherAction(teacher.id);
        if (res.success) {
          setTeachers((prev) =>
            prev.map((t) => (t.id === teacher.id ? { ...t, isActive: false, deletedAt: new Date().toISOString() } : t))
          );
        } else {
          alert(res.error || 'Failed to deactivate teacher.');
        }
      },
    });
  };

  // Handle Reactivate Teacher
  const handleReactivateTeacher = (teacher: TeacherItem) => {
    setConfirmDialog({
      isOpen: true,
      title: `Reactivate Faculty: ${teacher.name}?`,
      description: `Employee ID: ${teacher.employeeId}. The teacher will regain active status and login capability.`,
      variant: 'info',
      confirmLabel: 'Reactivate',
      action: async () => {
        const res = await reactivateTeacherAction(teacher.id);
        if (res.success) {
          setTeachers((prev) =>
            prev.map((t) => (t.id === teacher.id ? { ...t, isActive: true, deletedAt: null } : t))
          );
        } else {
          alert(res.error || 'Failed to reactivate teacher.');
        }
      },
    });
  };

  return (
    <div className="space-y-6">
      {/* 1. HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl md:text-2xl font-black text-[#111C2D] tracking-tight">
              Faculty & Academic Staff Directory
            </h1>
            <span className="text-xs font-bold text-[#FF7555] bg-[#FFF2EE] px-2.5 py-0.5 rounded-full">
              {activeCount} Active
            </span>
            {archivedCount > 0 && (
              <span className="text-xs font-bold text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded-full">
                {archivedCount} Archived
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Department assignments, qualifications, class teachers, active substitutions, and status lifecycle.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <Link
            href="/admin/bulk-import"
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-slate-200 hover:border-slate-300 text-slate-700 text-xs font-bold transition-all shadow-xs"
          >
            <Download className="w-3.5 h-3.5 text-brand-primary" />
            <span>Bulk Import</span>
          </Link>
          <Link
            href="/admin/academics"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#111C2D] hover:bg-[#1a2942] text-white text-xs font-bold transition-all shadow-xs"
          >
            <BookOpen className="w-3.5 h-3.5 text-[#FF7555]" />
            <span>Manage Timetable</span>
          </Link>
        </div>
      </div>

      {/* 2. TAB SWITCHER */}
      <div className="flex border-b border-brand-border gap-2">
        <button
          onClick={() => setActiveTab('ACTIVE')}
          className={`pb-3 px-4 font-semibold text-body-primary border-b-2 flex items-center gap-2 transition-all ${
            activeTab === 'ACTIVE'
              ? 'border-brand-primary text-brand-primary'
              : 'border-transparent text-brand-muted hover:text-brand-dark'
          }`}
        >
          <GraduationCap className="w-4 h-4" />
          Active Faculty ({activeCount})
        </button>
        <button
          onClick={() => setActiveTab('ARCHIVED')}
          className={`pb-3 px-4 font-semibold text-body-primary border-b-2 flex items-center gap-2 transition-all ${
            activeTab === 'ARCHIVED'
              ? 'border-brand-primary text-brand-primary'
              : 'border-transparent text-brand-muted hover:text-brand-dark'
          }`}
        >
          <Archive className="w-4 h-4" />
          Archived Faculty ({archivedCount})
        </button>
      </div>

      {/* 3. FILTER & SEARCH CONTROL BAR */}
      <div className="bg-white p-4 rounded-2xl border border-[#EBF0F5] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#F4F8FA] border border-[#D9E2EC] text-slate-500 text-xs w-full md:w-80 focus-within:border-[#FF7555] focus-within:bg-white transition-all">
          <Search className="w-4 h-4 text-slate-400 shrink-0" />
          <input
            type="text"
            placeholder="Search by teacher name, department, or EMP ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-transparent border-none outline-none w-full text-xs text-[#111C2D] placeholder:text-slate-400"
          />
          {searchTerm && (
            <button onClick={() => setSearchTerm('')} className="text-slate-400 hover:text-slate-600">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2.5">
          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="px-3.5 py-2 rounded-xl border border-[#D9E2EC] bg-[#F4F8FA] text-xs font-semibold text-slate-700 focus:outline-none focus:border-[#FF7555]"
          >
            <option value="ALL">All Departments</option>
            {departments.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 4. TEACHER DIRECTORY CARDS GRID */}
      {filteredTeachers.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-2xl border border-[#EBF0F5]">
          <GraduationCap className="w-8 h-8 text-slate-300 mx-auto mb-2" />
          <p className="text-sm font-semibold text-slate-700">No faculty members found</p>
          <p className="text-xs text-slate-400 mt-0.5">
            {activeTab === 'ARCHIVED'
              ? 'No archived faculty records found.'
              : 'Try clearing your search query or department filter.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTeachers.map((t) => (
            <div
              key={t.id}
              className="bg-white p-5 rounded-2xl border border-[#EBF0F5] hover:border-[#D9E2EC] transition-all shadow-xs flex flex-col justify-between group"
            >
              <div>
                {/* Header: Name, Department, Employee ID */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#111C2D] text-white flex items-center justify-center font-bold text-sm shrink-0">
                      {t.name
                        .split(' ')
                        .map((n) => n[0])
                        .join('')
                        .substring(0, 2)}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 group-hover:text-[#FF7555] transition-colors text-sm">
                        {t.name}
                      </h3>
                      <p className="text-[11px] font-semibold text-[#FF7555]">{t.department}</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono font-bold bg-[#F4F8FA] border border-[#D9E2EC] px-2 py-0.5 rounded text-slate-500">
                    {t.employeeId}
                  </span>
                </div>

                {/* Meta details */}
                <div className="mt-4 space-y-2 border-t border-slate-50 pt-3">
                  <div className="flex items-center gap-2 text-xs text-slate-600">
                    <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{t.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-600">
                    <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{t.phone}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-600">
                    <Award className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">
                      {t.qualification} {t.specialization ? `• ${t.specialization}` : ''}
                    </span>
                  </div>
                </div>

                {/* Substitution / Class Teacher Tag */}
                <div className="mt-4 flex flex-wrap items-center gap-1.5 pt-2">
                  {t.classTeacherSection && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-[#FFF2EE] text-[#FF7555] px-2 py-0.5 rounded-full">
                      <CheckCircle2 className="w-3 h-3" />
                      Class Teacher ({t.classTeacherSection})
                    </span>
                  )}
                  {t.activeSubstitution && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-full">
                      <Clock className="w-3 h-3 text-amber-500" />
                      Covering for {t.activeSubstitution.originalTeacherName}
                    </span>
                  )}
                  {t.isActive === false && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-red-50 text-red-700 border border-red-200 px-2 py-0.5 rounded-full">
                      Deactivated
                    </span>
                  )}
                </div>
              </div>

              {/* Card Footer: Joined Date & Deactivate/Reactivate */}
              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                <span>Joined {t.joiningDate}</span>
                {activeTab === 'ACTIVE' ? (
                  <button
                    type="button"
                    onClick={() => handleArchiveTeacher(t)}
                    className="inline-flex items-center gap-1 text-red-600 hover:text-red-700 font-semibold px-2 py-1 rounded hover:bg-red-50 transition-colors"
                  >
                    <Archive className="w-3 h-3" />
                    <span>Deactivate</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleReactivateTeacher(t)}
                    className="inline-flex items-center gap-1 text-emerald-600 hover:text-emerald-700 font-semibold px-2 py-1 rounded hover:bg-emerald-50 transition-colors"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Reactivate</span>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* CONFIRMATION DIALOG */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog((prev) => ({ ...prev, isOpen: false }))}
        onConfirm={async () => {
          await confirmDialog.action();
          setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
        }}
        title={confirmDialog.title}
        description={confirmDialog.description}
        variant={confirmDialog.variant}
        confirmLabel={confirmDialog.confirmLabel}
      />
    </div>
  );
}
