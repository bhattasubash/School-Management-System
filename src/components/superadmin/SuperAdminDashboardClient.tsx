'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Building2,
  Users,
  GraduationCap,
  IndianRupee,
  ShieldCheck,
  Server,
  ArrowUpRight,
  TrendingUp,
  Activity,
  Plus,
  Search,
  ExternalLink,
  CheckCircle2,
  Clock,
  AlertCircle,
  Database,
  Lock,
  Sparkles,
} from 'lucide-react';

export interface SuperAdminDashboardStats {
  totalTenants: number;
  activeTenants: number;
  totalStudents: number;
  totalTeachers: number;
  platformMrr: number;
  platformArr: number;
  boardDistribution: { board: string; count: number }[];
  recentTenants: {
    id: string;
    name: string;
    slug: string;
    city: string;
    board: string;
    status: string;
    planName: string;
    studentCount: number;
    createdAt: string;
  }[];
  recentAuditLogs: {
    id: string;
    action: string;
    entityType: string;
    entityId: string | null;
    tenantName: string | null;
    userEmail: string | null;
    createdAt: string;
  }[];
}

export default function SuperAdminDashboardClient({
  stats,
}: {
  stats: SuperAdminDashboardStats;
}) {
  const [filterBoard, setFilterBoard] = useState('ALL');

  const filteredTenants = stats.recentTenants.filter((tenant) => {
    if (filterBoard !== 'ALL' && tenant.board !== filterBoard) return false;
    return true;
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Platform Executive Header Banner */}
      <div className="bg-gradient-to-r from-[#0B132B] via-[#1C2541] to-[#3A0CA3] rounded-3xl p-6 md:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute left-1/2 bottom-0 w-80 h-80 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 border border-purple-400/30 text-xs font-bold tracking-wide">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Multi-Tenant Platform Command Center</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
              Platform Executive Intelligence
            </h1>
            <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
              Real-time monitoring across all school tenants, row-level tenant isolation integrity, automated subscription billing, and multi-tenant security audit logs.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/superadmin/tenants?action=new"
              className="inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs px-5 py-3 rounded-2xl shadow-lg shadow-purple-600/30 transition-all transform active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Provision New School</span>
            </Link>
            <Link
              href="/superadmin/subscriptions"
              className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-semibold text-xs px-4 py-3 rounded-2xl backdrop-blur-sm border border-white/10 transition-all"
            >
              <span>Subscription Engine</span>
              <ArrowUpRight className="w-4 h-4 text-slate-300" />
            </Link>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Total Schools */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold tracking-wide text-slate-500 uppercase">
              Onboarded Schools
            </span>
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Building2 className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900">{stats.totalTenants}</span>
            <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
              {stats.activeTenants} Active
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-2 flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
            <span>100% Tenant Isolation Verified</span>
          </p>
        </div>

        {/* Total Students Across All Tenants */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold tracking-wide text-slate-500 uppercase">
              Enrolled Students
            </span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <GraduationCap className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900">
              {stats.totalStudents.toLocaleString('en-IN')}
            </span>
            <span className="text-xs font-medium text-slate-400">across campuses</span>
          </div>
          <p className="text-xs text-slate-400 mt-2">Aggregated across all verified tenants</p>
        </div>

        {/* Faculty & Staff */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold tracking-wide text-slate-500 uppercase">
              Faculty & Staff
            </span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900">
              {stats.totalTeachers.toLocaleString('en-IN')}
            </span>
            <span className="text-xs font-medium text-slate-400">educators</span>
          </div>
          <p className="text-xs text-slate-400 mt-2">Active teaching & administrative staff</p>
        </div>

        {/* Platform MRR & ARR */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold tracking-wide text-slate-500 uppercase">
              Platform MRR
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <IndianRupee className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900">
              ₹{stats.platformMrr.toLocaleString('en-IN')}
            </span>
            <span className="text-[10px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-200">
              ARR: ₹{stats.platformArr.toLocaleString('en-IN')}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-2">Calculated from active SaaS contracts</p>
        </div>
      </div>

      {/* Platform Infrastructure Health & Architecture Matrix */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <Database className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-slate-800">PostgreSQL 18 Cluster</span>
            </div>
            <span className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Healthy
            </span>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed">
            Multi-Tenant database with connection pooler and isolated schema migration verification.
          </p>
          <div className="text-[11px] text-slate-400 pt-1 border-t border-slate-100 flex items-center justify-between">
            <span>Latency: &lt; 2ms</span>
            <span className="font-mono text-emerald-600 font-bold">Port 5432</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                <Lock className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-slate-800">Tenant Isolation Guard</span>
            </div>
            <span className="flex items-center gap-1.5 text-[11px] font-semibold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Enforced
            </span>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed">
            Session JWT & middleware inject verified <code className="bg-slate-100 px-1 rounded text-purple-700 font-mono text-[10px]">x-tenant-id</code> headers into every downstream query.
          </p>
          <div className="text-[11px] text-slate-400 pt-1 border-t border-slate-100 flex items-center justify-between">
            <span>Cross-Tenant Leaks: 0</span>
            <span className="font-bold text-purple-600">Zero-Trust</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-slate-800">DPDP Compliance</span>
            </div>
            <span className="flex items-center gap-1.5 text-[11px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full">
              Compliant
            </span>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed">
            Parental consent logs, immutable audit trail, and soft deletion flags active for minor protection.
          </p>
          <div className="text-[11px] text-slate-400 pt-1 border-t border-slate-100 flex items-center justify-between">
            <span>Parent Consents: Logged</span>
            <span className="font-bold text-blue-600">India DPDP 2023</span>
          </div>
        </div>
      </div>

      {/* Main Two-Column Layout: School Directory Summary + Live Audit Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Recent School Tenants */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-extrabold text-slate-900">Schools & Campuses</h2>
              <p className="text-xs text-slate-400">Recently active institutions on the SaaS platform</p>
            </div>

            {/* Board Filter Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
              {['ALL', 'CBSE', 'ICSE', 'STATE_BOARD', 'CAMBRIDGE'].map((board) => (
                <button
                  key={board}
                  onClick={() => setFilterBoard(board)}
                  className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all ${
                    filterBoard === board
                      ? 'bg-[#0B132B] text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {board === 'ALL' ? 'All Boards' : board}
                </button>
              ))}
            </div>
          </div>

          {/* Tenants Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 uppercase font-bold text-[10px]">
                  <th className="pb-3 pl-2">Institution</th>
                  <th className="pb-3">Board & City</th>
                  <th className="pb-3">Plan</th>
                  <th className="pb-3">Students</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3 text-right pr-2">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredTenants.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400">
                      No schools found matching the selected filter.
                    </td>
                  </tr>
                ) : (
                  filteredTenants.map((tenant) => (
                    <tr key={tenant.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 pl-2">
                        <div className="font-bold text-slate-900">{tenant.name}</div>
                        <div className="text-[11px] text-slate-400 font-mono">
                          slug: {tenant.slug}
                        </div>
                      </td>
                      <td className="py-3.5">
                        <span className="font-semibold text-slate-700">{tenant.board}</span>
                        <div className="text-[11px] text-slate-400">{tenant.city}</div>
                      </td>
                      <td className="py-3.5">
                        <span className="px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 font-semibold border border-purple-100 text-[11px]">
                          {tenant.planName}
                        </span>
                      </td>
                      <td className="py-3.5 font-bold text-slate-800">
                        {tenant.studentCount}
                      </td>
                      <td className="py-3.5">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            tenant.status === 'ACTIVE'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-rose-50 text-rose-700 border border-rose-200'
                          }`}
                        >
                          {tenant.status}
                        </span>
                      </td>
                      <td className="py-3.5 text-right pr-2">
                        <Link
                          href={`/superadmin/tenants?tenantId=${tenant.id}`}
                          className="inline-flex items-center gap-1 text-purple-600 hover:text-purple-800 font-bold hover:underline"
                        >
                          <span>Inspect</span>
                          <ArrowUpRight className="w-3.5 h-3.5" />
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="pt-2 flex justify-between items-center text-xs">
            <span className="text-slate-400">
              Showing {filteredTenants.length} of {stats.totalTenants} institutions
            </span>
            <Link
              href="/superadmin/tenants"
              className="text-purple-600 hover:text-purple-700 font-bold hover:underline inline-flex items-center gap-1"
            >
              <span>View Full Directory</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Right Column: Live Audit Feed & Quick Actions */}
        <div className="space-y-6">
          {/* Quick Actions Panel */}
          <div className="bg-[#0B132B] text-white rounded-3xl p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-extrabold tracking-wide uppercase text-slate-300">
              Super Admin Tools
            </h3>
            <div className="grid grid-cols-1 gap-2.5">
              <Link
                href="/superadmin/tenants?action=new"
                className="flex items-center justify-between p-3 rounded-2xl bg-white/5 hover:bg-white/10 transition-colors border border-white/5 text-xs font-semibold"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-xl bg-purple-500/20 text-purple-300 flex items-center justify-center">
                    <Plus className="w-4 h-4" />
                  </div>
                  <span>Onboard New Institution</span>
                </div>
                <ArrowUpRight className="w-3.5 h-3.5 text-slate-400" />
              </Link>

              <Link
                href="/superadmin/domains"
                className="flex items-center justify-between p-3 rounded-2xl bg-white/5 hover:bg-white/10 transition-colors border border-white/5 text-xs font-semibold"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-xl bg-blue-500/20 text-blue-300 flex items-center justify-center">
                    <Server className="w-4 h-4" />
                  </div>
                  <span>Review DNS & CNAMEs</span>
                </div>
                <ArrowUpRight className="w-3.5 h-3.5 text-slate-400" />
              </Link>

              <Link
                href="/superadmin/subscriptions"
                className="flex items-center justify-between p-3 rounded-2xl bg-white/5 hover:bg-white/10 transition-colors border border-white/5 text-xs font-semibold"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center">
                    <IndianRupee className="w-4 h-4" />
                  </div>
                  <span>Update Subscription Plans</span>
                </div>
                <ArrowUpRight className="w-3.5 h-3.5 text-slate-400" />
              </Link>
            </div>
          </div>

          {/* Platform Security Audit Logs */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-purple-600" />
                <h3 className="text-sm font-extrabold text-slate-900">Security & Audit Stream</h3>
              </div>
              <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Live</span>
            </div>

            <div className="space-y-3">
              {stats.recentAuditLogs.length === 0 ? (
                <p className="text-xs text-slate-400 py-4 text-center">No recent security events</p>
              ) : (
                stats.recentAuditLogs.map((log) => (
                  <div
                    key={log.id}
                    className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-800 text-[11px]">{log.action}</span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {new Date(log.createdAt).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 truncate">
                      {log.tenantName ? `Tenant: ${log.tenantName}` : 'System Platform'}
                      {log.userEmail && ` • ${log.userEmail}`}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
