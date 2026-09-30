import { redirect } from 'next/navigation';
import { prisma } from '@/lib/db';
import { getSessionFromCookies } from '@/lib/session';
import TimetableBuilderClient from '@/components/admin/TimetableBuilderClient';
import { Role } from '@/types';
import type { DayOfWeek } from '@prisma/client';

export const dynamic = 'force-dynamic';

export default async function AdminTimetablePage() {
  const session = await getSessionFromCookies();
  if (!session || (session.role !== Role.ADMIN && session.role !== Role.SUPER_ADMIN)) {
    redirect('/unauthorized');
  }

  const tenantId = session.tenantId;
  if (!tenantId) {
    redirect('/unauthorized');
  }

  const [tenant, classGrades, periodTimeSlots, subjects, teachers] = await Promise.all([
    prisma.tenant.findUnique({
      where: { id: tenantId },
      select: {
        id: true,
        name: true,
        board: true,
        workingDays: true,
      },
    }),
    prisma.classGrade.findMany({
      where: { tenantId },
      include: {
        sections: {
          select: {
            id: true,
            name: true,
            classGradeId: true,
          },
          orderBy: { name: 'asc' },
        },
      },
      orderBy: { numericOrder: 'asc' },
    }),
    prisma.periodTimeSlot.findMany({
      where: { tenantId },
      orderBy: { order: 'asc' },
    }),
    prisma.subject.findMany({
      where: { tenantId },
      select: {
        id: true,
        name: true,
        code: true,
      },
      orderBy: { name: 'asc' },
    }),
    prisma.teacherProfile.findMany({
      where: {
        tenantId,
        user: { isActive: true },
      },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: { employeeId: 'asc' },
    }),
  ]);

  const defaultWorkingDays: DayOfWeek[] = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
  const workingDays = (tenant?.workingDays && tenant.workingDays.length > 0)
    ? (tenant.workingDays as DayOfWeek[])
    : defaultWorkingDays;

  return (
    <div className="p-6 md:p-8 space-y-6">
      <TimetableBuilderClient
        schoolName={tenant?.name || 'School Timetable'}
        workingDays={workingDays}
        classGrades={classGrades.map((cg) => ({
          id: cg.id,
          name: cg.name,
          sections: cg.sections.map((sec) => ({
            id: sec.id,
            name: sec.name,
            classGradeId: sec.classGradeId,
            className: cg.name,
          })),
        }))}
        initialTimeSlots={periodTimeSlots.map((slot) => ({
          id: slot.id,
          name: slot.name,
          startTime: slot.startTime,
          endTime: slot.endTime,
          order: slot.order,
          isBreak: slot.isBreak,
        }))}
        subjects={subjects}
        teachers={teachers.map((t) => ({
          id: t.id,
          name: `${t.user.firstName} ${t.user.lastName}`,
          employeeId: t.employeeId,
          department: t.department,
          specialization: t.specialization,
        }))}
      />
    </div>
  );
}
