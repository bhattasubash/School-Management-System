import { prisma } from '@/lib/db';
import TenantsManagerClient, {
  TenantListItem,
  PlanOption,
} from '@/components/superadmin/TenantsManagerClient';

export const dynamic = 'force-dynamic';

export default async function SuperAdminTenantsPage() {
  const [tenants, plans, studentGroups, teacherGroups] = await Promise.all([
    prisma.tenant.findMany({
      include: {
        subscriptionPlan: true,
        branding: true,
        domains: true,
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.subscriptionPlan.findMany({
      where: { isActive: true },
      orderBy: { priceMonthly: 'asc' },
    }),
    prisma.studentProfile.groupBy({
      by: ['tenantId'],
      _count: { id: true },
    }),
    prisma.teacherProfile.groupBy({
      by: ['tenantId'],
      _count: { id: true },
    }),
  ]);

  const studentCountMap = new Map<string, number>();
  studentGroups.forEach((g) => studentCountMap.set(g.tenantId, g._count.id));

  const teacherCountMap = new Map<string, number>();
  teacherGroups.forEach((g) => teacherCountMap.set(g.tenantId, g._count.id));

  const tenantItems: TenantListItem[] = tenants.map((t) => ({
    id: t.id,
    name: t.name,
    slug: t.slug,
    email: t.email,
    phone: t.phone,
    address: t.address,
    city: t.city,
    state: t.state,
    pincode: t.pincode,
    board: t.board,
    subscriptionPlanId: t.subscriptionPlanId,
    subscriptionPlanName: t.subscriptionPlan?.name || 'Default Plan',
    subscriptionPlanPrice: Number(t.subscriptionPlan?.priceMonthly || 0),
    maxStudents: t.subscriptionPlan?.maxStudents || 1000,
    subscriptionStatus: t.subscriptionStatus as any,
    isActive: t.isActive,
    studentCount: studentCountMap.get(t.id) || 0,
    teacherCount: teacherCountMap.get(t.id) || 0,
    domains: t.domains.map((d) => ({
      id: d.id,
      domain: d.domain,
      isPrimary: d.isPrimary,
      isVerified: d.isVerified,
    })),
    branding: t.branding
      ? {
          primaryColor: t.branding.primaryColor,
          tagline: t.branding.tagline,
        }
      : null,
    createdAt: t.createdAt.toISOString(),
  }));

  const planOptions: PlanOption[] = plans.map((p) => ({
    id: p.id,
    name: p.name,
    priceMonthly: Number(p.priceMonthly),
    maxStudents: p.maxStudents,
    maxStaff: p.maxStaff,
  }));

  return <TenantsManagerClient tenants={tenantItems} plans={planOptions} />;
}
