'use client';

import React, { useState } from 'react';
import { Menu, Bell, Search, LogOut, ShieldCheck, User } from 'lucide-react';
import { logoutAction } from '@/actions/auth';

interface AdminHeaderProps {
  onToggleSidebar: () => void;
  adminName: string;
  adminEmail: string;
  role: string;
}

export default function AdminHeader({
  onToggleSidebar,
  adminName,
  adminEmail,
  role,
}: AdminHeaderProps) {
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleSignOut = async () => {
    setIsLoggingOut(true);
    await logoutAction();
  };

  const todayStr = new Intl.DateTimeFormat('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date());

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-[#EBF0F5] px-4 md:px-8 py-3.5 flex items-center justify-between shadow-2xs">
      {/* Left: Mobile Sidebar Hamburger & Date / Breadcrumb */}
      <div className="flex items-center gap-3 md:gap-4">
        <button
          onClick={onToggleSidebar}
          className="p-2 rounded-xl text-slate-600 hover:text-[#111C2D] hover:bg-slate-100 lg:hidden transition-colors"
          aria-label="Open navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-[#111C2D]">Delhi Public School</span>
            <span className="text-xs text-slate-300">•</span>
            <span className="text-xs font-semibold text-[#FF7555] bg-[#FFF2EE] px-2.5 py-0.5 rounded-full">
              Operations Center
            </span>
          </div>
          <p className="text-[11px] text-slate-500 font-medium hidden sm:block mt-0.5">
            {todayStr} • Term 1 Session Active
          </p>
        </div>
      </div>

      {/* Right: Quick Search, Bell, Profile & Sign Out */}
      <div className="flex items-center gap-3 md:gap-5">
        {/* Quick Search */}
        <div className="hidden md:flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#F4F8FA] border border-[#D9E2EC] text-slate-500 text-xs w-48 lg:w-64 focus-within:border-[#FF7555] focus-within:bg-white transition-all">
          <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <input
            type="text"
            placeholder="Search student, adm no, staff..."
            className="bg-transparent border-none outline-none w-full text-xs text-[#111C2D] placeholder:text-slate-400"
          />
        </div>

        {/* Notification Bell */}
        <button
          aria-label="View notifications"
          className="relative p-2 rounded-xl text-slate-500 hover:text-[#111C2D] hover:bg-slate-100 transition-colors"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#FF7555] ring-2 ring-white" />
        </button>

        {/* Admin Profile Chip */}
        <div className="flex items-center gap-2.5 pl-3 border-l border-slate-200">
          <div className="w-8 h-8 rounded-full bg-[#111C2D] text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
            {adminName.charAt(0)}
          </div>
          <div className="hidden sm:flex flex-col text-left">
            <span className="text-xs font-bold text-[#111C2D] leading-tight truncate max-w-[130px]">
              {adminName}
            </span>
            <span className="text-[10px] text-slate-500 font-medium leading-tight">
              {role === 'ADMIN' ? 'School Administrator' : 'Platform SuperAdmin'}
            </span>
          </div>

          <button
            onClick={handleSignOut}
            disabled={isLoggingOut}
            className="p-1.5 rounded-lg text-slate-500 hover:text-[#FF7555] hover:bg-[#FFF2EE] transition-colors ml-1 disabled:opacity-50"
            title="Sign Out of Admin Console"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
