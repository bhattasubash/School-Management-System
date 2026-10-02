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

const GLOBAL_MODELS = new Set(['SubscriptionPlan', 'Tenant', 'RefreshToken']);

function isGlobalModel(model: string): boolean {
  return GLOBAL_MODELS.has(model);
}

/**
 * Creates a tenant-isolated Prisma Client instance.
 * Automatically injects tenantId into query where clauses and mutation payloads
 * across ALL operations: findFirst, findFirstOrThrow, findUnique, findUniqueOrThrow,
 * findMany, count, aggregate, groupBy, create, createMany, update, updateMany,
 * upsert, delete, deleteMany.
 *
 * Excluded global models:
 * - SubscriptionPlan
 * - Tenant (queried globally by Super Admin or domain resolution pipeline)
 * - RefreshToken (user-linked auth session tokens)
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
          if (isGlobalModel(model)) return query(args);
          args.where = { ...(args.where || {}), tenantId };
          return query(args);
        },
        async findFirst({ model, args, query }) {
          if (isGlobalModel(model)) return query(args);
          args.where = { ...(args.where || {}), tenantId };
          return query(args);
        },
        async findFirstOrThrow({ model, args, query }) {
          if (isGlobalModel(model)) return query(args);
          args.where = { ...(args.where || {}), tenantId };
          return query(args);
        },
        async findUnique({ model, args }) {
          if (isGlobalModel(model)) return (prisma as any)[model].findUnique(args);
          return (prisma as any)[model].findFirst({
            ...args,
            where: { ...(args.where || {}), tenantId },
          });
        },
        async findUniqueOrThrow({ model, args }) {
          if (isGlobalModel(model)) return (prisma as any)[model].findUniqueOrThrow(args);
          return (prisma as any)[model].findFirstOrThrow({
            ...args,
            where: { ...(args.where || {}), tenantId },
          });
        },
        async count({ model, args, query }) {
          if (isGlobalModel(model)) return query(args);
          args.where = { ...(args.where || {}), tenantId };
          return query(args);
        },
        async aggregate({ model, args, query }) {
          if (isGlobalModel(model)) return query(args);
          args.where = { ...(args.where || {}), tenantId };
          return query(args);
        },
        async groupBy({ model, args, query }) {
          if (isGlobalModel(model)) return query(args);
          args.where = { ...(args.where || {}), tenantId };
          return query(args);
        },
        async create({ model, args, query }) {
          if (isGlobalModel(model)) return query(args);
          (args.data as Record<string, unknown>).tenantId = tenantId;
          return query(args);
        },
        async createMany({ model, args, query }) {
          if (isGlobalModel(model)) return query(args);
          if (Array.isArray(args.data)) {
            args.data = args.data.map((item) => ({ ...item, tenantId }));
          } else {
            (args.data as Record<string, unknown>).tenantId = tenantId;
          }
          return query(args);
        },
        async update({ model, args, query }) {
          if (isGlobalModel(model)) return query(args);
          args.where = { ...(args.where || {}), tenantId };
          return query(args);
        },
        async updateMany({ model, args, query }) {
          if (isGlobalModel(model)) return query(args);
          args.where = { ...(args.where || {}), tenantId };
          return query(args);
        },
        async upsert({ model, args }) {
          if (isGlobalModel(model)) return (prisma as any)[model].upsert(args);
          const existing = await (prisma as any)[model].findFirst({
            where: { ...(args.where || {}), tenantId },
          });
          if (existing) {
            return (prisma as any)[model].update({
              where: { id: existing.id, tenantId },
              data: args.update,
              select: args.select,
              include: args.include,
            });
          } else {
            return (prisma as any)[model].create({
              data: { ...(args.create || {}), tenantId },
              select: args.select,
              include: args.include,
            });
          }
        },
        async delete({ model, args, query }) {
          if (isGlobalModel(model)) return query(args);
          args.where = { ...(args.where || {}), tenantId };
          return query(args);
        },
        async deleteMany({ model, args, query }) {
          if (isGlobalModel(model)) return query(args);
          args.where = { ...(args.where || {}), tenantId };
          return query(args);
        },
      },
    },
  });
}

export type TenantDbClient = ReturnType<typeof getTenantDb>;
