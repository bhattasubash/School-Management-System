'use client';

import React, { useState, useMemo } from 'react';
import {
  Calendar,
  Plus,
  Search,
  Filter,
  MapPin,
  Clock,
  Eye,
  EyeOff,
  Edit2,
  Trash2,
  X,
  Loader2,
  CheckCircle2,
  AlertCircle,
  ImageIcon,
} from 'lucide-react';
import {
  createEventAction,
  updateEventAction,
  deleteEventAction,
  togglePublishEventAction,
} from '@/actions/events';
import { EventCategory } from '@prisma/client';
import type { CreateEventInput, UpdateEventInput } from '@/lib/validations/events';

export interface SchoolEventItem {
  id: string;
  title: string;
  description: string;
  eventDate: string;
  eventTime: string | null;
  location: string | null;
  category: EventCategory;
  imageUrl: string | null;
  isPublished: boolean;
  createdAt: string;
}

interface EventsManagerClientProps {
  initialEvents: SchoolEventItem[];
}

export default function EventsManagerClient({ initialEvents }: EventsManagerClientProps) {
  const [events, setEvents] = useState<SchoolEventItem[]>(initialEvents);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<SchoolEventItem | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [eventTime, setEventTime] = useState('');
  const [location, setLocation] = useState('');
  const [category, setCategory] = useState<EventCategory>(EventCategory.ACADEMIC);
  const [imageUrl, setImageUrl] = useState('');
  const [isPublished, setIsPublished] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ success?: string; error?: string } | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Filtered Events
  const filteredEvents = useMemo(() => {
    return events.filter((e) => {
      const matchSearch =
        searchTerm === '' ||
        e.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (e.location && e.location.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchCategory = selectedCategory === 'ALL' || e.category === selectedCategory;

      return matchSearch && matchCategory;
    });
  }, [events, searchTerm, selectedCategory]);

  const openCreateModal = () => {
    setEditingEvent(null);
    setTitle('');
    setDescription('');
    setEventDate(new Date().toISOString().split('T')[0]);
    setEventTime('09:00 AM - 01:00 PM');
    setLocation('Main Auditorium');
    setCategory(EventCategory.ACADEMIC);
    setImageUrl('');
    setIsPublished(true);
    setFeedback(null);
    setIsModalOpen(true);
  };

  const openEditModal = (event: SchoolEventItem) => {
    setEditingEvent(event);
    setTitle(event.title);
    setDescription(event.description);
    setEventDate(event.eventDate.split('T')[0]);
    setEventTime(event.eventTime || '');
    setLocation(event.location || '');
    setCategory(event.category);
    setImageUrl(event.imageUrl || '');
    setIsPublished(event.isPublished);
    setFeedback(null);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim() || !eventDate.trim()) {
      setFeedback({ error: 'Title, description, and date are required.' });
      return;
    }

    setIsSubmitting(true);
    setFeedback(null);

    if (editingEvent) {
      const res = await updateEventAction({
        id: editingEvent.id,
        title: title.trim(),
        description: description.trim(),
        eventDate,
        eventTime: eventTime.trim() || undefined,
        location: location.trim() || undefined,
        category,
        imageUrl: imageUrl.trim() || undefined,
        isPublished,
      });

      setIsSubmitting(false);

      if (res.success && res.event) {
        setEvents((prev) =>
          prev.map((e) =>
            e.id === editingEvent.id
              ? {
                  ...e,
                  title: res.event.title,
                  description: res.event.description,
                  eventDate: res.event.eventDate.toISOString(),
                  eventTime: res.event.eventTime,
                  location: res.event.location,
                  category: res.event.category,
                  imageUrl: res.event.imageUrl,
                  isPublished: res.event.isPublished,
                }
              : e
          )
        );
        setIsModalOpen(false);
      } else {
        setFeedback({ error: res.error || 'Failed to update event.' });
      }
    } else {
      const res = await createEventAction({
        title: title.trim(),
        description: description.trim(),
        eventDate,
        eventTime: eventTime.trim() || undefined,
        location: location.trim() || undefined,
        category,
        imageUrl: imageUrl.trim() || undefined,
        isPublished,
      });

      setIsSubmitting(false);

      if (res.success && res.event) {
        const newEvent: SchoolEventItem = {
          id: res.event.id,
          title: res.event.title,
          description: res.event.description,
          eventDate: res.event.eventDate.toISOString(),
          eventTime: res.event.eventTime,
          location: res.event.location,
          category: res.event.category,
          imageUrl: res.event.imageUrl,
          isPublished: res.event.isPublished,
          createdAt: res.event.createdAt.toISOString(),
        };
        setEvents((prev) => [newEvent, ...prev]);
        setIsModalOpen(false);
      } else {
        setFeedback({ error: res.error || 'Failed to create event.' });
      }
    }
  };

  const handleTogglePublish = async (event: SchoolEventItem) => {
    const newStatus = !event.isPublished;
    const res = await togglePublishEventAction(event.id, newStatus);
    if (res.success) {
      setEvents((prev) =>
        prev.map((e) => (e.id === event.id ? { ...e, isPublished: newStatus } : e))
      );
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this event?')) return;
    setDeletingId(id);
    const res = await deleteEventAction(id);
    setDeletingId(null);
    if (res.success) {
      setEvents((prev) => prev.filter((e) => e.id !== id));
    }
  };

  const getCategoryBadge = (cat: EventCategory) => {
    switch (cat) {
      case 'ACADEMIC':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">ACADEMIC</span>;
      case 'CULTURAL':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200">CULTURAL</span>;
      case 'SPORTS':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">SPORTS</span>;
      case 'ANNOUNCEMENT':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">ANNOUNCEMENT</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#0B72E7]/10 text-[#0B72E7] flex items-center justify-center font-bold">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-black text-[#111C2D] tracking-tight">School Events & Happenings</h1>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Publish sports meets, cultural exhibitions, examinations, and institutional happenings
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={openCreateModal}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#0B72E7] hover:bg-[#0960C4] text-white font-bold text-xs shadow-xs transition-all active:scale-[0.98]"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Event</span>
        </button>
      </div>

      {/* Filter / Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 shrink-0" />
          <input
            type="text"
            placeholder="Search by title, location or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-transparent border-none outline-none w-full text-xs text-[#111C2D]"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-700 outline-none w-full md:w-44"
          >
            <option value="ALL">All Categories</option>
            <option value="ACADEMIC">Academic</option>
            <option value="CULTURAL">Cultural</option>
            <option value="SPORTS">Sports</option>
            <option value="ANNOUNCEMENT">Announcement</option>
          </select>
        </div>
      </div>

      {/* Events Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredEvents.length === 0 ? (
          <div className="col-span-full bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400">
            <Calendar className="w-8 h-8 mx-auto mb-2 text-slate-300" />
            <p className="font-semibold text-xs text-slate-600">No events found</p>
            <p className="text-[11px] text-slate-400 mt-1">Create an event or adjust search filters.</p>
          </div>
        ) : (
          filteredEvents.map((event) => (
            <div
              key={event.id}
              className="bg-white rounded-2xl border border-slate-200 shadow-2xs hover:shadow-md transition-shadow overflow-hidden flex flex-col justify-between"
            >
              <div>
                {/* Event Image Banner if available */}
                {event.imageUrl ? (
                  <div className="w-full h-36 bg-slate-100 overflow-hidden relative border-b border-slate-100">
                    <img
                      src={event.imageUrl}
                      alt={event.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-full h-16 bg-gradient-to-r from-slate-100 to-slate-50 flex items-center px-4 border-b border-slate-100">
                    {getCategoryBadge(event.category)}
                  </div>
                )}

                <div className="p-5 space-y-3">
                  {event.imageUrl && (
                    <div className="flex items-center justify-between">
                      {getCategoryBadge(event.category)}
                    </div>
                  )}

                  <h3 className="font-bold text-sm text-[#111C2D] leading-snug line-clamp-2">
                    {event.title}
                  </h3>

                  <p className="text-slate-500 text-xs line-clamp-3 leading-relaxed">
                    {event.description}
                  </p>

                  <div className="space-y-1.5 pt-2 border-t border-slate-100 text-[11px] text-slate-600 font-medium">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-[#0B72E7]" />
                      <span>
                        {new Date(event.eventDate).toLocaleDateString('en-IN', {
                          weekday: 'short',
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </span>
                    </div>

                    {event.eventTime && (
                      <div className="flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>{event.eventTime}</span>
                      </div>
                    )}

                    {event.location && (
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        <span className="truncate">{event.location}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => handleTogglePublish(event)}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold transition-colors ${
                    event.isPublished
                      ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                      : 'bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200'
                  }`}
                  title={event.isPublished ? 'Published (Click to hide)' : 'Draft (Click to publish)'}
                >
                  {event.isPublished ? (
                    <>
                      <Eye className="w-3 h-3" /> Published
                    </>
                  ) : (
                    <>
                      <EyeOff className="w-3 h-3" /> Draft
                    </>
                  )}
                </button>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => openEditModal(event)}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-[#111C2D] hover:bg-slate-200/60 transition-colors"
                    title="Edit event"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDelete(event.id)}
                    disabled={deletingId === event.id}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors disabled:opacity-50"
                    title="Delete event"
                  >
                    {deletingId === event.id ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Trash2 className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in-50 duration-150">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-lg w-full shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#EBF5FF] text-[#0B72E7] flex items-center justify-center font-bold">
                  <Calendar className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-[#111C2D]">
                  {editingEvent ? 'Edit School Event' : 'Create New School Event'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto text-xs">
              {feedback?.error && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{feedback.error}</span>
                </div>
              )}

              {/* Title */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Event Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Annual Inter-School Science & Tech Exhibition 2026"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 font-medium text-slate-800 outline-none focus:border-[#0B72E7]"
                />
              </div>

              {/* Category & Date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Category *</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as EventCategory)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 font-medium text-slate-800 outline-none focus:border-[#0B72E7]"
                  >
                    <option value="ACADEMIC">Academic</option>
                    <option value="CULTURAL">Cultural</option>
                    <option value="SPORTS">Sports</option>
                    <option value="ANNOUNCEMENT">Announcement</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Event Date *</label>
                  <input
                    type="date"
                    required
                    value={eventDate}
                    onChange={(e) => setEventDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 font-medium text-slate-800 outline-none focus:border-[#0B72E7]"
                  />
                </div>
              </div>

              {/* Time & Location */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Timing</label>
                  <input
                    type="text"
                    placeholder="09:00 AM - 01:00 PM"
                    value={eventTime}
                    onChange={(e) => setEventTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 font-medium text-slate-800 outline-none focus:border-[#0B72E7]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Venue / Location</label>
                  <input
                    type="text"
                    placeholder="Main Campus Auditorium"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 font-medium text-slate-800 outline-none focus:border-[#0B72E7]"
                  />
                </div>
              </div>

              {/* Image URL */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Cover Image URL (Optional)</label>
                <input
                  type="text"
                  placeholder="https://images.unsplash.com/... or /images/..."
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 font-medium text-slate-800 outline-none focus:border-[#0B72E7]"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Full Description *</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Provide comprehensive details about the event, rules, participation criteria, and guidelines..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 font-medium text-slate-800 outline-none focus:border-[#0B72E7] resize-none"
                />
              </div>

              {/* Publish Toggle */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="publishToggle"
                  checked={isPublished}
                  onChange={(e) => setIsPublished(e.target.checked)}
                  className="w-4 h-4 rounded-sm text-[#0B72E7] focus:ring-[#0B72E7] border-slate-300"
                />
                <label htmlFor="publishToggle" className="font-semibold text-slate-800 cursor-pointer">
                  Publish immediately (Auto-dispatches in-app notification to all users)
                </label>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-[#0B72E7] hover:bg-[#0960C4] text-white font-bold transition-all flex items-center gap-2 shadow-xs disabled:opacity-50"
                >
                  {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{editingEvent ? 'Save Changes' : 'Create Event'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
