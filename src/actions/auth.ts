'use server';

import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import { AuthService } from '@/services/auth.service';
import { setSessionCookie, clearSessionCookie, getSessionFromCookies, getRoleDefaultPath } from '@/lib/session';
import { LoginSchema, type LoginInput } from '@/lib/validations/auth';
import type { AuthResult } from '@/types';

/**
 * Server Action for authenticating users.
 * Validates credentials against scoped tenant context and issues HTTP-only session cookie.
 */
export async function loginAction(input: LoginInput): Promise<AuthResult> {
  // 1. Boundary Zod validation
  const validationResult = LoginSchema.safeParse(input);
  if (!validationResult.success) {
    const errorMsg = validationResult.error.errors.map((e) => e.message).join(', ');
    return {
      success: false,
      error: errorMsg || 'Invalid input credentials.',
    };
  }

  const credentials = validationResult.data;

  // 2. Resolve Tenant Context server-side from request headers
  const headerList = headers();
  const headerTenantId = headerList.get('x-tenant-id');
  const isSuperAdminDomain = headerList.get('x-is-superadmin-domain') === 'true';
  const ipAddress = headerList.get('x-forwarded-for')?.split(',')[0].trim() || headerList.get('x-real-ip') || undefined;
  const userAgent = headerList.get('user-agent') || undefined;

  // Allow explicit tenantId from credentials if provided (e.g. testing/multi-tenant switcher), otherwise use header context
  const resolvedTenantId = credentials.tenantId || headerTenantId || (isSuperAdminDomain ? null : null);

  // 3. Authenticate with AuthService
  const result = await AuthService.login(credentials, resolvedTenantId, { ipAddress, userAgent });

  if (!result.success || !result.token || !result.user) {
    return {
      success: false,
      error: result.error || 'Authentication failed.',
    };
  }

  // 4. Set HTTP-only secure cookie
  await setSessionCookie(result.token);

  // 5. Determine default redirect landing page
  const redirectUrl = getRoleDefaultPath(result.user.role);

  return {
    success: true,
    user: result.user,
    redirectUrl,
  };
}

/**
 * Server Action to sign out current user by purging the session cookie and redirecting to /login.
 */
export async function logoutAction(): Promise<void> {
  await clearSessionCookie();
  redirect('/login');
}

/**
 * Server Action to retrieve the current active user session.
 */
export async function getCurrentUserAction() {
  return getSessionFromCookies();
}
