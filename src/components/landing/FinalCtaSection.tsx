import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export default function FinalCtaSection() {
  return (
    <section className="py-12 sm:py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden bg-gradient-to-r from-[#1d8cfd] via-[#1a84f3] to-[#0284c7] rounded-3xl sm:rounded-[36px] p-8 sm:p-12 lg:p-14 shadow-[0_15px_40px_rgba(29,140,253,0.3)]">
          {/* Subtle Decorative Cloud Silhouettes along Bottom and Corners */}
          <div className="absolute -bottom-8 -left-10 w-44 h-24 bg-white/15 rounded-full blur-sm pointer-events-none" />
          <div className="absolute -bottom-10 left-24 w-56 h-32 bg-white/20 rounded-full blur-md pointer-events-none" />
          <div className="absolute -bottom-12 right-1/4 w-72 h-36 bg-white/15 rounded-full blur-md pointer-events-none" />
          <div className="absolute -bottom-8 -right-8 w-48 h-28 bg-white/20 rounded-full blur-sm pointer-events-none" />
          <div className="absolute top-2 right-1/3 w-32 h-16 bg-white/10 rounded-full blur-lg pointer-events-none" />

          {/* Banner Content Container */}
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6 sm:gap-8">
            <div className="text-left max-w-xl">
              <h2 className="text-[26px] sm:text-[34px] font-black text-white tracking-[-0.02em] leading-tight">
                Ready to Transform Your School?
              </h2>
              <p className="mt-2 text-[14.5px] sm:text-[16px] text-blue-100 font-medium leading-relaxed">
                Join hundreds of schools already using Sunrise Public School.
              </p>
            </div>

            <div className="flex-shrink-0">
              <Link
                href="/login"
                className="inline-flex items-center gap-2 px-7 py-3.5 text-[15px] font-bold text-[#1d8cfd] bg-white hover:bg-blue-50 active:bg-blue-100 rounded-xl shadow-[0_4px_16px_rgba(0,0,0,0.1)] hover:shadow-[0_6px_22px_rgba(0,0,0,0.15)] transition-all duration-150 transform hover:-translate-y-0.5"
              >
                <span>Get Started</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
