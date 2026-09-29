'use client';

import React, { useState } from 'react';
import SuperAdminSidebar from './SuperAdminSidebar';
import SuperAdminHeader from './SuperAdminHeader';

interface SuperAdminLayoutClientProps {
  adminName: string;
  adminEmail: string;
  children: React.ReactNode;
}

export default function SuperAdminLayoutClient({
  adminName,
  adminEmail,
  children,
}: SuperAdminLayoutClientProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#F4F6F9] text-slate-800">
      <SuperAdminSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        adminName={adminName}
        adminEmail={adminEmail}
      />

      <div className="lg:pl-72 flex flex-col min-h-screen">
        <SuperAdminHeader
          onToggleSidebar={() => setSidebarOpen((prev) => !prev)}
          adminName={adminName}
        />

        <main className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full">
          {children}
        </main>
      </div>
    </div>
  );
}
