'use server';

import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import { AuthService } from '@/services/auth.service';
import {
  setSessionCookie,
  clearSessionCookie,
  getSessionFromCookies,
  getRoleDefaultPath,
  createSessionToken,
} from '@/lib/session';
import {
  LoginSchema,
  ForgotPasswordSchema,
  ResetPasswordSchema,
  ChangePasswordSchema,
  type LoginInput,
  type ForgotPasswordInput,
  type ResetPasswordInput,
  type ChangePasswordInput,
} from '@/lib/validations/auth';
import { revokeAllUserSessions } from '@/lib/session-revocation';
import { resolveTenantByHostname } from '@/lib/tenant';
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

  // 2. Resolve Tenant Context server-side from request headers or verified host
  const headerList = headers();
  const headerTenantId = headerList.get('x-tenant-id');
  const isSuperAdminDomain = headerList.get('x-is-superadmin-domain') === 'true';
  const ipAddress = headerList.get('x-forwarded-for')?.split(',')[0].trim() || headerList.get('x-real-ip') || undefined;
  const userAgent = headerList.get('user-agent') || undefined;

  const rawHost = headerList.get('host') || '';
  let resolvedTenantId = credentials.tenantId || headerTenantId || null;

  if (!resolvedTenantId && !isSuperAdminDomain && rawHost) {
    const tenantContext = await resolveTenantByHostname(rawHost);
    if (tenantContext) {
      resolvedTenantId = tenantContext.tenantId;
    }
  }

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

  // 5. Determine default redirect landing page (or forced password change)
  const redirectUrl = result.mustChangePassword ? '/change-password' : getRoleDefaultPath(result.user.role);

  return {
    success: true,
    user: result.user,
    redirectUrl,
  };
}

/**
 * Server Action to sign out current user by revoking all sessions, purging the session cookie and redirecting to /login.
 */
export async function logoutAction(): Promise<void> {
  const session = await getSessionFromCookies();
  if (session?.sub) {
    await revokeAllUserSessions(session.sub);
  }
  await clearSessionCookie();
  redirect('/login');
}

/**
 * Server Action to retrieve the current active user session.
 */
export async function getCurrentUserAction() {
  return getSessionFromCookies();
}

/**
 * Server Action to request an OTP code for password reset.
 */
export async function forgotPasswordAction(
  input: ForgotPasswordInput
): Promise<{ success: boolean; message: string; error?: string }> {
  const validation = ForgotPasswordSchema.safeParse(input);
  if (!validation.success) {
    return {
      success: false,
      error: validation.error.errors[0]?.message || 'Please provide a valid email.',
      message: '',
    };
  }

  const headerList = headers();
  let tenantId = headerList.get('x-tenant-id');
  if (!tenantId) {
    const rawHost = headerList.get('host') || '';
    if (rawHost) {
      const ctx = await resolveTenantByHostname(rawHost);
      tenantId = ctx?.tenantId || null;
    }
  }

  return AuthService.requestPasswordResetOtp(validation.data.email, tenantId);
}

/**
 * Server Action to verify OTP code and update password.
 */
export async function verifyOtpAndResetAction(
  input: ResetPasswordInput
): Promise<{ success: boolean; message?: string; error?: string }> {
  const validation = ResetPasswordSchema.safeParse(input);
  if (!validation.success) {
    return {
      success: false,
      error: validation.error.errors[0]?.message || 'Invalid input verification values.',
    };
  }

  const headerList = headers();
  let tenantId = headerList.get('x-tenant-id');
  if (!tenantId) {
    const rawHost = headerList.get('host') || '';
    if (rawHost) {
      const ctx = await resolveTenantByHostname(rawHost);
      tenantId = ctx?.tenantId || null;
    }
  }

  return AuthService.verifyOtpAndResetPassword(
    validation.data.email,
    validation.data.otp,
    validation.data.newPassword,
    tenantId
  );
}

/**
 * Server Action for an authenticated user to change their password.
 */
export async function changePasswordAction(
  input: ChangePasswordInput
): Promise<{ success: boolean; message?: string; error?: string }> {
  const session = await getSessionFromCookies();
  if (!session) {
    return {
      success: false,
      error: 'You must be signed in to perform this action.',
    };
  }

  const validation = ChangePasswordSchema.safeParse(input);
  if (!validation.success) {
    return {
      success: false,
      error: validation.error.errors[0]?.message || 'Password validation failed.',
    };
  }

  const result = await AuthService.changePassword(
    session.sub,
    validation.data.currentPassword,
    validation.data.newPassword
  );

  if (result.success) {
    // Re-issue updated session token clearing mustChangePassword flag
    const updatedToken = await createSessionToken({
      sub: session.sub,
      tenantId: session.tenantId,
      role: session.role,
      email: session.email,
      firstName: session.firstName,
      lastName: session.lastName,
      mustChangePassword: false,
    });
    await setSessionCookie(updatedToken);
  }

  return result;
}
