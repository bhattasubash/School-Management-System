'use client';

import React from 'react';

interface TeacherIllustrationProps {
  className?: string;
}

export default function TeacherIllustration({ className = '' }: TeacherIllustrationProps) {
  return (
    <div className={`relative flex items-center justify-center shrink-0 ${className}`}>
      <svg
        viewBox="0 0 200 130"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full select-none"
      >
        <defs>
          <linearGradient id="teacherBgCircleGrad" x1="100" y1="0" x2="100" y2="130" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#BAE6FD" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#7DD3FC" stopOpacity="0.5" />
          </linearGradient>
        </defs>

        {/* Soft Background Circular Motif */}
        <circle cx="105" cy="65" r="54" fill="url(#teacherBgCircleGrad)" />

        {/* Presentation Whiteboard on Right */}
        <g id="presentationBoard">
          {/* Whiteboard Stand/Shadow */}
          <rect x="135" y="32" width="52" height="72" rx="4" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="2" />
          {/* Board inner header line */}
          <line x1="141" y1="42" x2="162" y2="42" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" />
          {/* Subtle diagram lines on board */}
          <line x1="141" y1="52" x2="178" y2="52" stroke="#CBD5E1" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="141" y1="60" x2="170" y2="60" stroke="#CBD5E1" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="141" y1="68" x2="175" y2="68" stroke="#CBD5E1" strokeWidth="1.5" strokeLinecap="round" />
        </g>

        {/* Teacher Character (Left) */}
        <g id="teacherCharacter">
          {/* Hair back */}
          <path
            d="M62 76C60 56 70 42 88 42C106 42 116 56 114 76C118 94 116 108 112 118C106 110 106 96 106 88C100 94 76 94 70 88C70 96 70 110 64 118C60 108 58 94 62 76Z"
            fill="#1E293B"
          />

          {/* Shoulders & White Coat */}
          <path d="M64 130C64 104 74 96 88 96C102 96 112 104 112 130H64Z" fill="#FFFFFF" />

          {/* Inner Blue Shirt & Lapels */}
          <path d="M83 96L88 110L93 96H83Z" fill="#0284C7" />
          <path d="M78 96L84 126L88 126L84 96H78Z" fill="#F1F5F9" />
          <path d="M98 96L92 126L88 126L92 96H98Z" fill="#F1F5F9" />

          {/* Blue folder in left arm */}
          <rect x="74" y="112" width="22" height="18" rx="2" fill="#0369A1" stroke="#0284C7" strokeWidth="1" />
          <line x1="77" y1="117" x2="90" y2="117" stroke="#FFFFFF" strokeWidth="1" strokeLinecap="round" />
          <ellipse cx="76" cy="120" rx="3" ry="3.5" fill="#FCD9C4" />

          {/* Extended Right Arm with Pointer */}
          <path d="M106 105C118 102 128 92 138 84" stroke="#FFFFFF" strokeWidth="6" strokeLinecap="round" />
          {/* Hand holding pointer */}
          <circle cx="139" cy="83" r="3.5" fill="#FCD9C4" />
          {/* Black Pointer Stick extending towards whiteboard */}
          <line x1="140" y1="82" x2="160" y2="60" stroke="#0F172A" strokeWidth="2.5" strokeLinecap="round" />

          {/* Neck */}
          <path d="M84 84H92V96C92 97 90 98 88 98C86 98 84 97 84 96V84Z" fill="#FBD6BD" />

          {/* Face */}
          <ellipse cx="88" cy="70" rx="15" ry="16" fill="#FCD9C4" />
          <ellipse cx="72" cy="71" rx="2.5" ry="3.5" fill="#FBD6BD" />
          <ellipse cx="104" cy="71" rx="2.5" ry="3.5" fill="#FBD6BD" />

          {/* Hair Front Styling */}
          <path
            d="M72 65C75 52 82 48 90 48C98 48 105 52 105 65C102 59 96 55 88 55C80 55 75 59 72 65Z"
            fill="#0F172A"
          />
          <path
            d="M72 67C76 60 84 57 91 58C86 61 80 66 78 72C75 70 73 69 72 67Z"
            fill="#1E293B"
          />

          {/* Eyebrows & Eyes */}
          <path d="M78 66C80 65 83 65 85 66" stroke="#1E293B" strokeWidth="1.5" strokeLinecap="round" />
          <path d="M91 66C93 65 96 65 98 66" stroke="#1E293B" strokeWidth="1.5" strokeLinecap="round" />
          <circle cx="81" cy="70" r="1.8" fill="#1E293B" />
          <circle cx="95" cy="70" r="1.8" fill="#1E293B" />

          {/* Cheeks Blush */}
          <ellipse cx="78" cy="74" rx="2.5" ry="1.2" fill="#F87171" opacity="0.35" />
          <ellipse cx="98" cy="74" rx="2.5" ry="1.2" fill="#F87171" opacity="0.35" />

          {/* Smile */}
          <path d="M85 76C87 78 89 78 91 76" stroke="#1E293B" strokeWidth="1.75" strokeLinecap="round" />
        </g>
      </svg>
    </div>
  );
}
