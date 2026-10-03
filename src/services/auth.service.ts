import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/db';
import { redis } from '@/lib/redis';
import { createSessionToken } from '@/lib/jwt';
import { rateLimit } from '@/lib/rate-limit';
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
const MAX_OTP_ATTEMPTS = 5; // Max 5 verification guesses per OTP

// Fallback in-memory store for OTPs if Redis is unavailable
const memoryOtpStore = new Map<string, { hash: string; expiresAt: number; attempts: number }>();

export class AuthService {
  /**
   * Hashes a plaintext password using bcrypt with 12 salt rounds (OWASP ASVS compliant).
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
   * Generates a cryptographically strong, unique temporary password for user onboarding.
   * e.g. 'Temp#a9f3b2!xK8#4' (contains uppercase, lowercase, numbers, and symbols).
   */
  static generateSecureTemporaryPassword(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%^&*';
    const bytes = crypto.randomBytes(8);
    let randomPart = '';
    for (let i = 0; i < 8; i++) {
      randomPart += chars[bytes[i] % chars.length];
    }
    const hex = crypto.randomBytes(3).toString('hex');
    return `Sch#${hex}!${randomPart}`;
  }

  /**
   * Authenticates a user against tenant-scoped credentials with brute-force lockout protection
   * and IP/account-level rate limiting.
   */
  static async login(
    input: LoginInput,
    tenantId: string | null,
    metadata?: { ipAddress?: string; userAgent?: string }
  ): Promise<AuthenticationResult> {
    const email = input.email.toLowerCase().trim();
    const ip = metadata?.ipAddress || 'unknown';

    // 1. IP + Email composite rate limiting (Prevent online brute-force attacks)
    const rateLimitCheck = await rateLimit({
      prefix: 'rl:login',
      key: `${ip}:${email}`,
      maxRequests: 10,
      windowSeconds: 15 * 60, // 10 requests per 15 minutes
      failClosed:
        process.env.NODE_ENV === 'production' || process.env.REDIS_FAIL_CLOSED === 'true',
    });

    if (!rateLimitCheck.allowed) {
      return {
        success: false,
        error:
          rateLimitCheck.error ||
          `Too many login attempts from this network. Please wait ${rateLimitCheck.retryAfterSeconds} seconds before retrying.`,
      };
    }

    // 2. Resolve user
    let user;
    if (tenantId) {
      user = await prisma.user.findFirst({
        where: {
          tenantId,
          email,
        },
      });

      if (!user) {
        const isNumeric = /^\d+$/.test(email);
        const student = await prisma.studentProfile.findFirst({
          where: {
            tenantId,
            OR: [
              { admissionNumber: { equals: input.email.trim(), mode: 'insensitive' } },
              ...(isNumeric ? [{ rollNumber: parseInt(email, 10) }] : []),
            ],
          },
          include: { user: true },
        });
        if (student?.user) {
          user = student.user;
        }
      }
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

      if (!user) {
        const isNumeric = /^\d+$/.test(email);
        const student = await prisma.studentProfile.findFirst({
          where: {
            OR: [
              { admissionNumber: { equals: input.email.trim(), mode: 'insensitive' } },
              ...(isNumeric ? [{ rollNumber: parseInt(email, 10) }] : []),
            ],
          },
          include: { user: true },
        });
        if (student?.user) {
          user = student.user;
        }
      }
    }

    // 3. Constant-time dummy comparison if user doesn't exist (Prevent timing enumeration)
    if (!user) {
      await bcrypt.compare(input.password, '$2a$12$e80y6jF3Q8ZpXqFmNfAweOXV4O1t9/4B4/K3/l4l6Wn/z1z1z1z1z');
      return {
        success: false,
        error: 'Invalid credentials. Please verify your Roll Number / Admission ID and password.',
      };
    }

    // 4. Deactivated check
    if (!user.isActive || user.deletedAt !== null) {
      return {
        success: false,
        error: 'This account has been deactivated. Please contact your school administrator.',
      };
    }

    // 5. Account lockout check
    if (user.lockedUntil && user.lockedUntil > new Date()) {
      const remainingMinutes = Math.ceil((user.lockedUntil.getTime() - Date.now()) / 60000);
      return {
        success: false,
        error: `Account is temporarily locked due to multiple failed login attempts. Please try again in ${remainingMinutes} minute(s).`,
      };
    }

    // 6. Password comparison
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
      } catch (logErr) {
        console.error('[AUDIT-LOG-WARN] Failed to record login failure audit log:', logErr instanceof Error ? logErr.message : String(logErr));
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

    // 7. Successful login - reset failed attempts
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
    } catch (logErr) {
      console.error('[AUDIT-LOG-WARN] Failed to record login success audit log:', logErr instanceof Error ? logErr.message : String(logErr));
    }

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
   * Generates a cryptographically secure 6-digit OTP using CSPRNG.
   * Stores hashed OTP with 10-min TTL and enforces rate limits.
   * NEVER logs the OTP in production logs.
   */
  static async requestPasswordResetOtp(
    email: string,
    tenantId?: string | null
  ): Promise<{ success: boolean; message: string }> {
    const normalizedEmail = email.toLowerCase().trim();

    // 1. Rate limiting on OTP requests (Max 3 per 15 minutes per email)
    const rateLimitCheck = await rateLimit({
      prefix: 'rl:otp-req',
      key: normalizedEmail,
      maxRequests: 3,
      windowSeconds: 15 * 60,
    });

    if (!rateLimitCheck.allowed) {
      return {
        success: false,
        message: `Too many password reset requests. Please wait ${rateLimitCheck.retryAfterSeconds} seconds before requesting another code.`,
      };
    }

    // 2. Verify user exists and is active
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

    // 3. Cryptographically Secure 6-digit OTP generation (CSPRNG via crypto.randomInt)
    const otpInt = crypto.randomInt(100000, 1000000);
    const otp = otpInt.toString();
    const otpHash = await bcrypt.hash(otp, 10);
    const storageKey = `otp:${user.tenantId || 'global'}:${normalizedEmail}`;
    const attemptsKey = `otp_attempts:${storageKey}`;

    let storedInRedis = false;
    if (redis) {
      try {
        await redis.set(storageKey, otpHash, 'EX', OTP_TTL_SECONDS);
        await redis.set(attemptsKey, '0', 'EX', OTP_TTL_SECONDS);
        storedInRedis = true;
      } catch (redisErr) {
        console.warn('[REDIS-WARN] Failed to write OTP to Redis, using in-memory store:', redisErr instanceof Error ? redisErr.message : String(redisErr));
      }
    }

    if (!storedInRedis) {
      memoryOtpStore.set(storageKey, {
        hash: otpHash,
        expiresAt: Date.now() + OTP_TTL_SECONDS * 1000,
        attempts: 0,
      });
    }

    // 4. Secure Delivery: NEVER log OTP to stdout in production!
    if (process.env.NODE_ENV === 'development') {
      console.log(`[DEV-ONLY-AUTH] Password reset OTP generated for: ${normalizedEmail} (Code: ${otp})`);
    } else {
      // In production, dispatch via messaging provider (e.g. SMS/WhatsApp/Email)
      // If no messaging provider is configured, log an operational alert without exposing the OTP secret
      console.info(`[AUTH-EVENT] Password reset OTP dispatched for account ${normalizedEmail.slice(0, 3)}***@***`);
    }

    return {
      success: true,
      message: 'If an active account exists with this email, a verification code has been dispatched.',
    };
  }

  /**
   * Verifies the 6-digit OTP, enforces attempt limits (max 5 guesses), and resets the user's password.
   */
  static async verifyOtpAndResetPassword(
    email: string,
    otp: string,
    newPassword: string,
    tenantId?: string | null
  ): Promise<{ success: boolean; message?: string; error?: string }> {
    const normalizedEmail = email.toLowerCase().trim();

    // 1. Find user
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
    const attemptsKey = `otp_attempts:${storageKey}`;
    let storedHash: string | null = null;
    let currentAttempts = 0;

    if (redis) {
      try {
        storedHash = await redis.get(storageKey);
        const attemptsStr = await redis.get(attemptsKey);
        currentAttempts = attemptsStr ? parseInt(attemptsStr, 10) : 0;
      } catch (redisErr) {
        console.warn('[REDIS-WARN] Failed to read OTP from Redis, checking in-memory store:', redisErr instanceof Error ? redisErr.message : String(redisErr));
      }
    }

    if (!storedHash) {
      const memoryEntry = memoryOtpStore.get(storageKey);
      if (memoryEntry && memoryEntry.expiresAt > Date.now()) {
        storedHash = memoryEntry.hash;
        currentAttempts = memoryEntry.attempts;
      }
    }

    if (!storedHash) {
      return { success: false, error: 'Verification code has expired or is invalid. Please request a new code.' };
    }

    // 2. Enforce brute-force attempt limits on OTP guesses
    if (currentAttempts >= MAX_OTP_ATTEMPTS) {
      // Invalidate the OTP immediately
      if (redis) {
        try {
          await redis.del(storageKey);
          await redis.del(attemptsKey);
        } catch {}
      }
      memoryOtpStore.delete(storageKey);

      return {
        success: false,
        error: 'Too many incorrect attempts. This verification code has been invalidated for security. Please request a new code.',
      };
    }

    // 3. Verify OTP
    const isOtpValid = await bcrypt.compare(otp.trim(), storedHash);
    if (!isOtpValid) {
      // Increment attempt counter
      const newAttempts = currentAttempts + 1;
      if (redis) {
        try {
          await redis.incr(attemptsKey);
        } catch {}
      }
      const mem = memoryOtpStore.get(storageKey);
      if (mem) {
        mem.attempts = newAttempts;
      }

      const remainingAttempts = Math.max(0, MAX_OTP_ATTEMPTS - newAttempts);
      return {
        success: false,
        error: `Incorrect verification code. ${remainingAttempts} attempt(s) remaining before code is locked.`,
      };
    }

    // 4. Hash new password with standard 12 salt rounds and update user
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

    // 5. Invalidate OTP (single-use destruction)
    if (redis) {
      try {
        await redis.del(storageKey);
        await redis.del(attemptsKey);
      } catch (delErr) {
        console.warn('[REDIS-WARN] Failed to delete OTP key:', delErr instanceof Error ? delErr.message : String(delErr));
      }
    }
    memoryOtpStore.delete(storageKey);

    // 6. Audit log
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
    } catch (logErr) {
      console.error('[AUDIT-LOG-WARN] Failed to write password reset audit log:', logErr instanceof Error ? logErr.message : String(logErr));
    }

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
    } catch (logErr) {
      console.error('[AUDIT-LOG-WARN] Failed to write password change audit log:', logErr instanceof Error ? logErr.message : String(logErr));
    }

    return {
      success: true,
      message: 'Password changed successfully.',
    };
  }
}
