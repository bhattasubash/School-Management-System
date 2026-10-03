import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { redis } from '@/lib/redis';

export const dynamic = 'force-dynamic';

/**
 * Readiness Health Probe.
 * Verifies that critical downstream infrastructure (PostgreSQL database and Redis)
 * is connected and ready to serve user requests safely.
 */
export async function GET() {
  const checks: Record<string, 'ok' | 'error' | 'disabled'> = {
    database: 'error',
    redis: 'disabled',
  };

  let allHealthy = true;

  // 1. Database Connectivity Check
  try {
    await prisma.$queryRaw`SELECT 1`;
    checks.database = 'ok';
  } catch (err: unknown) {
    allHealthy = false;
    checks.database = 'error';
    console.error('[HEALTH-CHECK-ERROR] Database connection failed:', err instanceof Error ? err.message : String(err));
  }

  // 2. Redis Connectivity Check (if configured)
  if (redis) {
    try {
      const ping = await redis.ping();
      checks.redis = ping === 'PONG' ? 'ok' : 'error';
      if (checks.redis !== 'ok') allHealthy = false;
    } catch (redisErr) {
      checks.redis = 'error';
      // In soft mode, Redis failure might not take down the whole app if memory fallback works,
      // but warn in readiness.
    }
  }

  const statusCode = allHealthy ? 200 : 503;

  return NextResponse.json(
    {
      status: allHealthy ? 'ready' : 'degraded',
      checks,
      timestamp: new Date().toISOString(),
    },
    { status: statusCode }
  );
}
