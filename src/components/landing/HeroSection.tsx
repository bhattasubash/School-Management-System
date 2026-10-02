import React from 'react';
import Link from 'next/link';
import { ArrowRight, CheckCircle2, ShieldCheck, Award } from 'lucide-react';
import SchoolIllustration from './SchoolIllustration';

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-[#ddf0fd] via-[#eaf6fe] to-[#f4faff] pt-8 pb-16 lg:pt-14 lg:pb-24">
      {/* Decorative sky cloud elements */}
      <div className="absolute top-10 left-12 w-48 h-16 bg-white/40 rounded-full blur-xl pointer-events-none" />
      <div className="absolute top-20 right-1/3 w-64 h-24 bg-white/50 rounded-full blur-2xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">
          {/* Left Column: Copy & CTAs */}
          <div className="lg:col-span-6 flex flex-col justify-center text-left">
            <h1 className="text-[36px] sm:text-[44px] lg:text-[50px] font-black text-slate-900 tracking-[-0.03em] leading-[1.14]">
              All-in-One
              <br />
              School Management
              <br />
              <span className="text-[#1d8cfd]">for a Brighter Tomorrow</span>
            </h1>

            <p className="mt-5 text-[15px] sm:text-[16px] text-slate-600 leading-relaxed max-w-lg">
              Simplify administration, enhance communication, and create a better learning
              experience for students, teachers and parents.
            </p>

            <div className="mt-8">
              <Link
                href="/login"
                className="inline-flex items-center gap-2.5 px-7 py-3.5 text-[15px] font-semibold text-white bg-[#1d8cfd] hover:bg-blue-600 active:bg-blue-700 rounded-xl shadow-[0_4px_16px_rgba(29,140,253,0.35)] hover:shadow-[0_6px_22px_rgba(29,140,253,0.45)] transition-all duration-150 transform hover:-translate-y-0.5"
              >
                <span>Get Started</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>

            {/* Trust Highlights */}
            <div className="mt-10 pt-4 grid grid-cols-1 sm:grid-cols-3 gap-5 max-w-xl">
              {/* Item 1 */}
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-emerald-100 flex items-center justify-center flex-shrink-0 text-emerald-600 shadow-xs">
                  <CheckCircle2 className="w-5 h-5 stroke-[2.2]" />
                </div>
                <div>
                  <div className="text-[13px] font-bold text-slate-900 leading-tight">
                    Easy to Use
                  </div>
                  <div className="text-[11.5px] font-medium text-slate-500 leading-tight mt-0.5">
                    Simple & Intuitive
                  </div>
                </div>
              </div>

              {/* Item 2 */}
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-purple-100 flex items-center justify-center flex-shrink-0 text-purple-600 shadow-xs">
                  <ShieldCheck className="w-5 h-5 stroke-[2.2]" />
                </div>
                <div>
                  <div className="text-[13px] font-bold text-slate-900 leading-tight">
                    Secure & Reliable
                  </div>
                  <div className="text-[11.5px] font-medium text-slate-500 leading-tight mt-0.5">
                    Your Data is Safe
                  </div>
                </div>
              </div>

              {/* Item 3 */}
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-amber-100 flex items-center justify-center flex-shrink-0 text-amber-600 shadow-xs">
                  <Award className="w-5 h-5 stroke-[2.2]" />
                </div>
                <div>
                  <div className="text-[13px] font-bold text-slate-900 leading-tight">
                    Trusted by Schools
                  </div>
                  <div className="text-[11.5px] font-medium text-slate-500 leading-tight mt-0.5">
                    Modern & Scalable
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: School Building Illustration */}
          <div className="lg:col-span-6 flex justify-center lg:justify-end items-center relative">
            <SchoolIllustration className="transform hover:scale-[1.01] transition-transform duration-300" />
          </div>
        </div>
      </div>
    </section>
  );
}
