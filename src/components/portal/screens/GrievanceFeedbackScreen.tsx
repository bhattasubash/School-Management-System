'use client';

import React, { useState } from 'react';
import { MessageSquarePlus, Send, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import PortalPageHeader from '../PortalPageHeader';

interface GrievanceFeedbackScreenProps {
  onBackToDashboard: () => void;
}

const PAST_TICKETS = [
  { id: 'TKT-2026-891', date: '28 Sep 2026', category: 'Academic', subject: 'Doubt Clearing Session Request for Physics Lab', status: 'In Progress', adminNote: 'Class mentor scheduled doubt clinic on Saturday.' },
  { id: 'TKT-2026-704', date: '12 Sep 2026', category: 'Infrastructure', subject: 'Classroom 204 Projector Screen Repair', status: 'Resolved', adminNote: 'IT maintenance team replaced audio-visual cord.' },
  { id: 'TKT-2026-551', date: '18 Aug 2026', category: 'Transport', subject: 'Bus Route 14 Morning Arrival Timing', status: 'Resolved', adminNote: 'Route schedule adjusted by 10 minutes.' },
];

export default function GrievanceFeedbackScreen({
  onBackToDashboard,
}: GrievanceFeedbackScreenProps) {
  const [category, setCategory] = useState('Academic');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [urgency, setUrgency] = useState('NORMAL');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !description.trim()) return;
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setSubject('');
      setDescription('');
    }, 3500);
  };

  return (
    <div className="space-y-6">
      <PortalPageHeader
        title="Grievance / Feedback"
        subtitle="Submit confidential suggestions, redressal inquiries, and campus feedback to administration"
        onBackToDashboard={onBackToDashboard}
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Form Card (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-[22px] shadow-[0_4px_20px_rgba(0,100,200,0.06)] border border-blue-50/80 p-6 sm:p-7 space-y-5">
          <div>
            <h3 className="text-base font-bold text-slate-900">Submit New Ticket</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Your inquiry is reviewed directly by the Academic Disciplinary & Welfare Board.
            </p>
          </div>

          {submitted && (
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>
                Ticket registered successfully! Reference ID: <strong>TKT-2026-{Date.now().toString().slice(-3)}</strong>
              </span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white focus:border-[#2563EB] outline-none"
              >
                <option>Academic</option>
                <option>Infrastructure & Classroom</option>
                <option>School Transport</option>
                <option>Canteen & Nutrition</option>
                <option>Library & Learning Resources</option>
                <option>General Feedback</option>
              </select>
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                Subject Line
              </label>
              <input
                type="text"
                required
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Brief summary of issue"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-[#2563EB] focus:ring-2 focus:ring-blue-100 outline-none"
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                Description & Details
              </label>
              <textarea
                required
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe your query or suggestion with specific details..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-[#2563EB] focus:ring-2 focus:ring-blue-100 outline-none resize-none"
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                Priority / Urgency
              </label>
              <div className="flex items-center gap-3">
                {['NORMAL', 'IMPORTANT', 'URGENT'].map((lvl) => (
                  <label key={lvl} className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="urgency"
                      checked={urgency === lvl}
                      onChange={() => setUrgency(lvl)}
                      className="text-[#2563EB] focus:ring-blue-500"
                    />
                    <span className="text-xs text-slate-700 capitalize">{lvl.toLowerCase()}</span>
                  </label>
                ))}
              </div>
            </div>

            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold text-xs shadow-xs transition-colors"
            >
              <Send className="w-4 h-4" />
              <span>Submit Ticket</span>
            </button>
          </form>
        </div>

        {/* Tickets History (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-[22px] shadow-[0_4px_20px_rgba(0,100,200,0.06)] border border-blue-50/80 p-6 sm:p-7 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-base font-bold text-slate-900">Your Submitted Tickets</h3>
            <span className="text-xs text-slate-400 font-medium">3 Recorded</span>
          </div>

          <div className="space-y-3">
            {PAST_TICKETS.map((tkt) => (
              <div
                key={tkt.id}
                className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-colors space-y-2 text-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-blue-600">{tkt.id}</span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                      tkt.status === 'Resolved'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}
                  >
                    {tkt.status}
                  </span>
                </div>

                <h4 className="font-bold text-slate-900 text-sm leading-snug">
                  {tkt.subject}
                </h4>

                <div className="flex items-center gap-3 text-[11px] text-slate-400">
                  <span>Category: {tkt.category}</span>
                  <span>•</span>
                  <span>Submitted: {tkt.date}</span>
                </div>

                <div className="pt-2 border-t border-slate-200/60 text-slate-600 bg-white/60 p-2.5 rounded-lg">
                  <span className="font-semibold text-slate-700 block text-[11px]">Administration Note:</span>
                  <p className="text-[11px] mt-0.5">{tkt.adminNote}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
