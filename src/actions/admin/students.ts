'use server';

import { safeRevalidatePath as revalidatePath } from '@/lib/revalidate';
import { z } from 'zod';
import { prisma } from '@/lib/db';
import { requireAuthGuard } from '@/lib/auth-guard';
import { Role } from '@/types';
import { CreateStudentSchema, type CreateStudentInput } from '@/lib/validations/student';
import { AuthService } from '@/services/auth.service';

export async function createStudentAction(rawInput: CreateStudentInput) {
  const guard = await requireAuthGuard([Role.ADMIN, Role.SUPER_ADMIN]);
  if (!guard.success) {
    return { success: false, error: guard.error };
  }

  const { context } = guard;
  const tenantId = context.tenantId;

  const validation = CreateStudentSchema.safeParse(rawInput);
  if (!validation.success) {
    return {
      success: false,
      error: validation.error.errors.map((e) => e.message).join(', '),
    };
  }

  const input = validation.data;

  try {
    const existing = await prisma.studentProfile.findFirst({
      where: { tenantId, admissionNumber: input.admissionNumber },
    });
    if (existing) {
      return { success: false, error: `Admission number "${input.admissionNumber}" is already in use.` };
    }

    // Generate unique, cryptographically strong temporary password (P1-3)
    const tempPassword = AuthService.generateSecureTemporaryPassword();
    const defaultPasswordHash = await AuthService.hashPassword(tempPassword);
    const studentEmail = input.email || `std.${input.admissionNumber.toLowerCase()}@school.edu.in`;

    const result = await prisma.$transaction(async (tx) => {
      // 1. Create student user
      let studentUser = await tx.user.findFirst({
        where: { tenantId, email: studentEmail },
      });

      if (!studentUser) {
        studentUser = await tx.user.create({
          data: {
            tenantId,
            email: studentEmail,
            phone: input.phone || null,
            firstName: input.firstName,
            lastName: input.lastName,
            role: 'STUDENT',
            passwordHash: defaultPasswordHash,
            mustChangePassword: true,
          },
        });
      }

      // 2. Create student profile
      const studentProfile = await tx.studentProfile.create({
        data: {
          tenantId,
          userId: studentUser.id,
          admissionNumber: input.admissionNumber,
          rollNumber: input.rollNumber || null,
          sectionId: input.sectionId,
          dateOfBirth: new Date(input.dateOfBirth),
          gender: input.gender,
          bloodGroup: input.bloodGroup || null,
          address: input.address,
          emergencyContact: input.emergencyContact,
          admissionDate: new Date(input.admissionDate),
          previousSchool: input.previousSchool || null,
        },
      });

      // 3. Parent creation / Sibling linking
      const parentPhone = input.fatherPhone || input.motherPhone;
      const parentName = input.fatherName || input.motherName;
      const parentEmail = input.fatherEmail || input.motherEmail || `parent.${parentPhone}@school.edu.in`;

      if (parentPhone) {
        let parentUser = await tx.user.findFirst({
          where: { tenantId, phone: parentPhone },
        });

        if (!parentUser) {
          const parentTempPassword = AuthService.generateSecureTemporaryPassword();
          const parentHash = await AuthService.hashPassword(parentTempPassword);

          parentUser = await tx.user.create({
            data: {
              tenantId,
              email: parentEmail,
              phone: parentPhone,
              firstName: parentName.split(' ')[0] || parentName,
              lastName: parentName.split(' ').slice(1).join(' ') || 'Parent',
              role: 'PARENT',
              passwordHash: parentHash,
              mustChangePassword: true,
            },
          });
        }

        let parentProfile = await tx.parentProfile.findUnique({
          where: { userId: parentUser.id },
        });

        if (!parentProfile) {
          parentProfile = await tx.parentProfile.create({
            data: {
              tenantId,
              userId: parentUser.id,
              relationship: input.fatherName ? 'FATHER' : 'MOTHER',
              occupation: input.fatherOccupation || null,
            },
          });
        }

        // Link parent to student (sibling linking if parent already existed)
        await tx.parentStudentLink.create({
          data: {
            tenantId,
            parentId: parentProfile.id,
            studentId: studentProfile.id,
            isPrimary: true,
          },
        });
      }

      return { studentProfile, studentUser };
    });

    await prisma.auditLog.create({
      data: {
        tenantId,
        userId: context.userId,
        action: 'STUDENT_CREATED',
        entityType: 'StudentProfile',
        entityId: result.studentProfile.id,
        newValues: {
          admissionNumber: input.admissionNumber,
          firstName: input.firstName,
          lastName: input.lastName,
          sectionId: input.sectionId,
        },
      },
    });

    revalidatePath('/admin/students');
    revalidatePath('/admin/parents');

    return {
      success: true,
      studentId: result.studentProfile.id,
      temporaryPassword: tempPassword,
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to create student.';
    return { success: false, error: msg };
  }
}

// ----------------------------------------------------------------------------
// P3-1: STUDENT SECTION TRANSFER WORKFLOW
// ----------------------------------------------------------------------------

const TransferStudentSectionSchema = z.object({
  studentProfileId: z.string().uuid('Valid student ID required'),
  targetSectionId: z.string().uuid('Valid target section ID required'),
  reason: z.string().min(3, 'Transfer reason required').max(200),
});

export type TransferStudentSectionInput = z.infer<typeof TransferStudentSectionSchema>;

/**
 * Controlled Student Section Transfer:
 * Moves student between sections within the same school and logs historical transition.
 */
export async function transferStudentSectionAction(rawInput: TransferStudentSectionInput) {
  const guard = await requireAuthGuard([Role.ADMIN, Role.SUPER_ADMIN]);
  if (!guard.success) {
    return { success: false, error: guard.error };
  }

  const validation = TransferStudentSectionSchema.safeParse(rawInput);
  if (!validation.success) {
    return {
      success: false,
      error: validation.error.errors.map((e) => e.message).join(', '),
    };
  }

  const { context } = guard;
  const { studentProfileId, targetSectionId, reason } = validation.data;

  try {
    // 1. Verify student belongs to this tenant
    const student = await prisma.studentProfile.findFirst({
      where: { id: studentProfileId, tenantId: context.tenantId },
      include: {
        section: { include: { classGrade: true } },
        user: true,
      },
    });

    if (!student) {
      return { success: false, error: 'Student record not found in your school.' };
    }

    // 2. Verify target section belongs to this tenant
    const targetSection = await prisma.section.findFirst({
      where: { id: targetSectionId, tenantId: context.tenantId },
      include: { classGrade: true },
    });

    if (!targetSection) {
      return { success: false, error: 'Target section not found in your school.' };
    }

    if (student.sectionId === targetSectionId) {
      return { success: false, error: 'Student is already enrolled in this section.' };
    }

    const previousSectionName = `${student.section.classGrade.name}-${student.section.name}`;
    const newSectionName = `${targetSection.classGrade.name}-${targetSection.name}`;

    // 3. Atomically update section assignment with strict tenant scoping
    await prisma.studentProfile.updateMany({
      where: { id: studentProfileId, tenantId: context.tenantId },
      data: { sectionId: targetSectionId },
    });

    // 4. Record audit log
    await prisma.auditLog.create({
      data: {
        tenantId: context.tenantId,
        userId: context.userId,
        action: 'STUDENT_SECTION_TRANSFERRED',
        entityType: 'StudentProfile',
        entityId: studentProfileId,
        newValues: {
          studentName: `${student.user.firstName} ${student.user.lastName}`,
          admissionNumber: student.admissionNumber,
          fromSection: previousSectionName,
          toSection: newSectionName,
          reason,
        },
      },
    });

    revalidatePath('/admin/students');
    revalidatePath('/admin/attendance');

    return {
      success: true,
      message: `Student successfully transferred from ${previousSectionName} to ${newSectionName}.`,
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to transfer student section.';
    return { success: false, error: msg };
  }
}

// ----------------------------------------------------------------------------
// P3-3: CONTROLLED ACADEMIC YEAR ROLLOVER WORKFLOW
// ----------------------------------------------------------------------------

const RolloverAcademicYearSchema = z.object({
  name: z.string().min(4, 'Session name e.g. "2027-28" required').max(20),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Start date must be YYYY-MM-DD'),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'End date must be YYYY-MM-DD'),
  cloneStructureFromCurrent: z.boolean().default(true),
});

export type RolloverAcademicYearInput = z.infer<typeof RolloverAcademicYearSchema>;

/**
 * Creates next academic year and optionally clones class grades and sections
 * without mutating or destroying historical academic records.
 */
export async function rolloverAcademicYearAction(rawInput: RolloverAcademicYearInput) {
  const guard = await requireAuthGuard([Role.ADMIN, Role.SUPER_ADMIN]);
  if (!guard.success) {
    return { success: false, error: guard.error };
  }

  const validation = RolloverAcademicYearSchema.safeParse(rawInput);
  if (!validation.success) {
    return {
      success: false,
      error: validation.error.errors.map((e) => e.message).join(', '),
    };
  }

  const { context } = guard;
  const input = validation.data;

  try {
    const existing = await prisma.academicYear.findFirst({
      where: { tenantId: context.tenantId, name: input.name },
    });
    if (existing) {
      return { success: false, error: `Academic year "${input.name}" already exists.` };
    }

    const currentYear = await prisma.academicYear.findFirst({
      where: { tenantId: context.tenantId, isCurrent: true },
      include: {
        classGrades: {
          include: { sections: true },
        },
      },
    });

    const newYear = await prisma.$transaction(async (tx) => {
      // 1. Create new academic year
      const createdYear = await tx.academicYear.create({
        data: {
          tenantId: context.tenantId,
          name: input.name,
          startDate: new Date(input.startDate),
          endDate: new Date(input.endDate),
          isCurrent: false, // Don't auto-switch current session until admin activates it
        },
      });

      // 2. Clone class grades and sections if requested
      if (input.cloneStructureFromCurrent && currentYear) {
        for (const grade of currentYear.classGrades) {
          const newGrade = await tx.classGrade.create({
            data: {
              tenantId: context.tenantId,
              academicYearId: createdYear.id,
              name: grade.name,
              numericOrder: grade.numericOrder,
            },
          });

          for (const sec of grade.sections) {
            await tx.section.create({
              data: {
                tenantId: context.tenantId,
                classGradeId: newGrade.id,
                name: sec.name,
              },
            });
          }
        }
      }

      return createdYear;
    });

    await prisma.auditLog.create({
      data: {
        tenantId: context.tenantId,
        userId: context.userId,
        action: 'ACADEMIC_YEAR_CREATED',
        entityType: 'AcademicYear',
        entityId: newYear.id,
        newValues: { name: newYear.name, startDate: input.startDate, endDate: input.endDate },
      },
    });

    revalidatePath('/admin/academics');
    return {
      success: true,
      academicYearId: newYear.id,
      message: `Academic year ${newYear.name} provisioned successfully.`,
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to provision academic year.';
    return { success: false, error: msg };
  }
}
