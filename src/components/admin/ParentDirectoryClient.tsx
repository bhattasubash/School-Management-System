'use client';

import React, { useState, useMemo, useTransition } from 'react';
import {
  Users,
  Search,
  Phone,
  Mail,
  UserCheck,
  GraduationCap,
  Plus,
  Link as LinkIcon,
  X,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Briefcase,
  Heart,
  ShieldCheck,
} from 'lucide-react';
import {
  DataTable,
  PageHeader,
  StatusBadge,
  SearchableSelect,
  FormField,
  type Column,
} from '@/components/ui';
import AdminCard from './ui/AdminCard';
import AdminButton from './ui/AdminButton';
import AdminSearchInput from './ui/AdminSearchInput';
import AdminModal from './ui/AdminModal';
import { linkParentToStudentAction, unlinkParentAction } from '@/actions/admin/parents';

export interface ParentDirectoryItem {
  id: string;
  userId: string;
  name: string;
  email: string;
  phone: string;
  relationship: string;
  occupation: string;
  isActive: boolean;
  studentsCount: number;
  linkedStudents: Array<{
    id: string;
    name: string;
    admissionNumber: string;
    classSection: string;
    isPrimary: boolean;
  }>;
}

interface ParentDirectoryClientProps {
  initialParents: ParentDirectoryItem[];
  allStudents: Array<{ id: string; name: string; classSection: string }>;
}

export default function ParentDirectoryClient({
  initialParents,
  allStudents,
}: ParentDirectoryClientProps) {
  const [parents, setParents] = useState<ParentDirectoryItem[]>(initialParents);
  const [searchTerm, setSearchTerm] = useState('');
  const [relationshipFilter, setRelationshipFilter] = useState('ALL');

  // Modal State for Linking Student
  const [selectedParent, setSelectedParent] = useState<ParentDirectoryItem | null>(null);
  const [linkStudentId, setLinkStudentId] = useState('');
  const [isPrimaryContact, setIsPrimaryContact] = useState(false);
  const [modalFeedback, setModalFeedback] = useState<{ success?: boolean; message?: string } | null>(null);
  const [isPending, startTransition] = useTransition();

  // Metrics
  const metrics = useMemo(() => {
    const total = parents.length;
    const fathers = parents.filter((p) => p.relationship.toUpperCase() === 'FATHER').length;
    const mothers = parents.filter((p) => p.relationship.toUpperCase() === 'MOTHER').length;
    const linkedKids = parents.reduce((acc, p) => acc + p.studentsCount, 0);
    return { total, fathers, mothers, linkedKids };
  }, [parents]);

  const filteredParents = useMemo(() => {
    return parents.filter((p) => {
      const matchesSearch =
        searchTerm === '' ||
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.phone.includes(searchTerm) ||
        p.linkedStudents.some((s) => s.name.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesRel =
        relationshipFilter === 'ALL' || p.relationship.toUpperCase() === relationshipFilter.toUpperCase();

      return matchesSearch && matchesRel;
    });
  }, [parents, searchTerm, relationshipFilter]);

  const handleLinkStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedParent || !linkStudentId) return;

    setModalFeedback(null);
    startTransition(async () => {
      const res = await linkParentToStudentAction({
        parentId: selectedParent.id,
        studentId: linkStudentId,
        isPrimary: isPrimaryContact,
      });

      if (!res.success) {
        setModalFeedback({ success: false, message: res.error || 'Failed to link student.' });
      } else {
        setModalFeedback({ success: true, message: 'Student successfully linked to parent profile!' });
        const targetStudent = allStudents.find((s) => s.id === linkStudentId);
        if (targetStudent) {
          setParents((prev) =>
            prev.map((p) => {
              if (p.id === selectedParent.id) {
                return {
                  ...p,
                  studentsCount: p.studentsCount + 1,
                  linkedStudents: [
                    ...p.linkedStudents,
                    {
                      id: targetStudent.id,
                      name: targetStudent.name,
                      admissionNumber: 'ADM',
                      classSection: targetStudent.classSection,
                      isPrimary: isPrimaryContact,
                    },
                  ],
                };
              }
              return p;
            })
          );
        }
        setTimeout(() => {
          setSelectedParent(null);
          setLinkStudentId('');
          setModalFeedback(null);
        }, 1200);
      }
    });
  };

  const handleUnlink = async (parentId: string, studentId: string) => {
    if (!confirm('Are you sure you want to unlink this student from this parent?')) return;

    const res = await unlinkParentAction({ parentId, studentId });
    if (res.success) {
      setParents((prev) =>
        prev.map((p) => {
          if (p.id === parentId) {
            return {
              ...p,
              studentsCount: Math.max(0, p.studentsCount - 1),
              linkedStudents: p.linkedStudents.filter((s) => s.id !== studentId),
            };
          }
          return p;
        })
      );
    }
  };

  const studentSelectOptions = useMemo(() => {
    return allStudents.map((s) => ({
      value: s.id,
      label: `${s.name} (${s.classSection})`,
    }));
  }, [allStudents]);

  const columns: Column<Record<string, unknown>>[] = [
    {
      key: 'name',
      label: 'Parent Name',
      sortable: true,
      render: (_, row) => {
        const item = row as unknown as ParentDirectoryItem;
        return (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-50 text-[#0B72E7] border border-blue-100 flex items-center justify-center font-bold text-sm shadow-xs">
              {item.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="font-bold text-slate-900 leading-tight">{item.name}</p>
              <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                <span className="flex items-center gap-1">
                  <Mail className="w-3 h-3 text-slate-400" />
                  {item.email}
                </span>
              </div>
            </div>
          </div>
        );
      },
    },
    {
      key: 'phone',
      label: 'Phone Number',
      render: (val) => (
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-100">
          <Phone className="w-3.5 h-3.5 text-[#0B72E7]" />
          {String(val || 'N/A')}
        </span>
      ),
    },
    {
      key: 'relationship',
      label: 'Relation',
      sortable: true,
      render: (val) => {
        const rel = String(val || 'GUARDIAN').toUpperCase();
        let badgeColor = 'bg-blue-50 text-blue-700 border-blue-200/60';
        if (rel === 'MOTHER') badgeColor = 'bg-purple-50 text-purple-700 border-purple-200/60';
        if (rel === 'FATHER') badgeColor = 'bg-sky-50 text-sky-700 border-sky-200/60';
        return (
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${badgeColor}`}>
            {rel}
          </span>
        );
      },
    },
    {
      key: 'occupation',
      label: 'Occupation',
      render: (val) => (
        <span className="text-xs text-slate-500 inline-flex items-center gap-1.5 font-medium">
          <Briefcase className="w-3.5 h-3.5 text-slate-400" />
          {String(val || 'Not specified')}
        </span>
      ),
    },
    {
      key: 'linkedStudents',
      label: 'Enrolled Children',
      render: (_, row) => {
        const item = row as unknown as ParentDirectoryItem;
        if (item.linkedStudents.length === 0) {
          return <span className="text-xs text-slate-400 italic">No students linked</span>;
        }
        return (
          <div className="flex flex-wrap gap-1.5">
            {item.linkedStudents.map((child) => (
              <span
                key={child.id}
                className="inline-flex items-center gap-1.5 text-[11px] font-bold bg-[#EBF5FF] text-[#0B72E7] border border-[#BFDBFE] px-2.5 py-1 rounded-full shadow-2xs"
              >
                <GraduationCap className="w-3 h-3 text-[#0B72E7]" />
                <span>{child.name}</span>
                <span className="text-blue-500/80 font-normal">({child.classSection})</span>
                <button
                  type="button"
                  onClick={() => handleUnlink(item.id, child.id)}
                  title="Unlink student"
                  className="ml-1 text-blue-400 hover:text-red-500 transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        );
      },
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_, row) => {
        const item = row as unknown as ParentDirectoryItem;
        return (
          <AdminButton
            variant="secondary"
            size="sm"
            onClick={() => {
              setSelectedParent(item);
              setLinkStudentId('');
              setModalFeedback(null);
            }}
            icon={<LinkIcon className="w-3.5 h-3.5" />}
          >
            Link Child
          </AdminButton>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      {/* 1. Page Header */}
      <PageHeader
        title="Parents & Guardians Directory"
        subtitle="Manage parental contacts, relationship links, emergency contact records, and multi-child sibling associations."
        breadcrumbs={[
          { label: 'Admin', href: '/admin' },
          { label: 'Parents' },
        ]}
      />

      {/* 2. KPI Metrics Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <AdminCard className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Guardians</span>
            <div className="w-10 h-10 rounded-2xl bg-blue-50 text-[#0B72E7] flex items-center justify-center font-bold">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2">{metrics.total}</div>
          <p className="text-xs font-medium text-slate-400 mt-1">Registered parent accounts</p>
        </AdminCard>

        <AdminCard className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Fathers Registered</span>
            <div className="w-10 h-10 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center font-bold">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-sky-600 mt-2">{metrics.fathers}</div>
          <p className="text-xs font-medium text-slate-400 mt-1">Primary paternal guardians</p>
        </AdminCard>

        <AdminCard className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Mothers Registered</span>
            <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
              <Heart className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-purple-600 mt-2">{metrics.mothers}</div>
          <p className="text-xs font-medium text-slate-400 mt-1">Primary maternal guardians</p>
        </AdminCard>

        <AdminCard className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Linked Students</span>
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <GraduationCap className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-emerald-600 mt-2">{metrics.linkedKids}</div>
          <p className="text-xs font-medium text-slate-400 mt-1">Active sibling links established</p>
        </AdminCard>
      </div>

      {/* 3. Search & Filter Bar */}
      <AdminCard className="p-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="w-full sm:w-80">
            <AdminSearchInput
              value={searchTerm}
              onChange={setSearchTerm}
              placeholder="Search parent name, student, phone..."
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Relationship:</span>
            <select
              value={relationshipFilter}
              onChange={(e) => setRelationshipFilter(e.target.value)}
              className="px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-700 focus:border-[#0B72E7] focus:outline-none transition-all shadow-xs"
            >
              <option value="ALL">All Relationships</option>
              <option value="FATHER">Father</option>
              <option value="MOTHER">Mother</option>
              <option value="GUARDIAN">Guardian</option>
            </select>
          </div>
        </div>
      </AdminCard>

      {/* 4. Data Table */}
      <DataTable
        columns={columns}
        data={filteredParents as unknown as Record<string, unknown>[]}
        keyField="id"
        emptyMessage="No parent records found matching your query."
        pagination={{
          page: 1,
          pageSize: 20,
          total: filteredParents.length,
        }}
      />

      {/* 5. LINK STUDENT MODAL */}
      <AdminModal
        isOpen={Boolean(selectedParent)}
        onClose={() => setSelectedParent(null)}
        title="Link Student to Parent Profile"
        description={selectedParent ? `Associating student with ${selectedParent.name} (${selectedParent.relationship})` : ''}
        maxWidth="md"
        footer={
          <div className="flex justify-end gap-2.5 w-full">
            <AdminButton
              variant="secondary"
              onClick={() => setSelectedParent(null)}
            >
              Cancel
            </AdminButton>
            <AdminButton
              variant="primary"
              disabled={!linkStudentId || isPending}
              isLoading={isPending}
              onClick={handleLinkStudent}
            >
              Confirm Link
            </AdminButton>
          </div>
        }
      >
        <div className="space-y-4">
          {modalFeedback && (
            <div
              className={`p-3.5 rounded-xl text-xs font-semibold flex items-center gap-2.5 ${
                modalFeedback.success
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : 'bg-red-50 text-red-700 border border-red-200'
              }`}
            >
              {modalFeedback.success ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              )}
              <span>{modalFeedback.message}</span>
            </div>
          )}

          <FormField label="Select Enrolled Student" name="studentSelect" required helpText="Choose the child to associate with this parent profile">
            <SearchableSelect
              options={studentSelectOptions}
              value={linkStudentId}
              onChange={setLinkStudentId}
              placeholder="Search and choose student..."
            />
          </FormField>

          <div className="flex items-center gap-2.5 pt-2">
            <input
              id="primaryContact"
              type="checkbox"
              checked={isPrimaryContact}
              onChange={(e) => setIsPrimaryContact(e.target.checked)}
              className="rounded-md border-slate-300 text-[#0B72E7] focus:ring-[#0B72E7] w-4 h-4"
            />
            <label htmlFor="primaryContact" className="text-xs font-semibold text-slate-700 cursor-pointer">
              Designate as primary emergency & billing contact
            </label>
          </div>
        </div>
      </AdminModal>
    </div>
  );
}
