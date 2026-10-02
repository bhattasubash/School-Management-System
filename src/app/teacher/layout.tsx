import React from 'react';
import { getSessionFromCookies } from '@/lib/session';
import { Role } from '@/types';
import { redirect } from 'next/navigation';
import { TeacherSidebar } from '@/components/teacher/TeacherSidebar';
import { TeacherHeader } from '@/components/teacher/TeacherHeader';
import { prisma } from '@/lib/db';

export const metadata = {
  title: 'Teacher Portal | Sunrise Public School',
  description: 'Faculty workspace and management system',
};

export default async function TeacherPortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSessionFromCookies();

  // In development, allow seamless preview if no session cookie exists
  let effectiveSession = session;
  if (!effectiveSession && process.env.NODE_ENV === 'development') {
    try {
      const demoTeacher = await prisma.user.findFirst({
        where: { role: Role.TEACHER },
      });
      if (demoTeacher) {
        effectiveSession = {
          sub: demoTeacher.id,
          tenantId: demoTeacher.tenantId || 'dps',
          role: Role.TEACHER,
          firstName: demoTeacher.firstName || 'Sanjay',
          lastName: demoTeacher.lastName || 'Yadav',
          email: demoTeacher.email,
        };
      } else {
        effectiveSession = {
          sub: 'dev-teacher',
          tenantId: 'dev-tenant',
          role: Role.TEACHER,
          firstName: 'Sanjay',
          lastName: 'Yadav',
          email: 'teacher@dps.edu.in',
        };
      }
    } catch {
      effectiveSession = {
        sub: 'dev-teacher',
        tenantId: 'dev-tenant',
        role: Role.TEACHER,
        firstName: 'Sanjay',
        lastName: 'Yadav',
        email: 'teacher@dps.edu.in',
      };
    }
  }

  if (!effectiveSession) {
    redirect('/login?redirect=/teacher');
  }

  if (
    effectiveSession.role !== Role.TEACHER &&
    effectiveSession.role !== Role.SUPER_ADMIN &&
    effectiveSession.role !== Role.ADMIN
  ) {
    redirect('/unauthorized');
  }

  const teacherName =
    effectiveSession.firstName && effectiveSession.lastName
      ? `${effectiveSession.firstName} ${effectiveSession.lastName}`
      : 'Sanjay Yadav';

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#4bc8fa] via-[#9fe4fc] to-[#eff8fd] p-3.5 lg:p-4 text-[#0F172A] font-sans antialiased">
      <div className="max-w-[1536px] mx-auto flex gap-4 min-h-[calc(100vh-32px)]">
        {/* Persistent Floating Left Sidebar */}
        <TeacherSidebar
          schoolName="Sunrise Public School"
          tagline="Learn · Grow · Excel"
        />

        {/* Right Content Area */}
        <div className="flex-1 flex flex-col min-w-0">
          <TeacherHeader
            teacherName={teacherName}
            roleTitle="(Teacher)"
          />
          <main className="flex-1 min-w-0">{children}</main>
        </div>
      </div>
    </div>
  );
}
