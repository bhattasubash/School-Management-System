'use server';

import { safeRevalidatePath as revalidatePath } from '@/lib/revalidate';
import { prisma } from '@/lib/db';
import { requireAuthGuard } from '@/lib/auth-guard';
import { Role } from '@/types';
import {
  updateAdmissionStatus,
  enrollStudentFromApplication,
} from '@/services/admission.service';
import {
  UpdateAdmissionStatusSchema,
  EnrollStudentFromApplicationSchema,
} from '@/lib/validations/admission';

export async function updateAdmissionStatusAction(
  applicationId: string,
  rawInput: {
    status:
      | 'DRAFT'
      | 'SUBMITTED'
      | 'DOCUMENT_VERIFIED'
      | 'INTERVIEW_SCHEDULED'
      | 'APPROVED'
      | 'ENROLLED'
      | 'REJECTED';
    interviewDate?: string | null;
    adminRemarks?: string | null;
  }
) {
  const guard = await requireAuthGuard([Role.ADMIN, Role.SUPER_ADMIN]);
  if (!guard.success) {
    return { success: false, error: guard.error };
  }

  const validation = UpdateAdmissionStatusSchema.safeParse(rawInput);
  if (!validation.success) {
    return {
      success: false,
      error: validation.error.errors.map((e) => e.message).join(', '),
    };
  }

  const { context } = guard;

  try {
    const updated = await updateAdmissionStatus(context.tenantId, applicationId, validation.data);

    await prisma.auditLog.create({
      data: {
        tenantId: context.tenantId,
        userId: context.userId,
        action: 'ADMISSION_STATUS_UPDATED',
        entityType: 'AdmissionApplication',
        entityId: applicationId,
        newValues: {
          status: updated.status,
          adminRemarks: updated.adminRemarks,
          interviewDate: updated.interviewDate?.toISOString(),
        },
      },
    });

    revalidatePath('/admin/admissions');
    revalidatePath('/admin');
    return { success: true, application: updated };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to update admission status.';
    return { success: false, error: msg };
  }
}

export async function enrollStudentAction(
  applicationId: string,
  rawInput: {
    sectionId: string;
    admissionNumber: string;
    rollNumber?: number;
    feeStructureId?: string;
    feeTermId?: string;
  }
) {
  const guard = await requireAuthGuard([Role.ADMIN, Role.SUPER_ADMIN]);
  if (!guard.success) {
    return { success: false, error: guard.error };
  }

  const validation = EnrollStudentFromApplicationSchema.safeParse(rawInput);
  if (!validation.success) {
    return {
      success: false,
      error: validation.error.errors.map((e) => e.message).join(', '),
    };
  }

  const { context } = guard;

  try {
    const result = await enrollStudentFromApplication(context.tenantId, applicationId, validation.data);

    await prisma.auditLog.create({
      data: {
        tenantId: context.tenantId,
        userId: context.userId,
        action: 'STUDENT_ENROLLED',
        entityType: 'StudentProfile',
        entityId: result.student.id,
        newValues: {
          admissionNumber: result.student.admissionNumber,
          studentName: `${result.student.user.firstName} ${result.student.user.lastName}`,
          sectionId: result.student.sectionId,
          applicationId,
        },
      },
    });

    revalidatePath('/admin/admissions');
    revalidatePath('/admin/students');
    revalidatePath('/admin/fees');
    revalidatePath('/admin');
    revalidatePath('/');

    return {
      success: true,
      studentId: result.student.id,
      admissionNumber: result.student.admissionNumber,
      studentName: `${result.student.user.firstName} ${result.student.user.lastName}`,
      parentName: `${result.parent.user.firstName} ${result.parent.user.lastName}`,
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to enroll student.';
    return { success: false, error: msg };
  }
}
