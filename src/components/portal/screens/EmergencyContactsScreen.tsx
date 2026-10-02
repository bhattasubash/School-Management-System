'use client';

import React from 'react';
import { PhoneCall, ShieldAlert, HeartPulse, LifeBuoy, AlertCircle } from 'lucide-react';
import PortalPageHeader from '../PortalPageHeader';

interface EmergencyContactsScreenProps {
  onBackToDashboard: () => void;
}

const EMERGENCY_CONTACTS = [
  { name: 'School Infirmary & Medical Room', icon: HeartPulse, phone: '+91 11 2345 6701', location: 'Ground Floor, Admin Block (Room 102)', hours: '07:30 AM - 04:30 PM', person: 'Dr. Neha Kapoor (Medical Officer)', badge: 'Medical', color: 'rose' },
  { name: 'Campus Safety & Chief Security Officer', icon: ShieldAlert, phone: '+91 98112 99001', location: 'Main Campus Gate 1 & 2', hours: '24 Hours / 7 Days', person: 'Mr. Vikram Rathore (Security Head)', badge: 'Security', color: 'blue' },
  { name: 'Anti-Bullying & POCSO Student Welfare Cell', icon: AlertCircle, phone: '+91 98223 11002', location: 'Welfare Centre, Library Wing', hours: '08:00 AM - 04:00 PM', person: 'Mrs. Ananya Sen (Counsellor)', badge: 'Welfare', color: 'purple' },
  { name: 'Emergency Ambulance & First Responder Desk', icon: HeartPulse, phone: '+91 11 2345 6799', location: 'Medical Bay Parking Bay 1', hours: '24 Hours On-Call', person: 'Campus Emergency Dispatch', badge: 'Critical', color: 'rose' },
  { name: 'Student Academic & Transport Helpdesk', icon: LifeBuoy, phone: '+91 11 2345 6780', location: 'Central Reception, Main Foyer', hours: '08:00 AM - 05:00 PM', person: 'Helpdesk Duty Officer', badge: 'Support', color: 'blue' },
];

export default function EmergencyContactsScreen({
  onBackToDashboard,
}: EmergencyContactsScreenProps) {
  return (
    <div className="space-y-6">
      <PortalPageHeader
        title="Emergency Contacts"
        subtitle="Immediate campus medical assistance, security dispatch, child welfare, and safety contacts"
        onBackToDashboard={onBackToDashboard}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {EMERGENCY_CONTACTS.map((item, idx) => {
          const Icon = item.icon;

          return (
            <div
              key={idx}
              className="bg-white rounded-[22px] shadow-[0_4px_20px_rgba(0,100,200,0.06)] border border-blue-50/80 p-6 flex flex-col justify-between space-y-4 hover:border-blue-200 transition-all"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span
                    className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                      item.color === 'rose'
                        ? 'bg-rose-50 text-rose-700 border border-rose-200'
                        : item.color === 'purple'
                        ? 'bg-purple-50 text-purple-700 border border-purple-200'
                        : 'bg-blue-50 text-blue-700 border border-blue-200'
                    }`}
                  >
                    {item.badge}
                  </span>
                  <span className="text-[11px] text-slate-400 font-medium">{item.hours}</span>
                </div>

                <div className="flex items-center gap-3 mt-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-700 shrink-0">
                    <Icon className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900 leading-tight">
                      {item.name}
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">{item.person}</p>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 text-xs text-slate-600 space-y-1">
                  <p>
                    <span className="text-slate-400 font-medium">Campus Location:</span> {item.location}
                  </p>
                </div>
              </div>

              <div className="pt-2">
                <a
                  href={`tel:${item.phone.replace(/\s+/g, '')}`}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors shadow-xs"
                >
                  <PhoneCall className="w-4 h-4 text-emerald-400" />
                  <span>Call {item.phone}</span>
                </a>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
