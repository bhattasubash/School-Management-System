'use client';

import React, { useState, useTransition, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Lock,
  Mail,
  Eye,
  EyeOff,
  Loader2,
  ShieldCheck,
  AlertCircle,
  GraduationCap,
  Users,
  Briefcase,
  Building2,
  Receipt,
  Globe,
} from 'lucide-react';
import { loginAction } from '@/actions/auth';

const DEMO_ACCOUNTS = [
  {
    role: 'Student',
    email: 'student@dps.edu.in',
    password: 'Student@123',
    icon: GraduationCap,
    note: 'Unified Student/Parent Dashboard',
  },
  {
    role: 'Parent',
    email: 'parent@dps.edu.in',
    password: 'Parent@123',
    icon: Users,
    note: 'Unified Student/Parent Dashboard',
  },
  {
    role: 'Teacher',
    email: 'teacher@dps.edu.in',
    password: 'Teacher@123',
    icon: Briefcase,
    note: 'Teacher Portal & Attendance',
  },
  {
    role: 'School Admin',
    email: 'admin@dps.edu.in',
    password: 'Admin@123',
    icon: Building2,
    note: 'Academic & ERP Administration',
  },
  {
    role: 'Accountant',
    email: 'accountant@dps.edu.in',
    password: 'Accountant@123',
    icon: Receipt,
    note: 'Fee Collection & Ledgers',
  },
  {
    role: 'Super Admin',
    email: 'superadmin@schoolerp.in',
    password: 'SuperAdmin@123',
    icon: Globe,
    note: 'SaaS Platform Management',
  },
];

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectParam = searchParams.get('redirect');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleDemoSelect = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setErrorMessage(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!email.trim() || !password.trim()) {
      setErrorMessage('Please enter both email and password.');
      return;
    }

    startTransition(async () => {
      try {
        const result = await loginAction({
          email: email.trim(),
          password: password.trim(),
        });

        if (result.success && result.redirectUrl) {
          // If a redirect URL parameter was originally requested, prioritize it if authorized
          const target = redirectParam || result.redirectUrl;
          window.location.href = target;
        } else {
          setErrorMessage(result.error || 'Authentication failed. Please verify credentials.');
        }
      } catch (err) {
        setErrorMessage('A network error occurred. Please try again.');
      }
    });
  };

  return (
    <div className="min-h-screen bg-[#F4F6F9] flex flex-col justify-center py-10 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        {/* School Logo & Title */}
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#111C2D] text-white shadow-lg mb-4">
          <ShieldCheck className="w-8 h-8 text-[#FA896B]" />
        </div>
        <h2 className="text-2xl font-extrabold text-[#111C2D] tracking-tight">
          Delhi Public School
        </h2>
        <p className="mt-1 text-sm text-gray-500 font-medium">
          Multi-Tenant ERP Portal • Secure Authentication
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-white py-8 px-6 shadow-xl rounded-2xl sm:px-10 border border-gray-100">
          {/* Error Banner */}
          {errorMessage && (
            <div className="mb-5 p-3.5 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2.5 text-red-700 text-xs sm:text-sm animate-fade-in">
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form className="space-y-5" onSubmit={handleSubmit}>
            {/* Email Field */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1.5">
                Email Address
              </label>
              <div className="relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <Mail className="h-4 w-4" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@school.edu.in"
                  className="block w-full pl-10 pr-3 py-2.5 sm:text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#FA896B] focus:border-transparent text-[#111C2D] placeholder-gray-400 transition-all outline-none"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => alert('Please contact the school administrative desk to reset your credentials.')}
                  className="text-xs font-medium text-[#FA896B] hover:text-[#e07559] transition-colors"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="block w-full pl-10 pr-10 py-2.5 sm:text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#FA896B] focus:border-transparent text-[#111C2D] placeholder-gray-400 transition-all outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <div>
              <button
                type="submit"
                disabled={isPending}
                className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-xl shadow-md text-sm font-semibold text-white bg-[#FA896B] hover:bg-[#e07559] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#FA896B] disabled:opacity-60 transition-all cursor-pointer"
              >
                {isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Authenticating...
                  </>
                ) : (
                  'Sign In to ERP'
                )}
              </button>
            </div>
          </form>

          {/* Quick-Switch Demo Section */}
          <div className="mt-8 border-t border-gray-100 pt-6">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
                Demo Quick Access
              </span>
              <span className="text-[10px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full font-medium border border-emerald-200">
                1-Click Populate
              </span>
            </div>
            <p className="text-[11px] text-gray-400 mb-3">
              Select any role below to test role-based access. Note that Students and Parents share the unified student portal.
            </p>

            <div className="grid grid-cols-2 gap-2">
              {DEMO_ACCOUNTS.map((account) => {
                const Icon = account.icon;
                const isSelected = email === account.email;
                return (
                  <button
                    key={account.role}
                    type="button"
                    onClick={() => handleDemoSelect(account.email, account.password)}
                    className={`flex items-center gap-2 p-2.5 text-left rounded-xl border text-xs transition-all ${
                      isSelected
                        ? 'border-[#FA896B] bg-[#FFF2EE] text-[#FA896B] font-semibold'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-700'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">{account.role}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer Notice */}
        <p className="mt-6 text-center text-xs text-gray-400">
          Admin-provisioned credentials only • Protected by Ponytail Protocol Zero-Trust Isolation
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#F4F6F9] flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-[#FA896B]" />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
