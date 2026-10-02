import { redis } from '@/lib/redis';

const REVOCATION_TTL_SECONDS = 7 * 24 * 60 * 60; // 7 days (matches JWT session max age)

// In-memory fallback if Redis is unavailable
const memoryRevocationStore = new Map<string, { revokedBefore: number; expiresAt: number }>();

/**
 * Revokes all active sessions for a user issued before the current timestamp.
 * Called upon password change, password reset, account deactivation, or forced logout.
 */
export async function revokeAllUserSessions(userId: string): Promise<void> {
  const currentTimestampSeconds = Math.floor(Date.now() / 1000);
  const key = `revoked_before:${userId}`;

  if (redis) {
    try {
      await redis.set(key, currentTimestampSeconds.toString(), 'EX', REVOCATION_TTL_SECONDS);
      return;
    } catch {
      // Fall through to memory store safely
    }
  }

  memoryRevocationStore.set(userId, {
    revokedBefore: currentTimestampSeconds,
    expiresAt: Date.now() + REVOCATION_TTL_SECONDS * 1000,
  });
}

/**
 * Checks whether a session token's issued-at (iat) timestamp is older than
 * the user's latest session revocation timestamp.
 */
export async function isSessionRevoked(userId: string, iatSeconds?: number): Promise<boolean> {
  if (!iatSeconds) return false;

  const key = `revoked_before:${userId}`;

  if (redis) {
    try {
      const revokedBeforeStr = await redis.get(key);
      if (revokedBeforeStr) {
        const revokedBefore = parseInt(revokedBeforeStr, 10);
        return iatSeconds < revokedBefore;
      }
    } catch {
      // Fall through to memory store
    }
  }

  const memoryEntry = memoryRevocationStore.get(userId);
  if (memoryEntry && memoryEntry.expiresAt > Date.now()) {
    return iatSeconds < memoryEntry.revokedBefore;
  }

  return false;
}
