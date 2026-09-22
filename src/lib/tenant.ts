import { headers } from 'next/headers';
import { prisma } from '@/lib/db';
import { redis } from '@/lib/redis';
import type { TenantContext } from '@/types';

/**
 * Reads verified tenant context injected by Next.js middleware into request headers.
 * NEVER trusts client-supplied query/body parameters.
 */
export function getTenantContext(): TenantContext | null {
  const headerList = headers();
  const tenantId = headerList.get('x-tenant-id');
  const slug = headerList.get('x-tenant-slug');
  const name = headerList.get('x-tenant-name') || '';
  const customDomain = headerList.get('x-tenant-domain');

  if (!tenantId || !slug) return null;

  return {
    tenantId,
    slug,
    name,
    customDomain,
  };
}

/**
 * Resolves tenant by hostname (Subdomain or Custom Domain).
 * Fast-path: Redis Cache (24-hour TTL).
 * Fallback: PostgreSQL database lookup.
 */
export async function resolveTenantByHostname(hostname: string): Promise<TenantContext | null> {
  const cleanHost = hostname.toLowerCase().split(':')[0]; // Remove port if present
  const cacheKey = `tenant:domain:${cleanHost}`;

  // 1. Check Redis Cache
  if (redis) {
    try {
      const cached = await redis.get(cacheKey);
      if (cached) {
        return JSON.parse(cached) as TenantContext;
      }
    } catch {
      // Redis unavailable; fall through to DB lookup
    }
  }

  // 2. Check Database by verified custom domain
  const tenantByDomain = await prisma.tenantDomain.findFirst({
    where: {
      domain: cleanHost,
      isVerified: true,
      tenant: { isActive: true },
    },
    include: {
      tenant: {
        include: { branding: true },
      },
    },
  });

  if (tenantByDomain) {
    const context: TenantContext = {
      tenantId: tenantByDomain.tenant.id,
      slug: tenantByDomain.tenant.slug,
      name: tenantByDomain.tenant.name,
      customDomain: tenantByDomain.domain,
      branding: tenantByDomain.tenant.branding,
    };

    if (redis) {
      try {
        await redis.set(cacheKey, JSON.stringify(context), 'EX', 86400); // 24 hours
      } catch {}
    }
    return context;
  }

  // 3. Check Subdomain: e.g. "dps.schoolerp.in" -> slug "dps"
  const appDomain = process.env.NEXT_PUBLIC_APP_DOMAIN || 'schoolerp.in';
  if (cleanHost.endsWith(`.${appDomain}`)) {
    const slug = cleanHost.replace(`.${appDomain}`, '');
    const tenantBySlug = await prisma.tenant.findUnique({
      where: { slug, isActive: true },
      include: { branding: true },
    });

    if (tenantBySlug) {
      const context: TenantContext = {
        tenantId: tenantBySlug.id,
        slug: tenantBySlug.slug,
        name: tenantBySlug.name,
        branding: tenantBySlug.branding,
      };

      if (redis) {
        try {
          await redis.set(cacheKey, JSON.stringify(context), 'EX', 86400);
        } catch {}
      }
      return context;
    }
  }

  return null;
}
