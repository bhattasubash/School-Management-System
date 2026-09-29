import { prisma } from '@/lib/db';
import SubscriptionsManagerClient, {
  PlanItem,
} from '@/components/superadmin/SubscriptionsManagerClient';

export const dynamic = 'force-dynamic';

export default async function SuperAdminSubscriptionsPage() {
  const plans = await prisma.subscriptionPlan.findMany({
    include: {
      tenants: {
        select: {
          id: true,
          subscriptionStatus: true,
          isActive: true,
        },
      },
    },
    orderBy: { priceMonthly: 'asc' },
  });

  let totalMrr = 0;

  const planItems: PlanItem[] = plans.map((p) => {
    const activeTenantsCount = p.tenants.filter(
      (t) => t.subscriptionStatus === 'ACTIVE' && t.isActive
    ).length;
    const monthlyRev = activeTenantsCount * Number(p.priceMonthly);
    totalMrr += monthlyRev;

    return {
      id: p.id,
      name: p.name,
      maxStudents: p.maxStudents,
      maxStaff: p.maxStaff,
      features: (p.features as Record<string, boolean>) || {},
      priceMonthly: Number(p.priceMonthly),
      priceAnnual: Number(p.priceAnnual),
      isActive: p.isActive,
      tenantCount: activeTenantsCount,
      totalMonthlyRevenue: monthlyRev,
    };
  });

  const totalArr = totalMrr * 12;

  return (
    <SubscriptionsManagerClient
      plans={planItems}
      totalMrr={totalMrr}
      totalArr={totalArr}
    />
  );
}
