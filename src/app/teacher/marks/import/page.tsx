'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  UploadCloud,
  FileSpreadsheet,
  Download,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ArrowLeft,
  Check,
} from 'lucide-react';
import { TeacherPageHeader } from '@/components/teacher/TeacherPageHeader';
import { TeacherCard } from '@/components/teacher/TeacherComponents';

export default function BulkMarksImportPage() {
  const [fileUploaded, setFileUploaded] = useState(false);
  const [fileName, setFileName] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [importCompleted, setImportCompleted] = useState(false);

  const previewRecords = [
    { roll: '01', name: 'Aarav Sharma', marks: 92, status: 'VALID' },
    { roll: '02', name: 'Ananya Verma', marks: 96, status: 'VALID' },
    { roll: '03', name: 'Dev Patel', marks: 84, status: 'VALID' },
    { roll: '04', name: 'Ishaan Gupta', marks: 105, status: 'INVALID', error: 'Exceeds max marks (100)' },
    { roll: '05', name: 'Kavya Singh', marks: 99, status: 'VALID' },
  ];

  const handleSimulatedUpload = () => {
    setFileName('MidTerm_Math_Grade8A.xlsx');
    setFileUploaded(true);
  };

  const handleConfirmImport = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setImportCompleted(true);
    }, 800);
  };

  return (
    <div className="space-y-6">
      <TeacherPageHeader
        title="Bulk Marks Import"
        description="Upload student marks using an Excel (.xlsx) or CSV file."
        breadcrumbs={[
          { label: 'Workspace', href: '/teacher' },
          { label: 'Exam Marks', href: '/teacher/marks' },
          { label: 'Import' },
        ]}
        action={
          <Link
            href="/teacher/marks"
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-[#102A56] hover:bg-slate-50 transition-colors shadow-xs"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Marks</span>
          </Link>
        }
      />

      {importCompleted && (
        <div className="p-4 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-[22px] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <div>
              <p className="text-sm font-bold">Import Completed Successfully</p>
              <p className="text-xs text-emerald-700">4 valid student marks records imported into Mid-Term assessment.</p>
            </div>
          </div>
          <Link
            href="/teacher/marks"
            className="px-4 py-1.5 rounded-xl bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 transition-colors"
          >
            View Entry
          </Link>
        </div>
      )}

      {/* Upload Zone & Template Card */}
      <TeacherCard>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-[#EEF2F6]">
          <div>
            <h3 className="text-base font-bold text-[#102A56]">Upload Spreadsheet File</h3>
            <p className="text-xs text-[#64748B]">Download the formatted template, enter marks, and upload.</p>
          </div>

          <button
            onClick={() => alert('Downloaded template: marks_template_2026.xlsx')}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-sky-50 text-[#0284C7] hover:bg-sky-100 text-xs font-semibold transition-colors cursor-pointer border border-sky-100"
          >
            <Download className="w-4 h-4" />
            <span>Download CSV Template</span>
          </button>
        </div>

        {/* Dropzone */}
        <div
          onClick={handleSimulatedUpload}
          className="mt-5 border-2 border-dashed border-sky-200 hover:border-[#2563EB] rounded-[22px] p-8 text-center bg-sky-50/30 hover:bg-sky-50/60 transition-all cursor-pointer"
        >
          <div className="w-14 h-14 rounded-full bg-white text-[#2563EB] flex items-center justify-center mx-auto shadow-xs border border-sky-100 mb-3">
            <UploadCloud className="w-7 h-7 stroke-[1.8]" />
          </div>
          <p className="text-sm font-bold text-[#102A56]">
            {fileUploaded ? fileName : 'Click to select file or drag & drop here'}
          </p>
          <p className="text-xs text-[#64748B] mt-1">
            Supports .xlsx and .csv files up to 10MB
          </p>
        </div>
      </TeacherCard>

      {/* Preview Table & Validation Breakdown */}
      {fileUploaded && (
        <TeacherCard>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#EEF2F6]">
            <div>
              <h3 className="text-base font-bold text-[#102A56]">File Verification Preview</h3>
              <p className="text-xs text-[#64748B]">Verify data integrity before applying records to database</p>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                4 Valid Rows
              </span>
              <span className="text-xs font-semibold text-rose-700 bg-rose-50 px-2.5 py-1 rounded-full border border-rose-200">
                1 Error
              </span>
            </div>
          </div>

          <div className="overflow-x-auto mt-2">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-[#EEF2F6] text-[11px] font-bold text-[#64748B] uppercase tracking-wider">
                  <th className="py-3 px-3 text-left w-16">Roll</th>
                  <th className="py-3 px-3 text-left">Student Name</th>
                  <th className="py-3 px-3 text-center w-28">Marks</th>
                  <th className="py-3 px-3 text-left">Validation Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F1F5F9] text-xs">
                {previewRecords.map((r, idx) => (
                  <tr key={idx} className={r.status === 'INVALID' ? 'bg-rose-50/40' : 'hover:bg-slate-50/50'}>
                    <td className="py-3.5 px-3 font-mono font-bold text-[#102A56]">#{r.roll}</td>
                    <td className="py-3.5 px-3 font-semibold text-[#102A56]">{r.name}</td>
                    <td className="py-3.5 px-3 text-center font-bold text-[#102A56]">{r.marks}</td>
                    <td className="py-3.5 px-3">
                      {r.status === 'VALID' ? (
                        <span className="inline-flex items-center gap-1 font-semibold text-emerald-700">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          Valid
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 font-semibold text-rose-700">
                          <XCircle className="w-3.5 h-3.5 text-rose-600" />
                          {r.error}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="pt-5 mt-4 border-t border-[#EEF2F6] flex justify-end gap-3">
            <button
              onClick={() => setFileUploaded(false)}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-[#102A56] transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirmImport}
              disabled={isProcessing}
              className="px-6 py-2 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>{isProcessing ? 'Importing...' : 'Confirm & Import Valid Records'}</span>
            </button>
          </div>
        </TeacherCard>
      )}
    </div>
  );
}
