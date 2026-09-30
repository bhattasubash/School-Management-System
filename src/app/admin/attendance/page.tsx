import { redirect } from 'next/navigation';
import { prisma } from '@/lib/db';
import { getSessionFromCookies } from '@/lib/session';
import AdminAttendanceDashboard from '@/components/admin/AdminAttendanceDashboard';
import { getAdminAttendanceOverviewAction } from '@/actions/attendance';
import { Role } from '@/types';

export const dynamic = 'force-dynamic';

export default async function AdminAttendancePage() {
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
    select: { name: true, board: true },
  });

  const res = await getAdminAttendanceOverviewAction();
  const overview = res.success && res.overview ? res.overview : null;

  return (
    <div className="p-6 md:p-8 space-y-6">
      <AdminAttendanceDashboard
        schoolName={tenant?.name || 'School Campus'}
        board={tenant?.board || 'CBSE'}
        initialOverview={overview}
      />
    </div>
  );
}
