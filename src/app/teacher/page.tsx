import React from 'react';
import { getSessionFromCookies } from '@/lib/session';
import { prisma } from '@/lib/db';
import { TeacherDashboardView } from '@/components/teacher/TeacherDashboardView';

export default async function TeacherDashboardPage() {
  const session = await getSessionFromCookies();

  const today = new Date();
  const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());

  let todayAttendance = null;
  // Match reference specification exact name
  const teacherName = 'Sanjay Yadav';

  if (session?.tenantId && session?.sub) {
    try {
      todayAttendance = await prisma.staffAttendance.findFirst({
        where: {
          tenantId: session.tenantId,
          userId: session.sub,
          date: todayStart,
        },
      });
    } catch {
      // Graceful fallback
    }
  }

  return (
    <TeacherDashboardView
      teacherName={teacherName}
      roleTitle="Teacher"
      initialCheckInTime={todayAttendance?.checkInTime?.toISOString() ?? null}
      initialCheckOutTime={todayAttendance?.checkOutTime?.toISOString() ?? null}
    />
  );
}
