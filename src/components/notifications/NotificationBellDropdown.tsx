'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  Bell,
  Check,
  CheckCheck,
  Calendar,
  AlertCircle,
  CreditCard,
  GraduationCap,
  Info,
  Clock,
  ExternalLink,
  Loader2,
  X,
} from 'lucide-react';
import {
  getUserNotificationsAction,
  getUnreadNotificationCountAction,
  markNotificationAsReadAction,
  markAllNotificationsAsReadAction,
} from '@/actions/notifications';
import { NotificationType } from '@prisma/client';

export interface NotificationItem {
  id: string;
  title: string;
  body: string;
  type: NotificationType;
  isRead: boolean;
  actionUrl: string | null;
  createdAt: string | Date;
}

interface NotificationBellDropdownProps {
  notificationsPageUrl?: string;
  initialCount?: number;
}

export default function NotificationBellDropdown({
  notificationsPageUrl = '/admin/notifications',
  initialCount = 0,
}: NotificationBellDropdownProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState<number>(initialCount);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [markingAll, setMarkingAll] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fetch initial unread count
  useEffect(() => {
    async function loadCount() {
      const res = await getUnreadNotificationCountAction();
      if (res.success && typeof res.count === 'number') {
        setUnreadCount(res.count);
      }
    }
    loadCount();

    // Poll every 30 seconds
    const interval = setInterval(loadCount, 30000);
    return () => clearInterval(interval);
  }, []);

  // Fetch notifications when opened
  useEffect(() => {
    if (!isOpen) return;

    async function loadNotifications() {
      setLoading(true);
      const res = await getUserNotificationsAction({ limit: 8 });
      setLoading(false);
      if (res.success && 'items' in res && res.items) {
        setNotifications(res.items as NotificationItem[]);
      }
    }
    loadNotifications();
  }, [isOpen]);

  // Click outside to close
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const handleMarkAsRead = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    await markNotificationAsReadAction(id);
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));
  };

  const handleMarkAllRead = async () => {
    setMarkingAll(true);
    await markAllNotificationsAsReadAction();
    setMarkingAll(false);
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setUnreadCount(0);
  };

  const handleNotificationClick = async (item: NotificationItem) => {
    if (!item.isRead) {
      await handleMarkAsRead(item.id);
    }
    setIsOpen(false);
    if (item.actionUrl) {
      router.push(item.actionUrl);
    }
  };

  const formatRelativeTime = (dateInput: string | Date) => {
    const date = new Date(dateInput);
    const now = new Date();
    const diffSec = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffSec < 60) return 'Just now';
    if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
    if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
    if (diffSec < 172800) return 'Yesterday';
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  };

  const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
      case 'ATTENDANCE':
        return <Clock className="w-4 h-4 text-amber-500" />;
      case 'FEE':
        return <CreditCard className="w-4 h-4 text-emerald-500" />;
      case 'EXAM':
        return <GraduationCap className="w-4 h-4 text-blue-500" />;
      case 'EVENT':
        return <Calendar className="w-4 h-4 text-[#FA896B]" />;
      case 'COMPLAINT':
      case 'LEAVE':
        return <AlertCircle className="w-4 h-4 text-rose-500" />;
      default:
        return <Info className="w-4 h-4 text-slate-500" />;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        type="button"
        aria-label="View notifications"
        onClick={() => setIsOpen((prev) => !prev)}
        className="relative p-2 rounded-xl text-slate-500 hover:text-[#111C2D] hover:bg-slate-100 transition-colors focus:outline-hidden"
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span
            className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-[#FA896B] text-white text-[10px] font-bold flex items-center justify-center shadow-xs ring-2 ring-white animate-in zoom-in-50 duration-150"
            title={`${unreadCount} unread notifications`}
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Popover */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-slate-200 z-50 overflow-hidden animate-in fade-in-50 slide-in-from-top-2 duration-150">
          {/* Header */}
          <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-[#111C2D]">Notifications</span>
              {unreadCount > 0 && (
                <span className="text-[11px] font-semibold bg-[#FFF2EE] text-[#FA896B] px-2 py-0.5 rounded-full">
                  {unreadCount} new
                </span>
              )}
            </div>

            {unreadCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAllRead}
                disabled={markingAll}
                className="text-xs font-semibold text-[#FA896B] hover:text-[#e0684a] flex items-center gap-1 transition-colors disabled:opacity-50"
              >
                {markingAll ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  <CheckCheck className="w-3.5 h-3.5" />
                )}
                <span>Mark all read</span>
              </button>
            )}
          </div>

          {/* List Content */}
          <div className="max-h-[380px] overflow-y-auto divide-y divide-slate-100">
            {loading ? (
              <div className="py-12 flex flex-col items-center justify-center text-slate-400 gap-2">
                <Loader2 className="w-6 h-6 animate-spin text-[#FA896B]" />
                <span className="text-xs">Loading notifications...</span>
              </div>
            ) : notifications.length === 0 ? (
              <div className="py-12 px-4 text-center">
                <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-2">
                  <Bell className="w-5 h-5" />
                </div>
                <p className="text-xs font-semibold text-slate-700">No notifications yet</p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  You are completely caught up!
                </p>
              </div>
            ) : (
              notifications.map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleNotificationClick(item)}
                  className={`p-3.5 flex items-start gap-3 transition-colors cursor-pointer text-left ${
                    item.isRead
                      ? 'bg-white hover:bg-slate-50/70 text-slate-600'
                      : 'bg-[#FFF9F7] hover:bg-[#FFF2EE]/60 text-slate-900'
                  }`}
                >
                  <div className="w-8 h-8 rounded-xl bg-white border border-slate-200/80 shadow-2xs flex items-center justify-center shrink-0 mt-0.5">
                    {getNotificationIcon(item.type)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <p className={`text-xs truncate ${item.isRead ? 'font-medium text-slate-700' : 'font-bold text-slate-900'}`}>
                        {item.title}
                      </p>
                      <span className="text-[10px] text-slate-400 whitespace-nowrap shrink-0">
                        {formatRelativeTime(item.createdAt)}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-2 leading-relaxed">
                      {item.body}
                    </p>

                    <div className="flex items-center gap-2 mt-1.5">
                      <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                        {item.type}
                      </span>
                      {!item.isRead && (
                        <button
                          type="button"
                          onClick={(e) => handleMarkAsRead(item.id, e)}
                          className="text-[10px] text-[#FA896B] hover:underline font-semibold flex items-center gap-0.5"
                        >
                          <Check className="w-2.5 h-2.5" /> Mark read
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="p-3 border-t border-slate-100 bg-slate-50/60 text-center">
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                router.push(notificationsPageUrl);
              }}
              className="text-xs font-bold text-[#111C2D] hover:text-[#FA896B] transition-colors inline-flex items-center gap-1.5"
            >
              <span>View all notifications</span>
              <ExternalLink className="w-3 h-3 text-slate-400" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
