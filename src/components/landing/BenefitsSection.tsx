import React from 'react';
import Link from 'next/link';
import { ArrowRight, Clock, Users, Zap, BarChart3 } from 'lucide-react';
import DashboardMockup from './DashboardMockup';

export default function BenefitsSection() {
  const benefits = [
    {
      id: 'save-time',
      title: 'Save Time',
      description: 'Automate daily tasks and reduce manual work.',
      icon: Clock,
      iconColor: 'text-emerald-600',
      bgColor: 'bg-emerald-100/70',
    },
    {
      id: 'improve-communication',
      title: 'Improve Communication',
      description: 'Stay connected with students, parents and staff.',
      icon: Users,
      iconColor: 'text-[#1d8cfd]',
      bgColor: 'bg-blue-100/70',
    },
    {
      id: 'increase-efficiency',
      title: 'Increase Efficiency',
      description: 'Manage everything from one integrated platform.',
      icon: Zap,
      iconColor: 'text-amber-500',
      bgColor: 'bg-amber-100/70',
    },
    {
      id: 'data-driven',
      title: 'Data-Driven Decisions',
      description: 'Get detailed reports and insights.',
      icon: BarChart3,
      iconColor: 'text-purple-600',
      bgColor: 'bg-purple-100/70',
    },
  ];

  return (
    <section id="why-us" className="py-16 sm:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-14 items-center">
          {/* Left Column: Heading, 4 Benefit Items & CTA */}
          <div className="lg:col-span-5 text-left">
            <h2 className="text-[32px] sm:text-[40px] font-black text-slate-900 tracking-[-0.03em] leading-[1.15]">
              A Smarter Way to
              <br />
              <span className="text-[#1d8cfd]">Manage Your School</span>
            </h2>
            <p className="mt-4 text-[15px] sm:text-[16px] text-slate-500 leading-relaxed max-w-md">
              Powerful, intuitive and built for modern educational institutions.
            </p>

            {/* 4 Benefit Rows */}
            <div className="mt-8 space-y-6">
              {benefits.map((benefit) => {
                const Icon = benefit.icon;
                return (
                  <div key={benefit.id} className="flex items-start gap-4">
                    <div
                      className={`w-11 h-11 rounded-2xl ${benefit.bgColor} flex items-center justify-center flex-shrink-0 mt-0.5 shadow-xs`}
                    >
                      <Icon className={`w-5 h-5 ${benefit.iconColor} stroke-[2.2]`} />
                    </div>
                    <div>
                      <h3 className="text-[15px] font-bold text-slate-900 leading-snug">
                        {benefit.title}
                      </h3>
                      <p className="text-[13px] text-slate-500 leading-relaxed mt-0.5">
                        {benefit.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Action CTA */}
            <div className="mt-10">
              <Link
                href="/login"
                className="inline-flex items-center gap-2.5 px-6 py-3.5 text-[14.5px] font-semibold text-white bg-[#1d8cfd] hover:bg-blue-600 active:bg-blue-700 rounded-xl shadow-[0_4px_14px_rgba(29,140,253,0.3)] hover:shadow-[0_6px_20px_rgba(29,140,253,0.4)] transition-all duration-150 transform hover:-translate-y-0.5"
              >
                <span>Explore All Features</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Right Column: Product UI Mockup */}
          <div className="lg:col-span-7 flex justify-center">
            <DashboardMockup />
          </div>
        </div>
      </div>
    </section>
  );
}
