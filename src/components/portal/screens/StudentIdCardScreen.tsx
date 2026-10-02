'use client';

import React from 'react';
import { Download, Printer, ShieldCheck, QrCode } from 'lucide-react';
import SchoolLogo from '../SchoolLogo';
import PortalPageHeader from '../PortalPageHeader';

interface StudentIdCardScreenProps {
  student: {
    name: string;
    className: string;
    sectionName: string;
    rollNumber: number | null;
    admissionNumber: string;
    board: string;
    batchYear: string;
    avatarUrl?: string | null;
  };
  onBackToDashboard: () => void;
}

export default function StudentIdCardScreen({
  student,
  onBackToDashboard,
}: StudentIdCardScreenProps) {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      <PortalPageHeader
        title="Student ID Card"
        subtitle="Official Digital Identification Card for Campus Access and Library Services"
        onBackToDashboard={onBackToDashboard}
      >
        <button
          type="button"
          onClick={handlePrint}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-xs transition-colors"
        >
          <Printer className="w-4 h-4 text-slate-500" />
          <span>Print Card</span>
        </button>
        <button
          type="button"
          onClick={() => alert('Official ID Card PDF downloaded.')}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-semibold shadow-xs transition-colors"
        >
          <Download className="w-4 h-4" />
          <span>Download PDF</span>
        </button>
      </PortalPageHeader>

      <div className="flex flex-col lg:flex-row items-start justify-center gap-8 py-4">
        {/* Physical-style ID Card Card */}
        <div className="w-full max-w-md bg-white rounded-[24px] shadow-[0_10px_35px_rgba(0,100,200,0.12)] border border-blue-100 overflow-hidden relative">
          {/* Card Top Decorative Bar */}
          <div className="h-3 bg-gradient-to-r from-[#00A3FF] via-[#2563EB] to-[#1D4ED8]" />

          {/* School Header */}
          <div className="px-6 pt-5 pb-3 flex items-center justify-between border-b border-slate-100">
            <div className="flex items-center gap-3">
              <SchoolLogo size={38} />
              <div>
                <h2 className="text-sm font-bold text-slate-900 leading-tight">
                  Sunrise Public School
                </h2>
                <p className="text-[10px] text-slate-500 font-medium">
                  CBSE Affiliated No. 1030482 • New Delhi
                </p>
              </div>
            </div>
            <span className="text-[10px] font-bold text-[#2563EB] bg-blue-50 px-2 py-0.5 rounded-full uppercase tracking-wider">
              Student
            </span>
          </div>

          {/* Card Body */}
          <div className="p-6 space-y-5">
            {/* Student Photo & Core Tag */}
            <div className="flex flex-col items-center text-center">
              <div className="w-28 h-28 rounded-full border-4 border-[#2563EB] overflow-hidden bg-sky-50 shadow-md">
                <img
                  src={student.avatarUrl || '/images/dashboard/ref_avatar.png'}
                  alt={student.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/images/dashboard/ref_avatar.png';
                  }}
                />
              </div>

              <h3 className="text-xl font-bold text-slate-900 mt-3">{student.name}</h3>
              <p className="text-xs font-semibold text-[#2563EB]">
                Class {student.className} - {student.sectionName}
              </p>
            </div>

            {/* Details Grid */}
            <div className="bg-slate-50/80 rounded-2xl p-4 border border-slate-100 grid grid-cols-2 gap-y-3 gap-x-4 text-xs">
              <div>
                <span className="text-[11px] text-slate-400 font-medium block">Roll Number</span>
                <span className="font-bold text-slate-800">{student.rollNumber || 27}</span>
              </div>
              <div>
                <span className="text-[11px] text-slate-400 font-medium block">Admission No.</span>
                <span className="font-bold text-slate-800">{student.admissionNumber || 'SPS-2026-0428'}</span>
              </div>
              <div>
                <span className="text-[11px] text-slate-400 font-medium block">Academic Year</span>
                <span className="font-semibold text-slate-800">2026 - 2027</span>
              </div>
              <div>
                <span className="text-[11px] text-slate-400 font-medium block">Blood Group</span>
                <span className="font-bold text-rose-600">B+ Positive</span>
              </div>
              <div>
                <span className="text-[11px] text-slate-400 font-medium block">Board</span>
                <span className="font-semibold text-slate-800">{student.board || 'CBSE'}</span>
              </div>
              <div>
                <span className="text-[11px] text-slate-400 font-medium block">Emergency Phone</span>
                <span className="font-semibold text-slate-800">+91 98112 34567</span>
              </div>
            </div>

            {/* Card Barcode / QR Section */}
            <div className="pt-2 flex items-center justify-between border-t border-slate-100">
              <div className="flex items-center gap-2">
                <QrCode className="w-10 h-10 text-slate-700" />
                <div className="text-[10px] text-slate-400">
                  <span>Smart RFID ID</span>
                  <br />
                  <span className="font-mono text-slate-600 font-semibold">2026-X-27-0428</span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-slate-400 block">Principal Signature</span>
                <span className="font-serif italic text-xs text-slate-700 font-bold">A. Sen</span>
              </div>
            </div>
          </div>

          {/* Bottom Security Strip */}
          <div className="bg-slate-900 text-white px-6 py-2.5 flex items-center justify-between text-[11px]">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Valid through March 31, 2027</span>
            </div>
            <span className="text-slate-400 text-[10px]">Property of Sunrise Public School</span>
          </div>
        </div>

        {/* Verification and Instructions Card */}
        <div className="w-full max-w-md space-y-4">
          <div className="bg-white rounded-[22px] shadow-[0_4px_20px_rgba(0,100,200,0.06)] border border-blue-50/80 p-6 space-y-4">
            <h4 className="text-sm font-bold text-slate-900">Digital ID Card Guidelines</h4>
            <ul className="text-xs text-slate-600 space-y-2.5">
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-1.5 shrink-0" />
                <span>
                  This digital ID is an official credential recognized across campus gates, library checkouts, and laboratory access.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-1.5 shrink-0" />
                <span>
                  Students must carry either the physical smart card or display this digital verification on campus.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-1.5 shrink-0" />
                <span>
                  To report a lost physical ID card, please submit a request via the <strong>Grievance / Feedback</strong> section.
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
