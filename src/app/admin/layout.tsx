import { redirect } from 'next/navigation';
import { getSessionFromCookies } from '@/lib/session';
import { prisma } from '@/lib/db';
import AdminLayoutClient from '@/components/admin/AdminLayoutClient';

export const dynamic = 'force-dynamic';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // 1. Session verification & RBAC guard
  const session = await getSessionFromCookies();
  if (!session) {
    redirect('/login?redirect=/admin');
  }

  if (session.role !== 'ADMIN' && session.role !== 'SUPER_ADMIN' && session.role !== 'ACCOUNTANT') {
    redirect('/unauthorized');
  }

  // 2. Fetch tenant & user details
  const [user, tenant, academicYear] = await Promise.all([
    prisma.user.findUnique({
      where: { id: session.sub },
      select: { firstName: true, lastName: true, email: true, role: true },
    }),
    session.tenantId
      ? prisma.tenant.findUnique({
          where: { id: session.tenantId },
          select: { name: true, board: true },
        })
      : null,
    session.tenantId
      ? prisma.academicYear.findFirst({
          where: { tenantId: session.tenantId, isCurrent: true },
          select: { name: true },
        })
      : null,
  ]);

  const schoolName = tenant?.name || 'Sunrise Public School';
  const board = tenant?.board || 'CBSE';
  const academicYearName = academicYear?.name || '2026-27';
  const adminName = user ? `${user.firstName} ${user.lastName}` : 'Administrator';
  const adminEmail = user?.email || session.email;

  return (
    <AdminLayoutClient
      schoolName={schoolName}
      board={board}
      academicYear={academicYearName}
      adminName={adminName}
      adminEmail={adminEmail}
      role={session.role}
    >
      {children}
    </AdminLayoutClient>
  );
}
