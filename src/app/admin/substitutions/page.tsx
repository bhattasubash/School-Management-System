import { redirect } from 'next/navigation';
import { prisma } from '@/lib/db';
import { getSessionFromCookies } from '@/lib/session';
import SubstitutionManagerClient from '@/components/admin/SubstitutionManagerClient';
import { Role } from '@/types';

export const dynamic = 'force-dynamic';

export default async function AdminSubstitutionsPage() {
  const session = await getSessionFromCookies();
  if (!session || (session.role !== Role.ADMIN && session.role !== Role.SUPER_ADMIN)) {
    redirect('/unauthorized');
  }

  const tenantId = session.tenantId;
  if (!tenantId) {
    redirect('/unauthorized');
  }

  const tenant = await prisma.tenant.findUnique({
    where: { id: tenantId },
    select: { name: true },
  });

  // Get active teachers
  const teachers = await prisma.teacherProfile.findMany({
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
  });

  const todayStr = new Date().toISOString().split('T')[0];

  return (
    <div className="p-6 md:p-8 space-y-6">
      <SubstitutionManagerClient
        schoolName={tenant?.name || 'School Substitutions'}
        initialDate={todayStr}
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
