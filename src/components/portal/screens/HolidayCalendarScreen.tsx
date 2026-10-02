'use client';

import React from 'react';
import { Sun, Calendar, Download } from 'lucide-react';
import PortalPageHeader from '../PortalPageHeader';

interface HolidayCalendarScreenProps {
  holidays: Array<{
    id: string;
    name: string;
    date: string;
    type: string;
  }>;
  onBackToDashboard: () => void;
}

const ACADEMIC_HOLIDAYS = [
  { date: '02 Oct 2026', day: 'Friday', name: 'Mahatma Gandhi Jayanti', type: 'National Holiday', note: 'Campus closed' },
  { date: '20 Oct 2026', day: 'Tuesday', name: 'Maha Navami / Dussehra', type: 'Gazetted Holiday', note: 'Autumn Festival' },
  { date: '21 Oct 2026', day: 'Wednesday', name: 'Vijaya Dashami', type: 'Gazetted Holiday', note: 'Public Holiday' },
  { date: '12 Nov 2026', day: 'Thursday', name: 'Diwali (Deepavali Break)', type: 'Festival Break', note: 'School closed Nov 12 - Nov 16' },
  { date: '27 Nov 2026', day: 'Friday', name: 'Guru Nanak Jayanti', type: 'Gazetted Holiday', note: 'Public Holiday' },
  { date: '25 Dec 2026', day: 'Friday', name: 'Christmas Day (Winter Break)', type: 'Winter Vacation', note: 'Winter Break Dec 25 - Jan 03' },
  { date: '26 Jan 2027', day: 'Tuesday', name: 'Republic Day Celebration', type: 'National Holiday', note: 'Flag hoisting on campus' },
];

export default function HolidayCalendarScreen({
  holidays,
  onBackToDashboard,
}: HolidayCalendarScreenProps) {
  return (
    <div className="space-y-6">
      <PortalPageHeader
        title="Holiday Calendar"
        subtitle="Official CBSE academic schedule and sanctioned holidays for Session 2026-27"
        onBackToDashboard={onBackToDashboard}
      >
        <button
          type="button"
          onClick={() => alert('Official Academic Holiday List downloaded as PDF.')}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-semibold shadow-xs transition-colors"
        >
          <Download className="w-4 h-4" />
          <span>Download Holiday List</span>
        </button>
      </PortalPageHeader>

      <div className="bg-white rounded-[22px] shadow-[0_4px_20px_rgba(0,100,200,0.06)] border border-blue-50/80 p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2 text-slate-900 font-bold text-base">
            <Sun className="w-5 h-5 text-amber-500" />
            <span>Sanctioned Academic Holidays</span>
          </div>
          <span className="text-xs text-slate-400 font-medium">Session 2026 - 2027</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 font-semibold uppercase text-[10px] tracking-wider">
                <th className="py-3 px-4">Date & Day</th>
                <th className="py-3 px-4">Holiday Observance</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4 text-right">Remarks</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {ACADEMIC_HOLIDAYS.map((h, idx) => (
                <tr key={idx} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3.5 px-4">
                    <span className="font-bold text-slate-900 block">{h.date}</span>
                    <span className="text-[11px] text-slate-400">{h.day}</span>
                  </td>
                  <td className="py-3.5 px-4 font-bold text-slate-800 text-sm">
                    {h.name}
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                        h.type.includes('National')
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : 'bg-purple-50 text-purple-700 border border-purple-200'
                      }`}
                    >
                      {h.type}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right font-medium text-slate-500">
                    {h.note}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
