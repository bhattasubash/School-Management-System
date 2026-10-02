'use server';

import { safeRevalidatePath } from '@/lib/revalidate';
import { z } from 'zod';
import { prisma } from '@/lib/db';
import { requireAuthGuard } from '@/lib/auth-guard';
import { Role } from '@/types';
import { findAvailableSubstitutes } from '@/services/timetable-conflict.service';
import type { DayOfWeek } from '@prisma/client';

const AssignSubstitutionSchema = z.object({
  timetableEntryId: z.string().uuid('Valid timetable entry ID required'),
  substituteTeacherId: z.string().uuid('Valid substitute teacher ID required'),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date format must be YYYY-MM-DD'),
  reason: z.string().max(250).optional(),
});

export type AssignSubstitutionInput = z.infer<typeof AssignSubstitutionSchema>;

/**
 * Get the substitution day view for a given date.
 */
export async function getSubstitutionDayViewAction(dateStr: string) {
  const guard = await requireAuthGuard([Role.ADMIN, Role.SUPER_ADMIN]);
  if (!guard.success) {
    return { success: false as const, error: guard.error };
  }

  const { context } = guard;
  try {
    const targetDate = new Date(dateStr);
    targetDate.setHours(0, 0, 0, 0);

    const dayIndex = targetDate.getDay();
    const dayMap: DayOfWeek[] = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
    const dayOfWeek = dayMap[dayIndex];

    const slots = await prisma.periodTimeSlot.findMany({
      where: { tenantId: context.tenantId },
      orderBy: { order: 'asc' },
    });

    const entries = await prisma.timetableEntry.findMany({
      where: {
        tenantId: context.tenantId,
        dayOfWeek,
        teacherId: { not: null },
      },
      include: {
        subject: { select: { id: true, name: true, code: true } },
        teacher: {
          select: {
            id: true,
            employeeId: true,
            department: true,
            user: { select: { firstName: true, lastName: true } },
          },
        },
        periodTimeSlot: {
          select: { id: true, name: true, startTime: true, endTime: true, order: true },
        },
        section: {
          select: { id: true, name: true, classGrade: { select: { name: true } } },
        },
      },
      orderBy: { periodTimeSlot: { order: 'asc' } },
    });

    const dateStart = new Date(dateStr);
    dateStart.setHours(0, 0, 0, 0);
    const dateEnd = new Date(dateStr);
    dateEnd.setHours(23, 59, 59, 999);

    const substitutions = await prisma.teacherSubstitution.findMany({
      where: {
        tenantId: context.tenantId,
        date: { gte: dateStart, lte: dateEnd },
      },
      include: {
        timetableEntry: {
          include: {
            periodTimeSlot: { select: { id: true, name: true, startTime: true, endTime: true, order: true } },
            section: { select: { id: true, name: true, classGrade: { select: { name: true } } } },
            subject: { select: { id: true, name: true, code: true } },
          },
        },
        substituteTeacher: {
          select: {
            id: true,
            employeeId: true,
            user: { select: { firstName: true, lastName: true } },
          },
        },
      },
    });

    const teachers = await prisma.teacherProfile.findMany({
      where: { tenantId: context.tenantId },
      select: {
        id: true,
        employeeId: true,
        department: true,
        specialization: true,
        user: { select: { firstName: true, lastName: true, id: true } },
      },
    });

    return { success: true as const, entries, substitutions, teachers, slots, dayOfWeek };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to load substitution data.';
    return { success: false as const, error: msg };
  }
}

/**
 * Find available substitute teachers for a specific slot on a date.
 */
export async function getAvailableSubstitutesAction(dateStr: string, periodTimeSlotId: string) {
  const guard = await requireAuthGuard([Role.ADMIN, Role.SUPER_ADMIN]);
  if (!guard.success) {
    return { success: false as const, error: guard.error };
  }

  const { context } = guard;
  try {
    const available = await findAvailableSubstitutes(context.tenantId, {
      date: dateStr,
      periodTimeSlotId,
    });

    return { success: true as const, teachers: available };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to find available substitutes.';
    return { success: false as const, error: msg };
  }
}

/**
 * Assign a substitute teacher for a timetable slot.
 */
export async function assignTeacherSubstitutionAction(rawInput: AssignSubstitutionInput) {
  const guard = await requireAuthGuard([Role.ADMIN, Role.SUPER_ADMIN]);
  if (!guard.success) {
    return { success: false as const, error: guard.error };
  }

  const validation = AssignSubstitutionSchema.safeParse(rawInput);
  if (!validation.success) {
    return { success: false as const, error: validation.error.errors.map((e) => e.message).join(', ') };
  }

  const { context } = guard;
  const { timetableEntryId, substituteTeacherId, date, reason } = validation.data;

  try {
    const timetableEntry = await prisma.timetableEntry.findFirst({
      where: { id: timetableEntryId, tenantId: context.tenantId },
      include: {
        section: { include: { classGrade: true } },
        periodTimeSlot: true,
      },
    });

    if (!timetableEntry) {
      return { success: false as const, error: 'Timetable entry not found in your school.' };
    }

    if (!timetableEntry.teacherId) {
      return { success: false as const, error: 'Timetable entry has no primary teacher assigned.' };
    }

    if (timetableEntry.teacherId === substituteTeacherId) {
      return { success: false as const, error: 'Substitute teacher cannot be the same as the assigned teacher.' };
    }

    const substituteTeacher = await prisma.teacherProfile.findFirst({
      where: { id: substituteTeacherId, tenantId: context.tenantId },
    });

    if (!substituteTeacher) {
      return { success: false as const, error: 'Substitute teacher not found in your school.' };
    }

    const subDate = new Date(date);
    subDate.setHours(0, 0, 0, 0);

    const substitution = await prisma.teacherSubstitution.upsert({
      where: {
        tenantId_timetableEntryId_date: {
          tenantId: context.tenantId,
          timetableEntryId,
          date: subDate,
        },
      },
      update: {
        substituteTeacherId,
        reason: reason || 'Assigned by Administrator',
        status: 'ASSIGNED',
        assignedById: context.userId,
      },
      create: {
        tenantId: context.tenantId,
        timetableEntryId,
        originalTeacherId: timetableEntry.teacherId,
        substituteTeacherId,
        date: subDate,
        reason: reason || 'Assigned by Administrator',
        status: 'ASSIGNED',
        assignedById: context.userId,
      },
    });

    await prisma.auditLog.create({
      data: {
        tenantId: context.tenantId,
        userId: context.userId,
        action: 'TEACHER_SUBSTITUTION_ASSIGNED',
        entityType: 'TeacherSubstitution',
        entityId: substitution.id,
        newValues: {
          timetableEntryId,
          originalTeacherId: timetableEntry.teacherId,
          substituteTeacherId,
          date,
        },
      },
    });

    safeRevalidatePath('/admin/academics');
    safeRevalidatePath('/admin/teachers');
    safeRevalidatePath('/teacher');
    safeRevalidatePath('/admin');

    return {
      success: true as const,
      substitution: {
        id: substitution.id,
        status: substitution.status,
        date: substitution.date.toISOString(),
      },
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to assign substitution.';
    return { success: false as const, error: msg };
  }
}

/**
 * P0-3 REMEDIATION: Cancel teacher substitution with strict query-level tenant isolation.
 */
export async function cancelTeacherSubstitutionAction(substitutionId: string) {
  const guard = await requireAuthGuard([Role.ADMIN, Role.SUPER_ADMIN]);
  if (!guard.success) {
    return { success: false as const, error: guard.error };
  }

  const { context } = guard;

  try {
    // Atomic tenant-scoped update: prevents cross-tenant mutation
    const result = await prisma.teacherSubstitution.updateMany({
      where: {
        id: substitutionId,
        tenantId: context.tenantId,
      },
      data: { status: 'CANCELLED' },
    });

    if (result.count === 0) {
      return { success: false as const, error: 'Substitution not found or does not belong to your school.' };
    }

    await prisma.auditLog.create({
      data: {
        tenantId: context.tenantId,
        userId: context.userId,
        action: 'TEACHER_SUBSTITUTION_CANCELLED',
        entityType: 'TeacherSubstitution',
        entityId: substitutionId,
      },
    });

    safeRevalidatePath('/admin/academics');
    safeRevalidatePath('/admin/teachers');
    safeRevalidatePath('/teacher');
    safeRevalidatePath('/admin');

    return { success: true as const };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to cancel substitution.';
    return { success: false as const, error: msg };
  }
}
