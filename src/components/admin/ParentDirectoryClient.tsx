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
} from 'lucide-react';
import {
  DataTable,
  DataCard,
  PageHeader,
  StatusBadge,
  SearchableSelect,
  FormField,
  type Column,
} from '@/components/ui';
import { linkParentToStudentAction, unlinkParentAction } from '@/actions/admin';

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
            <div className="w-9 h-9 rounded-full bg-brand-light text-brand-primary flex items-center justify-center font-bold text-sm">
              {item.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="font-semibold text-brand-dark">{item.name}</p>
              <div className="flex items-center gap-2 text-[11px] text-brand-muted mt-0.5">
                <span className="flex items-center gap-1">
                  <Mail className="w-3 h-3" />
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
        <span className="inline-flex items-center gap-1.5 text-caption font-medium text-brand-dark">
          <Phone className="w-3.5 h-3.5 text-brand-muted" />
          {String(val || 'N/A')}
        </span>
      ),
    },
    {
      key: 'relationship',
      label: 'Relation',
      sortable: true,
      render: (val) => <StatusBadge status={String(val || 'GUARDIAN')} size="sm" />,
    },
    {
      key: 'occupation',
      label: 'Occupation',
      render: (val) => (
        <span className="text-caption text-brand-muted inline-flex items-center gap-1">
          <Briefcase className="w-3.5 h-3.5 text-brand-muted/70" />
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
          return <span className="text-caption text-brand-muted italic">No students linked</span>;
        }
        return (
          <div className="flex flex-wrap gap-1.5">
            {item.linkedStudents.map((child) => (
              <span
                key={child.id}
                className="inline-flex items-center gap-1 text-[11px] font-medium bg-brand-subtle border border-brand-border px-2 py-0.5 rounded-md text-brand-dark"
              >
                <GraduationCap className="w-3 h-3 text-brand-primary" />
                <span>{child.name}</span>
                <span className="text-brand-muted">({child.classSection})</span>
                <button
                  type="button"
                  onClick={() => handleUnlink(item.id, child.id)}
                  title="Unlink student"
                  className="ml-1 text-brand-muted hover:text-red-600 transition-colors"
                >
                  <X className="w-2.5 h-2.5" />
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
          <button
            type="button"
            onClick={() => {
              setSelectedParent(item);
              setLinkStudentId('');
              setModalFeedback(null);
            }}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-brand-subtle hover:bg-brand-primary hover:text-white text-brand-dark text-caption font-semibold transition-all border border-brand-border"
          >
            <LinkIcon className="w-3.5 h-3.5" />
            Link Child
          </button>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Parents & Guardians Directory"
        subtitle="Manage parental contacts, relationship links, emergency contact records, and multi-child sibling associations."
        breadcrumbs={[
          { label: 'Admin', href: '/admin' },
          { label: 'Parents' },
        ]}
      />

      {/* Filter and Search Bar */}
      <DataCard padding="sm">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-brand-muted absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search parent name, student, phone..."
              className="w-full pl-9 pr-3 py-2 text-body-primary rounded-lg border border-brand-border focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 outline-none"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-caption text-brand-muted font-medium">Relationship:</span>
            <select
              value={relationshipFilter}
              onChange={(e) => setRelationshipFilter(e.target.value)}
              className="px-3 py-1.5 rounded-lg border border-brand-border bg-white text-body-primary text-brand-dark focus:border-brand-primary outline-none"
            >
              <option value="ALL">All Relationships</option>
              <option value="FATHER">Father</option>
              <option value="MOTHER">Mother</option>
              <option value="GUARDIAN">Guardian</option>
            </select>
          </div>
        </div>
      </DataCard>

      {/* Data Table */}
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

      {/* LINK STUDENT MODAL */}
      {selectedParent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 relative animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setSelectedParent(null)}
              className="absolute top-4 right-4 p-1 rounded-lg text-brand-muted hover:text-brand-dark transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-brand-light flex items-center justify-center text-brand-primary">
                <LinkIcon className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-section-header text-brand-dark">Link Student to Parent</h3>
                <p className="text-caption text-brand-muted">
                  Associating with {selectedParent.name} ({selectedParent.relationship})
                </p>
              </div>
            </div>

            {modalFeedback && (
              <div
                className={`mb-4 p-3 rounded-lg text-caption font-medium flex items-center gap-2 ${
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

            <form onSubmit={handleLinkStudent} className="space-y-4">
              <FormField label="Select Student" name="studentSelect" required helpText="Choose the child to associate with this parent profile">
                <SearchableSelect
                  options={studentSelectOptions}
                  value={linkStudentId}
                  onChange={setLinkStudentId}
                  placeholder="Search and choose student..."
                />
              </FormField>

              <div className="flex items-center gap-2 pt-1">
                <input
                  id="primaryContact"
                  type="checkbox"
                  checked={isPrimaryContact}
                  onChange={(e) => setIsPrimaryContact(e.target.checked)}
                  className="rounded border-brand-border text-brand-primary focus:ring-brand-primary w-4 h-4"
                />
                <label htmlFor="primaryContact" className="text-caption font-medium text-brand-dark cursor-pointer">
                  Designate as primary emergency & billing contact
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setSelectedParent(null)}
                  className="px-4 py-2 rounded-lg border border-brand-border text-body-primary text-brand-dark font-medium hover:bg-brand-subtle transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!linkStudentId || isPending}
                  className="px-4 py-2 rounded-lg bg-brand-primary text-white text-body-primary font-semibold hover:bg-brand-hover transition-colors flex items-center gap-2 disabled:opacity-60"
                >
                  {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                  Confirm Link
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
