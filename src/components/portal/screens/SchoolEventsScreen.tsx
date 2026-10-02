'use client';

import React from 'react';
import { Sparkles, Calendar, MapPin, Clock, ArrowRight } from 'lucide-react';
import PortalPageHeader from '../PortalPageHeader';

interface SchoolEventsScreenProps {
  events: Array<{
    id: string;
    title: string;
    description: string;
    eventDate: string;
    eventTime: string | null;
    location: string | null;
    category: string;
  }>;
  onBackToDashboard: () => void;
}

const FALLBACK_EVENTS = [
  { id: '1', title: 'Annual Inter-School Sports Meet & Track Trials', description: 'Selection rounds for 100m, 400m, long jump, and relay teams representing Sunrise Public School.', eventDate: '10 Oct 2026', eventTime: '08:00 AM - 02:00 PM', location: 'Main Athletics Ground', category: 'Sports' },
  { id: '2', title: 'National Science & Robotics Exhibition 2026', description: 'Working prototype display by middle and senior wing students. Judged by senior scientists and engineers.', eventDate: '25 Oct 2026', eventTime: '09:30 AM - 03:30 PM', location: 'Main Auditorium & STEM Labs', category: 'Academic' },
  { id: '3', title: 'Parent-Teacher Meeting (Term 1 Assessment Review)', description: 'One-on-one consultation with subject faculty and class mentors to discuss academic growth.', eventDate: '31 Oct 2026', eventTime: '08:30 AM - 01:30 PM', location: 'Senior Wing Classrooms', category: 'Administrative' },
  { id: '4', title: 'Annual Cultural Fest: Tarangini 2026', description: 'Inter-house music, dance, theatrical drama, and visual arts performances.', eventDate: '14 Nov 2026', eventTime: '10:00 AM - 05:00 PM', location: 'Open Air Amphitheatre', category: 'Cultural' },
];

export default function SchoolEventsScreen({
  events,
  onBackToDashboard,
}: SchoolEventsScreenProps) {
  const displayEvents = events.length > 0 ? events : FALLBACK_EVENTS;

  return (
    <div className="space-y-6">
      <PortalPageHeader
        title="School Events"
        subtitle="Campus activities, sports tournaments, exhibitions, and cultural showcases"
        onBackToDashboard={onBackToDashboard}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {displayEvents.map((evt) => (
          <div
            key={evt.id}
            className="bg-white rounded-[22px] shadow-[0_4px_20px_rgba(0,100,200,0.06)] border border-blue-50/80 p-6 flex flex-col justify-between space-y-4 hover:border-blue-200 transition-all"
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                  {evt.category}
                </span>
                <span className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-blue-600" />
                  <span>{evt.eventDate}</span>
                </span>
              </div>

              <h3 className="text-base font-bold text-slate-900 mt-3 leading-snug">
                {evt.title}
              </h3>

              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                {evt.description}
              </p>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-4 text-xs text-slate-500 flex-wrap">
                {evt.eventTime && (
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>{evt.eventTime}</span>
                  </span>
                )}
                {evt.location && (
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span>{evt.location}</span>
                  </span>
                )}
              </div>
            </div>

            <button
              type="button"
              onClick={() => alert(`RSVP / Notification set for ${evt.title}`)}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-blue-100 bg-blue-50/40 hover:bg-blue-50 text-[#2563EB] text-xs font-semibold transition-colors"
            >
              <span>Set Event Reminder</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
