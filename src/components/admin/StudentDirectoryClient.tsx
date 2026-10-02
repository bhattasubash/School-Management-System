'use client';

import React, { useState, useMemo, useTransition } from 'react';
import Link from 'next/link';
import {
  Search,
  Filter,
  Users,
  ChevronRight,
  Eye,
  Phone,
  Mail,
  X,
  CreditCard,
  CalendarCheck,
  Award,
  ArrowUpDown,
  Download,
  Plus,
  Archive,
  RotateCcw,
  AlertTriangle,
  AlertCircle,
  Loader2,
  CheckCircle2,
  GraduationCap,
  Calendar,
  Building2,
} from 'lucide-react';
import {
  archiveStudentsAction,
  reactivateStudentsAction,
  batchArchiveBySectionAction,
} from '@/actions/admin/archive';
import { createStudentAction } from '@/actions/admin/students';
import PageHeader from '@/components/ui/PageHeader';
import DataCard from '@/components/ui/DataCard';
import StatusBadge from '@/components/ui/StatusBadge';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import AdminButton from './ui/AdminButton';
import AdminSearchInput from './ui/AdminSearchInput';
import AdminDrawer from './ui/AdminDrawer';
import AdminModal from './ui/AdminModal';
import { AdminTabs } from './ui/AdminTabs';
import {
  AdminTable,
  AdminTableHeader,
  AdminTableBody,
  AdminTableRow,
  AdminTableCell,
} from './ui/AdminTable';

export interface StudentItem {
  id: string;
  name: string;
  firstName: string;
  lastName: string;
  email: string;
  admissionNumber: string;
  rollNumber: number | null;
  className: string;
  sectionName: string;
  classSection: string;
  gender: string;
  dateOfBirth: string;
  bloodGroup?: string | null;
  address: string;
  emergencyContact: string;
  attendancePercentage: number;
  isActive?: boolean;
  deletedAt?: string | null;
  sectionId?: string;
  feeStatus: {
    totalInvoiced: number;
    totalPaid: number;
    pendingAmount: number;
    status: 'PAID' | 'PENDING' | 'OVERDUE';
  };
  parent?: {
    name: string;
    relationship: string;
    phone: string;
    email: string;
  } | null;
}

interface StudentDirectoryClientProps {
  students: StudentItem[];
  classList: string[];
  sections?: Array<{ id: string; name: string }>;
}

export default function StudentDirectoryClient({
  students: initialStudents,
  classList,
  sections = [],
}: StudentDirectoryClientProps) {
  const [students, setStudents] = useState<StudentItem[]>(initialStudents);
  const [activeTab, setActiveTab] = useState<'ACTIVE' | 'ARCHIVED'>('ACTIVE');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState('ALL');
  const [selectedGender, setSelectedGender] = useState('ALL');
  const [selectedFeeStatus, setSelectedFeeStatus] = useState('ALL');
  const [activeStudent, setActiveStudent] = useState<StudentItem | null>(null);

  // Selection & Confirmation states
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
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

  const [sectionToArchive, setSectionToArchive] = useState<string>('');
  const [isPending, startTransition] = useTransition();

  // Add Student Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addFeedback, setAddFeedback] = useState<{ success?: boolean; message?: string } | null>(null);
  const [isAddingStudent, setIsAddingStudent] = useState(false);
  const [addForm, setAddForm] = useState({
    admissionNumber: '',
    rollNumber: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    gender: 'MALE' as 'MALE' | 'FEMALE' | 'OTHER',
    bloodGroup: 'O+',
    address: '',
    sectionId: sections[0]?.id || '',
    fatherName: '',
    fatherPhone: '',
    fatherEmail: '',
    fatherOccupation: '',
    motherName: '',
    motherPhone: '',
    emergencyContact: '',
    admissionDate: new Date().toISOString().split('T')[0],
  });

  const handleCreateStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddFeedback(null);
    setIsAddingStudent(true);

    try {
      const res = await createStudentAction({
        admissionNumber: addForm.admissionNumber.trim(),
        rollNumber: addForm.rollNumber ? parseInt(addForm.rollNumber, 10) : undefined,
        firstName: addForm.firstName.trim(),
        lastName: addForm.lastName.trim(),
        email: addForm.email.trim() || undefined,
        phone: addForm.phone.trim() || undefined,
        dateOfBirth: addForm.dateOfBirth,
        gender: addForm.gender,
        bloodGroup: addForm.bloodGroup,
        address: addForm.address.trim(),
        sectionId: addForm.sectionId,
        fatherName: addForm.fatherName.trim(),
        fatherPhone: addForm.fatherPhone.trim(),
        fatherEmail: addForm.fatherEmail.trim() || undefined,
        fatherOccupation: addForm.fatherOccupation.trim() || undefined,
        motherName: addForm.motherName.trim() || addForm.fatherName.trim(),
        motherPhone: addForm.motherPhone.trim() || undefined,
        emergencyContact: addForm.emergencyContact.trim() || addForm.fatherPhone.trim(),
        admissionDate: addForm.admissionDate,
      });

      if (!res.success) {
        setAddFeedback({ success: false, message: res.error || 'Failed to create student.' });
      } else {
        setAddFeedback({ success: true, message: 'Student successfully enrolled!' });
        const targetSec = sections.find((s) => s.id === addForm.sectionId);
        const newStudentItem: StudentItem = {
          id: res.studentId || Math.random().toString(),
          name: `${addForm.firstName} ${addForm.lastName}`,
          firstName: addForm.firstName,
          lastName: addForm.lastName,
          email: addForm.email || `std.${addForm.admissionNumber.toLowerCase()}@school.edu.in`,
          admissionNumber: addForm.admissionNumber,
          rollNumber: addForm.rollNumber ? parseInt(addForm.rollNumber, 10) : null,
          className: targetSec?.name.split('-')[0] || 'Class',
          sectionName: targetSec?.name.split('-')[1] || 'A',
          classSection: targetSec?.name || 'Class-A',
          gender: addForm.gender,
          dateOfBirth: addForm.dateOfBirth,
          bloodGroup: addForm.bloodGroup,
          address: addForm.address,
          emergencyContact: addForm.emergencyContact || addForm.fatherPhone,
          attendancePercentage: 100,
          isActive: true,
          deletedAt: null,
          sectionId: addForm.sectionId,
          feeStatus: {
            totalInvoiced: 0,
            totalPaid: 0,
            pendingAmount: 0,
            status: 'PAID',
          },
          parent: addForm.fatherName
            ? {
                name: addForm.fatherName,
                relationship: 'FATHER',
                phone: addForm.fatherPhone,
                email: addForm.fatherEmail || 'N/A',
              }
            : null,
        };

        setStudents((prev) => [newStudentItem, ...prev]);
        setTimeout(() => {
          setIsAddModalOpen(false);
          setAddFeedback(null);
        }, 1000);
      }
    } catch (err: any) {
      setAddFeedback({ success: false, message: err?.message || 'Error creating student.' });
    } finally {
      setIsAddingStudent(false);
    }
  };

  // Filter students based on active/archived tab and search criteria
  const tabStudents = useMemo(() => {
    return students.filter((s) => {
      const isArchived = s.isActive === false || Boolean(s.deletedAt);
      return activeTab === 'ARCHIVED' ? isArchived : !isArchived;
    });
  }, [students, activeTab]);

  const filteredStudents = useMemo(() => {
    return tabStudents.filter((s) => {
      const matchesSearch =
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.admissionNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (s.rollNumber && s.rollNumber.toString().includes(searchTerm));

      const matchesClass = selectedClass === 'ALL' || s.className === selectedClass || s.classSection === selectedClass;
      const matchesGender = selectedGender === 'ALL' || s.gender.toLowerCase() === selectedGender.toLowerCase();
      const matchesFee =
        selectedFeeStatus === 'ALL' ||
        (selectedFeeStatus === 'PAID' && s.feeStatus.pendingAmount === 0) ||
        (selectedFeeStatus === 'PENDING' && s.feeStatus.pendingAmount > 0);

      return matchesSearch && matchesClass && matchesGender && matchesFee;
    });
  }, [tabStudents, searchTerm, selectedClass, selectedGender, selectedFeeStatus]);

  const activeCount = students.filter((s) => s.isActive !== false && !s.deletedAt).length;
  const archivedCount = students.length - activeCount;

  // Toggle selection
  const toggleSelectAll = () => {
    if (selectedIds.length === filteredStudents.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredStudents.map((s) => s.id));
    }
  };

  const toggleSelectOne = (id: string) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));
  };

  // Archive Selected
  const handleArchiveSelected = () => {
    if (selectedIds.length === 0) return;
    setConfirmDialog({
      isOpen: true,
      title: `Archive ${selectedIds.length} Selected Student(s)?`,
      description: 'Archived students will be disabled from login and removed from active rosters. You can restore them anytime.',
      variant: 'danger',
      confirmLabel: 'Archive Students',
      action: async () => {
        const res = await archiveStudentsAction(selectedIds);
        if (res.success) {
          setStudents((prev) =>
            prev.map((s) => (selectedIds.includes(s.id) ? { ...s, isActive: false, deletedAt: new Date().toISOString() } : s))
          );
          setSelectedIds([]);
        } else {
          alert(res.error || 'Failed to archive students.');
        }
      },
    });
  };

  // Reactivate Selected
  const handleReactivateSelected = () => {
    if (selectedIds.length === 0) return;
    setConfirmDialog({
      isOpen: true,
      title: `Reactivate ${selectedIds.length} Selected Student(s)?`,
      description: 'Reactivated students will regain portal login access and appear in active class rosters.',
      variant: 'info',
      confirmLabel: 'Reactivate',
      action: async () => {
        const res = await reactivateStudentsAction(selectedIds);
        if (res.success) {
          setStudents((prev) =>
            prev.map((s) => (selectedIds.includes(s.id) ? { ...s, isActive: true, deletedAt: null } : s))
          );
          setSelectedIds([]);
        } else {
          alert(res.error || 'Failed to reactivate students.');
        }
      },
    });
  };

  // Archive Single Student
  const handleArchiveSingle = (student: StudentItem) => {
    setConfirmDialog({
      isOpen: true,
      title: `Archive Student: ${student.name}?`,
      description: `Admission ID: ${student.admissionNumber}. The student will be disabled from login and moved to the Archived directory.`,
      variant: 'danger',
      confirmLabel: 'Archive',
      action: async () => {
        const res = await archiveStudentsAction([student.id]);
        if (res.success) {
          setStudents((prev) =>
            prev.map((s) => (s.id === student.id ? { ...s, isActive: false, deletedAt: new Date().toISOString() } : s))
          );
          if (activeStudent?.id === student.id) setActiveStudent(null);
        } else {
          alert(res.error || 'Failed to archive student.');
        }
      },
    });
  };

  // Reactivate Single Student
  const handleReactivateSingle = (student: StudentItem) => {
    setConfirmDialog({
      isOpen: true,
      title: `Reactivate Student: ${student.name}?`,
      description: `Admission ID: ${student.admissionNumber}. The student will regain active status and login capability.`,
      variant: 'info',
      confirmLabel: 'Reactivate',
      action: async () => {
        const res = await reactivateStudentsAction([student.id]);
        if (res.success) {
          setStudents((prev) =>
            prev.map((s) => (s.id === student.id ? { ...s, isActive: true, deletedAt: null } : s))
          );
          if (activeStudent?.id === student.id) setActiveStudent(null);
        } else {
          alert(res.error || 'Failed to reactivate student.');
        }
      },
    });
  };

  // Batch Archive Entire Section
  const handleArchiveSection = () => {
    if (!sectionToArchive) return;
    const targetSection = sections.find((s) => s.id === sectionToArchive);
    setConfirmDialog({
      isOpen: true,
      title: `Archive Entire Section: ${targetSection?.name || 'Selected'}?`,
      description: 'This will archive all students in this section. This action can be undone.',
      variant: 'warning',
      confirmLabel: 'Archive Section',
      action: async () => {
        const res = await batchArchiveBySectionAction(sectionToArchive);
        if (res.success) {
          setStudents((prev) =>
            prev.map((s) => (s.sectionId === sectionToArchive ? { ...s, isActive: false, deletedAt: new Date().toISOString() } : s))
          );
          setSectionToArchive('');
        } else {
          alert(res.error || 'Failed to archive section.');
        }
      },
    });
  };

  const overdueCount = students.filter((s) => s.feeStatus.pendingAmount > 0).length;

  return (
    <div className="space-y-5">
      {/* 1. UNIFIED PAGE HEADER */}
      <PageHeader
        title="Students"
        subtitle="Manage student directory, admissions records, guardian links, and academic profiles."
        breadcrumbs={[{ label: 'Students' }]}
        actions={
          <>
            <Link href="/admin/bulk-import">
              <AdminButton variant="secondary" icon={<Download className="w-3.5 h-3.5 text-[#0B72E7]" />}>
                Bulk Import
              </AdminButton>
            </Link>
            <AdminButton
              variant="primary"
              onClick={() => {
                setIsAddModalOpen(true);
                setAddFeedback(null);
              }}
              icon={<Plus className="w-3.5 h-3.5" />}
            >
              Add Student
            </AdminButton>
          </>
        }
      />

      {/* 2. EXECUTIVE KPI CARDS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <DataCard padding="md" hover={false}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Enrolled Students
            </span>
            <div className="w-8 h-8 rounded-xl bg-[#EBF4FE] text-[#0B72E7] flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold text-slate-900">{activeCount}</span>
            <p className="text-xs text-slate-500 mt-0.5">Active directory records</p>
          </div>
        </DataCard>

        <DataCard padding="md" hover={false}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Classes & Sections
            </span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <GraduationCap className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold text-slate-900">{classList.length}</span>
            <p className="text-xs text-slate-500 mt-0.5">{sections.length} active class sections</p>
          </div>
        </DataCard>

        <DataCard padding="md" hover={false}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Average Attendance
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CalendarCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold text-slate-900">96%</span>
            <p className="text-xs text-slate-500 mt-0.5">Academic session attendance</p>
          </div>
        </DataCard>

        <DataCard padding="md" hover={false}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Pending Fee Accounts
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold text-slate-900">{overdueCount}</span>
            <p className="text-xs text-slate-500 mt-0.5">Accounts with outstanding balance</p>
          </div>
        </DataCard>
      </div>

      {/* 3. TAB SELECTOR & BATCH STRIP */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <AdminTabs
          activeTab={activeTab}
          onChange={(tab) => {
            setActiveTab(tab as any);
            setSelectedIds([]);
          }}
          tabs={[
            { id: 'ACTIVE', label: 'Active Students', count: activeCount, icon: <Users className="w-3.5 h-3.5" /> },
            { id: 'ARCHIVED', label: 'Archived Records', count: archivedCount, icon: <Archive className="w-3.5 h-3.5" /> },
          ]}
        />

        {/* Batch Action Buttons if items selected */}
        {selectedIds.length > 0 && (
          <div className="flex items-center gap-2 bg-[#EBF4FE] border border-[#BFDBFE] px-3 py-1.5 rounded-xl">
            <span className="text-xs font-semibold text-[#0B72E7]">
              {selectedIds.length} selected
            </span>
            {activeTab === 'ACTIVE' ? (
              <AdminButton size="sm" variant="destructive" onClick={handleArchiveSelected} icon={<Archive className="w-3 h-3" />}>
                Archive Selected
              </AdminButton>
            ) : (
              <AdminButton size="sm" variant="primary" onClick={handleReactivateSelected} icon={<RotateCcw className="w-3 h-3" />}>
                Reactivate Selected
              </AdminButton>
            )}
            <button
              onClick={() => setSelectedIds([])}
              className="text-xs text-slate-500 hover:text-slate-800 ml-1 cursor-pointer"
            >
              Clear
            </button>
          </div>
        )}
      </div>

      {/* 4. FILTERS & SEARCH CONTROL BAR */}
      <div className="bg-white p-4 rounded-[22px] border border-[#E2EEF8] shadow-[0_4px_24px_rgba(30,64,175,0.03)] flex flex-col md:flex-row md:items-center justify-between gap-3">
        <AdminSearchInput
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder="Search by student name, roll, or admission ID..."
          widthClass="w-full md:w-80"
        />

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Class Filter */}
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 focus:outline-none focus:border-[#0B72E7]"
          >
            <option value="ALL">All Classes & Sections</option>
            {classList.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          {/* Gender Filter */}
          <select
            value={selectedGender}
            onChange={(e) => setSelectedGender(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 focus:outline-none focus:border-[#0B72E7]"
          >
            <option value="ALL">All Genders</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
          </select>

          {/* Fee Filter */}
          <select
            value={selectedFeeStatus}
            onChange={(e) => setSelectedFeeStatus(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 focus:outline-none focus:border-[#0B72E7]"
          >
            <option value="ALL">All Fee Status</option>
            <option value="PAID">Paid / Nil Due</option>
            <option value="PENDING">Pending Dues</option>
          </select>

          {/* Batch Section Archive */}
          {activeTab === 'ACTIVE' && sections.length > 0 && (
            <div className="flex items-center gap-1.5 pl-2 border-l border-slate-200">
              <select
                value={sectionToArchive}
                onChange={(e) => setSectionToArchive(e.target.value)}
                className="px-2.5 py-2 rounded-xl border border-rose-200 bg-rose-50/50 text-xs font-semibold text-rose-700 focus:outline-none"
              >
                <option value="">Archive Whole Section...</option>
                {sections.map((sec) => (
                  <option key={sec.id} value={sec.id}>
                    {sec.name}
                  </option>
                ))}
              </select>
              {sectionToArchive && (
                <button
                  type="button"
                  onClick={handleArchiveSection}
                  className="px-3 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold"
                >
                  Archive
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* 5. DATA TABLE */}
      <AdminTable>
        <AdminTableHeader>
          <tr>
            <th className="py-3 px-4 w-10 text-center">
              <input
                type="checkbox"
                checked={filteredStudents.length > 0 && selectedIds.length === filteredStudents.length}
                onChange={toggleSelectAll}
                className="rounded border-slate-300 text-[#0B72E7] focus:ring-[#0B72E7] w-4 h-4 cursor-pointer"
              />
            </th>
            <th className="py-3 px-4">Student Name</th>
            <th className="py-3 px-4">Admission #</th>
            <th className="py-3 px-4">Class & Sec</th>
            <th className="py-3 px-4 text-center">Attendance</th>
            <th className="py-3 px-4 text-center">Fee Status</th>
            <th className="py-3 px-4">Primary Parent</th>
            <th className="py-3 px-4 text-right">Actions</th>
          </tr>
        </AdminTableHeader>
        <AdminTableBody>
          {filteredStudents.length === 0 ? (
            <tr>
              <td colSpan={8} className="py-12 text-center text-slate-400">
                <Users className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                <p className="font-semibold text-slate-600">No students found</p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  {activeTab === 'ARCHIVED'
                    ? 'No archived student records present.'
                    : 'Try adjusting your filters or search keywords.'}
                </p>
              </td>
            </tr>
          ) : (
            filteredStudents.map((s) => (
              <AdminTableRow
                key={s.id}
                onClick={() => setActiveStudent(s)}
                className="cursor-pointer group"
              >
                <td className="py-3.5 px-4 text-center" onClick={(e) => e.stopPropagation()}>
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(s.id)}
                    onChange={() => toggleSelectOne(s.id)}
                    className="rounded border-slate-300 text-[#0B72E7] focus:ring-[#0B72E7] w-4 h-4 cursor-pointer"
                  />
                </td>
                <td className="py-3.5 px-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#0B72E7] text-white flex items-center justify-center font-bold text-xs uppercase shrink-0 shadow-xs">
                      {s.firstName.charAt(0)}
                      {s.lastName.charAt(0)}
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 group-hover:text-[#0B72E7] transition-colors">
                        {s.name}
                      </p>
                      <p className="text-[11px] text-slate-400">{s.email}</p>
                    </div>
                  </div>
                </td>
                <td className="py-3.5 px-4 font-mono font-semibold text-slate-600">{s.admissionNumber}</td>
                <td className="py-3.5 px-4">
                  <span className="font-semibold px-2 py-0.5 rounded-lg bg-slate-100 text-slate-700 text-xs">
                    {s.classSection}
                  </span>
                </td>
                <td className="py-3.5 px-4 text-center">
                  <StatusBadge status="PRESENT">
                    {s.attendancePercentage}%
                  </StatusBadge>
                </td>
                <td className="py-3.5 px-4 text-center">
                  {s.feeStatus.pendingAmount === 0 ? (
                    <StatusBadge status="PAID">Nil Due</StatusBadge>
                  ) : (
                    <StatusBadge status="PENDING">
                      ₹{s.feeStatus.pendingAmount.toLocaleString('en-IN')} Due
                    </StatusBadge>
                  )}
                </td>
                <td className="py-3.5 px-4">
                  {s.parent ? (
                    <div>
                      <p className="font-bold text-slate-700">{s.parent.name}</p>
                      <p className="text-[10px] text-slate-400">
                        {s.parent.relationship} • {s.parent.phone}
                      </p>
                    </div>
                  ) : (
                    <span className="text-slate-400 italic">Not Linked</span>
                  )}
                </td>
                <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center justify-end gap-1">
                    {activeTab === 'ACTIVE' ? (
                      <button
                        type="button"
                        onClick={() => handleArchiveSingle(s)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                        title="Archive Student"
                      >
                        <Archive className="w-4 h-4" />
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleReactivateSingle(s)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors"
                        title="Reactivate Student"
                      >
                        <RotateCcw className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => setActiveStudent(s)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-[#0B72E7] hover:bg-[#EBF4FE] transition-colors"
                      title="View Full Profile"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </AdminTableRow>
            ))
          )}
        </AdminTableBody>
      </AdminTable>

      {/* 6. STUDENT PROFILE DOSSIER SLIDE-OVER DRAWER */}
      {activeStudent && (
        <AdminDrawer
          isOpen={Boolean(activeStudent)}
          onClose={() => setActiveStudent(null)}
          title="Student Dossier"
          subtitle={`Admission ID: ${activeStudent.admissionNumber} • Roll: ${activeStudent.rollNumber || '-'}`}
          footer={
            activeStudent.isActive !== false ? (
              <AdminButton
                variant="destructive"
                onClick={() => handleArchiveSingle(activeStudent)}
                icon={<Archive className="w-4 h-4" />}
              >
                Archive Student Record
              </AdminButton>
            ) : (
              <AdminButton
                variant="primary"
                onClick={() => handleReactivateSingle(activeStudent)}
                icon={<RotateCcw className="w-4 h-4" />}
              >
                Reactivate Student Record
              </AdminButton>
            )
          }
        >
          {/* Identity Header */}
          <div className="text-center pb-4 border-b border-slate-100">
            <div className="w-20 h-20 rounded-full bg-[#0B72E7] text-white flex items-center justify-center font-black text-2xl mx-auto shadow-md">
              {activeStudent.firstName.charAt(0)}
              {activeStudent.lastName.charAt(0)}
            </div>
            <h3 className="mt-3 text-lg font-bold text-slate-900">{activeStudent.name}</h3>
            <p className="text-xs text-slate-400 font-mono mt-0.5">{activeStudent.email}</p>
            <div className="mt-2.5 inline-flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#EBF4FE] text-[#0B72E7]">
                {activeStudent.classSection}
              </span>
              {activeStudent.isActive === false ? (
                <StatusBadge status="INACTIVE">Archived</StatusBadge>
              ) : (
                <StatusBadge status="ACTIVE">Active</StatusBadge>
              )}
            </div>
          </div>

          {/* Dossier Information Cards */}
          <div className="space-y-4">
            <div className="bg-[#F8FAFC] p-4 rounded-2xl border border-slate-100">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2.5">
                Demographic Details
              </h4>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <p className="text-slate-400">Date of Birth</p>
                  <p className="font-semibold text-slate-800">{activeStudent.dateOfBirth}</p>
                </div>
                <div>
                  <p className="text-slate-400">Gender</p>
                  <p className="font-semibold text-slate-800">{activeStudent.gender}</p>
                </div>
                <div>
                  <p className="text-slate-400">Blood Group</p>
                  <p className="font-semibold text-slate-800">{activeStudent.bloodGroup || 'O+'}</p>
                </div>
                <div>
                  <p className="text-slate-400">Emergency Phone</p>
                  <p className="font-semibold text-slate-800">{activeStudent.emergencyContact}</p>
                </div>
              </div>
            </div>

            <div className="bg-[#F8FAFC] p-4 rounded-2xl border border-slate-100">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2.5">
                Parent & Guardian Information
              </h4>
              {activeStudent.parent ? (
                <div className="text-xs space-y-1.5">
                  <p className="font-bold text-slate-900">{activeStudent.parent.name}</p>
                  <p className="text-slate-500">
                    {activeStudent.parent.relationship} • {activeStudent.parent.phone}
                  </p>
                  <p className="text-slate-500">{activeStudent.parent.email}</p>
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic">No parent linked to this profile.</p>
              )}
            </div>

            <div className="bg-[#F8FAFC] p-4 rounded-2xl border border-slate-100">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2.5">
                Financial Ledger
              </h4>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <p className="text-slate-400">Total Invoiced</p>
                  <p className="font-bold text-slate-900">
                    ₹{activeStudent.feeStatus.totalInvoiced.toLocaleString('en-IN')}
                  </p>
                </div>
                <div>
                  <p className="text-slate-400">Outstanding Balance</p>
                  <p className="font-bold text-rose-600">
                    ₹{activeStudent.feeStatus.pendingAmount.toLocaleString('en-IN')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </AdminDrawer>
      )}

      {/* 7. ADD STUDENT MODAL */}
      <AdminModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Direct Student Enrollment"
        description="Register new student profile with automated parent account linking."
        maxWidth="2xl"
        footer={
          <>
            <AdminButton variant="secondary" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </AdminButton>
            <AdminButton
              variant="primary"
              isLoading={isAddingStudent}
              onClick={handleCreateStudent}
              icon={<Plus className="w-3.5 h-3.5" />}
            >
              Enroll Student
            </AdminButton>
          </>
        }
      >
        <form onSubmit={handleCreateStudent} className="space-y-5">
          {addFeedback && (
            <div
              className={`p-3.5 rounded-xl text-xs font-semibold flex items-center gap-2.5 ${
                addFeedback.success
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : 'bg-rose-50 text-rose-700 border border-rose-200'
              }`}
            >
              {addFeedback.success ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              )}
              <span>{addFeedback.message}</span>
            </div>
          )}

          {/* Section 1: Student Demographics */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#0B72E7]">
              1. Student Demographics
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Admission Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={addForm.admissionNumber}
                  onChange={(e) => setAddForm({ ...addForm, admissionNumber: e.target.value })}
                  placeholder="e.g. ADM-2026-101"
                  className="w-full bg-[#F8FAFC] border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 focus:bg-white focus:border-[#0B72E7] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Class & Section <span className="text-red-500">*</span>
                </label>
                <select
                  value={addForm.sectionId}
                  onChange={(e) => setAddForm({ ...addForm, sectionId: e.target.value })}
                  className="w-full bg-[#F8FAFC] border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 focus:bg-white focus:border-[#0B72E7] outline-none"
                >
                  {sections.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  First Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={addForm.firstName}
                  onChange={(e) => setAddForm({ ...addForm, firstName: e.target.value })}
                  placeholder="First name"
                  className="w-full bg-[#F8FAFC] border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 focus:bg-white focus:border-[#0B72E7] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Last Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={addForm.lastName}
                  onChange={(e) => setAddForm({ ...addForm, lastName: e.target.value })}
                  placeholder="Last name"
                  className="w-full bg-[#F8FAFC] border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 focus:bg-white focus:border-[#0B72E7] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Date of Birth <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  required
                  value={addForm.dateOfBirth}
                  onChange={(e) => setAddForm({ ...addForm, dateOfBirth: e.target.value })}
                  className="w-full bg-[#F8FAFC] border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 focus:bg-white focus:border-[#0B72E7] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Gender</label>
                <select
                  value={addForm.gender}
                  onChange={(e) => setAddForm({ ...addForm, gender: e.target.value as any })}
                  className="w-full bg-[#F8FAFC] border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 focus:bg-white focus:border-[#0B72E7] outline-none"
                >
                  <option value="MALE">Male</option>
                  <option value="FEMALE">Female</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Residential Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={addForm.address}
                  onChange={(e) => setAddForm({ ...addForm, address: e.target.value })}
                  placeholder="Full residential address"
                  className="w-full bg-[#F8FAFC] border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 focus:bg-white focus:border-[#0B72E7] outline-none"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Parent / Guardian Details */}
          <div className="space-y-3 pt-3 border-t border-slate-100">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#0B72E7]">
              2. Parent & Guardian Details
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Father&apos;s Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={addForm.fatherName}
                  onChange={(e) => setAddForm({ ...addForm, fatherName: e.target.value })}
                  placeholder="Father full name"
                  className="w-full bg-[#F8FAFC] border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 focus:bg-white focus:border-[#0B72E7] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Father&apos;s Mobile <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  required
                  value={addForm.fatherPhone}
                  onChange={(e) => setAddForm({ ...addForm, fatherPhone: e.target.value })}
                  placeholder="10-digit mobile number"
                  className="w-full bg-[#F8FAFC] border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 focus:bg-white focus:border-[#0B72E7] outline-none"
                />
              </div>
            </div>
          </div>
        </form>
      </AdminModal>

      {/* 8. CONFIRMATION DIALOG */}
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
