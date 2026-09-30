'use client';

import React, { useState, useTransition } from 'react';
import {
  CalendarCheck,
  Users,
  UserCheck,
  UserX,
  Clock,
  AlertTriangle,
  Download,
  Calendar,
  FileSpreadsheet,
  FileText,
  TrendingUp,
  RefreshCw,
  Building,
  CheckCircle2,
  X,
} from 'lucide-react';
import {
  PageHeader,
  MetricTile,
  DataCard,
  StatusBadge,
  EmptyState,
} from '@/components/ui';
import {
  getAdminAttendanceOverviewAction,
  exportAttendanceDataAction,
} from '@/actions/attendance';

export interface UnmarkedClass {
  id: string;
  className: string;
  sectionName: string;
  classTeacherName: string;
  studentCount: number;
}

export interface ClassBreakdownItem {
  id: string;
  className: string;
  sectionName: string;
  totalStudents: number;
  present: number;
  absent: number;
  late: number;
  percentage: number;
  isMarked: boolean;
}

export interface DayTrendItem {
  date: string;
  dayLabel: string;
  percentage: number;
  total: number;
  present: number;
}

export interface AttendanceOverviewData {
  totalPresent: number;
  totalAbsent: number;
  totalLate: number;
  totalStudents: number;
  attendancePercentage: number;
  classesNotMarked: UnmarkedClass[];
  classWise: ClassBreakdownItem[];
  trend: DayTrendItem[];
}

interface AdminAttendanceDashboardProps {
  schoolName: string;
  board: string;
  initialOverview: AttendanceOverviewData | null;
}

export default function AdminAttendanceDashboard({
  schoolName,
  board,
  initialOverview,
}: AdminAttendanceDashboardProps) {
  const [overview, setOverview] = useState<AttendanceOverviewData | null>(initialOverview);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isExporting, startExportTransition] = useTransition();

  // Export date range
  const todayStr = new Date().toISOString().split('T')[0];
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const thirtyDaysAgoStr = thirtyDaysAgo.toISOString().split('T')[0];

  const [exportStartDate, setExportStartDate] = useState(thirtyDaysAgoStr);
  const [exportEndDate, setExportEndDate] = useState(todayStr);
  const [exportFeedback, setExportFeedback] = useState<string | null>(null);

  // Manual refresh
  const handleRefresh = async () => {
    setIsRefreshing(true);
    const res = await getAdminAttendanceOverviewAction();
    setIsRefreshing(false);
    if (res.success && res.overview) {
      setOverview(res.overview);
    }
  };

  // Export action
  const handleExport = (format: 'csv' | 'xlsx') => {
    setExportFeedback(null);
    startExportTransition(async () => {
      const res = await exportAttendanceDataAction(exportStartDate, exportEndDate, format);
      if (!res.success || !res.data) {
        setExportFeedback(res.error || 'Failed to export attendance records.');
        return;
      }

      try {
        let blob: Blob;
        if (res.format === 'xlsx') {
          const byteCharacters = atob(res.data);
          const byteNumbers = new Array(byteCharacters.length);
          for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
          }
          const byteArray = new Uint8Array(byteNumbers);
          blob = new Blob([byteArray], { type: res.mimeType });
        } else {
          blob = new Blob([res.data], { type: res.mimeType });
        }

        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = res.fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        setExportFeedback(`Successfully generated ${res.fileName}`);
      } catch (err: unknown) {
        setExportFeedback('Error generating file download.');
      }
    });
  };

  const totalPresent = overview?.totalPresent ?? 0;
  const totalAbsent = overview?.totalAbsent ?? 0;
  const totalLate = overview?.totalLate ?? 0;
  const attendanceRate = overview?.attendancePercentage ?? 0;
  const unmarkedClasses = overview?.classesNotMarked ?? [];
  const classBreakdown = overview?.classWise ?? [];
  const trend = overview?.trend ?? [];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Institutional Attendance Oversight"
        subtitle={`Real-time attendance telemetry, unmarked section tracker, and compliance records for ${schoolName} (${board}).`}
        actions={
          <div className="flex items-center gap-2.5">
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 transition-colors shadow-xs cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-slate-500 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span>{isRefreshing ? 'Syncing...' : 'Sync Real-Time'}</span>
            </button>
          </div>
        }
      />

      {/* 1. Today's Summary KPI Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricTile
          title="Students Present Today"
          value={totalPresent}
          icon={UserCheck}
          variant="green"
        />
        <MetricTile
          title="Students Absent Today"
          value={totalAbsent}
          icon={UserX}
          variant="coral"
        />
        <MetricTile
          title="Late Arrivals"
          value={totalLate}
          icon={Clock}
          variant="amber"
        />
        <MetricTile
          title="Today's Attendance Rate"
          value={`${attendanceRate}%`}
          icon={CalendarCheck}
          variant="blue"
        />
      </div>

      {/* 2. Middle Row: "Classes Not Yet Marked" + 7-Day Trend Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Classes Not Yet Marked Widget (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Classes Not Yet Marked</h3>
                <p className="text-xs text-slate-500">Roll-call pending for today</p>
              </div>
            </div>

            <span
              className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                unmarkedClasses.length > 0
                  ? 'bg-rose-100 text-rose-800'
                  : 'bg-emerald-100 text-emerald-800'
              }`}
            >
              {unmarkedClasses.length} Pending
            </span>
          </div>

          {unmarkedClasses.length === 0 ? (
            <div className="py-6 text-center">
              <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
              <div className="text-xs font-bold text-slate-900">All Sections Submitted!</div>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Every classroom has completed morning roll-call attendance.
              </p>
            </div>
          ) : (
            <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1">
              {unmarkedClasses.map((cls) => (
                <div
                  key={cls.id}
                  className="p-3 rounded-lg border border-rose-200/80 bg-rose-50/40 flex items-center justify-between text-xs"
                >
                  <div>
                    <div className="font-bold text-slate-900">
                      {cls.className} - Section {cls.sectionName}
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      Teacher: <span className="font-medium text-slate-700">{cls.classTeacherName}</span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-700">
                      Unsubmitted
                    </span>
                    <div className="text-[10px] text-slate-400 mt-0.5">
                      {cls.studentCount} students
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: 7-Day Trend Chart (Lightweight Inline SVG) (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                <TrendingUp className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">7-Day Attendance Trend</h3>
                <p className="text-xs text-slate-500">Institutional daily attendance rate (%)</p>
              </div>
            </div>

            <div className="flex items-center gap-3 text-xs text-slate-500">
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded bg-emerald-500 inline-block" /> ≥75% Target
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded bg-amber-400 inline-block" /> &lt;75%
              </span>
            </div>
          </div>

          {/* Inline SVG Chart */}
          <div className="pt-2">
            <div className="h-56 w-full flex flex-col justify-end">
              <svg viewBox="0 0 500 180" className="w-full h-full overflow-visible">
                {/* Horizontal reference grid lines */}
                <line x1="30" y1="20" x2="490" y2="20" stroke="#E2E8F0" strokeDasharray="3 3" />
                <text x="5" y="24" fill="#94A3B8" fontSize="10" fontFamily="sans-serif">100%</text>

                <line x1="30" y1="65" x2="490" y2="65" stroke="#CBD5E1" strokeDasharray="2 2" />
                <text x="10" y="69" fill="#FA896B" fontSize="10" fontWeight="bold" fontFamily="sans-serif">75%</text>

                <line x1="30" y1="110" x2="490" y2="110" stroke="#E2E8F0" strokeDasharray="3 3" />
                <text x="10" y="114" fill="#94A3B8" fontSize="10" fontFamily="sans-serif">50%</text>

                <line x1="30" y1="155" x2="490" y2="155" stroke="#E2E8F0" />
                <text x="15" y="159" fill="#94A3B8" fontSize="10" fontFamily="sans-serif">0%</text>

                {/* Bars for 7 days */}
                {trend.map((item, index) => {
                  const x = 50 + index * 60;
                  const barWidth = 36;
                  // Max height = 135px (from y=20 to y=155)
                  const barHeight = Math.max(4, (item.percentage / 100) * 135);
                  const y = 155 - barHeight;
                  const isHealthy = item.percentage >= 75;

                  return (
                    <g key={item.date} className="cursor-pointer group">
                      {/* Bar */}
                      <rect
                        x={x}
                        y={y}
                        width={barWidth}
                        height={barHeight}
                        rx="4"
                        fill={item.total === 0 ? '#E2E8F0' : isHealthy ? '#10B981' : '#F59E0B'}
                        className="transition-all hover:opacity-85"
                      />

                      {/* Percentage label on top of bar */}
                      <text
                        x={x + barWidth / 2}
                        y={Math.max(16, y - 6)}
                        textAnchor="middle"
                        fill={isHealthy ? '#047857' : '#B45309'}
                        fontSize="11"
                        fontWeight="bold"
                        fontFamily="sans-serif"
                      >
                        {item.percentage}%
                      </text>

                      {/* Day Label below axis */}
                      <text
                        x={x + barWidth / 2}
                        y="172"
                        textAnchor="middle"
                        fill="#64748B"
                        fontSize="11"
                        fontWeight="600"
                        fontFamily="sans-serif"
                      >
                        {item.dayLabel}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Class-wise Breakdown Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Class-Wise Attendance Breakdown</h3>
            <p className="text-xs text-slate-500">Live attendance count and percentages across classrooms</p>
          </div>
          <span className="text-xs text-slate-600 font-semibold bg-white border border-slate-200 px-2.5 py-1 rounded-lg">
            {classBreakdown.length} Total Sections
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                <th className="p-3">Class & Section</th>
                <th className="p-3 text-center">Enrolled</th>
                <th className="p-3 text-center">Present</th>
                <th className="p-3 text-center">Absent</th>
                <th className="p-3 text-center">Late</th>
                <th className="p-3 text-left w-52">Attendance Rate</th>
                <th className="p-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {classBreakdown.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400">
                    No classes registered.
                  </td>
                </tr>
              ) : (
                classBreakdown.map((row) => (
                  <tr
                    key={row.id}
                    className={`hover:bg-slate-50/60 transition-colors ${
                      !row.isMarked ? 'bg-rose-50/20' : ''
                    }`}
                  >
                    <td className="p-3 font-bold text-slate-900">
                      {row.className} - {row.sectionName}
                    </td>
                    <td className="p-3 text-center font-mono text-slate-700">{row.totalStudents}</td>
                    <td className="p-3 text-center font-mono text-emerald-700 font-bold">
                      {row.present}
                    </td>
                    <td className="p-3 text-center font-mono text-rose-700 font-bold">
                      {row.absent}
                    </td>
                    <td className="p-3 text-center font-mono text-amber-700 font-bold">{row.late}</td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              row.percentage >= 75
                                ? 'bg-emerald-500'
                                : row.percentage >= 50
                                ? 'bg-amber-500'
                                : 'bg-rose-500'
                            }`}
                            style={{ width: `${row.percentage}%` }}
                          />
                        </div>
                        <span className="font-bold text-slate-800 w-10 text-right">
                          {row.isMarked ? `${row.percentage}%` : '—'}
                        </span>
                      </div>
                    </td>
                    <td className="p-3 text-right">
                      <StatusBadge
                        status={row.isMarked ? 'SUBMITTED' : 'PENDING'}
                        colorMap={{
                          SUBMITTED: 'bg-emerald-100 text-emerald-800 border-emerald-300',
                          PENDING: 'bg-rose-100 text-rose-800 border-rose-300',
                        }}
                      />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. Export to Excel & CSV Section */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
          <Download className="w-4 h-4 text-[#FA896B]" />
          <div>
            <h3 className="text-sm font-bold text-slate-900">Export Institutional Attendance Registers</h3>
            <p className="text-xs text-slate-500">Download formatted attendance audit records for statutory or inspection needs</p>
          </div>
        </div>

        {exportFeedback && (
          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-700 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>{exportFeedback}</span>
            </div>
            <button onClick={() => setExportFeedback(null)} className="text-slate-400 hover:text-slate-600">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Start Date
              </label>
              <input
                type="date"
                value={exportStartDate}
                onChange={(e) => setExportStartDate(e.target.value)}
                className="px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white outline-none focus:ring-1 focus:ring-[#FA896B]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                End Date
              </label>
              <input
                type="date"
                value={exportEndDate}
                onChange={(e) => setExportEndDate(e.target.value)}
                className="px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white outline-none focus:ring-1 focus:ring-[#FA896B]"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => handleExport('csv')}
              disabled={isExporting}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 transition-colors shadow-xs cursor-pointer disabled:opacity-50"
            >
              <FileText className="w-3.5 h-3.5 text-slate-500" />
              <span>{isExporting ? 'Exporting...' : 'Export CSV'}</span>
            </button>

            <button
              onClick={() => handleExport('xlsx')}
              disabled={isExporting}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-lg text-white bg-[#0F172A] hover:bg-slate-800 transition-colors shadow-xs cursor-pointer disabled:opacity-50"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
              <span>{isExporting ? 'Generating...' : 'Export Excel (.xlsx)'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
