'use client';

import React, { useState } from 'react';
import {
  Users,
  GraduationCap,
  CreditCard,
  CalendarCheck,
  Plus,
  Trash2,
  Search,
  AlertTriangle,
  FileText,
} from 'lucide-react';

import {
  DataCard,
  PageHeader,
  EmptyState,
  StatusBadge,
  ConfirmDialog,
  MetricTile,
  DonutRing,
  ProgressPill,
  FormField,
  SearchableSelect,
  DatePicker,
  FileUpload,
  DataTable,
} from '@/components/ui';
import type { Column } from '@/components/ui';

// ─── Sample Data ────────────────────────────────────────────

const sampleStudents: Record<string, unknown>[] = [
  { id: '1', name: 'Aarav Sharma', class: 'Class 10-A', rollNo: 1, status: 'ACTIVE', attendance: '92%' },
  { id: '2', name: 'Priya Patel', class: 'Class 10-A', rollNo: 2, status: 'ACTIVE', attendance: '88%' },
  { id: '3', name: 'Rohan Singh', class: 'Class 10-B', rollNo: 3, status: 'INACTIVE', attendance: '45%' },
  { id: '4', name: 'Ananya Gupta', class: 'Class 9-A', rollNo: 4, status: 'ACTIVE', attendance: '96%' },
  { id: '5', name: 'Vikram Joshi', class: 'Class 9-B', rollNo: 5, status: 'PENDING', attendance: '73%' },
];

const studentColumns: Column<Record<string, unknown>>[] = [
  { key: 'rollNo', label: 'Roll #', sortable: true },
  { key: 'name', label: 'Student Name', sortable: true },
  { key: 'class', label: 'Class', sortable: true },
  {
    key: 'status',
    label: 'Status',
    render: (value) => <StatusBadge status={String(value)} />,
  },
  { key: 'attendance', label: 'Attendance', sortable: true },
];

const selectOptions = [
  { value: 'class-1', label: 'Class 1' },
  { value: 'class-2', label: 'Class 2' },
  { value: 'class-3', label: 'Class 3' },
  { value: 'class-4', label: 'Class 4' },
  { value: 'class-5', label: 'Class 5' },
  { value: 'class-6', label: 'Class 6' },
  { value: 'class-7', label: 'Class 7' },
  { value: 'class-8', label: 'Class 8' },
  { value: 'class-9', label: 'Class 9' },
  { value: 'class-10', label: 'Class 10' },
  { value: 'class-11', label: 'Class 11' },
  { value: 'class-12', label: 'Class 12' },
];

// ─── Page Component ─────────────────────────────────────────

export default function ComponentsPreviewPage() {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [uploadedFile, setUploadedFile] = useState<string | undefined>(undefined);

  return (
    <div className="min-h-screen bg-brand-subtle p-4 sm:p-8">
      <div className="max-w-6xl mx-auto space-y-12">
        {/* ─── Page Header ────────────────────────── */}
        <PageHeader
          title="Component Library Preview"
          subtitle="All reusable UI components for the School Management System"
          breadcrumbs={[
            { label: 'Dev', href: '/dev' },
            { label: 'Components' },
          ]}
          actions={
            <button className="px-4 py-2 bg-brand-primary text-white rounded-lg text-body-primary font-medium hover:bg-brand-hover transition-colors inline-flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Sample Action
            </button>
          }
        />

        {/* ─── Section: Metric Tiles ─────────────── */}
        <section>
          <h2 className="text-section-header text-brand-dark mb-4">Metric Tiles</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricTile title="Total Students" value="1,248" icon={Users} variant="primary" trend={{ value: 12, isPositive: true }} />
            <MetricTile title="Total Teachers" value="87" icon={GraduationCap} variant="blue" />
            <MetricTile title="Fee Collected" value="₹24.5L" icon={CreditCard} variant="green" trend={{ value: 8, isPositive: true }} />
            <MetricTile title="Attendance" value="92%" icon={CalendarCheck} variant="purple" trend={{ value: 3, isPositive: false }} />
          </div>
        </section>

        {/* ─── Section: Data Cards ────────────────── */}
        <section>
          <h2 className="text-section-header text-brand-dark mb-4">Data Cards</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <DataCard>
              <h3 className="text-body-primary font-semibold text-brand-dark">Default Card</h3>
              <p className="text-caption text-brand-muted mt-1">With hover elevation effect</p>
            </DataCard>
            <DataCard hover={false} padding="lg">
              <h3 className="text-body-primary font-semibold text-brand-dark">No Hover Card</h3>
              <p className="text-caption text-brand-muted mt-1">Large padding, no hover effect</p>
            </DataCard>
            <DataCard padding="sm">
              <h3 className="text-body-primary font-semibold text-brand-dark">Small Padding</h3>
              <p className="text-caption text-brand-muted mt-1">Compact card variant</p>
            </DataCard>
          </div>
        </section>

        {/* ─── Section: Donut Ring & Progress ─────── */}
        <section>
          <h2 className="text-section-header text-brand-dark mb-4">Donut Ring & Progress Pills</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <DataCard>
              <h3 className="text-body-primary font-semibold text-brand-dark mb-4">Attendance Overview</h3>
              <div className="flex items-center justify-center gap-8 flex-wrap">
                <DonutRing percentage={92} label="Overall" />
                <DonutRing percentage={68} label="Below Threshold" size={100} strokeWidth={8} />
                <DonutRing percentage={100} label="Perfect" size={80} strokeWidth={6} color="#4338CA" />
              </div>
            </DataCard>
            <DataCard>
              <h3 className="text-body-primary font-semibold text-brand-dark mb-4">Subject-wise Attendance</h3>
              <div className="space-y-3">
                <ProgressPill label="Mathematics" percentage={95} />
                <ProgressPill label="English" percentage={88} />
                <ProgressPill label="Science" percentage={72} />
                <ProgressPill label="Hindi" percentage={45} />
                <ProgressPill label="Social Studies" percentage={82} size="md" />
              </div>
            </DataCard>
          </div>
        </section>

        {/* ─── Section: Status Badges ────────────── */}
        <section>
          <h2 className="text-section-header text-brand-dark mb-4">Status Badges</h2>
          <DataCard>
            <div className="flex flex-wrap gap-2">
              {['ACTIVE', 'INACTIVE', 'PRESENT', 'ABSENT', 'LATE', 'HALF_DAY', 'EXCUSED',
                'PAID', 'PARTIAL', 'PENDING', 'OVERDUE', 'CANCELLED',
                'APPROVED', 'REJECTED', 'DRAFT', 'SUBMITTED', 'IN_PROGRESS',
                'ENROLLED', 'INTERVIEW_SCHEDULED', 'DOCUMENT_VERIFIED',
              ].map((status) => (
                <StatusBadge key={status} status={status} />
              ))}
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <StatusBadge status="ACTIVE" size="md" />
              <StatusBadge status="PENDING" size="md" />
              <StatusBadge status="REJECTED" size="md" />
            </div>
          </DataCard>
        </section>

        {/* ─── Section: Form Components ──────────── */}
        <section>
          <h2 className="text-section-header text-brand-dark mb-4">Form Components</h2>
          <DataCard>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <FormField label="Student Name" name="studentName" required>
                <input
                  id="studentName"
                  type="text"
                  placeholder="Enter student name"
                  className="w-full px-3 py-2.5 rounded-lg border border-brand-border text-body-primary focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 outline-none transition-all"
                />
              </FormField>

              <FormField label="Email Address" name="email" error="Invalid email format" required>
                <input
                  id="email"
                  type="email"
                  placeholder="student@school.com"
                  defaultValue="bad-email"
                  className="w-full px-3 py-2.5 rounded-lg border border-red-500 text-body-primary focus:ring-2 focus:ring-red-500/20 outline-none"
                />
              </FormField>

              <FormField label="Select Class" name="class" required helpText="Choose the class to enroll in">
                <SearchableSelect
                  options={selectOptions}
                  value={selectedClass}
                  onChange={setSelectedClass}
                  placeholder="Select a class..."
                />
              </FormField>

              <FormField label="Date of Birth" name="dob" required>
                <DatePicker
                  value={selectedDate}
                  onChange={setSelectedDate}
                  maxDate={new Date()}
                />
              </FormField>
            </div>
          </DataCard>
        </section>

        {/* ─── Section: File Upload ──────────────── */}
        <section>
          <h2 className="text-section-header text-brand-dark mb-4">File Upload</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <DataCard>
              <h3 className="text-body-primary font-semibold text-brand-dark mb-3">Upload State</h3>
              <FileUpload
                accept=".xlsx,.csv,.xls"
                maxSizeMB={10}
                onFileSelect={(file) => setUploadedFile(file.name)}
                onClear={() => setUploadedFile(undefined)}
                currentFileName={uploadedFile}
              />
            </DataCard>
            <DataCard>
              <h3 className="text-body-primary font-semibold text-brand-dark mb-3">With Error</h3>
              <FileUpload
                accept=".xlsx,.csv"
                maxSizeMB={5}
                onFileSelect={() => {}}
                error="File format not supported. Please upload .xlsx or .csv"
              />
            </DataCard>
          </div>
        </section>

        {/* ─── Section: Data Table ───────────────── */}
        <section>
          <h2 className="text-section-header text-brand-dark mb-4">Data Table</h2>
          <DataTable
            columns={studentColumns}
            data={sampleStudents}
            searchKey="name"
            searchPlaceholder="Search students..."
            pagination={{ page: 1, pageSize: 10, total: 5 }}
            actions={(row) => (
              <div className="flex items-center gap-1">
                <button className="p-1.5 rounded-lg hover:bg-brand-subtle text-brand-muted hover:text-brand-primary transition-colors">
                  <FileText className="w-4 h-4" />
                </button>
                <button className="p-1.5 rounded-lg hover:bg-red-50 text-brand-muted hover:text-red-600 transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            )}
          />
        </section>

        {/* ─── Section: Empty State ──────────────── */}
        <section>
          <h2 className="text-section-header text-brand-dark mb-4">Empty State</h2>
          <DataCard>
            <EmptyState
              icon={Search}
              title="No students found"
              description="Try adjusting your search or filter criteria to find what you're looking for."
              action={{ label: 'Add Student', onClick: () => alert('Add student clicked'), icon: Plus }}
            />
          </DataCard>
        </section>

        {/* ─── Section: Confirm Dialog ───────────── */}
        <section>
          <h2 className="text-section-header text-brand-dark mb-4">Confirm Dialog</h2>
          <DataCard>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => setConfirmOpen(true)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg text-body-primary font-medium hover:bg-red-700 transition-colors inline-flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Delete Student
              </button>
            </div>
          </DataCard>
          <ConfirmDialog
            isOpen={confirmOpen}
            onClose={() => setConfirmOpen(false)}
            onConfirm={() => { alert('Deleted!'); setConfirmOpen(false); }}
            title="Delete Student Record"
            description="This action cannot be undone. The student's data, attendance records, and fee history will be permanently removed."
            confirmLabel="Delete"
            variant="danger"
          />
        </section>

        {/* ─── Footer ────────────────────────────── */}
        <div className="text-center py-8 text-caption text-brand-muted">
          <p>School Management System — Component Library v1.0</p>
          <p className="mt-1">13 components • Built with React + TypeScript + Tailwind CSS</p>
        </div>
      </div>
    </div>
  );
}
