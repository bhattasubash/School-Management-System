import Link from 'next/link';
import { Globe, LogOut, ShieldCheck, Building, Database, ArrowRight } from 'lucide-react';
import { logoutAction } from '@/actions/auth';

export default function SuperAdminPortalPage() {
  return (
    <div className="min-h-screen bg-[#F4F6F9]">
      {/* Top Navbar */}
      <header className="bg-[#111C2D] text-white border-b border-gray-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-purple-600 flex items-center justify-center text-white">
            <Globe className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-bold leading-none">School ERP SaaS • Super Admin Command Center</h1>
            <p className="text-xs text-gray-400 mt-1">Multi-Tenant Management & Platform Oversight</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <span className="text-xs bg-purple-500/20 text-purple-300 border border-purple-500/30 px-2.5 py-1 rounded-full font-semibold">
            Role: Super Admin
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
            <span className="text-xs font-bold uppercase tracking-wider text-purple-600">Platform Command Center</span>
            <h2 className="text-2xl font-bold text-[#111C2D] mt-1">SaaS Multi-Tenant Architecture</h2>
            <p className="text-sm text-gray-500 mt-1">
              Cross-Tenant Governance • Row-Level Isolation Enforced • Connected on <code className="text-xs bg-gray-100 px-2 py-0.5 rounded">database-backend</code> branch
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/admin"
              className="inline-flex items-center gap-2 text-xs font-semibold text-[#111C2D] bg-gray-100 hover:bg-gray-200 px-4 py-2.5 rounded-xl transition-all"
            >
              Go to School Admin <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-xs font-semibold text-white bg-[#FA896B] hover:bg-[#e07559] px-4 py-2.5 rounded-xl transition-all"
            >
              Go to Student Portal <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-4">
              <Building className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-[#111C2D]">Tenant Subscriptions</h3>
            <p className="text-xs text-gray-500 mt-1 mb-4 leading-relaxed">
              Manage school onboarding, custom domain mapping (DNS CNAME), and subscription limits.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-[#111C2D]">Security & Audit Logs</h3>
            <p className="text-xs text-gray-500 mt-1 mb-4 leading-relaxed">
              Inspect cross-tenant login history, failed password attempts, and DPDP compliance records.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
              <Database className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-[#111C2D]">Database Isolation</h3>
            <p className="text-xs text-gray-500 mt-1 mb-4 leading-relaxed">
              Strict multi-tenant row-level partitioning with verified tenantId injection on all queries.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
