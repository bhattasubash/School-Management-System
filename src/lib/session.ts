import { cookies } from 'next/headers';
import type { JWTPayload, RoleType } from '@/types';
import { Role } from '@/types';
import {
  createSessionToken,
  verifySessionToken,
  getJwtSecretKey,
} from '@/lib/jwt';

export { createSessionToken, verifySessionToken, getJwtSecretKey };

export const SESSION_COOKIE_NAME = 'session_token';
export const SESSION_MAX_AGE = 7 * 24 * 60 * 60; // 7 days in seconds

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

import { isSessionRevoked } from '@/lib/session-revocation';

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
