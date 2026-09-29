'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Building2,
  CreditCard,
  Globe,
  ShieldCheck,
  X,
  LogOut,
  ChevronRight,
  Sparkles,
  Server,
} from 'lucide-react';
import { logoutAction } from '@/actions/auth';

interface SuperAdminSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  adminName: string;
  adminEmail: string;
}

const navItems = [
  {
    name: 'Platform Overview',
    href: '/superadmin',
    icon: LayoutDashboard,
    badge: 'Live',
  },
  {
    name: 'Schools & Tenants',
    href: '/superadmin/tenants',
    icon: Building2,
    badge: null,
  },
  {
    name: 'Subscriptions & MRR',
    href: '/superadmin/subscriptions',
    icon: CreditCard,
    badge: null,
  },
  {
    name: 'Domains & DNS CNAME',
    href: '/superadmin/domains',
    icon: Globe,
    badge: null,
  },
];

export default function SuperAdminSidebar({
  isOpen,
  onClose,
  adminName,
  adminEmail,
}: SuperAdminSidebarProps) {
  const pathname = usePathname();

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-40 lg:hidden transition-opacity"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 bg-[#0B132B] text-slate-300 flex flex-col border-r border-slate-800/80 transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand & Platform Identity Header */}
        <div className="p-6 border-b border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-500 text-white flex items-center justify-center font-black shadow-lg shadow-purple-500/20">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-extrabold text-white tracking-tight">SchoolERP SaaS</span>
                <span className="text-[10px] bg-purple-500/20 text-purple-300 font-bold px-1.5 py-0.5 rounded border border-purple-500/30">
                  ROOT
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium">Platform Super Admin</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Links */}
        <div className="flex-1 overflow-y-auto px-4 py-6 space-y-1">
          <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">
            SaaS Control Center
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.href === '/superadmin'
                ? pathname === '/superadmin'
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={onClose}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-purple-600 text-white shadow-md shadow-purple-600/20 font-bold'
                    : 'text-slate-300 hover:bg-slate-800/70 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4 h-4 ${
                      isActive ? 'text-white' : 'text-slate-400'
                    }`}
                  />
                  <span>{item.name}</span>
                </div>

                {item.badge && (
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      isActive
                        ? 'bg-white/20 text-white'
                        : 'bg-slate-800 text-purple-400 border border-purple-500/20'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </div>

        {/* Architecture & Multi-Tenant Status Badge */}
        <div className="px-4 py-3">
          <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 text-xs space-y-1.5">
            <div className="flex items-center gap-1.5 text-purple-400 font-semibold text-[11px]">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Multi-Tenant Row Isolation</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-snug">
              Verified tenantId scoping on all school operations.
            </p>
          </div>
        </div>

        {/* Footer: User Profile & Sign Out */}
        <div className="p-4 border-t border-slate-800/80 bg-slate-950/40 flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-purple-900/60 text-purple-300 border border-purple-700/50 flex items-center justify-center text-xs font-bold shrink-0">
              SA
            </div>
            <div className="min-w-0">
              <div className="text-xs font-bold text-white truncate">{adminName}</div>
              <div className="text-[10px] text-slate-400 truncate">{adminEmail}</div>
            </div>
          </div>

          <form action={logoutAction}>
            <button
              type="submit"
              title="Sign Out of Super Admin"
              className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </form>
        </div>
      </aside>
    </>
  );
}
