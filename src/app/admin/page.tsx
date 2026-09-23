import Link from 'next/link';
import { Building2, LogOut, ArrowRight, ShieldCheck, Users, Calendar, Award } from 'lucide-react';
import { logoutAction } from '@/actions/auth';

export default function AdminPortalPage() {
  return (
    <div className="min-h-screen bg-[#F4F6F9]">
      {/* Top Navbar */}
      <header className="bg-[#111C2D] text-white border-b border-gray-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#FA896B] flex items-center justify-center text-white">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-bold leading-none">Delhi Public School • ERP Admin Portal</h1>
            <p className="text-xs text-gray-400 mt-1">Academic & School Operations Management</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <span className="text-xs bg-[#FA896B]/20 text-[#FA896B] border border-[#FA896B]/30 px-2.5 py-1 rounded-full font-semibold">
            Role: School Admin
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
            <span className="text-xs font-bold uppercase tracking-wider text-[#FA896B]">Admin Portal Active</span>
            <h2 className="text-2xl font-bold text-[#111C2D] mt-1">School Administration Workspace</h2>
            <p className="text-sm text-gray-500 mt-1">
              Active Session: Academic Year 2026-27 • Connected on <code className="text-xs bg-gray-100 px-2 py-0.5 rounded">admin-portal</code> branch
            </p>
          </div>

          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-semibold text-[#111C2D] bg-gray-100 hover:bg-gray-200 px-4 py-2.5 rounded-xl transition-all"
          >
            Preview Student/Parent Portal <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Quick Module Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-10 h-10 rounded-xl bg-orange-50 text-[#FA896B] flex items-center justify-center mb-4">
              <Users className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-[#111C2D]">Student & Staff Directory</h3>
            <p className="text-xs text-gray-500 mt-1 mb-4 leading-relaxed">
              Manage student profiles, parent links, teacher records, and bulk Excel import/export.
            </p>
            <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
              Assigned to admin-portal branch
            </span>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
              <Calendar className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-[#111C2D]">Academic Structure</h3>
            <p className="text-xs text-gray-500 mt-1 mb-4 leading-relaxed">
              Configure Classes 1 to 12, Sections (A, B, C), and subject-to-teacher mappings.
            </p>
            <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
              Assigned to admin-portal branch
            </span>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-4">
              <Award className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-[#111C2D]">Fee Engine & Collections</h3>
            <p className="text-xs text-gray-500 mt-1 mb-4 leading-relaxed">
              Manage quarterly terms, 10-day grace periods, late fines, and counter receipts.
            </p>
            <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
              Assigned to database-backend branch
            </span>
          </div>
        </div>
      </main>
    </div>
  );
}
