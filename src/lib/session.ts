import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import type { JWTPayload, RoleType } from '@/types';
import { Role } from '@/types';

export const SESSION_COOKIE_NAME = 'session_token';
export const SESSION_MAX_AGE = 7 * 24 * 60 * 60; // 7 days in seconds

function getSecretKey(): Uint8Array {
  const secret = process.env.JWT_SECRET || 'school-erp-super-secure-jwt-secret-min-32-chars-long';
  return new TextEncoder().encode(secret);
}

/**
 * Creates a signed JWT session token valid for 7 days.
 */
export async function createSessionToken(payload: Omit<JWTPayload, 'iat' | 'exp'>): Promise<string> {
  const key = getSecretKey();
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(key);
}

/**
 * Verifies and decodes a signed JWT session token.
 * Returns null if token is expired, corrupted, or tampered.
 */
export async function verifySessionToken(token: string): Promise<JWTPayload | null> {
  try {
    const key = getSecretKey();
    const { payload } = await jwtVerify(token, key, {
      algorithms: ['HS256'],
    });

    return {
      sub: payload.sub as string,
      tenantId: (payload.tenantId as string) || null,
      role: payload.role as RoleType,
      email: payload.email as string,
      firstName: payload.firstName as string | undefined,
      lastName: payload.lastName as string | undefined,
      iat: payload.iat,
      exp: payload.exp,
    };
  } catch {
    return null;
  }
}

/**
 * Sets the session cookie in HTTP-only mode.
 */
export async function setSessionCookie(token: string): Promise<void> {
  const cookieStore = cookies();
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_MAX_AGE,
  });
}

/**
 * Deletes the session cookie to log the user out.
 */
export async function clearSessionCookie(): Promise<void> {
  const cookieStore = cookies();
  cookieStore.set(SESSION_COOKIE_NAME, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });
}

/**
 * Extracts and verifies the current session from incoming request cookies.
 */
export async function getSessionFromCookies(): Promise<JWTPayload | null> {
  const cookieStore = cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!token) return null;
  return verifySessionToken(token);
}

/**
 * Resolves the primary dashboard landing route based on user role.
 * Note: Students and Parents both use the same student dashboard (/).
 */
export function getRoleDefaultPath(role: RoleType): string {
  switch (role) {
    case Role.SUPER_ADMIN:
      return '/superadmin';
    case Role.ADMIN:
      return '/admin';
    case Role.TEACHER:
      return '/teacher';
    case Role.ACCOUNTANT:
      return '/admin/fees';
    case Role.STUDENT:
    case Role.PARENT:
      return '/'; // Unified Student & Parent Portal
    default:
      return '/';
  }
}

/**
 * Checks if a given role is allowed access to a target path.
 */
export function isRouteAllowedForRole(role: RoleType, pathname: string): boolean {
  // Super admin can inspect all dashboards
  if (role === Role.SUPER_ADMIN) return true;

  if (pathname.startsWith('/superadmin')) {
    return false;
  }

  if (pathname.startsWith('/admin/fees')) {
    return role === Role.ADMIN || role === Role.ACCOUNTANT;
  }

  if (pathname.startsWith('/admin')) {
    return role === Role.ADMIN;
  }

  if (pathname.startsWith('/teacher')) {
    return role === Role.TEACHER;
  }

  // Unified student/parent portal routes
  if (pathname === '/' || pathname.startsWith('/portal')) {
    return role === Role.STUDENT || role === Role.PARENT || role === Role.ADMIN;
  }

  return true;
}
