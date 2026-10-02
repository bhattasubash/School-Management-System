import React from 'react';

export default function SchoolIllustration({ className = '' }: { className?: string }) {
  return (
    <div className={`relative w-full max-w-[620px] aspect-[1.25/1] select-none ${className}`}>
      <svg
        viewBox="0 0 600 480"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-[0_12px_32px_rgba(29,140,253,0.12)]"
      >
        <defs>
          {/* Roof Gradient */}
          <linearGradient id="roofGrad" x1="300" y1="140" x2="300" y2="250" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#f87171" />
            <stop offset="35%" stopColor="#ef4444" />
            <stop offset="100%" stopColor="#b91c1c" />
          </linearGradient>

          {/* Wall Gradient */}
          <linearGradient id="wallGrad" x1="300" y1="180" x2="300" y2="400" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#fffdf5" />
            <stop offset="40%" stopColor="#fef3c7" />
            <stop offset="100%" stopColor="#fed7aa" />
          </linearGradient>

          {/* Wing Roof Gradient */}
          <linearGradient id="wingRoofGrad" x1="0" y1="230" x2="0" y2="275" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#fb7185" />
            <stop offset="50%" stopColor="#ef4444" />
            <stop offset="100%" stopColor="#b91c1c" />
          </linearGradient>

          {/* Window Glass Gradient */}
          <linearGradient id="winGlass" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#38bdf8" />
            <stop offset="100%" stopColor="#0284c7" />
          </linearGradient>

          {/* Door Glass Gradient */}
          <linearGradient id="doorGlass" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#0284c7" />
            <stop offset="100%" stopColor="#1e3a8a" />
          </linearGradient>

          {/* Tree Canopy Gradients */}
          <linearGradient id="treeGrad1" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#4ade80" />
            <stop offset="100%" stopColor="#15803d" />
          </linearGradient>
          <linearGradient id="treeGrad2" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#86efac" />
            <stop offset="100%" stopColor="#16a34a" />
          </linearGradient>
          <linearGradient id="shrubGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#22c55e" />
            <stop offset="100%" stopColor="#15803d" />
          </linearGradient>

          {/* Pathway Gradient */}
          <linearGradient id="pathGrad" x1="300" y1="380" x2="300" y2="480" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#fffbeb" />
            <stop offset="50%" stopColor="#fef3c7" />
            <stop offset="100%" stopColor="#fde68a" />
          </linearGradient>
        </defs>

        {/* --- SKY CLOUDS --- */}
        <g opacity="0.9">
          <circle cx="150" cy="115" r="42" fill="#ffffff" />
          <circle cx="195" cy="100" r="50" fill="#ffffff" />
          <circle cx="240" cy="118" r="38" fill="#ffffff" />
          <rect x="120" y="125" width="145" height="30" rx="15" fill="#ffffff" />

          <circle cx="375" cy="105" r="44" fill="#ffffff" />
          <circle cx="420" cy="85" r="52" fill="#ffffff" />
          <circle cx="465" cy="105" r="40" fill="#ffffff" />
          <rect x="345" y="115" width="145" height="30" rx="15" fill="#ffffff" />
        </g>

        {/* --- GREEN LAWN HILLS --- */}
        <path
          d="M0 405 Q150 375 300 380 Q450 375 600 400 L600 480 L0 480 Z"
          fill="#86efac"
          opacity="0.9"
        />
        <path
          d="M0 420 Q180 392 300 396 Q420 392 600 415 L600 480 L0 480 Z"
          fill="#4ade80"
        />

        {/* --- CENTRAL PAVED WALKWAY --- */}
        <path
          d="M260 380 L340 380 L430 480 L170 480 Z"
          fill="url(#pathGrad)"
          stroke="#fde047"
          strokeWidth="1.5"
        />
        {/* Walkway Paver Grooves */}
        <line x1="250" y1="400" x2="350" y2="400" stroke="#f59e0b" strokeOpacity="0.25" strokeWidth="1.5" />
        <line x1="230" y1="425" x2="370" y2="425" stroke="#f59e0b" strokeOpacity="0.25" strokeWidth="1.5" />
        <line x1="205" y1="452" x2="395" y2="452" stroke="#f59e0b" strokeOpacity="0.25" strokeWidth="1.5" />

        {/* Ground Building Shadow */}
        <ellipse cx="300" cy="385" rx="210" ry="10" fill="#0f172a" fillOpacity="0.08" />

        {/* --- LEFT WING --- */}
        <rect x="155" y="260" width="115" height="120" rx="2" fill="url(#wallGrad)" />
        <rect x="155" y="375" width="115" height="5" fill="#e2e8f0" />
        {/* Left Roof */}
        <polygon points="142,260 270,260 256,236 156,236" fill="url(#wingRoofGrad)" />
        <line x1="142" y1="260" x2="270" y2="260" stroke="#b91c1c" strokeWidth="2.5" />

        {/* Left Wing Upper Windows (2) */}
        <g>
          {/* Left Upper 1 */}
          <rect x="172" y="278" width="26" height="22" rx="2" fill="url(#winGlass)" stroke="#ffffff" strokeWidth="2" />
          <line x1="185" y1="278" x2="185" y2="300" stroke="#ffffff" strokeWidth="1.5" />
          <line x1="172" y1="289" x2="198" y2="289" stroke="#ffffff" strokeWidth="1.5" />
          <rect x="170" y="300" width="30" height="2.5" rx="1" fill="#ffffff" />

          {/* Left Upper 2 */}
          <rect x="220" y="278" width="26" height="22" rx="2" fill="url(#winGlass)" stroke="#ffffff" strokeWidth="2" />
          <line x1="233" y1="278" x2="233" y2="300" stroke="#ffffff" strokeWidth="1.5" />
          <line x1="220" y1="289" x2="246" y2="289" stroke="#ffffff" strokeWidth="1.5" />
          <rect x="218" y="300" width="30" height="2.5" rx="1" fill="#ffffff" />
        </g>

        {/* Left Wing Lower Windows (2) */}
        <g>
          {/* Left Lower 1 */}
          <rect x="172" y="326" width="26" height="22" rx="2" fill="url(#winGlass)" stroke="#ffffff" strokeWidth="2" />
          <line x1="185" y1="326" x2="185" y2="348" stroke="#ffffff" strokeWidth="1.5" />
          <line x1="172" y1="337" x2="198" y2="337" stroke="#ffffff" strokeWidth="1.5" />
          <rect x="170" y="348" width="30" height="2.5" rx="1" fill="#ffffff" />

          {/* Left Lower 2 */}
          <rect x="220" y="326" width="26" height="22" rx="2" fill="url(#winGlass)" stroke="#ffffff" strokeWidth="2" />
          <line x1="233" y1="326" x2="233" y2="348" stroke="#ffffff" strokeWidth="1.5" />
          <line x1="220" y1="337" x2="246" y2="337" stroke="#ffffff" strokeWidth="1.5" />
          <rect x="218" y="348" width="30" height="2.5" rx="1" fill="#ffffff" />
        </g>

        {/* --- RIGHT WING --- */}
        <rect x="330" y="260" width="115" height="120" rx="2" fill="url(#wallGrad)" />
        <rect x="330" y="375" width="115" height="5" fill="#e2e8f0" />
        {/* Right Roof */}
        <polygon points="330,260 458,260 444,236 344,236" fill="url(#wingRoofGrad)" />
        <line x1="330" y1="260" x2="458" y2="260" stroke="#b91c1c" strokeWidth="2.5" />

        {/* Right Wing Upper Windows (2) */}
        <g>
          {/* Right Upper 1 */}
          <rect x="352" y="278" width="26" height="22" rx="2" fill="url(#winGlass)" stroke="#ffffff" strokeWidth="2" />
          <line x1="365" y1="278" x2="365" y2="300" stroke="#ffffff" strokeWidth="1.5" />
          <line x1="352" y1="289" x2="378" y2="289" stroke="#ffffff" strokeWidth="1.5" />
          <rect x="350" y="300" width="30" height="2.5" rx="1" fill="#ffffff" />

          {/* Right Upper 2 */}
          <rect x="400" y="278" width="26" height="22" rx="2" fill="url(#winGlass)" stroke="#ffffff" strokeWidth="2" />
          <line x1="413" y1="278" x2="413" y2="300" stroke="#ffffff" strokeWidth="1.5" />
          <line x1="400" y1="289" x2="426" y2="289" stroke="#ffffff" strokeWidth="1.5" />
          <rect x="398" y="300" width="30" height="2.5" rx="1" fill="#ffffff" />
        </g>

        {/* Right Wing Lower Windows (2) */}
        <g>
          {/* Right Lower 1 */}
          <rect x="352" y="326" width="26" height="22" rx="2" fill="url(#winGlass)" stroke="#ffffff" strokeWidth="2" />
          <line x1="365" y1="326" x2="365" y2="348" stroke="#ffffff" strokeWidth="1.5" />
          <line x1="352" y1="337" x2="378" y2="337" stroke="#ffffff" strokeWidth="1.5" />
          <rect x="350" y="348" width="30" height="2.5" rx="1" fill="#ffffff" />

          {/* Right Lower 2 */}
          <rect x="400" y="326" width="26" height="22" rx="2" fill="url(#winGlass)" stroke="#ffffff" strokeWidth="2" />
          <line x1="413" y1="326" x2="413" y2="348" stroke="#ffffff" strokeWidth="1.5" />
          <line x1="400" y1="337" x2="426" y2="337" stroke="#ffffff" strokeWidth="1.5" />
          <rect x="398" y="348" width="30" height="2.5" rx="1" fill="#ffffff" />
        </g>

        {/* --- MAIN CENTER TOWER --- */}
        {/* Chimney on roof */}
        <rect x="348" y="180" width="15" height="28" fill="#dc2626" rx="1" />
        <rect x="345" y="177" width="21" height="4.5" fill="#991b1b" rx="1" />

        {/* Center Main Facade */}
        <rect x="238" y="210" width="124" height="170" fill="url(#wallGrad)" />

        {/* Center Gabled Roof */}
        <polygon points="198,225 300,158 402,225" fill="url(#roofGrad)" />
        {/* Roof Trims */}
        <polyline points="194,226 300,156 406,226" stroke="#ffffff" strokeWidth="4" strokeLinecap="round" />
        <polyline points="194,228 300,158 406,228" stroke="#b91c1c" strokeWidth="2" />

        {/* --- CLOCK TOWER ELEMENT --- */}
        <circle cx="300" cy="230" r="23" fill="#ffffff" stroke="#1e293b" strokeWidth="3" />
        <circle cx="300" cy="230" r="20" fill="#f8fafc" />
        {/* Hour dots */}
        <circle cx="300" cy="214" r="1.5" fill="#1e293b" />
        <circle cx="316" cy="230" r="1.5" fill="#1e293b" />
        <circle cx="300" cy="246" r="1.5" fill="#1e293b" />
        <circle cx="284" cy="230" r="1.5" fill="#1e293b" />
        {/* Clock Hands */}
        <line x1="300" y1="230" x2="300" y2="219" stroke="#0f172a" strokeWidth="2.5" strokeLinecap="round" />
        <line x1="300" y1="230" x2="309" y2="230" stroke="#0f172a" strokeWidth="2" strokeLinecap="round" />
        <circle cx="300" cy="230" r="2.5" fill="#dc2626" />

        {/* Center Tower Upper Windows */}
        <g>
          <rect x="260" y="270" width="25" height="22" rx="2" fill="url(#winGlass)" stroke="#ffffff" strokeWidth="2" />
          <line x1="272.5" y1="270" x2="272.5" y2="292" stroke="#ffffff" strokeWidth="1.5" />
          <line x1="260" y1="281" x2="285" y2="281" stroke="#ffffff" strokeWidth="1.5" />
          <rect x="258" y="292" width="29" height="2.5" rx="1" fill="#ffffff" />

          <rect x="315" y="270" width="25" height="22" rx="2" fill="url(#winGlass)" stroke="#ffffff" strokeWidth="2" />
          <line x1="327.5" y1="270" x2="327.5" y2="292" stroke="#ffffff" strokeWidth="1.5" />
          <line x1="315" y1="281" x2="340" y2="281" stroke="#ffffff" strokeWidth="1.5" />
          <rect x="313" y="292" width="29" height="2.5" rx="1" fill="#ffffff" />
        </g>

        {/* --- MAIN ENTRANCE PORTICO --- */}
        <polygon points="254,310 300,300 346,310" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1" />
        <rect x="256" y="310" width="88" height="5" rx="1" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1" />

        {/* Columns */}
        <rect x="264" y="315" width="7" height="56" fill="#ffffff" stroke="#e2e8f0" strokeWidth="1" />
        <rect x="262" y="315" width="11" height="3" fill="#ffffff" />
        <rect x="262" y="368" width="11" height="3" fill="#ffffff" />

        <rect x="329" y="315" width="7" height="56" fill="#ffffff" stroke="#e2e8f0" strokeWidth="1" />
        <rect x="327" y="315" width="11" height="3" fill="#ffffff" />
        <rect x="327" y="368" width="11" height="3" fill="#ffffff" />

        {/* Entrance Double Doors */}
        <rect x="277" y="319" width="46" height="52" rx="2" fill="#0f172a" />
        {/* Left Door */}
        <rect x="279" y="321" width="20" height="48" fill="#1e3a8a" />
        <rect x="282" y="324" width="14" height="20" fill="url(#doorGlass)" />
        <rect x="282" y="348" width="14" height="17" fill="#172554" />
        <circle cx="295" cy="346" r="1.5" fill="#f59e0b" />

        {/* Right Door */}
        <rect x="301" y="321" width="20" height="48" fill="#1e3a8a" />
        <rect x="304" y="324" width="14" height="20" fill="url(#doorGlass)" />
        <rect x="304" y="348" width="14" height="17" fill="#172554" />
        <circle cx="305" cy="346" r="1.5" fill="#f59e0b" />

        {/* Steps */}
        <rect x="252" y="371" width="96" height="4" rx="1" fill="#e2e8f0" />
        <rect x="246" y="375" width="108" height="4" rx="1" fill="#cbd5e1" />
        <rect x="240" y="379" width="120" height="5" rx="1" fill="#94a3b8" />

        {/* --- TREES & FOLIAGE --- */}
        {/* Mature Left Tree */}
        <g>
          <path d="M115 390 Q117 345 107 315 Q125 325 133 305 Q127 350 130 390 Z" fill="#78350f" />
          <path d="M107 315 Q90 290 80 285 Q100 290 115 310" stroke="#78350f" strokeWidth="4" strokeLinecap="round" />
          <path d="M130 315 Q150 295 160 290 Q145 300 130 320" stroke="#78350f" strokeWidth="4" strokeLinecap="round" />

          {/* Leaves */}
          <circle cx="80" cy="295" r="36" fill="url(#treeGrad1)" />
          <circle cx="122" cy="255" r="48" fill="url(#treeGrad2)" />
          <circle cx="158" cy="285" r="40" fill="url(#treeGrad1)" />
          <circle cx="98" cy="235" r="42" fill="url(#treeGrad2)" />
          <circle cx="118" cy="300" r="38" fill="url(#treeGrad1)" opacity="0.9" />
          <circle cx="65" cy="320" r="26" fill="url(#treeGrad2)" />
        </g>

        {/* Right Tree */}
        <g>
          <path d="M485 395 Q490 355 485 330 Q495 355 497 395 Z" fill="#78350f" />
          <circle cx="505" cy="300" r="42" fill="url(#treeGrad1)" />
          <circle cx="470" cy="315" r="36" fill="url(#treeGrad2)" />
          <circle cx="530" cy="325" r="32" fill="url(#treeGrad1)" />
          <circle cx="495" cy="265" r="38" fill="url(#treeGrad2)" />
        </g>

        {/* Symmetrical Entrance Shrubs */}
        <path d="M236 380 Q236 335 248 335 Q260 335 260 380 Z" fill="#16a34a" />
        <circle cx="248" cy="350" r="14" fill="#4ade80" opacity="0.6" />

        <path d="M340 380 Q340 335 352 335 Q364 335 364 380 Z" fill="#16a34a" />
        <circle cx="352" cy="350" r="14" fill="#4ade80" opacity="0.6" />

        {/* Base Bushes Along Wings */}
        <circle cx="145" cy="375" r="22" fill="url(#shrubGrad)" />
        <circle cx="172" cy="372" r="18" fill="#22c55e" />
        <circle cx="196" cy="374" r="20" fill="url(#shrubGrad)" />
        <circle cx="225" cy="370" r="23" fill="#16a34a" />

        <circle cx="375" cy="370" r="23" fill="#16a34a" />
        <circle cx="404" cy="374" r="20" fill="url(#shrubGrad)" />
        <circle cx="428" cy="372" r="18" fill="#22c55e" />
        <circle cx="455" cy="375" r="22" fill="url(#shrubGrad)" />

        {/* Foreground Lawn Shrubs */}
        <circle cx="115" cy="420" r="28" fill="url(#shrubGrad)" opacity="0.9" />
        <circle cx="150" cy="435" r="22" fill="#16a34a" />
        <circle cx="480" cy="425" r="30" fill="url(#shrubGrad)" opacity="0.9" />
        <circle cx="520" cy="440" r="24" fill="#16a34a" />

        {/* Hanging Foliage Top Right */}
        <g opacity="0.95">
          <path d="M600 0 Q530 35 470 25" stroke="#78350f" strokeWidth="3" fill="none" />
          <ellipse cx="530" cy="30" rx="16" ry="10" fill="#22c55e" transform="rotate(-15 530 30)" />
          <ellipse cx="500" cy="28" rx="14" ry="9" fill="#16a34a" transform="rotate(10 500 28)" />
          <ellipse cx="470" cy="28" rx="18" ry="11" fill="#4ade80" transform="rotate(-25 470 28)" />
          <ellipse cx="550" cy="45" rx="15" ry="9" fill="#15803d" transform="rotate(20 550 45)" />
          <ellipse cx="520" cy="50" rx="14" ry="8" fill="#22c55e" transform="rotate(-10 520 50)" />
          <ellipse cx="570" cy="25" rx="16" ry="10" fill="#16a34a" transform="rotate(15 570 25)" />
        </g>
      </svg>
    </div>
  );
}
