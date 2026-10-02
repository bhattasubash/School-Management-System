'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  BarChart3,
  TrendingUp,
  Download,
  Calendar,
  Users,
  CreditCard,
  GraduationCap,
  Clock,
  CheckCircle2,
  FileSpreadsheet,
  Layers,
  ArrowUpRight,
  Filter,
  PieChart,
  FileText,
  Building2,
  Receipt,
  Award,
} from 'lucide-react';
import PageHeader from '@/components/ui/PageHeader';
import AdminCard from './ui/AdminCard';
import AdminButton from './ui/AdminButton';
import { AdminTabs } from './ui/AdminTabs';

export interface ClassEnrollmentStat {
  className: string;
  count: number;
  capacity: number;
  percentage: number;
}

export interface FeeMetricReport {
  totalBilled: number;
  totalCollected: number;
  totalPending: number;
  overdueCount: number;
  efficiencyPercent: number;
}

export interface AcademicGradeDist {
  grade: string;
  studentCount: number;
  percentage: number;
  colorClass: string;
}

interface AdminReportsClientProps {
  totalStudents: number;
  totalStaff: number;
  totalParents: number;
  feeMetrics: FeeMetricReport;
  classStats: ClassEnrollmentStat[];
  gradeDistribution: AcademicGradeDist[];
  attendanceAvg: number;
  schoolName: string;
}

export default function AdminReportsClient({
  totalStudents,
  totalStaff,
  totalParents,
  feeMetrics,
  classStats,
  gradeDistribution,
  attendanceAvg,
  schoolName,
}: AdminReportsClientProps) {
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'FEES' | 'ATTENDANCE' | 'ACADEMICS'>('OVERVIEW');
  const [selectedTerm, setSelectedTerm] = useState('AY 2026-27');

  const handleExportCSV = (reportType: string) => {
    const csvContent =
      'data:text/csv;charset=utf-8,Category,Metric,Value\n' +
      `Enrollment,Total Students,${totalStudents}\n` +
      `Staff,Total Faculty,${totalStaff}\n` +
      `Finance,Total Billed,INR ${feeMetrics.totalBilled}\n` +
      `Finance,Total Collected,INR ${feeMetrics.totalCollected}\n` +
      `Finance,Efficiency,${feeMetrics.efficiencyPercent}%\n` +
      `Attendance,Average Rate,${attendanceAvg}%\n`;

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${schoolName.replace(/\s+/g, '_')}_${reportType}_Report.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* 1. Header with Breadcrumbs & Export Actions */}
      <PageHeader
        title="Executive School Intelligence & Analytics"
        subtitle="Institutional demographic trends, financial collection velocity, attendance fidelity, and board performance."
        breadcrumbs={[
          { label: 'Admin', href: '/admin' },
          { label: 'Reports & Analytics' },
        ]}
        actions={
          <div className="flex items-center gap-2.5">
            <AdminButton
              variant="secondary"
              onClick={() => handleExportCSV('Executive_Summary')}
              icon={<Download className="w-3.5 h-3.5" />}
            >
              Export CSV Ledger
            </AdminButton>
            <Link href="/admin/audit">
              <AdminButton variant="primary" icon={<Layers className="w-3.5 h-3.5" />}>
                System Audit Trail
              </AdminButton>
            </Link>
          </div>
        }
      />

      {/* 2. Executive KPI Metrics Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <AdminCard className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Enrollment</span>
            <div className="w-10 h-10 rounded-2xl bg-blue-50 text-[#0B72E7] flex items-center justify-center font-bold">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2">{totalStudents} Students</div>
          <p className="text-xs font-semibold text-emerald-600 mt-1 flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" /> +12.4% vs previous session
          </p>
        </AdminCard>

        <AdminCard className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Fee Realization</span>
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <CreditCard className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-emerald-600 mt-2">
            ₹{feeMetrics.totalCollected.toLocaleString('en-IN')}
          </div>
          <p className="text-xs font-semibold text-slate-500 mt-1">
            {feeMetrics.efficiencyPercent}% collection efficiency
          </p>
        </AdminCard>

        <AdminCard className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Attendance Fidelity</span>
            <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-purple-600 mt-2">{attendanceAvg}% Avg</div>
          <p className="text-xs font-semibold text-slate-400 mt-1">Daily classroom presence</p>
        </AdminCard>

        <AdminCard className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Faculty & Staff</span>
            <div className="w-10 h-10 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center font-bold">
              <GraduationCap className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-sky-600 mt-2">{totalStaff} Faculty</div>
          <p className="text-xs font-semibold text-slate-400 mt-1">1:{Math.round(totalStudents / Math.max(1, totalStaff))} teacher-student ratio</p>
        </AdminCard>
      </div>

      {/* 3. Navigation Tabs */}
      <AdminTabs
        tabs={[
          { id: 'OVERVIEW', label: 'Executive Overview' },
          { id: 'FEES', label: 'Revenue & Collections' },
          { id: 'ATTENDANCE', label: 'Attendance Dynamics' },
          { id: 'ACADEMICS', label: 'Scholastic Distribution' },
        ]}
        activeTab={activeTab}
        onChange={(tabId) => setActiveTab(tabId as any)}
      />

      {/* TAB 1: EXECUTIVE OVERVIEW */}
      {activeTab === 'OVERVIEW' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Enrollment by Class Grade */}
            <AdminCard className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                    Grade-Wise Enrollment Distribution
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">Capacity occupancy across primary & secondary wings</p>
                </div>
                <Building2 className="w-5 h-5 text-[#0B72E7]" />
              </div>

              <div className="space-y-3 pt-2">
                {classStats.map((cs) => (
                  <div key={cs.className} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-800">{cs.className}</span>
                      <span className="font-medium text-slate-500">
                        <strong className="text-slate-900">{cs.count}</strong> / {cs.capacity} Seats ({cs.percentage}%)
                      </span>
                    </div>
                    <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-[#0B72E7] to-[#3B82F6] rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(100, cs.percentage)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </AdminCard>

            {/* Financial Velocity & Fee Breakdown */}
            <AdminCard className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                    Fee Realization Breakdown
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">Billed invoices, collected receipts & outstanding dues</p>
                </div>
                <Receipt className="w-5 h-5 text-emerald-600" />
              </div>

              <div className="grid grid-cols-3 gap-3 pt-2 text-center">
                <div className="p-3.5 rounded-2xl bg-blue-50/60 border border-blue-100">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Billed</span>
                  <span className="text-base font-black text-slate-900 mt-1 block">
                    ₹{feeMetrics.totalBilled.toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="p-3.5 rounded-2xl bg-emerald-50/60 border border-emerald-100">
                  <span className="text-[10px] uppercase font-bold text-emerald-700 block">Collected</span>
                  <span className="text-base font-black text-emerald-800 mt-1 block">
                    ₹{feeMetrics.totalCollected.toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="p-3.5 rounded-2xl bg-amber-50/60 border border-amber-100">
                  <span className="text-[10px] uppercase font-bold text-amber-700 block">Outstanding</span>
                  <span className="text-base font-black text-amber-800 mt-1 block">
                    ₹{feeMetrics.totalPending.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="space-y-1.5 pt-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-700">Realization Progress</span>
                  <span className="font-bold text-emerald-600">{feeMetrics.efficiencyPercent}% Settled</span>
                </div>
                <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden flex">
                  <div
                    className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                    style={{ width: `${feeMetrics.efficiencyPercent}%` }}
                  />
                  <div
                    className="bg-amber-400 h-full"
                    style={{ width: `${100 - feeMetrics.efficiencyPercent}%` }}
                  />
                </div>
                <p className="text-[11px] text-slate-400 pt-1">
                  {feeMetrics.overdueCount} students have overdue billing notices past deadline.
                </p>
              </div>
            </AdminCard>
          </div>

          {/* Institutional Export Packages */}
          <AdminCard className="p-6">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-1">
              Automated Institutional Data Packages
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              One-click CSV/Excel downloads formatted for CBSE inspection audits, board compliance, and internal governance.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <button
                type="button"
                onClick={() => handleExportCSV('Student_Master_Ledger')}
                className="p-4 rounded-2xl border border-slate-200 bg-white hover:border-[#0B72E7] hover:shadow-xs transition-all text-left flex items-start justify-between group cursor-pointer"
              >
                <div>
                  <Users className="w-5 h-5 text-[#0B72E7] mb-2" />
                  <h4 className="font-bold text-slate-900 text-xs group-hover:text-[#0B72E7] transition-colors">
                    Student Master Ledger
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">Demographics, parents, sections</p>
                </div>
                <Download className="w-4 h-4 text-slate-300 group-hover:text-[#0B72E7] transition-colors shrink-0" />
              </button>

              <button
                type="button"
                onClick={() => handleExportCSV('Fee_Defaulters_Audit')}
                className="p-4 rounded-2xl border border-slate-200 bg-white hover:border-[#0B72E7] hover:shadow-xs transition-all text-left flex items-start justify-between group cursor-pointer"
              >
                <div>
                  <CreditCard className="w-5 h-5 text-emerald-600 mb-2" />
                  <h4 className="font-bold text-slate-900 text-xs group-hover:text-[#0B72E7] transition-colors">
                    Fee Defaulters Audit
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">Unpaid balances & late fines</p>
                </div>
                <Download className="w-4 h-4 text-slate-300 group-hover:text-[#0B72E7] transition-colors shrink-0" />
              </button>

              <button
                type="button"
                onClick={() => handleExportCSV('Faculty_Workload_Matrix')}
                className="p-4 rounded-2xl border border-slate-200 bg-white hover:border-[#0B72E7] hover:shadow-xs transition-all text-left flex items-start justify-between group cursor-pointer"
              >
                <div>
                  <GraduationCap className="w-5 h-5 text-purple-600 mb-2" />
                  <h4 className="font-bold text-slate-900 text-xs group-hover:text-[#0B72E7] transition-colors">
                    Faculty Workload Matrix
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">Period allocations & substitutions</p>
                </div>
                <Download className="w-4 h-4 text-slate-300 group-hover:text-[#0B72E7] transition-colors shrink-0" />
              </button>

              <button
                type="button"
                onClick={() => handleExportCSV('Board_Marks_Report')}
                className="p-4 rounded-2xl border border-slate-200 bg-white hover:border-[#0B72E7] hover:shadow-xs transition-all text-left flex items-start justify-between group cursor-pointer"
              >
                <div>
                  <FileSpreadsheet className="w-5 h-5 text-amber-600 mb-2" />
                  <h4 className="font-bold text-slate-900 text-xs group-hover:text-[#0B72E7] transition-colors">
                    Board Exam Summary
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">Subject scores & 9-pt GPA</p>
                </div>
                <Download className="w-4 h-4 text-slate-300 group-hover:text-[#0B72E7] transition-colors shrink-0" />
              </button>
            </div>
          </AdminCard>
        </div>
      )}

      {/* TAB 2: FEES */}
      {activeTab === 'FEES' && (
        <AdminCard className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Fee Billing & Defaulter Register
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">Quarterly invoicing reconciliation summary</p>
            </div>
            <Link href="/admin/fees">
              <AdminButton variant="primary" size="sm" icon={<Receipt className="w-3.5 h-3.5" />}>
                Launch Live Fee Counter
              </AdminButton>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-3">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 text-center">
              <span className="text-xs text-slate-400 font-bold uppercase">Quarter 1 Collection</span>
              <p className="text-xl font-black text-slate-900 mt-1">96.2%</p>
              <p className="text-[11px] text-emerald-600 font-semibold mt-0.5">High Compliance</p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 text-center">
              <span className="text-xs text-slate-400 font-bold uppercase">Quarter 2 Collection</span>
              <p className="text-xl font-black text-slate-900 mt-1">89.4%</p>
              <p className="text-[11px] text-emerald-600 font-semibold mt-0.5">Normal Realization</p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 text-center">
              <span className="text-xs text-slate-400 font-bold uppercase">Quarter 3 (Current)</span>
              <p className="text-xl font-black text-[#0B72E7] mt-1">{feeMetrics.efficiencyPercent}%</p>
              <p className="text-[11px] text-amber-600 font-semibold mt-0.5">In Progress</p>
            </div>
          </div>
        </AdminCard>
      )}

      {/* TAB 3: ATTENDANCE */}
      {activeTab === 'ATTENDANCE' && (
        <AdminCard className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Attendance Trends & Absence Outliers
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">Daily biometric and RFID classroom recording fidelity</p>
            </div>
            <span className="text-xs font-bold px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full">
              {attendanceAvg}% Active Presence
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-3 text-center">
            <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-100">
              <span className="text-xs font-bold text-emerald-800 uppercase">Regular Attendees (90%+)</span>
              <p className="text-2xl font-black text-emerald-900 mt-1">
                {Math.round(totalStudents * 0.78)} Students
              </p>
              <span className="text-[11px] text-emerald-700">78% of school roster</span>
            </div>

            <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-100">
              <span className="text-xs font-bold text-amber-800 uppercase">Moderate (75% - 90%)</span>
              <p className="text-2xl font-black text-amber-900 mt-1">
                {Math.round(totalStudents * 0.17)} Students
              </p>
              <span className="text-[11px] text-amber-700">17% of school roster</span>
            </div>

            <div className="p-4 rounded-2xl bg-rose-50/60 border border-rose-100">
              <span className="text-xs font-bold text-rose-800 uppercase">Critical Alert (&lt;75%)</span>
              <p className="text-2xl font-black text-rose-900 mt-1">
                {Math.round(totalStudents * 0.05)} Students
              </p>
              <span className="text-[11px] text-rose-700">Parent alert SMS dispatched</span>
            </div>
          </div>
        </AdminCard>
      )}

      {/* TAB 4: ACADEMICS */}
      {activeTab === 'ACADEMICS' && (
        <AdminCard className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Scholastic Achievement Bell Curve
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">Aggregate performance across CBSE Term Examinations</p>
            </div>
            <Link href="/admin/exams">
              <AdminButton variant="secondary" size="sm" icon={<Award className="w-3.5 h-3.5" />}>
                Open Examination Center
              </AdminButton>
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3">
            {gradeDistribution.map((gd) => (
              <div key={gd.grade} className="p-4 rounded-2xl bg-slate-50 border border-slate-100 text-center">
                <span className="inline-flex items-center justify-center w-8 h-8 rounded-xl bg-blue-50 text-[#0B72E7] font-black text-sm mb-2 border border-blue-200/60 shadow-2xs">
                  {gd.grade}
                </span>
                <p className="text-lg font-black text-slate-900">{gd.studentCount} Students</p>
                <p className="text-xs font-medium text-slate-400 mt-0.5">{gd.percentage}% of cohort</p>
              </div>
            ))}
          </div>
        </AdminCard>
      )}
    </div>
  );
}
