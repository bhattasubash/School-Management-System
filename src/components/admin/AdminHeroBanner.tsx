'use client';

import React from 'react';
import AdminAvatar from './illustrations/AdminAvatar';
import SchoolCampusIllustration from './illustrations/SchoolCampusIllustration';

interface AdminHeroBannerProps {
  adminName?: string;
  schoolName?: string;
  tagline?: string;
}

export default function AdminHeroBanner({
  adminName = 'Admin',
  schoolName = 'Sunrise Public School',
  tagline = 'Manage · Monitor · Build a Better Learning Experience',
}: AdminHeroBannerProps) {
  return (
    <div className="relative w-full bg-white rounded-[26px] border border-white/70 shadow-[0_4px_24px_rgba(30,64,175,0.04)] overflow-hidden flex flex-col md:flex-row items-stretch min-h-[175px]">
      {/* Left side: Curved mint pastel backdrop & text info */}
      <div className="relative flex-1 flex items-center p-5 lg:p-7 z-10">
        {/* Soft Organic Mint Green Curved Background Motif */}
        <div className="absolute inset-y-0 left-0 w-full max-w-lg bg-gradient-to-r from-[#D1FAE5]/60 via-[#ECFDF5]/40 to-transparent rounded-r-[100px] pointer-events-none -z-10" />

        <div className="flex items-center gap-5 lg:gap-6">
          {/* Admin Illustrated Portrait Avatar */}
          <div className="shrink-0 p-1 bg-white rounded-full shadow-[0_4px_16px_rgba(0,0,0,0.06)] border border-slate-100">
            <AdminAvatar size={82} />
          </div>

          {/* Typography Info */}
          <div className="space-y-0.5">
            <span className="text-[14px] font-normal text-slate-500 block leading-tight">
              Hello,
            </span>
            <h1 className="text-[26px] lg:text-[28px] font-extrabold text-slate-900 leading-tight flex items-center gap-1.5">
              <span>{adminName}</span>
              <span className="select-none text-2xl">👋</span>
            </h1>
            <p className="text-[14px] font-bold text-slate-700 pt-0.5 leading-tight">
              {schoolName}
            </p>
            <p className="text-[12px] font-normal text-slate-400 pt-0.5 leading-normal">
              {tagline}
            </p>
          </div>
        </div>
      </div>

      {/* Right side: School Campus Illustration */}
      <div className="relative w-full md:w-[46%] lg:w-[48%] flex items-center justify-end overflow-hidden shrink-0 select-none">
        <SchoolCampusIllustration />
      </div>
    </div>
  );
}
