'use client';

import React from 'react';

interface AnalyticsIllustrationProps {
  className?: string;
}

export default function AnalyticsIllustration({ className = '' }: AnalyticsIllustrationProps) {
  return (
    <div className={`relative flex items-center justify-center shrink-0 ${className}`}>
      <svg
        viewBox="0 0 200 130"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full select-none"
      >
        <defs>
          <linearGradient id="analyticsBgCircleGrad" x1="100" y1="0" x2="100" y2="130" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#A7F3D0" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#6EE7B7" stopOpacity="0.5" />
          </linearGradient>

          {/* Bar Gradients */}
          <linearGradient id="bar1Grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#38BDF8" />
            <stop offset="100%" stopColor="#0284C7" />
          </linearGradient>
          <linearGradient id="bar2Grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#FDE047" />
            <stop offset="100%" stopColor="#F59E0B" />
          </linearGradient>
          <linearGradient id="bar3Grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#FB923C" />
            <stop offset="100%" stopColor="#EA580C" />
          </linearGradient>
          <linearGradient id="bar4Grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#4ADE80" />
            <stop offset="100%" stopColor="#16A34A" />
          </linearGradient>
        </defs>

        {/* Soft Background Circular Motif */}
        <circle cx="105" cy="65" r="54" fill="url(#analyticsBgCircleGrad)" />

        {/* Analytics Dashboard Card Window */}
        <g id="analyticsCardWindow">
          {/* Card Surface */}
          <rect x="36" y="24" width="138" height="82" rx="8" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="2" />

          {/* Card Top Window Bar with dots */}
          <rect x="36" y="24" width="138" height="15" rx="8" fill="#F8FAFC" />
          <path d="M36 39H174" stroke="#F1F5F9" strokeWidth="1" />
          <circle cx="46" cy="31.5" r="2.5" fill="#E2E8F0" />
          <circle cx="53" cy="31.5" r="2.5" fill="#E2E8F0" />
          <circle cx="60" cy="31.5" r="2.5" fill="#E2E8F0" />

          {/* Metric lines placeholder */}
          <rect x="42" y="46" width="28" height="3" rx="1.5" fill="#CBD5E1" />
          <rect x="42" y="52" width="18" height="2" rx="1" fill="#E2E8F0" />

          {/* Vertical Bar Chart (Left side) */}
          <g id="barChart">
            {/* Horizontal axis grid line */}
            <line x1="42" y1="95" x2="98" y2="95" stroke="#E2E8F0" strokeWidth="1.5" strokeLinecap="round" />

            {/* Bar 1 (Blue) */}
            <rect x="45" y="78" width="8" height="17" rx="2" fill="url(#bar1Grad)" />
            {/* Bar 2 (Yellow) */}
            <rect x="58" y="70" width="8" height="25" rx="2" fill="url(#bar2Grad)" />
            {/* Bar 3 (Orange) */}
            <rect x="71" y="62" width="8" height="33" rx="2" fill="url(#bar3Grad)" />
            {/* Bar 4 (Green) */}
            <rect x="84" y="52" width="8" height="43" rx="2" fill="url(#bar4Grad)" />
          </g>

          {/* Circular Segmented Pie Chart (Right side) */}
          <g id="pieChart">
            {/* Pie Chart Center at (138, 70), Radius ~20 */}
            {/* Blue Segment (Top-Left: 180 to 270 deg) */}
            <path
              d="M138 70L118 70A20 20 0 0 1 138 50Z"
              fill="#0284C7"
            />
            {/* Yellow Segment (Top-Right: 270 to 360 deg) */}
            <path
              d="M138 70L138 50A20 20 0 0 1 158 70Z"
              fill="#FBBF24"
            />
            {/* Coral-Red Segment (Bottom-Right: 0 to 90 deg) */}
            <path
              d="M138 70L158 70A20 20 0 0 1 138 90Z"
              fill="#EF4444"
            />
            {/* Orange Segment (Bottom-Left: 90 to 180 deg) */}
            <path
              d="M138 70L138 90A20 20 0 0 1 118 70Z"
              fill="#F97316"
            />
          </g>
        </g>
      </svg>
    </div>
  );
}
