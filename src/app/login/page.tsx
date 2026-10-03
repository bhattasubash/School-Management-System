'use client';

import React, { useState, useTransition, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { loginAction } from '@/actions/auth';

function EyeIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function EyeOffIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
      <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
      <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
      <line x1="2" y1="2" x2="22" y2="22" />
    </svg>
  );
}

function LoaderIcon({ className = 'w-4 h-4 animate-spin' }: { className?: string }) {
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
      className="fixed inset-0 h-screen w-screen overflow-hidden flex items-center justify-center select-none bg-[#CBE9FE]"
      style={{
        backgroundImage: "url('/bg-atmosphere.svg')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      {/* Scaled Login Container (~25% more compact, fits effortlessly with zero scrolling) */}
      <main
        className="relative bg-white rounded-[26px] overflow-hidden flex flex-row border border-white/70 shadow-[0_20px_50px_-10px_rgba(15,45,95,0.16)] shrink-0"
        style={{
          width: '1055px',
          height: '632px',
        }}
      >
        {/* ==================================================================== */}
        {/* LEFT COLUMN: BRANDING & SCHOOL ILLUSTRATION (588px / ~55.7%)         */}
        {/* ==================================================================== */}
        <section
          className="relative shrink-0 overflow-hidden"
          style={{
            width: '588px',
            height: '632px',
            backgroundImage: "url('/left-panel-raw.png')",
            backgroundSize: '588px 632px',
            backgroundPosition: '0 0',
            backgroundRepeat: 'no-repeat',
          }}
          aria-label="Sunrise Public School Overview"
        >
          {/* Accessible Semantic Content */}
          <div className="sr-only">
            <h1>Sunrise Public School</h1>
            <p>Learn · Grow · Excel</p>
            <h2>Empowering Brighter Tomorrows</h2>
            <p>A simple, unified platform to manage students, classes, teachers and school operations.</p>
          </div>
        </section>

        {/* ==================================================================== */}
        {/* RIGHT COLUMN: LOGIN FORM PANEL (467px / ~44.3%)                      */}
        {/* ==================================================================== */}
        <section
          className="shrink-0 bg-white rounded-l-[28px] flex flex-col select-auto"
          style={{
            width: '467px',
            height: '632px',
            paddingTop: '124px',
            paddingLeft: '68px',
            paddingRight: '50px',
          }}
        >
          <div style={{ width: '349px' }}>
            {/* Header Titles */}
            <h1
              className="font-bold leading-none"
              style={{
                fontSize: '30px',
                color: '#000127',
                letterSpacing: '-0.025em',
              }}
            >
              Welcome Back
            </h1>
            <p
              className="font-normal leading-tight"
              style={{
                fontSize: '13.5px',
                color: '#7F81A6',
                marginTop: '8px',
              }}
            >
              Sign in to your Sunrise Public School account
            </p>

            {/* Error Message Display */}
            {errorMessage && (
              <div
                role="alert"
                className="mt-3 p-2.5 bg-red-50/90 border border-red-200 rounded-[10px] flex items-start gap-2 text-red-700 text-xs animate-in fade-in"
              >
                <AlertCircleIcon className="w-3.5 h-3.5 text-red-600 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleSubmit} style={{ marginTop: '38px' }}>
              {/* Field 1: Roll Number / Admission ID */}
              <div>
                <label
                  htmlFor="roll-number-input"
                  className="block font-semibold leading-none"
                  style={{
                    fontSize: '12.5px',
                    color: '#0A1344',
                    marginBottom: '8px',
                  }}
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
                  className="w-full rounded-[11px] border border-[#E2E8F0] bg-white transition-all font-normal focus:border-[#008CFF] focus:outline-none focus:ring-2 focus:ring-[#008CFF]/20"
                  style={{
                    height: '47px',
                    paddingLeft: '20px',
                    paddingRight: '20px',
                    fontSize: '13.5px',
                    color: '#0A1344',
                  }}
                />
              </div>

              {/* Field 2: Password */}
              <div style={{ marginTop: '22px' }}>
                <label
                  htmlFor="password-input"
                  className="block font-semibold leading-none"
                  style={{
                    fontSize: '12.5px',
                    color: '#0A1344',
                    marginBottom: '8px',
                  }}
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
                    className="w-full rounded-[11px] border border-[#E2E8F0] bg-white transition-all font-normal focus:border-[#008CFF] focus:outline-none focus:ring-2 focus:ring-[#008CFF]/20"
                    style={{
                      height: '47px',
                      paddingLeft: '20px',
                      paddingRight: '44px',
                      fontSize: '13.5px',
                      color: '#0A1344',
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute top-1/2 -translate-y-1/2 p-1 transition-colors hover:opacity-80"
                    style={{ right: '14px', color: '#8789AD' }}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? (
                      <EyeIcon className="w-4 h-4" />
                    ) : (
                      <EyeOffIcon className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Forgot Password Link */}
              <div className="text-right" style={{ marginTop: '13px' }}>
                <Link
                  href="/login/forgot-password"
                  className="font-medium hover:underline transition-colors"
                  style={{
                    fontSize: '12.5px',
                    color: '#0080FE',
                  }}
                >
                  Forgot Password?
                </Link>
              </div>

              {/* Sign In Button */}
              <button
                type="submit"
                disabled={isPending}
                className="w-full rounded-[11px] text-white font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-60 hover:brightness-105 active:brightness-95"
                style={{
                  height: '48px',
                  marginTop: '26px',
                  fontSize: '14.5px',
                  backgroundColor: '#0C8CFE',
                  boxShadow: '0 6px 18px rgba(12, 140, 254, 0.35)',
                }}
              >
                {isPending ? (
                  <>
                    <LoaderIcon className="w-4 h-4 animate-spin" />
                    <span>Signing in...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In</span>
                    <svg
                      className="w-[15px] h-[15px]"
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
        <div className="fixed inset-0 h-screen w-screen bg-[#CBE9FE] flex items-center justify-center">
          <LoaderIcon className="w-8 h-8 animate-spin text-[#0C8CFE]" />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
