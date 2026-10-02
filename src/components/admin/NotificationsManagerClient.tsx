'use client';

import React, { useState, useMemo } from 'react';
import {
  Bell,
  Send,
  Search,
  Filter,
  Users,
  CheckCircle2,
  Clock,
  ExternalLink,
  Plus,
  X,
  Loader2,
  GraduationCap,
  CreditCard,
  Calendar,
  AlertCircle,
  Info,
} from 'lucide-react';
import { sendBroadcastNotificationAction } from '@/actions/notifications';
import { NotificationType } from '@prisma/client';
import type { NotificationAudience } from '@/lib/validations/notifications';

export interface AdminNotificationItem {
  id: string;
  title: string;
  body: string;
  type: NotificationType;
  isRead: boolean;
  actionUrl: string | null;
  createdAt: string | Date;
  recipientName: string;
  recipientRole: string;
}

export interface ClassGradeOption {
  id: string;
  name: string;
}

interface NotificationsManagerClientProps {
  initialNotifications: AdminNotificationItem[];
  classGrades: ClassGradeOption[];
  totalTenantUsers: number;
}

export default function NotificationsManagerClient({
  initialNotifications,
  classGrades,
  totalTenantUsers,
}: NotificationsManagerClientProps) {
  const [notifications, setNotifications] = useState<AdminNotificationItem[]>(initialNotifications);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('ALL');

  // Broadcast Modal State
  const [isComposerOpen, setIsComposerOpen] = useState(false);
  const [audience, setAudience] = useState<NotificationAudience>('ALL');
  const [selectedClassGradeId, setSelectedClassGradeId] = useState<string>('');
  const [type, setType] = useState<NotificationType>(NotificationType.GENERAL);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [actionUrl, setActionUrl] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [feedback, setFeedback] = useState<{ success?: string; error?: string } | null>(null);

  // Filtered list
  const filteredNotifications = useMemo(() => {
    return notifications.filter((n) => {
      const matchSearch =
        searchTerm === '' ||
        n.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        n.body.toLowerCase().includes(searchTerm.toLowerCase()) ||
        n.recipientName.toLowerCase().includes(searchTerm.toLowerCase());

      const matchType = selectedType === 'ALL' || n.type === selectedType;

      return matchSearch && matchType;
    });
  }, [notifications, searchTerm, selectedType]);

  const totalCount = notifications.length;
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const handleSendBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !body.trim()) {
      setFeedback({ error: 'Title and message body are required.' });
      return;
    }

    setIsSending(true);
    setFeedback(null);

    const res = await sendBroadcastNotificationAction({
      audience,
      classGradeId: audience === 'SPECIFIC_CLASS' ? selectedClassGradeId : undefined,
      title: title.trim(),
      body: body.trim(),
      type,
      actionUrl: actionUrl.trim() || undefined,
    });

    setIsSending(false);

    if (res.success) {
      setFeedback({ success: `Notification successfully broadcast to ${res.count ?? 0} users.` });
      setTitle('');
      setBody('');
      setActionUrl('');
      setTimeout(() => {
        setIsComposerOpen(false);
        setFeedback(null);
      }, 1500);
    } else {
      setFeedback({ error: res.error || 'Failed to dispatch broadcast.' });
    }
  };

  const getTypeBadge = (nType: NotificationType) => {
    switch (nType) {
      case 'ATTENDANCE':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">ATTENDANCE</span>;
      case 'FEE':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">FEE</span>;
      case 'EXAM':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">EXAM</span>;
      case 'EVENT':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#EBF5FF] text-[#0B72E7] border border-[#0B72E7]/30">EVENT</span>;
      case 'SYSTEM':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200">SYSTEM</span>;
      default:
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">GENERAL</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-[#0B72E7]/10 text-[#0B72E7] flex items-center justify-center font-bold">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-black text-[#111C2D] tracking-tight">Notification Center</h1>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Dispatch and audit multi-channel in-app alerts across your school community
              </p>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            setFeedback(null);
            setIsComposerOpen(true);
          }}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#0B72E7] hover:bg-[#0960C4] text-white font-bold text-xs shadow-xs transition-all active:scale-[0.98]"
        >
          <Send className="w-4 h-4" />
          <span>New Broadcast</span>
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Delivered</span>
            <Bell className="w-4 h-4 text-slate-400" />
          </div>
          <p className="text-2xl font-black text-[#111C2D] mt-2">{totalCount}</p>
          <span className="text-[11px] text-slate-400 font-medium">Logged notifications in tenant</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Pending / Unread</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl font-black text-[#0B72E7] mt-2">{unreadCount}</p>
          <span className="text-[11px] text-slate-400 font-medium">Awaiting recipient action</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Active Audience</span>
            <Users className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-black text-[#111C2D] mt-2">{totalTenantUsers}</p>
          <span className="text-[11px] text-slate-400 font-medium">Reachable staff, students & parents</span>
        </div>
      </div>

      {/* Controls & Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 shrink-0" />
          <input
            type="text"
            placeholder="Search by title, body, or recipient..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-transparent border-none outline-none w-full text-xs text-[#111C2D]"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-700 outline-none w-full md:w-44"
          >
            <option value="ALL">All Categories</option>
            <option value="GENERAL">General</option>
            <option value="ATTENDANCE">Attendance</option>
            <option value="FEE">Fee Reminders</option>
            <option value="EXAM">Examinations</option>
            <option value="EVENT">School Events</option>
            <option value="SYSTEM">System Alerts</option>
          </select>
        </div>
      </div>

      {/* Notifications Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Subject & Details</th>
                <th className="py-3 px-4">Recipient</th>
                <th className="py-3 px-4">Delivered</th>
                <th className="py-3 px-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredNotifications.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400 font-medium">
                    No notifications match your current filter.
                  </td>
                </tr>
              ) : (
                filteredNotifications.map((n) => (
                  <tr key={n.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3 px-4 whitespace-nowrap">{getTypeBadge(n.type)}</td>
                    <td className="py-3 px-4 max-w-md">
                      <div className="font-bold text-[#111C2D] truncate">{n.title}</div>
                      <div className="text-slate-500 text-[11px] line-clamp-1 mt-0.5">{n.body}</div>
                      {n.actionUrl && (
                        <a
                          href={n.actionUrl}
                          className="inline-flex items-center gap-1 text-[10px] text-[#0B72E7] font-semibold hover:underline mt-1"
                        >
                          <span>{n.actionUrl}</span>
                          <ExternalLink className="w-2.5 h-2.5" />
                        </a>
                      )}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="font-medium text-slate-800">{n.recipientName}</div>
                      <div className="text-[10px] text-slate-400 font-semibold">{n.recipientRole}</div>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap text-slate-500 font-medium">
                      {new Date(n.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap text-right">
                      {n.isRead ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600">
                          <CheckCircle2 className="w-3 h-3 text-slate-500" /> Read
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#EBF5FF] text-[#0B72E7]">
                          <Clock className="w-3 h-3 text-[#0B72E7]" /> Unread
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Broadcast Composer Modal */}
      {isComposerOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in-50 duration-150">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-lg w-full shadow-2xl overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#EBF5FF] text-[#0B72E7] flex items-center justify-center font-bold">
                  <Send className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-[#111C2D]">Create Broadcast Notification</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsComposerOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSendBroadcast} className="p-6 space-y-4 text-xs">
              {feedback?.error && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{feedback.error}</span>
                </div>
              )}

              {feedback?.success && (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-medium flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{feedback.success}</span>
                </div>
              )}

              {/* Target Audience */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Target Audience</label>
                <select
                  value={audience}
                  onChange={(e) => setAudience(e.target.value as NotificationAudience)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 font-medium text-slate-800 outline-none focus:border-[#0B72E7]"
                >
                  <option value="ALL">Entire School (Students, Staff & Parents)</option>
                  <option value="TEACHERS">All Teachers & Faculty</option>
                  <option value="PARENTS">All Parents</option>
                  <option value="STUDENTS">All Students</option>
                  <option value="SPECIFIC_CLASS">Specific Class Grade</option>
                </select>
              </div>

              {audience === 'SPECIFIC_CLASS' && (
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Select Class</label>
                  <select
                    value={selectedClassGradeId}
                    onChange={(e) => setSelectedClassGradeId(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 font-medium text-slate-800 outline-none focus:border-[#0B72E7]"
                  >
                    <option value="">Choose Class...</option>
                    {classGrades.map((cg) => (
                      <option key={cg.id} value={cg.id}>
                        {cg.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Notification Category */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Notification Category</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as NotificationType)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 font-medium text-slate-800 outline-none focus:border-[#0B72E7]"
                >
                  <option value="GENERAL">General Announcement</option>
                  <option value="ATTENDANCE">Attendance Alert</option>
                  <option value="FEE">Fee Reminder</option>
                  <option value="EXAM">Examination Notice</option>
                  <option value="EVENT">Event Bulletin</option>
                  <option value="SYSTEM">System Maintenance</option>
                </select>
              </div>

              {/* Subject Title */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Subject Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Annual Sports Meet 2026 Participation Notice"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 font-medium text-slate-800 outline-none focus:border-[#0B72E7]"
                />
              </div>

              {/* Body */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Message Content *</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Enter detailed message body..."
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 font-medium text-slate-800 outline-none focus:border-[#0B72E7] resize-none"
                />
              </div>

              {/* Optional Link */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Action URL (Optional)</label>
                <input
                  type="text"
                  placeholder="/admin/events or https://..."
                  value={actionUrl}
                  onChange={(e) => setActionUrl(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 font-medium text-slate-800 outline-none focus:border-[#0B72E7]"
                />
              </div>

              {/* Form Buttons */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsComposerOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSending}
                  className="px-5 py-2 rounded-xl bg-[#0B72E7] hover:bg-[#0960C4] text-white font-bold transition-all flex items-center gap-2 shadow-xs disabled:opacity-50"
                >
                  {isSending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{isSending ? 'Broadcasting...' : 'Send Broadcast'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
