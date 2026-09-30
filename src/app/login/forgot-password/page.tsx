'use client';

import React, { useState, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Mail, KeyRound, ArrowLeft, CheckCircle2, AlertCircle, Loader2, ShieldAlert } from 'lucide-react';
import { forgotPasswordAction, verifyOtpAndResetAction } from '@/actions/auth';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState<'REQUEST' | 'VERIFY' | 'SUCCESS'>('REQUEST');

  // Form State
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Status State
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  // Step 1: Request OTP
  const handleRequestOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    startTransition(async () => {
      const res = await forgotPasswordAction({ email });
      if (!res.success && res.error) {
        setErrorMsg(res.error);
      } else {
        setSuccessMsg(res.message);
        setStep('VERIFY');
      }
    });
  };

  // Step 2: Verify OTP and Reset
  const handleResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (newPassword !== confirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }

    startTransition(async () => {
      const res = await verifyOtpAndResetAction({
        email,
        otp,
        newPassword,
        confirmPassword,
      });

      if (!res.success) {
        setErrorMsg(res.error || 'Failed to reset password. Please check your code.');
      } else {
        setSuccessMsg(res.message || 'Password reset successful!');
        setStep('SUCCESS');
      }
    });
  };

  return (
    <div className="min-h-screen bg-brand-subtle flex flex-col justify-center items-center p-4 sm:p-8">
      <div className="w-full max-w-md">
        {/* Header / Brand */}
        <div className="text-center mb-6">
          <div className="inline-flex w-12 h-12 rounded-xl bg-brand-primary text-white items-center justify-center font-bold text-xl shadow-md mb-3">
            S
          </div>
          <h1 className="text-display text-brand-dark">Account Recovery</h1>
          <p className="text-body-primary text-brand-muted mt-1">
            {step === 'REQUEST' && 'Enter your institutional email to receive a verification code.'}
            {step === 'VERIFY' && 'Enter the 6-digit verification code and set your new password.'}
            {step === 'SUCCESS' && 'Your password has been securely updated.'}
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-xl border border-brand-border p-6 sm:p-8 shadow-card">
          {errorMsg && (
            <div className="mb-5 p-3.5 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2.5 text-red-700 text-caption font-medium">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && step !== 'SUCCESS' && (
            <div className="mb-5 p-3.5 bg-emerald-50 border border-emerald-200 rounded-lg flex items-start gap-2.5 text-emerald-800 text-caption font-medium">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* STEP 1: REQUEST OTP */}
          {step === 'REQUEST' && (
            <form onSubmit={handleRequestOtp} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-caption font-semibold text-brand-dark mb-1.5">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. user@school.edu.in"
                    className="w-full bg-white text-body-primary py-2.5 pl-3.5 pr-10 rounded-lg border border-brand-border focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 outline-none transition-all"
                  />
                  <Mail className="w-4 h-4 text-brand-muted absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              <button
                type="submit"
                disabled={isPending}
                className="w-full mt-2 py-2.5 px-4 bg-brand-primary text-white rounded-lg text-body-primary font-semibold hover:bg-brand-hover focus:ring-2 focus:ring-brand-primary/30 transition-all flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                Send Verification Code
              </button>
            </form>
          )}

          {/* STEP 2: VERIFY OTP & SET PASSWORD */}
          {step === 'VERIFY' && (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div>
                <label htmlFor="otp" className="block text-caption font-semibold text-brand-dark mb-1.5">
                  6-Digit Verification Code <span className="text-red-500">*</span>
                </label>
                <input
                  id="otp"
                  type="text"
                  required
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  placeholder="123456"
                  className="w-full bg-white text-center tracking-widest text-lg font-bold py-2.5 px-3 rounded-lg border border-brand-border focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 outline-none transition-all"
                />
              </div>

              <div>
                <label htmlFor="newPassword" className="block text-caption font-semibold text-brand-dark mb-1.5">
                  New Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    id="newPassword"
                    type="password"
                    required
                    minLength={8}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Min. 8 chars (uppercase, number, symbol)"
                    className="w-full bg-white text-body-primary py-2.5 pl-3.5 pr-10 rounded-lg border border-brand-border focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 outline-none transition-all"
                  />
                  <KeyRound className="w-4 h-4 text-brand-muted absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-caption font-semibold text-brand-dark mb-1.5">
                  Confirm New Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    id="confirmPassword"
                    type="password"
                    required
                    minLength={8}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter your new password"
                    className="w-full bg-white text-body-primary py-2.5 pl-3.5 pr-10 rounded-lg border border-brand-border focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 outline-none transition-all"
                  />
                  <KeyRound className="w-4 h-4 text-brand-muted absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setStep('REQUEST')}
                  className="w-1/3 py-2.5 px-3 rounded-lg border border-brand-border text-body-primary text-brand-dark font-medium hover:bg-brand-subtle transition-colors"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="w-2/3 py-2.5 px-4 bg-brand-primary text-white rounded-lg text-body-primary font-semibold hover:bg-brand-hover focus:ring-2 focus:ring-brand-primary/30 transition-all flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                  Reset Password
                </button>
              </div>
            </form>
          )}

          {/* STEP 3: SUCCESS */}
          {step === 'SUCCESS' && (
            <div className="text-center py-4 space-y-4">
              <div className="w-14 h-14 bg-emerald-100 rounded-full flex items-center justify-center mx-auto text-emerald-600">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h2 className="text-section-header text-brand-dark">Password Updated</h2>
              <p className="text-body-primary text-brand-muted">
                You can now log in using your newly configured credentials.
              </p>
              <Link
                href="/login"
                className="inline-flex w-full py-2.5 px-4 bg-brand-primary text-white rounded-lg text-body-primary font-semibold hover:bg-brand-hover justify-center transition-colors mt-2"
              >
                Return to Sign In
              </Link>
            </div>
          )}
        </div>

        {/* Back to Login Link */}
        {step !== 'SUCCESS' && (
          <div className="text-center mt-6">
            <Link
              href="/login"
              className="inline-flex items-center gap-2 text-caption font-semibold text-brand-primary hover:underline"
            >
              <ArrowLeft className="w-4 h-4" />
              Return to Sign In
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
