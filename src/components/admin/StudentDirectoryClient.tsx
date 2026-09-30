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
} from 'lucide-react';
import { ConfirmDialog } from '@/components/ui';
import {
  archiveStudentsAction,
  reactivateStudentsAction,
  batchArchiveBySectionAction,
  createStudentAction,
} from '@/actions/admin';

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
        setAddFeedback({ success: true, message: 'Student and parent link successfully created!' });
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
        }, 1200);
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
        searchTerm === '' ||
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.admissionNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.email.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesClass = selectedClass === 'ALL' || s.classSection === selectedClass;
      const matchesGender = selectedGender === 'ALL' || s.gender.toLowerCase() === selectedGender.toLowerCase();
      const matchesFee = selectedFeeStatus === 'ALL' || s.feeStatus.status === selectedFeeStatus;

      return matchesSearch && matchesClass && matchesGender && matchesFee;
    });
  }, [tabStudents, searchTerm, selectedClass, selectedGender, selectedFeeStatus]);

  const activeCount = useMemo(() => students.filter((s) => s.isActive !== false && !s.deletedAt).length, [students]);
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
      description: 'Archived students cannot log in to the portal and will be hidden from active rosters. You can reactivate them anytime.',
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
      description: 'This will archive all students in this section (e.g. for graduating or passing out batches). This action can be undone.',
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

  return (
    <div className="space-y-6">
      {/* 1. DIRECTORY HEADER & QUICK STATS */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl md:text-2xl font-black text-[#111C2D] tracking-tight">
              Student Information & Enrollment Directory
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
            Zero-trust tenant isolated directory with real-time fee & attendance ledger, bulk archiving, and lifecycle management.
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
          <button
            type="button"
            onClick={() => {
              setIsAddModalOpen(true);
              setAddFeedback(null);
            }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#111C2D] hover:bg-[#1a2942] text-white text-xs font-bold transition-all shadow-xs"
          >
            <Plus className="w-3.5 h-3.5 text-brand-primary" />
            <span>Add Student</span>
          </button>
        </div>
      </div>

      {/* 2. TAB SWITCHER (Active vs Archived) */}
      <div className="flex border-b border-brand-border gap-2">
        <button
          onClick={() => {
            setActiveTab('ACTIVE');
            setSelectedIds([]);
          }}
          className={`pb-3 px-4 font-semibold text-body-primary border-b-2 flex items-center gap-2 transition-all ${
            activeTab === 'ACTIVE'
              ? 'border-brand-primary text-brand-primary'
              : 'border-transparent text-brand-muted hover:text-brand-dark'
          }`}
        >
          <Users className="w-4 h-4" />
          Active Students ({activeCount})
        </button>
        <button
          onClick={() => {
            setActiveTab('ARCHIVED');
            setSelectedIds([]);
          }}
          className={`pb-3 px-4 font-semibold text-body-primary border-b-2 flex items-center gap-2 transition-all ${
            activeTab === 'ARCHIVED'
              ? 'border-brand-primary text-brand-primary'
              : 'border-transparent text-brand-muted hover:text-brand-dark'
          }`}
        >
          <Archive className="w-4 h-4" />
          Archived Records ({archivedCount})
        </button>
      </div>

      {/* 3. BATCH ACTIONS BAR (WHEN ITEMS ARE SELECTED) */}
      {selectedIds.length > 0 && (
        <div className="bg-brand-light/70 border border-brand-border p-3.5 rounded-xl flex items-center justify-between gap-4 animate-in fade-in duration-200">
          <div className="flex items-center gap-2 text-caption font-semibold text-brand-dark">
            <span className="w-6 h-6 rounded-full bg-brand-primary text-white flex items-center justify-center text-xs">
              {selectedIds.length}
            </span>
            <span>Selected for batch action</span>
          </div>

          <div className="flex items-center gap-2">
            {activeTab === 'ACTIVE' ? (
              <button
                onClick={handleArchiveSelected}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-caption font-semibold transition-colors"
              >
                <Archive className="w-3.5 h-3.5" />
                Archive Selected ({selectedIds.length})
              </button>
            ) : (
              <button
                onClick={handleReactivateSelected}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-caption font-semibold transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Reactivate Selected ({selectedIds.length})
              </button>
            )}
            <button
              onClick={() => setSelectedIds([])}
              className="text-caption text-brand-muted hover:text-brand-dark px-2 py-1"
            >
              Deselect All
            </button>
          </div>
        </div>
      )}

      {/* 4. FILTER & SEARCH CONTROL BAR */}
      <div className="bg-white p-4 rounded-2xl border border-[#EBF0F5] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#F4F8FA] border border-[#D9E2EC] text-slate-500 text-xs w-full md:w-80 focus-within:border-[#FF7555] focus-within:bg-white transition-all">
          <Search className="w-4 h-4 text-slate-400 shrink-0" />
          <input
            type="text"
            placeholder="Search by student name, roll, or admission ID..."
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

        {/* Dropdown Filters & Section Batch Archiving */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Class Filter */}
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="px-3 py-1.5 rounded-lg border border-[#D9E2EC] bg-white text-xs font-semibold text-slate-700 focus:outline-none focus:border-[#FF7555]"
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
            className="px-3 py-1.5 rounded-lg border border-[#D9E2EC] bg-white text-xs font-semibold text-slate-700 focus:outline-none focus:border-[#FF7555]"
          >
            <option value="ALL">All Genders</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
          </select>

          {/* Fee Filter */}
          <select
            value={selectedFeeStatus}
            onChange={(e) => setSelectedFeeStatus(e.target.value)}
            className="px-3 py-1.5 rounded-lg border border-[#D9E2EC] bg-white text-xs font-semibold text-slate-700 focus:outline-none focus:border-[#FF7555]"
          >
            <option value="ALL">All Fee Status</option>
            <option value="PAID">Paid / Nil Due</option>
            <option value="PENDING">Pending Dues</option>
          </select>

          {/* Batch Section Archive (Year-End) */}
          {activeTab === 'ACTIVE' && sections.length > 0 && (
            <div className="flex items-center gap-1.5 pl-2 border-l border-brand-border">
              <select
                value={sectionToArchive}
                onChange={(e) => setSectionToArchive(e.target.value)}
                className="px-2.5 py-1.5 rounded-lg border border-red-200 bg-red-50/50 text-xs font-semibold text-red-700 focus:outline-none"
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
                  onClick={handleArchiveSection}
                  className="px-2.5 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-semibold"
                >
                  Archive
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* 5. DATA TABLE */}
      <div className="bg-white rounded-2xl border border-[#EBF0F5] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-[#EBF0F5] bg-[#F9FBFC] text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                <th className="py-3 px-4 w-10 text-center">
                  <input
                    type="checkbox"
                    checked={filteredStudents.length > 0 && selectedIds.length === filteredStudents.length}
                    onChange={toggleSelectAll}
                    className="rounded border-brand-border text-brand-primary focus:ring-brand-primary w-4 h-4 cursor-pointer"
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
            </thead>
            <tbody className="divide-y divide-[#EBF0F5]">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <Users className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                    <p className="font-semibold text-slate-600">No students found</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      {activeTab === 'ARCHIVED'
                        ? 'No archived student records present in this tenant.'
                        : 'Try adjusting your filters or search keywords.'}
                    </p>
                  </td>
                </tr>
              ) : (
                filteredStudents.map((s) => (
                  <tr
                    key={s.id}
                    onClick={() => setActiveStudent(s)}
                    className="hover:bg-[#F9FBFC] transition-colors cursor-pointer group"
                  >
                    <td className="py-3.5 px-4 text-center" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(s.id)}
                        onChange={() => toggleSelectOne(s.id)}
                        className="rounded border-brand-border text-brand-primary focus:ring-brand-primary w-4 h-4 cursor-pointer"
                      />
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#111C2D] text-white flex items-center justify-center font-bold text-xs uppercase shrink-0">
                          {s.firstName.charAt(0)}
                          {s.lastName.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 group-hover:text-[#FF7555] transition-colors">
                            {s.name}
                          </p>
                          <p className="text-[11px] text-slate-400">{s.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-semibold text-slate-600">{s.admissionNumber}</td>
                    <td className="py-3.5 px-4 font-bold text-slate-800">{s.classSection}</td>
                    <td className="py-3.5 px-4 text-center">
                      <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {s.attendancePercentage}%
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      {s.feeStatus.pendingAmount === 0 ? (
                        <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          Nil Due
                        </span>
                      ) : (
                        <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-[#FF7555] border border-amber-200">
                          ₹{s.feeStatus.pendingAmount.toLocaleString('en-IN')} Due
                        </span>
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
                            className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
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
                          className="p-1.5 rounded-lg text-slate-400 hover:text-[#FF7555] hover:bg-[#FFF2EE] transition-colors"
                          title="View Full Profile"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer */}
        <div className="p-4 bg-[#FAFCFE] border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>
            Showing {filteredStudents.length} of {tabStudents.length} {activeTab.toLowerCase()} records
          </span>
          <span className="font-semibold text-slate-700">School ERP System • Student Ledger</span>
        </div>
      </div>

      {/* 6. STUDENT DETAIL SLIDE-OVER DRAWER */}
      {activeStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/50 backdrop-blur-xs">
          <div className="bg-white w-full max-w-md h-full shadow-2xl p-6 md:p-8 overflow-y-auto animate-in slide-in-from-right duration-200 flex flex-col justify-between">
            <div>
              {/* Header */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-[#FF7555] uppercase tracking-wider">Student Profile</span>
                  <span className="text-xs text-slate-300">•</span>
                  <span className="text-xs font-semibold text-slate-500">
                    Roll {activeStudent.rollNumber || '-'}
                  </span>
                </div>
                <button
                  onClick={() => setActiveStudent(null)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Identity Banner */}
              <div className="pt-6 text-center">
                <div className="w-20 h-20 rounded-full bg-[#111C2D] text-white flex items-center justify-center font-black text-2xl mx-auto shadow-md">
                  {activeStudent.firstName.charAt(0)}
                  {activeStudent.lastName.charAt(0)}
                </div>
                <h3 className="mt-3 text-lg font-bold text-slate-900">{activeStudent.name}</h3>
                <p className="text-xs text-slate-400 font-mono mt-0.5">{activeStudent.admissionNumber}</p>
                <div className="mt-2 inline-flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#FFF2EE] text-[#FF7555]">
                    {activeStudent.classSection}
                  </span>
                  {activeStudent.isActive === false && (
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-700">
                      Archived
                    </span>
                  )}
                </div>
              </div>

              {/* Information Cards */}
              <div className="mt-6 space-y-4">
                <div className="bg-[#F8FAFC] p-4 rounded-xl border border-slate-100">
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Demographic Details
                  </h4>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <p className="text-slate-400">Date of Birth</p>
                      <p className="font-semibold text-slate-700">{activeStudent.dateOfBirth}</p>
                    </div>
                    <div>
                      <p className="text-slate-400">Gender</p>
                      <p className="font-semibold text-slate-700">{activeStudent.gender}</p>
                    </div>
                    <div>
                      <p className="text-slate-400">Blood Group</p>
                      <p className="font-semibold text-slate-700">{activeStudent.bloodGroup || 'O+'}</p>
                    </div>
                    <div>
                      <p className="text-slate-400">Emergency Phone</p>
                      <p className="font-semibold text-slate-700">{activeStudent.emergencyContact}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-[#F8FAFC] p-4 rounded-xl border border-slate-100">
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Parent & Guardian
                  </h4>
                  {activeStudent.parent ? (
                    <div className="text-xs space-y-1.5">
                      <p className="font-bold text-slate-800">{activeStudent.parent.name}</p>
                      <p className="text-slate-500">
                        {activeStudent.parent.relationship} • {activeStudent.parent.phone}
                      </p>
                      <p className="text-slate-500">{activeStudent.parent.email}</p>
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400 italic">No parent linked to this profile.</p>
                  )}
                </div>

                <div className="bg-[#F8FAFC] p-4 rounded-xl border border-slate-100">
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Financial Status
                  </h4>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <p className="text-slate-400">Total Billed</p>
                      <p className="font-bold text-slate-800">
                        ₹{activeStudent.feeStatus.totalInvoiced.toLocaleString('en-IN')}
                      </p>
                    </div>
                    <div>
                      <p className="text-slate-400">Outstanding Balance</p>
                      <p className="font-bold text-[#FF7555]">
                        ₹{activeStudent.feeStatus.pendingAmount.toLocaleString('en-IN')}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Slide-over Footer Actions */}
            <div className="pt-6 border-t border-slate-100 flex items-center gap-3">
              {activeStudent.isActive !== false ? (
                <button
                  type="button"
                  onClick={() => handleArchiveSingle(activeStudent)}
                  className="w-full py-2.5 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 text-xs font-bold transition-all text-center flex items-center justify-center gap-1.5"
                >
                  <Archive className="w-4 h-4" />
                  <span>Archive Student</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => handleReactivateSingle(activeStudent)}
                  className="w-full py-2.5 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 text-xs font-bold transition-all text-center flex items-center justify-center gap-1.5"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Reactivate Student</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ADD STUDENT MODAL WITH PARENT SECTION */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-6 md:p-8 my-8 relative animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setIsAddModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
              <div className="w-10 h-10 rounded-xl bg-[#FFF2EE] text-[#FF7555] flex items-center justify-center font-bold">
                <Plus className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">Direct Student Enrollment</h3>
                <p className="text-xs text-slate-500">
                  Register new student profile with automated parent account & sibling linking.
                </p>
              </div>
            </div>

            {addFeedback && (
              <div
                className={`mb-5 p-3.5 rounded-xl text-xs font-semibold flex items-center gap-2.5 ${
                  addFeedback.success
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    : 'bg-red-50 text-red-700 border border-red-200'
                }`}
              >
                {addFeedback.success ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                )}
                <span>{addFeedback.message}</span>
              </div>
            )}

            <form onSubmit={handleCreateStudent} className="space-y-6">
              {/* Section 1: Student Demographics */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#FF7555] flex items-center gap-2">
                  <span>1. Student Information</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                      className="w-full bg-[#F4F8FA] border border-[#D9E2EC] rounded-lg p-2.5 text-xs text-slate-800 focus:bg-white focus:border-[#FF7555] outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Class & Section <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={addForm.sectionId}
                      onChange={(e) => setAddForm({ ...addForm, sectionId: e.target.value })}
                      className="w-full bg-[#F4F8FA] border border-[#D9E2EC] rounded-lg p-2.5 text-xs text-slate-800 focus:bg-white focus:border-[#FF7555] outline-none"
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
                      className="w-full bg-[#F4F8FA] border border-[#D9E2EC] rounded-lg p-2.5 text-xs text-slate-800 focus:bg-white focus:border-[#FF7555] outline-none"
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
                      className="w-full bg-[#F4F8FA] border border-[#D9E2EC] rounded-lg p-2.5 text-xs text-slate-800 focus:bg-white focus:border-[#FF7555] outline-none"
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
                      className="w-full bg-[#F4F8FA] border border-[#D9E2EC] rounded-lg p-2.5 text-xs text-slate-800 focus:bg-white focus:border-[#FF7555] outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Gender</label>
                    <select
                      value={addForm.gender}
                      onChange={(e) => setAddForm({ ...addForm, gender: e.target.value as any })}
                      className="w-full bg-[#F4F8FA] border border-[#D9E2EC] rounded-lg p-2.5 text-xs text-slate-800 focus:bg-white focus:border-[#FF7555] outline-none"
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
                      className="w-full bg-[#F4F8FA] border border-[#D9E2EC] rounded-lg p-2.5 text-xs text-slate-800 focus:bg-white focus:border-[#FF7555] outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Section 2: Parent / Guardian & Sibling Linking */}
              <div className="space-y-4 pt-4 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#FF7555]">
                    2. Parent & Guardian Details
                  </h4>
                  <span className="text-[11px] text-slate-400 font-medium">
                    (Auto-links siblings if parent phone exists)
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Father's Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={addForm.fatherName}
                      onChange={(e) => setAddForm({ ...addForm, fatherName: e.target.value })}
                      placeholder="Father full name"
                      className="w-full bg-[#F4F8FA] border border-[#D9E2EC] rounded-lg p-2.5 text-xs text-slate-800 focus:bg-white focus:border-[#FF7555] outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Father's Phone Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      value={addForm.fatherPhone}
                      onChange={(e) => setAddForm({ ...addForm, fatherPhone: e.target.value })}
                      placeholder="10-digit mobile number"
                      className="w-full bg-[#F4F8FA] border border-[#D9E2EC] rounded-lg p-2.5 text-xs text-slate-800 focus:bg-white focus:border-[#FF7555] outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Father's Email</label>
                    <input
                      type="email"
                      value={addForm.fatherEmail}
                      onChange={(e) => setAddForm({ ...addForm, fatherEmail: e.target.value })}
                      placeholder="father@example.com (optional)"
                      className="w-full bg-[#F4F8FA] border border-[#D9E2EC] rounded-lg p-2.5 text-xs text-slate-800 focus:bg-white focus:border-[#FF7555] outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Father's Occupation</label>
                    <input
                      type="text"
                      value={addForm.fatherOccupation}
                      onChange={(e) => setAddForm({ ...addForm, fatherOccupation: e.target.value })}
                      placeholder="e.g. Engineer, Business"
                      className="w-full bg-[#F4F8FA] border border-[#D9E2EC] rounded-lg p-2.5 text-xs text-slate-800 focus:bg-white focus:border-[#FF7555] outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Mother's Name</label>
                    <input
                      type="text"
                      value={addForm.motherName}
                      onChange={(e) => setAddForm({ ...addForm, motherName: e.target.value })}
                      placeholder="Mother full name"
                      className="w-full bg-[#F4F8FA] border border-[#D9E2EC] rounded-lg p-2.5 text-xs text-slate-800 focus:bg-white focus:border-[#FF7555] outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Mother's Phone</label>
                    <input
                      type="tel"
                      value={addForm.motherPhone}
                      onChange={(e) => setAddForm({ ...addForm, motherPhone: e.target.value })}
                      placeholder="Mother mobile number"
                      className="w-full bg-[#F4F8FA] border border-[#D9E2EC] rounded-lg p-2.5 text-xs text-slate-800 focus:bg-white focus:border-[#FF7555] outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isAddingStudent}
                  className="px-5 py-2.5 rounded-xl bg-[#111C2D] hover:bg-[#1a2942] text-white text-xs font-bold transition-all flex items-center gap-2 disabled:opacity-60 shadow-xs"
                >
                  {isAddingStudent && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Enroll Student</span>
                </button>
              </div>
            </form>
          </div>
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
