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
    <div className="min-h-screen bg-[#F4F8FA] text-[#111C2D] font-sans antialiased selection:bg-[#FF7555]/20 selection:text-[#FF7555]">
      {/* Sidebar */}
      <AdminSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        schoolName={schoolName}
        board={board}
        academicYear={academicYear}
      />

      {/* Main Content Shell offset by Sidebar on desktop */}
      <div className="lg:pl-64 md:lg:pl-72 flex flex-col min-h-screen">
        {/* Global Admin Header */}
        <AdminHeader
          onToggleSidebar={() => setSidebarOpen((prev) => !prev)}
          adminName={adminName}
          adminEmail={adminEmail}
          role={role}
        />

        {/* Dynamic Page Content */}
        <main className="flex-1 p-4 md:p-8 max-w-[1440px] w-full mx-auto space-y-6">
          {children}
        </main>
      </div>
    </div>
  );
}
