import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

/**
 * Liveness Health Probe.
 * Returns 200 OK if the Next.js Node.js process is active.
 * Used by container orchestrators (Kubernetes / ECS / Docker) to determine if the container is running.
 */
export async function GET() {
  return NextResponse.json(
    {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptimeSeconds: Math.floor(process.uptime()),
    },
    { status: 200 }
  );
}
