'use client';

import React from 'react';

interface SchoolLogoProps {
  className?: string;
  size?: number;
}

export default function SchoolLogo({ className = '', size = 42 }: SchoolLogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 ${className}`}
      aria-label="Sunrise Public School Logo"
    >
      <defs>
        <linearGradient id="logoLeftGrad" x1="4" y1="8" x2="22" y2="40" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#00B4D8" />
          <stop offset="100%" stopColor="#0077B6" />
        </linearGradient>
        <linearGradient id="logoRightGrad" x1="26" y1="8" x2="44" y2="40" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#38BDF8" />
          <stop offset="100%" stopColor="#0284C7" />
        </linearGradient>
        <linearGradient id="logoSpineGrad" x1="24" y1="12" x2="24" y2="42" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#0369A1" />
          <stop offset="100%" stopColor="#075985" />
        </linearGradient>
      </defs>

      {/* Left open pages (layered) */}
      <path
        d="M23 14C17 10 10 11 5 13.5V36.5C10 34 17 33 23 37V14Z"
        fill="url(#logoLeftGrad)"
      />
      <path
        d="M23 18C18 14.5 12 15.5 7.5 17.5V37C12 35 18 34 23 37.5V18Z"
        fill="#0284C7"
        opacity="0.35"
      />
      {/* Left page white accent line */}
      <path
        d="M8 20C12 18.5 17 18 21 20.5"
        stroke="#FFFFFF"
        strokeWidth="1.75"
        strokeLinecap="round"
        opacity="0.8"
      />
      <path
        d="M8.5 25C12.5 23.5 17 23 21 25.5"
        stroke="#FFFFFF"
        strokeWidth="1.75"
        strokeLinecap="round"
        opacity="0.8"
      />
      <path
        d="M9 30C13 28.5 17 28 21 30.5"
        stroke="#FFFFFF"
        strokeWidth="1.75"
        strokeLinecap="round"
        opacity="0.8"
      />

      {/* Right open pages (layered) */}
      <path
        d="M25 14C31 10 38 11 43 13.5V36.5C38 34 31 33 25 37V14Z"
        fill="url(#logoRightGrad)"
      />
      <path
        d="M25 18C30 14.5 36 15.5 40.5 17.5V37C36 35 30 34 25 37.5V18Z"
        fill="#38BDF8"
        opacity="0.4"
      />
      {/* Right page white accent line */}
      <path
        d="M40 20C36 18.5 31 18 27 20.5"
        stroke="#FFFFFF"
        strokeWidth="1.75"
        strokeLinecap="round"
        opacity="0.8"
      />
      <path
        d="M39.5 25C35.5 23.5 31 23 27 25.5"
        stroke="#FFFFFF"
        strokeWidth="1.75"
        strokeLinecap="round"
        opacity="0.8"
      />
      <path
        d="M39 30C35 28.5 31 28 27 30.5"
        stroke="#FFFFFF"
        strokeWidth="1.75"
        strokeLinecap="round"
        opacity="0.8"
      />

      {/* Book Spine Center Marker */}
      <path
        d="M24 13V38"
        stroke="url(#logoSpineGrad)"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </svg>
  );
}
