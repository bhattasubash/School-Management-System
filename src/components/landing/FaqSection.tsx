'use client';

import React, { useState } from 'react';
import { Plus, Minus } from 'lucide-react';

interface FAQ {
  id: string;
  question: string;
  answer: string;
}

const leftFaqs: FAQ[] = [
  {
    id: 'faq-1',
    question: 'Is the software easy to use?',
    answer:
      'Yes, Sunrise Public School ERP is designed with an intuitive, clean interface for administrators, teachers, parents, and students. Most schools get up and running with minimal training.',
  },
  {
    id: 'faq-2',
    question: 'Can we migrate our existing data?',
    answer:
      'Yes! We provide bulk Excel/CSV import tools along with automated migration assistance to seamlessly import all student records, faculty data, fee structures, and historical grades.',
  },
  {
    id: 'faq-3',
    question: 'Is our data secure?',
    answer:
      'Security is our highest priority. All data is protected with bank-grade 256-bit encryption in transit and at rest, multi-tenant database isolation, automated daily backups, and strict role-based access control.',
  },
];

const rightFaqs: FAQ[] = [
  {
    id: 'faq-4',
    question: 'Can parents access the platform?',
    answer:
      'Yes, parents receive dedicated web and mobile access to track real-time attendance, homework assignments, report cards, fee dues, bus tracking, and direct teacher communications.',
  },
  {
    id: 'faq-5',
    question: 'Do you provide customer support?',
    answer:
      'We provide dedicated 24/7 technical assistance, onboarding workshops for staff, live chat support, and an extensive documentation knowledge base.',
  },
  {
    id: 'faq-6',
    question: 'Can it be customized for our school?',
    answer:
      'Yes, the platform includes custom branding, grading scales (CBSE, ICSE, State Boards), fee structures, timetable algorithms, and configurable approval workflows tailored to your institution.',
  },
];

export default function FaqSection() {
  const [openIds, setOpenIds] = useState<Record<string, boolean>>({});

  const toggleFaq = (id: string) => {
    setOpenIds((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const renderFaqItem = (faq: FAQ) => {
    const isOpen = !!openIds[faq.id];
    return (
      <div
        key={faq.id}
        className="bg-white border border-slate-200/90 rounded-xl overflow-hidden transition-all duration-200 hover:border-blue-300 shadow-xs"
      >
        <button
          type="button"
          onClick={() => toggleFaq(faq.id)}
          className="w-full px-5 py-4 flex items-center justify-between text-left gap-4 transition-colors"
          aria-expanded={isOpen}
        >
          <span className="text-[14px] sm:text-[15px] font-semibold text-slate-800 leading-snug">
            {faq.question}
          </span>
          <span className="w-6 h-6 rounded-full bg-slate-50 flex items-center justify-center flex-shrink-0 text-slate-400 group-hover:text-blue-600 transition-colors">
            {isOpen ? (
              <Minus className="w-4 h-4 text-blue-600 stroke-[2.5]" />
            ) : (
              <Plus className="w-4 h-4 text-slate-500 stroke-[2.5]" />
            )}
          </span>
        </button>

        {isOpen && (
          <div className="px-5 pb-4 pt-1 text-[13px] sm:text-[13.5px] text-slate-600 leading-relaxed border-t border-slate-100/80 animate-in fade-in duration-200">
            {faq.answer}
          </div>
        )}
      </div>
    );
  };

  return (
    <section id="faq" className="py-16 sm:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header with "View All FAQs" Button */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-5 border-b border-slate-100 pb-8">
          <div>
            <h2 className="text-[30px] sm:text-[38px] font-black text-slate-900 tracking-[-0.03em] leading-tight">
              Frequently <span className="text-[#1d8cfd]">Asked Questions</span>
            </h2>
            <p className="mt-2 text-[14px] sm:text-[15px] text-slate-500 max-w-lg leading-relaxed">
              Everything you need to know about our school management software.
            </p>
          </div>
          <div>
            <a
              href="#faq"
              className="inline-flex items-center justify-center px-4 py-2 text-[13.5px] font-semibold text-[#1d8cfd] bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors"
            >
              View All FAQs
            </a>
          </div>
        </div>

        {/* 2-Column FAQ Grid */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5">
          {/* Left Column */}
          <div className="space-y-4">{leftFaqs.map(renderFaqItem)}</div>

          {/* Right Column */}
          <div className="space-y-4">{rightFaqs.map(renderFaqItem)}</div>
        </div>
      </div>
    </section>
  );
}
