'use client';

import React, { useState } from 'react';
import { Search, Bell, ChevronDown, Menu, User, Settings, LogOut, Check } from 'lucide-react';
import type { ChildOption } from './StudentParentDashboardClient';

interface PortalHeaderProps {
  studentName: string;
  className: string;
  sectionName: string;
  avatarUrl?: string | null;
  unreadCount?: number;
  onOpenMobileMenu?: () => void;
  onSelectNav: (id: string) => void;
  onSignOut: () => void;
  isSigningOut?: boolean;
  parentContext?: {
    isParentView: boolean;
    parentName: string;
    relationship: string;
    children: ChildOption[];
  };
  onSelectChild?: (childId: string) => void;
  selectedChildId?: string;
  searchQuery?: string;
  onSearchChange?: (q: string) => void;
}

export default function PortalHeader({
  studentName,
  className,
  sectionName,
  avatarUrl,
  unreadCount = 2,
  onOpenMobileMenu,
  onSelectNav,
  onSignOut,
  isSigningOut = false,
  parentContext,
  onSelectChild,
  selectedChildId,
  searchQuery = '',
  onSearchChange,
}: PortalHeaderProps) {
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [childDropdownOpen, setChildDropdownOpen] = useState(false);

  return (
    <header className="bg-white rounded-[20px] shadow-[0_4px_20px_rgba(0,100,200,0.06)] border border-blue-50/80 px-4 sm:px-6 h-16 flex items-center justify-between gap-3 relative z-30">
      {/* Left: Mobile Menu + Search Bar */}
      <div className="flex items-center gap-3 flex-1 max-w-lg">
        <button
          type="button"
          onClick={onOpenMobileMenu}
          className="lg:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors"
          title="Open Navigation"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Search Bar Input */}
        <div className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-white border border-slate-200/80 hover:border-slate-300 focus-within:border-[#2563EB] focus-within:ring-2 focus-within:ring-blue-100 w-full transition-all">
          <Search className="w-4 h-4 text-slate-400 shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
            placeholder="Search classes, assignments, teachers..."
            className="w-full text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 outline-none bg-transparent"
          />
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3 shrink-0">
        {/* Parent Multi-Child Switcher */}
        {parentContext?.isParentView && parentContext.children.length > 0 && (
          <div className="relative">
            <button
              type="button"
              onClick={() => setChildDropdownOpen(!childDropdownOpen)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-blue-50/70 border border-blue-200 text-blue-700 hover:bg-blue-100/70 transition-colors text-xs font-semibold"
            >
              <span className="hidden sm:inline text-slate-600">Child:</span>
              <span className="max-w-[100px] truncate">{studentName}</span>
              <span className="text-[10px] px-1.5 py-0.5 bg-[#2563EB] text-white rounded font-medium">
                {className}-{sectionName}
              </span>
              <ChevronDown
                className={`w-3.5 h-3.5 transition-transform ${childDropdownOpen ? 'rotate-180' : ''}`}
              />
            </button>

            {childDropdownOpen && (
              <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50">
                <div className="px-4 py-2 border-b border-slate-100">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Linked Children ({parentContext.children.length})
                  </p>
                  <p className="text-xs text-slate-800 font-semibold mt-0.5">
                    {parentContext.parentName} ({parentContext.relationship})
                  </p>
                </div>
                <div className="py-1">
                  {parentContext.children.map((child) => {
                    const isCurrent = child.id === selectedChildId;
                    return (
                      <button
                        key={child.id}
                        type="button"
                        onClick={() => {
                          if (onSelectChild) onSelectChild(child.id);
                          setChildDropdownOpen(false);
                        }}
                        className={`w-full text-left px-4 py-2 flex items-center justify-between text-xs transition-colors ${
                          isCurrent ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span>{child.name}</span>
                            {child.isPrimary && (
                              <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 font-medium">
                                Primary
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-400 mt-0.5">
                            Class {child.className}-{child.sectionName} • Roll {child.rollNumber || '-'}
                          </p>
                        </div>
                        {isCurrent && <Check className="w-4 h-4 text-[#2563EB] shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Notification Bell with Red Dot */}
        <button
          type="button"
          onClick={() => onSelectNav('notifications')}
          className="relative p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors"
          title="Notifications"
        >
          <Bell className="w-5 h-5 text-slate-500" />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-[#EF4444] rounded-full ring-2 ring-white" />
          )}
        </button>

        {/* Student Profile Widget */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
            className="flex items-center gap-2.5 pl-2 sm:pl-3 py-1 rounded-xl hover:bg-slate-50 transition-colors text-left"
          >
            {/* Circular Avatar */}
            <div className="w-9 h-9 rounded-full overflow-hidden border border-slate-200/90 bg-sky-50 shrink-0">
              <img
                src={avatarUrl || '/images/dashboard/ref_avatar.png'}
                alt={studentName}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/images/dashboard/ref_avatar.png';
                }}
              />
            </div>
            {/* Student Name & Class */}
            <div className="hidden sm:flex flex-col">
              <span className="text-xs sm:text-sm font-bold text-slate-900 leading-tight">
                {studentName}
              </span>
              <span className="text-[11px] font-medium text-slate-400 leading-tight">
                Class {className} - {sectionName}
              </span>
            </div>
            {/* Down Chevron */}
            <ChevronDown
              className={`w-3.5 h-3.5 text-slate-400 transition-transform ${
                profileDropdownOpen ? 'rotate-180' : ''
              }`}
            />
          </button>

          {/* Profile Dropdown Menu */}
          {profileDropdownOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50 animate-in fade-in duration-150">
              <div className="px-4 py-2 border-b border-slate-100">
                <p className="text-xs font-bold text-slate-900">{studentName}</p>
                <p className="text-[11px] text-slate-400">Class {className}-{sectionName}</p>
              </div>
              <div className="py-1">
                <button
                  type="button"
                  onClick={() => {
                    onSelectNav('student-id-card');
                    setProfileDropdownOpen(false);
                  }}
                  className="w-full text-left px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                >
                  <User className="w-4 h-4 text-slate-400" />
                  <span>Student ID Card</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onSelectNav('profile-settings');
                    setProfileDropdownOpen(false);
                  }}
                  className="w-full text-left px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                >
                  <Settings className="w-4 h-4 text-slate-400" />
                  <span>Profile & Settings</span>
                </button>
                <div className="border-t border-slate-100 my-1" />
                <button
                  type="button"
                  onClick={() => {
                    setProfileDropdownOpen(false);
                    onSignOut();
                  }}
                  disabled={isSigningOut}
                  className="w-full text-left px-4 py-2 text-xs text-red-600 hover:bg-red-50 flex items-center gap-2 disabled:opacity-50"
                >
                  <LogOut className="w-4 h-4 text-red-500" />
                  <span>{isSigningOut ? 'Signing out...' : 'Sign Out'}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
