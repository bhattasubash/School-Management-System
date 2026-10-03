import { redis } from '@/lib/redis';

const REVOCATION_TTL_SECONDS = 7 * 24 * 60 * 60; // 7 days (matches JWT session max age)

// In-memory fallback if Redis is unavailable in development/test
const memoryRevocationStore = new Map<string, { revokedBefore: number; expiresAt: number }>();

/**
 * Resets in-memory revocation store (for test suite isolation).
 */
export function resetMemoryRevocationStore(): void {
  memoryRevocationStore.clear();
}

/**
 * Revokes all active sessions for a user issued before the current timestamp.
 * Called upon password change, password reset, account deactivation, or forced logout.
 */
export async function revokeAllUserSessions(
  userId: string,
  options?: { failClosed?: boolean }
): Promise<void> {
  const currentTimestampSeconds = Math.floor(Date.now() / 1000);
  const key = `revoked_before:${userId}`;
  const shouldFailClosed =
    options?.failClosed ??
    (process.env.REDIS_FAIL_CLOSED === 'true' || process.env.NODE_ENV === 'production');

  if (redis) {
    try {
      await redis.set(key, currentTimestampSeconds.toString(), 'EX', REVOCATION_TTL_SECONDS);
      memoryRevocationStore.set(userId, {
        revokedBefore: currentTimestampSeconds,
        expiresAt: Date.now() + REVOCATION_TTL_SECONDS * 1000,
      });
      return;
    } catch {
      if (shouldFailClosed) {
        throw new Error('Failed to revoke sessions: Redis unavailable (fail-closed)');
      }
    }
  } else if (shouldFailClosed) {
    throw new Error('Failed to revoke sessions: Redis unavailable (fail-closed)');
  }

  memoryRevocationStore.set(userId, {
    revokedBefore: currentTimestampSeconds,
    expiresAt: Date.now() + REVOCATION_TTL_SECONDS * 1000,
  });
}

/**
 * Checks whether a session token's issued-at (iat) timestamp is older than
 * the user's latest session revocation timestamp.
 *
 * In production or fail-closed mode:
 * If Redis is unreachable, treats the session as REVOKED (returns true)
 * to prevent unauthorized access via stale/compromised tokens during outages.
 */
export async function isSessionRevoked(
  userId: string,
  iatSeconds?: number,
  options?: { failClosed?: boolean }
): Promise<boolean> {
  if (!iatSeconds) return false;

  const key = `revoked_before:${userId}`;
  const shouldFailClosed =
    options?.failClosed ??
    (process.env.REDIS_FAIL_CLOSED === 'true' || process.env.NODE_ENV === 'production');

  if (redis) {
    try {
      const revokedBeforeStr = await redis.get(key);
      if (revokedBeforeStr) {
        const revokedBefore = parseInt(revokedBeforeStr, 10);
        return iatSeconds < revokedBefore;
      }
      return false;
    } catch {
      if (shouldFailClosed) {
        // Redis outage in fail-closed mode: safely reject unverifiable session
        return true;
      }
    }
  } else if (shouldFailClosed) {
    return true;
  }

  const memoryEntry = memoryRevocationStore.get(userId);
  if (memoryEntry && memoryEntry.expiresAt > Date.now()) {
    return iatSeconds < memoryEntry.revokedBefore;
  }

  return false;
}
