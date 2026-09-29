import { redirect } from 'next/navigation';
import { getSessionFromCookies } from '@/lib/session';
import { prisma } from '@/lib/db';
import SuperAdminLayoutClient from '@/components/superadmin/SuperAdminLayoutClient';

export const dynamic = 'force-dynamic';

export default async function SuperAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // 1. Session verification & Zero-Trust RBAC guard
  const session = await getSessionFromCookies();
  if (!session) {
    redirect('/login?redirect=/superadmin');
  }

  if (session.role !== 'SUPER_ADMIN') {
    redirect('/unauthorized');
  }

  // 2. Fetch Super Admin profile details
  const user = await prisma.user.findUnique({
    where: { id: session.sub },
    select: { firstName: true, lastName: true, email: true },
  });

  const adminName = user ? `${user.firstName} ${user.lastName}` : 'Platform Super Admin';
  const adminEmail = user?.email || session.email;

  return (
    <SuperAdminLayoutClient adminName={adminName} adminEmail={adminEmail}>
      {children}
    </SuperAdminLayoutClient>
  );
}
