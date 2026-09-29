import { redirect } from 'next/navigation';
import { prisma } from '@/lib/db';
import { getSessionFromCookies } from '@/lib/session';
import AdminAuditClient, {
  AuditRecord,
} from '@/components/admin/AdminAuditClient';

export const dynamic = 'force-dynamic';

export default async function AdminAuditPage() {
  const session = await getSessionFromCookies();
  if (!session || (session.role !== 'ADMIN' && session.role !== 'SUPER_ADMIN')) {
    redirect('/login?redirect=/admin/audit');
  }

  const tenantId = session.tenantId;
  if (!tenantId) {
    redirect('/superadmin');
  }

  const [tenant, auditLogs] = await Promise.all([
    prisma.tenant.findUnique({
      where: { id: tenantId },
      select: { name: true },
    }),
    prisma.auditLog.findMany({
      where: { tenantId },
      include: {
        user: {
          select: { firstName: true, lastName: true, email: true, role: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    }),
  ]);

  const formattedLogs: AuditRecord[] = auditLogs.map((log) => ({
    id: log.id,
    action: log.action,
    entityType: log.entityType,
    entityId: log.entityId,
    actorName: log.user
      ? `${log.user.firstName} ${log.user.lastName}`
      : 'System Platform',
    actorEmail: log.user?.email || null,
    actorRole: log.user?.role || null,
    ipAddress: log.ipAddress,
    createdAt: log.createdAt.toISOString(),
    oldValues: log.oldValues,
    newValues: log.newValues,
  }));

  return (
    <AdminAuditClient
      logs={formattedLogs}
      schoolName={tenant?.name || 'Delhi Public School'}
    />
  );
}
