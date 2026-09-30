import { redirect } from 'next/navigation';
import { prisma } from '@/lib/db';
import { getSessionFromCookies } from '@/lib/session';
import ParentDirectoryClient, { type ParentDirectoryItem } from '@/components/admin/ParentDirectoryClient';

export const dynamic = 'force-dynamic';

export default async function AdminParentsPage() {
  const session = await getSessionFromCookies();
  if (!session || (session.role !== 'ADMIN' && session.role !== 'SUPER_ADMIN')) {
    redirect('/login?redirect=/admin/parents');
  }

  const tenantId = session.tenantId;
  if (!tenantId) {
    return <div className="p-8">Platform tenant context required.</div>;
  }

  // Fetch parents and students in parallel
  const [parentsRaw, studentsRaw] = await Promise.all([
    prisma.parentProfile.findMany({
      where: { tenantId },
      include: {
        user: true,
        students: {
          include: {
            student: {
              include: {
                user: true,
                section: {
                  include: {
                    classGrade: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: { user: { firstName: 'asc' } },
    }),
    prisma.studentProfile.findMany({
      where: { tenantId, user: { isActive: true } },
      include: {
        user: true,
        section: {
          include: {
            classGrade: true,
          },
        },
      },
      orderBy: { user: { firstName: 'asc' } },
    }),
  ]);

  const initialParents: ParentDirectoryItem[] = parentsRaw.map((p) => ({
    id: p.id,
    userId: p.userId,
    name: `${p.user.firstName} ${p.user.lastName}`,
    email: p.user.email,
    phone: p.user.phone || 'N/A',
    relationship: p.relationship,
    occupation: p.occupation || 'N/A',
    isActive: p.user.isActive,
    studentsCount: p.students.length,
    linkedStudents: p.students.map((link) => ({
      id: link.student.id,
      name: `${link.student.user.firstName} ${link.student.user.lastName}`,
      admissionNumber: link.student.admissionNumber,
      classSection: `${link.student.section.classGrade.name}-${link.student.section.name}`,
      isPrimary: link.isPrimary,
    })),
  }));

  const allStudents = studentsRaw.map((s) => ({
    id: s.id,
    name: `${s.user.firstName} ${s.user.lastName}`,
    classSection: `${s.section.classGrade.name}-${s.section.name}`,
  }));

  return <ParentDirectoryClient initialParents={initialParents} allStudents={allStudents} />;
}
