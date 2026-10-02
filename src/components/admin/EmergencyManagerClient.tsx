'use client';

import React, { useState, useMemo } from 'react';
import {
  PhoneCall,
  Plus,
  Search,
  Filter,
  Phone,
  Mail,
  Shield,
  Trash2,
  Edit2,
  X,
  Loader2,
  AlertCircle,
  Flame,
  ShieldAlert,
  HeartPulse,
  Building,
  UserCheck,
} from 'lucide-react';
import {
  createEmergencyContactAction,
  updateEmergencyContactAction,
  deleteEmergencyContactAction,
} from '@/actions/emergency';
import { ContactCategory } from '@prisma/client';
import type {
  CreateEmergencyContactInput,
  UpdateEmergencyContactInput,
} from '@/lib/validations/emergency';

export interface EmergencyContactItem {
  id: string;
  name: string;
  designation: string;
  phone: string;
  email: string | null;
  category: ContactCategory;
  displayOrder: number;
}

interface EmergencyManagerClientProps {
  initialContacts: EmergencyContactItem[];
}

export default function EmergencyManagerClient({
  initialContacts,
}: EmergencyManagerClientProps) {
  const [contacts, setContacts] = useState<EmergencyContactItem[]>(initialContacts);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<EmergencyContactItem | null>(null);
  const [name, setName] = useState('');
  const [designation, setDesignation] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [category, setCategory] = useState<ContactCategory>(ContactCategory.MEDICAL);
  const [displayOrder, setDisplayOrder] = useState(0);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ success?: string; error?: string } | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Filtered
  const filteredContacts = useMemo(() => {
    return contacts.filter((c) => {
      const matchSearch =
        searchTerm === '' ||
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.designation.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.phone.includes(searchTerm);

      const matchCategory = selectedCategory === 'ALL' || c.category === selectedCategory;

      return matchSearch && matchCategory;
    });
  }, [contacts, searchTerm, selectedCategory]);

  const openCreateModal = () => {
    setEditingContact(null);
    setName('');
    setDesignation('');
    setPhone('+91 ');
    setEmail('');
    setCategory(ContactCategory.MEDICAL);
    setDisplayOrder(contacts.length);
    setFeedback(null);
    setIsModalOpen(true);
  };

  const openEditModal = (c: EmergencyContactItem) => {
    setEditingContact(c);
    setName(c.name);
    setDesignation(c.designation);
    setPhone(c.phone);
    setEmail(c.email || '');
    setCategory(c.category);
    setDisplayOrder(c.displayOrder);
    setFeedback(null);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !designation.trim() || !phone.trim()) {
      setFeedback({ error: 'Name, designation, and phone number are required.' });
      return;
    }

    setIsSubmitting(true);
    setFeedback(null);

    if (editingContact) {
      const res = await updateEmergencyContactAction({
        id: editingContact.id,
        name: name.trim(),
        designation: designation.trim(),
        phone: phone.trim(),
        email: email.trim() || undefined,
        category,
        displayOrder,
      });

      setIsSubmitting(false);

      if (res.success && res.contact) {
        setContacts((prev) =>
          prev
            .map((c) => (c.id === editingContact.id ? (res.contact as EmergencyContactItem) : c))
            .sort((a, b) => a.displayOrder - b.displayOrder)
        );
        setIsModalOpen(false);
      } else {
        setFeedback({ error: res.error || 'Failed to update contact.' });
      }
    } else {
      const res = await createEmergencyContactAction({
        name: name.trim(),
        designation: designation.trim(),
        phone: phone.trim(),
        email: email.trim() || undefined,
        category,
        displayOrder,
      });

      setIsSubmitting(false);

      if (res.success && res.contact) {
        setContacts((prev) =>
          [...prev, res.contact as EmergencyContactItem].sort(
            (a, b) => a.displayOrder - b.displayOrder
          )
        );
        setIsModalOpen(false);
      } else {
        setFeedback({ error: res.error || 'Failed to create contact.' });
      }
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to remove this emergency contact?')) return;
    setDeletingId(id);
    const res = await deleteEmergencyContactAction(id);
    setDeletingId(null);
    if (res.success) {
      setContacts((prev) => prev.filter((c) => c.id !== id));
    }
  };

  const getCategoryIcon = (cat: ContactCategory) => {
    switch (cat) {
      case 'MEDICAL':
        return <HeartPulse className="w-4 h-4 text-rose-500" />;
      case 'SECURITY':
        return <Shield className="w-4 h-4 text-blue-500" />;
      case 'FIRE':
        return <Flame className="w-4 h-4 text-orange-500" />;
      case 'POLICE':
        return <ShieldAlert className="w-4 h-4 text-indigo-500" />;
      case 'ADMINISTRATION':
        return <Building className="w-4 h-4 text-emerald-500" />;
      default:
        return <PhoneCall className="w-4 h-4 text-slate-500" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#0B72E7]/10 text-[#0B72E7] flex items-center justify-center font-bold">
            <PhoneCall className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-black text-[#111C2D] tracking-tight">Emergency Directory & Authorities</h1>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Direct emergency helplines, medical officers, police/fire dispatch, and school executive directory
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={openCreateModal}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#0B72E7] hover:bg-[#0960C4] text-white font-bold text-xs shadow-xs transition-all active:scale-[0.98]"
        >
          <Plus className="w-4 h-4" />
          <span>Add Contact</span>
        </button>
      </div>

      {/* Filter / Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 shrink-0" />
          <input
            type="text"
            placeholder="Search by name, role or phone..."
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
            <option value="MEDICAL">Medical</option>
            <option value="ADMINISTRATION">Administration</option>
            <option value="SECURITY">Security</option>
            <option value="FIRE">Fire</option>
            <option value="POLICE">Police</option>
            <option value="OTHER">Other</option>
          </select>
        </div>
      </div>

      {/* Contacts Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredContacts.length === 0 ? (
          <div className="col-span-full bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400">
            <PhoneCall className="w-8 h-8 mx-auto mb-2 text-slate-300" />
            <p className="font-semibold text-xs text-slate-600">No emergency contacts found</p>
            <p className="text-[11px] text-slate-400 mt-1">Add helplines or key authorities.</p>
          </div>
        ) : (
          filteredContacts.map((contact) => (
            <div
              key={contact.id}
              className="bg-white rounded-2xl border border-slate-200 shadow-2xs hover:shadow-md transition-shadow p-5 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center shrink-0 border border-slate-200">
                      {getCategoryIcon(contact.category)}
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-[#111C2D] leading-tight">
                        {contact.name}
                      </h3>
                      <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                        {contact.designation}
                      </p>
                    </div>
                  </div>

                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 uppercase tracking-wider">
                    {contact.category}
                  </span>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 space-y-2 text-xs">
                  <div className="flex items-center gap-2 text-slate-700">
                    <Phone className="w-3.5 h-3.5 text-[#0B72E7] shrink-0" />
                    <a
                      href={`tel:${contact.phone}`}
                      className="font-bold hover:underline hover:text-[#0B72E7]"
                    >
                      {contact.phone}
                    </a>
                  </div>

                  {contact.email && (
                    <div className="flex items-center gap-2 text-slate-500 text-[11px]">
                      <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <a
                        href={`mailto:${contact.email}`}
                        className="truncate hover:underline hover:text-slate-800"
                      >
                        {contact.email}
                      </a>
                    </div>
                  )}
                </div>
              </div>

              {/* Card Actions */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                <a
                  href={`tel:${contact.phone}`}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#EBF5FF] text-[#0B72E7] hover:bg-[#ffe3dc] font-bold text-xs transition-colors"
                >
                  <Phone className="w-3 h-3" />
                  <span>Call Now</span>
                </a>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => openEditModal(contact)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                    title="Edit Contact"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDelete(contact.id)}
                    disabled={deletingId === contact.id}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors disabled:opacity-50"
                    title="Delete Contact"
                  >
                    {deletingId === contact.id ? (
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

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in-50 duration-150">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-md w-full shadow-2xl overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#EBF5FF] text-[#0B72E7] flex items-center justify-center font-bold">
                  <PhoneCall className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-[#111C2D]">
                  {editingContact ? 'Edit Emergency Contact' : 'Add Emergency Helpline / Authority'}
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

            <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
              {feedback?.error && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{feedback.error}</span>
                </div>
              )}

              {/* Name */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Contact / Officer Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dr. Rajesh Nambiar / Campus Security Desk"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 font-medium text-slate-800 outline-none focus:border-[#0B72E7]"
                />
              </div>

              {/* Designation */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Designation / Role *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Chief Medical Officer / Station Fire Marshal"
                  value={designation}
                  onChange={(e) => setDesignation(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 font-medium text-slate-800 outline-none focus:border-[#0B72E7]"
                />
              </div>

              {/* Category & Order */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Category *</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as ContactCategory)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 font-medium text-slate-800 outline-none focus:border-[#0B72E7]"
                  >
                    <option value="MEDICAL">Medical Emergency</option>
                    <option value="ADMINISTRATION">Administration</option>
                    <option value="SECURITY">Campus Security</option>
                    <option value="FIRE">Fire Service</option>
                    <option value="POLICE">Police Station</option>
                    <option value="OTHER">Other Essential</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Display Order</label>
                  <input
                    type="number"
                    min={0}
                    value={displayOrder}
                    onChange={(e) => setDisplayOrder(parseInt(e.target.value, 10) || 0)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 font-medium text-slate-800 outline-none focus:border-[#0B72E7]"
                  />
                </div>
              </div>

              {/* Phone */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Phone Number / Helpline *</label>
                <input
                  type="text"
                  required
                  placeholder="+91 98765 43210 or 112"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 font-medium text-slate-800 outline-none focus:border-[#0B72E7]"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Email Address (Optional)</label>
                <input
                  type="email"
                  placeholder="emergency@dps.edu.in"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 font-medium text-slate-800 outline-none focus:border-[#0B72E7]"
                />
              </div>

              {/* Buttons */}
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
                  <span>{editingContact ? 'Save Changes' : 'Add Contact'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
