import Redis from 'ioredis';

const globalForRedis = globalThis as unknown as {
  redis: Redis | undefined;
};

function createRedisClient(): Redis | null {
  try {
    const url = process.env.REDIS_URL || 'redis://localhost:6379';
    const client = new Redis(url, {
      maxRetriesPerRequest: 1,
      retryStrategy(times) {
        if (times > 3) return null; // stop retrying after 3 attempts
        return Math.min(times * 200, 1000);
      },
      lazyConnect: true,
      enableOfflineQueue: false,
    });

    client.on('error', () => {
      // Suppress unhandled error event exceptions when Redis is offline
    });

    return client;
  } catch {
    return null;
  }
}

export const redis = globalForRedis.redis ?? createRedisClient();

if (process.env.NODE_ENV !== 'production' && redis) {
  globalForRedis.redis = redis;
}

/**
 * Checks whether Redis is online and responding to PING.
 */
export async function isRedisAvailable(): Promise<boolean> {
  if (!redis) return false;
  try {
    const res = await redis.ping();
    return res === 'PONG';
  } catch {
    return false;
  }
}
