'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Menu, Search, Bell, ChevronDown, LogOut, User, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import { logoutAction } from '@/actions/auth';
import AdminAvatar from './illustrations/AdminAvatar';
import NotificationBellDropdown from '@/components/notifications/NotificationBellDropdown';

interface AdminHeaderProps {
  onToggleSidebar: () => void;
  adminName?: string;
  adminEmail?: string;
  role?: string;
}

export default function AdminHeader({
  onToggleSidebar,
  adminName = 'Admin',
  adminEmail = 'admin@dpsdelhi.edu.in',
  role = 'ADMIN',
}: AdminHeaderProps) {
  const [searchValue, setSearchValue] = useState('');
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setProfileDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    setIsLoggingOut(true);
    await logoutAction();
  };

  return (
    <header className="w-full flex items-center justify-between gap-4 py-2 px-1">
      {/* Left: Mobile hamburger & Search bar */}
      <div className="flex items-center gap-3 flex-1 max-w-xl">
        <button
          onClick={onToggleSidebar}
          className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-white/80 lg:hidden transition-colors shadow-2xs bg-white"
          aria-label="Open navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Global Search Bar (White Rounded Pill) */}
        <div className="relative flex items-center bg-white rounded-full border border-white/80 shadow-[0_2px_12px_rgba(0,0,0,0.04)] px-4 py-2.5 w-full max-w-md focus-within:ring-2 focus-within:ring-[#0B72E7]/15 focus-within:border-[#0B72E7] transition-all">
          <Search className="w-4 h-4 text-slate-400 shrink-0 mr-3" />
          <input
            type="text"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            placeholder="Search students, teachers, classes, etc..."
            className="w-full text-[12.5px] text-slate-800 placeholder:text-slate-400 bg-transparent outline-none font-normal"
          />
        </div>
      </div>

      {/* Right: Notifications & Profile Pill */}
      <div className="flex items-center gap-4 shrink-0">
        {/* Notification Bell Dropdown */}
        <div className="relative">
          <NotificationBellDropdown notificationsPageUrl="/admin/notifications" />
        </div>

        {/* Admin Profile Area */}
        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setProfileDropdownOpen((prev) => !prev)}
            className="flex items-center gap-3 p-1 sm:pr-2.5 rounded-full hover:bg-white/70 transition-all cursor-pointer group"
          >
            {/* Illustrated Admin Avatar */}
            <AdminAvatar size={38} />

            {/* Admin Name & Subtitle */}
            <div className="hidden sm:flex flex-col text-left">
              <span className="text-[13px] font-bold text-slate-900 leading-tight">
                {adminName}
              </span>
              <span className="text-[11px] text-slate-400 font-medium leading-tight">
                {role === 'SUPER_ADMIN' ? 'Platform SuperAdmin' : 'School Administrator'}
              </span>
            </div>

            {/* Dropdown Chevron */}
            <ChevronDown className="w-4 h-4 text-slate-400 group-hover:text-slate-600 transition-transform ml-0.5" />
          </button>

          {/* Profile Dropdown Menu */}
          {profileDropdownOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-[0_10px_30px_rgba(15,23,42,0.12)] border border-slate-100 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100">
              <div className="px-4 py-2.5 border-b border-slate-100">
                <p className="text-xs font-bold text-slate-900">{adminName}</p>
                <p className="text-[11px] text-slate-400 truncate">{adminEmail}</p>
              </div>

              <div className="py-1">
                <Link
                  href="/admin/settings"
                  onClick={() => setProfileDropdownOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  <User className="w-4 h-4 text-slate-400" />
                  <span>Admin Profile</span>
                </Link>
                <Link
                  href="/admin/audit"
                  onClick={() => setProfileDropdownOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  <ShieldCheck className="w-4 h-4 text-slate-400" />
                  <span>Security & Audit</span>
                </Link>
              </div>

              <div className="border-t border-slate-100 pt-1">
                <button
                  type="button"
                  onClick={handleSignOut}
                  disabled={isLoggingOut}
                  className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  <span>{isLoggingOut ? 'Signing out...' : 'Sign Out'}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
