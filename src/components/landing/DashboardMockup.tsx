import React from 'react';
import {
  LayoutDashboard,
  GraduationCap,
  FileEdit,
  FileText,
  Clock,
  BookOpen,
  CreditCard,
  CalendarCheck,
  Send,
  Calendar,
  Bus,
  User,
  Bell,
  Search,
  CheckCircle2,
  FileCheck,
  Palmtree,
  Sparkles,
} from 'lucide-react';

export default function DashboardMockup() {
  const sidebarItems = [
    { name: 'Dashboard', icon: LayoutDashboard, active: true },
    { name: 'My Classes', icon: GraduationCap },
    { name: 'Assignments', icon: FileEdit },
    { name: 'Exams & Results', icon: FileText },
    { name: 'Timetable', icon: Clock },
    { name: 'Study Materials', icon: BookOpen },
    { name: 'Fees & Payments', icon: CreditCard },
    { name: 'Attendance', icon: CalendarCheck },
    { name: 'Leave & Apply', icon: Send },
    { name: 'Events & Activities', icon: Calendar },
    { name: 'Transport', icon: Bus },
    { name: 'Profile', icon: User },
  ];

  return (
    <div className="w-full bg-[#e8f4fd] p-3 sm:p-5 rounded-3xl border border-blue-100 shadow-[0_20px_50px_rgba(29,140,253,0.12)]">
      <div className="flex gap-3 sm:gap-4 items-stretch select-none text-left">
        {/* Left Sidebar Mockup */}
        <div className="w-44 sm:w-48 bg-white rounded-2xl p-3 border border-slate-100 shadow-xs hidden md:flex flex-col justify-between flex-shrink-0">
          <div>
            {/* School Branding */}
            <div className="flex items-center gap-2 px-1 py-1.5 mb-3 border-b border-slate-100 pb-3">
              <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center text-white flex-shrink-0 shadow-xs">
                <BookOpen className="w-4 h-4" />
              </div>
              <div className="overflow-hidden">
                <div className="text-[11px] font-bold text-slate-900 truncate leading-tight">
                  Sunrise Public School
                </div>
                <div className="text-[9px] text-slate-400 font-medium truncate">
                  Learn • Grow • Excel
                </div>
              </div>
            </div>

            {/* Menu List */}
            <div className="space-y-0.5">
              {sidebarItems.map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.name}
                    className={`flex items-center gap-2.5 px-2.5 py-1.5 rounded-xl text-[11px] font-medium transition-colors ${
                      item.active
                        ? 'bg-[#1d8cfd] text-white shadow-xs font-semibold'
                        : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5 flex-shrink-0" />
                    <span className="truncate">{item.name}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Dashboard Content */}
        <div className="flex-1 bg-white rounded-2xl p-4 sm:p-5 border border-slate-100 shadow-xs flex flex-col justify-between">
          <div>
            {/* Top Bar inside Mockup */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <span className="text-[13px] font-bold text-slate-800">Dashboard</span>
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                  <Search className="w-3.5 h-3.5" />
                </div>
                <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 relative">
                  <Bell className="w-3.5 h-3.5" />
                  <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-amber-500" />
                </div>
              </div>
            </div>

            {/* Teacher Greeting Header */}
            <div className="flex items-center justify-between mt-3.5">
              <div className="flex items-center gap-2.5">
                {/* Crisp Avatar Vector */}
                <div className="w-10 h-10 rounded-full border-2 border-blue-500 overflow-hidden flex-shrink-0 bg-blue-100 flex items-center justify-center">
                  <svg viewBox="0 0 40 40" className="w-full h-full">
                    <circle cx="20" cy="20" r="20" fill="#bae6fd" />
                    {/* Head & Neck */}
                    <circle cx="20" cy="16" r="7" fill="#fca5a5" />
                    {/* Hair */}
                    <path d="M14 15 Q14 9 20 9 Q26 9 26 15 Q24 11 20 11 Q16 11 14 15 Z" fill="#0f172a" />
                    {/* Shirt */}
                    <path d="M10 34 Q20 28 30 34 Z" fill="#1d8cfd" />
                  </svg>
                </div>
                <div>
                  <div className="text-[11px] text-slate-400 font-medium leading-none">Hello,</div>
                  <div className="text-[13.5px] font-bold text-slate-900 leading-tight flex items-center gap-1.5 mt-0.5">
                    <span>Sanjay Yadav</span>
                    <span className="text-[11px] font-medium text-slate-500">(Teacher)</span>
                  </div>
                </div>
              </div>
              <div className="w-7 h-7 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-500">
                <Sparkles className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* Mint Green Check-in Card */}
            <div className="mt-3.5 bg-[#edfdef] border border-emerald-200/70 rounded-2xl p-3.5">
              <div className="flex items-center justify-between text-[10px] text-slate-600 font-semibold border-b border-emerald-200/50 pb-2">
                <div className="flex items-center gap-1.5">
                  <span className="bg-emerald-600 text-white text-[9px] px-1.5 py-0.5 rounded font-bold">
                    SHIFT: TODAY
                  </span>
                  <span>General (09:00 AM - 04:00 PM)</span>
                </div>
                <span className="text-emerald-800">28 Jun (Tuesday)</span>
              </div>

              <div className="flex items-center justify-between mt-2.5">
                <div>
                  <div className="text-[20px] font-extrabold text-slate-900 tracking-tight font-mono">
                    07:14:54
                  </div>
                  <div className="text-[10px] text-emerald-700 font-medium flex items-center gap-1 mt-0.5">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    <span>Check-in time: 08:30 AM</span>
                  </div>
                </div>
                <button
                  type="button"
                  className="px-3.5 py-1 text-[11px] font-bold text-rose-500 bg-white border border-rose-300 rounded-full shadow-xs hover:bg-rose-50"
                >
                  Check-out
                </button>
              </div>
            </div>

            {/* 4 Circular Quick Actions */}
            <div className="grid grid-cols-4 gap-2 mt-4 text-center">
              {/* Action 1 */}
              <div className="flex flex-col items-center">
                <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center shadow-xs">
                  <Send className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-semibold text-slate-700 mt-1.5 leading-tight">
                  Apply Leave
                </span>
              </div>
              {/* Action 2 */}
              <div className="flex flex-col items-center">
                <div className="w-10 h-10 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center shadow-xs">
                  <FileCheck className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-semibold text-slate-700 mt-1.5 leading-tight">
                  View Pay Slip
                </span>
              </div>
              {/* Action 3 */}
              <div className="flex flex-col items-center">
                <div className="w-10 h-10 rounded-full bg-cyan-100 text-cyan-600 flex items-center justify-center shadow-xs">
                  <Clock className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-semibold text-slate-700 mt-1.5 leading-tight">
                  Leave Balance
                </span>
              </div>
              {/* Action 4 */}
              <div className="flex flex-col items-center">
                <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-500 flex items-center justify-center shadow-xs">
                  <Palmtree className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-semibold text-slate-700 mt-1.5 leading-tight">
                  Holidays List
                </span>
              </div>
            </div>

            {/* My Activities Section */}
            <div className="mt-4 pt-1">
              <div className="text-[12px] font-bold text-[#1d8cfd] mb-2.5">My Activities</div>
              <div className="grid grid-cols-2 gap-2.5">
                {/* Activity 1 */}
                <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-amber-400 to-amber-500 p-3 text-white shadow-xs">
                  <div className="relative z-10">
                    <div className="text-[12px] font-bold leading-tight">Today&apos;s</div>
                    <div className="text-[11px] font-medium opacity-90 leading-tight">Schedule</div>
                  </div>
                  {/* Subtle Circular Highlight & Illustrated Graphic */}
                  <div className="absolute right-0 top-0 bottom-0 w-16 bg-white/20 rounded-l-full flex items-center justify-center">
                    <svg viewBox="0 0 50 50" className="w-10 h-10">
                      <circle cx="25" cy="20" r="8" fill="#fca5a5" />
                      <path d="M19 18 Q19 12 25 12 Q31 12 31 18 Z" fill="#0f172a" />
                      <path d="M15 38 Q25 30 35 38 Z" fill="#ffffff" />
                      <polygon points="32,24 42,20 42,28" fill="#fef08a" />
                    </svg>
                  </div>
                </div>

                {/* Activity 2 */}
                <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-cyan-500 to-blue-500 p-3 text-white shadow-xs">
                  <div className="relative z-10">
                    <div className="text-[12px] font-bold leading-tight">Mark class</div>
                    <div className="text-[11px] font-medium opacity-90 leading-tight">Attendance</div>
                  </div>
                  <div className="absolute right-0 top-0 bottom-0 w-16 bg-white/20 rounded-l-full flex items-center justify-center">
                    <svg viewBox="0 0 50 50" className="w-10 h-10">
                      <circle cx="25" cy="20" r="8" fill="#fca5a5" />
                      <path d="M19 18 Q19 12 25 12 Q31 12 31 18 Z" fill="#0f172a" />
                      <path d="M15 38 Q25 30 35 38 Z" fill="#ffffff" />
                      <rect x="30" y="22" width="12" height="15" rx="1.5" fill="#fef08a" stroke="#d97706" strokeWidth="1" />
                    </svg>
                  </div>
                </div>

                {/* Activity 3 */}
                <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-purple-500 to-indigo-500 p-3 text-white shadow-xs">
                  <div className="relative z-10">
                    <div className="text-[12px] font-bold leading-tight">Class Sections</div>
                    <div className="text-[11px] font-medium opacity-90 leading-tight">under you</div>
                  </div>
                  <div className="absolute right-0 top-0 bottom-0 w-16 bg-white/20 rounded-l-full flex items-center justify-center">
                    <svg viewBox="0 0 50 50" className="w-10 h-10">
                      <circle cx="25" cy="20" r="8" fill="#fca5a5" />
                      <path d="M19 18 Q19 12 25 12 Q31 12 31 18 Z" fill="#0f172a" />
                      <path d="M15 38 Q25 30 35 38 Z" fill="#ffffff" />
                      <rect x="18" y="28" width="14" height="12" rx="2" fill="#1d8cfd" />
                    </svg>
                  </div>
                </div>

                {/* Activity 4 */}
                <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 p-3 text-white shadow-xs">
                  <div className="relative z-10">
                    <div className="text-[12px] font-bold leading-tight">Class</div>
                    <div className="text-[11px] font-medium opacity-90 leading-tight">under you</div>
                  </div>
                  <div className="absolute right-0 top-0 bottom-0 w-16 bg-white/20 rounded-l-full flex items-center justify-center">
                    <svg viewBox="0 0 50 50" className="w-10 h-10">
                      <circle cx="20" cy="18" r="6" fill="#fca5a5" />
                      <circle cx="32" cy="22" r="5" fill="#fca5a5" />
                      <path d="M12 38 Q20 30 28 38 Z" fill="#ffffff" />
                      <path d="M26 38 Q32 32 38 38 Z" fill="#fef08a" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
