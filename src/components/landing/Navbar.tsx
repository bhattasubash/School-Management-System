'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { BookOpen, Menu, X } from 'lucide-react';

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { label: 'Features', href: '#features' },
    { label: 'Why Us', href: '#why-us' },
    { label: 'Modules', href: '#modules' },
    { label: 'Pricing', href: '#pricing' },
    { label: 'Testimonials', href: '#testimonials' },
    { label: 'FAQ', href: '#faq' },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-slate-100 shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-[68px]">
          {/* Logo Brand */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 group-hover:scale-105 transition-transform duration-200 shadow-xs">
              <svg
                viewBox="0 0 24 24"
                className="w-6 h-6 fill-current text-blue-600"
                aria-hidden="true"
              >
                <path d="M12 4.5C10.5 3.5 8 3 4 3v14c4 0 6.5.5 8 1.5 1.5-1 4-1.5 8-1.5V3c-4 0-6.5.5-8 1.5zm0 13.5c-1.5-1-4-1.5-7-1.5V5c3 0 5 .5 7 1.5v11.5zm1-11.5c2-1 4-1.5 7-1.5v11.5c-3 0-5.5.5-7 1.5V6.5z" />
              </svg>
            </div>
            <div className="flex flex-col">
              <span className="text-[15px] font-bold text-slate-900 tracking-tight leading-tight group-hover:text-blue-600 transition-colors">
                Sunrise Public School
              </span>
              <span className="text-[11px] font-medium text-slate-400 tracking-wide">
                Learn • Grow • Excel
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-7 lg:gap-8">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="text-[13.5px] font-medium text-slate-600 hover:text-blue-600 transition-colors"
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Action CTA Button */}
          <div className="hidden md:flex items-center">
            <Link
              href="/login"
              className="inline-flex items-center justify-center px-5 py-2 text-[13.5px] font-semibold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-xl shadow-[0_2px_8px_rgba(37,99,235,0.25)] hover:shadow-[0_4px_12px_rgba(37,99,235,0.35)] transition-all duration-150"
            >
              Get Started
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-200 bg-white px-4 pt-3 pb-5 space-y-2 animate-in fade-in slide-in-from-top-2 duration-150">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-blue-50 hover:text-blue-600"
            >
              {link.label}
            </a>
          ))}
          <div className="pt-2">
            <Link
              href="/login"
              className="block w-full text-center px-4 py-2.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm"
              onClick={() => setMobileMenuOpen(false)}
            >
              Get Started
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
