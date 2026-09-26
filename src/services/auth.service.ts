import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/db';
import { createSessionToken } from '@/lib/session';
import type { LoginInput } from '@/lib/validations/auth';
import type { RoleType, UserSession } from '@/types';

export interface AuthenticationResult {
  success: boolean;
  user?: UserSession;
  token?: string;
  error?: string;
  mustChangePassword?: boolean;
}

const BCRYPT_SALT_ROUNDS = 12;
const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 minutes

export class AuthService {
  /**
   * Hashes a plaintext password using bcrypt with 12 salt rounds.
   */
  static async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, BCRYPT_SALT_ROUNDS);
  }

  /**
   * Compares a plaintext password against a bcrypt hash.
   */
  static async verifyPassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  /**
   * Authenticates a user against tenant-scoped credentials with brute-force lockout protection.
   *
   * @param input Credentials { email, password }
   * @param tenantId Tenant UUID or null (for platform super admin)
   * @param metadata Client IP / User-Agent for audit log tracking
   */
  static async login(
    input: LoginInput,
    tenantId: string | null,
    metadata?: { ipAddress?: string; userAgent?: string }
  ): Promise<AuthenticationResult> {
    const email = input.email.toLowerCase().trim();

    // 1. Resolve user query:
    // If tenantId is provided, strictly scope query to that tenant.
    // If tenantId is null (e.g. localhost / super-admin domain), search by email
    // across all users so tenant accounts also work in local development.
    // Role-based route guards (middleware) enforce dashboard access post-login.
    const user = tenantId
      ? await prisma.user.findFirst({
          where: {
            tenantId,
            email,
            deletedAt: null,
          },
        })
      : await prisma.user.findFirst({
          where: {
            email,
            deletedAt: null,
          },
        });

    // Timing-attack prevention & invalid user response
    if (!user) {
      // Execute a dummy compare to avoid timing side-channels
      await bcrypt.compare(input.password, '$2a$12$e80y6jF3Q8ZpXqFmNfAweOXV4O1t9/4B4/K3/l4l6Wn/z1z1z1z1z');
      return {
        success: false,
        error: 'Invalid email or password.',
      };
    }

    // 2. Account active check
    if (!user.isActive) {
      return {
        success: false,
        error: 'This account has been deactivated. Please contact your school administrator.',
      };
    }

    // 3. Brute-force lockout verification
    if (user.lockedUntil && user.lockedUntil > new Date()) {
      const remainingMinutes = Math.ceil((user.lockedUntil.getTime() - Date.now()) / 60000);
      return {
        success: false,
        error: `Account is temporarily locked due to multiple failed login attempts. Please try again in ${remainingMinutes} minute(s).`,
      };
    }

    // 4. Verify password
    const isPasswordValid = await this.verifyPassword(input.password, user.passwordHash);

    if (!isPasswordValid) {
      const failedAttempts = user.failedLoginAttempts + 1;
      const isNowLocked = failedAttempts >= MAX_FAILED_ATTEMPTS;
      const lockedUntil = isNowLocked ? new Date(Date.now() + LOCKOUT_DURATION_MS) : null;

      await prisma.user.update({
        where: { id: user.id },
        data: {
          failedLoginAttempts: failedAttempts,
          lockedUntil,
        },
      });

      // Audit log entry for failed attempt
      try {
        await prisma.auditLog.create({
          data: {
            tenantId: user.tenantId,
            userId: user.id,
            action: 'FAILED_LOGIN_ATTEMPT',
            entityType: 'User',
            entityId: user.id,
            ipAddress: metadata?.ipAddress,
            userAgent: metadata?.userAgent,
            newValues: { failedAttempts, isNowLocked },
          },
        });
      } catch {
        // Defensive: never fail login response because audit log write failed
      }

      if (isNowLocked) {
        return {
          success: false,
          error: 'Account locked for 15 minutes due to 5 consecutive failed login attempts.',
        };
      }

      return {
        success: false,
        error: 'Invalid email or password.',
      };
    }

    // 5. Successful login: reset failed attempts, update last login
    await prisma.user.update({
      where: { id: user.id },
      data: {
        failedLoginAttempts: 0,
        lockedUntil: null,
        lastLoginAt: new Date(),
      },
    });

    // Audit log entry for successful login
    try {
      await prisma.auditLog.create({
        data: {
          tenantId: user.tenantId,
          userId: user.id,
          action: 'USER_LOGIN',
          entityType: 'User',
          entityId: user.id,
          ipAddress: metadata?.ipAddress,
          userAgent: metadata?.userAgent,
        },
      });
    } catch {}

    const sessionUser: UserSession = {
      userId: user.id,
      tenantId: user.tenantId,
      role: user.role as RoleType,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      avatarUrl: user.avatarUrl,
    };

    // Issue JWT session token
    const token = await createSessionToken({
      sub: user.id,
      tenantId: user.tenantId,
      role: user.role as RoleType,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
    });

    return {
      success: true,
      user: sessionUser,
      token,
    };
  }
}
