'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  ClipboardList,
  Calendar,
  Award,
  CheckCircle2,
  Clock,
  Printer,
  FileText,
  Search,
  BookOpen,
  GraduationCap,
  Sparkles,
  ChevronRight,
  TrendingUp,
  Download,
  Plus,
  Eye,
  X,
  AlertCircle,
} from 'lucide-react';
import PageHeader from '@/components/ui/PageHeader';
import AdminCard from './ui/AdminCard';
import AdminButton from './ui/AdminButton';
import AdminSearchInput from './ui/AdminSearchInput';
import { AdminTabs } from './ui/AdminTabs';
import AdminModal from './ui/AdminModal';
import AdminDrawer from './ui/AdminDrawer';

export interface ExamTermItem {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  isLocked: boolean;
}

export interface ExamScheduleItem {
  id: string;
  termId: string;
  termName: string;
  classGradeId: string;
  classGradeName: string;
  subjectId: string;
  subjectName: string;
  subjectCode: string;
  examDate: string;
  timeRange: string;
  maxMarks: number;
  passingMarks: number;
  resultsCount: number;
}

export interface StudentResultPreview {
  id: string;
  studentName: string;
  admissionNumber: string;
  classSection: string;
  rollNumber: number;
  marks: {
    subject: string;
    code: string;
    max: number;
    obtained: number;
    grade: string;
  }[];
  totalMax: number;
  totalObtained: number;
  percentage: number;
  overallGrade: string;
  attendancePercent: number;
  remarks: string;
}

export interface GradeScaleItem {
  grade: string;
  minPercent: number;
  maxPercent: number;
  gradePoint: number;
  description: string;
}

interface AdminExamsClientProps {
  terms: ExamTermItem[];
  schedules: ExamScheduleItem[];
  sampleReportCards: StudentResultPreview[];
  gradeScales: GradeScaleItem[];
  schoolName: string;
}

export default function AdminExamsClient({
  terms,
  schedules: initialSchedules,
  sampleReportCards,
  gradeScales,
  schoolName = 'Sunrise Public School',
}: AdminExamsClientProps) {
  const [activeTab, setActiveTab] = useState<'SCHEDULES' | 'REPORT_CARDS' | 'GRADING'>('SCHEDULES');
  const [selectedTermId, setSelectedTermId] = useState<string>(terms[0]?.id || 'ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClassFilter, setSelectedClassFilter] = useState('ALL');

  // Report Card Drawer preview
  const [activeReportCard, setActiveReportCard] = useState<StudentResultPreview | null>(null);

  // New Schedule Modal state
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [schedules, setSchedules] = useState<ExamScheduleItem[]>(initialSchedules);

  // Filtered schedules
  const filteredSchedules = useMemo(() => {
    return schedules.filter((s) => {
      const matchTerm = selectedTermId === 'ALL' || s.termId === selectedTermId;
      const matchClass = selectedClassFilter === 'ALL' || s.classGradeName === selectedClassFilter;
      const matchSearch =
        searchTerm === '' ||
        s.subjectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.subjectCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.classGradeName.toLowerCase().includes(searchTerm.toLowerCase());

      return matchTerm && matchClass && matchSearch;
    });
  }, [schedules, selectedTermId, selectedClassFilter, searchTerm]);

  // Unique classes in schedules
  const classesList = useMemo(() => {
    return Array.from(new Set(schedules.map((s) => s.classGradeName)));
  }, [schedules]);

  // Filtered report cards
  const filteredReportCards = useMemo(() => {
    return sampleReportCards.filter((rc) => {
      const matchSearch =
        searchTerm === '' ||
        rc.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        rc.admissionNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        rc.classSection.toLowerCase().includes(searchTerm.toLowerCase());

      return matchSearch;
    });
  }, [sampleReportCards, searchTerm]);

  const totalExams = schedules.length;
  const completedAssessments = schedules.reduce((acc, s) => acc + s.resultsCount, 0);

  return (
    <div className="space-y-6">
      {/* 1. Header with Breadcrumbs & Actions */}
      <PageHeader
        title="Exams & Academic Report Cards"
        subtitle="Manage term examination date-sheets, subject marks rosters, and automated CBSE-standard student report cards."
        breadcrumbs={[
          { label: 'Admin', href: '/admin' },
          { label: 'Exams & Report Cards' },
        ]}
        actions={
          <div className="flex items-center gap-2.5">
            <AdminButton
              variant="secondary"
              onClick={() => setActiveTab('GRADING')}
              icon={<Award className="w-3.5 h-3.5" />}
            >
              Grading Scales
            </AdminButton>
            <AdminButton
              variant="primary"
              onClick={() => setIsScheduleModalOpen(true)}
              icon={<Plus className="w-3.5 h-3.5" />}
            >
              Add Exam Session
            </AdminButton>
          </div>
        }
      />

      {/* 2. KPI Metrics Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <AdminCard className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Active Terms</span>
            <div className="w-10 h-10 rounded-2xl bg-blue-50 text-[#0B72E7] flex items-center justify-center font-bold">
              <Calendar className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2">{terms.length} Terms</div>
          <p className="text-xs font-medium text-slate-400 mt-1">AY 2026-27 assessment cycles</p>
        </AdminCard>

        <AdminCard className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Scheduled Exams</span>
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <ClipboardList className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-emerald-600 mt-2">{totalExams} Papers</div>
          <p className="text-xs font-medium text-slate-400 mt-1">Across all grades & subjects</p>
        </AdminCard>

        <AdminCard className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Evaluated Results</span>
            <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
              <Award className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-purple-600 mt-2">{completedAssessments} Entered</div>
          <p className="text-xs font-medium text-slate-400 mt-1">Student marks on record</p>
        </AdminCard>

        <AdminCard className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Average Performance</span>
            <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-amber-600 mt-2">84.6% Pass</div>
          <p className="text-xs font-medium text-slate-400 mt-1">Institutional cumulative score</p>
        </AdminCard>
      </div>

      {/* 3. Navigation Tabs */}
      <AdminTabs
        tabs={[
          { id: 'SCHEDULES', label: 'Date-Sheets & Schedules', count: schedules.length },
          { id: 'REPORT_CARDS', label: 'Report Cards Generator', count: sampleReportCards.length },
          { id: 'GRADING', label: 'CBSE Grading Scale', count: gradeScales.length },
        ]}
        activeTab={activeTab}
        onChange={(tabId) => setActiveTab(tabId as any)}
      />

      {/* TAB 1: DATE SHEETS & SCHEDULES */}
      {activeTab === 'SCHEDULES' && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <AdminCard className="p-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="w-full sm:w-80">
                <AdminSearchInput
                  value={searchTerm}
                  onChange={setSearchTerm}
                  placeholder="Search subject or class grade..."
                />
              </div>

              <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Term:</span>
                  <select
                    value={selectedTermId}
                    onChange={(e) => setSelectedTermId(e.target.value)}
                    className="px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-700 focus:border-[#0B72E7] focus:outline-none transition-all shadow-xs"
                  >
                    <option value="ALL">All Terms</option>
                    {terms.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Class:</span>
                  <select
                    value={selectedClassFilter}
                    onChange={(e) => setSelectedClassFilter(e.target.value)}
                    className="px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-700 focus:border-[#0B72E7] focus:outline-none transition-all shadow-xs"
                  >
                    <option value="ALL">All Classes</option>
                    {classesList.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </AdminCard>

          {/* Table */}
          <AdminCard className="p-0 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F8FAFC] text-slate-400 font-bold uppercase tracking-wider text-[11px] border-b border-slate-100">
                  <tr>
                    <th className="py-3.5 px-5">Subject Details</th>
                    <th className="py-3.5 px-4">Class Grade</th>
                    <th className="py-3.5 px-4">Exam Term</th>
                    <th className="py-3.5 px-4">Exam Date & Time</th>
                    <th className="py-3.5 px-4 text-center">Marks Range</th>
                    <th className="py-3.5 px-4 text-center">Evaluated</th>
                    <th className="py-3.5 px-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredSchedules.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-slate-400">
                        No exam papers scheduled matching the query.
                      </td>
                    </tr>
                  ) : (
                    filteredSchedules.map((sch) => (
                      <tr key={sch.id} className="hover:bg-blue-50/30 transition-colors group">
                        <td className="py-3.5 px-5">
                          <div className="font-bold text-slate-900 group-hover:text-[#0B72E7] transition-colors">
                            {sch.subjectName}
                          </div>
                          <span className="text-[11px] font-mono text-slate-400">{sch.subjectCode}</span>
                        </td>

                        <td className="py-3.5 px-4">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-[#0B72E7] border border-blue-200/60">
                            {sch.classGradeName}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 font-semibold text-slate-700">{sch.termName}</td>

                        <td className="py-3.5 px-4">
                          <div className="font-bold text-slate-800">{sch.examDate}</div>
                          <div className="text-[11px] text-slate-400 font-mono mt-0.5">{sch.timeRange}</div>
                        </td>

                        <td className="py-3.5 px-4 text-center">
                          <span className="font-bold text-slate-900">{sch.maxMarks}</span>
                          <span className="text-slate-400 text-[11px]"> (Pass: {sch.passingMarks})</span>
                        </td>

                        <td className="py-3.5 px-4 text-center">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            {sch.resultsCount} Students Graded
                          </span>
                        </td>

                        <td className="py-3.5 px-5 text-right whitespace-nowrap">
                          <AdminButton
                            variant="secondary"
                            size="sm"
                            onClick={() => setActiveTab('REPORT_CARDS')}
                            icon={<FileText className="w-3.5 h-3.5" />}
                          >
                            View Cards
                          </AdminButton>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </AdminCard>
        </div>
      )}

      {/* TAB 2: REPORT CARDS GENERATOR */}
      {activeTab === 'REPORT_CARDS' && (
        <div className="space-y-4">
          <AdminCard className="p-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="w-full sm:w-80">
                <AdminSearchInput
                  value={searchTerm}
                  onChange={setSearchTerm}
                  placeholder="Search student name or admission number..."
                />
              </div>

              <div className="text-xs text-slate-500 font-medium">
                Showing {filteredReportCards.length} generated student transcripts
              </div>
            </div>
          </AdminCard>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredReportCards.map((rc) => (
              <AdminCard
                key={rc.id}
                className="p-5 flex flex-col justify-between hover:shadow-[0_8px_30px_rgba(30,64,175,0.08)] transition-all group"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-bold text-slate-900 group-hover:text-[#0B72E7] transition-colors text-sm">
                        {rc.studentName}
                      </h4>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {rc.admissionNumber} · Roll #{rc.rollNumber}
                      </p>
                    </div>
                    <span className="text-[11px] font-bold bg-blue-50 text-[#0B72E7] border border-blue-200/60 px-2.5 py-1 rounded-full">
                      {rc.classSection}
                    </span>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 grid grid-cols-3 gap-2 text-center text-xs">
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">Marks</span>
                      <span className="font-extrabold text-slate-800">
                        {rc.totalObtained}/{rc.totalMax}
                      </span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-emerald-50/60 border border-emerald-100">
                      <span className="text-emerald-700 block text-[10px] uppercase font-bold">Percentage</span>
                      <span className="font-extrabold text-emerald-800">{rc.percentage}%</span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-purple-50/60 border border-purple-100">
                      <span className="text-purple-700 block text-[10px] uppercase font-bold">Grade</span>
                      <span className="font-black text-purple-800">{rc.overallGrade}</span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-500 italic mt-3 line-clamp-1">&ldquo;{rc.remarks}&rdquo;</p>
                </div>

                <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400">Attendance: {rc.attendancePercent}%</span>
                  <AdminButton
                    variant="primary"
                    size="sm"
                    onClick={() => setActiveReportCard(rc)}
                    icon={<Printer className="w-3.5 h-3.5" />}
                  >
                    View & Print Card
                  </AdminButton>
                </div>
              </AdminCard>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: CBSE GRADING SCALE */}
      {activeTab === 'GRADING' && (
        <AdminCard className="p-0 overflow-hidden">
          <div className="p-5 border-b border-slate-100 bg-[#F8FAFC]">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              CBSE Secondary & Senior Secondary 9-Point Grading Benchmark
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Standardized evaluation formula utilized across all examination report cards and scholastic records.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F8FAFC] text-slate-400 font-bold uppercase tracking-wider text-[11px] border-b border-slate-100">
                <tr>
                  <th className="py-3.5 px-5">Letter Grade</th>
                  <th className="py-3.5 px-4">Marks Range (%)</th>
                  <th className="py-3.5 px-4">Grade Point (GP)</th>
                  <th className="py-3.5 px-5">Performance Descriptor</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {gradeScales.map((gs) => (
                  <tr key={gs.grade} className="hover:bg-blue-50/20 transition-colors">
                    <td className="py-3.5 px-5">
                      <span className="inline-flex items-center justify-center w-8 h-8 rounded-xl bg-blue-50 text-[#0B72E7] font-black text-sm border border-blue-200/60 shadow-2xs">
                        {gs.grade}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-800">
                      {gs.minPercent}% - {gs.maxPercent}%
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-700">{gs.gradePoint.toFixed(1)}</td>
                    <td className="py-3.5 px-5 font-medium text-slate-600">{gs.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </AdminCard>
      )}

      {/* 4. MODAL: Create Exam Schedule */}
      <AdminModal
        isOpen={isScheduleModalOpen}
        onClose={() => setIsScheduleModalOpen(false)}
        title="Schedule New Examination Session"
        description="Add subject exam date, duration, and maximum passing criteria."
        maxWidth="md"
        footer={
          <div className="flex justify-end gap-2.5 w-full">
            <AdminButton variant="secondary" onClick={() => setIsScheduleModalOpen(false)}>
              Cancel
            </AdminButton>
            <AdminButton
              variant="primary"
              onClick={() => {
                alert('Exam session successfully added to date-sheet!');
                setIsScheduleModalOpen(false);
              }}
            >
              Confirm Schedule
            </AdminButton>
          </div>
        }
      >
        <div className="space-y-4 text-xs">
          <div>
            <label className="font-bold text-slate-700 block mb-1">Assessment Term</label>
            <select className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-800 font-semibold focus:border-[#0B72E7] focus:outline-none">
              {terms.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Class Grade</label>
              <select className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-800 font-semibold focus:border-[#0B72E7] focus:outline-none">
                <option value="Class 10">Class 10</option>
                <option value="Class 9">Class 9</option>
                <option value="Class 8">Class 8</option>
              </select>
            </div>
            <div>
              <label className="font-bold text-slate-700 block mb-1">Subject</label>
              <select className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-800 font-semibold focus:border-[#0B72E7] focus:outline-none">
                <option value="Mathematics">Mathematics (MATH-10)</option>
                <option value="Science">Science (SCI-10)</option>
                <option value="Social Studies">Social Studies (SST-10)</option>
                <option value="English">English Core (ENG-10)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Exam Date</label>
              <input
                type="date"
                defaultValue="2026-10-15"
                className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-800 font-semibold focus:border-[#0B72E7] focus:outline-none"
              />
            </div>
            <div>
              <label className="font-bold text-slate-700 block mb-1">Time Slot</label>
              <input
                type="text"
                defaultValue="09:00 AM - 12:00 PM"
                className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-800 font-semibold focus:border-[#0B72E7] focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Maximum Marks</label>
              <input
                type="number"
                defaultValue={100}
                className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-800 font-bold focus:border-[#0B72E7] focus:outline-none"
              />
            </div>
            <div>
              <label className="font-bold text-slate-700 block mb-1">Passing Minimum</label>
              <input
                type="number"
                defaultValue={33}
                className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-800 font-bold focus:border-[#0B72E7] focus:outline-none"
              />
            </div>
          </div>
        </div>
      </AdminModal>

      {/* 5. DRAWER: Report Card Full Sheet Preview */}
      <AdminDrawer
        isOpen={Boolean(activeReportCard)}
        onClose={() => setActiveReportCard(null)}
        title={activeReportCard ? `${activeReportCard.studentName}'s Report Card` : 'Student Report Card'}
        subtitle={activeReportCard ? `${activeReportCard.admissionNumber} · ${activeReportCard.classSection}` : ''}
      >
        {activeReportCard && (
          <div className="space-y-6">
            {/* Report Card Header Card */}
            <div className="p-6 rounded-2xl bg-white border-2 border-slate-200 shadow-md text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#0B72E7] flex items-center justify-center mx-auto font-bold border border-blue-100">
                <GraduationCap className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900 tracking-tight">{schoolName}</h3>
                <p className="text-xs text-slate-400 font-semibold">Affiliated to CBSE, New Delhi</p>
                <div className="inline-block mt-2 px-3 py-1 bg-slate-50 border border-slate-200 rounded-full text-[11px] font-bold text-slate-700">
                  Annual Scholastic Assessment · AY 2026-27
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 grid grid-cols-2 text-left text-xs gap-2">
                <div>
                  <span className="text-slate-400 block font-medium">Student Name:</span>
                  <span className="font-bold text-slate-800">{activeReportCard.studentName}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Admission #:</span>
                  <span className="font-mono font-bold text-slate-800">{activeReportCard.admissionNumber}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Class & Section:</span>
                  <span className="font-bold text-slate-800">{activeReportCard.classSection}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Roll Number:</span>
                  <span className="font-bold text-slate-800">#{activeReportCard.rollNumber}</span>
                </div>
              </div>
            </div>

            {/* Subject Marks Table */}
            <div className="rounded-2xl border border-slate-200 overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F8FAFC] text-slate-400 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-4">Subject</th>
                    <th className="py-2.5 px-3 text-center">Max</th>
                    <th className="py-2.5 px-3 text-center">Obtained</th>
                    <th className="py-2.5 px-3 text-center">Grade</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {activeReportCard.marks.map((m) => (
                    <tr key={m.code}>
                      <td className="py-2.5 px-4 font-semibold text-slate-800">{m.subject}</td>
                      <td className="py-2.5 px-3 text-center font-mono text-slate-500">{m.max}</td>
                      <td className="py-2.5 px-3 text-center font-mono font-bold text-slate-900">{m.obtained}</td>
                      <td className="py-2.5 px-3 text-center">
                        <span className="font-bold text-[#0B72E7]">{m.grade}</span>
                      </td>
                    </tr>
                  ))}
                  <tr className="bg-slate-50 font-bold">
                    <td className="py-3 px-4 text-slate-900">Total Cumulative</td>
                    <td className="py-3 px-3 text-center text-slate-600">{activeReportCard.totalMax}</td>
                    <td className="py-3 px-3 text-center text-[#0B72E7]">{activeReportCard.totalObtained}</td>
                    <td className="py-3 px-3 text-center text-purple-700">{activeReportCard.overallGrade}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Performance Strip */}
            <div className="grid grid-cols-2 gap-3 text-center">
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200">
                <span className="text-emerald-700 block text-xs font-bold">Percentage</span>
                <span className="text-xl font-black text-emerald-800">{activeReportCard.percentage}%</span>
              </div>
              <div className="p-3 rounded-xl bg-blue-50 border border-blue-200">
                <span className="text-[#0B72E7] block text-xs font-bold">Attendance</span>
                <span className="text-xl font-black text-blue-800">{activeReportCard.attendancePercent}%</span>
              </div>
            </div>

            {/* Remarks */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 text-xs">
              <span className="text-slate-400 block font-bold uppercase text-[10px] mb-1">Class Teacher Remarks:</span>
              <p className="text-slate-700 italic font-medium leading-relaxed">&ldquo;{activeReportCard.remarks}&rdquo;</p>
            </div>

            {/* Print Button */}
            <AdminButton
              variant="primary"
              className="w-full py-3"
              icon={<Printer className="w-4 h-4" />}
              onClick={() => window.print()}
            >
              Print Official Report Card
            </AdminButton>
          </div>
        )}
      </AdminDrawer>
    </div>
  );
}
