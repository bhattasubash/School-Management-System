'use client';

import React, { useState } from 'react';
import { X, Calendar, CheckCircle2, Clock, Send, ShieldAlert } from 'lucide-react';

interface LeaveRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  studentName: string;
  className: string;
  sectionName: string;
}

export default function LeaveRequestModal({
  isOpen,
  onClose,
  studentName,
  className,
  sectionName,
}: LeaveRequestModalProps) {
  const [leaveType, setLeaveType] = useState('Medical / Sick Leave');
  const [startDate, setStartDate] = useState(
    new Date(Date.now() + 86400000).toISOString().split('T')[0]
  );
  const [endDate, setEndDate] = useState(
    new Date(Date.now() + 86400000).toISOString().split('T')[0]
  );
  const [reason, setReason] = useState('');
  const [guardianPhone, setGuardianPhone] = useState('+91 98112 34567');
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) return;
    setIsSuccess(true);
    setTimeout(() => {
      setIsSuccess(false);
      onClose();
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-lg bg-white rounded-[24px] shadow-2xl border border-slate-100 p-6 sm:p-7 space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-base font-bold text-slate-900">Apply for Student Leave</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              {studentName} (Class {className}-{sectionName})
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {isSuccess ? (
          <div className="py-8 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h4 className="text-lg font-bold text-slate-900">Leave Application Submitted!</h4>
            <p className="text-xs text-slate-500 max-w-xs mx-auto">
              Your class mentor (Mrs. Shalini Roy) and attendance coordinator have been notified.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                Category of Leave
              </label>
              <select
                value={leaveType}
                onChange={(e) => setLeaveType(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white focus:border-[#2563EB] outline-none"
              >
                <option>Medical / Sick Leave</option>
                <option>Family Emergency / Bereavement</option>
                <option>Sanctioned Academic / Sports Representation</option>
                <option>Religious / Festival Observance</option>
                <option>Prior Planned Absence</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                  Start Date
                </label>
                <input
                  type="date"
                  required
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-[#2563EB] outline-none"
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                  End Date
                </label>
                <input
                  type="date"
                  required
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-[#2563EB] outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                Reason / Detailed Explanation
              </label>
              <textarea
                required
                rows={3}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="State the reason for absence..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-[#2563EB] focus:ring-2 focus:ring-blue-100 outline-none resize-none"
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                Parent / Guardian Contact Phone
              </label>
              <input
                type="tel"
                required
                value={guardianPhone}
                onChange={(e) => setGuardianPhone(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-[#2563EB] outline-none"
              />
            </div>

            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-semibold shadow-xs"
              >
                <Send className="w-4 h-4" />
                <span>Submit Leave Application</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
