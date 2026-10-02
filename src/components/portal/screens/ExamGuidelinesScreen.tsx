'use client';

import React from 'react';
import { ShieldAlert, CheckCircle2, XCircle, Clock, AlertTriangle } from 'lucide-react';
import PortalPageHeader from '../PortalPageHeader';

interface ExamGuidelinesScreenProps {
  onBackToDashboard: () => void;
  onSelectNav: (id: string) => void;
}

export default function ExamGuidelinesScreen({
  onBackToDashboard,
  onSelectNav,
}: ExamGuidelinesScreenProps) {
  return (
    <div className="space-y-6">
      <PortalPageHeader
        title="Exam Guidelines"
        subtitle="Official code of conduct, instructions, reporting regulations, and prohibited items"
        onBackToDashboard={onBackToDashboard}
      >
        <button
          type="button"
          onClick={() => onSelectNav('exam-datesheet')}
          className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-xs transition-colors"
        >
          View Exam Date Sheet
        </button>
      </PortalPageHeader>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Permitted / Mandatory Items */}
        <div className="bg-white rounded-[22px] shadow-[0_4px_20px_rgba(0,100,200,0.06)] border border-blue-50/80 p-6 space-y-4">
          <div className="flex items-center gap-2.5 text-emerald-700 font-bold text-base">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <span>Permitted & Mandatory Items</span>
          </div>

          <ul className="text-xs text-slate-600 space-y-3">
            <li className="flex items-start gap-2.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
              <span>
                <strong>Original Printed Admit Card:</strong> Signed by student and parent/guardian.
              </span>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
              <span>
                <strong>School Digital or Physical ID Card:</strong> Mandatory for invigilator biometric verification.
              </span>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
              <span>
                <strong>Transparent Stationery Pouch:</strong> Blue/royal blue ballpoint pens, HB pencils, eraser, sharpener, and geometry compass/ruler.
              </span>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
              <span>
                <strong>Transparent Water Bottle:</strong> Clear unlabelled water bottle allowed inside examination hall.
              </span>
            </li>
          </ul>
        </div>

        {/* Prohibited Items */}
        <div className="bg-white rounded-[22px] shadow-[0_4px_20px_rgba(0,100,200,0.06)] border border-blue-50/80 p-6 space-y-4">
          <div className="flex items-center gap-2.5 text-rose-700 font-bold text-base">
            <XCircle className="w-5 h-5 text-rose-600" />
            <span>Strictly Prohibited Items</span>
          </div>

          <ul className="text-xs text-slate-600 space-y-3">
            <li className="flex items-start gap-2.5">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-1.5 shrink-0" />
              <span>
                <strong>Electronic Gadgets:</strong> Mobile phones, smartwatches, fitness bands, earphones, or Bluetooth devices.
              </span>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-1.5 shrink-0" />
              <span>
                <strong>Calculators & Digital Logs:</strong> Not permitted for Class 10 CBSE assessments unless officially stated for specific students with accommodations.
              </span>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-1.5 shrink-0" />
              <span>
                <strong>Unauthorized Paper & Notes:</strong> Any written sheets, blank papers, or textbooks inside the hall.
              </span>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-1.5 shrink-0" />
              <span>
                <strong>Opaque Pencil Cases / Bags:</strong> Must be deposited in the secure cloakroom prior to entering.
              </span>
            </li>
          </ul>
        </div>

        {/* Timing & Reporting Rules */}
        <div className="bg-white rounded-[22px] shadow-[0_4px_20px_rgba(0,100,200,0.06)] border border-blue-50/80 p-6 space-y-4">
          <div className="flex items-center gap-2.5 text-blue-700 font-bold text-base">
            <Clock className="w-5 h-5 text-blue-600" />
            <span>Timings & Entry Protocol</span>
          </div>

          <div className="space-y-2.5 text-xs text-slate-600">
            <p>
              <strong>09:00 AM:</strong> Gate closure for morning exam batch. Late arrival beyond 09:15 AM requires written permission from the Examination Superintendent.
            </p>
            <p>
              <strong>09:15 - 09:30 AM:</strong> Mandatory 15-minute question paper reading time. No writing permitted during this duration.
            </p>
            <p>
              <strong>09:30 AM:</strong> Commencement of writing.
            </p>
            <p>
              <strong>12:30 PM:</strong> Invigilators collect answer booklets. Students must remain seated until all booklets in the room are counted and verified.
            </p>
          </div>
        </div>

        {/* Code of Conduct & Unfair Means (UFM) */}
        <div className="bg-white rounded-[22px] shadow-[0_4px_20px_rgba(0,100,200,0.06)] border border-blue-50/80 p-6 space-y-4">
          <div className="flex items-center gap-2.5 text-amber-700 font-bold text-base">
            <AlertTriangle className="w-5 h-5 text-amber-600" />
            <span>Code of Academic Integrity</span>
          </div>

          <div className="space-y-2.5 text-xs text-slate-600">
            <p>
              Sunrise Public School enforces a strict zero-tolerance policy towards academic dishonesty and unfair means (UFM).
            </p>
            <p>
              Any attempt to communicate, swap question papers, glance at neighboring desks, or possess prohibited items will result in immediate disqualification and disciplinary board referral.
            </p>
            <p className="text-[11px] text-slate-400">
              For special accommodation requests (scribe, extra time for certified medical reasons), submit medical records to the Academic Vice Principal 7 days in advance.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
