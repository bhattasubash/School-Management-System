import { redirect } from 'next/navigation';
import { prisma } from '@/lib/db';
import { getSessionFromCookies } from '@/lib/session';
import TeacherDirectoryClient, {
  type TeacherItem,
} from '@/components/admin/TeacherDirectoryClient';

export const dynamic = 'force-dynamic';

export default async function AdminTeachersPage() {
  const session = await getSessionFromCookies();
  if (!session || (session.role !== 'ADMIN' && session.role !== 'SUPER_ADMIN')) {
    redirect('/login?redirect=/admin/teachers');
  }

  const tenantId = session.tenantId;
  if (!tenantId) {
    return <div>Platform context required.</div>;
  }

  const today = new Date();
  const todayDateOnly = new Date(`${today.toISOString().split('T')[0]}T00:00:00.000Z`);

  const [teachersRaw, sectionsRaw] = await Promise.all([
    prisma.teacherProfile.findMany({
      where: { tenantId },
      include: {
        user: true,
        assignedSubstitutions: {
          where: {
            status: 'ASSIGNED',
            date: todayDateOnly,
          },
        },
      },
      orderBy: { employeeId: 'asc' },
    }),
    prisma.section.findMany({
      where: { tenantId },
      include: { classGrade: true },
    }),
  ]);

  // Resolve original teachers for substitutions
  const origTeacherIds = teachersRaw.flatMap((t) =>
    t.assignedSubstitutions.map((s) => s.originalTeacherId)
  );

  const origTeachers =
    origTeacherIds.length > 0
      ? await prisma.teacherProfile.findMany({
          where: { id: { in: origTeacherIds } },
          include: { user: { select: { firstName: true, lastName: true } } },
        })
      : [];

  const origTeacherMap = new Map(origTeachers.map((t) => [t.id, t]));

  const classTeacherSectionMap = new Map<string, string>();
  for (const sec of sectionsRaw) {
    if (sec.classTeacherId) {
      classTeacherSectionMap.set(sec.classTeacherId, `${sec.classGrade.name}-${sec.name}`);
    }
  }

  const teachers: TeacherItem[] = teachersRaw.map((t) => {
    const activeSub = t.assignedSubstitutions[0];
    const origTeacher = activeSub ? origTeacherMap.get(activeSub.originalTeacherId) : null;

    return {
      id: t.id,
      name: `${t.user.firstName} ${t.user.lastName}`,
      email: t.user.email,
      phone: t.user.phone || '+91 11 2345 6789',
      employeeId: t.employeeId,
      department: t.department,
      qualification: t.qualification,
      specialization: t.specialization,
      joiningDate: t.joiningDate.toLocaleDateString('en-IN', {
        month: 'short',
        year: 'numeric',
      }),
      isActive: t.user.isActive,
      deletedAt: t.user.deletedAt ? t.user.deletedAt.toISOString() : null,
      classTeacherSection: classTeacherSectionMap.get(t.id) || null,
      activeSubstitution: activeSub
        ? {
            date: activeSub.date.toLocaleDateString('en-IN', {
              day: 'numeric',
              month: 'short',
            }),
            originalTeacherName: origTeacher
              ? `Dr. ${origTeacher.user.firstName} ${origTeacher.user.lastName}`
              : 'Absent Colleague',
            reason: activeSub.reason || 'Medical Leave',
          }
        : null,
    };
  });

  return <TeacherDirectoryClient teachers={teachers} />;
}
