'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Bell,
  Search,
  ChevronDown,
  Calendar,
  Clock,
  BookOpen,
  MessageSquare,
  FileText,
  CreditCard,
  Phone,
  Mail,
  GraduationCap,
  ChevronRight,
  ChevronLeft,
  ShieldCheck,
  Eye,
  Megaphone,
  Award,
  Compass,
  Moon,
  Settings,
  Bug,
  Footprints,
  Bus,
  FileCheck2,
  LogOut,
} from 'lucide-react';

export default function DashboardPage() {
  const [activeScheduleTab, setActiveScheduleTab] = useState<'8-12' | '12-3' | '3-6'>('8-12');
  const [activeAnnouncementTab, setActiveAnnouncementTab] = useState<
    'Academic' | 'Administrative' | 'Co-Curricular' | 'Examination' | 'Services'
  >('Academic');
  const [activeSubjectIndex, setActiveSubjectIndex] = useState(0);

  // User's School Subjects (Reference B Data)
  const subjects = [
    { code: 'MATH-041', percent: 92, name: 'MATHEMATICS (ALGEBRA)' },
    { code: 'SCI-086', percent: 86, name: 'SCIENCE & LAB WORK' },
    { code: 'ENG-184', percent: 95, name: 'ENGLISH LANGUAGE & LIT.' },
    { code: 'SOC-087', percent: 78, name: 'SOCIAL SCIENCE' },
    { code: 'HIN-002', percent: 71, name: 'HINDI COURSE A' },
  ];

  return (
    <div className="min-h-screen bg-[#F4F8FA] text-[#132033] font-sans antialiased selection:bg-[#FF7555]/20 selection:text-[#FF7555]">
      {/* ==================================================================== */}
      {/* 1. TOP GLOBAL NAVIGATION (Two-Tier Institutional ERP Header)        */}
      {/* ==================================================================== */}
      <header className="sticky top-0 z-40 bg-white border-b border-[#EBF0F5] shadow-[0_1px_4px_rgba(19,32,51,0.02)]">
        {/* Tier 1: Main Header (Institution Branding on Left, Tools on Right) */}
        <div className="max-w-[1440px] mx-auto px-6 md:px-10 h-[64px] flex items-center justify-between">
          {/* Left: School Management System / DPS Logo */}
          <div className="flex items-center gap-3">
            <div className="flex items-center">
              <span className="text-xl font-black tracking-tight text-[#132033] flex items-center">
                <span className="text-[#FF7555] font-black text-2xl">D</span>PS
              </span>
              <div className="ml-2.5 pl-2.5 border-l border-slate-300 text-left">
                <span className="text-[9px] font-bold tracking-widest uppercase block text-[#132033] leading-none">
                  DELHI PUBLIC SCHOOL
                </span>
                <span className="text-[8px] font-semibold tracking-wider uppercase block text-[#6F7D8D] leading-tight">
                  CBSE AFFILIATED • SCHOOL ERP
                </span>
              </div>
            </div>
          </div>

          {/* Right: Search Pill, Dark Toggle, Notification Bell with 4 Badge, Student Profile */}
          <div className="flex items-center gap-3 md:gap-5">
            {/* Search Pill */}
            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-[#D9E2EC] text-[#6F7D8D] text-xs w-44 md:w-56 focus-within:border-[#FF7555] transition-all shadow-2xs">
              <Search className="w-3.5 h-3.5 text-[#6F7D8D]" />
              <input
                type="text"
                placeholder="Search subject, notice..."
                className="bg-transparent border-none outline-none w-full text-xs text-[#132033] placeholder:text-[#8FA0B2]"
              />
            </div>

            {/* Dark Mode Moon Icon */}
            <button
              aria-label="Toggle theme"
              className="p-1.5 rounded-full text-[#6F7D8D] hover:text-[#132033] hover:bg-[#F4F8FA] transition-colors"
            >
              <Moon className="w-4 h-4" />
            </button>

            {/* Notification Bell with 4 Badge */}
            <button
              aria-label="Notifications"
              className="relative p-1.5 rounded-full text-[#6F7D8D] hover:text-[#132033] hover:bg-[#F4F8FA] transition-colors"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-[#FF7555] text-white text-[10px] font-bold flex items-center justify-center shadow-xs">
                4
              </span>
            </button>

            {/* User Profile Avatar with Student Illustration, Name & Switch/Logout button */}
            <div className="flex items-center gap-2.5 pl-2">
              <div className="w-9 h-9 rounded-full bg-[#E2E8F0] border border-slate-300 overflow-hidden shrink-0 relative">
                <img
                  src="/student-avatar.jpg"
                  alt="Rohan Sharma"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="hidden sm:flex flex-col text-left">
                <span className="text-xs font-bold text-[#132033] leading-tight">
                  Rohan Sharma
                </span>
                <span className="text-[10px] text-gray-500 leading-tight">
                  Student / Parent Portal
                </span>
              </div>
              <Link
                href="/login"
                className="ml-1 p-1.5 rounded-lg text-[#6F7D8D] hover:text-[#FF7555] hover:bg-[#FFF2EE] transition-colors"
                title="Switch Role / Sign Out"
              >
                <LogOut className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>

        {/* Tier 2: Category Sub-Navigation Bar */}
        <div className="border-t border-[#F0F4F8] bg-white">
          <div className="max-w-[1440px] mx-auto px-6 md:px-10 h-[44px] flex items-center justify-between text-xs font-medium text-[#132033]">
            {/* Left Category Dropdowns */}
            <div className="flex items-center gap-6 md:gap-8">
              <div className="flex items-center gap-1 cursor-pointer hover:text-[#FF7555] transition-colors">
                <span>Academics</span>
                <ChevronDown className="w-3.5 h-3.5 text-[#8FA0B2]" />
              </div>
              <div className="flex items-center gap-1 cursor-pointer hover:text-[#FF7555] transition-colors">
                <span>Examinations</span>
                <ChevronDown className="w-3.5 h-3.5 text-[#8FA0B2]" />
              </div>
              <div className="flex items-center gap-1 cursor-pointer hover:text-[#FF7555] transition-colors">
                <span>Fee Portal</span>
                <ChevronDown className="w-3.5 h-3.5 text-[#8FA0B2]" />
              </div>
              <div className="flex items-center gap-1 cursor-pointer hover:text-[#FF7555] transition-colors">
                <span>Student Services</span>
                <ChevronDown className="w-3.5 h-3.5 text-[#8FA0B2]" />
              </div>
            </div>

            {/* Right: CBSE Portal / Old ERP Shortcut */}
            <div className="flex items-center gap-1.5 cursor-pointer text-[#132033] hover:text-[#FF7555] transition-colors font-medium">
              <Settings className="w-3.5 h-3.5 text-[#8FA0B2]" />
              <span>CBSE Portal</span>
            </div>
          </div>
        </div>
      </header>

      {/* ==================================================================== */}
      {/* MAIN CONTAINER: Centered, max-w-[1440px]                             */}
      {/* ==================================================================== */}
      <main className="max-w-[1440px] mx-auto px-6 md:px-10 py-7 space-y-12">
        {/* ================================================================== */}
        {/* SCREEN 1: HERO VIEWPORT (Identity + 4 Coral Cards + Banner + KPIs) */}
        {/* Fills the initial screen view with large, prominent, airy cards    */}
        {/* ================================================================== */}
        <section className="min-h-[calc(100vh-130px)] flex flex-col justify-between space-y-5 pb-4">
          {/* Row 1: Student Identity Card (54%) + 4 Coral Action Stat Cards (46%) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
            {/* Student Identity Card */}
            <div className="lg:col-span-6 bg-white rounded-[22px] border border-[#EBF0F5] p-6 shadow-[0_2px_14px_rgba(19,32,51,0.03)] flex items-center justify-between gap-5 min-h-[128px]">
              <div className="flex items-center gap-5 min-w-0">
                {/* Profile Image Frame with Vector Illustration */}
                <div className="w-[68px] h-[68px] rounded-[16px] bg-[#E8F0FE] border border-[#D0E1FD] shrink-0 overflow-hidden shadow-inner relative">
                  <img
                    src="/student-avatar.jpg"
                    alt="Rohan Sharma"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="min-w-0">
                  <h1 className="text-xl font-extrabold text-[#FF6F50] leading-tight truncate">
                    Rohan Sharma
                  </h1>
                  <p className="text-xs text-[#132033] mt-1.5 font-medium truncate">
                    Adm ID: <span className="font-bold">DPS-2022-4891</span> | Section:{' '}
                    <span className="font-bold">10-A</span> | Roll No:{' '}
                    <span className="font-bold">14</span> | Batch:{' '}
                    <span className="font-bold">2026</span>
                  </p>
                  <p className="text-xs text-[#6F7D8D] truncate mt-1">
                    CBSE Secondary Program • Class 10 (Secondary Wing)
                  </p>
                </div>
              </div>

              {/* Coral Tinted Action Button */}
              <button className="px-5 py-2 rounded-full text-xs font-bold text-[#FF6F50] bg-[#FFF2EE] hover:bg-[#FF6F50] hover:text-white transition-all shrink-0 whitespace-nowrap shadow-2xs">
                Raise Grievance
              </button>
            </div>

            {/* 4 Coral Action Stat Cards (Right) */}
            <div className="lg:col-span-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
              {/* Card 1: Happenings (with soft golden/yellow corner wave) */}
              <div className="relative overflow-hidden bg-[#FF7555] text-white rounded-[22px] p-5 flex flex-col justify-between shadow-[0_4px_16px_rgba(255,117,85,0.22)] min-h-[128px]">
                {/* Organic Soft Yellow Corner Wave */}
                <svg
                  className="absolute top-0 right-0 w-14 h-14 pointer-events-none"
                  viewBox="0 0 50 50"
                  fill="none"
                >
                  <path
                    d="M50 0H20C20 18 32 30 50 30V0Z"
                    fill="#FDCB6E"
                    fillOpacity="0.45"
                  />
                </svg>

                <BookOpen className="w-5 h-5 text-white/95" />
                <div>
                  <span className="text-3xl font-black block leading-none tracking-tight">10</span>
                  <span className="text-xs font-semibold text-white/95 mt-1.5 block">Happenings</span>
                </div>
              </div>

              {/* Card 2: Messages (with peach organic wave) */}
              <div className="relative overflow-hidden bg-[#FF7555] text-white rounded-[22px] p-5 flex flex-col justify-between shadow-[0_4px_16px_rgba(255,117,85,0.22)] min-h-[128px]">
                {/* Organic Soft Peach Corner Wave */}
                <svg
                  className="absolute top-0 right-0 w-14 h-14 pointer-events-none"
                  viewBox="0 0 50 50"
                  fill="none"
                >
                  <path
                    d="M50 0H18C18 20 30 32 50 32V0Z"
                    fill="#FFA07A"
                    fillOpacity="0.4"
                  />
                </svg>

                <MessageSquare className="w-5 h-5 text-white/95" />
                <div>
                  <span className="text-3xl font-black block leading-none tracking-tight">21</span>
                  <span className="text-xs font-semibold text-white/95 mt-1.5 block">Messages</span>
                </div>
              </div>

              {/* Card 3: Assignments (with curved peach accent) */}
              <div className="relative overflow-hidden bg-[#FF7555] text-white rounded-[22px] p-5 flex flex-col justify-between shadow-[0_4px_16px_rgba(255,117,85,0.22)] min-h-[128px]">
                {/* Organic Soft Curve */}
                <svg
                  className="absolute top-0 right-0 w-14 h-14 pointer-events-none"
                  viewBox="0 0 50 50"
                  fill="none"
                >
                  <path
                    d="M50 0H22C22 18 32 28 50 28V0Z"
                    fill="#FF8A65"
                    fillOpacity="0.5"
                  />
                </svg>

                <FileText className="w-5 h-5 text-white/95" />
                <div>
                  <span className="text-3xl font-black block leading-none tracking-tight">04</span>
                  <span className="text-xs font-semibold text-white/95 mt-1.5 block">Assignments</span>
                </div>
              </div>

              {/* Card 4: Events (with vivid turquoise/cyan corner accent) */}
              <div className="relative overflow-hidden bg-[#FF7555] text-white rounded-[22px] p-5 flex flex-col justify-between shadow-[0_4px_16px_rgba(255,117,85,0.22)] min-h-[128px]">
                {/* Signature Cyan Droplet Accent */}
                <svg
                  className="absolute top-0 right-0 w-14 h-14 pointer-events-none"
                  viewBox="0 0 50 50"
                  fill="none"
                >
                  <path
                    d="M50 0H15C15 22 28 35 50 35V0Z"
                    fill="#35C1E8"
                    fillOpacity="0.85"
                  />
                </svg>

                <Calendar className="w-5 h-5 text-white/95" />
                <div>
                  <span className="text-3xl font-black block leading-none tracking-tight">02</span>
                  <span className="text-xs font-semibold text-white/95 mt-1.5 block">Events</span>
                </div>
              </div>
            </div>
          </div>

          {/* Row 2: Hero Institutional Spotlight (~58%) + Metrics Stack (~42%) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch flex-1">
            {/* Left: Academic Institutional Spotlight Banner (~58% - 7 Cols) */}
            <div className="lg:col-span-7 bg-white rounded-[22px] border border-[#EBF0F5] p-6 shadow-[0_2px_14px_rgba(19,32,51,0.03)] flex flex-col justify-between relative overflow-hidden min-h-[360px]">
              {/* Inner card representing institutional pride and academic standing */}
              <div className="w-full h-full rounded-[16px] bg-gradient-to-r from-[#FFFDF7] via-[#FFFDF9] to-[#FFF6ED] border border-[#F6E7D2] p-7 flex flex-col justify-between relative overflow-hidden">
                {/* Pagination Dots */}
                <div className="absolute top-4 right-4 flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#FF7555]" />
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-300" />
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-300" />
                </div>

                {/* Main Headline & Badge */}
                <div>
                  <span className="text-xs font-black uppercase tracking-widest text-[#132033] block">
                    CBSE MERIT EXCELLENCE
                  </span>
                  <div className="flex items-center gap-5 mt-4">
                    <div className="flex items-baseline">
                      <span className="text-5xl md:text-6xl font-black text-[#D4AF37] leading-none">
                        1
                      </span>
                      <span className="text-2xl font-bold text-[#D4AF37]">st</span>
                    </div>
                    <div>
                      <h3 className="text-lg md:text-xl font-extrabold text-[#132033] leading-tight">
                        IN REGION • TOP CBSE SECONDARY SCHOOL
                      </h3>
                      <p className="text-xs text-[#6F7D8D] font-medium leading-relaxed mt-1">
                        100% Board Examination Pass Rate with 38 Distinction Scholars in Class 10
                      </p>
                    </div>
                  </div>
                </div>

                {/* Footer text with Pre-board Schedule Announcement */}
                <div className="pt-4 border-t border-[#F6E7D2]/80 text-xs text-[#6F7D8D] font-medium flex items-center justify-between">
                  <span>Theory examinations for Class 10 Pre-Boards commence from Oct 12, 2026</span>
                  <span className="text-[#FF7555] font-bold cursor-pointer hover:underline">
                    View Date Sheet →
                  </span>
                </div>
              </div>
            </div>

            {/* Right: Metrics Stack (CGPA + Attendance Donut Cards + Due Fee) (~42% - 5 Cols) */}
            <div className="lg:col-span-5 flex flex-col justify-between gap-4">
              {/* Top Row: Two Large Donut Cards Side-by-Side */}
              <div className="grid grid-cols-2 gap-4 flex-1">
                {/* 1. CGPA Donut Card */}
                <div className="bg-white rounded-[22px] border border-[#EBF0F5] p-5 shadow-[0_2px_14px_rgba(19,32,51,0.03)] flex flex-col justify-between">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <div className="flex items-center gap-1.5 font-bold text-[#132033]">
                      <FileText className="w-4 h-4 text-[#132033]" />
                      <span className="text-xs font-bold">Cumulative GPA</span>
                    </div>
                    <span className="font-extrabold text-[#1F51FF] text-sm">8.42</span>
                  </div>

                  {/* Donut Chart Indicator (Amber/Orange) */}
                  <div className="flex items-center justify-center my-2">
                    <div className="relative w-[112px] h-[112px]">
                      <svg className="w-[112px] h-[112px] -rotate-90">
                        <circle cx="56" cy="56" r="44" stroke="#FDF6ED" strokeWidth="10" fill="transparent" />
                        <circle
                          cx="56"
                          cy="56"
                          r="44"
                          stroke="#FFA756"
                          strokeWidth="10"
                          strokeDasharray="276.4"
                          strokeDashoffset={276.4 - (276.4 * 84.2) / 100}
                          strokeLinecap="round"
                          fill="transparent"
                        />
                      </svg>
                      <span className="absolute inset-0 flex items-center justify-center text-sm font-extrabold text-[#132033]">
                        8.42
                      </span>
                    </div>
                  </div>

                  <div className="text-center">
                    <span className="text-xs text-[#8FA0B2] font-medium">Top 5% of Class 10-A</span>
                  </div>
                </div>

                {/* 2. Attendance Donut Card */}
                <div className="bg-white rounded-[22px] border border-[#EBF0F5] p-5 shadow-[0_2px_14px_rgba(19,32,51,0.03)] flex flex-col justify-between">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <div className="flex items-center gap-1.5 font-bold text-[#132033]">
                      <Calendar className="w-4 h-4 text-[#132033]" />
                      <span className="text-xs font-bold">Attendance</span>
                    </div>
                    <span className="font-extrabold text-[#1F51FF] text-sm">88.5%</span>
                  </div>

                  {/* Donut Chart Indicator (Emerald Green) */}
                  <div className="flex items-center justify-center my-2">
                    <div className="relative w-[112px] h-[112px]">
                      <svg className="w-[112px] h-[112px] -rotate-90">
                        <circle cx="56" cy="56" r="44" stroke="#F7EEEE" strokeWidth="10" fill="transparent" />
                        <circle
                          cx="56"
                          cy="56"
                          r="44"
                          stroke="#26C281"
                          strokeWidth="10"
                          strokeDasharray="276.4"
                          strokeDashoffset={276.4 - (276.4 * 88.5) / 100}
                          strokeLinecap="round"
                          fill="transparent"
                        />
                      </svg>
                      <span className="absolute inset-0 flex items-center justify-center text-sm font-extrabold text-[#132033]">
                        88.5%
                      </span>
                    </div>
                  </div>

                  <div className="text-center">
                    <span className="text-xs text-[#26C281] font-bold">Eligible (142/160 Days)</span>
                  </div>
                </div>
              </div>

              {/* Bottom Row: Due Fee Horizontal Card */}
              <div className="bg-white rounded-[22px] border border-[#EBF0F5] px-6 py-4 shadow-[0_2px_14px_rgba(19,32,51,0.03)] flex items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-full bg-[#132033] text-white flex items-center justify-center font-bold text-sm shrink-0">
                    ₹
                  </div>
                  <div className="flex items-center gap-2.5">
                    <span className="text-sm font-bold text-[#132033]">Due Fee</span>
                    <span className="text-sm font-bold text-[#26C281]">Nil Due</span>
                    <span className="text-xs font-semibold text-[#26C281] bg-emerald-50 px-2.5 py-0.5 rounded-full">
                      Paid
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-xs text-[#8FA0B2] hidden sm:inline">Q3 Due: 10 Oct</span>
                  <button className="px-4 py-2 rounded-full text-xs font-semibold bg-[#F4F8FA] text-[#8FA0B2] border border-[#E2E8F0] cursor-not-allowed">
                    Pay Fee
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ================================================================== */}
        {/* SCREEN 2: ACADEMIC ENGAGEMENT VIEWPORT (Subjects + Schedule)       */}
        {/* Generously sized 3-card subject carousel + 6 Tiles + Timetable    */}
        {/* ================================================================== */}
        <section className="min-h-[calc(100vh-130px)] flex flex-col justify-between space-y-6 pt-4">
          {/* Row 1: Spacious 3-Card Subject Carousel Strip */}
          <div className="relative">
            {/* Blue Carousel Navigation Arrows */}
            <button
              onClick={() => setActiveSubjectIndex(Math.max(0, activeSubjectIndex - 1))}
              aria-label="Previous subjects"
              className="absolute -left-4 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-white border border-[#D0E1FD] text-[#1F51FF] flex items-center justify-center shadow-md hover:bg-slate-50 transition-all"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() =>
                setActiveSubjectIndex(Math.min(subjects.length - 3, activeSubjectIndex + 1))
              }
              aria-label="Next subjects"
              className="absolute -right-4 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-white border border-[#D0E1FD] text-[#1F51FF] flex items-center justify-center shadow-md hover:bg-slate-50 transition-all"
            >
              <ChevronRight className="w-5 h-5" />
            </button>

            {/* 3 Spacious Subject Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {subjects.slice(activeSubjectIndex, activeSubjectIndex + 3).map((subj) => (
                <div
                  key={subj.code}
                  className="bg-white rounded-[22px] border border-[#EBF0F5] p-6 shadow-[0_2px_12px_rgba(19,32,51,0.02)] flex flex-col justify-between min-h-[110px]"
                >
                  {/* Top line: Code + Percentage + Horizontal Progress Bar */}
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-base font-bold text-[#132033]">{subj.code}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-semibold text-[#132033]">{subj.percent}%</span>
                      <div className="w-24 sm:w-28 h-2 bg-[#E8F5E9] rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#26C281] rounded-full"
                          style={{ width: `${subj.percent}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Bottom line: Subject Title */}
                  <p className="text-xs font-bold uppercase tracking-wider text-[#6F7D8D] mt-3 truncate">
                    {subj.name}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Row 2: 6 Coral Quick-Access Tiles (38%) + Upcoming Schedule (62%) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch flex-1">
            {/* Left: 6 Coral Quick-Access Tiles (2 rows x 3 columns) */}
            <div className="lg:col-span-5 grid grid-cols-3 gap-4">
              {[
                {
                  title: 'Syllabus\n2026',
                  icon: GraduationCap,
                  accent: 'yellow',
                },
                {
                  title: 'School\nDiary',
                  icon: BookOpen,
                  accent: 'peach',
                },
                {
                  title: 'Examination\nRules',
                  icon: FileCheck2,
                  accent: 'cyan',
                },
                {
                  title: 'Holiday\nList',
                  icon: Compass,
                  accent: 'cyan',
                },
                {
                  title: 'Bus\nRoutes',
                  icon: Bus,
                  accent: 'peach',
                },
                {
                  title: 'Leave\nRequest',
                  icon: ShieldCheck,
                  accent: 'yellow',
                },
              ].map((tile, idx) => {
                const IconComp = tile.icon;
                return (
                  <button
                    key={idx}
                    className="relative overflow-hidden bg-[#FF7555] text-white rounded-[22px] p-4 min-h-[125px] flex flex-col justify-between text-left shadow-[0_4px_14px_rgba(255,117,85,0.2)] hover:opacity-95 transition-all group"
                  >
                    {/* Decorative Corner Art */}
                    {tile.accent === 'cyan' && (
                      <svg
                        className="absolute top-0 right-0 w-12 h-12 pointer-events-none"
                        viewBox="0 0 40 40"
                        fill="none"
                      >
                        <path
                          d="M40 0H12C12 18 22 28 40 28V0Z"
                          fill="#35C1E8"
                          fillOpacity="0.85"
                        />
                      </svg>
                    )}
                    {tile.accent === 'yellow' && (
                      <svg
                        className="absolute top-0 right-0 w-12 h-12 pointer-events-none"
                        viewBox="0 0 40 40"
                        fill="none"
                      >
                        <path
                          d="M40 0H15C15 16 24 25 40 25V0Z"
                          fill="#FDCB6E"
                          fillOpacity="0.45"
                        />
                      </svg>
                    )}
                    {tile.accent === 'peach' && (
                      <svg
                        className="absolute top-0 right-0 w-12 h-12 pointer-events-none"
                        viewBox="0 0 40 40"
                        fill="none"
                      >
                        <path
                          d="M40 0H16C16 16 26 26 40 26V0Z"
                          fill="#FFA07A"
                          fillOpacity="0.4"
                        />
                      </svg>
                    )}

                    <IconComp className="w-5 h-5 text-white/95" />
                    <span className="text-xs font-bold leading-tight whitespace-pre-line text-white/95">
                      {tile.title}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Right: Upcoming Schedule Card (~62% - 7 Cols) */}
            <div className="lg:col-span-7 bg-white rounded-[22px] border border-[#EBF0F5] p-6 shadow-[0_2px_14px_rgba(19,32,51,0.03)] flex flex-col justify-between">
              {/* Header with Eye Icon */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2.5">
                  <Calendar className="w-5 h-5 text-[#132033]" />
                  <h3 className="text-base font-extrabold text-[#132033]">Upcoming Schedule</h3>
                </div>
                <Eye className="w-4 h-4 text-[#6F7D8D] cursor-pointer hover:text-[#132033]" />
              </div>

              {/* Time Segment Filter Tabs */}
              <div className="flex items-center gap-2 mb-4">
                <button
                  onClick={() => setActiveScheduleTab('8-12')}
                  className={`px-6 py-2 rounded-[12px] text-xs font-bold transition-all ${
                    activeScheduleTab === '8-12'
                      ? 'bg-[#FF7555] text-white shadow-xs'
                      : 'text-[#132033] hover:bg-[#F4F8FA]'
                  }`}
                >
                  8 To 12
                </button>
                <button
                  onClick={() => setActiveScheduleTab('12-3')}
                  className={`px-6 py-2 rounded-[12px] text-xs font-bold transition-all ${
                    activeScheduleTab === '12-3'
                      ? 'bg-[#FF7555] text-white shadow-xs'
                      : 'text-[#132033] hover:bg-[#F4F8FA]'
                  }`}
                >
                  12 To 3
                </button>
                <button
                  onClick={() => setActiveScheduleTab('3-6')}
                  className={`px-6 py-2 rounded-[12px] text-xs font-bold transition-all ${
                    activeScheduleTab === '3-6'
                      ? 'bg-[#FF7555] text-white shadow-xs'
                      : 'text-[#132033] hover:bg-[#F4F8FA]'
                  }`}
                >
                  3 To 6
                </button>
              </div>

              {/* Schedule Item Rows with Vertical Green Accent Line */}
              <div className="space-y-3.5">
                {[
                  {
                    type: 'Lecture',
                    subject: 'Mathematics (Algebra)',
                    code: 'MATH-041',
                    room: 'Room 204',
                    section: '10-A',
                    teacher: 'Dr. Neha Verma',
                    time: '08:30-09:15 AM',
                  },
                  {
                    type: 'Practical',
                    subject: 'Science Lab (Physics Experiment)',
                    code: 'SCI-086',
                    room: 'Physics Lab 2',
                    section: '10-A',
                    teacher: 'Prof. S. K. Gupta',
                    time: '09:20-10:05 AM',
                  },
                  {
                    type: 'Lecture',
                    subject: 'English Language & Lit.',
                    code: 'ENG-184',
                    room: 'Room 204',
                    section: '10-A',
                    teacher: 'Ms. Sunita Roy',
                    time: '10:10-10:55 AM',
                  },
                ].map((row, index) => (
                  <div
                    key={index}
                    className="bg-[#FAFCFE] border border-[#EEF2F6] border-l-4 border-l-[#26C281] rounded-[14px] p-4 flex flex-col justify-between"
                  >
                    <p className="text-xs font-medium text-[#132033]">
                      Class Type: <span className="font-bold">{row.type}</span> | Subject:{' '}
                      <span className="font-bold">{row.code}</span> | Room No:{' '}
                      <span className="font-bold">{row.room}</span> | Section:{' '}
                      <span className="font-bold">{row.section}</span>
                    </p>
                    <div className="flex items-center justify-between text-xs text-[#6F7D8D] mt-2 font-medium">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-[#26C281]" />
                        <span>{row.time}</span>
                      </div>
                      <span className="text-[#132033] font-bold">{row.teacher}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ================================================================== */}
        {/* SCREEN 3: ANNOUNCEMENTS VIEWPORT (Full-Width Institutional Board)  */}
        {/* Fills the screen with dense, structured notices and categories    */}
        {/* ================================================================== */}
        <section className="min-h-[calc(100vh-130px)] flex flex-col justify-between pt-4">
          <div className="bg-white rounded-[24px] border border-[#EBF0F5] p-8 shadow-[0_2px_16px_rgba(19,32,51,0.03)] flex-1 flex flex-col justify-between">
            <div>
              {/* Header */}
              <div className="flex items-center gap-3 mb-5">
                <Megaphone className="w-5 h-5 text-[#132033]" />
                <h3 className="text-base font-extrabold text-[#132033]">Announcements</h3>
              </div>

              {/* Underlined Category Tabs */}
              <div className="flex items-center gap-8 border-b border-[#F0F4F8] overflow-x-auto text-xs pb-1 mb-4">
                {[
                  { id: 'Academic', label: 'Academic (12)' },
                  { id: 'Administrative', label: 'Administrative/Circulars (4)' },
                  { id: 'Co-Curricular', label: 'Co-Curricular & Sports (8)' },
                  { id: 'Examination', label: 'Examination (3)' },
                  { id: 'Services', label: 'Student Services (6)' },
                ].map((tab) => {
                  const isActive = activeAnnouncementTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveAnnouncementTab(tab.id as typeof activeAnnouncementTab)}
                      className={`py-2.5 px-1 font-bold whitespace-nowrap transition-all border-b-2 -mb-[2px] ${
                        isActive
                          ? 'border-[#FF7555] text-[#FF7555]'
                          : 'border-transparent text-[#132033] hover:text-[#FF7555]'
                      }`}
                    >
                      {tab.label}
                    </button>
                  );
                })}
              </div>

              {/* Bordered Notice Box */}
              <div className="rounded-[20px] border border-[#EBF0F5] overflow-hidden divide-y divide-[#F1F5F9] text-xs">
                {[
                  {
                    id: 1,
                    title:
                      'CBSE Class 10 Pre-Board Examination Schedule & Guidelines Released ( DPS/ACAD/2026/089 )',
                    date: '22 Sept 2026',
                  },
                  {
                    id: 2,
                    title:
                      'Inter-School Science & Mathematics Olympiad 2026-27 Registrations Open ( DPS/OLY/2026/042 )',
                    date: '22 Sept 2026',
                  },
                  {
                    id: 3,
                    title:
                      'Quarterly Fee Payment Window for Term 3 (Oct-Dec) is Now Active ( DPS/FEE/2026/015 )',
                    date: '22 Sept 2026',
                  },
                  {
                    id: 4,
                    title:
                      'Annual Athletic Meet & Sports Day Trials for Classes 9 & 10 ( DPS/SPT/2026/007 )',
                    date: '22 Sept 2026',
                  },
                  {
                    id: 5,
                    title:
                      'Parent-Teacher Meeting (PTM) for Term 1 Performance Review ( DPS/ADMIN/2026/033 )',
                    date: '22 Sept 2026',
                  },
                  {
                    id: 6,
                    title:
                      'Workshop on Vedic Mathematics and Speed Calculation Techniques ( DPS/WKSH/2026/004 )',
                    date: '22 Sept 2026',
                  },
                  {
                    id: 7,
                    title:
                      'Cyber Safety & Responsible Social Media Usage Awareness Session ( DPS/COUNS/2026/012 )',
                    date: '22 Sept 2026',
                  },
                  {
                    id: 8,
                    title:
                      'Remedial Support and Doubt Clearing Schedule for Secondary Board Classes ( DPS/ACAD/2026/092 )',
                    date: '22 Sept 2026',
                  },
                  {
                    id: 9,
                    title:
                      'CBSE Science Exhibition Project Submissions & Guidelines ( DPS/SCI/2026/018 )',
                    date: '21 Sept 2026',
                  },
                  {
                    id: 10,
                    title:
                      'Library Book Return & Digital Resource Access Renewal Notice ( DPS/LIB/2026/005 )',
                    date: '20 Sept 2026',
                  },
                ].map((notice) => (
                  <div
                    key={notice.id}
                    className="py-3.5 px-5 flex items-center justify-between hover:bg-[#FAFCFE] cursor-pointer transition-colors group"
                  >
                    <div className="flex items-center gap-3.5 min-w-0 pr-4">
                      <span className="text-[#132033] text-sm leading-none">•</span>
                      <span className="text-xs font-semibold text-[#132033] group-hover:text-[#FF7555] truncate">
                        {notice.title}
                      </span>
                    </div>
                    <div className="flex items-center gap-3.5 shrink-0">
                      <span className="text-xs font-bold text-[#FF7555]">{notice.date}</span>
                      <ChevronDown className="w-4 h-4 text-[#8FA0B2] group-hover:text-[#132033]" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom Status Summary */}
            <div className="pt-4 flex items-center justify-between text-xs text-[#6F7D8D] border-t border-slate-100 mt-4">
              <span>Showing 10 of 12 active notices</span>
              <span className="text-[#FF7555] font-bold cursor-pointer hover:underline">
                View Archive Circulars →
              </span>
            </div>
          </div>
        </section>

        {/* ================================================================== */}
        {/* SCREEN 4: FACULTY / MENTORS VIEWPORT (Know Your School Authorities)*/}
        {/* 4 large, prominent profile cards filling the final screen view      */}
        {/* ================================================================== */}
        <section className="min-h-[calc(100vh-130px)] flex flex-col justify-between pt-4">
          <div className="relative flex-1 flex flex-col justify-between">
            {/* Blue Navigation Side Chevrons */}
            <button
              aria-label="Previous authority"
              className="absolute -left-4 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-white border border-[#D0E1FD] text-[#1F51FF] flex items-center justify-center shadow-md hover:bg-slate-50 transition-all"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              aria-label="Next authority"
              className="absolute -right-4 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-white border border-[#D0E1FD] text-[#1F51FF] flex items-center justify-center shadow-md hover:bg-slate-50 transition-all"
            >
              <ChevronRight className="w-5 h-5" />
            </button>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch flex-1">
              {[
                {
                  roleBadge: 'Head of Institution',
                  name: 'Dr. Anandita Sen',
                  designation: 'Principal',
                  department: 'Senior Wing & General Administration',
                  email: 'principal@dpsdelhi.edu.in',
                  phone: '+91 11 2345 6789',
                },
                {
                  roleBadge: 'Vice Principal',
                  name: 'Mr. Arvind Saxena',
                  designation: 'Academic Supervisor',
                  department: 'Curriculum & Examination Affairs',
                  email: 'viceprincipal@dpsdelhi.edu.in',
                  phone: '+91 11 2345 6790',
                },
                {
                  roleBadge: 'Class 10-A Mentor',
                  name: 'Dr. Neha Verma',
                  designation: 'Class Teacher & PGT Mathematics',
                  department: 'Department of Mathematics',
                  email: 'nverma@dpsdelhi.edu.in',
                  phone: '+91 98112 34567',
                },
                {
                  roleBadge: 'Grievance Officer',
                  name: 'Dr. S. K. Gupta',
                  designation: 'HOD Science',
                  department: 'Department of Sciences',
                  email: 'skgupta@dpsdelhi.edu.in',
                  phone: '+91 98223 45678',
                },
              ].map((person, idx) => (
                <div
                  key={idx}
                  className="bg-white rounded-[24px] border border-[#EBF0F5] p-7 text-center shadow-[0_2px_16px_rgba(19,32,51,0.03)] flex flex-col justify-between min-h-[440px]"
                >
                  <div>
                    {/* Circular Portrait Frame with Teacher Illustration */}
                    <div className="w-24 h-24 rounded-full bg-[#F4F8FA] border-2 border-slate-200 mx-auto flex items-center justify-center shadow-sm mb-4 overflow-hidden relative">
                      <img
                        src="/teacher-avatar.jpg"
                        alt={person.name}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Role Pill Badge */}
                    <span className="inline-block px-5 py-1.5 rounded-full text-xs font-bold bg-[#FFF2EE] text-[#132033] mb-3">
                      {person.roleBadge}
                    </span>

                    {/* Name & Designation */}
                    <h4 className="text-base font-extrabold text-[#132033] leading-tight">
                      {person.name}
                    </h4>
                    <p className="text-xs font-semibold text-[#132033] mt-1">
                      {person.designation}
                    </p>
                    <p className="text-xs text-[#6F7D8D] mt-2 mb-4 leading-relaxed">
                      {person.department}
                    </p>

                    {/* Contact Info with Icons */}
                    <div className="space-y-2 text-xs text-[#132033] font-medium flex flex-col items-center">
                      <div className="flex items-center gap-2 text-xs">
                        <Mail className="w-4 h-4 text-[#132033]" />
                        <span className="text-[#132033]">{person.email}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs">
                        <Phone className="w-4 h-4 text-[#132033]" />
                        <span className="text-[#132033]">{person.phone}</span>
                      </div>
                    </div>
                  </div>

                  {/* Pill Action Button */}
                  <button className="mt-6 w-fit mx-auto px-7 py-2 rounded-full text-xs font-bold text-[#FF7555] bg-white border border-[#FFE3DB] hover:bg-[#FF7555] hover:text-white transition-all shadow-2xs">
                    Rate Mentor
                  </button>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* ==================================================================== */}
      {/* FLOATING ACTION ICONS ON RIGHT EDGE                                  */}
      {/* ==================================================================== */}
      <div className="fixed right-4 bottom-8 z-50 flex flex-col gap-3">
        <button
          aria-label="Activity tracker"
          className="w-11 h-11 rounded-full bg-[#FF7555] text-white flex items-center justify-center shadow-lg hover:scale-105 transition-transform"
        >
          <Footprints className="w-5 h-5" />
        </button>
        <button
          aria-label="Report issue"
          className="w-11 h-11 rounded-full bg-[#FF7555] text-white flex items-center justify-center shadow-lg hover:scale-105 transition-transform"
        >
          <Bug className="w-5 h-5" />
        </button>
        <button
          aria-label="Settings"
          className="w-11 h-11 rounded-full bg-[#FF7555] text-white flex items-center justify-center shadow-lg hover:scale-105 transition-transform"
        >
          <Settings className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
