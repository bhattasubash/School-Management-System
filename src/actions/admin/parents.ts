'use server';

import { safeRevalidatePath } from '@/lib/revalidate';
import { prisma } from '@/lib/db';
import { requireAuthGuard } from '@/lib/auth-guard';
import { Role } from '@/types';

export async function getParentsAction() {
  const guard = await requireAuthGuard([Role.ADMIN, Role.SUPER_ADMIN]);
  if (!guard.success) {
    return { success: false, error: guard.error };
  }

  const { context } = guard;

  try {
    const parents = await prisma.parentProfile.findMany({
      where: { tenantId: context.tenantId },
      include: {
        user: true,
        students: {
          include: {
            student: {
              include: {
                user: true,
                section: {
                  include: {
                    classGrade: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: { user: { firstName: 'asc' } },
    });

    const formatted = parents.map((p) => ({
      id: p.id,
      userId: p.userId,
      name: `${p.user.firstName} ${p.user.lastName}`,
      email: p.user.email,
      phone: p.user.phone || 'N/A',
      relationship: p.relationship,
      occupation: p.occupation || 'N/A',
      isActive: p.user.isActive,
      studentsCount: p.students.length,
      linkedStudents: p.students.map((link) => ({
        id: link.student.id,
        name: `${link.student.user.firstName} ${link.student.user.lastName}`,
        admissionNumber: link.student.admissionNumber,
        classSection: `${link.student.section.classGrade.name}-${link.student.section.name}`,
        isPrimary: link.isPrimary,
      })),
    }));

    return { success: true, parents: formatted };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to fetch parents.';
    return { success: false, error: msg };
  }
}

export async function linkParentToStudentAction(data: {
  parentId: string;
  studentId: string;
  isPrimary?: boolean;
}) {
  const guard = await requireAuthGuard([Role.ADMIN, Role.SUPER_ADMIN]);
  if (!guard.success) {
    return { success: false, error: guard.error };
  }

  const { context } = guard;

  try {
    // Verify both parent and student belong to this tenant
    const [parent, student] = await Promise.all([
      prisma.parentProfile.findFirst({
        where: { id: data.parentId, tenantId: context.tenantId },
      }),
      prisma.studentProfile.findFirst({
        where: { id: data.studentId, tenantId: context.tenantId },
      }),
    ]);

    if (!parent) {
      return { success: false, error: 'Parent record not found in your school.' };
    }
    if (!student) {
      return { success: false, error: 'Student record not found in your school.' };
    }

    const link = await prisma.parentStudentLink.upsert({
      where: {
        parentId_studentId: {
          parentId: data.parentId,
          studentId: data.studentId,
        },
      },
      update: {
        isPrimary: Boolean(data.isPrimary),
      },
      create: {
        tenantId: context.tenantId,
        parentId: data.parentId,
        studentId: data.studentId,
        isPrimary: Boolean(data.isPrimary),
      },
    });

    await prisma.auditLog.create({
      data: {
        tenantId: context.tenantId,
        userId: context.userId,
        action: 'PARENT_STUDENT_LINKED',
        entityType: 'ParentStudentLink',
        entityId: link.id,
        newValues: { parentId: data.parentId, studentId: data.studentId, isPrimary: data.isPrimary },
      },
    });

    safeRevalidatePath('/admin/parents');
    safeRevalidatePath('/admin/students');

    return { success: true, link };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to link parent to student.';
    return { success: false, error: msg };
  }
}

/**
 * P0-4 REMEDIATION: Unlink parent from student with strict query-level tenant isolation.
 */
export async function unlinkParentAction(data: { parentId: string; studentId: string }) {
  const guard = await requireAuthGuard([Role.ADMIN, Role.SUPER_ADMIN]);
  if (!guard.success) {
    return { success: false, error: guard.error };
  }

  const { context } = guard;

  try {
    // Atomic tenant-scoped deletion: prevents cross-tenant unlinking
    const result = await prisma.parentStudentLink.deleteMany({
      where: {
        tenantId: context.tenantId,
        parentId: data.parentId,
        studentId: data.studentId,
      },
    });

    if (result.count === 0) {
      return { success: false, error: 'Relationship not found or does not belong to your school.' };
    }

    await prisma.auditLog.create({
      data: {
        tenantId: context.tenantId,
        userId: context.userId,
        action: 'PARENT_STUDENT_UNLINKED',
        entityType: 'ParentStudentLink',
        newValues: { parentId: data.parentId, studentId: data.studentId },
      },
    });

    safeRevalidatePath('/admin/parents');
    safeRevalidatePath('/admin/students');

    return { success: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to unlink parent.';
    return { success: false, error: msg };
  }
}
