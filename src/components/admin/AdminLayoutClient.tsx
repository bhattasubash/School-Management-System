'use client';

import React, { useState } from 'react';
import AdminSidebar from './AdminSidebar';
import AdminHeader from './AdminHeader';

interface AdminLayoutClientProps {
  children: React.ReactNode;
  schoolName: string;
  board: string;
  academicYear: string;
  adminName: string;
  adminEmail: string;
  role: string;
}

export default function AdminLayoutClient({
  children,
  schoolName,
  board,
  academicYear,
  adminName,
  adminEmail,
  role,
}: AdminLayoutClientProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#D8EEFE] via-[#E6F3FE] to-[#EDF6FD] text-[#0F172A] font-sans antialiased selection:bg-[#0B72E7]/20 selection:text-[#0B72E7] relative">
      {/* Floating Standalone Left Sidebar */}
      <AdminSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        schoolName={schoolName}
        tagline="Learn · Grow · Excel"
      />

      {/* Main Content Area offset by Sidebar on desktop */}
      <div className="lg:pl-[304px] flex flex-col min-h-screen p-3 md:p-4">
        {/* Top Header */}
        <AdminHeader
          onToggleSidebar={() => setSidebarOpen((prev) => !prev)}
          adminName="Admin"
          adminEmail={adminEmail}
          role={role}
        />

        {/* Dynamic Page Content */}
        <main className="flex-1 w-full max-w-[1536px] mx-auto py-2.5 space-y-4">
          {children}
        </main>
      </div>
    </div>
  );
}
