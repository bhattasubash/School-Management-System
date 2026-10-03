import { redis } from '@/lib/redis';

export interface RateLimitConfig {
  /** Prefix defining the scope e.g. 'rl:login', 'rl:otp-request', 'rl:bulk-import' */
  prefix: string;
  /** Composite key e.g. `${ip}:${email}` or `${tenantId}:${userId}` */
  key: string;
  /** Maximum number of requests allowed in the time window */
  maxRequests: number;
  /** Window duration in seconds */
  windowSeconds: number;
  /**
   * Whether to fail closed (block requests) if Redis is unavailable.
   * Defaults to true in production for login endpoints or when REDIS_FAIL_CLOSED=true.
   */
  failClosed?: boolean;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  retryAfterSeconds: number;
  error?: string;
}

// Fallback in-memory store if Redis is unavailable
interface MemoryBucket {
  count: number;
  resetAt: number;
}
const memoryStore = new Map<string, MemoryBucket>();

// Periodic in-memory cleanup to prevent unbounded memory growth
const CLEANUP_INTERVAL_MS = 60 * 1000;
let lastCleanup = Date.now();

function cleanupMemoryStore() {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL_MS) return;
  lastCleanup = now;

  memoryStore.forEach((bucket, key) => {
    if (bucket.resetAt <= now) {
      memoryStore.delete(key);
    }
  });
}

/**
 * Reset memory rate limiter (for test teardown and verification).
 */
export function resetMemoryRateLimiter(): void {
  memoryStore.clear();
}

/**
 * Checks and increments rate limit counter atomically.
 * Uses Redis atomic INCR + EXPIRE if Redis is reachable.
 * If Redis is offline:
 * - Fails closed (denies request) if failClosed is enabled or in production for login.
 * - Otherwise falls back to in-memory store for local development and non-critical limits.
 */
export async function rateLimit(config: RateLimitConfig): Promise<RateLimitResult> {
  const fullKey = `${config.prefix}:${config.key}`;
  const now = Date.now();
  const shouldFailClosed =
    config.failClosed ??
    (process.env.REDIS_FAIL_CLOSED === 'true' ||
      (process.env.NODE_ENV === 'production' && config.prefix === 'rl:login'));

  // Try Redis first
  if (redis) {
    try {
      const pipeline = redis.pipeline();
      pipeline.incr(fullKey);
      pipeline.ttl(fullKey);
      const results = await pipeline.exec();

      if (results && results[0] && results[1]) {
        const [incrErr, count] = results[0] as [Error | null, number];
        const [ttlErr, ttl] = results[1] as [Error | null, number];

        if (!incrErr && typeof count === 'number') {
          // If key was just created, set expiration
          if (ttl === -1 || ttlErr) {
            await redis.expire(fullKey, config.windowSeconds);
          }

          const remaining = Math.max(0, config.maxRequests - count);
          const allowed = count <= config.maxRequests;
          const retryAfterSeconds = allowed ? 0 : Math.max(1, ttl > 0 ? ttl : config.windowSeconds);

          return { allowed, remaining, retryAfterSeconds };
        }
      }

      if (shouldFailClosed) {
        return {
          allowed: false,
          remaining: 0,
          retryAfterSeconds: config.windowSeconds,
          error: 'Rate limiter unavailable (fail-closed)',
        };
      }
    } catch {
      if (shouldFailClosed) {
        return {
          allowed: false,
          remaining: 0,
          retryAfterSeconds: config.windowSeconds,
          error: 'Rate limiter unavailable (fail-closed)',
        };
      }
    }
  } else if (shouldFailClosed) {
    return {
      allowed: false,
      remaining: 0,
      retryAfterSeconds: config.windowSeconds,
      error: 'Rate limiter unavailable (fail-closed)',
    };
  }

  // In-memory fallback
  cleanupMemoryStore();

  let bucket = memoryStore.get(fullKey);
  if (!bucket || bucket.resetAt <= now) {
    bucket = {
      count: 1,
      resetAt: now + config.windowSeconds * 1000,
    };
    memoryStore.set(fullKey, bucket);
    return {
      allowed: true,
      remaining: config.maxRequests - 1,
      retryAfterSeconds: 0,
    };
  }

  bucket.count += 1;
  const remaining = Math.max(0, config.maxRequests - bucket.count);
  const allowed = bucket.count <= config.maxRequests;
  const retryAfterSeconds = allowed ? 0 : Math.ceil((bucket.resetAt - now) / 1000);

  return { allowed, remaining, retryAfterSeconds };
}
