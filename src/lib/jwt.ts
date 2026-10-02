import { SignJWT, jwtVerify } from 'jose';
import type { JWTPayload, RoleType } from '@/types';

const DEV_TEST_FALLBACK_SECRET = 'dev-only-secret-do-not-use-in-production-min-32-chars!!';
let hasWarnedDevSecret = false;

/**
 * Authoritative JWT Secret Retrieval.
 * In production (NODE_ENV === 'production'), strictly requires JWT_SECRET >= 32 characters.
 * Fails closed with a fatal error if missing or too short in production.
 */
export function getJwtSecretKey(): Uint8Array {
  const secret = process.env.JWT_SECRET;

  if (process.env.NODE_ENV === 'production') {
    if (!secret || secret.trim().length < 32) {
      throw new Error(
        'FATAL SECURITY MISCONFIGURATION: JWT_SECRET environment variable must be set with at least 32 characters in production.'
      );
    }
    return new TextEncoder().encode(secret.trim());
  }

  // Non-production (development / test)
  if (secret && secret.trim().length >= 32) {
    return new TextEncoder().encode(secret.trim());
  }

  if (!hasWarnedDevSecret && process.env.NODE_ENV !== 'test') {
    console.warn(
      '[SECURITY WARNING] JWT_SECRET is not configured or shorter than 32 chars. Using local ephemeral development secret. Set JWT_SECRET in your .env file.'
    );
    hasWarnedDevSecret = true;
  }

  return new TextEncoder().encode(DEV_TEST_FALLBACK_SECRET);
}

/**
 * Creates a signed JWT session token valid for 7 days.
 */
export async function createSessionToken(payload: Omit<JWTPayload, 'iat' | 'exp'>): Promise<string> {
  const key = getJwtSecretKey();
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(key);
}

/**
 * Verifies and decodes a signed JWT session token.
 * Returns null if token is expired, corrupted, tampered with, or signature is invalid.
 */
export async function verifySessionToken(token: string): Promise<JWTPayload | null> {
  if (!token || typeof token !== 'string') return null;

  try {
    const key = getJwtSecretKey();
    const { payload } = await jwtVerify(token, key, {
      algorithms: ['HS256'],
    });

    if (!payload.sub || typeof payload.sub !== 'string') {
      return null;
    }
    if (!payload.role || typeof payload.role !== 'string') {
      return null;
    }

    return {
      sub: payload.sub as string,
      tenantId: (payload.tenantId as string) || null,
      role: payload.role as RoleType,
      email: (payload.email as string) || '',
      firstName: payload.firstName as string | undefined,
      lastName: payload.lastName as string | undefined,
      mustChangePassword: Boolean(payload.mustChangePassword),
      iat: payload.iat,
      exp: payload.exp,
    };
  } catch {
    return null;
  }
}
