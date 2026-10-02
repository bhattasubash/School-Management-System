import { z } from 'zod';
import { NotificationType } from '@prisma/client';

export const SendNotificationSchema = z.object({
  recipientId: z.string().uuid('Valid recipient ID required'),
  title: z.string().min(2, 'Title must be at least 2 characters').max(200),
  body: z.string().min(2, 'Body must be at least 2 characters').max(2000),
  type: z.nativeEnum(NotificationType).default(NotificationType.GENERAL),
  actionUrl: z.string().url('Must be a valid URL or path').or(z.string().startsWith('/')).optional(),
  metadata: z.record(z.any()).optional(),
});

export type SendNotificationInput = z.infer<typeof SendNotificationSchema>;

export const NotificationAudienceEnum = z.enum([
  'ALL',
  'TEACHERS',
  'PARENTS',
  'STUDENTS',
  'SPECIFIC_CLASS',
]);
export type NotificationAudience = z.infer<typeof NotificationAudienceEnum>;

export const SendBroadcastNotificationSchema = z.object({
  audience: NotificationAudienceEnum,
  sectionId: z.string().uuid().optional(),
  classGradeId: z.string().uuid().optional(),
  title: z.string().min(2, 'Title must be at least 2 characters').max(200),
  body: z.string().min(2, 'Body must be at least 2 characters').max(2000),
  type: z.nativeEnum(NotificationType).default(NotificationType.GENERAL),
  actionUrl: z.string().optional(),
});

export type SendBroadcastNotificationInput = z.infer<typeof SendBroadcastNotificationSchema>;

export const BookAppointmentSchema = z.object({
  authorityContactId: z.string().uuid('Valid contact or authority ID required'),
  authorityName: z.string().min(1),
  preferredDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Format must be YYYY-MM-DD'),
  preferredTimeSlot: z.string().optional(),
  purpose: z.string().min(5, 'Please provide purpose for appointment').max(500),
  phone: z.string().optional(),
});

export type BookAppointmentInput = z.infer<typeof BookAppointmentSchema>;
