'use client';

import React, { useState } from 'react';
import { Megaphone, Search, AlertCircle, Download, FileText, ChevronRight } from 'lucide-react';
import PortalPageHeader from '../PortalPageHeader';

interface CircularsNoticesScreenProps {
  notices: Array<{
    id: string;
    title: string;
    date: string;
    category: string;
    priority: string;
  }>;
  onBackToDashboard: () => void;
}

export default function CircularsNoticesScreen({
  notices,
  onBackToDashboard,
}: CircularsNoticesScreenProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [search, setSearch] = useState('');

  const filtered = notices.filter((n) => {
    const matchesCat = selectedCategory === 'All' || n.category.toLowerCase() === selectedCategory.toLowerCase();
    const matchesSearch = n.title.toLowerCase().includes(search.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="space-y-6">
      <PortalPageHeader
        title="Circulars & Notice Board"
        subtitle="Official school administrative notices, directives, circulars, and announcements"
        onBackToDashboard={onBackToDashboard}
      />

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          {['All', 'Academic', 'Examination', 'Administrative', 'Co-Curricular'].map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-[#2563EB] text-white shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white border border-slate-200 w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 shrink-0" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search circulars..."
            className="w-full text-xs text-slate-800 outline-none bg-transparent placeholder:text-slate-400"
          />
        </div>
      </div>

      {/* Notices List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filtered.map((notice) => {
          const isUrgent = notice.priority === 'IMPORTANT' || notice.priority === 'URGENT';

          return (
            <div
              key={notice.id}
              className="bg-white rounded-[22px] shadow-[0_4px_20px_rgba(0,100,200,0.06)] border border-blue-50/80 p-6 flex flex-col justify-between space-y-4 hover:border-blue-200 transition-all"
            >
              <div>
                <div className="flex items-center justify-between gap-2">
                  <span
                    className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                      isUrgent
                        ? 'bg-rose-50 text-rose-700 border border-rose-200'
                        : 'bg-blue-50 text-blue-700 border border-blue-200'
                    }`}
                  >
                    {notice.priority}
                  </span>
                  <span className="text-[11px] text-slate-400">{notice.date}</span>
                </div>

                <h3 className="text-base font-bold text-slate-900 mt-2.5 leading-snug">
                  {notice.title}
                </h3>

                <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                  Issued by the Directorate of Academics & Examination Board for Class 10 candidates.
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-400 font-medium">{notice.category}</span>
                <button
                  type="button"
                  onClick={() => alert(`Opening notice: ${notice.title}`)}
                  className="flex items-center gap-1 text-[#2563EB] hover:text-blue-800 font-semibold"
                >
                  <span>Read Notice</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
