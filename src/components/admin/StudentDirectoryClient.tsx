'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Search,
  Filter,
  Users,
  ChevronRight,
  Eye,
  Phone,
  Mail,
  X,
  CreditCard,
  CalendarCheck,
  Award,
  ArrowUpDown,
  Download,
  Plus,
} from 'lucide-react';

export interface StudentItem {
  id: string;
  name: string;
  firstName: string;
  lastName: string;
  email: string;
  admissionNumber: string;
  rollNumber: number | null;
  className: string;
  sectionName: string;
  classSection: string;
  gender: string;
  dateOfBirth: string;
  bloodGroup?: string | null;
  address: string;
  emergencyContact: string;
  attendancePercentage: number;
  feeStatus: {
    totalInvoiced: number;
    totalPaid: number;
    pendingAmount: number;
    status: 'PAID' | 'PENDING' | 'OVERDUE';
  };
  parent?: {
    name: string;
    relationship: string;
    phone: string;
    email: string;
  } | null;
}

interface StudentDirectoryClientProps {
  students: StudentItem[];
  classList: string[];
}

export default function StudentDirectoryClient({
  students,
  classList,
}: StudentDirectoryClientProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState('ALL');
  const [selectedGender, setSelectedGender] = useState('ALL');
  const [selectedFeeStatus, setSelectedFeeStatus] = useState('ALL');
  const [activeStudent, setActiveStudent] = useState<StudentItem | null>(null);

  // Filter students with high efficiency
  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      const matchesSearch =
        searchTerm === '' ||
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.admissionNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.email.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesClass = selectedClass === 'ALL' || s.classSection === selectedClass;
      const matchesGender = selectedGender === 'ALL' || s.gender.toLowerCase() === selectedGender.toLowerCase();
      const matchesFee = selectedFeeStatus === 'ALL' || s.feeStatus.status === selectedFeeStatus;

      return matchesSearch && matchesClass && matchesGender && matchesFee;
    });
  }, [students, searchTerm, selectedClass, selectedGender, selectedFeeStatus]);

  return (
    <div className="space-y-6">
      {/* 1. DIRECTORY HEADER & QUICK STATS */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl md:text-2xl font-black text-[#111C2D] tracking-tight">
              Student Information & Enrollment Directory
            </h1>
            <span className="text-xs font-bold text-[#FF7555] bg-[#FFF2EE] px-2.5 py-0.5 rounded-full">
              {students.length} Total
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Class 10-A • Zero-trust tenant isolated directory with real-time fee & attendance ledger.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <Link
            href="/admin/admissions"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#111C2D] hover:bg-[#1a2942] text-white text-xs font-bold transition-all shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Admit Student</span>
          </Link>
        </div>
      </div>

      {/* 2. FILTER & SEARCH CONTROL BAR */}
      <div className="bg-white p-4 rounded-2xl border border-[#EBF0F5] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#F4F8FA] border border-[#D9E2EC] text-slate-500 text-xs w-full md:w-80 focus-within:border-[#FF7555] focus-within:bg-white transition-all">
          <Search className="w-4 h-4 text-slate-400 shrink-0" />
          <input
            type="text"
            placeholder="Search by student name, roll, or admission ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-transparent border-none outline-none w-full text-xs text-[#111C2D] placeholder:text-slate-400"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Dropdown Filters */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Class Filter */}
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="text-xs px-3 py-2 rounded-xl border border-slate-200 bg-[#F4F8FA] text-[#111C2D] font-medium focus:border-[#FF7555] focus:outline-none"
          >
            <option value="ALL">All Classes</option>
            {classList.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          {/* Gender Filter */}
          <select
            value={selectedGender}
            onChange={(e) => setSelectedGender(e.target.value)}
            className="text-xs px-3 py-2 rounded-xl border border-slate-200 bg-[#F4F8FA] text-[#111C2D] font-medium focus:border-[#FF7555] focus:outline-none"
          >
            <option value="ALL">All Genders</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
          </select>

          {/* Fee Status Filter */}
          <select
            value={selectedFeeStatus}
            onChange={(e) => setSelectedFeeStatus(e.target.value)}
            className="text-xs px-3 py-2 rounded-xl border border-slate-200 bg-[#F4F8FA] text-[#111C2D] font-medium focus:border-[#FF7555] focus:outline-none"
          >
            <option value="ALL">All Fee Status</option>
            <option value="PAID">Nil Due (Paid)</option>
            <option value="PENDING">Pending Dues</option>
          </select>
        </div>
      </div>

      {/* 3. RESPONSIVE ROSTER TABLE */}
      <div className="bg-white rounded-2xl border border-[#EBF0F5] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#FAFCFE] border-b border-[#EEF2F6] text-slate-500 font-bold uppercase tracking-wider text-[11px]">
                <th className="py-3.5 px-4">Roll</th>
                <th className="py-3.5 px-4">Student Profile</th>
                <th className="py-3.5 px-4">Admission ID</th>
                <th className="py-3.5 px-4">Class & Sec</th>
                <th className="py-3.5 px-4 text-center">Attendance</th>
                <th className="py-3.5 px-4 text-center">Fee Status</th>
                <th className="py-3.5 px-4">Parent / Guardian</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    No students found matching your search filter.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((s) => (
                  <tr
                    key={s.id}
                    className="hover:bg-[#FAFCFE] transition-colors group cursor-pointer"
                    onClick={() => setActiveStudent(s)}
                  >
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-700">
                      {s.rollNumber ? String(s.rollNumber).padStart(2, '0') : '-'}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#E8F0FE] text-[#1F51FF] font-bold flex items-center justify-center shrink-0">
                          {s.firstName.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-[#111C2D] group-hover:text-[#FF7555] transition-colors">
                            {s.name}
                          </p>
                          <p className="text-[10px] text-slate-400">{s.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-semibold text-slate-600">
                      {s.admissionNumber}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-800">
                      {s.classSection}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {s.attendancePercentage}%
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      {s.feeStatus.pendingAmount === 0 ? (
                        <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          Nil Due
                        </span>
                      ) : (
                        <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-[#FF7555] border border-amber-200">
                          ₹{s.feeStatus.pendingAmount.toLocaleString('en-IN')} Due
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      {s.parent ? (
                        <div>
                          <p className="font-bold text-slate-700">{s.parent.name}</p>
                          <p className="text-[10px] text-slate-400">
                            {s.parent.relationship} • {s.parent.phone}
                          </p>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">Not Linked</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveStudent(s);
                        }}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-[#FF7555] hover:bg-[#FFF2EE] transition-colors"
                        title="View Full Profile"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer */}
        <div className="p-4 bg-[#FAFCFE] border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>
            Showing {filteredStudents.length} of {students.length} students enrolled
          </span>
          <span className="font-semibold text-slate-700">
            Delhi Public School • Secondary Wing
          </span>
        </div>
      </div>

      {/* 4. STUDENT DETAIL SLIDE-OVER DRAWER */}
      {activeStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/50 backdrop-blur-xs">
          <div className="bg-white w-full max-w-md h-full shadow-2xl p-6 md:p-8 overflow-y-auto animate-in slide-in-from-right duration-200 flex flex-col justify-between">
            <div>
              {/* Header */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-[#FF7555] uppercase tracking-wider">
                    Student Profile
                  </span>
                  <span className="text-xs text-slate-300">•</span>
                  <span className="text-xs font-semibold text-slate-500">
                    Roll {activeStudent.rollNumber || '-'}
                  </span>
                </div>
                <button
                  onClick={() => setActiveStudent(null)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Student Demographics Card */}
              <div className="mt-6 flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#111C2D] to-slate-800 text-white font-black text-2xl flex items-center justify-center shadow-md">
                  {activeStudent.firstName.charAt(0)}
                </div>
                <div>
                  <h3 className="text-lg font-black text-[#111C2D]">
                    {activeStudent.name}
                  </h3>
                  <p className="text-xs font-bold text-[#FF7555] mt-0.5">
                    Class {activeStudent.classSection} • Adm ID: {activeStudent.admissionNumber}
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">{activeStudent.email}</p>
                </div>
              </div>

              {/* Quick Metrics */}
              <div className="grid grid-cols-2 gap-3 mt-6">
                <div className="p-3 rounded-xl bg-[#FAFCFE] border border-slate-200">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Attendance Rate
                  </span>
                  <p className="text-xl font-black text-[#26C281] mt-0.5">
                    {activeStudent.attendancePercentage}%
                  </p>
                  <p className="text-[10px] text-slate-500 font-medium">CBSE Eligible</p>
                </div>

                <div className="p-3 rounded-xl bg-[#FAFCFE] border border-slate-200">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Fee Balance
                  </span>
                  <p
                    className={`text-xl font-black mt-0.5 ${
                      activeStudent.feeStatus.pendingAmount > 0 ? 'text-[#FF7555]' : 'text-[#26C281]'
                    }`}
                  >
                    {activeStudent.feeStatus.pendingAmount > 0
                      ? `₹${activeStudent.feeStatus.pendingAmount.toLocaleString('en-IN')}`
                      : 'Nil Due'}
                  </p>
                  <p className="text-[10px] text-slate-500 font-medium">
                    {activeStudent.feeStatus.status}
                  </p>
                </div>
              </div>

              {/* Personal Information */}
              <div className="mt-6 space-y-3">
                <h4 className="text-xs font-bold text-[#111C2D] uppercase tracking-wider">
                  Personal Information
                </h4>
                <div className="text-xs space-y-2 bg-[#F4F8FA] p-4 rounded-xl border border-slate-200/80">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Gender:</span>
                    <span className="font-bold text-[#111C2D]">{activeStudent.gender}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Date of Birth:</span>
                    <span className="font-bold text-[#111C2D]">{activeStudent.dateOfBirth}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Blood Group:</span>
                    <span className="font-bold text-[#111C2D]">
                      {activeStudent.bloodGroup || 'B+'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Emergency Phone:</span>
                    <span className="font-mono font-bold text-[#111C2D]">
                      {activeStudent.emergencyContact}
                    </span>
                  </div>
                  <div className="pt-2 border-t border-slate-200 text-slate-600">
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">
                      Address:
                    </span>
                    {activeStudent.address}
                  </div>
                </div>
              </div>

              {/* Linked Parent Information */}
              <div className="mt-6 space-y-3">
                <h4 className="text-xs font-bold text-[#111C2D] uppercase tracking-wider">
                  Parent / Guardian Details
                </h4>
                {activeStudent.parent ? (
                  <div className="text-xs bg-[#FFF2EE]/60 p-4 rounded-xl border border-[#FFD9CF] space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-[#111C2D]">{activeStudent.parent.name}</span>
                      <span className="text-[10px] font-bold text-[#FF7555] bg-white px-2 py-0.5 rounded-full border border-[#FFD9CF]">
                        {activeStudent.parent.relationship}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-600">
                      <Phone className="w-3.5 h-3.5 text-[#FF7555]" />
                      <span>{activeStudent.parent.phone}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-600">
                      <Mail className="w-3.5 h-3.5 text-[#FF7555]" />
                      <span>{activeStudent.parent.email}</span>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-500 italic text-center">
                    No parent account linked to this student yet.
                  </div>
                )}
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="pt-6 border-t border-slate-100 flex items-center gap-3">
              <Link
                href="/admin/fees"
                className="flex-1 py-2.5 rounded-xl bg-[#111C2D] hover:bg-[#1a2942] text-white text-xs font-bold text-center transition-colors shadow-xs"
              >
                Record Fee Payment
              </Link>
              <button
                onClick={() => setActiveStudent(null)}
                className="px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
