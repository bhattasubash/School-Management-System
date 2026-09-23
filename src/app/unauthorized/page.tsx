import Link from 'next/link';
import { ShieldAlert, ArrowLeft, LogIn } from 'lucide-react';

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen bg-[#F4F6F9] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-gray-100 p-8 text-center">
        <div className="w-16 h-16 rounded-full bg-red-50 text-red-500 mx-auto flex items-center justify-center mb-6">
          <ShieldAlert className="w-8 h-8" />
        </div>

        <h1 className="text-2xl font-bold text-[#111C2D] mb-2">Access Restricted</h1>
        <p className="text-sm text-gray-500 mb-6 leading-relaxed">
          Your current account role does not have authorization to view this module. If you believe this is an error, please contact your school administrator.
        </p>

        <div className="space-y-3">
          <Link
            href="/"
            className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#FA896B] hover:bg-[#e07559] text-white font-medium shadow-sm transition-all text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Return to Dashboard
          </Link>

          <Link
            href="/login"
            className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl border border-gray-200 hover:bg-gray-50 text-[#111C2D] font-medium transition-all text-sm"
          >
            <LogIn className="w-4 h-4" />
            Switch Account / Login
          </Link>
        </div>

        <p className="mt-6 text-xs text-gray-400">
          Error 403: Role-Based Access Control Violation
        </p>
      </div>
    </div>
  );
}
