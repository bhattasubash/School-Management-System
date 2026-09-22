import { PrismaClient } from '@prisma/client';

// Global PrismaClient singleton for connection reuse
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

/**
 * Creates a tenant-isolated Prisma Client instance.
 * Automatically injects tenantId into query where clauses and mutation payloads.
 *
 * Excluded global models:
 * - SubscriptionPlan
 * - Tenant (queried globally by Super Admin or domain resolution pipeline)
 */
export function getTenantDb(tenantId: string) {
  if (!tenantId) {
    throw new Error('Tenant isolation security error: tenantId is required to instantiate tenant client');
  }

  return prisma.$extends({
    name: 'tenant-isolation',
    query: {
      $allModels: {
        async findMany({ model, args, query }) {
          if (model === 'SubscriptionPlan' || model === 'Tenant') {
            return query(args);
          }
          args.where = { ...(args.where || {}), tenantId };
          return query(args);
        },
        async findFirst({ model, args, query }) {
          if (model === 'SubscriptionPlan' || model === 'Tenant') {
            return query(args);
          }
          args.where = { ...(args.where || {}), tenantId };
          return query(args);
        },
        async count({ model, args, query }) {
          if (model === 'SubscriptionPlan' || model === 'Tenant') {
            return query(args);
          }
          args.where = { ...(args.where || {}), tenantId };
          return query(args);
        },
        async create({ model, args, query }) {
          if (model === 'SubscriptionPlan' || model === 'Tenant') {
            return query(args);
          }
          (args.data as Record<string, unknown>).tenantId = tenantId;
          return query(args);
        },
        async createMany({ model, args, query }) {
          if (model === 'SubscriptionPlan' || model === 'Tenant') {
            return query(args);
          }
          if (Array.isArray(args.data)) {
            args.data = args.data.map((item) => ({ ...item, tenantId }));
          } else {
            (args.data as Record<string, unknown>).tenantId = tenantId;
          }
          return query(args);
        },
        async update({ model, args, query }) {
          if (model === 'SubscriptionPlan' || model === 'Tenant') {
            return query(args);
          }
          args.where = { ...(args.where || {}), tenantId };
          return query(args);
        },
        async updateMany({ model, args, query }) {
          if (model === 'SubscriptionPlan' || model === 'Tenant') {
            return query(args);
          }
          args.where = { ...(args.where || {}), tenantId };
          return query(args);
        },
        async delete({ model, args, query }) {
          if (model === 'SubscriptionPlan' || model === 'Tenant') {
            return query(args);
          }
          args.where = { ...(args.where || {}), tenantId };
          return query(args);
        },
        async deleteMany({ model, args, query }) {
          if (model === 'SubscriptionPlan' || model === 'Tenant') {
            return query(args);
          }
          args.where = { ...(args.where || {}), tenantId };
          return query(args);
        },
      },
    },
  });
}

export type TenantDbClient = ReturnType<typeof getTenantDb>;
