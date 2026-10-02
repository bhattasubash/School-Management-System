'use client';

import React, { useState } from 'react';
import { X, Calendar, CheckCircle2, Clock, Send, Loader2 } from 'lucide-react';
import { bookAuthorityAppointmentAction } from '@/actions/notifications';

interface AppointmentBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedAuthority: {
    id?: string;
    name: string;
    designation: string;
    department: string;
    roleBadge: string;
  } | null;
}

export default function AppointmentBookingModal({
  isOpen,
  onClose,
  selectedAuthority,
}: AppointmentBookingModalProps) {
  const [date, setDate] = useState(
    new Date(Date.now() + 86400000).toISOString().split('T')[0]
  );
  const [purpose, setPurpose] = useState('');
  const [phone, setPhone] = useState('+91 98112 34567');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ success?: string; error?: string } | null>(null);

  if (!isOpen || !selectedAuthority) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!purpose.trim()) return;

    setIsSubmitting(true);
    setFeedback(null);

    const res = await bookAuthorityAppointmentAction({
      authorityContactId: selectedAuthority.id || '00000000-0000-0000-0000-000000000000',
      authorityName: `${selectedAuthority.name} (${selectedAuthority.designation})`,
      preferredDate: date,
      purpose: purpose.trim(),
      phone: phone.trim() || undefined,
    });

    setIsSubmitting(false);

    if (res.success) {
      setFeedback({ success: 'Appointment consultation request submitted successfully!' });
      setTimeout(() => {
        onClose();
        setFeedback(null);
      }, 2000);
    } else {
      setFeedback({ error: res.error || 'Failed to submit appointment request.' });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-lg bg-white rounded-[24px] shadow-2xl border border-slate-100 p-6 sm:p-7 space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-base font-bold text-slate-900">Request Consultation Appointment</h3>
            <p className="text-xs text-blue-600 font-semibold mt-0.5">
              With {selectedAuthority.name} ({selectedAuthority.designation})
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

        {feedback?.success ? (
          <div className="py-6 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h4 className="text-lg font-bold text-slate-900">Appointment Requested!</h4>
            <p className="text-xs text-slate-500 max-w-xs mx-auto">{feedback.success}</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            {feedback?.error && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700">
                {feedback.error}
              </div>
            )}

            <div>
              <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                Preferred Consultation Date
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-[#2563EB] outline-none"
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                Purpose & Agenda of Meeting
              </label>
              <textarea
                required
                rows={3}
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                placeholder="Briefly state the topic of discussion (e.g. Academic guidance, Subject doubt, Medical accommodation)..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-[#2563EB] focus:ring-2 focus:ring-blue-100 outline-none resize-none"
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                Contact Phone for Confirmation
              </label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
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
                disabled={isSubmitting}
                className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-semibold shadow-xs disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Submitting...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Send Request</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
