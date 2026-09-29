'use client';

import React, { useState, useMemo } from 'react';
import {
  ShieldCheck,
  Search,
  Filter,
  Clock,
  User,
  ArrowRight,
  Activity,
  Lock,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

export interface AuditRecord {
  id: string;
  action: string;
  entityType: string;
  entityId: string | null;
  actorName: string;
  actorEmail: string | null;
  actorRole: string | null;
  ipAddress: string | null;
  createdAt: string;
  oldValues: any;
  newValues: any;
}

interface AdminAuditClientProps {
  logs: AuditRecord[];
  schoolName: string;
}

export default function AdminAuditClient({
  logs,
  schoolName,
}: AdminAuditClientProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterAction, setFilterAction] = useState('ALL');
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);

  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      if (filterAction !== 'ALL' && !log.action.includes(filterAction)) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesAction = log.action.toLowerCase().includes(q);
        const matchesUser = log.actorName.toLowerCase().includes(q);
        const matchesEntity = log.entityType.toLowerCase().includes(q);
        if (!matchesAction && !matchesUser && !matchesEntity) return false;
      }
      return true;
    });
  }, [logs, filterAction, searchQuery]);

  const getActionBadgeColor = (action: string) => {
    if (action.includes('DELETE') || action.includes('CANCEL')) {
      return 'bg-rose-50 text-rose-700 border-rose-200';
    }
    if (action.includes('PAYMENT') || action.includes('FEE')) {
      return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    }
    if (action.includes('ADMISSION') || action.includes('ENROLL')) {
      return 'bg-blue-50 text-blue-700 border-blue-200';
    }
    if (action.includes('NOTICE') || action.includes('CIRCULAR')) {
      return 'bg-purple-50 text-purple-700 border-purple-200';
    }
    return 'bg-slate-100 text-slate-700 border-slate-200';
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Banner */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
              Security & Audit Trail
            </h1>
            <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
              <Lock className="w-3 h-3" />
              DPDP 2023 Compliant
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Immutable, row-level partitioned security log for {schoolName}. Every administrative transaction is recorded with actor metadata.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-500 bg-slate-50 px-3 py-2 rounded-2xl border border-slate-200">
          <Activity className="w-4 h-4 text-purple-600" />
          <span>
            Total Logged Events: <strong>{logs.length}</strong>
          </span>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by action, actor name, or entity type..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20"
          />
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-600 font-medium">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <span>Category:</span>
          <select
            value={filterAction}
            onChange={(e) => setFilterAction(e.target.value)}
            className="bg-slate-50 border border-slate-200 text-slate-700 text-xs rounded-xl px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-purple-500/20 font-semibold"
          >
            <option value="ALL">All Actions</option>
            <option value="FEE">Fee Collections & Invoicing</option>
            <option value="ADMISSION">Admissions & Enrollments</option>
            <option value="ATTENDANCE">Attendance Submissions</option>
            <option value="NOTICE">Circulars & Notices</option>
            <option value="TIMETABLE">Timetable & Substitutions</option>
            <option value="USER">User & Auth Events</option>
          </select>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 uppercase font-bold text-[10px]">
                <th className="py-3.5 pl-6">Timestamp</th>
                <th className="py-3.5 px-4">Action</th>
                <th className="py-3.5 px-4">Actor</th>
                <th className="py-3.5 px-4">Entity</th>
                <th className="py-3.5 px-4">IP Address</th>
                <th className="py-3.5 pr-6 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <ShieldCheck className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                    <p className="font-semibold">No audit logs matching criteria.</p>
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => {
                  const isExpanded = expandedLogId === log.id;
                  const dateObj = new Date(log.createdAt);

                  return (
                    <React.Fragment key={log.id}>
                      <tr className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3.5 pl-6 text-slate-500">
                          <div className="font-semibold text-slate-900">
                            {dateObj.toLocaleDateString('en-IN', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </div>
                          <div className="text-[11px] text-slate-400 font-mono">
                            {dateObj.toLocaleTimeString('en-IN', {
                              hour: '2-digit',
                              minute: '2-digit',
                              second: '2-digit',
                            })}
                          </div>
                        </td>

                        <td className="py-3.5 px-4">
                          <span
                            className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${getActionBadgeColor(
                              log.action
                            )}`}
                          >
                            {log.action}
                          </span>
                        </td>

                        <td className="py-3.5 px-4">
                          <div className="font-bold text-slate-900">{log.actorName}</div>
                          {log.actorEmail && (
                            <div className="text-[11px] text-slate-400 font-mono">
                              {log.actorEmail}
                            </div>
                          )}
                        </td>

                        <td className="py-3.5 px-4">
                          <span className="font-semibold text-slate-700">
                            {log.entityType}
                          </span>
                          {log.entityId && (
                            <div className="text-[10px] text-slate-400 font-mono truncate max-w-[120px]">
                              {log.entityId}
                            </div>
                          )}
                        </td>

                        <td className="py-3.5 px-4 font-mono text-[11px] text-slate-500">
                          {log.ipAddress && !log.ipAddress.includes('::1')
                            ? log.ipAddress
                            : '127.0.0.1 (Local)'}
                        </td>

                        <td className="py-3.5 pr-6 text-right">
                          <button
                            onClick={() =>
                              setExpandedLogId(isExpanded ? null : log.id)
                            }
                            className="inline-flex items-center gap-1 text-[11px] font-bold text-purple-600 hover:text-purple-800"
                          >
                            <span>{isExpanded ? 'Hide' : 'Inspect'}</span>
                            {isExpanded ? (
                              <ChevronUp className="w-3.5 h-3.5" />
                            ) : (
                              <ChevronDown className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </td>
                      </tr>

                      {/* Expandable JSON Diff Row */}
                      {isExpanded && (
                        <tr className="bg-slate-50/90">
                          <td colSpan={6} className="p-4 pl-6 text-xs">
                            <div className="p-4 rounded-2xl bg-slate-900 text-slate-200 font-mono text-[11px] overflow-x-auto space-y-2">
                              <div className="text-slate-400 font-bold uppercase text-[10px]">
                                Event Payload & Changes
                              </div>
                              <pre className="text-emerald-400">
                                {JSON.stringify(
                                  {
                                    action: log.action,
                                    entityType: log.entityType,
                                    entityId: log.entityId,
                                    newValues: log.newValues,
                                    oldValues: log.oldValues,
                                  },
                                  null,
                                  2
                                )}
                              </pre>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
