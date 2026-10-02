'use client';

import React from 'react';

interface SchoolCampusIllustrationProps {
  className?: string;
}

export default function SchoolCampusIllustration({ className = '' }: SchoolCampusIllustrationProps) {
  return (
    <div className={`relative w-full h-full min-h-[170px] overflow-hidden ${className}`}>
      <svg
        viewBox="0 0 540 220"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full object-cover select-none"
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          {/* Sky Gradient */}
          <linearGradient id="skyGrad" x1="270" y1="0" x2="270" y2="180" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#BAE6FD" stopOpacity="0.85" />
            <stop offset="60%" stopColor="#E0F2FE" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
          </linearGradient>

          {/* Grass Hills Gradients */}
          <linearGradient id="backHillGrad" x1="270" y1="110" x2="270" y2="200" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#86EFAC" />
            <stop offset="100%" stopColor="#4ADE80" />
          </linearGradient>
          <linearGradient id="frontLawnGrad" x1="270" y1="150" x2="270" y2="220" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#4ADE80" />
            <stop offset="100%" stopColor="#22C55E" />
          </linearGradient>

          {/* Building Facade Gradient */}
          <linearGradient id="buildingWallGrad" x1="390" y1="110" x2="390" y2="180" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FED7AA" />
            <stop offset="100%" stopColor="#FDBA74" />
          </linearGradient>

          {/* Red Roof Gradient */}
          <linearGradient id="roofGrad" x1="390" y1="95" x2="390" y2="135" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#F97316" />
            <stop offset="100%" stopColor="#EA580C" />
          </linearGradient>

          {/* Sun Gradient */}
          <linearGradient id="sunGrad" x1="475" y1="25" x2="475" y2="55" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FDE047" />
            <stop offset="100%" stopColor="#FBBF24" />
          </linearGradient>
        </defs>

        {/* Sky Background Tint */}
        <rect width="540" height="220" fill="url(#skyGrad)" />

        {/* Sun with Rays */}
        <g id="sun">
          {/* Sun rays */}
          <circle cx="475" cy="40" r="26" stroke="#FDE047" strokeWidth="2" strokeDasharray="3 4" opacity="0.6" />
          <path d="M475 8V16M475 64V72M443 40H451M499 40H507M452 17L458 23M492 57L498 63M452 63L458 57M492 23L498 17" stroke="#FBBF24" strokeWidth="2.5" strokeLinecap="round" />
          {/* Sun Core */}
          <circle cx="475" cy="40" r="16" fill="url(#sunGrad)" />
        </g>

        {/* Clouds */}
        <g id="clouds" opacity="0.9">
          {/* Cloud 1 Left */}
          <path
            d="M50 48C50 42 55 37 61 37C64 33 69 31 75 31C82 31 88 35 90 41C94 41 98 44 98 48C98 52 94 56 90 56H57C53 56 50 52 50 48Z"
            fill="#FFFFFF"
          />
          {/* Cloud 2 Center */}
          <path
            d="M170 52C170 47 174 43 179 43C181 39 186 37 191 37C198 37 203 41 204 46C208 46 211 49 211 53C211 57 208 60 204 60H176C172 60 170 57 170 52Z"
            fill="#FFFFFF"
          />
          {/* Cloud 3 Near Sun */}
          <path
            d="M360 44C360 39 364 35 369 35C372 32 377 30 382 30C389 30 394 34 396 39C399 39 402 42 402 45C402 49 399 52 395 52H366C363 52 360 48 360 44Z"
            fill="#FFFFFF"
          />
        </g>

        {/* Rolling Background Hill */}
        <path
          d="M0 170C80 150 180 140 280 145C380 150 460 135 540 148V220H0V170Z"
          fill="url(#backHillGrad)"
        />

        {/* Distant Trees Line */}
        <g id="distantTrees">
          <ellipse cx="60" cy="155" rx="18" ry="24" fill="#22C55E" />
          <ellipse cx="85" cy="150" rx="22" ry="28" fill="#16A34A" />
          <ellipse cx="115" cy="154" rx="20" ry="26" fill="#15803D" />
          <ellipse cx="145" cy="152" rx="16" ry="22" fill="#22C55E" />
          <ellipse cx="170" cy="156" rx="22" ry="26" fill="#16A34A" />
          <ellipse cx="205" cy="150" rx="20" ry="28" fill="#15803D" />
          <ellipse cx="235" cy="153" rx="18" ry="24" fill="#22C55E" />
          <ellipse cx="265" cy="157" rx="24" ry="25" fill="#16A34A" />

          {/* Right side distant trees */}
          <ellipse cx="490" cy="148" rx="22" ry="30" fill="#16A34A" />
          <ellipse cx="515" cy="152" rx="20" ry="26" fill="#15803D" />
        </g>

        {/* Foreground Lush Lawn */}
        <path
          d="M0 180C110 170 230 166 350 172C430 176 490 170 540 175V220H0V180Z"
          fill="url(#frontLawnGrad)"
        />

        {/* Foreground Stylized Trees (Left of School) */}
        <g id="foregroundTrees">
          {/* Tree 1 */}
          <rect x="180" y="160" width="6" height="28" fill="#78350F" rx="2" />
          <circle cx="183" cy="150" r="16" fill="#16A34A" />
          <circle cx="177" cy="144" r="11" fill="#22C55E" />

          {/* Tree 2 */}
          <rect x="225" y="162" width="6" height="26" fill="#78350F" rx="2" />
          <circle cx="228" cy="152" r="18" fill="#15803D" />
          <circle cx="233" cy="146" r="13" fill="#16A34A" />

          {/* Tree 3 */}
          <rect x="268" y="165" width="5" height="24" fill="#78350F" rx="2" />
          <circle cx="270" cy="156" r="15" fill="#22C55E" />

          {/* Tree 4 Right of School */}
          <rect x="475" y="164" width="6" height="25" fill="#78350F" rx="2" />
          <circle cx="478" cy="154" r="17" fill="#15803D" />
          <circle cx="473" cy="148" r="12" fill="#22C55E" />
        </g>

        {/* School Building */}
        <g id="schoolBuilding">
          {/* Main Base Wings */}
          {/* Left Wing */}
          <rect x="305" y="128" width="70" height="52" fill="url(#buildingWallGrad)" rx="2" />
          {/* Right Wing */}
          <rect x="415" y="128" width="70" height="52" fill="url(#buildingWallGrad)" rx="2" />

          {/* Center Tower Section */}
          <rect x="365" y="105" width="60" height="75" fill="url(#buildingWallGrad)" rx="2" />

          {/* Roofs */}
          {/* Left Wing Roof */}
          <polygon points="300,128 377,128 368,116 309,116" fill="url(#roofGrad)" />
          {/* Right Wing Roof */}
          <polygon points="413,128 490,128 481,116 422,116" fill="url(#roofGrad)" />

          {/* Center Tower Triangular Roof */}
          <polygon points="360,105 430,105 395,78" fill="url(#roofGrad)" />

          {/* Tower Clock */}
          <circle cx="395" cy="94" r="9" fill="#FFFFFF" stroke="#0F172A" strokeWidth="1.5" />
          {/* Clock Hands indicating 10:10 */}
          <line x1="395" y1="94" x2="391" y2="89" stroke="#0F172A" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="395" y1="94" x2="399" y2="90" stroke="#0F172A" strokeWidth="1.5" strokeLinecap="round" />

          {/* Main Entrance (Center Arched Door) */}
          <path d="M387 180V166C387 161.5 390.5 158 395 158C399.5 158 403 161.5 403 166V180H387Z" fill="#0284C7" />
          <line x1="395" y1="158" x2="395" y2="180" stroke="#0369A1" strokeWidth="1" />
          {/* Entrance Steps */}
          <rect x="382" y="178" width="26" height="3" fill="#E2E8F0" rx="1" />
          <rect x="380" y="181" width="30" height="3" fill="#CBD5E1" rx="1" />

          {/* Left Wing Windows */}
          {/* Top Floor Arched Windows */}
          <path d="M315 142V136C315 133.5 317 131.5 319.5 131.5C322 131.5 324 133.5 324 136V142H315Z" fill="#38BDF8" stroke="#FFFFFF" strokeWidth="1" />
          <path d="M333 142V136C333 133.5 335 131.5 337.5 131.5C340 131.5 342 133.5 342 136V142H333Z" fill="#38BDF8" stroke="#FFFFFF" strokeWidth="1" />
          <path d="M351 142V136C351 133.5 353 131.5 355.5 131.5C358 131.5 360 133.5 360 136V142H351Z" fill="#38BDF8" stroke="#FFFFFF" strokeWidth="1" />
          {/* Bottom Floor Rectangular Windows */}
          <rect x="315" y="152" width="9" height="11" fill="#38BDF8" stroke="#FFFFFF" strokeWidth="1" rx="1" />
          <rect x="333" y="152" width="9" height="11" fill="#38BDF8" stroke="#FFFFFF" strokeWidth="1" rx="1" />
          <rect x="351" y="152" width="9" height="11" fill="#38BDF8" stroke="#FFFFFF" strokeWidth="1" rx="1" />

          {/* Right Wing Windows */}
          {/* Top Floor Arched Windows */}
          <path d="M430 142V136C430 133.5 432 131.5 434.5 131.5C437 131.5 439 133.5 439 136V142H430Z" fill="#38BDF8" stroke="#FFFFFF" strokeWidth="1" />
          <path d="M448 142V136C448 133.5 450 131.5 452.5 131.5C455 131.5 457 133.5 457 136V142H448Z" fill="#38BDF8" stroke="#FFFFFF" strokeWidth="1" />
          <path d="M466 142V136C466 133.5 468 131.5 470.5 131.5C473 131.5 475 133.5 475 136V142H466Z" fill="#38BDF8" stroke="#FFFFFF" strokeWidth="1" />
          {/* Bottom Floor Rectangular Windows */}
          <rect x="430" y="152" width="9" height="11" fill="#38BDF8" stroke="#FFFFFF" strokeWidth="1" rx="1" />
          <rect x="448" y="152" width="9" height="11" fill="#38BDF8" stroke="#FFFFFF" strokeWidth="1" rx="1" />
          <rect x="466" y="152" width="9" height="11" fill="#38BDF8" stroke="#FFFFFF" strokeWidth="1" rx="1" />

          {/* Center Tower Windows */}
          <rect x="376" y="125" width="8" height="12" fill="#38BDF8" stroke="#FFFFFF" strokeWidth="1" rx="1" />
          <rect x="406" y="125" width="8" height="12" fill="#38BDF8" stroke="#FFFFFF" strokeWidth="1" rx="1" />
          <rect x="376" y="143" width="8" height="12" fill="#38BDF8" stroke="#FFFFFF" strokeWidth="1" rx="1" />
          <rect x="406" y="143" width="8" height="12" fill="#38BDF8" stroke="#FFFFFF" strokeWidth="1" rx="1" />

          {/* Roof Ridge details & Flag */}
          <line x1="395" y1="78" x2="395" y2="70" stroke="#64748B" strokeWidth="1.5" />
          <polygon points="395,70 405,73 395,76" fill="#EF4444" />
        </g>
      </svg>
    </div>
  );
}
