import { z } from 'zod';

export const LoginSchema = z
  .object({
    email: z.string().min(1, 'Please enter your Roll Number, Admission ID, or Email'),
    password: z.string().min(1, 'Password is required'),
    tenantId: z.string().uuid().optional(),
  })
  .strict();

export type LoginInput = z.infer<typeof LoginSchema>;

export const ForgotPasswordSchema = z
  .object({
    email: z.string().email('Please enter a valid email address'),
  })
  .strict();

export type ForgotPasswordInput = z.infer<typeof ForgotPasswordSchema>;

export const VerifyOtpSchema = z
  .object({
    email: z.string().email('Please enter a valid email address'),
    otp: z.string().length(6, 'OTP must be exactly 6 digits'),
  })
  .strict();

export type VerifyOtpInput = z.infer<typeof VerifyOtpSchema>;

export const ResetPasswordSchema = z
  .object({
    email: z.string().email('Please enter a valid email address'),
    otp: z.string().length(6, 'OTP must be exactly 6 digits'),
    newPassword: z
      .string()
      .min(8, 'Password must be at least 8 characters long')
      .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
      .regex(/[a-z]/, 'Must contain at least one lowercase letter')
      .regex(/[0-9]/, 'Must contain at least one number')
      .regex(/[^A-Za-z0-9]/, 'Must contain at least one special character'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export type ResetPasswordInput = z.infer<typeof ResetPasswordSchema>;

export const ChangePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z
      .string()
      .min(8, 'Password must be at least 8 characters long')
      .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
      .regex(/[a-z]/, 'Must contain at least one lowercase letter')
      .regex(/[0-9]/, 'Must contain at least one number')
      .regex(/[^A-Za-z0-9]/, 'Must contain at least one special character'),
    confirmPassword: z.string().min(1, 'Please confirm your new password'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export type ChangePasswordInput = z.infer<typeof ChangePasswordSchema>;
