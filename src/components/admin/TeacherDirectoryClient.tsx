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
  Building2,
  UserCheck,
  ShieldAlert,
  Sparkles,
  Eye,
} from 'lucide-react';
import PageHeader from '@/components/ui/PageHeader';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import AdminCard from './ui/AdminCard';
import AdminButton from './ui/AdminButton';
import AdminSearchInput from './ui/AdminSearchInput';
import { AdminTabs } from './ui/AdminTabs';
import AdminDrawer from './ui/AdminDrawer';
import { archiveTeacherAction, reactivateTeacherAction } from '@/actions/admin/archive';

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
  const [selectedTeacher, setSelectedTeacher] = useState<TeacherItem | null>(null);

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
    return Array.from(new Set(teachers.map((t) => t.department))).filter(Boolean);
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
  const classTeachersCount = useMemo(() => teachers.filter((t) => Boolean(t.classTeacherSection)).length, [teachers]);

  // Handle Archive Teacher
  const handleArchiveTeacher = (teacher: TeacherItem) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Deactivate Faculty Member',
      description: `Are you sure you want to deactivate ${teacher.name} (${teacher.employeeId})? This will suspend their LMS access, remove them from active timetable rosters, and move their profile to the archive ledger.`,
      variant: 'danger',
      confirmLabel: 'Deactivate Faculty',
      action: async () => {
        const res = await archiveTeacherAction(teacher.id);
        if (res.success) {
          setTeachers((prev) =>
            prev.map((t) =>
              t.id === teacher.id ? { ...t, isActive: false, deletedAt: new Date().toISOString() } : t
            )
          );
        } else {
          alert(res.error || 'Failed to deactivate teacher');
        }
      },
    });
  };

  // Handle Reactivate Teacher
  const handleReactivateTeacher = (teacher: TeacherItem) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Reactivate Faculty Member',
      description: `Reactivate ${teacher.name} (${teacher.employeeId})? Their active teaching privileges and LMS access will be restored immediately.`,
      variant: 'info',
      confirmLabel: 'Reactivate Member',
      action: async () => {
        const res = await reactivateTeacherAction(teacher.id);
        if (res.success) {
          setTeachers((prev) =>
            prev.map((t) =>
              t.id === teacher.id ? { ...t, isActive: true, deletedAt: null } : t
            )
          );
        } else {
          alert(res.error || 'Failed to reactivate teacher');
        }
      },
    });
  };

  return (
    <div className="space-y-6">
      {/* 1. Header with Breadcrumbs & Actions */}
      <PageHeader
        title="Faculty & Academic Staff Directory"
        subtitle="Department assignments, qualifications, class teachers, active substitutions, and status lifecycle."
        breadcrumbs={[
          { label: 'Admin', href: '/admin' },
          { label: 'Teachers' },
        ]}
        actions={
          <div className="flex items-center gap-2.5">
            <Link href="/admin/bulk-import">
              <AdminButton variant="secondary" icon={<Download className="w-3.5 h-3.5" />}>
                Bulk Import
              </AdminButton>
            </Link>
            <Link href="/admin/academics">
              <AdminButton variant="primary" icon={<BookOpen className="w-3.5 h-3.5" />}>
                Manage Classes
              </AdminButton>
            </Link>
          </div>
        }
      />

      {/* 2. KPI Metrics Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <AdminCard className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Faculty</span>
            <div className="w-10 h-10 rounded-2xl bg-blue-50 text-[#0B72E7] flex items-center justify-center font-bold">
              <GraduationCap className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2">{teachers.length}</div>
          <p className="text-xs font-medium text-slate-400 mt-1">Teaching & academic faculty</p>
        </AdminCard>

        <AdminCard className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Active On Duty</span>
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <UserCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-emerald-600 mt-2">{activeCount}</div>
          <p className="text-xs font-medium text-slate-400 mt-1">Authorized for classroom duty</p>
        </AdminCard>

        <AdminCard className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Departments</span>
            <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
              <Building2 className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-purple-600 mt-2">{departments.length}</div>
          <p className="text-xs font-medium text-slate-400 mt-1">Academic subject disciplines</p>
        </AdminCard>

        <AdminCard className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Class Teachers</span>
            <div className="w-10 h-10 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center font-bold">
              <Award className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-sky-600 mt-2">{classTeachersCount}</div>
          <p className="text-xs font-medium text-slate-400 mt-1">Assigned primary class stewards</p>
        </AdminCard>
      </div>

      {/* 3. Tab Switcher */}
      <AdminTabs
        tabs={[
          { id: 'ACTIVE', label: 'Active Faculty', count: activeCount },
          { id: 'ARCHIVED', label: 'Archived Faculty', count: archivedCount },
        ]}
        activeTab={activeTab}
        onChange={(tabId) => setActiveTab(tabId as 'ACTIVE' | 'ARCHIVED')}
      />

      {/* 4. Filter & Search Control Bar */}
      <AdminCard className="p-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="w-full sm:w-80">
            <AdminSearchInput
              value={searchTerm}
              onChange={setSearchTerm}
              placeholder="Search faculty name, department, or EMP ID..."
            />
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Department:</span>
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-700 focus:border-[#0B72E7] focus:outline-none transition-all shadow-xs"
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
      </AdminCard>

      {/* 5. Teacher Cards Grid */}
      {filteredTeachers.length === 0 ? (
        <AdminCard className="p-12 text-center">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#0B72E7] flex items-center justify-center mx-auto mb-3">
            <GraduationCap className="w-6 h-6" />
          </div>
          <p className="text-sm font-bold text-slate-800">No faculty members found</p>
          <p className="text-xs text-slate-400 mt-1">
            {activeTab === 'ARCHIVED'
              ? 'No archived faculty records found.'
              : 'Try clearing your search query or department filter.'}
          </p>
        </AdminCard>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTeachers.map((t) => (
            <AdminCard
              key={t.id}
              className="p-5 flex flex-col justify-between group hover:shadow-[0_8px_30px_rgba(30,64,175,0.08)] transition-all"
            >
              <div>
                {/* Header: Name, Department, Employee ID */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100/60 text-[#0B72E7] border border-blue-200/50 flex items-center justify-center font-bold text-sm shrink-0 shadow-2xs">
                      {t.name
                        .split(' ')
                        .map((n) => n[0])
                        .join('')
                        .substring(0, 2)}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 group-hover:text-[#0B72E7] transition-colors text-sm">
                        {t.name}
                      </h3>
                      <p className="text-xs font-semibold text-[#0B72E7] mt-0.5">{t.department}</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono font-bold bg-slate-50 border border-slate-200/80 px-2 py-0.5 rounded-md text-slate-500">
                    {t.employeeId}
                  </span>
                </div>

                {/* Meta details */}
                <div className="mt-4 space-y-2 border-t border-slate-100 pt-3">
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

                {/* Badges / Status */}
                <div className="mt-4 flex flex-wrap items-center gap-1.5 pt-1">
                  {t.classTeacherSection && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-blue-50 text-[#0B72E7] border border-blue-200/60 px-2.5 py-0.5 rounded-full">
                      <CheckCircle2 className="w-3 h-3" />
                      Class Teacher ({t.classTeacherSection})
                    </span>
                  )}
                  {t.activeSubstitution && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200 px-2.5 py-0.5 rounded-full">
                      <Clock className="w-3 h-3 text-amber-500" />
                      Covering for {t.activeSubstitution.originalTeacherName}
                    </span>
                  )}
                  {t.isActive === false && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-red-50 text-red-700 border border-red-200 px-2.5 py-0.5 rounded-full">
                      Deactivated
                    </span>
                  )}
                </div>
              </div>

              {/* Card Footer: Joined Date & Actions */}
              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                <span>Joined {t.joiningDate}</span>
                <div className="flex items-center gap-1.5">
                  <AdminButton
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedTeacher(t)}
                    icon={<Eye className="w-3.5 h-3.5" />}
                  >
                    View
                  </AdminButton>
                  {activeTab === 'ACTIVE' ? (
                    <button
                      type="button"
                      onClick={() => handleArchiveTeacher(t)}
                      className="inline-flex items-center gap-1 text-red-600 hover:text-red-700 font-semibold px-2 py-1 rounded-lg hover:bg-red-50 transition-colors"
                    >
                      <Archive className="w-3 h-3" />
                      <span>Deactivate</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleReactivateTeacher(t)}
                      className="inline-flex items-center gap-1 text-emerald-600 hover:text-emerald-700 font-semibold px-2 py-1 rounded-lg hover:bg-emerald-50 transition-colors"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Reactivate</span>
                    </button>
                  )}
                </div>
              </div>
            </AdminCard>
          ))}
        </div>
      )}

      {/* 6. TEACHER DOSSIER DRAWER */}
      <AdminDrawer
        isOpen={Boolean(selectedTeacher)}
        onClose={() => setSelectedTeacher(null)}
        title={selectedTeacher ? selectedTeacher.name : 'Faculty Dossier'}
        subtitle={selectedTeacher ? `${selectedTeacher.employeeId} · ${selectedTeacher.department}` : ''}
      >
        {selectedTeacher && (
          <div className="space-y-6">
            <div className="flex items-center gap-4 p-4 rounded-2xl bg-[#F0F7FF] border border-[#BFDBFE]/60">
              <div className="w-14 h-14 rounded-2xl bg-[#0B72E7] text-white flex items-center justify-center font-black text-xl shadow-xs">
                {selectedTeacher.name.charAt(0)}
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-base">{selectedTeacher.name}</h4>
                <p className="text-xs font-semibold text-[#0B72E7]">{selectedTeacher.department} Department</p>
                <p className="text-xs text-slate-500 mt-0.5">Joined on {selectedTeacher.joiningDate}</p>
              </div>
            </div>

            <div className="space-y-3">
              <h5 className="text-xs font-bold uppercase tracking-wider text-slate-400">Contact Information</h5>
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-slate-500 font-medium">Email Address</span>
                  <span className="font-semibold text-slate-800">{selectedTeacher.email}</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-slate-500 font-medium">Phone Number</span>
                  <span className="font-semibold text-slate-800">{selectedTeacher.phone}</span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h5 className="text-xs font-bold uppercase tracking-wider text-slate-400">Academic Qualifications</h5>
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-medium">Degree</span>
                  <span className="font-bold text-slate-800">{selectedTeacher.qualification}</span>
                </div>
                {selectedTeacher.specialization && (
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-medium">Specialization</span>
                    <span className="font-bold text-slate-800">{selectedTeacher.specialization}</span>
                  </div>
                )}
              </div>
            </div>

            {selectedTeacher.classTeacherSection && (
              <div className="p-4 rounded-xl bg-blue-50 border border-blue-200/60 text-xs space-y-1">
                <span className="font-bold text-[#0B72E7]">Designated Class Teacher</span>
                <p className="text-slate-600">Assigned steward for section {selectedTeacher.classTeacherSection}.</p>
              </div>
            )}
          </div>
        )}
      </AdminDrawer>

      {/* 7. CONFIRMATION DIALOG */}
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
