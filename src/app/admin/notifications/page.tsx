import { redirect } from 'next/navigation';
import { getSessionFromCookies } from '@/lib/session';
import { prisma } from '@/lib/db';
import NotificationsManagerClient, {
  type AdminNotificationItem,
} from '@/components/admin/NotificationsManagerClient';

export const dynamic = 'force-dynamic';

export default async function AdminNotificationsPage() {
  const session = await getSessionFromCookies();
  if (!session || (session.role !== 'ADMIN' && session.role !== 'SUPER_ADMIN')) {
    redirect('/unauthorized');
  }

  const tenantId = session.tenantId;
  if (!tenantId) {
    redirect('/login');
  }

  const [dbNotifications, classGrades, totalUsers] = await Promise.all([
    prisma.notification.findMany({
      where: { tenantId },
      include: {
        recipient: {
          select: { firstName: true, lastName: true, role: true, email: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    }),
    prisma.classGrade.findMany({
      where: { tenantId },
      select: { id: true, name: true },
      orderBy: { numericOrder: 'asc' },
    }),
    prisma.user.count({
      where: { tenantId, isActive: true },
    }),
  ]);

  const formattedNotifications: AdminNotificationItem[] = dbNotifications.map((n) => ({
    id: n.id,
    title: n.title,
    body: n.body,
    type: n.type,
    isRead: n.isRead,
    actionUrl: n.actionUrl,
    createdAt: n.createdAt.toISOString(),
    recipientName: n.recipient
      ? `${n.recipient.firstName} ${n.recipient.lastName}`
      : 'Unknown User',
    recipientRole: n.recipient?.role || 'USER',
  }));

  return (
    <NotificationsManagerClient
      initialNotifications={formattedNotifications}
      classGrades={classGrades}
      totalTenantUsers={totalUsers}
    />
  );
}
