import { cookies } from 'next/headers';
import type { JWTPayload, RoleType } from '@/types';
import { Role } from '@/types';
import {
  createSessionToken,
  verifySessionToken,
  getJwtSecretKey,
} from '@/lib/jwt';
import { isSessionRevoked } from '@/lib/session-revocation';

export { createSessionToken, verifySessionToken, getJwtSecretKey };

export const SESSION_COOKIE_NAME = 'session_token';
export const SESSION_MAX_AGE = 7 * 24 * 60 * 60; // 7 days in seconds

export interface CookieSecurityOptions {
  httpOnly: boolean;
  secure: boolean;
  sameSite: 'lax' | 'strict' | 'none';
  path: string;
  maxAge: number;
}

/**
 * Returns security-hardened cookie configuration:
 * - httpOnly: true (prevents XSS access)
 * - secure: true in production or when COOKIE_SECURE is set
 * - sameSite: 'lax' (defends against CSRF while permitting valid top-level links)
 * - path: '/'
 */
export function getSessionCookieOptions(maxAge: number = SESSION_MAX_AGE): CookieSecurityOptions {
  const isSecure =
    process.env.NODE_ENV === 'production' ||
    process.env.COOKIE_SECURE === 'true' ||
    process.env.NEXT_PUBLIC_APP_URL?.startsWith('https://') === true;

  return {
    httpOnly: true,
    secure: isSecure,
    sameSite: 'lax',
    path: '/',
    maxAge,
  };
}

/**
 * Sets the session cookie in HTTP-only mode with secure flags.
 */
export async function setSessionCookie(token: string): Promise<void> {
  const cookieStore = cookies();
  cookieStore.set(SESSION_COOKIE_NAME, token, getSessionCookieOptions(SESSION_MAX_AGE));
}

/**
 * Deletes the session cookie to log the user out.
 */
export async function clearSessionCookie(): Promise<void> {
  const cookieStore = cookies();
  cookieStore.set(SESSION_COOKIE_NAME, '', getSessionCookieOptions(0));
}

let testSessionOverride: JWTPayload | null = null;

/**
 * For testing and offline verification only.
 */
export function setTestSessionOverride(session: JWTPayload | null) {
  testSessionOverride = session;
}

/**
 * Extracts and verifies the current session from incoming request cookies,
 * checking whether the token has been revoked.
 */
export async function getSessionFromCookies(): Promise<JWTPayload | null> {
  let token: string | undefined;

  try {
    const cookieStore = cookies();
    token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  } catch {
    // If called outside request context (e.g. test runner, background job)
    if (process.env.NODE_ENV !== 'production' && testSessionOverride) {
      return testSessionOverride;
    }
    return null;
  }

  if (!token) {
    if (process.env.NODE_ENV !== 'production' && testSessionOverride) {
      return testSessionOverride;
    }
    return null;
  }

  const payload = await verifySessionToken(token);
  if (!payload) return null;

  // Check if session has been revoked (e.g. after password change, reset, or logout)
  if (payload.sub && payload.iat) {
    const revoked = await isSessionRevoked(payload.sub, payload.iat);
    if (revoked) return null;
  }

  return payload;
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
      return '/portal'; // Unified Student & Parent Portal
    default:
      return '/portal';
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
