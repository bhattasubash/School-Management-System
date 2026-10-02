'use client';

import React, { useState } from 'react';
import {
  Bell,
  Calendar,
  AlertCircle,
  FileText,
  Search,
  ChevronRight,
  X,
  User,
} from 'lucide-react';
import { TeacherPageHeader } from '@/components/teacher/TeacherPageHeader';
import { TeacherCard } from '@/components/teacher/TeacherComponents';

export default function NoticesPage() {
  const [filterCategory, setFilterCategory] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeNotice, setActiveNotice] = useState<any | null>(null);

  const notices = [
    {
      id: '1',
      title: 'Submission of Mid-Term Examination Question Papers',
      date: '08 Jan 2026',
      category: 'ACADEMIC',
      author: 'Examination Controller',
      priority: 'HIGH',
      description: 'All faculty members teaching Grades 8 to 12 must submit their finalized question papers along with marking schemes to the Academic Cell by January 12, 2026.',
      content: 'Detailed guidelines: Ensure bilingual formatting where applicable. Marks distribution must strictly adhere to CBSE blue-print specifications. All submissions must be encrypted and delivered in sealed envelopes to Room 102.',
    },
    {
      id: '2',
      title: 'Staff Meeting Regarding Annual Sports Day Organization',
      date: '06 Jan 2026',
      category: 'STAFF',
      author: 'Vice Principal',
      priority: 'NORMAL',
      description: 'A mandatory briefing will be conducted in the Main Auditorium on Friday at 03:30 PM to allocate sports day house duties and field management responsibilities.',
      content: 'Agenda items: 1) House in-charge allocations, 2) Ground security protocols, 3) Refreshment coordination team lineup. Attendance is compulsory for all teaching faculty.',
    },
    {
      id: '3',
      title: 'Revised Winter School Timings Due to Dense Fog Advisory',
      date: '03 Jan 2026',
      category: 'ADMIN',
      author: 'Principal Office',
      priority: 'HIGH',
      description: 'In compliance with Directorate of Education guidelines, morning reporting time for staff and students will be 08:30 AM effective until further notice.',
      content: 'Period durations will be compacted by 5 minutes each to compensate for the delayed start while ensuring curriculum pacing remains uninterrupted.',
    },
    {
      id: '4',
      title: 'Biometric Attendance Machine Maintenance Schedule',
      date: '02 Jan 2026',
      category: 'OPERATIONS',
      author: 'IT Department',
      priority: 'NORMAL',
      description: 'The biometric terminal at Gate 2 will be undergoing firmware upgrades on Saturday evening. Staff may use Gate 1 or web portal punch.',
      content: 'Online portal punch has been activated as fallback for all faculty members on days of maintenance.',
    },
  ];

  const filtered = notices.filter(n => {
    const matchesCat = filterCategory === 'ALL' || n.category === filterCategory;
    const matchesQuery = n.title.toLowerCase().includes(searchQuery.toLowerCase()) || n.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesQuery;
  });

  return (
    <div className="space-y-6">
      <TeacherPageHeader
        title="Notices & Circulars"
        description="Stay updated with official school announcements and faculty circulars."
        breadcrumbs={[
          { label: 'Workspace', href: '/teacher' },
          { label: 'Notices & Circulars' },
        ]}
      />

      <TeacherCard>
        {/* Search & Filter */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pb-4 border-b border-[#EEF2F6]">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-[#94A3B8] absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search circulars..."
              className="w-full h-10 pl-10 pr-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-[#102A56] placeholder-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/30"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto">
            {['ALL', 'ACADEMIC', 'STAFF', 'ADMIN'].map((cat) => (
              <button
                key={cat}
                onClick={() => setFilterCategory(cat)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                  filterCategory === cat
                    ? 'bg-[#2563EB] text-white shadow-xs'
                    : 'bg-slate-50 text-[#64748B] hover:text-[#102A56] hover:bg-slate-100'
                }`}
              >
                {cat === 'ALL' ? 'All Notices' : cat}
              </button>
            ))}
          </div>
        </div>

        {/* Notice Cards List */}
        <div className="mt-4 space-y-3.5">
          {filtered.map((n) => (
            <div
              key={n.id}
              onClick={() => setActiveNotice(n)}
              className={`p-5 rounded-[20px] border transition-all cursor-pointer group hover:shadow-xs ${
                n.priority === 'HIGH'
                  ? 'bg-amber-50/30 border-amber-200/80 hover:border-amber-300'
                  : 'bg-white border-[#E2EAF3] hover:border-[#2563EB]/40'
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2.5">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                        n.category === 'ACADEMIC'
                          ? 'bg-blue-50 text-[#2563EB] border border-blue-200'
                          : n.category === 'ADMIN'
                          ? 'bg-purple-50 text-[#9333EA] border border-purple-200'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {n.category}
                    </span>
                    {n.priority === 'HIGH' && (
                      <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        Urgent Action
                      </span>
                    )}
                    <span className="text-xs text-[#64748B] flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-[#94A3B8]" />
                      {n.date}
                    </span>
                  </div>

                  <h4 className="text-base font-bold text-[#102A56] group-hover:text-[#2563EB] transition-colors leading-snug">
                    {n.title}
                  </h4>
                  <p className="text-xs text-[#64748B] leading-relaxed line-clamp-2">
                    {n.description}
                  </p>

                  <p className="text-[11px] font-medium text-slate-400 pt-1">
                    Issued by: {n.author}
                  </p>
                </div>

                <div className="w-8 h-8 rounded-full bg-slate-50 group-hover:bg-[#2563EB] group-hover:text-white text-[#64748B] flex items-center justify-center shrink-0 transition-colors">
                  <ChevronRight className="w-4 h-4 stroke-[2.2]" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </TeacherCard>

      {/* Notice Detail Modal */}
      {activeNotice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-[26px] p-6 max-w-lg w-full shadow-2xl border border-white relative">
            <button
              onClick={() => setActiveNotice(null)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-2">
              <span className="text-[11px] font-bold text-[#2563EB] bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
                {activeNotice.category}
              </span>
              <span className="text-xs text-[#64748B]">{activeNotice.date}</span>
            </div>

            <h3 className="text-lg font-bold text-[#102A56] leading-snug">
              {activeNotice.title}
            </h3>

            <p className="text-xs text-[#2563EB] font-semibold mt-1">
              Issued by: {activeNotice.author}
            </p>

            <div className="my-4 p-4 rounded-2xl bg-slate-50 border border-slate-100 text-xs text-[#102A56] leading-relaxed space-y-3">
              <p>{activeNotice.description}</p>
              <p className="pt-2 border-t border-slate-200/60 text-[#64748B]">{activeNotice.content}</p>
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setActiveNotice(null)}
                className="px-5 py-2 rounded-xl bg-[#2563EB] text-white text-xs font-semibold hover:bg-[#1D4ED8] transition-colors cursor-pointer"
              >
                Close Notice
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
