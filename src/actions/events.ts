'use server';

import { safeRevalidatePath as revalidatePath } from '@/lib/revalidate';
import { prisma } from '@/lib/db';
import { requireAuthGuard } from '@/lib/auth-guard';
import { Role } from '@/types';
import {
  CreateEventSchema,
  type CreateEventInput,
  UpdateEventSchema,
  type UpdateEventInput,
} from '@/lib/validations/events';
import { EventCategory, NotificationType, Prisma } from '@prisma/client';
import { NotificationService } from '@/services/notification.service';

/**
 * Retrieves school events with optional category and publication filters.
 */
export async function getEventsAction(options?: {
  publishedOnly?: boolean;
  category?: EventCategory;
}) {
  const guard = await requireAuthGuard();
  if (!guard.success) {
    return { success: false, error: guard.error };
  }

  const { tenantId, role } = guard.context;

  const where: Prisma.EventWhereInput = {
    tenantId,
  };

  // If not admin, force publishedOnly to true
  const isAdmin = role === Role.ADMIN || role === Role.SUPER_ADMIN;
  if (!isAdmin || options?.publishedOnly) {
    where.isPublished = true;
  }

  if (options?.category) {
    where.category = options.category;
  }

  try {
    const events = await prisma.event.findMany({
      where,
      orderBy: { eventDate: 'asc' },
    });

    return { success: true, events };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to retrieve events.';
    return { success: false, error: message };
  }
}

/**
 * Creates a new school event (Admin only).
 */
export async function createEventAction(rawInput: CreateEventInput) {
  const guard = await requireAuthGuard([Role.ADMIN, Role.SUPER_ADMIN]);
  if (!guard.success) {
    return { success: false, error: guard.error };
  }

  const validation = CreateEventSchema.safeParse(rawInput);
  if (!validation.success) {
    return {
      success: false,
      error: validation.error.errors.map((e) => e.message).join(', '),
    };
  }

  const { tenantId, userId } = guard.context;
  const input = validation.data;

  try {
    const event = await prisma.event.create({
      data: {
        tenantId,
        title: input.title,
        description: input.description,
        eventDate: new Date(`${input.eventDate}T00:00:00.000Z`),
        eventTime: input.eventTime || null,
        location: input.location || null,
        category: input.category,
        imageUrl: input.imageUrl || null,
        isPublished: input.isPublished,
        createdById: userId,
      },
    });

    // Auto-generate notification if published immediately
    if (input.isPublished) {
      await NotificationService.sendToAudience({
        tenantId,
        audience: 'ALL',
        title: `New School Event: ${event.title}`,
        body: `A new event has been scheduled for ${input.eventDate}${event.location ? ` at ${event.location}` : ''}. Check details on your dashboard.`,
        type: NotificationType.EVENT,
        actionUrl: '/',
      });
    }

    // Audit log
    await prisma.auditLog.create({
      data: {
        tenantId,
        userId,
        action: 'EVENT_CREATED',
        entityType: 'Event',
        entityId: event.id,
        newValues: { title: event.title, category: event.category, isPublished: event.isPublished },
      },
    });

    revalidatePath('/admin/events');
    revalidatePath('/');
    return { success: true, event };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to create event.';
    return { success: false, error: message };
  }
}

/**
 * Updates an existing school event (Admin only).
 */
export async function updateEventAction(rawInput: UpdateEventInput) {
  const guard = await requireAuthGuard([Role.ADMIN, Role.SUPER_ADMIN]);
  if (!guard.success) {
    return { success: false, error: guard.error };
  }

  const validation = UpdateEventSchema.safeParse(rawInput);
  if (!validation.success) {
    return {
      success: false,
      error: validation.error.errors.map((e) => e.message).join(', '),
    };
  }

  const { tenantId, userId } = guard.context;
  const input = validation.data;

  try {
    const existing = await prisma.event.findFirst({
      where: { id: input.id, tenantId },
    });

    if (!existing) {
      return { success: false, error: 'Event not found or unauthorized.' };
    }

    const wasUnpublished = !existing.isPublished;
    const isNowPublished = input.isPublished === true;

    await prisma.event.updateMany({
      where: { id: input.id, tenantId },
      data: {
        ...(input.title !== undefined && { title: input.title }),
        ...(input.description !== undefined && { description: input.description }),
        ...(input.eventDate !== undefined && {
          eventDate: new Date(`${input.eventDate}T00:00:00.000Z`),
        }),
        ...(input.eventTime !== undefined && { eventTime: input.eventTime || null }),
        ...(input.location !== undefined && { location: input.location || null }),
        ...(input.category !== undefined && { category: input.category }),
        ...(input.imageUrl !== undefined && { imageUrl: input.imageUrl || null }),
        ...(input.isPublished !== undefined && { isPublished: input.isPublished }),
      },
    });

    const updated = await prisma.event.findFirst({
      where: { id: input.id, tenantId },
    });

    if (!updated) {
      return { success: false, error: 'Event update failed.' };
    }

    // Auto-generate notification if state transitioned from draft -> published
    if (wasUnpublished && isNowPublished) {
      await NotificationService.sendToAudience({
        tenantId,
        audience: 'ALL',
        title: `New School Event: ${updated.title}`,
        body: `A new event has been published: ${updated.title}. Check your dashboard feed for details.`,
        type: NotificationType.EVENT,
        actionUrl: '/',
      });
    }

    // Audit log
    await prisma.auditLog.create({
      data: {
        tenantId,
        userId,
        action: 'EVENT_UPDATED',
        entityType: 'Event',
        entityId: updated.id,
        newValues: { title: updated.title, category: updated.category, isPublished: updated.isPublished },
      },
    });

    revalidatePath('/admin/events');
    revalidatePath('/');
    return { success: true, event: updated };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to update event.';
    return { success: false, error: message };
  }
}

/**
 * Toggles publish state of an event.
 */
export async function togglePublishEventAction(id: string, isPublished: boolean) {
  const guard = await requireAuthGuard([Role.ADMIN, Role.SUPER_ADMIN]);
  if (!guard.success) {
    return { success: false, error: guard.error };
  }

  const { tenantId, userId } = guard.context;

  try {
    const existing = await prisma.event.findFirst({
      where: { id, tenantId },
    });

    if (!existing) {
      return { success: false, error: 'Event not found.' };
    }

    await prisma.event.updateMany({
      where: { id, tenantId },
      data: { isPublished },
    });

    const updated = await prisma.event.findFirst({
      where: { id, tenantId },
    });

    if (!updated) {
      return { success: false, error: 'Event update failed.' };
    }

    // Auto-generate notification on publish
    if (isPublished && !existing.isPublished) {
      await NotificationService.sendToAudience({
        tenantId,
        audience: 'ALL',
        title: `School Event Announced: ${updated.title}`,
        body: `A new school event has been published. Check details on your dashboard.`,
        type: NotificationType.EVENT,
        actionUrl: '/',
      });
    }

    // Audit log
    await prisma.auditLog.create({
      data: {
        tenantId,
        userId,
        action: 'EVENT_PUBLISH_TOGGLED',
        entityType: 'Event',
        entityId: id,
        newValues: { isPublished },
      },
    });

    revalidatePath('/admin/events');
    revalidatePath('/');
    return { success: true, event: updated };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to toggle event publish status.';
    return { success: false, error: message };
  }
}

/**
 * Deletes a school event (Admin only).
 */
export async function deleteEventAction(id: string) {
  const guard = await requireAuthGuard([Role.ADMIN, Role.SUPER_ADMIN]);
  if (!guard.success) {
    return { success: false, error: guard.error };
  }

  const { tenantId, userId } = guard.context;

  try {
    const existing = await prisma.event.findFirst({
      where: { id, tenantId },
    });

    if (!existing) {
      return { success: false, error: 'Event not found.' };
    }

    const result = await prisma.event.deleteMany({
      where: { id, tenantId },
    });

    if (result.count === 0) {
      return { success: false, error: 'Event not found.' };
    }

    // Audit log
    await prisma.auditLog.create({
      data: {
        tenantId,
        userId,
        action: 'EVENT_DELETED',
        entityType: 'Event',
        entityId: id,
        newValues: { title: existing.title },
      },
    });

    revalidatePath('/admin/events');
    revalidatePath('/');
    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to delete event.';
    return { success: false, error: message };
  }
}
