import React from 'react';

function CommunityIllustration() {
  return (
    <svg
      viewBox="0 0 340 220"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full max-w-[380px] h-auto drop-shadow-sm select-none"
    >
      <defs>
        <linearGradient id="teacherBlouse" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f59e0b" />
          <stop offset="100%" stopColor="#d97706" />
        </linearGradient>
        <linearGradient id="laptopGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#334155" />
          <stop offset="100%" stopColor="#0f172a" />
        </linearGradient>
        <linearGradient id="plantLeaf" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#4ade80" />
          <stop offset="100%" stopColor="#16a34a" />
        </linearGradient>
      </defs>

      {/* Desk Surface */}
      <rect x="10" y="195" width="320" height="8" rx="3" fill="#e2e8f0" />
      <line x1="20" y1="203" x2="320" y2="203" stroke="#cbd5e1" strokeWidth="2" />

      {/* Background Bush on Left */}
      <circle cx="45" cy="165" r="28" fill="#86efac" opacity="0.7" />
      <circle cx="25" cy="180" r="22" fill="#4ade80" opacity="0.8" />

      {/* --- STUDENT (Left) --- */}
      {/* Student Chair Back */}
      <rect x="42" y="145" width="30" height="50" rx="8" fill="#334155" />
      {/* Student Body (White Uniform Shirt) */}
      <path d="M52 165 Q80 156 95 165 L98 198 L48 198 Z" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1" />
      {/* Blue Tie */}
      <polygon points="72,170 78,170 80,195 75,198 70,195" fill="#1d8cfd" />
      {/* Student Neck */}
      <rect x="70" y="152" width="10" height="15" fill="#fca5a5" rx="2" />
      {/* Student Face */}
      <ellipse cx="75" cy="135" rx="16" ry="18" fill="#fca5a5" />
      <circle cx="58" cy="136" r="4" fill="#fca5a5" />
      <circle cx="92" cy="136" r="4" fill="#fca5a5" />
      {/* Student Smile & Eyes */}
      <path d="M70 143 Q75 149 80 143" fill="#ffffff" stroke="#991b1b" strokeWidth="1.2" strokeLinecap="round" />
      <circle cx="69" cy="134" r="2" fill="#0f172a" />
      <circle cx="81" cy="134" r="2" fill="#0f172a" />
      {/* Student Dark Wavy Hair */}
      <path d="M58 132 Q54 115 75 112 Q94 114 92 132 Q88 120 75 120 Q62 120 58 132 Z" fill="#0f172a" />
      <circle cx="68" cy="118" r="10" fill="#0f172a" />
      <circle cx="82" cy="118" r="10" fill="#0f172a" />

      {/* --- TEACHER (Center-Right) --- */}
      {/* Teacher Body (Yellow Blouse) */}
      <path d="M125 150 Q160 138 195 150 L205 198 L115 198 Z" fill="url(#teacherBlouse)" />
      {/* Teacher Neck */}
      <rect x="155" y="112" width="14" height="20" fill="#fca5a5" rx="3" />
      {/* Teacher Face */}
      <ellipse cx="162" cy="98" rx="20" ry="22" fill="#fca5a5" />
      <circle cx="141" cy="100" r="4.5" fill="#fca5a5" />
      <circle cx="183" cy="100" r="4.5" fill="#fca5a5" />
      {/* Teacher Cheeks & Smile */}
      <ellipse cx="152" cy="104" rx="4" ry="2.5" fill="#f87171" opacity="0.5" />
      <ellipse cx="172" cy="104" rx="4" ry="2.5" fill="#f87171" opacity="0.5" />
      <path d="M156 108 Q162 115 168 108" fill="#ffffff" stroke="#991b1b" strokeWidth="1.3" strokeLinecap="round" />
      <ellipse cx="154" cy="98" rx="2" ry="2.8" fill="#0f172a" />
      <ellipse cx="170" cy="98" rx="2" ry="2.8" fill="#0f172a" />
      <path d="M150 93 Q154 91 158 93" stroke="#0f172a" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M166 93 Q170 91 174 93" stroke="#0f172a" strokeWidth="1.5" strokeLinecap="round" />
      {/* Teacher Long Dark Hair */}
      <path d="M141 102 Q132 125 138 150 Q146 150 146 135 Q140 115 144 100 Z" fill="#0f172a" />
      <path d="M183 102 Q192 125 186 150 Q178 150 178 135 Q184 115 180 100 Z" fill="#0f172a" />
      <circle cx="162" cy="78" r="22" fill="#0f172a" />
      {/* Teacher Right Arm Pointing at Laptop Screen */}
      <path d="M195 155 Q215 165 242 152" stroke="#f59e0b" strokeWidth="12" strokeLinecap="round" />
      <path d="M236 152 L250 145" stroke="#fca5a5" strokeWidth="6" strokeLinecap="round" />

      {/* --- LAPTOP --- */}
      {/* Laptop Screen (angled open) */}
      <polygon points="175,152 235,148 245,190 185,195" fill="url(#laptopGrad)" />
      {/* Laptop Screen Display (lit blue) */}
      <polygon points="180,155 232,152 240,186 188,189" fill="#38bdf8" />
      <line x1="192" y1="162" x2="225" y2="160" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" />
      <line x1="192" y1="170" x2="215" y2="168" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" />
      {/* Laptop Keyboard Base */}
      <polygon points="182,194 252,190 260,198 185,200" fill="#64748b" />

      {/* --- POTTED PLANT (Right) --- */}
      {/* Terracotta Pot */}
      <polygon points="275,180 305,180 300,202 280,202" fill="#b45309" />
      <rect x="272" y="177" width="36" height="5" rx="1.5" fill="#d97706" />
      {/* Plant Leaves */}
      <path d="M290 177 Q275 155 272 135 Q285 145 290 177 Z" fill="url(#plantLeaf)" />
      <path d="M290 177 Q290 145 290 125 Q296 145 290 177 Z" fill="#22c55e" />
      <path d="M290 177 Q305 155 310 135 Q298 145 290 177 Z" fill="url(#plantLeaf)" />
      <path d="M290 177 Q265 168 255 160 Q272 165 290 177 Z" fill="#16a34a" />
      <path d="M290 177 Q315 168 325 160 Q308 165 290 177 Z" fill="#16a34a" />
    </svg>
  );
}

export default function CommunitySection() {
  const stats = [
    { value: '500+', label: 'Schools Trust Us' },
    { value: '100K+', label: 'Students Managed' },
    { value: '10M+', label: 'Attendance Records' },
    { value: '99.9%', label: 'Uptime & Security' },
  ];

  return (
    <section className="py-14 sm:py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-[#edfdef] rounded-3xl sm:rounded-[36px] p-8 sm:p-12 lg:p-14 border border-emerald-100/80 shadow-[0_10px_35px_rgba(16,185,129,0.04)]">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            {/* Left Column: Teacher & Student Artwork */}
            <div className="lg:col-span-5 flex justify-center lg:justify-start">
              <CommunityIllustration />
            </div>

            {/* Right Column: Heading, Subtitle & 4 Stats */}
            <div className="lg:col-span-7 text-left">
              <h2 className="text-[30px] sm:text-[38px] font-black text-slate-900 tracking-[-0.03em] leading-[1.15]">
                Building Stronger
                <br />
                <span className="text-[#1d8cfd]">School Communities</span>
              </h2>
              <p className="mt-3.5 text-[15px] sm:text-[16px] text-slate-600 leading-relaxed max-w-xl">
                Better communication, greater engagement, and improved learning outcomes for
                everyone.
              </p>

              {/* 4 Statistics Horizontally */}
              <div className="mt-10 grid grid-cols-2 sm:grid-cols-4 gap-6 sm:gap-4 pt-4 border-t border-emerald-200/60">
                {stats.map((stat) => (
                  <div key={stat.label}>
                    <div className="text-[28px] sm:text-[32px] font-black text-[#1d8cfd] tracking-tight leading-none font-mono">
                      {stat.value}
                    </div>
                    <div className="mt-2 text-[12.5px] font-semibold text-slate-700 leading-tight">
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
