'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Building2,
  Users,
  GraduationCap,
  IndianRupee,
  Plus,
  ArrowUpRight,
  Activity,
  CheckCircle2,
  AlertTriangle,
  Globe,
  ChevronRight,
} from 'lucide-react';

export interface SuperAdminDashboardStats {
  totalTenants: number;
  activeTenants: number;
  totalStudents: number;
  totalTeachers: number;
  platformMrr: number;
  platformArr: number;
  boardDistribution: { board: string; count: number }[];
  nearCapacityTenants: {
    id: string;
    name: string;
    ratio: string;
    percent: number;
  }[];
  pendingDnsDomains: {
    tenantName: string;
    domain: string;
  }[];
  suspendedTenants: {
    id: string;
    name: string;
  }[];
  recentTenants: {
    id: string;
    name: string;
    slug: string;
    city: string;
    board: string;
    status: string;
    planName: string;
    studentCount: number;
    maxStudents: number;
    priceMonthly: number;
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

  const hasExceptions =
    stats.nearCapacityTenants.length > 0 ||
    stats.pendingDnsDomains.length > 0 ||
    stats.suspendedTenants.length > 0;

  return (
    <div className="space-y-6">
      {/* 1. CLEAN 56-72PX PAGE HEADER WITH SINGLE PRIMARY ACTION */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Platform Administration
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Multi-Tenant Oversight & School Directory
          </p>
        </div>

        <Link
          href="/superadmin/tenants?action=new"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-purple-700 hover:bg-purple-800 text-white text-xs font-semibold shadow-xs transition-colors self-start sm:self-center"
        >
          <Plus className="w-4 h-4" />
          <span>Add School</span>
        </Link>
      </div>

      {/* 2. REAL-DATA "NEEDS ATTENTION" STRIP */}
      {hasExceptions ? (
        <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-4 shadow-xs space-y-2.5">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0" />
            <h2 className="text-xs font-bold text-amber-900 uppercase tracking-wider">
              Tenant Exceptions Requiring Attention
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
            {stats.nearCapacityTenants.length > 0 && (
              <div className="p-3 bg-white rounded-lg border border-amber-200 text-xs space-y-1">
                <span className="font-semibold text-slate-700 block">Near Seat Capacity (≥85%)</span>
                <p className="text-amber-800 font-medium">
                  {stats.nearCapacityTenants.map((t) => `${t.name} (${t.percent}%)`).join(', ')}
                </p>
                <Link
                  href="/superadmin/tenants"
                  className="text-xs font-semibold text-purple-700 hover:underline inline-block pt-0.5"
                >
                  Manage Plans →
                </Link>
              </div>
            )}

            {stats.pendingDnsDomains.length > 0 && (
              <div className="p-3 bg-white rounded-lg border border-amber-200 text-xs space-y-1">
                <span className="font-semibold text-slate-700 block">Pending DNS Verification</span>
                <p className="text-slate-900 font-medium truncate">
                  {stats.pendingDnsDomains.map((d) => d.domain).join(', ')}
                </p>
                <Link
                  href="/superadmin/domains"
                  className="text-xs font-semibold text-purple-700 hover:underline inline-block pt-0.5"
                >
                  Review DNS Records →
                </Link>
              </div>
            )}

            {stats.suspendedTenants.length > 0 && (
              <div className="p-3 bg-white rounded-lg border border-amber-200 text-xs space-y-1">
                <span className="font-semibold text-slate-700 block">Suspended Schools</span>
                <p className="text-red-700 font-medium">
                  {stats.suspendedTenants.map((t) => t.name).join(', ')}
                </p>
                <Link
                  href="/superadmin/tenants?status=SUSPENDED"
                  className="text-xs font-semibold text-purple-700 hover:underline inline-block pt-0.5"
                >
                  View Suspended Schools →
                </Link>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs text-slate-600">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span className="font-semibold text-slate-800">All Systems Operational</span>
            <span className="text-slate-400">•</span>
            <span>All schools within plan seat limits, all custom domains verified</span>
          </div>
          <span className="text-slate-400 font-mono text-xs">Platform Status Normal</span>
        </div>
      )}

      {/* 3. CLEAN EXECUTIVE KPI CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Onboarded Schools */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Onboarded Schools
            </span>
            <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-slate-900">{stats.totalTenants}</span>
              <span className="text-xs font-medium text-slate-500">
                ({stats.activeTenants} active)
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">Total school tenants</p>
          </div>
        </div>

        {/* Enrolled Students */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Enrolled Students
            </span>
            <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center">
              <GraduationCap className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl font-bold text-slate-900">
              {stats.totalStudents.toLocaleString('en-IN')}
            </div>
            <p className="text-xs text-slate-500 mt-1">Across all campuses</p>
          </div>
        </div>

        {/* Faculty & Staff */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Faculty & Staff
            </span>
            <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl font-bold text-slate-900">
              {stats.totalTeachers.toLocaleString('en-IN')}
            </div>
            <p className="text-xs text-slate-500 mt-1">Educators & administrators</p>
          </div>
        </div>

        {/* Platform MRR */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Platform MRR
            </span>
            <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center">
              <IndianRupee className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl font-bold text-slate-900">
              ₹{stats.platformMrr.toLocaleString('en-IN')}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              ARR: ₹{stats.platformArr.toLocaleString('en-IN')}
            </p>
          </div>
        </div>
      </div>

      {/* 4. MAIN TWO-COLUMN LAYOUT: Recent Schools & Platform Audit Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (8 cols): Recent School Tenants Table */}
        <div className="lg:col-span-8 bg-white rounded-xl p-5 border border-slate-200 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Schools & Campuses</h2>
              <p className="text-xs text-slate-500">Active educational institutions</p>
            </div>

            {/* Board Filter Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto">
              {['ALL', 'CBSE', 'ICSE', 'State Board', 'CAMBRIDGE'].map((board) => (
                <button
                  key={board}
                  onClick={() => setFilterBoard(board)}
                  className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-colors ${
                    filterBoard === board
                      ? 'bg-slate-900 text-white'
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
                <tr className="border-b border-slate-200 text-slate-500 uppercase font-semibold text-xs">
                  <th className="py-2.5 pl-2">Institution</th>
                  <th className="py-2.5 px-3">Board & City</th>
                  <th className="py-2.5 px-3">Plan</th>
                  <th className="py-2.5 px-3">Student Seats</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 pr-2 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredTenants.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400">
                      No schools found matching filter.
                    </td>
                  </tr>
                ) : (
                  filteredTenants.map((tenant) => {
                    const seatPercent = Math.min(
                      100,
                      Math.round((tenant.studentCount / (tenant.maxStudents || 1)) * 100)
                    );

                    return (
                      <tr key={tenant.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3 pl-2">
                          <div className="font-bold text-slate-900">{tenant.name}</div>
                          <div className="text-xs text-slate-400 font-mono">
                            {tenant.slug}.schoolerp.in
                          </div>
                        </td>
                        <td className="py-3 px-3">
                          <span className="font-medium text-slate-800">{tenant.board}</span>
                          <div className="text-xs text-slate-500">{tenant.city}</div>
                        </td>
                        <td className="py-3 px-3">
                          <span className="text-slate-800 font-semibold">{tenant.planName}</span>
                          <div className="text-xs text-slate-400">
                            ₹{tenant.priceMonthly.toLocaleString('en-IN')}/mo
                          </div>
                        </td>
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-slate-800">
                              {tenant.studentCount} / {tenant.maxStudents}
                            </span>
                            <span className="text-xs text-slate-400 font-normal">
                              ({seatPercent}%)
                            </span>
                          </div>
                          <div className="w-24 bg-slate-100 rounded-full h-1.5 mt-1 overflow-hidden">
                            <div
                              className={`h-1.5 rounded-full ${
                                seatPercent >= 95
                                  ? 'bg-red-600'
                                  : seatPercent >= 80
                                  ? 'bg-amber-500'
                                  : 'bg-purple-600'
                              }`}
                              style={{ width: `${seatPercent}%` }}
                            />
                          </div>
                        </td>
                        <td className="py-3 px-3">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                              tenant.status === 'ACTIVE'
                                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                                : 'bg-red-50 text-red-800 border border-red-200'
                            }`}
                          >
                            {tenant.status}
                          </span>
                        </td>
                        <td className="py-3 pr-2 text-right">
                          <Link
                            href={`/superadmin/tenants?tenantId=${tenant.id}`}
                            className="text-xs font-semibold text-purple-700 hover:underline"
                          >
                            Inspect
                          </Link>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          <div className="pt-2 flex justify-between items-center text-xs text-slate-500 border-t border-slate-100">
            <span>
              Showing {filteredTenants.length} of {stats.totalTenants} institutions
            </span>
            <Link
              href="/superadmin/tenants"
              className="text-purple-700 hover:underline font-semibold flex items-center gap-1"
            >
              <span>View Full Directory</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Right Column (4 cols): Platform Security & Operations Audit */}
        <div className="lg:col-span-4 bg-white rounded-xl p-5 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-purple-700" />
              <h3 className="text-sm font-bold text-slate-900">Platform Activity Stream</h3>
            </div>
            <span className="text-xs font-semibold text-slate-400">Live</span>
          </div>

          <div className="divide-y divide-slate-100">
            {stats.recentAuditLogs.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">No recent security events.</p>
            ) : (
              stats.recentAuditLogs.map((log) => (
                <div key={log.id} className="py-2.5 text-xs space-y-0.5">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-900">{log.action}</span>
                    <span className="text-xs text-slate-400">
                      {new Date(log.createdAt).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 truncate">
                    {log.tenantName ? `School: ${log.tenantName}` : 'System Console'}
                    {log.userEmail && ` • ${log.userEmail}`}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
