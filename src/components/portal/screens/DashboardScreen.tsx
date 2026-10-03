'use client';

import React from 'react';
import {
  BookOpen,
  FileText,
  ClipboardCheck,
  BarChart3,
  CreditCard,
  LogOut as LeaveIcon,
  ChevronRight,
} from 'lucide-react';

interface DashboardScreenProps {
  student: {
    name: string;
    className: string;
    sectionName: string;
    rollNumber: number | null;
    avatarUrl?: string | null;
  };
  onSelectNav: (id: string) => void;
  onRequestLeave: () => void;
}

export default function DashboardScreen({
  student,
  onSelectNav,
  onRequestLeave,
}: DashboardScreenProps) {
  return (
    <div className="space-y-6">
      {/* ================================================================== */}
      {/* 1. WELCOME HERO BANNER (Soft Mint Green)                          */}
      {/* ================================================================== */}
      <div className="relative overflow-hidden rounded-[24px] bg-gradient-to-r from-[#EBF9F1] via-[#E2F7EB] to-[#DCF5E8] border border-[#D1F2DE] shadow-[0_4px_20px_rgba(0,100,200,0.04)] px-6 py-5 sm:px-8 sm:py-6 flex flex-col md:flex-row items-center justify-between gap-6">
        {/* Left: Student Avatar + Greeting */}
        <div className="flex items-center gap-5 z-10 shrink-0">
          {/* Circular Student Portrait with Blue Ring */}
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full border-[3px] border-[#2563EB] overflow-hidden bg-white shadow-sm shrink-0">
            <img
              src={student.avatarUrl || '/images/dashboard/ref_avatar.png'}
              alt={student.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/images/dashboard/ref_avatar.png';
              }}
            />
          </div>

          {/* Student Info */}
          <div>
            <span className="text-sm sm:text-base font-normal text-[#64748B] block leading-tight">
              Hello,
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#0F172A] tracking-tight mt-0.5 flex items-center gap-1.5 leading-tight">
              <span>{student.name || 'Subash Bhatta'}</span>
              <span className="text-2xl select-none" role="img" aria-label="Waving hand">
                👋
              </span>
            </h1>
            <p className="text-xs sm:text-sm font-medium text-[#64748B] mt-1 tracking-wide">
              Class {student.className} - {student.sectionName} &nbsp;|&nbsp; Roll No:{' '}
              {student.rollNumber || 27}
            </p>
          </div>
        </div>

        {/* Center: Motivational Quote */}
        <div className="hidden lg:flex flex-col text-left z-10 px-4">
          <p className="text-sm sm:text-base font-serif italic text-[#475569] font-medium leading-snug select-none">
            “Keep learning
            <br />
            &nbsp;&nbsp;Keep growing!”
          </p>
        </div>

        {/* Right: School Campus Illustration */}
        <div className="relative w-full md:w-auto h-28 sm:h-32 flex items-center justify-end z-0">
          <img
            src="/images/dashboard/ref_school_hero_clean.png"
            alt="Sunrise Public School Campus"
            className="h-full object-contain rounded-r-2xl select-none pointer-events-none"
          />
        </div>
      </div>

      {/* ================================================================== */}
      {/* 2. QUICK ACTION SECTION (6 Circular Shortcuts)                     */}
      {/* ================================================================== */}
      <div className="bg-white rounded-[22px] shadow-[0_4px_20px_rgba(0,100,200,0.06)] border border-blue-50/80 px-6 py-6 sm:px-8">
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-4 sm:gap-6 text-center">
          {/* Action 1: View Timetable */}
          <button
            type="button"
            onClick={() => onSelectNav('today-timetable')}
            className="group flex flex-col items-center focus:outline-none"
          >
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-[#D1FBDF] flex items-center justify-center text-[#059669] shadow-2xs group-hover:scale-105 group-hover:shadow-sm transition-all duration-200">
              <BookOpen className="w-6 h-6 sm:w-7 sm:h-7 stroke-[2.2]" />
            </div>
            <span className="text-xs font-semibold text-slate-700 mt-2.5 leading-tight group-hover:text-blue-600 transition-colors">
              View
              <br />
              Timetable
            </span>
          </button>

          {/* Action 2: Assignments */}
          <button
            type="button"
            onClick={() => onSelectNav('syllabus-curriculum')}
            className="group flex flex-col items-center focus:outline-none"
          >
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-[#EBD9FD] flex items-center justify-center text-[#7C3AED] shadow-2xs group-hover:scale-105 group-hover:shadow-sm transition-all duration-200">
              <FileText className="w-6 h-6 sm:w-7 sm:h-7 stroke-[2.2]" />
            </div>
            <span className="text-xs font-semibold text-slate-700 mt-2.5 leading-tight group-hover:text-blue-600 transition-colors">
              Assignments
            </span>
          </button>

          {/* Action 3: Exam Schedule */}
          <button
            type="button"
            onClick={() => onSelectNav('exam-datesheet')}
            className="group flex flex-col items-center focus:outline-none"
          >
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-[#FED7DB] flex items-center justify-center text-[#EF4444] shadow-2xs group-hover:scale-105 group-hover:shadow-sm transition-all duration-200">
              <ClipboardCheck className="w-6 h-6 sm:w-7 sm:h-7 stroke-[2.2]" />
            </div>
            <span className="text-xs font-semibold text-slate-700 mt-2.5 leading-tight group-hover:text-blue-600 transition-colors">
              Exam
              <br />
              Schedule
            </span>
          </button>

          {/* Action 4: View Results */}
          <button
            type="button"
            onClick={() => onSelectNav('results-marks')}
            className="group flex flex-col items-center focus:outline-none"
          >
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-[#D5E7FC] flex items-center justify-center text-[#2563EB] shadow-2xs group-hover:scale-105 group-hover:shadow-sm transition-all duration-200">
              <BarChart3 className="w-6 h-6 sm:w-7 sm:h-7 stroke-[2.2]" />
            </div>
            <span className="text-xs font-semibold text-slate-700 mt-2.5 leading-tight group-hover:text-blue-600 transition-colors">
              View
              <br />
              Results
            </span>
          </button>

          {/* Action 5: Fees & Payments */}
          <button
            type="button"
            onClick={() => onSelectNav('fee-summary')}
            className="group flex flex-col items-center focus:outline-none"
          >
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-[#FEF08A] flex items-center justify-center text-[#D97706] shadow-2xs group-hover:scale-105 group-hover:shadow-sm transition-all duration-200">
              <CreditCard className="w-6 h-6 sm:w-7 sm:h-7 stroke-[2.2]" />
            </div>
            <span className="text-xs font-semibold text-slate-700 mt-2.5 leading-tight group-hover:text-blue-600 transition-colors">
              Fees &<br />
              Payments
            </span>
          </button>

          {/* Action 6: Apply Leave */}
          <button
            type="button"
            onClick={onRequestLeave}
            className="group flex flex-col items-center focus:outline-none"
          >
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-[#FCE7F3] flex items-center justify-center text-[#E11D48] shadow-2xs group-hover:scale-105 group-hover:shadow-sm transition-all duration-200">
              <LeaveIcon className="w-6 h-6 sm:w-7 sm:h-7 stroke-[2.2]" />
            </div>
            <span className="text-xs font-semibold text-slate-700 mt-2.5 leading-tight group-hover:text-blue-600 transition-colors">
              Apply
              <br />
              Leave
            </span>
          </button>
        </div>
      </div>

      {/* ================================================================== */}
      {/* 3. MY ACTIVITIES SECTION (Vibrant Royal Blue Heading)               */}
      {/* ================================================================== */}
      <div className="space-y-4">
        <h2 className="text-2xl sm:text-3xl font-bold text-[#0284C7] tracking-tight">
          My Activities
        </h2>

        {/* 2-Column Activity Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Card 1: Today's Classes */}
          <div
            onClick={() => onSelectNav('today-timetable')}
            className="group relative overflow-hidden rounded-[22px] bg-gradient-to-r from-[#FA9D02] via-[#F97316] to-[#FB923C] shadow-[0_4px_20px_rgba(249,115,22,0.18)] p-6 min-h-[140px] flex items-center justify-between cursor-pointer hover:shadow-lg transition-all duration-200"
          >
            {/* Left Title */}
            <div className="z-10 text-white select-none">
              <span className="text-2xl sm:text-3xl font-bold leading-tight block">
                Today&apos;s
              </span>
              <span className="text-2xl sm:text-3xl font-bold leading-tight block">
                Classes
              </span>
            </div>

            {/* Middle/Right: Illustration with translucent backdrop circle */}
            <div className="relative flex items-center gap-3 z-10">
              <div className="relative w-36 h-28 flex items-end justify-center">
                {/* Lighter backdrop circle */}
                <div className="absolute top-0 right-2 w-24 h-24 rounded-full bg-white/20 -z-10" />
                <img
                  src="/images/dashboard/card_classes_illust.png"
                  alt="Today's Classes"
                  className="h-full object-contain object-bottom select-none pointer-events-none drop-shadow-xs"
                />
              </div>

              {/* White Circular Arrow Button */}
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white flex items-center justify-center text-[#FA9D02] shadow-md group-hover:scale-110 group-hover:translate-x-0.5 transition-all duration-200 shrink-0">
                <ChevronRight className="w-5 h-5 stroke-[2.5]" />
              </div>
            </div>
          </div>

          {/* Card 2: My Assignments */}
          <div
            onClick={() => onSelectNav('syllabus-curriculum')}
            className="group relative overflow-hidden rounded-[22px] bg-gradient-to-r from-[#01B0DF] via-[#0284C7] to-[#0EA5E9] shadow-[0_4px_20px_rgba(2,132,199,0.18)] p-6 min-h-[140px] flex items-center justify-between cursor-pointer hover:shadow-lg transition-all duration-200"
          >
            {/* Left Title */}
            <div className="z-10 text-white select-none">
              <span className="text-2xl sm:text-3xl font-bold leading-tight block">
                My
              </span>
              <span className="text-2xl sm:text-3xl font-bold leading-tight block">
                Assignments
              </span>
            </div>

            {/* Middle/Right: Illustration with translucent backdrop circle */}
            <div className="relative flex items-center gap-3 z-10">
              <div className="relative w-36 h-28 flex items-end justify-center">
                {/* Lighter backdrop circle */}
                <div className="absolute top-0 right-2 w-24 h-24 rounded-full bg-white/20 -z-10" />
                <img
                  src="/images/dashboard/card_assignments_illust.png"
                  alt="My Assignments"
                  className="h-full object-contain object-bottom select-none pointer-events-none drop-shadow-xs"
                />
              </div>

              {/* White Circular Arrow Button */}
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white flex items-center justify-center text-[#01B0DF] shadow-md group-hover:scale-110 group-hover:translate-x-0.5 transition-all duration-200 shrink-0">
                <ChevronRight className="w-5 h-5 stroke-[2.5]" />
              </div>
            </div>
          </div>

          {/* Card 3: Study Materials */}
          <div
            onClick={() => onSelectNav('syllabus-curriculum')}
            className="group relative overflow-hidden rounded-[22px] bg-gradient-to-r from-[#BD71FD] via-[#9333EA] to-[#A855F7] shadow-[0_4px_20px_rgba(147,51,234,0.18)] p-6 min-h-[140px] flex items-center justify-between cursor-pointer hover:shadow-lg transition-all duration-200"
          >
            {/* Left Title */}
            <div className="z-10 text-white select-none">
              <span className="text-2xl sm:text-3xl font-bold leading-tight block">
                Study
              </span>
              <span className="text-2xl sm:text-3xl font-bold leading-tight block">
                Materials
              </span>
            </div>

            {/* Middle/Right: Books stack illustration with translucent circle */}
            <div className="relative flex items-center gap-3 z-10">
              <div className="relative w-36 h-28 flex items-center justify-center">
                {/* Lighter backdrop circle */}
                <div className="absolute top-0 right-2 w-24 h-24 rounded-full bg-white/20 -z-10" />
                <img
                  src="/images/dashboard/illust_study_materials_clean.png"
                  alt="Study Materials"
                  className="h-full object-contain select-none pointer-events-none drop-shadow-md"
                />
              </div>

              {/* White Circular Arrow Button */}
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white flex items-center justify-center text-[#BD71FD] shadow-md group-hover:scale-110 group-hover:translate-x-0.5 transition-all duration-200 shrink-0">
                <ChevronRight className="w-5 h-5 stroke-[2.5]" />
              </div>
            </div>
          </div>

          {/* Card 4: My Results */}
          <div
            onClick={() => onSelectNav('results-marks')}
            className="group relative overflow-hidden rounded-[22px] bg-gradient-to-r from-[#2AB76C] via-[#059669] to-[#10B981] shadow-[0_4px_20px_rgba(16,185,129,0.18)] p-6 min-h-[140px] flex items-center justify-between cursor-pointer hover:shadow-lg transition-all duration-200"
          >
            {/* Left Title */}
            <div className="z-10 text-white select-none">
              <span className="text-2xl sm:text-3xl font-bold leading-tight block">
                My
              </span>
              <span className="text-2xl sm:text-3xl font-bold leading-tight block">
                Results
              </span>
            </div>

            {/* Middle/Right: A+ Student illustration with translucent circle */}
            <div className="relative flex items-center gap-3 z-10">
              <div className="relative w-36 h-28 flex items-center justify-center">
                {/* Lighter backdrop circle */}
                <div className="absolute top-0 right-2 w-24 h-24 rounded-full bg-white/20 -z-10" />
                <img
                  src="/images/dashboard/illust_results.png"
                  alt="My Results"
                  className="h-full object-contain select-none pointer-events-none drop-shadow-md"
                />
              </div>

              {/* White Circular Arrow Button */}
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white flex items-center justify-center text-[#2AB76C] shadow-md group-hover:scale-110 group-hover:translate-x-0.5 transition-all duration-200 shrink-0">
                <ChevronRight className="w-5 h-5 stroke-[2.5]" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
