'use client';

import React, { useState } from 'react';
import { User, Lock, Save, CheckCircle2, ShieldCheck, Mail, Phone, MapPin } from 'lucide-react';
import PortalPageHeader from '../PortalPageHeader';

interface ProfileSettingsScreenProps {
  student: {
    name: string;
    className: string;
    sectionName: string;
    rollNumber: number | null;
    admissionNumber: string;
    board: string;
    batchYear: string;
    avatarUrl?: string | null;
  };
  onBackToDashboard: () => void;
}

export default function ProfileSettingsScreen({
  student,
  onBackToDashboard,
}: ProfileSettingsScreenProps) {
  const [activeTab, setActiveTab] = useState<'profile' | 'security'>('profile');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSaved, setIsSaved] = useState(false);

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword) return;
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  return (
    <div className="space-y-6">
      <PortalPageHeader
        title="Profile & Settings"
        subtitle="Manage personal contact details, academic credentials, and account security"
        onBackToDashboard={onBackToDashboard}
      />

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          type="button"
          onClick={() => setActiveTab('profile')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeTab === 'profile'
              ? 'bg-[#2563EB] text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white'
          }`}
        >
          <User className="w-4 h-4" />
          <span>Student Profile</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('security')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeTab === 'security'
              ? 'bg-[#2563EB] text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white'
          }`}
        >
          <Lock className="w-4 h-4" />
          <span>Security & Password</span>
        </button>
      </div>

      {activeTab === 'profile' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Summary Avatar Card */}
          <div className="bg-white rounded-[22px] shadow-[0_4px_20px_rgba(0,100,200,0.06)] border border-blue-50/80 p-6 flex flex-col items-center text-center space-y-4">
            <div className="w-24 h-24 rounded-full border-4 border-[#2563EB] overflow-hidden bg-sky-50 shadow-md">
              <img
                src={student.avatarUrl || '/images/dashboard/ref_avatar.png'}
                alt={student.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/images/dashboard/ref_avatar.png';
                }}
              />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">{student.name}</h3>
              <p className="text-xs text-blue-600 font-semibold mt-0.5">
                Class {student.className} - {student.sectionName}
              </p>
              <p className="text-[11px] text-slate-400 mt-1">Roll No: {student.rollNumber || 27}</p>
            </div>
            <div className="w-full pt-4 border-t border-slate-100 text-left space-y-2.5 text-xs">
              <div className="flex items-center gap-2 text-slate-600">
                <Mail className="w-4 h-4 text-slate-400" />
                <span className="truncate">student@dps.edu.in</span>
              </div>
              <div className="flex items-center gap-2 text-slate-600">
                <Phone className="w-4 h-4 text-slate-400" />
                <span>+91 98112 34567</span>
              </div>
              <div className="flex items-center gap-2 text-slate-600">
                <MapPin className="w-4 h-4 text-slate-400" />
                <span>Delhi, India</span>
              </div>
            </div>
          </div>

          {/* Right: Detailed Info */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-[22px] shadow-[0_4px_20px_rgba(0,100,200,0.06)] border border-blue-50/80 p-6 space-y-5">
              <h4 className="text-sm font-bold text-slate-900">Academic & Personal Details</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="text-[11px] font-semibold text-slate-500 block mb-1">Full Name</label>
                  <input
                    type="text"
                    disabled
                    value={student.name}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 font-medium"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-500 block mb-1">Admission Number</label>
                  <input
                    type="text"
                    disabled
                    value={student.admissionNumber || 'SPS-2026-0428'}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 font-medium"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-500 block mb-1">Class & Section</label>
                  <input
                    type="text"
                    disabled
                    value={`Class ${student.className} - ${student.sectionName}`}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 font-medium"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-500 block mb-1">Roll Number</label>
                  <input
                    type="text"
                    disabled
                    value={student.rollNumber || 27}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 font-medium"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-500 block mb-1">Board Curriculum</label>
                  <input
                    type="text"
                    disabled
                    value={student.board || 'CBSE'}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 font-medium"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-500 block mb-1">Session Year</label>
                  <input
                    type="text"
                    disabled
                    value="2026 - 2027"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 font-medium"
                  />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-[22px] shadow-[0_4px_20px_rgba(0,100,200,0.06)] border border-blue-50/80 p-6 space-y-4">
              <h4 className="text-sm font-bold text-slate-900">Guardian / Contact Info</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-[11px] text-slate-400 block font-medium">Father / Guardian</span>
                  <span className="font-semibold text-slate-800 text-sm mt-0.5 block">Mr. R. Bhatta</span>
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 block font-medium">Mother&apos;s Name</span>
                  <span className="font-semibold text-slate-800 text-sm mt-0.5 block">Mrs. S. Bhatta</span>
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 block font-medium">Primary Contact Phone</span>
                  <span className="font-semibold text-slate-800 text-sm mt-0.5 block">+91 98112 34567</span>
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 block font-medium">Emergency Alert Phone</span>
                  <span className="font-semibold text-slate-800 text-sm mt-0.5 block">+91 98223 45678</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Security Tab */
        <div className="max-w-2xl bg-white rounded-[22px] shadow-[0_4px_20px_rgba(0,100,200,0.06)] border border-blue-50/80 p-6 sm:p-8 space-y-6">
          <div>
            <h3 className="text-base font-bold text-slate-900">Change Account Password</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Ensure your portal password is secure and at least 8 characters in length.
            </p>
          </div>

          {isSaved && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Password successfully updated!</span>
            </div>
          )}

          <form onSubmit={handlePasswordSubmit} className="space-y-4 text-xs">
            <div>
              <label className="text-[11px] font-semibold text-slate-600 block mb-1">Current Password</label>
              <input
                type="password"
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Enter current password"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-[#2563EB] focus:ring-2 focus:ring-blue-100 outline-none"
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-slate-600 block mb-1">New Password</label>
              <input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new strong password"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-[#2563EB] focus:ring-2 focus:ring-blue-100 outline-none"
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-slate-600 block mb-1">Confirm New Password</label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-type new password"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-[#2563EB] focus:ring-2 focus:ring-blue-100 outline-none"
              />
            </div>
            <button
              type="submit"
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-semibold shadow-xs transition-colors"
            >
              <Save className="w-4 h-4" />
              <span>Update Password</span>
            </button>
          </form>

          <div className="pt-4 border-t border-slate-100 flex items-center gap-2 text-xs text-slate-500">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Two-factor authentication (2FA) is enforced for all student accounts.</span>
          </div>
        </div>
      )}
    </div>
  );
}
