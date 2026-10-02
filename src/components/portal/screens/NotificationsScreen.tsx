'use client';

import React, { useState } from 'react';
import { Bell, CheckCircle2, Clock, Calendar, Megaphone, FileText, Check } from 'lucide-react';
import PortalPageHeader from '../PortalPageHeader';

interface NotificationsScreenProps {
  onBackToDashboard: () => void;
  onSelectNav: (id: string) => void;
}

const INITIAL_NOTIFICATIONS = [
  { id: '1', title: 'CBSE Class 10 Pre-Board Examination Schedule Released', category: 'Examination', time: '1 hour ago', read: false, description: 'The official datesheet for Term 1 Pre-Board assessment is published. Reporting time is 09:00 AM.', linkTab: 'exam-datesheet' },
  { id: '2', title: 'Fee Reminder: Term 1 CBSE Examination Assessment Due', category: 'Financial', time: '3 hours ago', read: false, description: 'Fee invoice INV-2026-Q3-0428 of ₹4,500 is due on 15 Oct 2026. Please complete online payment.', linkTab: 'fee-summary' },
  { id: '3', title: 'Timetable Adjustment for Physics Laboratory Tomorrow', category: 'Academic', time: 'Yesterday', read: true, description: 'Period 2 Physics practical will be held in Physics Lab 2 under Dr. Rajesh Nambiar.', linkTab: 'today-timetable' },
  { id: '4', title: 'Inter-School Science Olympiad 2026 Registration Open', category: 'Co-Curricular', time: '2 days ago', read: true, description: 'Students interested in participating can sign up with the Science department before Oct 10.', linkTab: 'school-events' },
  { id: '5', title: 'Gandhi Jayanti Public Holiday Observance', category: 'Notice', time: '3 days ago', read: true, description: 'School campus will remain closed on Friday, 2nd October in observance of Mahatma Gandhi Jayanti.', linkTab: 'holiday-calendar' },
];

export default function NotificationsScreen({
  onBackToDashboard,
  onSelectNav,
}: NotificationsScreenProps) {
  const [filter, setFilter] = useState<'All' | 'Unread' | 'Academic' | 'Financial'>('All');
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);

  const handleMarkAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const filtered = notifications.filter((n) => {
    if (filter === 'Unread') return !n.read;
    if (filter === 'Academic') return n.category === 'Academic' || n.category === 'Examination';
    if (filter === 'Financial') return n.category === 'Financial';
    return true;
  });

  return (
    <div className="space-y-6">
      <PortalPageHeader
        title="Notifications"
        subtitle="Real-time school alerts, academic announcements, timetable changes, and reminders"
        onBackToDashboard={onBackToDashboard}
      >
        <button
          type="button"
          onClick={handleMarkAllRead}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-xs transition-colors"
        >
          <Check className="w-4 h-4 text-emerald-600" />
          <span>Mark All Read</span>
        </button>
      </PortalPageHeader>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        {['All', 'Unread', 'Academic', 'Financial'].map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setFilter(cat as any)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              filter === cat
                ? 'bg-[#2563EB] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Notifications List */}
      <div className="bg-white rounded-[22px] shadow-[0_4px_20px_rgba(0,100,200,0.06)] border border-blue-50/80 divide-y divide-slate-100 overflow-hidden">
        {filtered.map((item) => (
          <div
            key={item.id}
            className={`p-5 flex items-start justify-between gap-4 transition-colors hover:bg-slate-50/60 ${
              !item.read ? 'bg-blue-50/20' : ''
            }`}
          >
            <div className="flex items-start gap-3.5">
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                  !item.read
                    ? 'bg-blue-100 text-[#2563EB]'
                    : 'bg-slate-100 text-slate-500'
                }`}
              >
                <Bell className="w-4 h-4" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="text-sm font-bold text-slate-900">{item.title}</h4>
                  {!item.read && (
                    <span className="w-2 h-2 rounded-full bg-blue-600" />
                  )}
                  <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                    {item.category}
                  </span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed max-w-2xl">
                  {item.description}
                </p>
                <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-medium pt-1">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{item.time}</span>
                </div>
              </div>
            </div>

            {item.linkTab && (
              <button
                type="button"
                onClick={() => onSelectNav(item.linkTab)}
                className="shrink-0 px-3 py-1.5 rounded-lg border border-blue-100 bg-blue-50/50 hover:bg-blue-100 text-[#2563EB] text-xs font-semibold transition-colors"
              >
                View
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
