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
} from 'lucide-react';
import { updateAdmissionStatusAction, enrollStudentAction } from '@/actions/admin';

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

export interface AdmissionsIntakeClientProps {
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

  // Selected Application Drawer
  const [selectedApp, setSelectedApp] = useState<AdmissionApplicationItem | null>(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Enrollment Modal State
  const [enrollTargetApp, setEnrollTargetApp] = useState<AdmissionApplicationItem | null>(null);
  const [enrollSectionId, setEnrollSectionId] = useState('');
  const [enrollAdmNumber, setEnrollAdmNumber] = useState(suggestedNextAdmNumber);
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

  // Filtered Applications
  const filteredApps = useMemo(() => {
    return applications.filter((app) => {
      const matchSearch =
        searchTerm === '' ||
        app.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.applicationNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.parentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.parentPhone.includes(searchTerm);

      const matchFilter = statusFilter === 'ALL' || app.status === statusFilter;
      return matchSearch && matchFilter;
    });
  }, [applications, searchTerm, statusFilter]);

  // Metrics
  const totalApps = applications.length;
  const underReviewCount = applications.filter((a) =>
    ['SUBMITTED', 'DOCUMENT_VERIFIED', 'INTERVIEW_SCHEDULED'].includes(a.status)
  ).length;
  const approvedCount = applications.filter((a) => a.status === 'APPROVED').length;
  const enrolledCount = applications.filter((a) => a.status === 'ENROLLED').length;

  // Available sections for the target application's class
  const availableSections = useMemo(() => {
    if (!enrollTargetApp) return [];
    return sections.filter((s) => s.classGradeId === enrollTargetApp.classGradeId);
  }, [sections, enrollTargetApp]);

  // Handler: Update status
  const handleUpdateStatus = async (
    newStatus: AdmissionApplicationItem['status'],
    remarks?: string,
    interviewDate?: string
  ) => {
    if (!selectedApp) return;
    setIsUpdatingStatus(true);
    setStatusMessage(null);

    const res = await updateAdmissionStatusAction(selectedApp.id, {
      status: newStatus,
      adminRemarks: remarks || selectedApp.adminRemarks || undefined,
      interviewDate: interviewDate || selectedApp.interviewDate || undefined,
    });

    setIsUpdatingStatus(false);

    if (res.success && res.application) {
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
      {/* 1. Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></span>
              Admissions Intake Pipeline
            </span>
            <span className="text-xs text-slate-500 font-medium">AY 2026-27</span>
          </div>
          <h1 className="text-2xl font-bold text-[#111C2D] tracking-tight">Admissions & Enrollment</h1>
          <p className="text-sm text-slate-500 mt-1">
            Review online applications, verify documents, and perform 1-click official enrollment.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-slate-600">
            <span className="font-semibold text-slate-900">{approvedCount}</span> approved candidates waiting for enrollment
          </div>
        </div>
      </div>

      {/* 2. Pipeline Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Total Applications</span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-[#111C2D]">{totalApps}</div>
          <p className="text-xs text-slate-500 mt-1">Received via public admissions portal</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Under Review</span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-amber-600">{underReviewCount}</div>
          <p className="text-xs text-slate-500 mt-1">Submitted, verification & interview</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Approved for Admission</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <FileCheck2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-emerald-600">{approvedCount}</div>
          <p className="text-xs text-slate-500 mt-1">Ready for section & roll assignment</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Enrolled Students</span>
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
              <GraduationCap className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-purple-600">{enrolledCount}</div>
          <p className="text-xs text-slate-500 mt-1">Credentials & student profile generated</p>
        </div>
      </div>

      {/* 3. Main Data Container: Filter Tabs & Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        {/* Filter Bar */}
        <div className="p-4 border-b border-slate-200 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 text-xs font-medium">
            {[
              { id: 'ALL', label: 'All Applications' },
              { id: 'SUBMITTED', label: 'Submitted' },
              { id: 'DOCUMENT_VERIFIED', label: 'Verified' },
              { id: 'APPROVED', label: 'Approved' },
              { id: 'ENROLLED', label: 'Enrolled' },
              { id: 'REJECTED', label: 'Rejected' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id)}
                className={`px-3 py-1.5 rounded-xl transition-all whitespace-nowrap ${
                  statusFilter === tab.id
                    ? 'bg-[#111C2D] text-white shadow-xs font-semibold'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="relative min-w-[240px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search applicant, app #, parent..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#FF7555]/30 focus:border-[#FF7555]"
            />
          </div>
        </div>

        {/* Applications Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Application #</th>
                <th className="py-3 px-4">Candidate Name</th>
                <th className="py-3 px-4">Applying Class</th>
                <th className="py-3 px-4">Parent / Guardian</th>
                <th className="py-3 px-4">Previous School</th>
                <th className="py-3 px-4 text-center">App Fee</th>
                <th className="py-3 px-4 text-center">Pipeline Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
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
                  <tr key={app.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3 px-4 font-mono font-medium text-slate-900">
                      {app.applicationNumber}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-800">{app.studentName}</div>
                      <div className="text-[11px] text-slate-500">
                        {app.gender} • {new Date(app.dateOfBirth).toLocaleDateString('en-IN')}
                      </div>
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-800">{app.classGradeName}</td>
                    <td className="py-3 px-4">
                      <div className="font-medium text-slate-800">{app.parentName}</div>
                      <div className="text-[11px] text-slate-500">{app.parentPhone}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-slate-700">{app.previousSchool || 'Fresher'}</div>
                      {app.previousMarks && (
                        <div className="text-[11px] text-slate-500 font-medium">
                          Score: {app.previousMarks}%
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        ₹{app.applicationFee} Paid
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${
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
                    <td className="py-3 px-4 text-right space-x-1.5 whitespace-nowrap">
                      <button
                        onClick={() => setSelectedApp(app)}
                        className="px-2.5 py-1 text-xs font-medium text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                      >
                        Review
                      </button>

                      {app.status === 'APPROVED' && (
                        <button
                          onClick={() => openEnrollModal(app)}
                          className="px-3 py-1 text-xs font-semibold text-white bg-[#FF7555] hover:bg-[#ff623d] rounded-lg transition-all shadow-xs"
                        >
                          + Enroll
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. DRAWER: Application Review & Document Verification */}
      {selectedApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-end bg-slate-950/40 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="relative w-full max-w-xl h-full bg-white shadow-2xl border-l border-slate-200 flex flex-col">
            {/* Drawer Header */}
            <div className="p-6 border-b border-slate-200 bg-slate-50/50 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-mono text-xs font-bold text-slate-500">
                    {selectedApp.applicationNumber}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                      selectedApp.status === 'ENROLLED'
                        ? 'bg-purple-50 text-purple-700 border-purple-200'
                        : selectedApp.status === 'APPROVED'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-amber-50 text-amber-700 border-amber-200'
                    }`}
                  >
                    {selectedApp.status.replace('_', ' ')}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-[#111C2D]">{selectedApp.studentName}</h3>
                <p className="text-xs text-slate-500">Applying for {selectedApp.classGradeName}</p>
              </div>

              <button
                onClick={() => setSelectedApp(null)}
                className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Drawer Content */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
              {statusMessage && (
                <div
                  className={`p-3 rounded-xl flex items-center gap-2 ${
                    statusMessage.type === 'success'
                      ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                      : 'bg-rose-50 border border-rose-200 text-rose-800'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                  <span>{statusMessage.text}</span>
                </div>
              )}

              {/* Candidate Info */}
              <div className="space-y-3">
                <h4 className="font-semibold text-slate-900 uppercase tracking-wider text-[11px] flex items-center gap-2">
                  <User className="w-3.5 h-3.5 text-[#FF7555]" /> Candidate Information
                </h4>
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-slate-500 block">Date of Birth:</span>
                    <span className="font-semibold text-slate-800">
                      {new Date(selectedApp.dateOfBirth).toLocaleDateString('en-IN', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Gender:</span>
                    <span className="font-semibold text-slate-800">{selectedApp.gender}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Blood Group:</span>
                    <span className="font-semibold text-slate-800">{selectedApp.bloodGroup || 'Not specified'}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Previous School:</span>
                    <span className="font-semibold text-slate-800">{selectedApp.previousSchool || 'Fresher'}</span>
                  </div>
                  {selectedApp.previousMarks && (
                    <div>
                      <span className="text-slate-500 block">Previous Academic Score:</span>
                      <span className="font-bold text-emerald-700">{selectedApp.previousMarks}%</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Parent & Contact Details */}
              <div className="space-y-3">
                <h4 className="font-semibold text-slate-900 uppercase tracking-wider text-[11px] flex items-center gap-2">
                  <Users className="w-3.5 h-3.5 text-blue-600" /> Parent / Guardian Information
                </h4>
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Name:</span>
                    <span className="font-semibold text-slate-800">
                      {selectedApp.parentName} ({selectedApp.relationship})
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Mobile Phone:</span>
                    <span className="font-medium text-slate-800">{selectedApp.parentPhone}</span>
                  </div>
                  {selectedApp.parentEmail && (
                    <div className="flex justify-between">
                      <span className="text-slate-500">Email Address:</span>
                      <span className="font-medium text-slate-800">{selectedApp.parentEmail}</span>
                    </div>
                  )}
                  <div className="pt-1 border-t border-slate-200/60">
                    <span className="text-slate-500 block mb-0.5">Residential Address:</span>
                    <span className="text-slate-700">{selectedApp.address}</span>
                  </div>
                </div>
              </div>

              {/* Application Fee Details */}
              <div className="space-y-3">
                <h4 className="font-semibold text-slate-900 uppercase tracking-wider text-[11px] flex items-center gap-2">
                  <Award className="w-3.5 h-3.5 text-emerald-600" /> Application Fee Verification
                </h4>
                <div className="bg-emerald-50/60 border border-emerald-200 p-4 rounded-xl flex items-center justify-between">
                  <div>
                    <span className="font-semibold text-emerald-950 block">Registration Fee Paid</span>
                    <span className="text-[11px] text-emerald-700">Non-refundable prospectus & evaluation fee</span>
                  </div>
                  <span className="text-sm font-bold text-emerald-800">₹{selectedApp.applicationFee}</span>
                </div>
              </div>

              {/* Status Update Actions */}
              <div className="space-y-3 pt-4 border-t border-slate-200">
                <h4 className="font-semibold text-slate-900 uppercase tracking-wider text-[11px]">
                  Pipeline Actions
                </h4>
                <div className="grid grid-cols-2 gap-2">
                  {selectedApp.status === 'SUBMITTED' && (
                    <button
                      onClick={() => handleUpdateStatus('DOCUMENT_VERIFIED')}
                      disabled={isUpdatingStatus}
                      className="py-2.5 px-3 bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold rounded-xl border border-blue-200 transition-colors"
                    >
                      ✓ Mark Documents Verified
                    </button>
                  )}

                  {selectedApp.status === 'DOCUMENT_VERIFIED' && (
                    <button
                      onClick={() => handleUpdateStatus('APPROVED')}
                      disabled={isUpdatingStatus}
                      className="py-2.5 px-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-semibold rounded-xl border border-emerald-200 transition-colors"
                    >
                      ✓ Approve Candidate
                    </button>
                  )}

                  {selectedApp.status === 'APPROVED' && (
                    <button
                      onClick={() => openEnrollModal(selectedApp)}
                      className="col-span-2 py-3 px-4 bg-[#FF7555] hover:bg-[#ff623d] text-white font-bold rounded-xl shadow-sm flex items-center justify-center gap-2 transition-all"
                    >
                      <UserPlus className="w-4 h-4" />
                      1-Click Student Enrollment
                    </button>
                  )}

                  {selectedApp.status !== 'REJECTED' && selectedApp.status !== 'ENROLLED' && (
                    <button
                      onClick={() => handleUpdateStatus('REJECTED', 'Eligibility criteria not met.')}
                      disabled={isUpdatingStatus}
                      className="py-2.5 px-3 bg-rose-50 hover:bg-rose-100 text-rose-700 font-medium rounded-xl border border-rose-200 transition-colors"
                    >
                      ✕ Reject Application
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5. MODAL: 1-Click Enrollment Modal */}
      {enrollTargetApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#FF7555]/10 text-[#FF7555] flex items-center justify-center">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-[#111C2D]">1-Click Student Enrollment</h3>
                  <p className="text-xs text-slate-500">
                    Officially admit {enrollTargetApp.studentName} into {enrollTargetApp.classGradeName}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setEnrollTargetApp(null)}
                className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-4">
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

                  <button
                    onClick={() => {
                      setEnrollTargetApp(null);
                      setEnrollSuccessResult(null);
                    }}
                    className="w-full py-3 bg-[#111C2D] hover:bg-slate-800 text-white text-xs font-semibold rounded-xl transition-all"
                  >
                    Done
                  </button>
                </div>
              ) : (
                <form onSubmit={handleExecuteEnrollment} className="space-y-4 text-xs">
                  {enrollError && (
                    <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                      <span>{enrollError}</span>
                    </div>
                  )}

                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Target Section</label>
                    <select
                      value={enrollSectionId}
                      onChange={(e) => setEnrollSectionId(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#FF7555]/30 focus:border-[#FF7555]"
                      required
                    >
                      {availableSections.map((sec) => (
                        <option key={sec.id} value={sec.id}>
                          {enrollTargetApp.classGradeName} - Section {sec.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="font-semibold text-slate-700 block mb-1">Admission Number</label>
                      <input
                        type="text"
                        value={enrollAdmNumber}
                        onChange={(e) => setEnrollAdmNumber(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#FF7555]/30 focus:border-[#FF7555]"
                        required
                      />
                    </div>
                    <div>
                      <label className="font-semibold text-slate-700 block mb-1">Roll Number (Optional)</label>
                      <input
                        type="number"
                        placeholder="e.g. 15"
                        value={enrollRollNumber}
                        onChange={(e) => setEnrollRollNumber(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#FF7555]/30 focus:border-[#FF7555]"
                      />
                    </div>
                  </div>

                  {/* Initial Fee Invoice Checkbox */}
                  <div className="pt-2 border-t border-slate-100 space-y-3">
                    <label className="flex items-center gap-2 cursor-pointer font-semibold text-slate-800">
                      <input
                        type="checkbox"
                        checked={includeFeeInvoice}
                        onChange={(e) => setIncludeFeeInvoice(e.target.checked)}
                        className="rounded border-slate-300 text-[#FF7555] focus:ring-[#FF7555]"
                      />
                      Generate Initial Admission Fee Invoice
                    </label>

                    {includeFeeInvoice && (
                      <div className="grid grid-cols-2 gap-3 pl-5">
                        <div>
                          <span className="text-[11px] text-slate-500 block mb-1">Fee Structure</span>
                          <select
                            value={enrollFeeStructureId}
                            onChange={(e) => setEnrollFeeStructureId(e.target.value)}
                            className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900"
                          >
                            {feeStructures.map((fs) => (
                              <option key={fs.id} value={fs.id}>
                                {fs.categoryName} (₹{fs.amount})
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <span className="text-[11px] text-slate-500 block mb-1">Billing Term</span>
                          <select
                            value={enrollFeeTermId}
                            onChange={(e) => setEnrollFeeTermId(e.target.value)}
                            className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900"
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

                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-[11px] text-slate-600">
                    <p className="font-semibold text-slate-800 mb-0.5">Automated Actions on Enrollment:</p>
                    <p>• Student & Parent portal users created with hashed default passwords.</p>
                    <p>• Application status updated to ENROLLED in school database.</p>
                  </div>

                  <button
                    type="submit"
                    disabled={isEnrolling}
                    className="w-full py-3 bg-[#FF7555] hover:bg-[#ff623d] text-white font-bold rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isEnrolling ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Enrolling Student & Creating User Accounts...
                      </>
                    ) : (
                      <>
                        <UserPlus className="w-4 h-4" />
                        Confirm 1-Click Enrollment
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
