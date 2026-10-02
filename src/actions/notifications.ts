'use server';

import { safeRevalidatePath as revalidatePath } from '@/lib/revalidate';
import { prisma } from '@/lib/db';
import { requireAuthGuard } from '@/lib/auth-guard';
import { Role } from '@/types';
import { NotificationService } from '@/services/notification.service';
import {
  SendBroadcastNotificationSchema,
  type SendBroadcastNotificationInput,
  BookAppointmentSchema,
  type BookAppointmentInput,
} from '@/lib/validations/notifications';
import { NotificationType } from '@prisma/client';

/**
 * Retrieves paginated notifications for the current authenticated user.
 */
export async function getUserNotificationsAction(options?: {
  unreadOnly?: boolean;
  type?: NotificationType;
  page?: number;
  limit?: number;
}) {
  const guard = await requireAuthGuard();
  if (!guard.success) {
    return { success: false as const, error: guard.error };
  }

  const { tenantId, userId } = guard.context;

  try {
    const data = await NotificationService.getUserNotifications(
      tenantId,
      userId,
      options
    );
    return { success: true as const, ...data };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to retrieve notifications.';
    return { success: false as const, error: message };
  }
}

/**
 * Retrieves unread notification count for the current authenticated user.
 */
export async function getUnreadNotificationCountAction() {
  const guard = await requireAuthGuard();
  if (!guard.success) {
    return { success: false, count: 0 };
  }

  const { tenantId, userId } = guard.context;

  try {
    const count = await NotificationService.getUnreadCount(tenantId, userId);
    return { success: true, count };
  } catch {
    return { success: false, count: 0 };
  }
}

/**
 * Marks a specific notification as read.
 */
export async function markNotificationAsReadAction(notificationId: string) {
  const guard = await requireAuthGuard();
  if (!guard.success) {
    return { success: false, error: guard.error };
  }

  const { tenantId, userId } = guard.context;

  try {
    await NotificationService.markAsRead(tenantId, notificationId, userId);
    revalidatePath('/admin');
    revalidatePath('/');
    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to mark notification as read.';
    return { success: false, error: message };
  }
}

/**
 * Marks all notifications for the current user as read.
 */
export async function markAllNotificationsAsReadAction() {
  const guard = await requireAuthGuard();
  if (!guard.success) {
    return { success: false, error: guard.error };
  }

  const { tenantId, userId } = guard.context;

  try {
    await NotificationService.markAllAsRead(tenantId, userId);
    revalidatePath('/admin');
    revalidatePath('/');
    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to mark all as read.';
    return { success: false, error: message };
  }
}

/**
 * Sends a broadcast notification (Admin only).
 */
export async function sendBroadcastNotificationAction(rawInput: SendBroadcastNotificationInput) {
  const guard = await requireAuthGuard([Role.ADMIN, Role.SUPER_ADMIN]);
  if (!guard.success) {
    return { success: false, error: guard.error };
  }

  const validation = SendBroadcastNotificationSchema.safeParse(rawInput);
  if (!validation.success) {
    return {
      success: false,
      error: validation.error.errors.map((e) => e.message).join(', '),
    };
  }

  const { tenantId, userId } = guard.context;

  try {
    const result = await NotificationService.sendToAudience({
      tenantId,
      audience: validation.data.audience,
      sectionId: validation.data.sectionId,
      classGradeId: validation.data.classGradeId,
      title: validation.data.title,
      body: validation.data.body,
      type: validation.data.type,
      actionUrl: validation.data.actionUrl,
    });

    // Record audit log
    await prisma.auditLog.create({
      data: {
        tenantId,
        userId,
        action: 'NOTIFICATION_BROADCAST',
        entityType: 'Notification',
        entityId: 'broadcast',
        newValues: {
          audience: validation.data.audience,
          title: validation.data.title,
          count: result.count,
        },
      },
    });

    revalidatePath('/admin');
    revalidatePath('/');
    return { success: true, count: result.count };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to send broadcast.';
    return { success: false, error: message };
  }
}

/**
 * Books an appointment with an institutional authority or administrator.
 * Automatically delivers an in-app notification to school administration / designated user.
 */
export async function bookAuthorityAppointmentAction(rawInput: BookAppointmentInput) {
  const guard = await requireAuthGuard();
  if (!guard.success) {
    return { success: false, error: guard.error };
  }

  const validation = BookAppointmentSchema.safeParse(rawInput);
  if (!validation.success) {
    return {
      success: false,
      error: validation.error.errors.map((e) => e.message).join(', '),
    };
  }

  const { tenantId, userId, session } = guard.context;
  const input = validation.data;

  try {
    // 1. Find school admin users to notify
    const adminUsers = await prisma.user.findMany({
      where: {
        tenantId,
        role: { in: ['ADMIN', 'SUPER_ADMIN'] },
        isActive: true,
      },
      select: { id: true },
    });

    const requester = await prisma.user.findUnique({
      where: { id: userId },
      select: { firstName: true, lastName: true, email: true },
    });

    const requesterName = requester ? `${requester.firstName} ${requester.lastName}` : session.email;

    // 2. Deliver in-app notification to administrators
    const title = `Appointment Request: ${input.authorityName}`;
    const body = `${requesterName} requested an appointment with ${input.authorityName} on ${input.preferredDate}. Purpose: ${input.purpose}`;

    await NotificationService.sendBulk({
      tenantId,
      recipientIds: adminUsers.map((a) => a.id),
      title,
      body,
      type: NotificationType.GENERAL,
      actionUrl: '/admin/emergency',
      metadata: {
        appointmentWith: input.authorityName,
        contactId: input.authorityContactId,
        requestedBy: requesterName,
        requestedDate: input.preferredDate,
        purpose: input.purpose,
      },
    });

    // Also send confirmation notification to the requester
    await NotificationService.send({
      tenantId,
      recipientId: userId,
      title: 'Appointment Request Submitted',
      body: `Your appointment request with ${input.authorityName} for ${input.preferredDate} has been sent to school administration.`,
      type: NotificationType.SYSTEM,
    });

    revalidatePath('/admin');
    revalidatePath('/');
    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to book appointment.';
    return { success: false, error: message };
  }
}
