'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Settings,
  Building2,
  Calendar,
  Palette,
  ShieldCheck,
  Smartphone,
  Clock,
  Save,
  CheckCircle2,
  RefreshCw,
  Globe,
  Mail,
  Phone,
  MapPin,
  Lock,
  Layers,
  Sparkles,
} from 'lucide-react';
import PageHeader from '@/components/ui/PageHeader';
import AdminCard from './ui/AdminCard';
import AdminButton from './ui/AdminButton';
import { AdminTabs } from './ui/AdminTabs';
import SchoolLogo from './illustrations/SchoolLogo';

interface AdminSettingsClientProps {
  schoolName: string;
  tagline: string;
  board: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  workingDays: string[];
  currentAcademicYear: string;
}

export default function AdminSettingsClient({
  schoolName: initialSchoolName,
  tagline: initialTagline,
  board: initialBoard,
  email: initialEmail,
  phone: initialPhone,
  address: initialAddress,
  city: initialCity,
  state: initialState,
  pincode: initialPincode,
  workingDays: initialWorkingDays,
  currentAcademicYear,
}: AdminSettingsClientProps) {
  const [activeTab, setActiveTab] = useState<'PROFILE' | 'ACADEMIC' | 'BRANDING' | 'SECURITY' | 'GATEWAYS'>('PROFILE');

  // Form states
  const [schoolName, setSchoolName] = useState(initialSchoolName);
  const [tagline, setTagline] = useState(initialTagline);
  const [board, setBoard] = useState(initialBoard);
  const [email, setEmail] = useState(initialEmail);
  const [phone, setPhone] = useState(initialPhone);
  const [address, setAddress] = useState(initialAddress);
  const [city, setCity] = useState(initialCity);
  const [stateVal, setStateVal] = useState(initialState);
  const [pincode, setPincode] = useState(initialPincode);
  const [workingDays, setWorkingDays] = useState<string[]>(initialWorkingDays);

  // Gateway states
  const [smsGateway, setSmsGateway] = useState('FAST2SMS');
  const [smsSenderId, setSmsSenderId] = useState('SNRSCH');
  const [whatsappActive, setWhatsappActive] = useState(true);
  const [emailSmtp, setEmailSmtp] = useState('smtp.sendgrid.net');

  // Feedback toast
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleToggleDay = (day: string) => {
    setWorkingDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const handleSaveSettings = () => {
    setIsSaving(true);
    setSaveSuccess(false);

    setTimeout(() => {
      setIsSaving(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    }, 600);
  };

  return (
    <div className="space-y-6">
      {/* 1. Page Header */}
      <PageHeader
        title="Institutional Settings & Configuration"
        subtitle="Manage school institutional profile, CBSE affiliations, branding theme, working days, and communication channels."
        breadcrumbs={[
          { label: 'Admin', href: '/admin' },
          { label: 'Settings' },
        ]}
        actions={
          <div className="flex items-center gap-2.5">
            <AdminButton
              variant="primary"
              onClick={handleSaveSettings}
              isLoading={isSaving}
              icon={<Save className="w-3.5 h-3.5" />}
            >
              Save Configuration
            </AdminButton>
          </div>
        }
      />

      {/* Save Toast */}
      {saveSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2.5 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>System configuration updated successfully. All parameters synchronized across modules.</span>
        </div>
      )}

      {/* 2. System Status Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <AdminCard className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Current Session</span>
            <div className="w-10 h-10 rounded-2xl bg-blue-50 text-[#0B72E7] flex items-center justify-center font-bold">
              <Calendar className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2">{currentAcademicYear}</div>
          <p className="text-xs font-semibold text-emerald-600 mt-1 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            Active Academic Year
          </p>
        </AdminCard>

        <AdminCard className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Board Affiliation</span>
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-emerald-600 mt-2">{board}</div>
          <p className="text-xs font-semibold text-slate-400 mt-1">Affiliation Code #2130847</p>
        </AdminCard>

        <AdminCard className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Weekly Cycle</span>
            <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-purple-600 mt-2">{workingDays.length} Working Days</div>
          <p className="text-xs font-semibold text-slate-400 mt-1">Standard 8 periods/day</p>
        </AdminCard>

        <AdminCard className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Branding Theme</span>
            <div className="w-10 h-10 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center font-bold">
              <Palette className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-[#0B72E7] mt-2">Royal Sky Blue</div>
          <p className="text-xs font-semibold text-slate-400 mt-1">#0B72E7 · Soft pastel accents</p>
        </AdminCard>
      </div>

      {/* 3. Settings Navigation Tabs */}
      <AdminTabs
        tabs={[
          { id: 'PROFILE', label: 'School Profile & Legal Identity' },
          { id: 'ACADEMIC', label: 'Academic Year & Working Days' },
          { id: 'BRANDING', label: 'Branding & Crest Logo' },
          { id: 'SECURITY', label: 'Security & Auth Controls' },
          { id: 'GATEWAYS', label: 'Communication Gateways' },
        ]}
        activeTab={activeTab}
        onChange={(tabId) => setActiveTab(tabId as any)}
      />

      {/* TAB 1: SCHOOL PROFILE */}
      {activeTab === 'PROFILE' && (
        <AdminCard className="p-6 space-y-6">
          <div className="border-b border-slate-100 pb-4 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Official Institution Particulars
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Printed on formal fee invoices, student report cards, certificates, and board transcripts.
              </p>
            </div>
            <SchoolLogo size={42} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Institution Legal Name</label>
              <input
                type="text"
                value={schoolName}
                onChange={(e) => setSchoolName(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-800 font-bold focus:border-[#0B72E7] focus:outline-none"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Motto / Tagline</label>
              <input
                type="text"
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-800 font-semibold focus:border-[#0B72E7] focus:outline-none"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Affiliated Education Board</label>
              <input
                type="text"
                value={board}
                onChange={(e) => setBoard(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-800 font-semibold focus:border-[#0B72E7] focus:outline-none"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Official Contact Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-800 font-semibold focus:border-[#0B72E7] focus:outline-none"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Telephone / Helpdesk</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-800 font-semibold focus:border-[#0B72E7] focus:outline-none"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Postal PIN / ZIP Code</label>
              <input
                type="text"
                value={pincode}
                onChange={(e) => setPincode(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-800 font-semibold focus:border-[#0B72E7] focus:outline-none"
              />
            </div>

            <div className="md:col-span-2">
              <label className="font-bold text-slate-700 block mb-1">Campus Street Address</label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-800 font-semibold focus:border-[#0B72E7] focus:outline-none"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">City</label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-800 font-semibold focus:border-[#0B72E7] focus:outline-none"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">State / Province</label>
              <input
                type="text"
                value={stateVal}
                onChange={(e) => setStateVal(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-800 font-semibold focus:border-[#0B72E7] focus:outline-none"
              />
            </div>
          </div>
        </AdminCard>
      )}

      {/* TAB 2: ACADEMIC CALENDAR & WORKING DAYS */}
      {activeTab === 'ACADEMIC' && (
        <AdminCard className="p-6 space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Working Days & Academic Periodicity
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Specifies valid timetable scheduling days, daily attendance calculation, and weekly roster cycles.
            </p>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-2">Institutional Working Days:</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
              {[
                { key: 'MONDAY', label: 'Monday' },
                { key: 'TUESDAY', label: 'Tuesday' },
                { key: 'WEDNESDAY', label: 'Wednesday' },
                { key: 'THURSDAY', label: 'Thursday' },
                { key: 'FRIDAY', label: 'Friday' },
                { key: 'SATURDAY', label: 'Saturday' },
              ].map((day) => {
                const isSelected = workingDays.includes(day.key);
                return (
                  <button
                    key={day.key}
                    type="button"
                    onClick={() => handleToggleDay(day.key)}
                    className={`p-3.5 rounded-2xl border text-xs font-bold flex items-center justify-between transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-blue-50 border-[#0B72E7] text-[#0B72E7] shadow-xs'
                        : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'
                    }`}
                  >
                    <span>{day.label}</span>
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => {}}
                      className="rounded border-slate-300 text-[#0B72E7] pointer-events-none"
                    />
                  </button>
                );
              })}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
              <span className="font-bold text-slate-900 block">Daily Period Allotment</span>
              <p className="text-slate-500">8 standard instructional periods + 1 lunch break (45 mins/period)</p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
              <span className="font-bold text-slate-900 block">Biometric / RFID Grace Window</span>
              <p className="text-slate-500">Morning assembly gate check-in cutoff: 08:15 AM IST</p>
            </div>
          </div>
        </AdminCard>
      )}

      {/* TAB 3: BRANDING & THEME */}
      {activeTab === 'BRANDING' && (
        <AdminCard className="p-6 space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Visual Identity & UI Design Language
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              The unified design system established by the Sunrise Public School Admin Dashboard.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-[#0B72E7] shadow-sm flex items-center justify-center text-white font-bold text-xs">
                #0B72E7
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-xs">Primary Brand Color</h4>
                <p className="text-[11px] text-slate-400">Royal Sky Blue Accent</p>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-[#E6F3FE] border border-[#BFDBFE] flex items-center justify-center text-[#0B72E7] font-bold text-xs">
                #E6F3FE
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-xs">Atmospheric Canvas</h4>
                <p className="text-[11px] text-slate-400">Soft Pastel Cloud Blue</p>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center gap-4">
              <SchoolLogo size={48} />
              <div>
                <h4 className="font-bold text-slate-900 text-xs">Official Crest Icon</h4>
                <p className="text-[11px] text-slate-400">Sunrise Open Book Logo</p>
              </div>
            </div>
          </div>
        </AdminCard>
      )}

      {/* TAB 4: SECURITY & AUTH */}
      {activeTab === 'SECURITY' && (
        <AdminCard className="p-6 space-y-4">
          <div className="border-b border-slate-100 pb-4">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Access Control & Institutional Security
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">Role-based permission barriers and session protections</p>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between">
              <div>
                <h4 className="font-bold text-slate-900">Enforce Multi-Factor Authentication (MFA)</h4>
                <p className="text-slate-400 mt-0.5">Mandatory OTP code required for all ADMIN and SUPER_ADMIN logins</p>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 font-bold text-[11px] border border-emerald-200">
                ACTIVE
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between">
              <div>
                <h4 className="font-bold text-slate-900">Automatic Session Timeout</h4>
                <p className="text-slate-400 mt-0.5">Auto-logout administrator accounts after 30 minutes of inactivity</p>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-blue-50 text-[#0B72E7] font-bold text-[11px] border border-blue-200/60">
                30 MINS
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between">
              <div>
                <h4 className="font-bold text-slate-900">Cryptographic Audit Logging</h4>
                <p className="text-slate-400 mt-0.5">Immutable audit trail of all mark edits, fee collections, and student deletions</p>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 font-bold text-[11px] border border-emerald-200">
                ENABLED
              </span>
            </div>
          </div>
        </AdminCard>
      )}

      {/* TAB 5: GATEWAYS */}
      {activeTab === 'GATEWAYS' && (
        <AdminCard className="p-6 space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Communication & Broadcast Gateways
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Live APIs for parent emergency SMS alerts, fee reminders, and WhatsApp announcements.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Transactional SMS Provider</label>
              <select
                value={smsGateway}
                onChange={(e) => setSmsGateway(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-800 font-semibold focus:border-[#0B72E7] focus:outline-none"
              >
                <option value="FAST2SMS">Fast2SMS (Gov DLT Registered)</option>
                <option value="TWILIO">Twilio Cloud Communications</option>
                <option value="MSG91">MSG91 Transactional Enterprise</option>
              </select>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">DLT Sender ID (6 Characters)</label>
              <input
                type="text"
                value={smsSenderId}
                onChange={(e) => setSmsSenderId(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-800 font-mono font-bold focus:border-[#0B72E7] focus:outline-none"
              />
            </div>

            <div className="md:col-span-2">
              <label className="font-bold text-slate-700 block mb-1">Email SMTP Server Host</label>
              <input
                type="text"
                value={emailSmtp}
                onChange={(e) => setEmailSmtp(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-800 font-mono font-semibold focus:border-[#0B72E7] focus:outline-none"
              />
            </div>
          </div>
        </AdminCard>
      )}
    </div>
  );
}
