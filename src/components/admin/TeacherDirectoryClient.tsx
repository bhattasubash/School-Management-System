'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Search,
  GraduationCap,
  Mail,
  Phone,
  Calendar,
  Award,
  CheckCircle2,
  Clock,
  ChevronRight,
  Plus,
  BookOpen,
} from 'lucide-react';

export interface TeacherItem {
  id: string;
  name: string;
  email: string;
  phone: string;
  employeeId: string;
  department: string;
  qualification: string;
  specialization?: string | null;
  joiningDate: string;
  classTeacherSection?: string | null;
  activeSubstitution?: {
    date: string;
    originalTeacherName: string;
    reason: string;
  } | null;
}

interface TeacherDirectoryClientProps {
  teachers: TeacherItem[];
}

export default function TeacherDirectoryClient({
  teachers,
}: TeacherDirectoryClientProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDept, setSelectedDept] = useState('ALL');

  const departments = useMemo(() => {
    return Array.from(new Set(teachers.map((t) => t.department)));
  }, [teachers]);

  const filteredTeachers = useMemo(() => {
    return teachers.filter((t) => {
      const matchesSearch =
        searchTerm === '' ||
        t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.employeeId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.email.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesDept = selectedDept === 'ALL' || t.department === selectedDept;

      return matchesSearch && matchesDept;
    });
  }, [teachers, searchTerm, selectedDept]);

  return (
    <div className="space-y-6">
      {/* 1. HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl md:text-2xl font-black text-[#111C2D] tracking-tight">
              Faculty & Academic Staff Directory
            </h1>
            <span className="text-xs font-bold text-[#FF7555] bg-[#FFF2EE] px-2.5 py-0.5 rounded-full">
              {teachers.length} Active
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Department assignments, qualifications, class teachers, and active substitutions.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <Link
            href="/admin/academics"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#111C2D] hover:bg-[#1a2942] text-white text-xs font-bold transition-all shadow-xs"
          >
            <BookOpen className="w-3.5 h-3.5 text-[#FF7555]" />
            <span>Manage Timetable</span>
          </Link>
        </div>
      </div>

      {/* 2. FILTER & SEARCH CONTROL BAR */}
      <div className="bg-white p-4 rounded-2xl border border-[#EBF0F5] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#F4F8FA] border border-[#D9E2EC] text-slate-500 text-xs w-full md:w-80 focus-within:border-[#FF7555] focus-within:bg-white transition-all">
          <Search className="w-4 h-4 text-slate-400 shrink-0" />
          <input
            type="text"
            placeholder="Search by teacher name, department, or EMP ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-transparent border-none outline-none w-full text-xs text-[#111C2D] placeholder:text-slate-400"
          />
        </div>

        <div className="flex items-center gap-2.5">
          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="text-xs px-3 py-2 rounded-xl border border-slate-200 bg-[#F4F8FA] text-[#111C2D] font-medium focus:border-[#FF7555] focus:outline-none"
          >
            <option value="ALL">All Departments</option>
            {departments.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 3. TEACHER CARDS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filteredTeachers.map((teacher) => (
          <div
            key={teacher.id}
            className="bg-white rounded-2xl p-6 border border-[#EBF0F5] shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between space-y-4"
          >
            <div>
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#111C2D] to-slate-800 text-white font-black text-lg flex items-center justify-center shadow-md">
                    {teacher.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-[#111C2D]">
                      Dr. {teacher.name}
                    </h3>
                    <p className="text-xs font-semibold text-[#FF7555]">
                      {teacher.department}
                    </p>
                    <p className="text-[11px] font-mono text-slate-400 mt-0.5">
                      Emp ID: {teacher.employeeId}
                    </p>
                  </div>
                </div>

                {teacher.classTeacherSection ? (
                  <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                    Class Teacher {teacher.classTeacherSection}
                  </span>
                ) : (
                  <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-500">
                    Subject Specialist
                  </span>
                )}
              </div>

              {/* Qualifications & Specialization */}
              <div className="mt-4 p-3 rounded-xl bg-[#FAFCFE] border border-slate-100 space-y-1.5 text-xs text-slate-600">
                <div className="flex items-center gap-2">
                  <GraduationCap className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="font-medium truncate">{teacher.qualification}</span>
                </div>
                {teacher.specialization && (
                  <div className="flex items-center gap-2">
                    <Award className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="text-[11px] text-slate-500 truncate">
                      {teacher.specialization}
                    </span>
                  </div>
                )}
              </div>

              {/* Active Substitution Alert if covering today */}
              {teacher.activeSubstitution && (
                <div className="mt-3 p-3 rounded-xl bg-[#FFF2EE] border border-[#FFD9CF] text-xs">
                  <div className="flex items-center gap-1.5 font-bold text-[#FF7555]">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Assigned Substitution Today</span>
                  </div>
                  <p className="text-[11px] text-slate-600 mt-1">
                    Covering for{' '}
                    <span className="font-semibold text-[#111C2D]">
                      {teacher.activeSubstitution.originalTeacherName}
                    </span>{' '}
                    ({teacher.activeSubstitution.reason})
                  </p>
                </div>
              )}
            </div>

            {/* Contact Footer */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  <span>{teacher.email}</span>
                </div>
                <div className="flex items-center gap-1.5 hidden sm:flex">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  <span>{teacher.phone}</span>
                </div>
              </div>

              <span className="text-[10px] text-slate-400 font-medium">
                Joined {teacher.joiningDate}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
