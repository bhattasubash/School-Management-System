'use client';

import React, { useState } from 'react';
import {
  Users,
  Search,
  Filter,
  Download,
  Mail,
  Phone,
  Eye,
  Award,
  Calendar,
  X,
} from 'lucide-react';
import { TeacherPageHeader } from '@/components/teacher/TeacherPageHeader';
import { TeacherCard } from '@/components/teacher/TeacherComponents';

export default function StudentRosterPage() {
  const [selectedSection, setSelectedSection] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<any | null>(null);

  const roster = [
    { id: '1', roll: '01', name: 'Aarav Sharma', class: 'Grade 8', section: 'A', attendance: 96, gpa: 'A+', parent: 'Rajesh Sharma', phone: '+91 98110 23451' },
    { id: '2', roll: '02', name: 'Ananya Verma', class: 'Grade 8', section: 'A', attendance: 98, gpa: 'A+', parent: 'Sunita Verma', phone: '+91 98110 23452' },
    { id: '3', roll: '03', name: 'Dev Patel', class: 'Grade 8', section: 'A', attendance: 92, gpa: 'A', parent: 'Kiran Patel', phone: '+91 98110 23453' },
    { id: '4', roll: '04', name: 'Ishaan Gupta', class: 'Grade 8', section: 'A', attendance: 88, gpa: 'B+', parent: 'Manish Gupta', phone: '+91 98110 23454' },
    { id: '5', roll: '05', name: 'Kavya Singh', class: 'Grade 8', section: 'A', attendance: 100, gpa: 'A+', parent: 'Deepak Singh', phone: '+91 98110 23455' },
    { id: '6', roll: '01', name: 'Manav Joshi', class: 'Grade 9', section: 'B', attendance: 94, gpa: 'A', parent: 'Vikram Joshi', phone: '+91 98110 23456' },
    { id: '7', roll: '02', name: 'Meera Rao', class: 'Grade 9', section: 'B', attendance: 97, gpa: 'A+', parent: 'Sanjay Rao', phone: '+91 98110 23457' },
    { id: '8', roll: '03', name: 'Rohan Sharma', class: 'Grade 9', section: 'B', attendance: 95, gpa: 'A', parent: 'Alok Sharma', phone: '+91 98110 23458' },
    { id: '9', roll: '01', name: 'Sanya Malhotra', class: 'Grade 10', section: 'A', attendance: 91, gpa: 'B+', parent: 'Arun Malhotra', phone: '+91 98110 23459' },
    { id: '10', roll: '02', name: 'Vihaan Kumar', class: 'Grade 10', section: 'A', attendance: 99, gpa: 'A+', parent: 'Rakesh Kumar', phone: '+91 98110 23460' },
  ];

  const filtered = roster.filter(s => {
    const matchesSection = selectedSection === 'ALL' || `${s.class} - ${s.section}`.includes(selectedSection);
    const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase()) || s.roll.includes(searchQuery);
    return matchesSection && matchesSearch;
  });

  return (
    <div className="space-y-6">
      <TeacherPageHeader
        title="Student Roster"
        description="Students enrolled across your assigned grades and sections."
        breadcrumbs={[
          { label: 'Workspace', href: '/teacher' },
          { label: 'Student Roster' },
        ]}
        action={
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-[#102A56] hover:bg-slate-50 transition-colors shadow-xs"
          >
            <Download className="w-3.5 h-3.5 text-[#2563EB]" />
            <span>Export Roster</span>
          </button>
        }
      />

      <TeacherCard>
        {/* Search & Filter Toolbar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pb-4 border-b border-[#EEF2F6]">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-[#94A3B8] absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by student name or roll..."
              className="w-full h-10 pl-10 pr-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-[#102A56] placeholder-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/30"
            />
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <select
              value={selectedSection}
              onChange={(e) => setSelectedSection(e.target.value)}
              className="h-10 px-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-[#102A56] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/30 w-full sm:w-auto"
            >
              <option value="ALL">All Sections (10 Students)</option>
              <option value="Grade 8 - A">Grade 8 — Section A</option>
              <option value="Grade 9 - B">Grade 9 — Section B</option>
              <option value="Grade 10 - A">Grade 10 — Section A</option>
            </select>
          </div>
        </div>

        {/* Students Table */}
        <div className="overflow-x-auto mt-2">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-[#EEF2F6] text-[11px] font-bold text-[#64748B] uppercase tracking-wider">
                <th className="py-3 px-3 text-left w-16">Roll</th>
                <th className="py-3 px-3 text-left">Student</th>
                <th className="py-3 px-3 text-left">Class & Sec</th>
                <th className="py-3 px-3 text-left">Attendance</th>
                <th className="py-3 px-3 text-left">Performance</th>
                <th className="py-3 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F1F5F9] text-xs">
              {filtered.map((s) => (
                <tr key={s.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="py-3.5 px-3 font-mono font-bold text-[#102A56]">
                    #{s.roll}
                  </td>
                  <td className="py-3.5 px-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-50 text-[#2563EB] font-bold flex items-center justify-center shrink-0">
                        {s.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-semibold text-sm text-[#102A56]">{s.name}</p>
                        <p className="text-[11px] text-[#64748B]">Parent: {s.parent}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 px-3">
                    <span className="px-2 py-0.5 rounded-md bg-slate-100 font-semibold text-[#102A56] text-[11px]">
                      {s.class} — {s.section}
                    </span>
                  </td>
                  <td className="py-3.5 px-3">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-2 rounded-full bg-slate-100 overflow-hidden">
                        <div
                          className="h-full bg-emerald-500 rounded-full"
                          style={{ width: `${s.attendance}%` }}
                        />
                      </div>
                      <span className="font-semibold text-[#102A56]">{s.attendance}%</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-3">
                    <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      {s.gpa}
                    </span>
                  </td>
                  <td className="py-3.5 px-3 text-right">
                    <button
                      onClick={() => setSelectedStudent(s)}
                      className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-[#2563EB] hover:text-white text-[#102A56] text-xs font-semibold transition-colors cursor-pointer"
                    >
                      Profile
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </TeacherCard>

      {/* Student Details Modal */}
      {selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-[26px] p-6 max-w-md w-full shadow-2xl border border-white relative">
            <button
              onClick={() => setSelectedStudent(null)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-4 pb-4 border-b border-slate-100">
              <div className="w-14 h-14 rounded-full bg-blue-50 text-[#2563EB] text-xl font-bold flex items-center justify-center">
                {selectedStudent.name.charAt(0)}
              </div>
              <div>
                <h3 className="text-lg font-bold text-[#102A56]">{selectedStudent.name}</h3>
                <p className="text-xs text-[#64748B]">
                  Roll #{selectedStudent.roll} • {selectedStudent.class} ({selectedStudent.section})
                </p>
              </div>
            </div>

            <div className="py-4 space-y-3 text-xs">
              <div className="flex justify-between py-1.5 border-b border-slate-50">
                <span className="text-[#64748B]">Guardian Name</span>
                <span className="font-semibold text-[#102A56]">{selectedStudent.parent}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-50">
                <span className="text-[#64748B]">Emergency Contact</span>
                <span className="font-semibold text-[#102A56]">{selectedStudent.phone}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-50">
                <span className="text-[#64748B]">Current Attendance</span>
                <span className="font-semibold text-emerald-600">{selectedStudent.attendance}%</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-[#64748B]">Academic Standing</span>
                <span className="font-semibold text-[#2563EB]">{selectedStudent.gpa} Grade</span>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedStudent(null)}
                className="px-5 py-2 rounded-xl bg-[#2563EB] text-white text-xs font-semibold hover:bg-[#1D4ED8] transition-colors cursor-pointer"
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
