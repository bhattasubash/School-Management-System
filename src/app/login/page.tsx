'use client';

import React, { useState, useTransition, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { loginAction } from '@/actions/auth';

function EyeIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function EyeOffIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
      <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
      <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
      <line x1="2" y1="2" x2="22" y2="22" />
    </svg>
  );
}

function LoaderIcon({ className = 'w-5 h-5 animate-spin' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  );
}

function AlertCircleIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  );
}

function LoginForm() {
  const searchParams = useSearchParams();
  const redirectParam = searchParams.get('redirect');

  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!userId.trim()) {
      setErrorMessage('Please enter your Roll Number / Admission ID.');
      return;
    }

    if (!password.trim()) {
      setErrorMessage('Please enter your password.');
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
    <div
      className="min-h-screen w-full flex items-center justify-center bg-[#D6EEFE] bg-cover bg-center bg-no-repeat p-4 sm:p-6 lg:p-0 select-none"
      style={{
        backgroundImage: "url('/login-reference-1536.png')",
        backgroundColor: '#D6EEFE',
      }}
    >
      {/* Centered Main Login Container */}
      <main
        className="w-full max-w-[1405px] h-auto lg:h-[841px] bg-white rounded-[28px] lg:rounded-[36px] overflow-hidden flex flex-col lg:flex-row border border-white/60 shadow-[0_20px_60px_-15px_rgba(15,45,95,0.14)]"
      >
        {/* ==================================================================== */}
        {/* LEFT COLUMN: BRANDING & SCHOOL ILLUSTRATION (780px / ~55.5%)         */}
        {/* ==================================================================== */}
        <section
          className="relative w-full lg:w-[780px] h-[360px] sm:h-[480px] lg:h-[841px] shrink-0 bg-cover bg-center overflow-hidden"
          style={{
            backgroundImage: "url('/left-panel-raw.png')",
          }}
          aria-label="Sunrise Public School Overview"
        >
          {/* Accessible Semantic Content (hidden visually to preserve pixel-exact artwork) */}
          <div className="sr-only">
            <h1>Sunrise Public School</h1>
            <p>Learn · Grow · Excel</p>
            <h2>Empowering Brighter Tomorrows</h2>
            <p>A simple, unified platform to manage students, classes, teachers and school operations.</p>
          </div>
        </section>

        {/* ==================================================================== */}
        {/* RIGHT COLUMN: LOGIN FORM PANEL (625px / ~44.5%)                      */}
        {/* ==================================================================== */}
        <section
          className="w-full lg:w-[625px] h-full shrink-0 bg-white lg:rounded-l-[36px] flex flex-col justify-center px-6 sm:px-12 lg:pl-[92px] lg:pr-[68px] py-10 lg:py-0 select-auto"
        >
          <div className="w-full max-w-[465px] mx-auto lg:mx-0">
            {/* Header Titles */}
            <h1 className="text-[28px] sm:text-[32px] font-bold text-[#0F172A] tracking-[-0.02em] leading-tight">
              Welcome Back
            </h1>
            <p className="text-[14px] sm:text-[15px] font-normal text-[#717694] mt-[8px] sm:mt-[10px]">
              Sign in to your Sunrise Public School account
            </p>

            {/* Error Message Display */}
            {errorMessage && (
              <div
                role="alert"
                className="mt-4 p-3 bg-red-50/90 border border-red-200 rounded-[12px] flex items-start gap-2.5 text-red-700 text-xs sm:text-sm animate-in fade-in"
              >
                <AlertCircleIcon className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="mt-[32px] sm:mt-[44px]">
              {/* Field 1: Roll Number / Admission ID */}
              <div>
                <label
                  htmlFor="roll-number-input"
                  className="block text-[13.5px] font-semibold text-[#0F172A] mb-[10px]"
                >
                  Roll Number / Admission ID
                </label>
                <input
                  id="roll-number-input"
                  type="text"
                  required
                  autoComplete="username"
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                  placeholder="Enter your roll number"
                  className="w-full h-[54px] sm:h-[58px] px-[24px] sm:px-[28px] rounded-[14px] border border-[#E2E8F0] bg-white text-[15px] font-normal text-[#0F172A] placeholder:text-[#94A3B8] focus:border-[#0C8CFE] focus:outline-none focus:ring-2 focus:ring-[#0C8CFE]/20 transition-all"
                />
              </div>

              {/* Field 2: Password */}
              <div className="mt-[24px] sm:mt-[26px]">
                <label
                  htmlFor="password-input"
                  className="block text-[13.5px] font-semibold text-[#0F172A] mb-[10px]"
                >
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password-input"
                    type={showPassword ? 'text' : 'password'}
                    required
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full h-[54px] sm:h-[58px] pl-[24px] sm:pl-[28px] pr-[54px] sm:pr-[58px] rounded-[14px] border border-[#E2E8F0] bg-white text-[15px] font-normal text-[#0F172A] placeholder:text-[#94A3B8] focus:border-[#0C8CFE] focus:outline-none focus:ring-2 focus:ring-[#0C8CFE]/20 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-[20px] sm:right-[24px] top-1/2 -translate-y-1/2 text-[#8C96A8] hover:text-[#475569] p-1 transition-colors"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? (
                      <EyeIcon className="w-5 h-5" />
                    ) : (
                      <EyeOffIcon className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Forgot Password Link */}
              <div className="text-right mt-[14px]">
                <Link
                  href="/login/forgot-password"
                  className="text-[14px] font-medium text-[#0C8CFE] hover:underline transition-colors"
                >
                  Forgot Password?
                </Link>
              </div>

              {/* Sign In Button */}
              <button
                type="submit"
                disabled={isPending}
                className="w-full h-[58px] sm:h-[62px] mt-[32px] sm:mt-[34px] rounded-[14px] bg-[#0C8CFE] hover:bg-[#007AE6] active:bg-[#006ED0] text-white font-semibold text-[16px] sm:text-[17px] flex items-center justify-center gap-2.5 shadow-[0_4px_14px_0_rgba(12,140,254,0.35)] hover:shadow-[0_6px_20px_0_rgba(12,140,254,0.45)] transition-all cursor-pointer disabled:opacity-60"
              >
                {isPending ? (
                  <>
                    <LoaderIcon className="w-5 h-5 animate-spin" />
                    <span>Signing in...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In</span>
                    <svg
                      className="w-[18px] h-[18px]"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <line x1="4" y1="12" x2="20" y2="12"></line>
                      <polyline points="13 5 20 12 13 19"></polyline>
                    </svg>
                  </>
                )}
              </button>
            </form>
          </div>
        </section>
      </main>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#D6EEFE] flex items-center justify-center">
          <LoaderIcon className="w-8 h-8 animate-spin text-[#0C8CFE]" />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
