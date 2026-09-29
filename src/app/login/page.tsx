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
  Check,
  Cloud,
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
  Sparkles,
} from 'lucide-react';
import { loginAction } from '@/actions/auth';

// ============================================================================
// 1. CENTRALIZED CUSTOM CONTENT CONFIGURATION (EASILY EDITABLE)
// ============================================================================
const LOGIN_PAGE_CONFIG = {
  // Institutional Branding
  institution: {
    name: 'DELHI PUBLIC SCHOOL',
    affiliation: 'CBSE AFFILIATED • ESTD. 1949',
    portalTitle: 'SCHOOL MANAGEMENT SYSTEM',
    portalAcronym: 'SMS',
    logoAccentChar: 'D',
    logoRemainingChars: 'PS',
  },

  // Left Column Hero & Showcase Content
  heroShowcase: {
    campusImage: '/campus-hero.jpg',
    bannerHeadline: 'DPS Sets New Global Benchmarks',
    bannerSubheadline: 'In Holistic K-12 Education & CBSE Excellence 2026',
    accreditationBadge: {
      provider: 'Education World & CBSE Honours',
      ratingText: 'Excellence & Sustainability',
      yearText: 'Ratings 2026',
    },
    ranking: {
      preTitle: 'RANKS DPS',
      primaryRank: '1',
      primarySuffix: 'st',
      primaryScope: 'IN NORTH INDIA',
      scopeAudience: 'Amongst Both Government, Private & International Schools',
      globalRankText: '23rd GLOBALLY',
    },
    footnoteText:
      'Ahead of leading national institutions in STEM innovation, state-of-the-art sports facilities, and holistic student leadership development | CBSE Affiliation No. 2730017 | Delhi Public School Society',
  },

  // Dropdown Selectors
  offices: [
    { id: 'main-campus', label: 'Main Campus' },
    { id: 'student-portal', label: 'Student Portal' },
    { id: 'parent-portal', label: 'Parent Portal' },
    { id: 'head-office', label: 'HeadOffice' },
    { id: 'staff-portal', label: 'Staff Portal' },
    { id: 'fee-desk', label: 'Accounts & Fees' },
  ],

  targetViews: [
    { id: 'dashboard', label: 'Primary Dashboard' },
    { id: 'academics', label: 'Academics & Exams' },
    { id: 'fees', label: 'Fee Collection Desk' },
  ],

  // Footer Quick Utility Links
  footerLinks: [
    { label: 'Student Mail', href: '#', icon: Mail },
    { label: 'Help Desk', href: '#', icon: HelpCircle },
    { label: 'LMS Portal', href: '#', icon: BookOpen },
  ],

  // Quick Demo Access Accounts (for testing & reviewers)
  demoAccounts: [
    {
      role: 'Student',
      email: 'student@dps.edu.in',
      password: 'Student@123',
      icon: GraduationCap,
      badge: 'Unified Portal',
    },
    {
      role: 'Parent',
      email: 'parent@dps.edu.in',
      password: 'Parent@123',
      icon: Users,
      badge: 'Unified Portal',
    },
    {
      role: 'Teacher',
      email: 'teacher@dps.edu.in',
      password: 'Teacher@123',
      icon: Briefcase,
      badge: 'Faculty',
    },
    {
      role: 'Admin',
      email: 'admin@dps.edu.in',
      password: 'Admin@123',
      icon: Building2,
      badge: 'ERP Admin',
    },
    {
      role: 'Accountant',
      email: 'accountant@dps.edu.in',
      password: 'Accountant@123',
      icon: Receipt,
      badge: 'Fee Desk',
    },
    {
      role: 'Super Admin',
      email: 'superadmin@schoolerp.in',
      password: 'SuperAdmin@123',
      icon: Globe,
      badge: 'Platform',
    },
  ],
};

// ============================================================================
// 2. INNER LOGIN FORM COMPONENT
// ============================================================================
function LoginForm() {
  const searchParams = useSearchParams();
  const redirectParam = searchParams.get('redirect');

  const [selectedOffice, setSelectedOffice] = useState(LOGIN_PAGE_CONFIG.offices[3].label); // default HeadOffice
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [captchaVerified, setCaptchaVerified] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleDemoSelect = (email: string, pass: string) => {
    setUserId(email);
    setPassword(pass);
    setErrorMessage(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!userId.trim() || !password.trim()) {
      setErrorMessage('Please enter your Registration No. / Email and Password.');
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
        setErrorMessage('A network error occurred. Please check connectivity.');
      }
    });
  };

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-[#F8F9FA] text-[#111C2D] font-sans antialiased overflow-x-hidden">
      {/* ==================================================================== */}
      {/* LEFT COLUMN: VISUAL HERO & SHOWCASE BANNER (50% ON DESKTOP)          */}
      {/* ==================================================================== */}
      <section className="relative w-full lg:w-1/2 min-h-[480px] lg:min-h-screen flex flex-col justify-between overflow-hidden bg-[#111C2D]">
        {/* Background Image: Prestigious Campus Architecture at Sunset */}
        <img
          src={LOGIN_PAGE_CONFIG.heroShowcase.campusImage}
          alt="Campus Clock Tower Architecture"
          className="absolute inset-0 w-full h-full object-cover object-center select-none"
        />

        {/* Ambient Dark Gradient Vignette for Text Legibility */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-black/25 z-10 pointer-events-none" />

        {/* Top-Right Carousel Dots */}
        <div className="absolute top-6 right-6 z-20 flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#F37021] shadow-xs" />
          <span className="w-2.5 h-2.5 rounded-full bg-white/40" />
        </div>

        {/* The Signature Angular Orange Showcase Banner (Matching Reference Image) */}
        <div className="relative z-20 pt-8 sm:pt-12 px-6 sm:px-10 lg:px-12 max-w-xl">
          <div
            className="bg-gradient-to-br from-[#F37021] to-[#E05D0E] text-white p-6 sm:p-8 shadow-2xl relative rounded-tr-3xl"
            style={{
              clipPath: 'polygon(0 0, 100% 0, 84% 100%, 0 100%)',
            }}
          >
            {/* Header / Benchmark Statement */}
            <h1 className="text-xl sm:text-2xl lg:text-[26px] font-black leading-tight tracking-tight drop-shadow-xs">
              {LOGIN_PAGE_CONFIG.heroShowcase.bannerHeadline}
            </h1>
            <p className="text-xs sm:text-sm font-semibold text-white/95 mt-1 leading-snug">
              {LOGIN_PAGE_CONFIG.heroShowcase.bannerSubheadline}
            </p>

            {/* Accreditation Badge Box */}
            <div className="bg-white rounded-lg p-2.5 mt-5 inline-flex items-center gap-3 shadow-md max-w-xs text-slate-900">
              <div className="w-9 h-9 rounded-md bg-gradient-to-br from-amber-500 via-rose-500 to-indigo-600 flex items-center justify-center text-white shrink-0 shadow-xs">
                <Sparkles className="w-5 h-5" />
              </div>
              <div className="text-left leading-tight">
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  {LOGIN_PAGE_CONFIG.heroShowcase.accreditationBadge.provider}
                </div>
                <div className="text-xs font-black text-slate-900 tracking-tight">
                  {LOGIN_PAGE_CONFIG.heroShowcase.accreditationBadge.ratingText}
                </div>
                <div className="text-[11px] font-extrabold text-[#F37021]">
                  {LOGIN_PAGE_CONFIG.heroShowcase.accreditationBadge.yearText}
                </div>
              </div>
            </div>

            {/* Giant Ranking Typography */}
            <div className="mt-8 space-y-0.5">
              <span className="text-xs sm:text-sm font-black tracking-widest uppercase text-white/90 block">
                {LOGIN_PAGE_CONFIG.heroShowcase.ranking.preTitle}
              </span>

              {/* Number 1 with 'st' Superscript */}
              <div className="flex items-start text-white leading-none">
                <span className="text-7xl sm:text-8xl lg:text-9xl font-black tracking-tighter">
                  {LOGIN_PAGE_CONFIG.heroShowcase.ranking.primaryRank}
                </span>
                <span className="text-2xl sm:text-3xl font-black ml-1.5 mt-3 sm:mt-4">
                  {LOGIN_PAGE_CONFIG.heroShowcase.ranking.primarySuffix}
                </span>
              </div>

              {/* Scope & Secondary Ranks */}
              <div className="text-xl sm:text-2xl lg:text-[26px] font-black uppercase text-white tracking-wide">
                {LOGIN_PAGE_CONFIG.heroShowcase.ranking.primaryScope}
              </div>
              <p className="text-[11px] sm:text-xs font-medium text-white/90 max-w-[320px] leading-tight pt-1">
                {LOGIN_PAGE_CONFIG.heroShowcase.ranking.scopeAudience}
              </p>

              <div className="pt-4">
                <span className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  {LOGIN_PAGE_CONFIG.heroShowcase.ranking.globalRankText}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Footnote / Global Comparison Bar */}
        <div className="relative z-20 bg-black/75 backdrop-blur-md p-4 sm:p-5 text-[10px] sm:text-[11px] text-white/80 leading-relaxed border-t border-white/10 mt-8">
          <p className="max-w-2xl">{LOGIN_PAGE_CONFIG.heroShowcase.footnoteText}</p>
        </div>

        {/* Center Vertical Separator Button on Desktop */}
        <div
          className="hidden lg:flex absolute bottom-4 -right-3 z-30 w-6 h-2 bg-black/60 rounded-full cursor-pointer hover:bg-black/90 transition-all items-center justify-center"
          title="Toggle view"
        >
          <div className="w-3 h-0.5 bg-white/70 rounded-full" />
        </div>
      </section>

      {/* ==================================================================== */}
      {/* RIGHT COLUMN: AUTHENTICATION PORTAL (50% ON DESKTOP)                 */}
      {/* ==================================================================== */}
      <section className="w-full lg:w-1/2 min-h-screen bg-[#FAF7F5] flex flex-col items-center justify-between p-6 sm:p-10 lg:p-12 relative overflow-y-auto">
        {/* Top Header: Circular Emblem + UMS/SMS Style Wordmark */}
        <div className="w-full max-w-[460px] flex items-center justify-center gap-3.5 pt-4 pb-6">
          {/* Circular School Crest */}
          <div className="w-14 h-14 rounded-full bg-white border-2 border-slate-300 p-1 flex items-center justify-center shadow-sm shrink-0">
            <div className="w-full h-full rounded-full border border-dashed border-[#F37021] flex items-center justify-center bg-gradient-to-br from-amber-50 to-orange-100 text-[#111C2D]">
              <Award className="w-6 h-6 text-[#F37021]" />
            </div>
          </div>

          {/* Stylized Institution Wordmark */}
          <div className="flex flex-col text-left">
            <div className="flex items-center gap-1 leading-none">
              {/* Graduation Cap Geometric Symbol */}
              <div className="w-6 h-6 bg-[#111C2D] rounded-md flex items-center justify-center text-white mr-0.5">
                <GraduationCap className="w-4 h-4 text-[#F37021]" />
              </div>
              <span className="text-[#F37021] font-black text-2xl sm:text-3xl tracking-tight">
                {LOGIN_PAGE_CONFIG.institution.logoAccentChar}
              </span>
              <span className="text-[#111C2D] font-black text-2xl sm:text-3xl tracking-tight">
                {LOGIN_PAGE_CONFIG.institution.logoRemainingChars}
              </span>
            </div>
            <span className="text-[9px] sm:text-[10px] tracking-[0.24em] font-extrabold text-[#64748B] uppercase mt-1">
              {LOGIN_PAGE_CONFIG.institution.portalTitle}
            </span>
          </div>
        </div>

        {/* Main Clean White Login Card */}
        <div className="w-full max-w-[460px] bg-white rounded-2xl shadow-[0_15px_45px_rgba(0,0,0,0.06)] border border-[#EBECEF] p-8 sm:p-10 my-auto">
          {/* Card Top Row: 'Log in' + Role/Office Selector Pill */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-black text-[#111C2D] tracking-tight">Log in</h2>

            {/* Office / Portal Dropdown Selector */}
            <div className="relative">
              <select
                value={selectedOffice}
                onChange={(e) => setSelectedOffice(e.target.value)}
                aria-label="Select portal office"
                className="bg-[#F0F2F5] hover:bg-[#E5E8ED] text-xs font-semibold text-[#111C2D] py-2 pl-3.5 pr-8 rounded-xl appearance-none cursor-pointer border border-transparent focus:border-slate-300 focus:outline-none transition-all"
              >
                {LOGIN_PAGE_CONFIG.offices.map((office) => (
                  <option key={office.id} value={office.label}>
                    {office.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-500 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* Error Message Display */}
          {errorMessage && (
            <div className="mb-5 p-3.5 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2.5 text-red-700 text-xs sm:text-sm animate-fade-in">
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Form */}
          <form className="space-y-4" onSubmit={handleSubmit}>
            {/* Field 1: User ID / Registration Number */}
            <div className="relative rounded-xl">
              <input
                type="email"
                required
                autoComplete="username email"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                placeholder="Registration No. / User ID"
                className="w-full bg-[#EBF2F9] focus:bg-white text-sm font-medium text-[#111C2D] placeholder:text-slate-400 py-3.5 pl-4 pr-11 rounded-xl border border-transparent focus:border-[#F37021] focus:ring-2 focus:ring-[#F37021]/20 outline-none transition-all"
              />
              <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                <User className="w-4 h-4" />
              </div>
            </div>

            {/* Field 2: Password with Mask & Visibility Toggle */}
            <div className="relative rounded-xl">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full bg-[#EBF2F9] focus:bg-white text-sm font-medium text-[#111C2D] placeholder:text-slate-400 py-3.5 pl-4 pr-11 rounded-xl border border-transparent focus:border-[#F37021] focus:ring-2 focus:ring-[#F37021]/20 outline-none transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700 transition-colors p-1"
                aria-label="Toggle password visibility"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {/* Field 3: Cloudflare Turnstile / CAPTCHA Container (Pixel-Perfect Reference Match) */}
            <div className="bg-white border border-slate-200 rounded-xl p-3 flex items-center justify-between shadow-2xs">
              <div className="flex items-center gap-2.5">
                <div className="w-6 h-6 rounded-full bg-emerald-600 flex items-center justify-center text-white">
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                </div>
                <span className="text-xs font-semibold text-slate-700">Success!</span>
              </div>
              <div className="flex flex-col items-end leading-none">
                <div className="flex items-center gap-1">
                  <Cloud className="w-3.5 h-3.5 text-[#F37021] fill-[#F37021]" />
                  <span className="text-[10px] font-black tracking-wider text-slate-800">
                    CLOUDFLARE
                  </span>
                </div>
                <span className="text-[8.5px] text-slate-400 mt-0.5">Privacy • Help</span>
              </div>
            </div>

            {/* Field 4: Primary Action Button in Brand Orange */}
            <button
              type="submit"
              disabled={isPending}
              className="w-full bg-[#F37021] hover:bg-[#E05D0E] active:scale-[0.99] text-white font-bold py-3.5 px-6 rounded-xl shadow-md transition-all text-sm sm:text-base tracking-wide flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
            >
              {isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Authenticating...
                </>
              ) : (
                'Login'
              )}
            </button>

            {/* Field 5: Help Link */}
            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() =>
                  alert(
                    'To reset your password, please contact the school administrative helpdesk or your class teacher.'
                  )
                }
                className="text-xs sm:text-sm font-bold text-[#111C2D] hover:text-[#F37021] transition-colors"
              >
                Forgot your password?
              </button>
            </div>
          </form>

          {/* Quick Demo Switcher (For Development & Reviewer Testing) */}
          <div className="mt-6 pt-5 border-t border-slate-100">
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                1-Click Demo Testing
              </span>
              <span className="text-[10px] font-semibold text-[#F37021] bg-[#FFF2EE] px-2 py-0.5 rounded-full">
                All Roles
              </span>
            </div>
            <div className="grid grid-cols-3 gap-1.5">
              {LOGIN_PAGE_CONFIG.demoAccounts.map((account) => {
                const Icon = account.icon;
                const isSelected = userId === account.email;
                return (
                  <button
                    key={account.role}
                    type="button"
                    onClick={() => handleDemoSelect(account.email, account.password)}
                    className={`p-2 rounded-lg text-left border text-[11px] transition-all flex flex-col gap-1 ${
                      isSelected
                        ? 'border-[#F37021] bg-[#FFF2EE] text-[#F37021] font-bold'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-1">
                      <Icon className="w-3 h-3 shrink-0" />
                      <span className="truncate">{account.role}</span>
                    </div>
                  </button>
                );
              })}
            </div>
            <p className="text-[10px] text-slate-400 mt-2 text-center">
              Student and Parent accounts both open the unified student portal.
            </p>
          </div>
        </div>

        {/* Footer Quick Links Bar */}
        <div className="w-full max-w-[460px] flex items-center justify-center gap-6 py-4 text-xs font-semibold text-slate-700">
          {LOGIN_PAGE_CONFIG.footerLinks.map((link) => {
            const Icon = link.icon;
            return (
              <a
                key={link.label}
                href={link.href}
                className="flex items-center gap-1.5 hover:text-[#F37021] transition-colors"
              >
                <Icon className="w-4 h-4 text-slate-600" />
                <span>{link.label}</span>
              </a>
            );
          })}
        </div>
      </section>
    </div>
  );
}

// ============================================================================
// 3. EXPORT ROOT WITH SUSPENSE BOUNDARY
// ============================================================================
export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#FAF7F5] flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-[#F37021]" />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
