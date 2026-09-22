import { prisma } from '@/lib/db';
import {
  ValidateTimetableSlotSchema,
  ValidateTimetableSlotInput,
  FindAvailableSubstitutesSchema,
  FindAvailableSubstitutesInput,
  AssignSubstitutionSchema,
  AssignSubstitutionInput,
} from '@/lib/validations/substitution';
import { DayOfWeek, TeacherProfile, TeacherSubstitution, User } from '@prisma/client';

export interface ConflictCheckResult {
  hasConflict: boolean;
  conflictReason: string | null;
}

export interface AvailableSubstituteTeacher {
  teacherId: string;
  employeeId: string;
  name: string;
  department: string;
  specialization: string | null;
}

/**
 * Validates whether a timetable period assignment has conflicts.
 * Checks two hard constraints:
 * 1. Section Conflict: Section cannot have two subjects at the same period and day.
 * 2. Teacher Conflict: Teacher cannot teach two different sections at the same period and day.
 */
export async function validateTimetableSlotConflict(
  tenantId: string,
  rawInput: ValidateTimetableSlotInput
): Promise<ConflictCheckResult> {
  const input = ValidateTimetableSlotSchema.parse(rawInput);

  // 1. Check Section Conflict
  const sectionConflict = await prisma.timetableEntry.findFirst({
    where: {
      tenantId,
      sectionId: input.sectionId,
      periodTimeSlotId: input.periodTimeSlotId,
      dayOfWeek: input.dayOfWeek as DayOfWeek,
      id: input.excludeEntryId ? { not: input.excludeEntryId } : undefined,
    },
    include: {
      subject: true,
    },
  });

  if (sectionConflict) {
    return {
      hasConflict: true,
      conflictReason: `Section already has subject '${sectionConflict.subject?.name ?? 'Unknown'}' scheduled for this period.`,
    };
  }

  // 2. Check Teacher Conflict (if teacher is specified)
  if (input.teacherId) {
    const teacherConflict = await prisma.timetableEntry.findFirst({
      where: {
        tenantId,
        teacherId: input.teacherId,
        periodTimeSlotId: input.periodTimeSlotId,
        dayOfWeek: input.dayOfWeek as DayOfWeek,
        id: input.excludeEntryId ? { not: input.excludeEntryId } : undefined,
      },
      include: {
        section: { include: { classGrade: true } },
      },
    });

    if (teacherConflict) {
      const conflictingClass = `${teacherConflict.section.classGrade.name} - ${teacherConflict.section.name}`;
      return {
        hasConflict: true,
        conflictReason: `Teacher is already assigned to ${conflictingClass} during this period.`,
      };
    }
  }

  return {
    hasConflict: false,
    conflictReason: null,
  };
}

/**
 * Finds all active teachers in the school who are FREE (have no scheduled period or active substitution)
 * during a specific time slot on a given calendar date.
 */
export async function findAvailableSubstitutes(
  tenantId: string,
  rawInput: FindAvailableSubstitutesInput
): Promise<AvailableSubstituteTeacher[]> {
  const input = FindAvailableSubstitutesSchema.parse(rawInput);

  const targetDate = new Date(input.date);
  const dayIndex = targetDate.getDay(); // 0 is Sunday, 1 is Monday ...
  const dayOfWeekMap: Record<number, DayOfWeek> = {
    0: 'SUNDAY',
    1: 'MONDAY',
    2: 'TUESDAY',
    3: 'WEDNESDAY',
    4: 'THURSDAY',
    5: 'FRIDAY',
    6: 'SATURDAY',
  };
  const dayOfWeek = dayOfWeekMap[dayIndex];

  // 1. Fetch all active teachers in the school
  const allTeachers = await prisma.teacherProfile.findMany({
    where: {
      tenantId,
      user: { isActive: true },
    },
    include: { user: true },
  });

  if (allTeachers.length === 0) {
    return [];
  }

  // 2. Find teacher IDs that already have regular classes assigned for this period & day
  const busyRegularTeacherEntries = await prisma.timetableEntry.findMany({
    where: {
      tenantId,
      periodTimeSlotId: input.periodTimeSlotId,
      dayOfWeek,
      teacherId: { not: null },
    },
    select: { teacherId: true },
  });
  const busyTeacherIds = new Set(
    busyRegularTeacherEntries.map((e) => e.teacherId).filter(Boolean) as string[]
  );

  // 3. Find teacher IDs that already have an active substitution on this date & period
  const busySubstitutions = await prisma.teacherSubstitution.findMany({
    where: {
      tenantId,
      date: targetDate,
      status: 'ASSIGNED',
      timetableEntry: { periodTimeSlotId: input.periodTimeSlotId },
    },
    select: { substituteTeacherId: true },
  });
  busySubstitutions.forEach((sub) => busyTeacherIds.add(sub.substituteTeacherId));

  // 4. Filter teachers who are free
  return allTeachers
    .filter((t) => !busyTeacherIds.has(t.id))
    .map((t) => ({
      teacherId: t.id,
      employeeId: t.employeeId,
      name: `${t.user.firstName} ${t.user.lastName}`.trim(),
      department: t.department,
      specialization: t.specialization,
    }));
}

/**
 * Assigns a substitute teacher for an absent teacher's class session on a given date.
 */
export async function assignTeacherSubstitution(
  tenantId: string,
  rawInput: AssignSubstitutionInput
): Promise<TeacherSubstitution> {
  const input = AssignSubstitutionSchema.parse(rawInput);
  const targetDate = new Date(input.date);

  // 1. Fetch timetable entry and its original teacher
  const timetableEntry = await prisma.timetableEntry.findFirst({
    where: { id: input.timetableEntryId, tenantId },
    include: { teacher: true },
  });

  if (!timetableEntry) {
    throw new Error(`Timetable entry ${input.timetableEntryId} not found under tenant.`);
  }

  const originalTeacherId = timetableEntry.teacherId;
  if (!originalTeacherId) {
    throw new Error(`Timetable entry does not have an original teacher assigned.`);
  }

  if (originalTeacherId === input.substituteTeacherId) {
    throw new Error(`Substitute teacher cannot be the same as the original teacher.`);
  }

  // 2. Verify substitute teacher is free
  const availableSubstitutes = await findAvailableSubstitutes(tenantId, {
    date: input.date,
    periodTimeSlotId: timetableEntry.periodTimeSlotId,
  });

  const isFree = availableSubstitutes.some((s) => s.teacherId === input.substituteTeacherId);
  if (!isFree) {
    throw new Error(
      `Selected substitute teacher is already occupied or assigned another class during this period.`
    );
  }

  // 3. Create or Update substitution record
  return prisma.teacherSubstitution.upsert({
    where: {
      tenantId_timetableEntryId_date: {
        tenantId,
        timetableEntryId: input.timetableEntryId,
        date: targetDate,
      },
    },
    update: {
      substituteTeacherId: input.substituteTeacherId,
      reason: input.reason || null,
      status: 'ASSIGNED',
      assignedById: input.assignedById,
    },
    create: {
      tenantId,
      timetableEntryId: input.timetableEntryId,
      originalTeacherId,
      substituteTeacherId: input.substituteTeacherId,
      date: targetDate,
      reason: input.reason || null,
      status: 'ASSIGNED',
      assignedById: input.assignedById,
    },
  });
}
