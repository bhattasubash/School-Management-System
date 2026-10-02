'use client';

import React, { useState, useMemo } from 'react';
import {
  Megaphone,
  Plus,
  Search,
  Filter,
  AlertCircle,
  Calendar,
  User,
  Trash2,
  CheckCircle2,
  X,
  Bell,
  Eye,
  Send,
} from 'lucide-react';
import { publishNoticeAction, deleteNoticeAction, type PublishNoticeInput } from '@/actions/admin/notices';
import { NoticePriority, NoticeAudience } from '@prisma/client';

export interface NoticeItem {
  id: string;
  title: string;
  content: string;
  priority: NoticePriority;
  targetAudience: NoticeAudience;
  publishedAt: string;
  authorName: string;
}

export interface NoticesManagerClientProps {
  notices: NoticeItem[];
}

export default function NoticesManagerClient({ notices: initialNotices }: NoticesManagerClientProps) {
  const [notices, setNotices] = useState<NoticeItem[]>(initialNotices);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAudience, setSelectedAudience] = useState<string>('ALL');
  const [selectedPriority, setSelectedPriority] = useState<string>('ALL');

  // Publish Modal State
  const [isPublishOpen, setIsPublishOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [priority, setPriority] = useState<NoticePriority>(NoticePriority.NORMAL);
  const [targetAudience, setTargetAudience] = useState<NoticeAudience>(NoticeAudience.ALL);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [publishError, setPublishError] = useState<string | null>(null);

  // Deleting State
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Filter notices
  const filteredNotices = useMemo(() => {
    return notices.filter((n) => {
      const matchSearch =
        searchTerm === '' ||
        n.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        n.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
        n.authorName.toLowerCase().includes(searchTerm.toLowerCase());

      const matchAudience = selectedAudience === 'ALL' || n.targetAudience === selectedAudience;
      const matchPriority = selectedPriority === 'ALL' || n.priority === selectedPriority;

      return matchSearch && matchAudience && matchPriority;
    });
  }, [notices, searchTerm, selectedAudience, selectedPriority]);

  // Metrics
  const totalCount = notices.length;
  const urgentCount = notices.filter((n) => n.priority === 'URGENT').length;
  const parentCount = notices.filter((n) => n.targetAudience === 'PARENTS' || n.targetAudience === 'ALL').length;
  const teacherCount = notices.filter((n) => n.targetAudience === 'TEACHERS' || n.targetAudience === 'ALL').length;

  // Handle Publish
  const handlePublish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      setPublishError('Please fill out all required fields.');
      return;
    }

    setIsSubmitting(true);
    setPublishError(null);

    const res = await publishNoticeAction({
      title: title.trim(),
      content: content.trim(),
      priority,
      targetAudience,
    });

    setIsSubmitting(false);

    if (res.success && res.notice) {
      setNotices((prev) => [
        {
          id: res.notice.id,
          title: res.notice.title,
          content: res.notice.content,
          priority: res.notice.priority,
          targetAudience: res.notice.targetAudience,
          publishedAt: res.notice.publishedAt.toISOString(),
          authorName: 'Administrator',
        },
        ...prev,
      ]);
      setIsPublishOpen(false);
      setTitle('');
      setContent('');
      setPriority(NoticePriority.NORMAL);
      setTargetAudience(NoticeAudience.ALL);
    } else {
      setPublishError(res.error || 'Failed to publish notice.');
    }
  };

  // Handle Delete
  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to retract and delete this circular?')) return;
    setDeletingId(id);
    const res = await deleteNoticeAction(id);
    setDeletingId(null);
    if (res.success) {
      setNotices((prev) => prev.filter((n) => n.id !== id));
    } else {
      alert(res.error || 'Failed to delete circular.');
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse"></span>
              School Communications Desk
            </span>
            <span className="text-xs text-slate-500 font-medium">Official Dispatch</span>
          </div>
          <h1 className="text-2xl font-bold text-[#111C2D] tracking-tight">Circulars & Notices</h1>
          <p className="text-sm text-slate-500 mt-1">
            Broadcast administrative circulars, exam schedules, and alerts to parents, faculty, and students.
          </p>
        </div>

        <button
          onClick={() => {
            setPublishError(null);
            setIsPublishOpen(true);
          }}
          className="flex items-center gap-2 px-5 py-2.5 bg-[#0B72E7] hover:bg-[#0960C4] text-white font-medium text-sm rounded-xl shadow-sm transition-all transform active:scale-95 shrink-0"
        >
          <Plus className="w-4 h-4" />
          Publish New Circular
        </button>
      </div>

      {/* 2. Metrics Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 block mb-2">Total Dispatched</span>
          <div className="text-2xl font-extrabold text-[#111C2D]">{totalCount}</div>
          <p className="text-xs text-slate-500 mt-1">Active across all portals</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 block mb-2">Urgent Circulars</span>
          <div className="text-2xl font-extrabold text-rose-600">{urgentCount}</div>
          <p className="text-xs text-slate-500 mt-1">High priority pinned alerts</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 block mb-2">Parent Broadcasts</span>
          <div className="text-2xl font-extrabold text-blue-600">{parentCount}</div>
          <p className="text-xs text-slate-500 mt-1">Visible on parent portal</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 block mb-2">Staff & Faculty</span>
          <div className="text-2xl font-extrabold text-emerald-600">{teacherCount}</div>
          <p className="text-xs text-slate-500 mt-1">Internal academic notices</p>
        </div>
      </div>

      {/* 3. Search & Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2">
          {/* Audience Filter */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-medium">
            {(['ALL', 'TEACHERS', 'PARENTS', 'STUDENTS'] as const).map((aud) => (
              <button
                key={aud}
                onClick={() => setSelectedAudience(aud)}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  selectedAudience === aud
                    ? 'bg-white text-slate-900 shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {aud === 'ALL' ? 'All Audiences' : aud.charAt(0) + aud.slice(1).toLowerCase()}
              </button>
            ))}
          </div>

          {/* Priority Filter */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-medium">
            {(['ALL', 'URGENT', 'IMPORTANT', 'NORMAL'] as const).map((pri) => (
              <button
                key={pri}
                onClick={() => setSelectedPriority(pri)}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  selectedPriority === pri
                    ? 'bg-white text-slate-900 shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {pri === 'ALL' ? 'All Priority' : pri.charAt(0) + pri.slice(1).toLowerCase()}
              </button>
            ))}
          </div>
        </div>

        <div className="relative min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search circulars by keyword..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0B72E7]/30 focus:border-[#0B72E7]"
          />
        </div>
      </div>

      {/* 4. Circulars List */}
      <div className="space-y-4">
        {filteredNotices.length === 0 ? (
          <div className="bg-white p-12 text-center rounded-2xl border border-slate-200 text-slate-400 text-xs">
            No circulars match current filters or search terms.
          </div>
        ) : (
          filteredNotices.map((notice) => (
            <div
              key={notice.id}
              className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:border-slate-300 transition-all flex flex-col md:flex-row md:items-start md:justify-between gap-4"
            >
              <div className="space-y-2 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                      notice.priority === 'URGENT'
                        ? 'bg-rose-50 text-rose-700 border-rose-200'
                        : notice.priority === 'IMPORTANT'
                        ? 'bg-amber-50 text-amber-700 border-amber-200'
                        : 'bg-slate-100 text-slate-700 border-slate-200'
                    }`}
                  >
                    {notice.priority}
                  </span>

                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-blue-50 text-blue-700 border border-blue-200">
                    To: {notice.targetAudience}
                  </span>

                  <span className="text-[11px] text-slate-400 flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {new Date(notice.publishedAt).toLocaleDateString('en-IN', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </span>

                  <span className="text-[11px] text-slate-400 flex items-center gap-1">
                    <User className="w-3 h-3" /> {notice.authorName}
                  </span>
                </div>

                <h3 className="text-base font-bold text-[#111C2D] leading-snug">{notice.title}</h3>
                <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line">{notice.content}</p>
              </div>

              <div className="flex items-center gap-2 self-end md:self-start shrink-0">
                <button
                  onClick={() => handleDelete(notice.id)}
                  disabled={deletingId === notice.id}
                  className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors disabled:opacity-50"
                  title="Retract / Delete Circular"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* 5. MODAL: Publish Circular */}
      {isPublishOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center">
                  <Megaphone className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-[#111C2D]">Publish Official Circular</h3>
                  <p className="text-xs text-slate-500">Dispatch notice instantly across school portals</p>
                </div>
              </div>
              <button
                onClick={() => setIsPublishOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handlePublish} className="p-6 space-y-4 text-xs">
              {publishError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>{publishError}</span>
                </div>
              )}

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Circular Title *</label>
                <input
                  type="text"
                  placeholder="e.g. Winter Break Schedule and Examination Guidelines"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0B72E7]/30 focus:border-[#0B72E7]"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Target Audience</label>
                  <select
                    value={targetAudience}
                    onChange={(e) => setTargetAudience(e.target.value as NoticeAudience)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0B72E7]/30 focus:border-[#0B72E7]"
                  >
                    <option value="ALL">All (Entire School)</option>
                    <option value="PARENTS">Parents Only</option>
                    <option value="TEACHERS">Teachers & Faculty</option>
                    <option value="STUDENTS">Students Only</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Priority Level</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as NoticePriority)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0B72E7]/30 focus:border-[#0B72E7]"
                  >
                    <option value="NORMAL">Normal</option>
                    <option value="IMPORTANT">Important</option>
                    <option value="URGENT">Urgent (Pinned Alert)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Notice Content *</label>
                <textarea
                  rows={5}
                  placeholder="Type the full notice announcement text here..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0B72E7]/30 focus:border-[#0B72E7] resize-none"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 bg-[#0B72E7] hover:bg-[#0960C4] text-white font-bold rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Broadcasting Circular...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Dispatch Circular Now
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
