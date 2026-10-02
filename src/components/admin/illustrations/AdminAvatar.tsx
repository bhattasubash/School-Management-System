'use client';

import React from 'react';

interface AdminAvatarProps {
  size?: number;
  className?: string;
}

export default function AdminAvatar({ size = 40, className = '' }: AdminAvatarProps) {
  return (
    <div
      style={{ width: size, height: size }}
      className={`rounded-full overflow-hidden shrink-0 border-2 border-white shadow-xs bg-[#EBF4FE] relative flex items-center justify-center ${className}`}
    >
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
      >
        <defs>
          <clipPath id="avatarCircleClip">
            <circle cx="50" cy="50" r="50" />
          </clipPath>
          <linearGradient id="avatarBgGrad" x1="50" y1="0" x2="50" y2="100" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#EFF6FF" />
            <stop offset="100%" stopColor="#DBEAFE" />
          </linearGradient>
          <linearGradient id="suitGrad" x1="50" y1="65" x2="50" y2="100" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#1E293B" />
            <stop offset="100%" stopColor="#0F172A" />
          </linearGradient>
        </defs>

        <g clipPath="url(#avatarCircleClip)">
          {/* Background circle */}
          <rect width="100" height="100" fill="url(#avatarBgGrad)" />

          {/* Body / Suit */}
          <path
            d="M15 100C15 80 28 72 50 72C72 72 85 80 85 100H15Z"
            fill="url(#suitGrad)"
          />

          {/* White Shirt Collar */}
          <path d="M40 72L50 86L60 72H40Z" fill="#FFFFFF" />

          {/* Necktie */}
          <path d="M48 76L52 76L54 94L50 98L46 94L48 76Z" fill="#0284C7" />
          <path d="M47.5 75H52.5L53.5 80H46.5L47.5 75Z" fill="#0369A1" />

          {/* Neck */}
          <path d="M44 58H56V74C56 75.5 54 77 50 77C46 77 44 75.5 44 74V58Z" fill="#FBD6BD" />

          {/* Face */}
          <ellipse cx="50" cy="46" rx="20" ry="21" fill="#FCD9C4" />

          {/* Ears */}
          <ellipse cx="29" cy="47" rx="3.5" ry="5.5" fill="#FBD6BD" />
          <ellipse cx="71" cy="47" rx="3.5" ry="5.5" fill="#FBD6BD" />

          {/* Hair back & top */}
          <path
            d="M29 42C28 32 35 22 50 22C65 22 72 32 71 42C69 36 65 30 50 30C35 30 31 36 29 42Z"
            fill="#1E293B"
          />
          {/* Hair bangs / parted front */}
          <path
            d="M30 38C32 26 42 24 50 24C62 24 70 28 70 38C68 33 60 28 50 28C40 28 34 32 30 38Z"
            fill="#0F172A"
          />
          <path
            d="M30 40C33 34 39 31 46 32C41 34 37 38 35 43C33 42 31 41 30 40Z"
            fill="#1E293B"
          />

          {/* Eyebrows */}
          <path d="M37 40C39 39 42 39 44 40" stroke="#1E293B" strokeWidth="2" strokeLinecap="round" />
          <path d="M56 40C58 39 61 39 63 40" stroke="#1E293B" strokeWidth="2" strokeLinecap="round" />

          {/* Eyes */}
          <ellipse cx="40.5" cy="45" rx="2.5" ry="3" fill="#1E293B" />
          <ellipse cx="59.5" cy="45" rx="2.5" ry="3" fill="#1E293B" />
          <circle cx="41.5" cy="44" r="1" fill="#FFFFFF" />
          <circle cx="60.5" cy="44" r="1" fill="#FFFFFF" />

          {/* Cheeks - light blush */}
          <ellipse cx="36" cy="49" rx="3" ry="1.5" fill="#F87171" opacity="0.3" />
          <ellipse cx="64" cy="49" rx="3" ry="1.5" fill="#F87171" opacity="0.3" />

          {/* Smile */}
          <path
            d="M44 52C46 55 54 55 56 52"
            stroke="#1E293B"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </g>
      </svg>
    </div>
  );
}
