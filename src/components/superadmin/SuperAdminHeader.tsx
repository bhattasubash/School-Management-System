'use client';

import React from 'react';
import Link from 'next/link';
import {
  Menu,
  Database,
  ExternalLink,
  Plus,
  ShieldAlert,
  Server,
  Sparkles,
} from 'lucide-react';

interface SuperAdminHeaderProps {
  onToggleSidebar: () => void;
  adminName: string;
}

export default function SuperAdminHeader({
  onToggleSidebar,
  adminName,
}: SuperAdminHeaderProps) {
  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 md:px-8 h-16 flex items-center justify-between">
      {/* Left: Mobile Toggle & Status */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="lg:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="hidden sm:flex items-center gap-2 text-xs text-slate-500 font-medium">
          <span className="w-2 h-2 rounded-full bg-slate-400"></span>
          <span>SaaS Platform Operations</span>
        </div>
      </div>

      {/* Right: Quick Portals & Onboard Action */}
      <div className="flex items-center gap-3">
        <Link
          href="/admin"
          target="_blank"
          className="hidden md:inline-flex items-center gap-1.5 text-xs font-medium text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg transition-colors"
        >
          <span>Open School Admin</span>
          <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
        </Link>

        <Link
          href="/superadmin/tenants?action=new"
          className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-purple-700 hover:bg-purple-800 text-white font-semibold text-xs rounded-lg shadow-xs transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Add School</span>
        </Link>
      </div>
    </header>
  );
}
