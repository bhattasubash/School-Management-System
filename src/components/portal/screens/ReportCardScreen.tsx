'use client';

import React from 'react';
import { Download, Printer, Award, ShieldCheck } from 'lucide-react';
import SchoolLogo from '../SchoolLogo';
import PortalPageHeader from '../PortalPageHeader';

interface ReportCardScreenProps {
  student: {
    name: string;
    className: string;
    sectionName: string;
    rollNumber: number | null;
    admissionNumber: string;
    board: string;
    batchYear: string;
  };
  onBackToDashboard: () => void;
}

const SCHOLASTIC_ROWS = [
  { subject: 'Mathematics', periodicTest: '19/20', notebook: '5/5', enrichment: '5/5', termExam: '63/70', total: '92/100', grade: 'A1' },
  { subject: 'English Language & Lit.', periodicTest: '20/20', notebook: '5/5', enrichment: '5/5', termExam: '65/70', total: '95/100', grade: 'A1' },
  { subject: 'Science (Theory & Lab)', periodicTest: '18/20', notebook: '5/5', enrichment: '4/5', termExam: '59/70', total: '86/100', grade: 'A2' },
  { subject: 'Social Science', periodicTest: '16/20', notebook: '4/5', enrichment: '4/5', termExam: '54/70', total: '78/100', grade: 'B1' },
  { subject: 'Hindi Course A', periodicTest: '15/20', notebook: '4/5', enrichment: '4/5', termExam: '48/70', total: '71/100', grade: 'B1' },
  { subject: 'Computer Applications', periodicTest: '18/20', notebook: '5/5', enrichment: '5/5', termExam: '62/70', total: '90/100', grade: 'A1' },
];

const CO_SCHOLASTIC_ROWS = [
  { area: 'Work Education (Pre-Vocational & Digital Skills)', grade: 'A (Outstanding)' },
  { area: 'Art Education (Visual & Performing Arts)', grade: 'A (Outstanding)' },
  { area: 'Health & Physical Education (Sports & Yoga)', grade: 'A (Outstanding)' },
  { area: 'Discipline & Values Assessment', grade: 'A (Exemplary)' },
];

export default function ReportCardScreen({
  student,
  onBackToDashboard,
}: ReportCardScreenProps) {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      <PortalPageHeader
        title="Report Card"
        subtitle="Official Term 1 Scholastic Assessment and Progress Report for Class 10"
        onBackToDashboard={onBackToDashboard}
      >
        <button
          type="button"
          onClick={handlePrint}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-xs transition-colors"
        >
          <Printer className="w-4 h-4 text-slate-500" />
          <span>Print Report</span>
        </button>
        <button
          type="button"
          onClick={() => alert('Official Term Report Card PDF downloaded.')}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-semibold shadow-xs transition-colors"
        >
          <Download className="w-4 h-4" />
          <span>Download PDF</span>
        </button>
      </PortalPageHeader>

      {/* Official Report Card Container */}
      <div className="bg-white rounded-[24px] shadow-[0_6px_30px_rgba(0,100,200,0.08)] border border-blue-100 p-8 sm:p-10 space-y-8 max-w-5xl mx-auto">
        {/* School Header */}
        <div className="text-center pb-6 border-b-2 border-slate-200 space-y-2">
          <div className="flex items-center justify-center gap-3">
            <SchoolLogo size={48} />
            <div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                SUNRISE PUBLIC SCHOOL
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                Affiliated to CBSE, New Delhi • Affiliation No. 1030482 • School Code: 20491
              </p>
            </div>
          </div>
          <div className="inline-block mt-3 px-4 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold uppercase tracking-wider">
            Academic Performance Report &nbsp;·&nbsp; Session 2026 - 2027
          </div>
        </div>

        {/* Student Demographics Grid */}
        <div className="bg-slate-50/80 rounded-2xl p-5 border border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div>
            <span className="text-[11px] text-slate-400 font-medium block">Student Name</span>
            <span className="font-bold text-slate-900 text-sm">{student.name}</span>
          </div>
          <div>
            <span className="text-[11px] text-slate-400 font-medium block">Class & Section</span>
            <span className="font-bold text-slate-900 text-sm">Class {student.className} - {student.sectionName}</span>
          </div>
          <div>
            <span className="text-[11px] text-slate-400 font-medium block">Roll Number</span>
            <span className="font-bold text-slate-900 text-sm">{student.rollNumber || 27}</span>
          </div>
          <div>
            <span className="text-[11px] text-slate-400 font-medium block">Admission No.</span>
            <span className="font-bold text-slate-900 text-sm">{student.admissionNumber || 'SPS-2026-0428'}</span>
          </div>
        </div>

        {/* Scholastic Performance Table */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
            Part 1: Scholastic Areas (Term 1 Assessment)
          </h3>
          <div className="overflow-x-auto border border-slate-200 rounded-xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100/80 text-slate-600 font-bold border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-4">Subject</th>
                  <th className="py-2.5 px-3 text-center">Periodic Test (20)</th>
                  <th className="py-2.5 px-3 text-center">Notebook (5)</th>
                  <th className="py-2.5 px-3 text-center">Enrichment (5)</th>
                  <th className="py-2.5 px-3 text-center">Term Exam (70)</th>
                  <th className="py-2.5 px-3 text-center">Total (100)</th>
                  <th className="py-2.5 px-4 text-right">Grade</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {SCHOLASTIC_ROWS.map((row) => (
                  <tr key={row.subject} className="hover:bg-slate-50/50">
                    <td className="py-2.5 px-4 font-bold text-slate-800">{row.subject}</td>
                    <td className="py-2.5 px-3 text-center text-slate-600">{row.periodicTest}</td>
                    <td className="py-2.5 px-3 text-center text-slate-600">{row.notebook}</td>
                    <td className="py-2.5 px-3 text-center text-slate-600">{row.enrichment}</td>
                    <td className="py-2.5 px-3 text-center text-slate-600 font-medium">{row.termExam}</td>
                    <td className="py-2.5 px-3 text-center font-bold text-slate-900">{row.total}</td>
                    <td className="py-2.5 px-4 text-right">
                      <span className="font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                        {row.grade}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Co-Scholastic Activities */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
            Part 2: Co-Scholastic Activities (Graded on 3-Point Scale: A / B / C)
          </h3>
          <div className="overflow-x-auto border border-slate-200 rounded-xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100/80 text-slate-600 font-bold border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-4">Activity Area</th>
                  <th className="py-2.5 px-4 text-right">Grade & Performance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {CO_SCHOLASTIC_ROWS.map((row) => (
                  <tr key={row.area} className="hover:bg-slate-50/50">
                    <td className="py-2.5 px-4 font-medium text-slate-800">{row.area}</td>
                    <td className="py-2.5 px-4 text-right font-bold text-emerald-700">{row.grade}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Teacher Remarks & Principal Signatures */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-slate-200 text-xs">
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
            <span className="text-[11px] font-bold text-slate-400 block uppercase">Class Teacher Remarks</span>
            <p className="text-slate-700 font-medium mt-1 leading-relaxed">
              Subash is a sincere, observant, and hardworking student. He demonstrates exemplary aptitude in
              Mathematics and Analytical Thinking. Consistently proactive in classroom discussions.
            </p>
            <p className="text-slate-500 font-bold mt-3">Mrs. Shalini Roy (Class Mentor)</p>
          </div>

          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex flex-col justify-between">
            <div>
              <span className="text-[11px] font-bold text-slate-400 block uppercase">Result & Overall Result</span>
              <p className="text-emerald-700 font-bold text-base mt-1">PASSED WITH DISTINCTION (Grade A1)</p>
            </div>
            <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-400 block">Date of Issue</span>
                <span className="font-semibold text-slate-700">October 2, 2026</span>
              </div>
              <div className="text-right">
                <span className="font-serif italic font-bold text-sm text-slate-800 block">Dr. Anandita Sen</span>
                <span className="text-[10px] text-slate-400">Head of Institution</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
