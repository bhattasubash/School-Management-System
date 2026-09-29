import { prisma } from '@/lib/db';
import DomainsManagerClient, {
  DomainRecordItem,
  TenantSimpleOption,
} from '@/components/superadmin/DomainsManagerClient';

export const dynamic = 'force-dynamic';

export default async function SuperAdminDomainsPage() {
  const [domainRecords, tenantRecords] = await Promise.all([
    prisma.tenantDomain.findMany({
      include: {
        tenant: {
          select: {
            name: true,
            slug: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.tenant.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
      },
      orderBy: { name: 'asc' },
    }),
  ]);

  const domainItems: DomainRecordItem[] = domainRecords.map((d) => ({
    id: d.id,
    tenantId: d.tenantId,
    tenantName: d.tenant.name,
    tenantSlug: d.tenant.slug,
    domain: d.domain,
    isPrimary: d.isPrimary,
    isVerified: d.isVerified,
    verificationToken: d.verificationToken,
    verifiedAt: d.verifiedAt ? d.verifiedAt.toISOString() : null,
    createdAt: d.createdAt.toISOString(),
  }));

  const tenantOptions: TenantSimpleOption[] = tenantRecords.map((t) => ({
    id: t.id,
    name: t.name,
    slug: t.slug,
  }));

  return <DomainsManagerClient domains={domainItems} tenants={tenantOptions} />;
}
