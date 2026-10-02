'use server';

import { safeRevalidatePath as revalidatePath } from '@/lib/revalidate';
import { prisma } from '@/lib/db';
import { requireAuthGuard } from '@/lib/auth-guard';
import { Role } from '@/types';
import {
  CreatePeriodTimeSlotSchema,
  type CreatePeriodTimeSlotInput,
  UpdatePeriodTimeSlotSchema,
  type UpdatePeriodTimeSlotInput,
  SaveTimetableEntrySchema,
  type SaveTimetableEntryInput,
  CloneTimetableSchema,
  type CloneTimetableInput,
} from '@/lib/validations/timetable';
import { validateTimetableSlotConflict } from '@/services/timetable-conflict.service';
import type { DayOfWeek } from '@prisma/client';

/**
 * Fetch all period time slots for the current tenant, ordered by `order`.
 */
export async function getPeriodTimeSlotsAction() {
  const guard = await requireAuthGuard();
  if (!guard.success) {
    return { success: false as const, error: guard.error };
  }

  const { context } = guard;
  try {
    const slots = await prisma.periodTimeSlot.findMany({
      where: { tenantId: context.tenantId },
      orderBy: { order: 'asc' },
    });
    return { success: true as const, slots };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to load time slots.';
    return { success: false as const, error: msg };
  }
}

/**
 * Create a new period time slot.
 */
export async function createPeriodTimeSlotAction(rawInput: CreatePeriodTimeSlotInput) {
  const guard = await requireAuthGuard([Role.ADMIN, Role.SUPER_ADMIN]);
  if (!guard.success) {
    return { success: false as const, error: guard.error };
  }

  const validation = CreatePeriodTimeSlotSchema.safeParse(rawInput);
  if (!validation.success) {
    return { success: false as const, error: validation.error.errors.map((e) => e.message).join(', ') };
  }

  const { context } = guard;
  try {
    const data = validation.data;

    const existing = await prisma.periodTimeSlot.findFirst({
      where: { tenantId: context.tenantId, order: data.order },
    });
    if (existing) {
      return { success: false as const, error: `A period with order ${data.order} already exists.` };
    }

    const slot = await prisma.periodTimeSlot.create({
      data: {
        tenantId: context.tenantId,
        name: data.name,
        startTime: data.startTime,
        endTime: data.endTime,
        order: data.order,
        isBreak: data.isBreak,
      },
    });

    revalidatePath('/admin/timetable');
    return { success: true as const, slot };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to create time slot.';
    return { success: false as const, error: msg };
  }
}

/**
 * Update an existing period time slot.
 */
export async function updatePeriodTimeSlotAction(rawInput: UpdatePeriodTimeSlotInput) {
  const guard = await requireAuthGuard([Role.ADMIN, Role.SUPER_ADMIN]);
  if (!guard.success) {
    return { success: false as const, error: guard.error };
  }

  const validation = UpdatePeriodTimeSlotSchema.safeParse(rawInput);
  if (!validation.success) {
    return { success: false as const, error: validation.error.errors.map((e) => e.message).join(', ') };
  }

  const { context } = guard;
  try {
    const { id, ...data } = validation.data;

    const existing = await prisma.periodTimeSlot.findFirst({
      where: { id, tenantId: context.tenantId },
    });
    if (!existing) {
      return { success: false as const, error: 'Time slot not found.' };
    }

    const updated = await prisma.periodTimeSlot.update({
      where: { id },
      data,
    });

    revalidatePath('/admin/timetable');
    return { success: true as const, slot: updated };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to update time slot.';
    return { success: false as const, error: msg };
  }
}

/**
 * Delete a period time slot.
 */
export async function deletePeriodTimeSlotAction(slotId: string) {
  const guard = await requireAuthGuard([Role.ADMIN, Role.SUPER_ADMIN]);
  if (!guard.success) {
    return { success: false as const, error: guard.error };
  }

  const { context } = guard;
  try {
    const existing = await prisma.periodTimeSlot.findFirst({
      where: { id: slotId, tenantId: context.tenantId },
    });
    if (!existing) {
      return { success: false as const, error: 'Time slot not found.' };
    }

    await prisma.periodTimeSlot.delete({
      where: { id: slotId },
    });

    revalidatePath('/admin/timetable');
    return { success: true as const };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to delete time slot.';
    return { success: false as const, error: msg };
  }
}

/**
 * Fetch the complete timetable for a section.
 */
export async function getTimetableAction(sectionId: string) {
  const guard = await requireAuthGuard();
  if (!guard.success) {
    return { success: false as const, error: guard.error };
  }

  const { context } = guard;
  try {
    const entries = await prisma.timetableEntry.findMany({
      where: { tenantId: context.tenantId, sectionId },
      include: {
        periodTimeSlot: true,
        subject: { select: { id: true, name: true, code: true, subjectType: true } },
        teacher: {
          select: {
            id: true,
            employeeId: true,
            user: { select: { firstName: true, lastName: true } },
          },
        },
      },
      orderBy: [{ dayOfWeek: 'asc' }, { periodTimeSlot: { order: 'asc' } }],
    });

    const slots = await prisma.periodTimeSlot.findMany({
      where: { tenantId: context.tenantId },
      orderBy: { order: 'asc' },
    });

    const tenant = await prisma.tenant.findUnique({
      where: { id: context.tenantId },
      select: { workingDays: true },
    });

    return {
      success: true as const,
      entries,
      slots,
      workingDays: tenant?.workingDays ?? ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY'],
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to load timetable.';
    return { success: false as const, error: msg };
  }
}

/**
 * Save (create or update) a single timetable slot.
 */
export async function saveTimetableEntryAction(rawInput: SaveTimetableEntryInput) {
  const guard = await requireAuthGuard([Role.ADMIN, Role.SUPER_ADMIN]);
  if (!guard.success) {
    return { success: false as const, error: guard.error };
  }

  const validation = SaveTimetableEntrySchema.safeParse(rawInput);
  if (!validation.success) {
    return { success: false as const, error: validation.error.errors.map((e) => e.message).join(', ') };
  }

  const { context } = guard;
  try {
    const data = validation.data;

    // Run conflict check via service
    const conflictResult = await validateTimetableSlotConflict(context.tenantId, {
      sectionId: data.sectionId,
      periodTimeSlotId: data.periodTimeSlotId,
      dayOfWeek: data.dayOfWeek as DayOfWeek,
      teacherId: data.teacherId ?? undefined,
      subjectId: data.subjectId ?? undefined,
      excludeEntryId: data.entryId,
    });

    if (conflictResult.hasConflict) {
      return { success: false as const, error: conflictResult.conflictReason || 'Scheduling conflict detected.' };
    }

    let entry;
    if (data.entryId) {
      // Update existing
      entry = await prisma.timetableEntry.update({
        where: { id: data.entryId, tenantId: context.tenantId },
        data: {
          subjectId: data.subjectId ?? null,
          teacherId: data.teacherId ?? null,
          roomNumber: data.roomNumber ?? null,
        },
        include: {
          subject: { select: { id: true, name: true, code: true } },
          teacher: {
            select: {
              id: true,
              employeeId: true,
              user: { select: { firstName: true, lastName: true } },
            },
          },
        },
      });
    } else {
      // Create or upsert
      entry = await prisma.timetableEntry.upsert({
        where: {
          sectionId_periodTimeSlotId_dayOfWeek: {
            sectionId: data.sectionId,
            periodTimeSlotId: data.periodTimeSlotId,
            dayOfWeek: data.dayOfWeek as DayOfWeek,
          },
        },
        update: {
          subjectId: data.subjectId ?? null,
          teacherId: data.teacherId ?? null,
          roomNumber: data.roomNumber ?? null,
        },
        create: {
          tenantId: context.tenantId,
          sectionId: data.sectionId,
          periodTimeSlotId: data.periodTimeSlotId,
          dayOfWeek: data.dayOfWeek as DayOfWeek,
          subjectId: data.subjectId ?? null,
          teacherId: data.teacherId ?? null,
          roomNumber: data.roomNumber ?? null,
        },
        include: {
          subject: { select: { id: true, name: true, code: true } },
          teacher: {
            select: {
              id: true,
              employeeId: true,
              user: { select: { firstName: true, lastName: true } },
            },
          },
        },
      });
    }

    revalidatePath('/admin/timetable');
    revalidatePath('/teacher');
    revalidatePath('/');

    return { success: true as const, entry };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to save timetable slot.';
    return { success: false as const, error: msg };
  }
}

/**
 * Delete a single timetable entry.
 */
export async function deleteTimetableEntryAction(entryId: string) {
  const guard = await requireAuthGuard([Role.ADMIN, Role.SUPER_ADMIN]);
  if (!guard.success) {
    return { success: false as const, error: guard.error };
  }

  const { context } = guard;
  try {
    const result = await prisma.timetableEntry.deleteMany({
      where: { id: entryId, tenantId: context.tenantId },
    });

    if (result.count === 0) {
      return { success: false as const, error: 'Entry not found or unauthorized.' };
    }

    revalidatePath('/admin/timetable');
    revalidatePath('/teacher');
    return { success: true as const };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to delete timetable entry.';
    return { success: false as const, error: msg };
  }
}

/**
 * Clone an entire timetable from one section to another.
 */
export async function cloneTimetableAction(rawInput: CloneTimetableInput) {
  const guard = await requireAuthGuard([Role.ADMIN, Role.SUPER_ADMIN]);
  if (!guard.success) {
    return { success: false as const, error: guard.error };
  }

  const validation = CloneTimetableSchema.safeParse(rawInput);
  if (!validation.success) {
    return { success: false as const, error: validation.error.errors.map((e) => e.message).join(', ') };
  }

  const { context } = guard;
  try {
    const { fromSectionId, toSectionId } = validation.data;

    const sourceEntries = await prisma.timetableEntry.findMany({
      where: { tenantId: context.tenantId, sectionId: fromSectionId },
    });

    if (sourceEntries.length === 0) {
      return { success: false as const, error: 'Source section has no timetable entries to clone.' };
    }

    await prisma.timetableEntry.deleteMany({
      where: { tenantId: context.tenantId, sectionId: toSectionId },
    });

    await prisma.timetableEntry.createMany({
      data: sourceEntries.map((entry) => ({
        tenantId: context.tenantId,
        sectionId: toSectionId,
        periodTimeSlotId: entry.periodTimeSlotId,
        dayOfWeek: entry.dayOfWeek,
        subjectId: entry.subjectId,
        teacherId: null,
        roomNumber: null,
      })),
    });

    revalidatePath('/admin/timetable');
    return { success: true as const, count: sourceEntries.length };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to clone timetable.';
    return { success: false as const, error: msg };
  }
}

/**
 * Get tenant working days configuration.
 */
export async function getWorkingDaysAction() {
  const guard = await requireAuthGuard();
  if (!guard.success) {
    return { success: false as const, error: guard.error };
  }

  const { context } = guard;
  try {
    const tenant = await prisma.tenant.findUnique({
      where: { id: context.tenantId },
      select: { workingDays: true },
    });

    const defaultDays: DayOfWeek[] = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY'];
    return {
      success: true as const,
      workingDays: (tenant?.workingDays as DayOfWeek[]) ?? defaultDays,
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to get working days.';
    return { success: false as const, error: msg };
  }
}

/**
 * Update tenant working days configuration.
 */
export async function updateWorkingDaysAction(days: string[]) {
  const guard = await requireAuthGuard([Role.ADMIN, Role.SUPER_ADMIN]);
  if (!guard.success) {
    return { success: false as const, error: guard.error };
  }

  const validDays = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];
  const filtered = days.filter((d) => validDays.includes(d));
  if (filtered.length === 0) {
    return { success: false as const, error: 'At least one working day is required.' };
  }

  const { context } = guard;
  try {
    await prisma.tenant.update({
      where: { id: context.tenantId },
      data: { workingDays: filtered as DayOfWeek[] },
    });

    revalidatePath('/admin/timetable');
    return { success: true as const };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to update working days.';
    return { success: false as const, error: msg };
  }
}

/**
 * Fetch subjects assigned to a section.
 */
export async function getSubjectsForSectionAction(sectionId: string) {
  const guard = await requireAuthGuard();
  if (!guard.success) {
    return { success: false as const, error: guard.error };
  }

  const { context } = guard;
  try {
    const cst = await prisma.classSubjectTeacher.findMany({
      where: { sectionId },
      include: {
        subject: { select: { id: true, name: true, code: true } },
        teacher: {
          select: {
            id: true,
            employeeId: true,
            user: { select: { firstName: true, lastName: true } },
          },
        },
      },
    });

    const subjectMap = new Map<string, { id: string; name: string; code: string }>();
    const teachersBySubject = new Map<string, Array<{ id: string; name: string; employeeId: string }>>();

    for (const entry of cst) {
      if (entry.subject && !subjectMap.has(entry.subject.id)) {
        subjectMap.set(entry.subject.id, entry.subject);
      }
      if (entry.subject && entry.teacher) {
        const teachers = teachersBySubject.get(entry.subject.id) || [];
        teachers.push({
          id: entry.teacher.id,
          name: `${entry.teacher.user.firstName} ${entry.teacher.user.lastName}`,
          employeeId: entry.teacher.employeeId,
        });
        teachersBySubject.set(entry.subject.id, teachers);
      }
    }

    if (subjectMap.size === 0) {
      const section = await prisma.section.findUnique({
        where: { id: sectionId },
        select: { classGradeId: true },
      });

      if (section) {
        const allSubjects = await prisma.subject.findMany({
          where: { tenantId: context.tenantId },
          select: { id: true, name: true, code: true },
        });
        for (const sub of allSubjects) {
          subjectMap.set(sub.id, sub);
        }
      }

      const allTeachers = await prisma.teacherProfile.findMany({
        where: { tenantId: context.tenantId },
        select: {
          id: true,
          employeeId: true,
          user: { select: { firstName: true, lastName: true } },
        },
      });

      const teacherList = allTeachers.map((t) => ({
        id: t.id,
        name: `${t.user.firstName} ${t.user.lastName}`,
        employeeId: t.employeeId,
      }));

      subjectMap.forEach((_, subId) => {
        teachersBySubject.set(subId, teacherList);
      });
    }

    return {
      success: true as const,
      subjects: Array.from(subjectMap.values()),
      teachersBySubject: Object.fromEntries(teachersBySubject),
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to load subjects.';
    return { success: false as const, error: msg };
  }
}
