'use server';

import { safeRevalidatePath } from '@/lib/revalidate';
import { prisma } from '@/lib/db';
import { requireAuthGuard } from '@/lib/auth-guard';
import { Role } from '@/types';

export async function archiveStudentsAction(studentProfileIds: string[]) {
  const guard = await requireAuthGuard([Role.ADMIN, Role.SUPER_ADMIN]);
  if (!guard.success) {
    return { success: false, error: guard.error };
  }

  const { context } = guard;

  try {
    const profiles = await prisma.studentProfile.findMany({
      where: { id: { in: studentProfileIds }, tenantId: context.tenantId },
      select: { userId: true },
    });

    const userIds = profiles.map((p) => p.userId);

    await prisma.user.updateMany({
      where: { id: { in: userIds }, tenantId: context.tenantId },
      data: {
        isActive: false,
        deletedAt: new Date(),
      },
    });

    await prisma.auditLog.create({
      data: {
        tenantId: context.tenantId,
        userId: context.userId,
        action: 'STUDENTS_ARCHIVED',
        entityType: 'StudentProfile',
        newValues: { studentProfileIds, userIds },
      },
    });

    safeRevalidatePath('/admin/students');
    return { success: true, count: userIds.length };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to archive students.';
    return { success: false, error: msg };
  }
}

export async function reactivateStudentsAction(studentProfileIds: string[]) {
  const guard = await requireAuthGuard([Role.ADMIN, Role.SUPER_ADMIN]);
  if (!guard.success) {
    return { success: false, error: guard.error };
  }

  const { context } = guard;

  try {
    const profiles = await prisma.studentProfile.findMany({
      where: { id: { in: studentProfileIds }, tenantId: context.tenantId },
      select: { userId: true },
    });

    const userIds = profiles.map((p) => p.userId);

    await prisma.user.updateMany({
      where: { id: { in: userIds }, tenantId: context.tenantId },
      data: {
        isActive: true,
        deletedAt: null,
      },
    });

    await prisma.auditLog.create({
      data: {
        tenantId: context.tenantId,
        userId: context.userId,
        action: 'STUDENTS_REACTIVATED',
        entityType: 'StudentProfile',
        newValues: { studentProfileIds, userIds },
      },
    });

    safeRevalidatePath('/admin/students');
    return { success: true, count: userIds.length };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to reactivate students.';
    return { success: false, error: msg };
  }
}

export async function archiveTeacherAction(teacherProfileId: string) {
  const guard = await requireAuthGuard([Role.ADMIN, Role.SUPER_ADMIN]);
  if (!guard.success) {
    return { success: false, error: guard.error };
  }

  const { context } = guard;

  try {
    const profile = await prisma.teacherProfile.findFirst({
      where: { id: teacherProfileId, tenantId: context.tenantId },
      select: { userId: true },
    });

    if (!profile) {
      return { success: false, error: 'Teacher not found in your school.' };
    }

    // Atomic tenant-scoped update
    await prisma.user.updateMany({
      where: { id: profile.userId, tenantId: context.tenantId },
      data: {
        isActive: false,
        deletedAt: new Date(),
      },
    });

    await prisma.auditLog.create({
      data: {
        tenantId: context.tenantId,
        userId: context.userId,
        action: 'TEACHER_ARCHIVED',
        entityType: 'TeacherProfile',
        entityId: teacherProfileId,
      },
    });

    safeRevalidatePath('/admin/teachers');
    return { success: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to archive teacher.';
    return { success: false, error: msg };
  }
}

export async function reactivateTeacherAction(teacherProfileId: string) {
  const guard = await requireAuthGuard([Role.ADMIN, Role.SUPER_ADMIN]);
  if (!guard.success) {
    return { success: false, error: guard.error };
  }

  const { context } = guard;

  try {
    const profile = await prisma.teacherProfile.findFirst({
      where: { id: teacherProfileId, tenantId: context.tenantId },
      select: { userId: true },
    });

    if (!profile) {
      return { success: false, error: 'Teacher not found in your school.' };
    }

    // Atomic tenant-scoped update
    await prisma.user.updateMany({
      where: { id: profile.userId, tenantId: context.tenantId },
      data: {
        isActive: true,
        deletedAt: null,
      },
    });

    await prisma.auditLog.create({
      data: {
        tenantId: context.tenantId,
        userId: context.userId,
        action: 'TEACHER_REACTIVATED',
        entityType: 'TeacherProfile',
        entityId: teacherProfileId,
      },
    });

    safeRevalidatePath('/admin/teachers');
    return { success: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to reactivate teacher.';
    return { success: false, error: msg };
  }
}

export async function batchArchiveBySectionAction(sectionId: string) {
  const guard = await requireAuthGuard([Role.ADMIN, Role.SUPER_ADMIN]);
  if (!guard.success) {
    return { success: false, error: guard.error };
  }

  const { context } = guard;

  try {
    const students = await prisma.studentProfile.findMany({
      where: { sectionId, tenantId: context.tenantId },
      select: { id: true, userId: true },
    });

    const userIds = students.map((s) => s.userId);

    await prisma.user.updateMany({
      where: { id: { in: userIds }, tenantId: context.tenantId },
      data: {
        isActive: false,
        deletedAt: new Date(),
      },
    });

    await prisma.auditLog.create({
      data: {
        tenantId: context.tenantId,
        userId: context.userId,
        action: 'BATCH_SECTION_ARCHIVED',
        entityType: 'Section',
        entityId: sectionId,
        newValues: { studentCount: userIds.length },
      },
    });

    safeRevalidatePath('/admin/students');
    return { success: true, count: userIds.length };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to archive section.';
    return { success: false, error: msg };
  }
}

// ----------------------------------------------------------------------------
// P3-4: TEACHER DEPARTURE & REASSIGNMENT WORKFLOW
// ----------------------------------------------------------------------------

/**
 * Pre-checks and handles teacher departure by inspecting active timetable assignments,
 * class-teacher responsibilities, and future substitution requests before deactivation.
 */
export async function deactivateTeacherWithReassignmentCheckAction(teacherProfileId: string) {
  const guard = await requireAuthGuard([Role.ADMIN, Role.SUPER_ADMIN]);
  if (!guard.success) {
    return { success: false, error: guard.error };
  }

  const { context } = guard;

  try {
    const teacher = await prisma.teacherProfile.findFirst({
      where: { id: teacherProfileId, tenantId: context.tenantId },
      include: {
        user: true,
        timetables: {
          include: {
            section: { include: { classGrade: true } },
            subject: true,
            periodTimeSlot: true,
          },
        },
      },
    });

    if (!teacher) {
      return { success: false, error: 'Teacher not found in your school.' };
    }

    // Check if assigned as Class Teacher for any section
    const classTeacherSections = await prisma.section.findMany({
      where: { tenantId: context.tenantId, classTeacherId: teacher.id },
      include: { classGrade: true },
    });

    // Check future substitutions
    const futureSubstitutions = await prisma.teacherSubstitution.findMany({
      where: {
        tenantId: context.tenantId,
        substituteTeacherId: teacher.id,
        date: { gte: new Date() },
        status: 'ASSIGNED',
      },
    });

    const activeTimetableSlots = teacher.timetables.length;
    const isClassTeacherFor = classTeacherSections.map(s => `${s.classGrade.name}-${s.name}`);

    // If teacher has active commitments, return warning with handover details
    const hasCommitments = activeTimetableSlots > 0 || isClassTeacherFor.length > 0 || futureSubstitutions.length > 0;

    // Perform deactivation
    await prisma.user.updateMany({
      where: { id: teacher.userId, tenantId: context.tenantId },
      data: {
        isActive: false,
        deletedAt: new Date(),
      },
    });

    await prisma.auditLog.create({
      data: {
        tenantId: context.tenantId,
        userId: context.userId,
        action: 'TEACHER_DEPARTURE_PROCESSED',
        entityType: 'TeacherProfile',
        entityId: teacherProfileId,
        newValues: {
          teacherName: `${teacher.user.firstName} ${teacher.user.lastName}`,
          activeTimetableSlots,
          isClassTeacherFor,
          pendingSubstitutions: futureSubstitutions.length,
        },
      },
    });

    safeRevalidatePath('/admin/teachers');
    safeRevalidatePath('/admin/academics');

    return {
      success: true,
      hasCommitments,
      handoverSummary: {
        teacherName: `${teacher.user.firstName} ${teacher.user.lastName}`,
        activeTimetableSlots,
        classTeacherSections: isClassTeacherFor,
        pendingSubstitutions: futureSubstitutions.length,
      },
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to process teacher departure.';
    return { success: false, error: msg };
  }
}
