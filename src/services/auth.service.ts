import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/db';
import { redis } from '@/lib/redis';
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
const OTP_TTL_SECONDS = 600; // 10 minutes

// Fallback in-memory store for OTPs if Redis is unavailable
const memoryOtpStore = new Map<string, { hash: string; expiresAt: number }>();

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
   */
  static async login(
    input: LoginInput,
    tenantId: string | null,
    metadata?: { ipAddress?: string; userAgent?: string }
  ): Promise<AuthenticationResult> {
    const email = input.email.toLowerCase().trim();

    let user;
    if (tenantId) {
      user = await prisma.user.findFirst({
        where: {
          tenantId,
          email,
        },
      });
    } else {
      user = await prisma.user.findFirst({
        where: {
          email,
          role: 'SUPER_ADMIN',
        },
      });

      if (!user) {
        user = await prisma.user.findFirst({
          where: {
            email,
          },
        });
      }
    }

    if (!user) {
      await bcrypt.compare(input.password, '$2a$12$e80y6jF3Q8ZpXqFmNfAweOXV4O1t9/4B4/K3/l4l6Wn/z1z1z1z1z');
      return {
        success: false,
        error: 'Invalid email or password.',
      };
    }

    if (!user.isActive || user.deletedAt !== null) {
      return {
        success: false,
        error: 'This account has been deactivated. Please contact your school administrator.',
      };
    }

    if (user.lockedUntil && user.lockedUntil > new Date()) {
      const remainingMinutes = Math.ceil((user.lockedUntil.getTime() - Date.now()) / 60000);
      return {
        success: false,
        error: `Account is temporarily locked due to multiple failed login attempts. Please try again in ${remainingMinutes} minute(s).`,
      };
    }

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
      } catch {}

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

    await prisma.user.update({
      where: { id: user.id },
      data: {
        failedLoginAttempts: 0,
        lockedUntil: null,
        lastLoginAt: new Date(),
      },
    });

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
      mustChangePassword: user.mustChangePassword,
    };

    const token = await createSessionToken({
      sub: user.id,
      tenantId: user.tenantId,
      role: user.role as RoleType,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      mustChangePassword: user.mustChangePassword,
    });

    return {
      success: true,
      user: sessionUser,
      token,
      mustChangePassword: user.mustChangePassword,
    };
  }

  /**
   * Generates a secure 6-digit OTP for password reset and stores it in Redis (or memory fallback).
   */
  static async requestPasswordResetOtp(
    email: string,
    tenantId?: string | null
  ): Promise<{ success: boolean; message: string }> {
    const normalizedEmail = email.toLowerCase().trim();

    // Verify user exists and is active
    let user;
    if (tenantId) {
      user = await prisma.user.findFirst({
        where: { tenantId, email: normalizedEmail, deletedAt: null, isActive: true },
      });
    } else {
      user = await prisma.user.findFirst({
        where: { email: normalizedEmail, deletedAt: null, isActive: true },
      });
    }

    // Always return generic success message to prevent user enumeration
    if (!user) {
      return {
        success: true,
        message: 'If an active account exists with this email, a verification code has been dispatched.',
      };
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpHash = await bcrypt.hash(otp, 8);
    const storageKey = `otp:${user.tenantId || 'global'}:${normalizedEmail}`;

    let storedInRedis = false;
    if (redis) {
      try {
        await redis.set(storageKey, otpHash, 'EX', OTP_TTL_SECONDS);
        storedInRedis = true;
      } catch (err) {
        // Fallback to memory
      }
    }

    if (!storedInRedis) {
      memoryOtpStore.set(storageKey, {
        hash: otpHash,
        expiresAt: Date.now() + OTP_TTL_SECONDS * 1000,
      });
    }

    // Log to console (stub for WhatsApp / SMS gateway dispatch in Phase 15)
    console.log(`\n======================================================`);
    console.log(`[AUTH-OTP-DISPATCH] Reset OTP for: ${normalizedEmail}`);
    console.log(`Code: ${otp} (Valid for 10 minutes)`);
    console.log(`======================================================\n`);

    return {
      success: true,
      message: 'If an active account exists with this email, a verification code has been dispatched.',
    };
  }

  /**
   * Verifies the 6-digit OTP and resets the user's password.
   */
  static async verifyOtpAndResetPassword(
    email: string,
    otp: string,
    newPassword: string,
    tenantId?: string | null
  ): Promise<{ success: boolean; message?: string; error?: string }> {
    const normalizedEmail = email.toLowerCase().trim();

    // Find user
    let user;
    if (tenantId) {
      user = await prisma.user.findFirst({
        where: { tenantId, email: normalizedEmail, deletedAt: null, isActive: true },
      });
    } else {
      user = await prisma.user.findFirst({
        where: { email: normalizedEmail, deletedAt: null, isActive: true },
      });
    }

    if (!user) {
      return { success: false, error: 'Invalid or expired verification request.' };
    }

    const storageKey = `otp:${user.tenantId || 'global'}:${normalizedEmail}`;
    let storedHash: string | null = null;

    if (redis) {
      try {
        storedHash = await redis.get(storageKey);
      } catch {
        // Fallback to memory
      }
    }

    if (!storedHash) {
      const memoryEntry = memoryOtpStore.get(storageKey);
      if (memoryEntry && memoryEntry.expiresAt > Date.now()) {
        storedHash = memoryEntry.hash;
      }
    }

    if (!storedHash) {
      return { success: false, error: 'Verification code has expired or is invalid. Please request a new code.' };
    }

    const isOtpValid = await bcrypt.compare(otp.trim(), storedHash);
    if (!isOtpValid) {
      return { success: false, error: 'Incorrect verification code. Please check and try again.' };
    }

    // Hash new password and update user
    const newPasswordHash = await this.hashPassword(newPassword);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash: newPasswordHash,
        mustChangePassword: false,
        failedLoginAttempts: 0,
        lockedUntil: null,
      },
    });

    // Invalidate OTP (single-use)
    if (redis) {
      try {
        await redis.del(storageKey);
      } catch {}
    }
    memoryOtpStore.delete(storageKey);

    // Audit log
    try {
      await prisma.auditLog.create({
        data: {
          tenantId: user.tenantId,
          userId: user.id,
          action: 'PASSWORD_RESET_SUCCESS',
          entityType: 'User',
          entityId: user.id,
        },
      });
    } catch {}

    return {
      success: true,
      message: 'Your password has been successfully reset. You may now sign in with your new credentials.',
    };
  }

  /**
   * Allows an authenticated user to change their password by validating their current password.
   */
  static async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string
  ): Promise<{ success: boolean; message?: string; error?: string }> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || !user.isActive || user.deletedAt) {
      return { success: false, error: 'User account not found or deactivated.' };
    }

    const isCurrentValid = await this.verifyPassword(currentPassword, user.passwordHash);
    if (!isCurrentValid) {
      return { success: false, error: 'Current password is incorrect.' };
    }

    const newHash = await this.hashPassword(newPassword);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash: newHash,
        mustChangePassword: false,
      },
    });

    try {
      await prisma.auditLog.create({
        data: {
          tenantId: user.tenantId,
          userId: user.id,
          action: 'PASSWORD_CHANGE_SUCCESS',
          entityType: 'User',
          entityId: user.id,
        },
      });
    } catch {}

    return {
      success: true,
      message: 'Password changed successfully.',
    };
  }
}
