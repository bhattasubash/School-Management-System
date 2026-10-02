'use client';

import React, { useState, useMemo } from 'react';
import {
  UserPlus,
  Search,
  CheckCircle2,
  Clock,
  Calendar,
  AlertCircle,
  FileCheck2,
  X,
  Phone,
  Mail,
  GraduationCap,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  User,
  Users,
  Award,
  Sparkles,
  Eye,
  FileText,
} from 'lucide-react';
import PageHeader from '@/components/ui/PageHeader';
import AdminCard from './ui/AdminCard';
import AdminButton from './ui/AdminButton';
import AdminSearchInput from './ui/AdminSearchInput';
import { AdminTabs } from './ui/AdminTabs';
import AdminDrawer from './ui/AdminDrawer';
import AdminModal from './ui/AdminModal';
import { updateAdmissionStatusAction, enrollStudentAction } from '@/actions/admin/admissions';

export interface AdmissionApplicationItem {
  id: string;
  applicationNumber: string;
  studentFirstName: string;
  studentLastName: string;
  studentName: string;
  dateOfBirth: string;
  gender: string;
  bloodGroup?: string | null;
  aadhaarNumber?: string | null;
  parentName: string;
  parentPhone: string;
  parentEmail?: string | null;
  relationship: string;
  address: string;
  previousSchool?: string | null;
  previousMarks?: number | null;
  applicationFee: number;
  isFeePaid: boolean;
  status:
    | 'DRAFT'
    | 'SUBMITTED'
    | 'DOCUMENT_VERIFIED'
    | 'INTERVIEW_SCHEDULED'
    | 'APPROVED'
    | 'ENROLLED'
    | 'REJECTED';
  interviewDate?: string | null;
  adminRemarks?: string | null;
  createdAt: string;
  classGradeName: string;
  classGradeId: string;
  enrolledStudentId?: string | null;
}

export interface SectionItem {
  id: string;
  name: string;
  classGradeId: string;
  classGradeName: string;
}

export interface FeeStructureItem {
  id: string;
  amount: number;
  categoryName: string;
  classGradeId: string;
}

export interface FeeTermItem {
  id: string;
  name: string;
  termNumber: number;
}

interface AdmissionsIntakeClientProps {
  applications: AdmissionApplicationItem[];
  sections: SectionItem[];
  feeStructures: FeeStructureItem[];
  feeTerms: FeeTermItem[];
  suggestedNextAdmNumber: string;
}

export default function AdmissionsIntakeClient({
  applications: initialApplications,
  sections,
  feeStructures,
  feeTerms,
  suggestedNextAdmNumber,
}: AdmissionsIntakeClientProps) {
  const [applications, setApplications] = useState<AdmissionApplicationItem[]>(initialApplications);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedApp, setSelectedApp] = useState<AdmissionApplicationItem | null>(null);

  // Status update transition
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Enrollment Modal state
  const [enrollTargetApp, setEnrollTargetApp] = useState<AdmissionApplicationItem | null>(null);
  const [enrollSectionId, setEnrollSectionId] = useState('');
  const [enrollAdmNumber, setEnrollAdmNumber] = useState('');
  const [enrollRollNumber, setEnrollRollNumber] = useState('');
  const [includeFeeInvoice, setIncludeFeeInvoice] = useState(true);
  const [enrollFeeStructureId, setEnrollFeeStructureId] = useState(feeStructures[0]?.id || '');
  const [enrollFeeTermId, setEnrollFeeTermId] = useState(feeTerms[0]?.id || '');
  const [isEnrolling, setIsEnrolling] = useState(false);
  const [enrollError, setEnrollError] = useState<string | null>(null);
  const [enrollSuccessResult, setEnrollSuccessResult] = useState<{
    admissionNumber: string;
    studentName: string;
    parentName: string;
  } | null>(null);

  // Pipeline metrics
  const totalApps = applications.length;
  const underReviewCount = applications.filter(
    (a) => a.status === 'SUBMITTED' || a.status === 'DOCUMENT_VERIFIED' || a.status === 'INTERVIEW_SCHEDULED'
  ).length;
  const approvedCount = applications.filter((a) => a.status === 'APPROVED').length;
  const enrolledCount = applications.filter((a) => a.status === 'ENROLLED').length;
  const rejectedCount = applications.filter((a) => a.status === 'REJECTED').length;

  // Filtered applications
  const filteredApps = useMemo(() => {
    return applications.filter((app) => {
      const matchFilter = statusFilter === 'ALL' || app.status === statusFilter;
      const matchSearch =
        searchTerm === '' ||
        app.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.applicationNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.parentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.classGradeName.toLowerCase().includes(searchTerm.toLowerCase());

      return matchFilter && matchSearch;
    });
  }, [applications, statusFilter, searchTerm]);

  // Available sections for the target enrollment class
  const availableSections = useMemo(() => {
    if (!enrollTargetApp) return [];
    return sections.filter((s) => s.classGradeId === enrollTargetApp.classGradeId);
  }, [sections, enrollTargetApp]);

  // Handler: Update pipeline status
  const handleUpdateStatus = async (
    newStatus: AdmissionApplicationItem['status'],
    remarks?: string
  ) => {
    if (!selectedApp) return;
    setIsUpdatingStatus(true);
    setStatusMessage(null);

    const res = await updateAdmissionStatusAction(selectedApp.id, {
      status: newStatus,
      adminRemarks: remarks,
    });
    setIsUpdatingStatus(false);

    if (res.success) {
      setApplications((prev) =>
        prev.map((a) => (a.id === selectedApp.id ? { ...a, status: newStatus } : a))
      );
      setSelectedApp((prev) => (prev ? { ...prev, status: newStatus } : null));
      setStatusMessage({
        type: 'success',
        text: `Application status updated to ${newStatus.replace('_', ' ')}`,
      });
      setTimeout(() => setStatusMessage(null), 3000);
    } else {
      setStatusMessage({
        type: 'error',
        text: res.error || 'Failed to update status',
      });
    }
  };

  // Handler: Open Enrollment Modal
  const openEnrollModal = (app: AdmissionApplicationItem) => {
    setEnrollTargetApp(app);
    const secs = sections.filter((s) => s.classGradeId === app.classGradeId);
    if (secs.length > 0) setEnrollSectionId(secs[0].id);
    setEnrollAdmNumber(suggestedNextAdmNumber);
    setEnrollRollNumber('');
    setEnrollError(null);
    setEnrollSuccessResult(null);
  };

  // Handler: Submit Enrollment
  const handleExecuteEnrollment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!enrollTargetApp) return;
    if (!enrollSectionId) {
      setEnrollError('Please select a section for class assignment.');
      return;
    }
    if (!enrollAdmNumber.trim()) {
      setEnrollError('Admission Number is required.');
      return;
    }

    setIsEnrolling(true);
    setEnrollError(null);

    const res = await enrollStudentAction(enrollTargetApp.id, {
      sectionId: enrollSectionId,
      admissionNumber: enrollAdmNumber.trim(),
      rollNumber: enrollRollNumber ? parseInt(enrollRollNumber, 10) : undefined,
      feeStructureId: includeFeeInvoice ? enrollFeeStructureId : undefined,
      feeTermId: includeFeeInvoice ? enrollFeeTermId : undefined,
    });

    setIsEnrolling(false);

    if (res.success) {
      setEnrollSuccessResult({
        admissionNumber: res.admissionNumber || enrollAdmNumber,
        studentName: res.studentName || enrollTargetApp.studentName,
        parentName: res.parentName || enrollTargetApp.parentName,
      });

      // Update state
      setApplications((prev) =>
        prev.map((a) => (a.id === enrollTargetApp.id ? { ...a, status: 'ENROLLED' } : a))
      );
      if (selectedApp && selectedApp.id === enrollTargetApp.id) {
        setSelectedApp((prev) => (prev ? { ...prev, status: 'ENROLLED' } : null));
      }
    } else {
      setEnrollError(res.error || 'Failed to enroll student.');
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Header with Breadcrumbs & Intake Pill */}
      <PageHeader
        title="Admissions & Enrollment Pipeline"
        subtitle="Review prospective candidate applications, verify certificates, and execute official student enrollment."
        breadcrumbs={[
          { label: 'Admin', href: '/admin' },
          { label: 'Admissions' },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-blue-50 text-[#0B72E7] border border-blue-200/60 shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-[#0B72E7] animate-pulse"></span>
              AY 2026-27 Intake
            </span>
          </div>
        }
      />

      {/* 2. Pipeline Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <AdminCard className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Applications</span>
            <div className="w-10 h-10 rounded-2xl bg-blue-50 text-[#0B72E7] flex items-center justify-center font-bold">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2">{totalApps}</div>
          <p className="text-xs font-medium text-slate-400 mt-1">Received via admission portal</p>
        </AdminCard>

        <AdminCard className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Under Review</span>
            <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-amber-600 mt-2">{underReviewCount}</div>
          <p className="text-xs font-medium text-slate-400 mt-1">Verification & interviews</p>
        </AdminCard>

        <AdminCard className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Approved Candidates</span>
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <FileCheck2 className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-emerald-600 mt-2">{approvedCount}</div>
          <p className="text-xs font-medium text-slate-400 mt-1">Ready for section assignment</p>
        </AdminCard>

        <AdminCard className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Enrolled Students</span>
            <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
              <GraduationCap className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-purple-600 mt-2">{enrolledCount}</div>
          <p className="text-xs font-medium text-slate-400 mt-1">Credentials & records created</p>
        </AdminCard>
      </div>

      {/* 3. Pipeline Tabs */}
      <AdminTabs
        tabs={[
          { id: 'ALL', label: 'All Applications', count: totalApps },
          { id: 'SUBMITTED', label: 'Submitted', count: applications.filter((a) => a.status === 'SUBMITTED').length },
          { id: 'DOCUMENT_VERIFIED', label: 'Verified', count: applications.filter((a) => a.status === 'DOCUMENT_VERIFIED').length },
          { id: 'APPROVED', label: 'Approved', count: approvedCount },
          { id: 'ENROLLED', label: 'Enrolled', count: enrolledCount },
          { id: 'REJECTED', label: 'Rejected', count: rejectedCount },
        ]}
        activeTab={statusFilter}
        onChange={(tabId) => setStatusFilter(tabId)}
      />

      {/* 4. Search Bar */}
      <AdminCard className="p-4">
        <div className="w-full sm:w-80">
          <AdminSearchInput
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="Search candidate name, app #, parent..."
          />
        </div>
      </AdminCard>

      {/* 5. Applications Table */}
      <AdminCard className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F8FAFC] text-slate-400 font-bold uppercase tracking-wider text-[11px] border-b border-slate-100">
              <tr>
                <th className="py-3.5 px-5">Application #</th>
                <th className="py-3.5 px-4">Candidate Name</th>
                <th className="py-3.5 px-4">Target Class</th>
                <th className="py-3.5 px-4">Parent / Guardian</th>
                <th className="py-3.5 px-4">Previous School</th>
                <th className="py-3.5 px-4 text-center">App Fee</th>
                <th className="py-3.5 px-4 text-center">Pipeline Status</th>
                <th className="py-3.5 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredApps.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    No applications match the current filter.
                  </td>
                </tr>
              ) : (
                filteredApps.map((app) => (
                  <tr key={app.id} className="hover:bg-blue-50/30 transition-colors group">
                    <td className="py-3.5 px-5 font-mono font-bold text-slate-800">
                      {app.applicationNumber}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900 group-hover:text-[#0B72E7] transition-colors">
                        {app.studentName}
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        {app.gender} • {new Date(app.dateOfBirth).toLocaleDateString('en-IN')}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-700">{app.classGradeName}</td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-800">{app.parentName}</div>
                      <div className="text-[11px] text-slate-400">{app.parentPhone}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="text-slate-700">{app.previousSchool || 'Fresher'}</div>
                      {app.previousMarks && (
                        <div className="text-[11px] text-emerald-600 font-semibold">
                          Score: {app.previousMarks}%
                        </div>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        ₹{app.applicationFee} Paid
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                          app.status === 'ENROLLED'
                            ? 'bg-purple-50 text-purple-700 border-purple-200'
                            : app.status === 'APPROVED'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : app.status === 'DOCUMENT_VERIFIED'
                            ? 'bg-blue-50 text-blue-700 border-blue-200'
                            : app.status === 'REJECTED'
                            ? 'bg-rose-50 text-rose-700 border-rose-200'
                            : 'bg-amber-50 text-amber-700 border-amber-200'
                        }`}
                      >
                        {app.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-3.5 px-5 text-right space-x-2 whitespace-nowrap">
                      <AdminButton
                        variant="secondary"
                        size="sm"
                        onClick={() => setSelectedApp(app)}
                        icon={<Eye className="w-3.5 h-3.5" />}
                      >
                        Review
                      </AdminButton>

                      {app.status === 'APPROVED' && (
                        <AdminButton
                          variant="primary"
                          size="sm"
                          onClick={() => openEnrollModal(app)}
                          icon={<UserPlus className="w-3.5 h-3.5" />}
                        >
                          Enroll
                        </AdminButton>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </AdminCard>

      {/* 6. DRAWER: Candidate Dossier & Verification */}
      <AdminDrawer
        isOpen={Boolean(selectedApp)}
        onClose={() => setSelectedApp(null)}
        title={selectedApp ? selectedApp.studentName : 'Application Dossier'}
        subtitle={selectedApp ? `${selectedApp.applicationNumber} · Applying for ${selectedApp.classGradeName}` : ''}
      >
        {selectedApp && (
          <div className="space-y-6">
            {statusMessage && (
              <div
                className={`p-3.5 rounded-xl flex items-center gap-2.5 text-xs font-semibold ${
                  statusMessage.type === 'success'
                    ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                    : 'bg-rose-50 border border-rose-200 text-rose-800'
                }`}
              >
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                <span>{statusMessage.text}</span>
              </div>
            )}

            {/* Candidate Header Chip */}
            <div className="flex items-center gap-4 p-4 rounded-2xl bg-[#F0F7FF] border border-[#BFDBFE]/60">
              <div className="w-14 h-14 rounded-2xl bg-[#0B72E7] text-white flex items-center justify-center font-black text-xl shadow-xs">
                {selectedApp.studentName.charAt(0)}
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-base">{selectedApp.studentName}</h4>
                <p className="text-xs font-semibold text-[#0B72E7]">{selectedApp.classGradeName}</p>
                <p className="text-xs text-slate-500 mt-0.5">Applied on {new Date(selectedApp.createdAt).toLocaleDateString('en-IN')}</p>
              </div>
            </div>

            {/* Candidate Info */}
            <div className="space-y-3">
              <h5 className="text-xs font-bold uppercase tracking-wider text-slate-400">Candidate Information</h5>
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-slate-400 block font-medium">Date of Birth:</span>
                  <span className="font-bold text-slate-800">
                    {new Date(selectedApp.dateOfBirth).toLocaleDateString('en-IN', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Gender:</span>
                  <span className="font-bold text-slate-800">{selectedApp.gender}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Blood Group:</span>
                  <span className="font-bold text-slate-800">{selectedApp.bloodGroup || 'Not specified'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Previous School:</span>
                  <span className="font-bold text-slate-800">{selectedApp.previousSchool || 'Fresher'}</span>
                </div>
                {selectedApp.previousMarks && (
                  <div className="col-span-2">
                    <span className="text-slate-400 block font-medium">Previous Academic Score:</span>
                    <span className="font-bold text-emerald-600">{selectedApp.previousMarks}%</span>
                  </div>
                )}
              </div>
            </div>

            {/* Parent & Contact Details */}
            <div className="space-y-3">
              <h5 className="text-xs font-bold uppercase tracking-wider text-slate-400">Parent / Guardian Information</h5>
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400 font-medium">Name:</span>
                  <span className="font-bold text-slate-800">
                    {selectedApp.parentName} ({selectedApp.relationship})
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 font-medium">Phone:</span>
                  <span className="font-semibold text-slate-800">{selectedApp.parentPhone}</span>
                </div>
                {selectedApp.parentEmail && (
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-medium">Email:</span>
                    <span className="font-semibold text-slate-800">{selectedApp.parentEmail}</span>
                  </div>
                )}
                <div className="pt-2 border-t border-slate-200/60">
                  <span className="text-slate-400 block mb-0.5 font-medium">Address:</span>
                  <span className="text-slate-700">{selectedApp.address}</span>
                </div>
              </div>
            </div>

            {/* Application Fee */}
            <div className="space-y-3">
              <h5 className="text-xs font-bold uppercase tracking-wider text-slate-400">Application Fee</h5>
              <div className="bg-emerald-50/60 border border-emerald-200/60 p-4 rounded-xl flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-emerald-900 block">Registration Fee Paid</span>
                  <span className="text-emerald-700">Evaluation and prospectus charge</span>
                </div>
                <span className="text-base font-black text-emerald-700">₹{selectedApp.applicationFee}</span>
              </div>
            </div>

            {/* Pipeline Action Controls */}
            <div className="space-y-3 pt-4 border-t border-slate-100">
              <h5 className="text-xs font-bold uppercase tracking-wider text-slate-400">Pipeline Actions</h5>
              <div className="flex flex-col gap-2">
                {selectedApp.status === 'SUBMITTED' && (
                  <AdminButton
                    variant="soft-blue"
                    onClick={() => handleUpdateStatus('DOCUMENT_VERIFIED')}
                    disabled={isUpdatingStatus}
                    className="w-full py-2.5"
                  >
                    ✓ Mark Documents Verified
                  </AdminButton>
                )}

                {selectedApp.status === 'DOCUMENT_VERIFIED' && (
                  <AdminButton
                    variant="primary"
                    onClick={() => handleUpdateStatus('APPROVED')}
                    disabled={isUpdatingStatus}
                    className="w-full py-2.5"
                  >
                    ✓ Approve for Enrollment
                  </AdminButton>
                )}

                {selectedApp.status === 'APPROVED' && (
                  <AdminButton
                    variant="primary"
                    onClick={() => openEnrollModal(selectedApp)}
                    icon={<UserPlus className="w-4 h-4" />}
                    className="w-full py-3"
                  >
                    1-Click Official Student Enrollment
                  </AdminButton>
                )}

                {selectedApp.status !== 'REJECTED' && selectedApp.status !== 'ENROLLED' && (
                  <AdminButton
                    variant="destructive"
                    onClick={() => handleUpdateStatus('REJECTED', 'Eligibility criteria not met.')}
                    disabled={isUpdatingStatus}
                    className="w-full py-2.5"
                  >
                    ✕ Reject Application
                  </AdminButton>
                )}
              </div>
            </div>
          </div>
        )}
      </AdminDrawer>

      {/* 7. MODAL: 1-Click Enrollment Modal */}
      <AdminModal
        isOpen={Boolean(enrollTargetApp)}
        onClose={() => setEnrollTargetApp(null)}
        title="1-Click Student Enrollment"
        description={enrollTargetApp ? `Officially admit ${enrollTargetApp.studentName} into ${enrollTargetApp.classGradeName}` : ''}
        maxWidth="lg"
      >
        {enrollSuccessResult ? (
          <div className="space-y-4">
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-emerald-500 text-white flex items-center justify-center mx-auto shadow-md">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-bold text-emerald-950">Student Successfully Enrolled!</h4>
              <p className="text-xs text-emerald-800">
                Active Student & Parent user profiles and initial invoice generated.
              </p>

              <div className="bg-white rounded-xl p-4 border border-emerald-200 text-left space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Student Name:</span>
                  <span className="font-bold text-slate-900">{enrollSuccessResult.studentName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Admission Number:</span>
                  <span className="font-mono font-bold text-emerald-700">
                    {enrollSuccessResult.admissionNumber}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Linked Parent:</span>
                  <span className="font-semibold text-slate-900">{enrollSuccessResult.parentName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Student Portal Login:</span>
                  <span className="font-mono text-slate-700">
                    std.{enrollSuccessResult.admissionNumber.toLowerCase()}@school.internal
                  </span>
                </div>
              </div>
            </div>

            <AdminButton
              variant="primary"
              onClick={() => {
                setEnrollTargetApp(null);
                setEnrollSuccessResult(null);
              }}
              className="w-full py-2.5"
            >
              Done
            </AdminButton>
          </div>
        ) : (
          <form onSubmit={handleExecuteEnrollment} className="space-y-4 text-xs">
            {enrollError && (
              <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 flex items-center gap-2 font-medium">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{enrollError}</span>
              </div>
            )}

            <div>
              <label className="font-bold text-slate-700 block mb-1">Target Section</label>
              <select
                value={enrollSectionId}
                onChange={(e) => setEnrollSectionId(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-900 font-semibold focus:border-[#0B72E7] focus:outline-none"
                required
              >
                {availableSections.map((sec) => (
                  <option key={sec.id} value={sec.id}>
                    {enrollTargetApp?.classGradeName} - Section {sec.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Admission Number</label>
                <input
                  type="text"
                  value={enrollAdmNumber}
                  onChange={(e) => setEnrollAdmNumber(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl font-mono font-bold text-slate-900 focus:border-[#0B72E7] focus:outline-none"
                  required
                />
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-1">Roll Number (Optional)</label>
                <input
                  type="number"
                  placeholder="e.g. 15"
                  value={enrollRollNumber}
                  onChange={(e) => setEnrollRollNumber(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-900 font-semibold focus:border-[#0B72E7] focus:outline-none"
                />
              </div>
            </div>

            {/* Initial Fee Invoice Checkbox */}
            <div className="pt-2 border-t border-slate-100 space-y-3">
              <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-800">
                <input
                  type="checkbox"
                  checked={includeFeeInvoice}
                  onChange={(e) => setIncludeFeeInvoice(e.target.checked)}
                  className="rounded border-slate-300 text-[#0B72E7] focus:ring-[#0B72E7] w-4 h-4"
                />
                Generate Initial Admission Fee Invoice
              </label>

              {includeFeeInvoice && (
                <div className="grid grid-cols-2 gap-3 pl-6">
                  <div>
                    <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider block mb-1">Fee Structure</span>
                    <select
                      value={enrollFeeStructureId}
                      onChange={(e) => setEnrollFeeStructureId(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-900 font-semibold text-xs"
                    >
                      {feeStructures.map((fs) => (
                        <option key={fs.id} value={fs.id}>
                          {fs.categoryName} (₹{fs.amount})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider block mb-1">Billing Term</span>
                    <select
                      value={enrollFeeTermId}
                      onChange={(e) => setEnrollFeeTermId(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-900 font-semibold text-xs"
                    >
                      {feeTerms.map((ft) => (
                        <option key={ft.id} value={ft.id}>
                          {ft.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}
            </div>

            <div className="bg-blue-50/60 p-3.5 rounded-xl border border-blue-100 text-[11px] text-slate-600 space-y-1">
              <p className="font-bold text-[#0B72E7]">Automated Actions on Enrollment:</p>
              <p>• Student & Parent portal users created with hashed default credentials.</p>
              <p>• Application status updated to ENROLLED in school database.</p>
            </div>

            <AdminButton
              type="submit"
              variant="primary"
              disabled={isEnrolling}
              isLoading={isEnrolling}
              icon={<UserPlus className="w-4 h-4" />}
              className="w-full py-3"
            >
              Confirm 1-Click Enrollment
            </AdminButton>
          </form>
        )}
      </AdminModal>
    </div>
  );
}
