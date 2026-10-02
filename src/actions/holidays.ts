'use server';

import { safeRevalidatePath as revalidatePath } from '@/lib/revalidate';
import { prisma } from '@/lib/db';
import { requireAuthGuard } from '@/lib/auth-guard';
import { Role } from '@/types';
import {
  CreateHolidaySchema,
  type CreateHolidayInput,
} from '@/lib/validations/holidays';
import { HolidayType, Prisma } from '@prisma/client';

/**
 * Retrieves holidays for the tenant, optionally scoped to an academic session.
 */
export async function getHolidaysAction(sessionId?: string) {
  const guard = await requireAuthGuard();
  if (!guard.success) {
    return { success: false, error: guard.error };
  }

  const { tenantId } = guard.context;

  try {
    let targetSessionId = sessionId;

    if (!targetSessionId) {
      const currentYear = await prisma.academicYear.findFirst({
        where: { tenantId, isCurrent: true },
        select: { id: true },
      });
      targetSessionId = currentYear?.id;
    }

    const where: Prisma.HolidayWhereInput = {
      tenantId,
      ...(targetSessionId && { sessionId: targetSessionId }),
    };

    const holidays = await prisma.holiday.findMany({
      where,
      orderBy: { date: 'asc' },
    });

    return { success: true, holidays };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to retrieve holidays.';
    return { success: false, error: message };
  }
}

/**
 * Creates a new holiday record (Admin only).
 */
export async function createHolidayAction(rawInput: CreateHolidayInput) {
  const guard = await requireAuthGuard([Role.ADMIN, Role.SUPER_ADMIN]);
  if (!guard.success) {
    return { success: false, error: guard.error };
  }

  const validation = CreateHolidaySchema.safeParse(rawInput);
  if (!validation.success) {
    return {
      success: false,
      error: validation.error.errors.map((e) => e.message).join(', '),
    };
  }

  const { tenantId, userId } = guard.context;
  const input = validation.data;
  const holidayDate = new Date(`${input.date}T00:00:00.000Z`);

  try {
    // Check for duplicate date in the same session
    const existing = await prisma.holiday.findUnique({
      where: {
        tenantId_sessionId_date: {
          tenantId,
          sessionId: input.sessionId,
          date: holidayDate,
        },
      },
    });

    if (existing) {
      return { success: false, error: 'A holiday is already scheduled on this date for this session.' };
    }

    const holiday = await prisma.holiday.create({
      data: {
        tenantId,
        sessionId: input.sessionId,
        name: input.name,
        date: holidayDate,
        type: input.type,
        isRecurring: input.isRecurring,
      },
    });

    // Audit log
    await prisma.auditLog.create({
      data: {
        tenantId,
        userId,
        action: 'HOLIDAY_CREATED',
        entityType: 'Holiday',
        entityId: holiday.id,
        newValues: { name: holiday.name, date: input.date, type: holiday.type },
      },
    });

    revalidatePath('/admin/holidays');
    revalidatePath('/');
    return { success: true, holiday };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to create holiday.';
    return { success: false, error: message };
  }
}

/**
 * Deletes a holiday (Admin only).
 */
export async function deleteHolidayAction(id: string) {
  const guard = await requireAuthGuard([Role.ADMIN, Role.SUPER_ADMIN]);
  if (!guard.success) {
    return { success: false, error: guard.error };
  }

  const { tenantId, userId } = guard.context;

  try {
    const existing = await prisma.holiday.findFirst({
      where: { id, tenantId },
    });

    if (!existing) {
      return { success: false, error: 'Holiday not found.' };
    }

    await prisma.holiday.delete({
      where: { id },
    });

    // Audit log
    await prisma.auditLog.create({
      data: {
        tenantId,
        userId,
        action: 'HOLIDAY_DELETED',
        entityType: 'Holiday',
        entityId: id,
        newValues: { name: existing.name },
      },
    });

    revalidatePath('/admin/holidays');
    revalidatePath('/');
    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to delete holiday.';
    return { success: false, error: message };
  }
}
