'use client';

import React from 'react';

interface AcademicIllustrationProps {
  className?: string;
}

export default function AcademicIllustration({ className = '' }: AcademicIllustrationProps) {
  return (
    <div className={`relative flex items-center justify-center shrink-0 ${className}`}>
      <svg
        viewBox="0 0 200 130"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full select-none"
      >
        <defs>
          <linearGradient id="academicBgCircleGrad" x1="100" y1="0" x2="100" y2="130" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#E9D5FF" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#D8B4FE" stopOpacity="0.5" />
          </linearGradient>

          {/* Book 1 (Bottom - Navy) */}
          <linearGradient id="bookBottomGrad" x1="40" y1="110" x2="160" y2="110" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#0369A1" />
            <stop offset="100%" stopColor="#0284C7" />
          </linearGradient>

          {/* Book 2 (Middle - Red/Coral) */}
          <linearGradient id="bookMidGrad" x1="45" y1="92" x2="155" y2="92" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#BE123C" />
            <stop offset="100%" stopColor="#E11D48" />
          </linearGradient>

          {/* Book 3 (Top - Teal/Cyan) */}
          <linearGradient id="bookTopGrad" x1="50" y1="76" x2="150" y2="76" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#0F766E" />
            <stop offset="100%" stopColor="#0D9488" />
          </linearGradient>

          {/* Cap Gradient */}
          <linearGradient id="capGrad" x1="100" y1="20" x2="100" y2="65" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#334155" />
            <stop offset="100%" stopColor="#0F172A" />
          </linearGradient>
        </defs>

        {/* Soft Background Circular Motif */}
        <circle cx="105" cy="65" r="54" fill="url(#academicBgCircleGrad)" />

        {/* Stack of Books */}
        <g id="booksStack">
          {/* Bottom Book: Navy Blue */}
          <rect x="42" y="105" width="118" height="18" rx="3" fill="url(#bookBottomGrad)" />
          {/* Bottom Book Pages */}
          <rect x="47" y="108" width="107" height="12" rx="1" fill="#F8FAFC" />
          <line x1="52" y1="112" x2="148" y2="112" stroke="#E2E8F0" strokeWidth="1" />
          <line x1="52" y1="116" x2="148" y2="116" stroke="#E2E8F0" strokeWidth="1" />
          {/* Spine Ribbon / Marker */}
          <rect x="42" y="105" width="8" height="18" rx="2" fill="#075985" />

          {/* Middle Book: Crimson Red */}
          <rect x="48" y="87" width="106" height="17" rx="3" fill="url(#bookMidGrad)" />
          {/* Middle Book Pages */}
          <rect x="53" y="90" width="95" height="11" rx="1" fill="#FFFBEB" />
          <line x1="57" y1="94" x2="142" y2="94" stroke="#FEF3C7" strokeWidth="1" />
          <line x1="57" y1="97" x2="142" y2="97" stroke="#FEF3C7" strokeWidth="1" />
          {/* Spine */}
          <rect x="48" y="87" width="7" height="17" rx="2" fill="#9F1239" />

          {/* Top Book: Deep Teal */}
          <rect x="54" y="70" width="94" height="16" rx="3" fill="url(#bookTopGrad)" />
          {/* Top Book Pages */}
          <rect x="58" y="73" width="84" height="10" rx="1" fill="#F0FDFA" />
          <line x1="62" y1="77" x2="136" y2="77" stroke="#CCFBF1" strokeWidth="1" />
          {/* Spine */}
          <rect x="54" y="70" width="6" height="16" rx="2" fill="#115E59" />
        </g>

        {/* Graduation Mortarboard Cap */}
        <g id="graduationCap">
          {/* Cap Skull Base */}
          <path d="M78 52C78 52 82 66 100 66C118 66 122 52 122 52H78Z" fill="#1E293B" />
          <ellipse cx="100" cy="52" rx="22" ry="4" fill="#0F172A" />

          {/* Mortarboard Diamond Top */}
          <polygon points="100,26 156,44 100,62 44,44" fill="url(#capGrad)" stroke="#1E293B" strokeWidth="1" />

          {/* Center Button */}
          <circle cx="100" cy="44" r="3.5" fill="#0F172A" />
          <circle cx="100" cy="44" r="2" fill="#FBBF24" />

          {/* Golden Yellow Tassel */}
          {/* Tassel cord */}
          <path d="M100 44C115 44 128 50 128 64V80" stroke="#F59E0B" strokeWidth="2.5" strokeLinecap="round" />
          {/* Tassel brush/fringe */}
          <ellipse cx="128" cy="82" rx="4" ry="7" fill="#FBBF24" />
          <line x1="126" y1="84" x2="126" y2="89" stroke="#D97706" strokeWidth="1" />
          <line x1="128" y1="84" x2="128" y2="89" stroke="#D97706" strokeWidth="1" />
          <line x1="130" y1="84" x2="130" y2="89" stroke="#D97706" strokeWidth="1" />
        </g>
      </svg>
    </div>
  );
}
