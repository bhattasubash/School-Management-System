import React from 'react';
import Navbar from './Navbar';
import HeroSection from './HeroSection';
import FeaturesGrid from './FeaturesGrid';
import RoleSection from './RoleSection';
import BenefitsSection from './BenefitsSection';
import CommunitySection from './CommunitySection';
import TestimonialsSection from './TestimonialsSection';
import FaqSection from './FaqSection';
import FinalCtaSection from './FinalCtaSection';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col font-sans selection:bg-blue-100 selection:text-blue-900">
      {/* 1. Header / Navigation */}
      <Navbar />

      <main className="flex-1">
        {/* 2. Hero Section */}
        <HeroSection />

        {/* 3. Features / Module Grid Section */}
        <FeaturesGrid />

        {/* 4. Designed for Everyone Section */}
        <RoleSection />

        {/* 5. Smarter Way to Manage Your School (Benefits + Dashboard Mockup) */}
        <BenefitsSection />

        {/* 6. Building Stronger School Communities (Statistics & Illustration) */}
        <CommunitySection />

        {/* 7. Testimonials Section */}
        <TestimonialsSection />

        {/* 8. FAQ Section */}
        <FaqSection />

        {/* 9. Final Call to Action */}
        <FinalCtaSection />
      </main>
    </div>
  );
}
