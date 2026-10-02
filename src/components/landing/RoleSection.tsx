import React from 'react';

// Crisp vector illustration for Student
function StudentVector() {
  return (
    <svg viewBox="0 0 160 160" fill="none" className="w-24 h-24 sm:w-28 sm:h-28 mx-auto">
      {/* Background Soft Circle */}
      <circle cx="80" cy="80" r="70" fill="#bae6fd" opacity="0.4" />
      {/* Backpack straps */}
      <path d="M42 98 Q40 120 48 150" stroke="#1e293b" strokeWidth="9" strokeLinecap="round" />
      <path d="M118 98 Q120 120 112 150" stroke="#1e293b" strokeWidth="9" strokeLinecap="round" />
      {/* Body / White Uniform Shirt */}
      <path d="M48 120 Q80 108 112 120 L118 160 L42 160 Z" fill="#ffffff" />
      <path d="M48 120 Q80 108 112 120" stroke="#e2e8f0" strokeWidth="2" />
      {/* Collar */}
      <polygon points="65,115 80,126 72,136" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="1.5" />
      <polygon points="95,115 80,126 88,136" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="1.5" />
      {/* Blue Tie */}
      <polygon points="76,126 84,126 87,155 80,160 73,155" fill="#1d8cfd" />
      {/* Neck */}
      <rect x="72" y="98" width="16" height="20" fill="#fca5a5" rx="3" />
      {/* Face & Ears */}
      <circle cx="56" cy="74" r="7" fill="#fca5a5" />
      <circle cx="104" cy="74" r="7" fill="#fca5a5" />
      <ellipse cx="80" cy="74" rx="24" ry="26" fill="#fca5a5" />
      {/* Rosy Cheeks */}
      <ellipse cx="68" cy="80" rx="5" ry="3" fill="#f87171" opacity="0.6" />
      <ellipse cx="92" cy="80" rx="5" ry="3" fill="#f87171" opacity="0.6" />
      {/* Smiling Mouth */}
      <path d="M72 84 Q80 94 88 84" fill="#ffffff" stroke="#991b1b" strokeWidth="1.5" strokeLinecap="round" />
      {/* Eyes & Eyebrows */}
      <ellipse cx="71" cy="72" rx="2.5" ry="3.5" fill="#0f172a" />
      <ellipse cx="89" cy="72" rx="2.5" ry="3.5" fill="#0f172a" />
      <path d="M66 65 Q71 63 76 65" stroke="#0f172a" strokeWidth="2" strokeLinecap="round" />
      <path d="M84 65 Q89 63 94 65" stroke="#0f172a" strokeWidth="2" strokeLinecap="round" />
      {/* Dark Wavy Hair */}
      <path
        d="M56 68 Q52 50 68 44 Q80 40 92 44 Q108 50 104 68 Q98 52 80 52 Q62 52 56 68 Z"
        fill="#0f172a"
      />
      <circle cx="64" cy="52" r="14" fill="#0f172a" />
      <circle cx="80" cy="46" r="15" fill="#0f172a" />
      <circle cx="96" cy="52" r="14" fill="#0f172a" />
    </svg>
  );
}

// Crisp vector illustration for Teacher
function TeacherVector() {
  return (
    <svg viewBox="0 0 160 160" fill="none" className="w-24 h-24 sm:w-28 sm:h-28 mx-auto">
      {/* Background Soft Circle */}
      <circle cx="80" cy="80" r="70" fill="#e9d5ff" opacity="0.4" />
      {/* Pointer Stick */}
      <line x1="120" y1="110" x2="148" y2="60" stroke="#78350f" strokeWidth="3" strokeLinecap="round" />
      {/* Hand holding stick */}
      <circle cx="120" cy="110" r="6" fill="#fca5a5" />
      {/* Body / Coat & Teal Blouse */}
      <path d="M46 122 Q80 112 114 122 L120 160 L40 160 Z" fill="#0284c7" />
      {/* White Cardigan / Coat Over */}
      <path d="M46 122 Q58 135 64 160 L40 160 Z" fill="#ffffff" />
      <path d="M114 122 Q102 135 96 160 L120 160 Z" fill="#ffffff" />
      {/* Blue Lesson Book Held */}
      <rect x="66" y="125" width="28" height="35" rx="3" fill="#1d8cfd" transform="rotate(-8 66 125)" />
      <rect x="69" y="127" width="4" height="32" rx="1" fill="#ffffff" transform="rotate(-8 69 127)" />
      {/* Neck */}
      <rect x="73" y="98" width="14" height="20" fill="#fca5a5" rx="2" />
      {/* Face & Hair */}
      <ellipse cx="80" cy="74" rx="22" ry="24" fill="#fca5a5" />
      <circle cx="58" cy="75" r="5" fill="#fca5a5" />
      <circle cx="102" cy="75" r="5" fill="#fca5a5" />
      {/* Rosy Cheeks */}
      <ellipse cx="69" cy="80" rx="4" ry="2.5" fill="#f87171" opacity="0.5" />
      <ellipse cx="91" cy="80" rx="4" ry="2.5" fill="#f87171" opacity="0.5" />
      {/* Friendly Smile */}
      <path d="M73 85 Q80 93 87 85" fill="#ffffff" stroke="#991b1b" strokeWidth="1.5" strokeLinecap="round" />
      {/* Eyes & Eyebrows */}
      <ellipse cx="71" cy="73" rx="2.5" ry="3.5" fill="#0f172a" />
      <ellipse cx="89" cy="73" rx="2.5" ry="3.5" fill="#0f172a" />
      <path d="M67 67 Q71 65 75 67" stroke="#0f172a" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M85 67 Q89 65 93 67" stroke="#0f172a" strokeWidth="1.8" strokeLinecap="round" />
      {/* Long Flowing Black Hair */}
      <path
        d="M54 75 Q48 95 56 120 Q64 125 64 110 Q58 85 60 70 Z"
        fill="#0f172a"
      />
      <path
        d="M106 75 Q112 95 104 120 Q96 125 96 110 Q102 85 100 70 Z"
        fill="#0f172a"
      />
      <circle cx="80" cy="52" r="24" fill="#0f172a" />
      {/* Side bangs */}
      <path d="M58 56 Q75 60 80 70 Q75 52 58 56 Z" fill="#1e293b" />
    </svg>
  );
}

// Crisp vector illustration for Administrator
function AdminVector() {
  return (
    <svg viewBox="0 0 160 160" fill="none" className="w-24 h-24 sm:w-28 sm:h-28 mx-auto">
      {/* Background Soft Circle */}
      <circle cx="80" cy="80" r="70" fill="#fde68a" opacity="0.4" />
      {/* Dark Navy Business Suit */}
      <path d="M44 120 Q80 112 116 120 L122 160 L38 160 Z" fill="#0f172a" />
      {/* White Dress Shirt V-Neck */}
      <polygon points="70,118 90,118 80,148" fill="#ffffff" />
      {/* Blue Executive Tie */}
      <polygon points="78,122 82,122 85,155 80,160 75,155" fill="#1d8cfd" />
      {/* Suit Lapels */}
      <polygon points="56,120 70,140 64,160 44,120" fill="#1e293b" />
      <polygon points="104,120 90,140 96,160 116,120" fill="#1e293b" />
      {/* Neck */}
      <rect x="72" y="96" width="16" height="22" fill="#fca5a5" rx="3" />
      {/* Face & Ears */}
      <ellipse cx="80" cy="74" rx="22" ry="25" fill="#fca5a5" />
      <circle cx="58" cy="76" r="6" fill="#fca5a5" />
      <circle cx="102" cy="76" r="6" fill="#fca5a5" />
      {/* Professional Confident Smile */}
      <path d="M72 85 Q80 94 88 85" fill="#ffffff" stroke="#991b1b" strokeWidth="1.5" strokeLinecap="round" />
      {/* Eyes & Eyebrows */}
      <ellipse cx="71" cy="73" rx="2.5" ry="3.5" fill="#0f172a" />
      <ellipse cx="89" cy="73" rx="2.5" ry="3.5" fill="#0f172a" />
      <path d="M66 66 Q71 64 76 66" stroke="#0f172a" strokeWidth="2.2" strokeLinecap="round" />
      <path d="M84 66 Q89 64 94 66" stroke="#0f172a" strokeWidth="2.2" strokeLinecap="round" />
      {/* Short Neat Black Hair parted neatly */}
      <path
        d="M58 70 Q54 48 74 44 Q88 42 102 48 Q106 62 102 70 Q98 52 80 50 Q64 52 58 70 Z"
        fill="#0f172a"
      />
      <circle cx="70" cy="50" r="14" fill="#0f172a" />
      <circle cx="86" cy="48" r="15" fill="#0f172a" />
    </svg>
  );
}

export default function RoleSection() {
  const roles = [
    {
      id: 'students',
      title: 'For Students',
      description: 'Access classes, assignments, results and more.',
      bgGradient: 'bg-gradient-to-b from-[#e0f7fa] to-white',
      vector: <StudentVector />,
    },
    {
      id: 'teachers',
      title: 'For Teachers',
      description: 'Manage classes, attendance, exams and communicate.',
      bgGradient: 'bg-gradient-to-b from-[#f3e8ff] to-white',
      vector: <TeacherVector />,
    },
    {
      id: 'administrators',
      title: 'For Administrators',
      description: 'Oversee all operations with powerful tools.',
      bgGradient: 'bg-gradient-to-b from-[#fef3c7] to-white',
      vector: <AdminVector />,
    },
  ];

  return (
    <section className="py-16 sm:py-20 bg-[#edf6fd]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          {/* Left Column: Heading & Description */}
          <div className="lg:col-span-5 text-left">
            <h2 className="text-[32px] sm:text-[40px] font-black text-slate-900 tracking-[-0.03em] leading-[1.15]">
              Designed for
              <br />
              <span className="text-[#1d8cfd]">Everyone in Your School</span>
            </h2>
            <p className="mt-4 text-[15px] sm:text-[16px] text-slate-600 leading-relaxed max-w-md">
              A seamless experience for students, teachers, administrators with role-based access
              and features.
            </p>
          </div>

          {/* Right Column: 3 Role Cards Aligned Horizontally */}
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-3 gap-5">
            {roles.map((role) => (
              <div
                key={role.id}
                className="bg-white rounded-2xl border border-slate-100/80 shadow-[0_4px_20px_rgba(15,23,42,0.04)] overflow-hidden flex flex-col text-center transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_8px_25px_rgba(15,23,42,0.07)]"
              >
                {/* Upper Character Artwork Area */}
                <div className={`pt-6 pb-4 px-4 ${role.bgGradient} flex items-center justify-center`}>
                  {role.vector}
                </div>

                {/* Content Area */}
                <div className="p-5 flex-1 flex flex-col justify-center">
                  <h3 className="text-[16px] font-bold text-[#1d8cfd] leading-tight">
                    {role.title}
                  </h3>
                  <p className="mt-2 text-[12.5px] text-slate-500 leading-relaxed">
                    {role.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
