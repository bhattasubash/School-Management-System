import { getSessionFromCookies } from '@/lib/session';
import type { JWTPayload, RoleType } from '@/types';

export interface GuardedSession {
  session: JWTPayload;
  userId: string;
  tenantId: string;
  role: RoleType;
}

export type GuardResult =
  | { success: true; context: GuardedSession }
  | { success: false; error: string; statusCode: number; mustChangePassword?: boolean };

/**
 * Authoritative Server-Side Authorization Guard.
 * Enforces:
 * 1. Active JWT session authentication.
 * 2. Role-based access control (RBAC).
 * 3. Tenant context presence.
 * 4. Password-change requirement (blocks users with mustChangePassword from sensitive mutations).
 */
export async function requireAuthGuard(
  allowedRoles?: RoleType[],
  options?: { allowMustChangePassword?: boolean; requireTenant?: boolean }
): Promise<GuardResult> {
  const session = await getSessionFromCookies();

  if (!session) {
    return {
      success: false,
      error: 'Unauthorized: Valid session required.',
      statusCode: 401,
    };
  }

  // 1. Role verification
  if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(session.role)) {
    return {
      success: false,
      error: 'Forbidden: Insufficient privileges for this operation.',
      statusCode: 403,
    };
  }

  // 2. mustChangePassword gate: blocked from all sensitive mutations
  if (session.mustChangePassword && !options?.allowMustChangePassword) {
    return {
      success: false,
      error: 'Password change required: You must change your default password before performing operations.',
      statusCode: 403,
      mustChangePassword: true,
    };
  }

  // 3. Tenant context enforcement (for non-SuperAdmin operations)
  const requireTenant = options?.requireTenant ?? (session.role !== 'SUPER_ADMIN');
  if (requireTenant && !session.tenantId) {
    return {
      success: false,
      error: 'Tenant context required.',
      statusCode: 400,
    };
  }

  return {
    success: true,
    context: {
      session,
      userId: session.sub,
      tenantId: session.tenantId || '',
      role: session.role,
    },
  };
}
