import React from 'react';

interface SchoolLogoProps {
  className?: string;
  size?: number;
}

export default function SchoolLogo({ className = '', size = 38 }: SchoolLogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Outer book spine / base shadow */}
      <path
        d="M24 40C20 37.5 13 36.5 6 38.5V11.5C13 9.5 20 10.5 24 13C28 10.5 35 9.5 42 11.5V38.5C35 36.5 28 37.5 24 40Z"
        fill="url(#bookGrad)"
      />
      {/* Central diamond crest */}
      <polygon
        points="24,6 27,10 24,14 21,10"
        fill="#00B4D8"
      />
      {/* Center spine line */}
      <path
        d="M24 13V40"
        stroke="#FFFFFF"
        strokeWidth="2"
        strokeLinecap="round"
      />
      {/* Left page accent line */}
      <path
        d="M9 14.5C14 13 19 13.8 22 15.5V37C19 35.3 14 34.5 9 36V14.5Z"
        fill="#FFFFFF"
        fillOpacity="0.22"
      />
      {/* Right page accent line */}
      <path
        d="M39 14.5C34 13 29 13.8 26 15.5V37C29 35.3 34 34.5 39 36V14.5Z"
        fill="#FFFFFF"
        fillOpacity="0.22"
      />
      {/* Bottom outline accent */}
      <path
        d="M6 38.5C13 36.5 20 37.5 24 40C28 37.5 35 36.5 42 38.5"
        stroke="#0284C7"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <defs>
        <linearGradient id="bookGrad" x1="6" y1="10" x2="42" y2="40" gradientUnits="userSpaceOnUse">
          <stop stopColor="#00A3FF" />
          <stop offset="0.5" stopColor="#0284C7" />
          <stop offset="1" stopColor="#0369A1" />
        </linearGradient>
      </defs>
    </svg>
  );
}
