'use client';

import React, { useState } from 'react';
import { HelpCircle, ChevronDown, Mail, Phone, BookOpen, Download, FileText } from 'lucide-react';
import PortalPageHeader from '../PortalPageHeader';

interface HelpSupportScreenProps {
  onBackToDashboard: () => void;
}

const FAQS = [
  { q: 'How do I download my official Term Report Card?', a: 'Navigate to "Report Card" under the Exams & Results section in the left sidebar, and click the blue "Download PDF" button at the top of the screen.' },
  { q: 'What is the passing criteria and minimum attendance requirement?', a: 'CBSE mandates minimum 75% attendance across all subjects to be eligible for board examinations. A minimum score of 33% is required in each scholastic subject.' },
  { q: 'How do I submit an application for student sick leave?', a: 'Click the "Apply Leave" circular action on the main Dashboard or under Attendance. Provide the leave duration, reason, and guardian contact details.' },
  { q: 'Where do I find the fee payment receipts for income tax proof?', a: 'Visit "Payment History" under Fees & Payments in the sidebar. Click "Receipt" beside any completed transaction to download the verified invoice.' },
  { q: 'How do I schedule an appointment with my Class Mentor or Principal?', a: 'Go to "Know Your Authorities" under Communication & Support. Click "Request Consultation Appointment" on the respective authority card.' },
];

export default function HelpSupportScreen({
  onBackToDashboard,
}: HelpSupportScreenProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="space-y-6">
      <PortalPageHeader
        title="Help & Support"
        subtitle="Frequently asked questions, portal navigation guide, and IT assistance desk"
        onBackToDashboard={onBackToDashboard}
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* FAQs (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-[22px] shadow-[0_4px_20px_rgba(0,100,200,0.06)] border border-blue-50/80 p-6 sm:p-7 space-y-4">
          <div className="flex items-center gap-2 text-slate-900 font-bold text-base border-b border-slate-100 pb-3">
            <HelpCircle className="w-5 h-5 text-blue-600" />
            <span>Frequently Asked Questions</span>
          </div>

          <div className="space-y-3">
            {FAQS.map((faq, idx) => {
              const isOpen = openIndex === idx;

              return (
                <div
                  key={idx}
                  className="rounded-xl border border-slate-100 overflow-hidden transition-colors"
                >
                  <button
                    type="button"
                    onClick={() => setOpenIndex(isOpen ? null : idx)}
                    className="w-full p-4 text-left flex items-center justify-between gap-3 bg-slate-50/60 hover:bg-slate-50 transition-colors"
                  >
                    <span className="text-xs font-bold text-slate-800 leading-snug">{faq.q}</span>
                    <ChevronDown
                      className={`w-4 h-4 text-slate-400 shrink-0 transition-transform ${
                        isOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="p-4 bg-white text-xs text-slate-600 leading-relaxed border-t border-slate-100">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Contact Help Desk (5 cols) */}
        <div className="lg:col-span-5 space-y-5">
          <div className="bg-white rounded-[22px] shadow-[0_4px_20px_rgba(0,100,200,0.06)] border border-blue-50/80 p-6 space-y-4">
            <h3 className="text-sm font-bold text-slate-900">Student Portal Helpdesk</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              If you experience technical issues accessing schedules, results, or online payments, reach out to the school IT cell.
            </p>

            <div className="pt-2 space-y-2.5 text-xs text-slate-700">
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-blue-600 shrink-0" />
                <a href="mailto:support@sunrisepublic.edu.in" className="hover:text-blue-600 font-medium">
                  support@sunrisepublic.edu.in
                </a>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-blue-600 shrink-0" />
                <span className="font-medium">+91 11 2345 6780 (Ext: 204)</span>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 text-[11px] text-slate-400">
              Helpdesk Hours: Monday – Saturday, 08:00 AM – 04:30 PM
            </div>
          </div>

          <div className="bg-white rounded-[22px] shadow-[0_4px_20px_rgba(0,100,200,0.06)] border border-blue-50/80 p-6 space-y-3">
            <h4 className="text-sm font-bold text-slate-900">Download Manuals</h4>
            <button
              type="button"
              onClick={() => alert('Student Portal Handbook downloaded.')}
              className="w-full flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 text-xs font-semibold text-slate-700 transition-colors"
            >
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-blue-600" />
                <span>Student Portal User Guide (PDF)</span>
              </div>
              <Download className="w-4 h-4 text-slate-400" />
            </button>
            <button
              type="button"
              onClick={() => alert('CBSE Code of Conduct PDF downloaded.')}
              className="w-full flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 text-xs font-semibold text-slate-700 transition-colors"
            >
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-600" />
                <span>CBSE Examination Handbook</span>
              </div>
              <Download className="w-4 h-4 text-slate-400" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
