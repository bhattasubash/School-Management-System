import Link from 'next/link';
import { Briefcase, LogOut, CheckCircle2, Calendar, Clock, ArrowRight } from 'lucide-react';
import { logoutAction } from '@/actions/auth';

export default function TeacherPortalPage() {
  return (
    <div className="min-h-screen bg-[#F4F6F9]">
      {/* Top Navbar */}
      <header className="bg-[#111C2D] text-white border-b border-gray-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#FA896B] flex items-center justify-center text-white">
            <Briefcase className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-bold leading-none">Delhi Public School • Teacher Portal</h1>
            <p className="text-xs text-gray-400 mt-1">Class Attendance & Timetable Workspace</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <span className="text-xs bg-[#26C281]/20 text-[#26C281] border border-[#26C281]/30 px-2.5 py-1 rounded-full font-semibold">
            Role: Teacher / Mentor
          </span>
          <form action={logoutAction}>
            <button
              type="submit"
              className="flex items-center gap-1.5 text-xs text-gray-300 hover:text-white bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              Sign Out
            </button>
          </form>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto p-6 md:p-8 space-y-6">
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#26C281]">Teacher Workspace Ready</span>
            <h2 className="text-2xl font-bold text-[#111C2D] mt-1">Welcome, Faculty Member</h2>
            <p className="text-sm text-gray-500 mt-1">
              Assigned to Class 10-A • Connected on <code className="text-xs bg-gray-100 px-2 py-0.5 rounded">teacher-portal</code> branch
            </p>
          </div>

          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-semibold text-[#111C2D] bg-gray-100 hover:bg-gray-200 px-4 py-2.5 rounded-xl transition-all"
          >
            Preview Student/Parent Portal <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#26C281] flex items-center justify-center mb-4">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-[#111C2D]">Daily Morning Attendance Register</h3>
            <p className="text-xs text-gray-500 mt-1 mb-4 leading-relaxed">
              Mobile-optimized attendance marker with single-tap toggle and default All Present mode (target: 45 students in &lt; 30 seconds).
            </p>
            <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
              Assigned to teacher-portal branch
            </span>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
              <Clock className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-[#111C2D]">Today&apos;s Class Schedule & Substitutions</h3>
            <p className="text-xs text-gray-500 mt-1 mb-4 leading-relaxed">
              Live period timetable with room assignments and substitution alerts powered by the Timetable Conflict Engine.
            </p>
            <span className="text-[11px] font-semibold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200">
              Assigned to teacher-portal branch
            </span>
          </div>
        </div>
      </main>
    </div>
  );
}
