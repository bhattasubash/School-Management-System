import React from 'react';

interface Testimonial {
  id: string;
  quote: string;
  name: string;
  institution: string;
  avatarVector: React.ReactNode;
}

const testimonials: Testimonial[] = [
  {
    id: 'sharma',
    quote:
      '“Sunrise has completely transformed how we manage our school. It’s simple, powerful and reliable.”',
    name: 'Principal Sharma',
    institution: 'Green Valley School',
    avatarVector: (
      <svg viewBox="0 0 48 48" className="w-full h-full">
        <circle cx="24" cy="24" r="24" fill="#e2e8f0" />
        <circle cx="24" cy="18" r="8" fill="#fca5a5" />
        <path d="M16 18 Q16 11 24 11 Q32 11 32 18 Q30 13 24 13 Q18 13 16 18 Z" fill="#1e293b" />
        <path d="M12 40 Q24 30 36 40 Z" fill="#0284c7" />
        <polygon points="21,34 27,34 24,40" fill="#ffffff" />
      </svg>
    ),
  },
  {
    id: 'mehta',
    quote:
      '“The platform makes communication with parents so easy. Our teachers love it!”',
    name: 'Ms. Priya Mehta',
    institution: 'Bright Future Academy',
    avatarVector: (
      <svg viewBox="0 0 48 48" className="w-full h-full">
        <circle cx="24" cy="24" r="24" fill="#fce7f3" />
        <circle cx="24" cy="19" r="8" fill="#fca5a5" />
        <path d="M15 22 Q13 32 18 36 Q19 28 17 21 Z" fill="#0f172a" />
        <path d="M33 22 Q35 32 30 36 Q29 28 31 21 Z" fill="#0f172a" />
        <circle cx="24" cy="15" r="9" fill="#0f172a" />
        <path d="M12 42 Q24 32 36 42 Z" fill="#ec4899" />
      </svg>
    ),
  },
  {
    id: 'kumar',
    quote:
      '“Excellent support and great features. Highly recommended for any school looking to go digital.”',
    name: 'Mr. Rakesh Kumar',
    institution: 'Delhi Public School',
    avatarVector: (
      <svg viewBox="0 0 48 48" className="w-full h-full">
        <circle cx="24" cy="24" r="24" fill="#fef3c7" />
        <circle cx="24" cy="18" r="8" fill="#fca5a5" />
        <path d="M16 17 Q17 11 24 11 Q31 11 32 17 Q30 13 24 13 Q18 13 16 17 Z" fill="#0f172a" />
        <path d="M11 41 Q24 31 37 41 Z" fill="#0f172a" />
        <polygon points="21,34 27,34 24,41" fill="#1d8cfd" />
      </svg>
    ),
  },
];

export default function TestimonialsSection() {
  return (
    <section id="testimonials" className="py-16 sm:py-24 bg-[#f8fbff]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="text-[30px] sm:text-[38px] font-black text-slate-900 tracking-[-0.03em] leading-tight">
            What Schools Say <span className="text-[#1d8cfd]">About Us</span>
          </h2>
          <p className="mt-3 text-[14px] sm:text-[15px] text-slate-500 max-w-lg mx-auto leading-relaxed">
            Trusted by educational institutions across the country.
          </p>
        </div>

        {/* 3 Testimonial Cards */}
        <div className="mt-12 sm:mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-7">
          {testimonials.map((t) => (
            <div
              key={t.id}
              className="bg-white rounded-2xl p-7 border border-slate-100 shadow-[0_4px_20px_rgba(15,23,42,0.03)] flex flex-col justify-between hover:shadow-[0_8px_30px_rgba(15,23,42,0.06)] transition-all duration-200 text-left"
            >
              <p className="text-[14px] sm:text-[14.5px] text-slate-600 leading-relaxed italic">
                {t.quote}
              </p>

              <div className="mt-7 pt-4 border-t border-slate-50 flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-full overflow-hidden relative border-2 border-blue-100 flex-shrink-0">
                  {t.avatarVector}
                </div>
                <div>
                  <h3 className="text-[14px] font-bold text-slate-900 leading-tight">
                    {t.name}
                  </h3>
                  <p className="text-[12px] font-medium text-slate-400 leading-tight mt-0.5">
                    {t.institution}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Carousel Pagination Dots */}
        <div className="mt-9 flex items-center justify-center gap-2" aria-hidden="true">
          <span className="w-6 h-2 rounded-full bg-[#1d8cfd] transition-all" />
          <span className="w-2 h-2 rounded-full bg-slate-200" />
          <span className="w-2 h-2 rounded-full bg-slate-200" />
          <span className="w-2 h-2 rounded-full bg-slate-200" />
        </div>
      </div>
    </section>
  );
}
