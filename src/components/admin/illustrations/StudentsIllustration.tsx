'use client';

import React from 'react';

interface StudentsIllustrationProps {
  className?: string;
}

export default function StudentsIllustration({ className = '' }: StudentsIllustrationProps) {
  return (
    <div className={`relative flex items-center justify-center shrink-0 ${className}`}>
      <svg
        viewBox="0 0 200 130"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full select-none"
      >
        <defs>
          <linearGradient id="studentBgCircleGrad" x1="100" y1="0" x2="100" y2="130" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FED7AA" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#FDBA74" stopOpacity="0.5" />
          </linearGradient>
        </defs>

        {/* Soft Background Circular Motif */}
        <circle cx="105" cy="65" r="54" fill="url(#studentBgCircleGrad)" />

        {/* Boy Student (Left) */}
        <g id="boyStudent">
          {/* Blue Backpack Straps & Shoulders */}
          <path d="M42 130C42 105 52 98 68 98C84 98 94 105 94 130H42Z" fill="#FFFFFF" />
          <path d="M46 106L52 130" stroke="#0284C7" strokeWidth="4" strokeLinecap="round" />
          <path d="M90 106L84 130" stroke="#0284C7" strokeWidth="4" strokeLinecap="round" />

          {/* White Shirt Collar & Tie */}
          <path d="M60 98L68 110L76 98H60Z" fill="#E2E8F0" />
          <path d="M66 102L68 122L70 102Z" fill="#1E3A8A" />

          {/* Neck */}
          <path d="M63 88H73V99C73 100 71 101 68 101C65 101 63 100 63 99V88Z" fill="#FBD6BD" />

          {/* Head & Face */}
          <ellipse cx="68" cy="74" rx="16" ry="17" fill="#FCD9C4" />
          <ellipse cx="51" cy="75" rx="3" ry="4.5" fill="#FBD6BD" />
          <ellipse cx="85" cy="75" rx="3" ry="4.5" fill="#FBD6BD" />

          {/* Dark Hair */}
          <path
            d="M51 72C50 60 56 50 68 50C80 50 86 60 85 72C83 66 79 58 68 58C57 58 53 66 51 72Z"
            fill="#1E293B"
          />
          <path
            d="M52 68C55 58 63 56 70 56C78 56 84 62 84 68C81 63 76 60 70 60C62 60 56 63 52 68Z"
            fill="#0F172A"
          />

          {/* Eyebrows & Eyes */}
          <path d="M58 70C60 69 63 69 64 70" stroke="#1E293B" strokeWidth="1.5" strokeLinecap="round" />
          <path d="M72 70C73 69 76 69 78 70" stroke="#1E293B" strokeWidth="1.5" strokeLinecap="round" />
          <circle cx="61" cy="74" r="2" fill="#1E293B" />
          <circle cx="75" cy="74" r="2" fill="#1E293B" />

          {/* Cheeks Blush */}
          <ellipse cx="57" cy="78" rx="2.5" ry="1.2" fill="#F87171" opacity="0.35" />
          <ellipse cx="79" cy="78" rx="2.5" ry="1.2" fill="#F87171" opacity="0.35" />

          {/* Smile */}
          <path d="M64 80C66 82 70 82 72 80" stroke="#1E293B" strokeWidth="1.75" strokeLinecap="round" />
        </g>

        {/* Girl Student (Right) */}
        <g id="girlStudent">
          {/* Hair back */}
          <path
            d="M100 78C98 62 108 52 124 52C140 52 150 62 148 78C152 92 148 106 146 114C140 108 140 96 140 90C136 94 112 94 108 90C108 96 108 108 102 114C100 106 96 92 100 78Z"
            fill="#1E293B"
          />

          {/* White Shirt & Shoulders */}
          <path d="M104 130C104 108 112 101 124 101C136 101 144 108 144 130H104Z" fill="#FFFFFF" />

          {/* White Shirt Collar & Tie */}
          <path d="M117 101L124 111L131 101H117Z" fill="#E2E8F0" />
          <path d="M122 105L124 120L126 105Z" fill="#1E3A8A" />

          {/* Book / Notebook in arms */}
          <rect x="110" y="112" width="28" height="18" rx="3" fill="#0D9488" stroke="#14B8A6" strokeWidth="1.5" />
          <line x1="113" y1="117" x2="128" y2="117" stroke="#FFFFFF" strokeWidth="1" strokeLinecap="round" />
          <line x1="113" y1="121" x2="125" y2="121" stroke="#FFFFFF" strokeWidth="1" strokeLinecap="round" />
          {/* Hand clasping book */}
          <ellipse cx="111" cy="120" rx="3" ry="4" fill="#FCD9C4" />
          <ellipse cx="137" cy="120" rx="3" ry="4" fill="#FCD9C4" />

          {/* Neck */}
          <path d="M120 92H128V102C128 103 126 104 124 104C122 104 120 103 120 102V92Z" fill="#FBD6BD" />

          {/* Face */}
          <ellipse cx="124" cy="78" rx="14" ry="15" fill="#FCD9C4" />
          <ellipse cx="109" cy="78" rx="2.5" ry="3.5" fill="#FBD6BD" />
          <ellipse cx="139" cy="78" rx="2.5" ry="3.5" fill="#FBD6BD" />

          {/* Hair Front Bangs */}
          <path
            d="M109 74C111 64 116 61 124 61C132 61 137 64 139 74C136 69 131 66 124 66C117 66 112 69 109 74Z"
            fill="#0F172A"
          />
          <path
            d="M112 70C116 74 122 74 124 71C126 74 132 74 136 70C133 67 129 65 124 65C119 65 115 67 112 70Z"
            fill="#0F172A"
          />

          {/* Eyebrows & Eyes */}
          <path d="M114 74C116 73 118 73 120 74" stroke="#1E293B" strokeWidth="1.5" strokeLinecap="round" />
          <path d="M128 74C130 73 132 73 134 74" stroke="#1E293B" strokeWidth="1.5" strokeLinecap="round" />
          <circle cx="117" cy="77" r="1.8" fill="#1E293B" />
          <circle cx="131" cy="77" r="1.8" fill="#1E293B" />

          {/* Cheeks Blush */}
          <ellipse cx="114" cy="81" rx="2.5" ry="1.2" fill="#F87171" opacity="0.4" />
          <ellipse cx="134" cy="81" rx="2.5" ry="1.2" fill="#F87171" opacity="0.4" />

          {/* Smile */}
          <path d="M121 82C123 84 125 84 127 82" stroke="#1E293B" strokeWidth="1.5" strokeLinecap="round" />
        </g>
      </svg>
    </div>
  );
}
