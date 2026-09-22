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
    });

    client.on('error', (err) => {
      // Graceful error logging to prevent crashes if Redis is offline locally
      if (process.env.NODE_ENV === 'development') {
        // Suppress repeated connection logs
      }
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
