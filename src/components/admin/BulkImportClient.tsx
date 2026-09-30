'use client';

import React, { useState, useTransition } from 'react';
import * as XLSX from 'xlsx';
import {
  UploadCloud,
  Download,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  Users,
  GraduationCap,
  Loader2,
  RefreshCw,
  Info,
} from 'lucide-react';
import {
  DataCard,
  PageHeader,
  FileUpload,
  MetricTile,
  StatusBadge,
} from '@/components/ui';
import {
  generateStudentTemplateAction,
  generateTeacherTemplateAction,
  importStudentsBatchAction,
  importTeachersBatchAction,
} from '@/actions/admin';

type ImportType = 'STUDENTS' | 'TEACHERS';

interface ParsedRow {
  rowNumber: number;
  data: Record<string, any>;
  isValid: boolean;
  errors: string[];
}

export default function BulkImportClient() {
  const [importType, setImportType] = useState<ImportType>('STUDENTS');
  const [file, setFile] = useState<File | null>(null);
  const [parsedRows, setParsedRows] = useState<ParsedRow[]>([]);
  const [isParsing, setIsParsing] = useState(false);
  const [isPending, startTransition] = useTransition();

  const [importResults, setImportResults] = useState<{
    total: number;
    imported: number;
    skipped: number;
    errors: Array<{ row: number; identifier: string; reason: string }>;
  } | null>(null);

  // 1. Download Template
  const handleDownloadTemplate = async () => {
    const res =
      importType === 'STUDENTS'
        ? await generateStudentTemplateAction()
        : await generateTeacherTemplateAction();

    if (res.success && res.base64 && res.fileName) {
      const link = document.createElement('a');
      link.href = `data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64,${res.base64}`;
      link.download = res.fileName;
      link.click();
    } else {
      alert(res.error || 'Failed to download template.');
    }
  };

  // 2. Parse uploaded file with SheetJS
  const handleFileSelect = (selectedFile: File) => {
    setFile(selectedFile);
    setImportResults(null);
    setIsParsing(true);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const rawJson: Record<string, any>[] = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

        const validated: ParsedRow[] = rawJson.map((row, index) => {
          const errors: string[] = [];

          if (importType === 'STUDENTS') {
            const adm = String(row['Admission Number'] || row.admissionNumber || '').trim();
            const first = String(row['First Name'] || row.firstName || '').trim();
            const last = String(row['Last Name'] || row.lastName || '').trim();
            const email = String(row['Email'] || row.email || '').trim();
            const cls = String(row['Class'] || row.className || '').trim();
            const sec = String(row['Section'] || row.sectionName || '').trim();

            if (!adm) errors.push('Missing Admission Number');
            if (!first) errors.push('Missing First Name');
            if (!last) errors.push('Missing Last Name');
            if (!email || !email.includes('@')) errors.push('Invalid/Missing Email');
            if (!cls) errors.push('Missing Class');
            if (!sec) errors.push('Missing Section');
          } else {
            const empId = String(row['Employee ID'] || row.employeeId || '').trim();
            const first = String(row['First Name'] || row.firstName || '').trim();
            const last = String(row['Last Name'] || row.lastName || '').trim();
            const email = String(row['Email'] || row.email || '').trim();

            if (!empId) errors.push('Missing Employee ID');
            if (!first) errors.push('Missing First Name');
            if (!last) errors.push('Missing Last Name');
            if (!email || !email.includes('@')) errors.push('Invalid/Missing Email');
          }

          return {
            rowNumber: index + 2, // header is row 1
            data: row,
            isValid: errors.length === 0,
            errors,
          };
        });

        setParsedRows(validated);
      } catch (err: any) {
        alert('Failed to parse spreadsheet file: ' + err.message);
      } finally {
        setIsParsing(false);
      }
    };

    reader.readAsBinaryString(selectedFile);
  };

  const handleClear = () => {
    setFile(null);
    setParsedRows([]);
    setImportResults(null);
  };

  // 3. Confirm and Batch Import Valid Records
  const handleExecuteImport = () => {
    const validRows = parsedRows.filter((r) => r.isValid).map((r) => r.data);
    if (validRows.length === 0) return;

    startTransition(async () => {
      const res =
        importType === 'STUDENTS'
          ? await importStudentsBatchAction(validRows)
          : await importTeachersBatchAction(validRows);

      if (res.success && res.results) {
        setImportResults(res.results);
      } else {
        alert(res.error || 'Bulk import failed.');
      }
    });
  };

  const validCount = parsedRows.filter((r) => r.isValid).length;
  const invalidCount = parsedRows.length - validCount;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Bulk Data Intake & Enrollment"
        subtitle="Upload institution-wide rosters from Microsoft Excel (.xlsx) or CSV files with pre-import schema validation."
        breadcrumbs={[
          { label: 'Admin', href: '/admin' },
          { label: 'Bulk Import' },
        ]}
      />

      {/* Import Type Switcher */}
      <div className="flex border-b border-brand-border gap-2">
        <button
          onClick={() => {
            setImportType('STUDENTS');
            handleClear();
          }}
          className={`pb-3 px-4 font-semibold text-body-primary border-b-2 flex items-center gap-2 transition-all ${
            importType === 'STUDENTS'
              ? 'border-brand-primary text-brand-primary'
              : 'border-transparent text-brand-muted hover:text-brand-dark'
          }`}
        >
          <Users className="w-4 h-4" />
          Student Roster Intake
        </button>
        <button
          onClick={() => {
            setImportType('TEACHERS');
            handleClear();
          }}
          className={`pb-3 px-4 font-semibold text-body-primary border-b-2 flex items-center gap-2 transition-all ${
            importType === 'TEACHERS'
              ? 'border-brand-primary text-brand-primary'
              : 'border-transparent text-brand-muted hover:text-brand-dark'
          }`}
        >
          <GraduationCap className="w-4 h-4" />
          Faculty & Staff Intake
        </button>
      </div>

      {/* Instructions & Template Download */}
      <DataCard>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-light text-brand-primary flex items-center justify-center shrink-0">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-section-header text-brand-dark">
                {importType === 'STUDENTS' ? 'Student Enrollment Template' : 'Staff Intake Template'}
              </h3>
              <p className="text-caption text-brand-muted mt-0.5">
                Download the formatted Excel template with standardized column headers before uploading.
              </p>
            </div>
          </div>

          <button
            onClick={handleDownloadTemplate}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-brand-subtle hover:bg-brand-primary hover:text-white text-brand-dark text-body-primary font-semibold border border-brand-border transition-all"
          >
            <Download className="w-4 h-4" />
            Download Blank Template
          </button>
        </div>
      </DataCard>

      {/* File Upload Dropzone */}
      <DataCard>
        <h3 className="text-section-header text-brand-dark mb-3">Upload Completed Spreadsheet</h3>
        <FileUpload
          accept=".xlsx,.csv,.xls"
          maxSizeMB={15}
          onFileSelect={handleFileSelect}
          onClear={handleClear}
          currentFileName={file?.name}
        />
      </DataCard>

      {/* Validation Summary Metrics */}
      {parsedRows.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <MetricTile
            title="Total Detected Rows"
            value={parsedRows.length}
            icon={FileSpreadsheet}
            variant="blue"
          />
          <MetricTile
            title="Ready for Import"
            value={validCount}
            icon={CheckCircle2}
            variant="green"
          />
          <MetricTile
            title="Validation Errors"
            value={invalidCount}
            icon={AlertCircle}
            variant={invalidCount > 0 ? 'amber' : 'primary'}
          />
        </div>
      )}

      {/* Results View after Import */}
      {importResults && (
        <DataCard className="bg-emerald-50/50 border border-emerald-200">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0 mt-0.5" />
            <div className="space-y-2 flex-1">
              <h3 className="text-section-header text-emerald-900">Intake Process Completed</h3>
              <p className="text-body-primary text-emerald-800">
                Successfully registered <span className="font-bold">{importResults.imported}</span> records.
                {importResults.skipped > 0 && (
                  <span>
                    {' '}
                    <span className="font-bold text-amber-700">{importResults.skipped}</span> records were skipped
                    due to pre-existing identifiers or validation mismatches.
                  </span>
                )}
              </p>

              {importResults.errors.length > 0 && (
                <div className="mt-3 bg-white rounded-lg p-3 border border-emerald-200 max-h-48 overflow-y-auto">
                  <p className="text-caption font-semibold text-brand-dark mb-1.5">Skipped Row Details:</p>
                  <ul className="text-caption text-brand-muted space-y-1">
                    {importResults.errors.map((err, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <span className="text-amber-600 font-bold">Row {err.row}:</span>
                        <span>{err.identifier} —</span>
                        <span className="text-red-600">{err.reason}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </DataCard>
      )}

      {/* Preview Table of Rows */}
      {parsedRows.length > 0 && !importResults && (
        <DataCard>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <div>
              <h3 className="text-section-header text-brand-dark">Spreadsheet Preview & Pre-Flight Check</h3>
              <p className="text-caption text-brand-muted">
                Review verified entries. Only rows marked valid will be committed to the database.
              </p>
            </div>

            <button
              onClick={handleExecuteImport}
              disabled={validCount === 0 || isPending}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-brand-primary text-white text-body-primary font-semibold hover:bg-brand-hover transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-xs"
            >
              {isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Committing {validCount} Records...</span>
                </>
              ) : (
                <>
                  <UploadCloud className="w-4 h-4" />
                  <span>Import {validCount} Valid Records</span>
                </>
              )}
            </button>
          </div>

          <div className="overflow-x-auto border border-brand-border rounded-lg">
            <table className="w-full text-left text-body-primary">
              <thead className="bg-brand-subtle text-caption font-semibold text-brand-muted uppercase tracking-wider border-b border-brand-border">
                <tr>
                  <th className="px-3 py-2.5">Row</th>
                  <th className="px-3 py-2.5">Status</th>
                  <th className="px-3 py-2.5">Identifier</th>
                  <th className="px-3 py-2.5">Name</th>
                  <th className="px-3 py-2.5">Email</th>
                  {importType === 'STUDENTS' ? (
                    <th className="px-3 py-2.5">Class & Section</th>
                  ) : (
                    <th className="px-3 py-2.5">Department</th>
                  )}
                  <th className="px-3 py-2.5">Validation Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-border">
                {parsedRows.slice(0, 50).map((row) => {
                  const identifier =
                    importType === 'STUDENTS'
                      ? row.data['Admission Number'] || row.data.admissionNumber || '-'
                      : row.data['Employee ID'] || row.data.employeeId || '-';

                  const name = `${row.data['First Name'] || row.data.firstName || ''} ${
                    row.data['Last Name'] || row.data.lastName || ''
                  }`.trim();

                  return (
                    <tr
                      key={row.rowNumber}
                      className={row.isValid ? 'hover:bg-brand-subtle/50' : 'bg-red-50/40 hover:bg-red-50/60'}
                    >
                      <td className="px-3 py-2 font-mono text-caption text-brand-muted">{row.rowNumber}</td>
                      <td className="px-3 py-2">
                        {row.isValid ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                            <CheckCircle2 className="w-3 h-3" /> Valid
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-red-700 bg-red-100 px-2 py-0.5 rounded-full">
                            <AlertCircle className="w-3 h-3" /> Error
                          </span>
                        )}
                      </td>
                      <td className="px-3 py-2 font-semibold text-brand-dark">{identifier}</td>
                      <td className="px-3 py-2 text-brand-dark">{name || '-'}</td>
                      <td className="px-3 py-2 text-brand-muted">{row.data['Email'] || row.data.email || '-'}</td>
                      <td className="px-3 py-2 text-brand-dark">
                        {importType === 'STUDENTS'
                          ? `${row.data['Class'] || ''} - ${row.data['Section'] || ''}`
                          : row.data['Department'] || '-'}
                      </td>
                      <td className="px-3 py-2 text-caption">
                        {row.isValid ? (
                          <span className="text-emerald-700 font-medium">Ready</span>
                        ) : (
                          <span className="text-red-600 font-semibold">{row.errors.join('; ')}</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {parsedRows.length > 50 && (
            <p className="text-caption text-brand-muted text-center mt-3">
              Showing first 50 rows of {parsedRows.length} total rows.
            </p>
          )}
        </DataCard>
      )}
    </div>
  );
}
