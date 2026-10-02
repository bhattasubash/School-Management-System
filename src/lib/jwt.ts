import { SignJWT, jwtVerify } from 'jose';
import type { JWTPayload, RoleType } from '@/types';

/**
 * Authoritative JWT Secret Retrieval.
 * Strictly requires JWT_SECRET >= 32 characters in all environments outside of unit test execution.
 * Fails closed with a fatal error if missing or too short.
 */
export function getJwtSecretKey(): Uint8Array {
  const secret = process.env.JWT_SECRET;

  if (secret && secret.trim().length >= 32) {
    return new TextEncoder().encode(secret.trim());
  }

  // Outside test environment, fail closed with fatal configuration error
  if (process.env.NODE_ENV !== 'test') {
    throw new Error(
      'FATAL SECURITY MISCONFIGURATION: JWT_SECRET environment variable must be set with at least 32 characters.'
    );
  }

  // Dedicated test-only ephemeral key (for CI test execution where env may not be loaded)
  return new TextEncoder().encode('test-environment-ephemeral-secret-min-32-chars!!');
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
