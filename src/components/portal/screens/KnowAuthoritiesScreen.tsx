'use client';

import React from 'react';
import { Mail, Phone, Calendar, ShieldCheck, User } from 'lucide-react';
import PortalPageHeader from '../PortalPageHeader';

interface KnowAuthoritiesScreenProps {
  faculty: Array<{
    id?: string;
    roleBadge: string;
    name: string;
    designation: string;
    department: string;
    email: string;
    phone: string;
  }>;
  onBackToDashboard: () => void;
  onBookAppointment: (person: any) => void;
}

export default function KnowAuthoritiesScreen({
  faculty,
  onBackToDashboard,
  onBookAppointment,
}: KnowAuthoritiesScreenProps) {
  return (
    <div className="space-y-6">
      <PortalPageHeader
        title="Know Your Authorities"
        subtitle="Directory of school leadership, academic supervisors, department heads, and class mentors"
        onBackToDashboard={onBackToDashboard}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {faculty.map((person, idx) => (
          <div
            key={idx}
            className="bg-white rounded-[22px] shadow-[0_4px_20px_rgba(0,100,200,0.06)] border border-blue-50/80 p-6 flex flex-col justify-between space-y-5 hover:border-blue-200 transition-all"
          >
            <div>
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3.5">
                  <div className="w-14 h-14 rounded-2xl bg-blue-50 text-[#2563EB] flex items-center justify-center font-bold text-lg border border-blue-100 shrink-0">
                    {person.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900 leading-tight">
                      {person.name}
                    </h3>
                    <p className="text-xs text-blue-600 font-semibold mt-0.5">
                      {person.designation}
                    </p>
                    <span className="text-[10px] text-slate-400 block mt-0.5 font-medium">
                      {person.department}
                    </span>
                  </div>
                </div>

                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 uppercase tracking-wider shrink-0">
                  {person.roleBadge}
                </span>
              </div>

              <div className="mt-4 pt-4 border-t border-slate-100 space-y-2 text-xs text-slate-600">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                  <a href={`mailto:${person.email}`} className="hover:text-blue-600 transition-colors">
                    {person.email}
                  </a>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                  <span>{person.phone}</span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => onBookAppointment(person)}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-[#2563EB] text-xs font-semibold transition-colors border border-blue-200/60"
            >
              <Calendar className="w-4 h-4" />
              <span>Request Consultation Appointment</span>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
