'use client';

import React, { useState } from 'react';
import {
  CalendarHeart,
  Calendar,
  MapPin,
  Clock,
  Sparkles,
  Palmtree,
  PartyPopper,
  Filter,
} from 'lucide-react';
import { TeacherPageHeader } from '@/components/teacher/TeacherPageHeader';
import { TeacherCard } from '@/components/teacher/TeacherComponents';

export default function EventsAndHolidaysPage() {
  const [activeTab, setActiveTab] = useState<'EVENTS' | 'HOLIDAYS'>('EVENTS');

  const events = [
    {
      id: '1',
      title: 'Annual Science & Robotics Exhibition 2026',
      date: '16 Jan 2026',
      time: '09:30 AM - 03:00 PM',
      venue: 'Senior School Quadrangle',
      category: 'EXHIBITION',
      desc: 'Showcase of STEM projects and AI models built by middle and high school students.',
    },
    {
      id: '2',
      title: 'Inter-House Sports Meet & Athletics Championship',
      date: '24 Jan 2026',
      time: '08:00 AM - 02:00 PM',
      venue: 'Main Athletic Grounds',
      category: 'SPORTS',
      desc: 'Track and field tournaments across all houses: Red, Blue, Green, and Gold.',
    },
    {
      id: '3',
      title: 'Republic Day Cultural Ceremony',
      date: '26 Jan 2026',
      time: '08:30 AM - 11:00 AM',
      venue: 'Main Auditorium',
      category: 'CEREMONY',
      desc: 'Flag unfurling ceremony, parade salute, and patriotic musical presentation.',
    },
  ];

  const holidays = [
    { name: 'Makar Sankranti / Pongal', date: '14 Jan 2026', day: 'Wednesday', type: 'Gazetted Holiday', duration: '1 Day' },
    { name: 'Republic Day', date: '26 Jan 2026', day: 'Monday', type: 'National Holiday', duration: '1 Day' },
    { name: 'Maha Shivratri', date: '15 Feb 2026', day: 'Sunday', type: 'Gazetted Holiday', duration: '1 Day' },
    { name: 'Holi Festival', date: '04 Mar 2026', day: 'Wednesday', type: 'Festival Holiday', duration: '2 Days' },
    { name: 'Good Friday', date: '03 Apr 2026', day: 'Friday', type: 'Gazetted Holiday', duration: '1 Day' },
  ];

  return (
    <div className="space-y-6">
      <TeacherPageHeader
        title="Events & Holidays"
        description="Official school calendar, academic events, and gazetted holidays."
        breadcrumbs={[
          { label: 'Workspace', href: '/teacher' },
          { label: 'Events & Holidays' },
        ]}
      />

      <TeacherCard>
        {/* Toggle Tabs */}
        <div className="flex items-center gap-3 pb-4 border-b border-[#EEF2F6]">
          <button
            onClick={() => setActiveTab('EVENTS')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'EVENTS'
                ? 'bg-[#2563EB] text-white shadow-xs'
                : 'bg-slate-50 text-[#64748B] hover:text-[#102A56] hover:bg-slate-100'
            }`}
          >
            <PartyPopper className="w-4 h-4" />
            <span>School Events & Meets</span>
          </button>
          <button
            onClick={() => setActiveTab('HOLIDAYS')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'HOLIDAYS'
                ? 'bg-[#2563EB] text-white shadow-xs'
                : 'bg-slate-50 text-[#64748B] hover:text-[#102A56] hover:bg-slate-100'
            }`}
          >
            <Palmtree className="w-4 h-4" />
            <span>Official Holidays List</span>
          </button>
        </div>

        {/* Tab 1: School Events */}
        {activeTab === 'EVENTS' && (
          <div className="mt-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {events.map((e) => (
              <div
                key={e.id}
                className="p-5 rounded-[22px] bg-slate-50/70 border border-[#E2EAF3] hover:border-[#2563EB]/40 hover:bg-white transition-all shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between pb-3 border-b border-slate-200/60">
                    <span className="text-[10px] font-bold text-[#2563EB] bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                      {e.category}
                    </span>
                    <span className="text-xs font-bold text-[#102A56] flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-[#2563EB]" />
                      {e.date}
                    </span>
                  </div>

                  <h4 className="text-sm font-bold text-[#102A56] mt-3 leading-snug">
                    {e.title}
                  </h4>
                  <p className="text-xs text-[#64748B] mt-2 leading-relaxed">
                    {e.desc}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-200/60 space-y-1.5 text-[11px] text-[#64748B]">
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>{e.time}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span>{e.venue}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Tab 2: Holidays List */}
        {activeTab === 'HOLIDAYS' && (
          <div className="overflow-x-auto mt-4">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-[#EEF2F6] text-[11px] font-bold text-[#64748B] uppercase tracking-wider">
                  <th className="py-3 px-3 text-left">Holiday Name</th>
                  <th className="py-3 px-3 text-left">Date</th>
                  <th className="py-3 px-3 text-left">Day</th>
                  <th className="py-3 px-3 text-left">Type</th>
                  <th className="py-3 px-3 text-right">Duration</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F1F5F9] text-xs">
                {holidays.map((h, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3.5 px-3 font-semibold text-[#102A56]">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center shrink-0">
                          <Palmtree className="w-3.5 h-3.5" />
                        </div>
                        <span>{h.name}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-3 font-medium text-[#102A56]">{h.date}</td>
                    <td className="py-3.5 px-3 text-[#64748B]">{h.day}</td>
                    <td className="py-3.5 px-3">
                      <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-semibold text-[10.5px]">
                        {h.type}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 text-right font-bold text-[#102A56]">{h.duration}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </TeacherCard>
    </div>
  );
}
