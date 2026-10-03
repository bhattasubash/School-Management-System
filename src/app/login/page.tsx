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
      className="relative min-h-screen w-full flex items-center justify-center bg-[#D6EEFE] select-none"
      style={{
        backgroundImage: "url('/login-reference-1536.png')",
        backgroundSize: '1536px 1024px',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundColor: '#D6EEFE',
      }}
    >
      {/* 1536x1024 Canvas Wrapper for Desktop Pixel Accuracy */}
      <div
        className="relative w-full max-w-[1536px] h-full min-h-screen lg:h-[1024px] flex items-center justify-center lg:block"
      >
        {/* Main Login Container - Fixed to 1406x842 at (68, 94) on Desktop */}
        <main
          className="relative lg:absolute w-full max-w-[1406px] h-auto lg:h-[842px] bg-white rounded-[28px] lg:rounded-[36px] overflow-hidden flex flex-col lg:flex-row border border-white/60 shadow-[0_20px_60px_-15px_rgba(15,45,95,0.14)]"
          style={{
            left: '68px',
            top: '94px',
            width: '1406px',
            height: '842px',
          }}
        >
          {/* ==================================================================== */}
          {/* LEFT COLUMN: BRANDING & SCHOOL ILLUSTRATION (780px / ~55.5%)         */}
          {/* ==================================================================== */}
          <section
            className="relative shrink-0 overflow-hidden"
            style={{
              width: '780px',
              height: '842px',
              backgroundImage: "url('/left-panel-raw.png')",
              backgroundSize: '780px 842px',
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
          {/* RIGHT COLUMN: LOGIN FORM PANEL (626px / ~44.5%)                      */}
          {/* ==================================================================== */}
          <section
            className="shrink-0 bg-white rounded-l-[36px] flex flex-col select-auto"
            style={{
              width: '626px',
              height: '842px',
              paddingTop: '166px',
              paddingLeft: '91px',
              paddingRight: '69px',
            }}
          >
            <div style={{ width: '466px' }}>
              {/* Header Titles */}
              <h1
                className="font-bold leading-none"
                style={{
                  fontSize: '40px',
                  color: '#000127',
                  letterSpacing: '-0.025em',
                }}
              >
                Welcome Back
              </h1>
              <p
                className="font-normal leading-tight"
                style={{
                  fontSize: '16px',
                  color: '#7F81A6',
                  marginTop: '11px',
                }}
              >
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
              <form onSubmit={handleSubmit} style={{ marginTop: '54px' }}>
                {/* Field 1: Roll Number / Admission ID */}
                <div>
                  <label
                    htmlFor="roll-number-input"
                    className="block font-semibold leading-none"
                    style={{
                      fontSize: '14px',
                      color: '#0A1344',
                      marginBottom: '11px',
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
                    className="w-full rounded-[14px] border border-[#E2E8F0] bg-white transition-all font-normal focus:border-[#008CFF] focus:outline-none focus:ring-2 focus:ring-[#008CFF]/20"
                    style={{
                      height: '60px',
                      paddingLeft: '28px',
                      paddingRight: '28px',
                      fontSize: '15px',
                      color: '#0A1344',
                    }}
                  />
                </div>

                {/* Field 2: Password */}
                <div style={{ marginTop: '34px' }}>
                  <label
                    htmlFor="password-input"
                    className="block font-semibold leading-none"
                    style={{
                      fontSize: '14px',
                      color: '#0A1344',
                      marginBottom: '11px',
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
                      className="w-full rounded-[14px] border border-[#E2E8F0] bg-white transition-all font-normal focus:border-[#008CFF] focus:outline-none focus:ring-2 focus:ring-[#008CFF]/20"
                      style={{
                        height: '60px',
                        paddingLeft: '28px',
                        paddingRight: '56px',
                        fontSize: '15px',
                        color: '#0A1344',
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute top-1/2 -translate-y-1/2 p-1 transition-colors hover:opacity-80"
                      style={{ right: '22px', color: '#8789AD' }}
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
                <div className="text-right" style={{ marginTop: '18px' }}>
                  <Link
                    href="/login/forgot-password"
                    className="font-medium hover:underline transition-colors"
                    style={{
                      fontSize: '14.5px',
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
                  className="w-full rounded-[14px] text-white font-semibold flex items-center justify-center gap-2.5 transition-all cursor-pointer disabled:opacity-60 hover:brightness-105 active:brightness-95"
                  style={{
                    height: '62px',
                    marginTop: '38px',
                    fontSize: '17px',
                    backgroundColor: '#0C8CFE',
                    boxShadow: '0 8px 22px rgba(12, 140, 254, 0.35)',
                  }}
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
