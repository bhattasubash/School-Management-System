'use client';

import React, { useState } from 'react';
import { Award, BarChart3, Download, FileText, TrendingUp, CheckCircle2 } from 'lucide-react';
import PortalPageHeader from '../PortalPageHeader';

interface ResultsMarksScreenProps {
  subjects: Array<{
    code: string;
    percent: number;
    name: string;
  }>;
  onBackToDashboard: () => void;
  onSelectNav: (id: string) => void;
}

const DETAILED_RESULTS = [
  { code: 'MATH-041', name: 'Mathematics (Standard)', maxMarks: 100, marksObtained: 92, grade: 'A1', gradePoint: 9.2, status: 'Distinction' },
  { code: 'ENG-184', name: 'English Language & Literature', maxMarks: 100, marksObtained: 95, grade: 'A1', gradePoint: 9.5, status: 'Distinction' },
  { code: 'SCI-086', name: 'Science & Lab Work', maxMarks: 100, marksObtained: 86, grade: 'A2', gradePoint: 8.6, status: 'First Class' },
  { code: 'SOC-087', name: 'Social Science', maxMarks: 100, marksObtained: 78, grade: 'B1', gradePoint: 7.8, status: 'First Class' },
  { code: 'CA-165', name: 'Computer Applications', maxMarks: 100, marksObtained: 90, grade: 'A1', gradePoint: 9.0, status: 'Distinction' },
  { code: 'HIN-002', name: 'Hindi Course A', maxMarks: 100, marksObtained: 71, grade: 'B1', gradePoint: 7.1, status: 'First Class' },
];

export default function ResultsMarksScreen({
  subjects,
  onBackToDashboard,
  onSelectNav,
}: ResultsMarksScreenProps) {
  const [selectedTerm, setSelectedTerm] = useState('Term 1 Assessment');

  const totalObtained = DETAILED_RESULTS.reduce((acc, r) => acc + r.marksObtained, 0);
  const totalMax = DETAILED_RESULTS.reduce((acc, r) => acc + r.maxMarks, 0);
  const aggregatePercentage = (totalObtained / totalMax) * 100;
  const aggregateCGPA = 8.42;

  return (
    <div className="space-y-6">
      <PortalPageHeader
        title="Results & Marks"
        subtitle="Scholastic performance assessment, subject grades, and cumulative grade point average (CGPA)"
        onBackToDashboard={onBackToDashboard}
      >
        <button
          type="button"
          onClick={() => onSelectNav('report-card')}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-xs transition-colors"
        >
          <FileText className="w-4 h-4 text-blue-600" />
          <span>View Official Report Card</span>
        </button>
        <button
          type="button"
          onClick={() => alert('Marks statement downloaded as PDF.')}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-semibold shadow-xs transition-colors"
        >
          <Download className="w-4 h-4" />
          <span>Download Statement</span>
        </button>
      </PortalPageHeader>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-[22px] shadow-[0_4px_20px_rgba(0,100,200,0.06)] border border-blue-50/80 p-5 flex flex-col justify-between">
          <span className="text-xs font-medium text-slate-400">Cumulative GPA (CGPA)</span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl font-extrabold text-blue-600">{aggregateCGPA}</span>
            <span className="text-xs text-slate-400 font-semibold">/ 10.0</span>
          </div>
          <p className="text-[11px] text-emerald-600 font-semibold mt-1 flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Top 5% in Class 10</span>
          </p>
        </div>

        <div className="bg-white rounded-[22px] shadow-[0_4px_20px_rgba(0,100,200,0.06)] border border-blue-50/80 p-5 flex flex-col justify-between">
          <span className="text-xs font-medium text-slate-400">Aggregate Percentage</span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl font-extrabold text-slate-900">{aggregatePercentage.toFixed(1)}%</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            {totalObtained} / {totalMax} Marks Total
          </p>
        </div>

        <div className="bg-white rounded-[22px] shadow-[0_4px_20px_rgba(0,100,200,0.06)] border border-blue-50/80 p-5 flex flex-col justify-between">
          <span className="text-xs font-medium text-slate-400">Overall Grade</span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl font-extrabold text-emerald-600">A1</span>
          </div>
          <p className="text-[11px] text-emerald-600 font-semibold mt-1">
            Outstanding Performance
          </p>
        </div>

        <div className="bg-white rounded-[22px] shadow-[0_4px_20px_rgba(0,100,200,0.06)] border border-blue-50/80 p-5 flex flex-col justify-between">
          <span className="text-xs font-medium text-slate-400">Class Section Rank</span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl font-extrabold text-indigo-600">4th</span>
            <span className="text-xs text-slate-400 font-semibold">of 42 students</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Section 10-A</p>
        </div>
      </div>

      {/* Detailed Marks Table Card */}
      <div className="bg-white rounded-[22px] shadow-[0_4px_20px_rgba(0,100,200,0.06)] border border-blue-50/80 p-6 space-y-4">
        {/* Term Switcher */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 flex-wrap gap-3">
          <div className="flex items-center gap-2">
            {['Term 1 Assessment', 'Periodic Test 2', 'Periodic Test 1'].map((term) => (
              <button
                key={term}
                type="button"
                onClick={() => setSelectedTerm(term)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  selectedTerm === term
                    ? 'bg-blue-50 text-blue-700 border border-blue-200'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {term}
              </button>
            ))}
          </div>
          <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1">
            <CheckCircle2 className="w-4 h-4" />
            <span>Results Published & Verified</span>
          </span>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 font-semibold uppercase text-[10px] tracking-wider">
                <th className="py-3 px-4">Subject & Code</th>
                <th className="py-3 px-4 text-center">Max Marks</th>
                <th className="py-3 px-4 text-center">Marks Obtained</th>
                <th className="py-3 px-4 text-center">Grade</th>
                <th className="py-3 px-4 text-center">Grade Point</th>
                <th className="py-3 px-4 text-right">Remarks</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {DETAILED_RESULTS.map((row) => (
                <tr key={row.code} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3.5 px-4">
                    <span className="font-bold text-slate-900 block">{row.name}</span>
                    <span className="text-[10px] font-mono text-slate-400">{row.code}</span>
                  </td>
                  <td className="py-3.5 px-4 text-center font-medium text-slate-500">
                    {row.maxMarks}
                  </td>
                  <td className="py-3.5 px-4 text-center font-bold text-slate-900 text-sm">
                    {row.marksObtained}
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <span
                      className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                        row.grade.startsWith('A')
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-blue-50 text-blue-700 border border-blue-200'
                      }`}
                    >
                      {row.grade}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-center font-mono font-bold text-slate-700">
                    {row.gradePoint}
                  </td>
                  <td className="py-3.5 px-4 text-right font-medium text-slate-600">
                    {row.status}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
