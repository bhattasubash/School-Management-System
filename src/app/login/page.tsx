'use client';

import React, { useState, useTransition, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  User,
  Lock,
  Eye,
  EyeOff,
  ChevronDown,
  Mail,
  HelpCircle,
  BookOpen,
  Loader2,
  AlertCircle,
  GraduationCap,
  Users,
  Briefcase,
  Building2,
  Receipt,
  Globe,
  Award,
} from 'lucide-react';
import { loginAction } from '@/actions/auth';

const LOGIN_CONFIG = {
  institution: {
    name: 'Delhi Public School',
    subtitle: 'CBSE Affiliated • Estd. 1949',
    portalTitle: 'School Management System',
  },
  campuses: [
    { id: 'main', label: 'Main Campus' },
    { id: 'north', label: 'North Campus' },
    { id: 'headoffice', label: 'Head Office' },
  ],
  footerLinks: [
    { label: 'Student Mail', href: '#', icon: Mail },
    { label: 'Help Desk', href: '#', icon: HelpCircle },
    { label: 'LMS Portal', href: '#', icon: BookOpen },
  ],
  demoAccounts: [
    {
      role: 'Student',
      email: 'student@dps.edu.in',
      password: 'Student@123',
      icon: GraduationCap,
    },
    {
      role: 'Parent',
      email: 'parent@dps.edu.in',
      password: 'Parent@123',
      icon: Users,
    },
    {
      role: 'Teacher',
      email: 'teacher@dps.edu.in',
      password: 'Teacher@123',
      icon: Briefcase,
    },
    {
      role: 'Admin',
      email: 'admin@dps.edu.in',
      password: 'Admin@123',
      icon: Building2,
    },
    {
      role: 'Accountant',
      email: 'accountant@dps.edu.in',
      password: 'Accountant@123',
      icon: Receipt,
    },
    {
      role: 'Super Admin',
      email: 'superadmin@schoolerp.in',
      password: 'SuperAdmin@123',
      icon: Globe,
    },
  ],
};

function LoginForm() {
  const searchParams = useSearchParams();
  const redirectParam = searchParams.get('redirect');

  const [selectedCampus, setSelectedCampus] = useState(LOGIN_CONFIG.campuses[0].label);
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  // Demo switcher gated behind non-production or NEXT_PUBLIC_DEMO_MODE flag
  const isDemoAvailable =
    process.env.NODE_ENV !== 'production' || process.env.NEXT_PUBLIC_DEMO_MODE === 'true';

  const handleDemoSelect = (email: string, pass: string) => {
    setUserId(email);
    setPassword(pass);
    setErrorMessage(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!userId.trim() || !password.trim()) {
      setErrorMessage('Please enter your User ID and Password.');
      return;
    }

    startTransition(async () => {
      try {
        const result = await loginAction({
          email: userId.trim(),
          password: password.trim(),
        });

        if (result.success && result.redirectUrl) {
          const target = redirectParam || result.redirectUrl;
          window.location.href = target;
        } else {
          setErrorMessage(result.error || 'Authentication failed. Please verify credentials.');
        }
      } catch {
        setErrorMessage('A network error occurred. Please check your connectivity.');
      }
    });
  };

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-[#F8FAFC] text-[#0F172A] font-sans antialiased">
      {/* ==================================================================== */}
      {/* LEFT COLUMN: PHOTOGRAPHIC CAMPUS SHOWCASE (~38% ON DESKTOP)          */}
      {/* ==================================================================== */}
      <section className="relative w-full lg:w-[38%] min-h-[280px] lg:min-h-screen flex flex-col justify-between overflow-hidden bg-[#0F172A]">
        <img
          src="/campus-hero.jpg"
          alt="School Campus"
          className="absolute inset-0 w-full h-full object-cover object-center select-none"
        />

        {/* Ambient Dark Gradient for Contrast */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-slate-950/30 z-10 pointer-events-none" />

        {/* Top Header Identity */}
        <div className="relative z-20 p-6 sm:p-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#C2410C] flex items-center justify-center text-white shadow-xs font-black text-lg">
              D
            </div>
            <div>
              <h2 className="text-sm font-bold text-white tracking-tight">
                {LOGIN_CONFIG.institution.name}
              </h2>
              <p className="text-xs text-slate-300 font-medium">
                {LOGIN_CONFIG.institution.subtitle}
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Institutional Identity */}
        <div className="relative z-20 p-6 sm:p-8 text-white space-y-1.5">
          <h1 className="text-lg sm:text-xl font-bold tracking-tight">
            Academic & Administrative Portal
          </h1>
          <p className="text-xs text-slate-300 max-w-sm leading-relaxed">
            Centralized school management for students, parents, faculty, and administrative staff.
          </p>
        </div>
      </section>

      {/* ==================================================================== */}
      {/* RIGHT COLUMN: AUTHENTICATION FORM (~62% ON DESKTOP)                  */}
      {/* ==================================================================== */}
      <section className="w-full lg:w-[62%] min-h-[calc(100vh-280px)] lg:min-h-screen flex flex-col items-center justify-between p-6 sm:p-10 lg:p-12 overflow-y-auto">
        <div className="w-full max-w-[420px] my-auto space-y-6">
          {/* Card Container */}
          <div className="bg-white rounded-xl border border-slate-200 p-7 sm:p-8 shadow-xs">
            {/* Header: Title and Campus Selector */}
            <div className="flex items-center justify-between pb-5 border-b border-slate-100">
              <div>
                <h2 className="text-xl font-bold text-slate-900 tracking-tight">Sign in</h2>
                <p className="text-xs text-slate-500 mt-0.5">Enter your credentials to continue</p>
              </div>

              {/* Campus Selector */}
              <div className="relative">
                <select
                  value={selectedCampus}
                  onChange={(e) => setSelectedCampus(e.target.value)}
                  aria-label="Select campus"
                  className="bg-slate-50 hover:bg-slate-100 text-xs font-medium text-slate-700 py-1.5 pl-2.5 pr-7 rounded-lg appearance-none cursor-pointer border border-slate-200 focus:border-[#C2410C] focus:outline-none transition-colors"
                >
                  {LOGIN_CONFIG.campuses.map((c) => (
                    <option key={c.id} value={c.label}>
                      {c.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* Error Message */}
            {errorMessage && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2.5 text-red-700 text-xs">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Form Fields */}
            <form className="mt-5 space-y-4" onSubmit={handleSubmit}>
              {/* Field 1: User ID / Registration No */}
              <div>
                <label
                  htmlFor="user-id-input"
                  className="block text-xs font-semibold text-slate-700 mb-1.5"
                >
                  Registration No. / Email
                </label>
                <div className="relative">
                  <input
                    id="user-id-input"
                    type="email"
                    required
                    autoComplete="username email"
                    value={userId}
                    onChange={(e) => setUserId(e.target.value)}
                    placeholder="e.g. student@dps.edu.in"
                    className="w-full bg-white text-xs font-medium text-slate-900 placeholder:text-slate-400 py-2.5 pl-3.5 pr-10 rounded-lg border border-slate-300 focus:border-[#C2410C] focus:ring-1 focus:ring-[#C2410C] outline-none transition-colors"
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                    <User className="w-4 h-4" />
                  </div>
                </div>
              </div>

              {/* Field 2: Password */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label
                    htmlFor="password-input"
                    className="block text-xs font-semibold text-slate-700"
                  >
                    Password
                  </label>
                  <Link
                    href="/login/forgot-password"
                    className="text-xs font-medium text-[#C2410C] hover:underline"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <input
                    id="password-input"
                    type={showPassword ? 'text' : 'password'}
                    required
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full bg-white text-xs font-medium text-slate-900 placeholder:text-slate-400 py-2.5 pl-3.5 pr-10 rounded-lg border border-slate-300 focus:border-[#C2410C] focus:ring-1 focus:ring-[#C2410C] outline-none transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-1"
                    aria-label="Toggle password visibility"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Primary Action Button in Brand Orange #C2410C */}
              <button
                type="submit"
                disabled={isPending}
                className="w-full bg-[#C2410C] hover:bg-[#9A3412] active:scale-[0.99] text-white font-semibold py-2.5 px-4 rounded-lg shadow-xs transition-colors text-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
              >
                {isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Signing in...</span>
                  </>
                ) : (
                  'Sign in'
                )}
              </button>
            </form>

            {/* Environment-Gated Demo Account Switcher */}
            {isDemoAvailable && (
              <details className="group mt-6 pt-4 border-t border-slate-200">
                <summary className="text-xs font-semibold text-slate-500 cursor-pointer hover:text-slate-800 flex items-center justify-between select-none">
                  <span>Demo Evaluation Accounts</span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-open:rotate-180 transition-transform" />
                </summary>

                <div className="mt-3 grid grid-cols-3 gap-1.5 pt-1">
                  {LOGIN_CONFIG.demoAccounts.map((account) => {
                    const Icon = account.icon;
                    const isSelected = userId === account.email;
                    return (
                      <button
                        key={account.role}
                        type="button"
                        onClick={() => handleDemoSelect(account.email, account.password)}
                        className={`p-2 rounded-lg text-left border text-xs transition-colors flex flex-col gap-1 ${
                          isSelected
                            ? 'border-[#C2410C] bg-[#FFEDD5] text-[#C2410C] font-semibold'
                            : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-1.5">
                          <Icon className="w-3.5 h-3.5 shrink-0" />
                          <span className="truncate">{account.role}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </details>
            )}
          </div>
        </div>

        {/* Footer Links */}
        <footer className="w-full max-w-[420px] flex items-center justify-center gap-6 py-4 text-xs font-medium text-slate-500">
          {LOGIN_CONFIG.footerLinks.map((link) => {
            const Icon = link.icon;
            return (
              <a
                key={link.label}
                href={link.href}
                className="flex items-center gap-1.5 hover:text-slate-800 transition-colors"
              >
                <Icon className="w-3.5 h-3.5 text-slate-400" />
                <span>{link.label}</span>
              </a>
            );
          })}
        </footer>
      </section>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-[#C2410C]" />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
