import { prisma } from '@/lib/db';
import SuperAdminDashboardClient, {
  SuperAdminDashboardStats,
} from '@/components/superadmin/SuperAdminDashboardClient';

export const dynamic = 'force-dynamic';

export default async function SuperAdminPage() {
  // Query platform-wide data concurrently
  const [tenants, studentCount, teacherCount, studentGroups, auditLogs] = await Promise.all([
    prisma.tenant.findMany({
      include: {
        subscriptionPlan: true,
        domains: true,
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.studentProfile.count(),
    prisma.teacherProfile.count(),
    prisma.studentProfile.groupBy({
      by: ['tenantId'],
      _count: { id: true },
    }),
    prisma.auditLog.findMany({
      take: 6,
      orderBy: { createdAt: 'desc' },
      include: {
        tenant: { select: { name: true } },
        user: { select: { email: true } },
      },
    }),
  ]);

  const studentCountMap = new Map<string, number>();
  studentGroups.forEach((g) => {
    studentCountMap.set(g.tenantId, g._count.id);
  });

  const totalTenants = tenants.length;
  const activeTenants = tenants.filter(
    (t) => t.subscriptionStatus === 'ACTIVE' && t.isActive
  ).length;

  let platformMrr = 0;
  tenants.forEach((t) => {
    if (t.subscriptionStatus === 'ACTIVE' && t.isActive && t.subscriptionPlan) {
      platformMrr += Number(t.subscriptionPlan.priceMonthly);
    }
  });

  const platformArr = platformMrr * 12;

  // Board distribution
  const boardCounts: Record<string, number> = {};
  tenants.forEach((t) => {
    const b = t.board || 'CBSE';
    boardCounts[b] = (boardCounts[b] || 0) + 1;
  });

  const boardDistribution = Object.entries(boardCounts).map(([board, count]) => ({
    board,
    count,
  }));

  const recentTenants = tenants.map((t) => ({
    id: t.id,
    name: t.name,
    slug: t.slug,
    city: t.city,
    board: t.board,
    status: t.subscriptionStatus,
    planName: t.subscriptionPlan?.name || 'Default Plan',
    studentCount: studentCountMap.get(t.id) || 0,
    createdAt: t.createdAt.toISOString(),
  }));

  const recentAuditLogs = auditLogs.map((log) => ({
    id: log.id,
    action: log.action,
    entityType: log.entityType,
    entityId: log.entityId,
    tenantName: log.tenant?.name || null,
    userEmail: log.user?.email || null,
    createdAt: log.createdAt.toISOString(),
  }));

  const stats: SuperAdminDashboardStats = {
    totalTenants,
    activeTenants,
    totalStudents: studentCount,
    totalTeachers: teacherCount,
    platformMrr,
    platformArr,
    boardDistribution,
    recentTenants,
    recentAuditLogs,
  };

  return <SuperAdminDashboardClient stats={stats} />;
}
