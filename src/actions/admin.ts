'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { prisma } from '@/lib/db';
import { getSessionFromCookies } from '@/lib/session';
import { NoticePriority, NoticeAudience } from '@prisma/client';

const PublishNoticeSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters').max(200),
  content: z.string().min(10, 'Content must be at least 10 characters').max(2000),
  priority: z.nativeEnum(NoticePriority).default(NoticePriority.NORMAL),
  targetAudience: z.nativeEnum(NoticeAudience).default(NoticeAudience.ALL),
});

export type PublishNoticeInput = z.infer<typeof PublishNoticeSchema>;

export async function publishNoticeAction(rawInput: PublishNoticeInput) {
  const session = await getSessionFromCookies();
  if (!session || (session.role !== 'ADMIN' && session.role !== 'SUPER_ADMIN')) {
    return { success: false, error: 'Unauthorized: Admin privileges required.' };
  }

  const validation = PublishNoticeSchema.safeParse(rawInput);
  if (!validation.success) {
    return {
      success: false,
      error: validation.error.errors.map((e) => e.message).join(', '),
    };
  }

  const input = validation.data;
  const tenantId = session.tenantId;

  if (!tenantId) {
    return { success: false, error: 'Tenant context required.' };
  }

  try {
    const notice = await prisma.notice.create({
      data: {
        tenantId,
        authorId: session.sub,
        title: input.title,
        content: input.content,
        priority: input.priority,
        targetAudience: input.targetAudience,
      },
    });

    // Create Audit Log
    await prisma.auditLog.create({
      data: {
        tenantId,
        userId: session.sub,
        action: 'CIRCULAR_PUBLISHED',
        entityType: 'Notice',
        entityId: notice.id,
        newValues: { title: notice.title, priority: notice.priority, audience: notice.targetAudience },
      },
    });

    revalidatePath('/admin');
    revalidatePath('/');
    return { success: true, notice };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Failed to publish notice.' };
  }
}

// ----------------------------------------------------------------------------
// FEE ENGINE SERVER ACTIONS
// ----------------------------------------------------------------------------

import {
  collectFeePaymentAtomic,
  generateQuarterlyInvoicesForClass,
} from '@/services/fee-engine.service';
import { PaymentMethod } from '@prisma/client';

const CollectCounterFeeSchema = z.object({
  feeInvoiceId: z.string().uuid('Valid invoice ID required'),
  amount: z.number().positive('Payment amount must be greater than zero'),
  paymentMethod: z.nativeEnum(PaymentMethod),
  remarks: z.string().max(250).optional(),
});

export type CollectCounterFeeInput = z.infer<typeof CollectCounterFeeSchema>;

export async function collectCounterFeeAction(rawInput: CollectCounterFeeInput) {
  const session = await getSessionFromCookies();
  if (
    !session ||
    (session.role !== 'ADMIN' && session.role !== 'SUPER_ADMIN' && session.role !== 'ACCOUNTANT')
  ) {
    return { success: false, error: 'Unauthorized: Admin or Accountant privileges required.' };
  }

  const validation = CollectCounterFeeSchema.safeParse(rawInput);
  if (!validation.success) {
    return {
      success: false,
      error: validation.error.errors.map((e) => e.message).join(', '),
    };
  }

  const tenantId = session.tenantId;
  if (!tenantId) {
    return { success: false, error: 'Tenant context required.' };
  }

  try {
    const { payment, invoice } = await collectFeePaymentAtomic(tenantId, {
      ...validation.data,
      collectedById: session.sub,
    });

    // Audit log
    await prisma.auditLog.create({
      data: {
        tenantId,
        userId: session.sub,
        action: 'FEE_COLLECTED',
        entityType: 'FeePayment',
        entityId: payment.id,
        newValues: {
          receiptNumber: payment.receiptNumber,
          amount: Number(payment.amount),
          paymentMethod: payment.paymentMethod,
          invoiceNumber: invoice.invoiceNumber,
          newBalance: Number(invoice.balanceAmount),
          status: invoice.status,
        },
      },
    });

    revalidatePath('/admin/fees');
    revalidatePath('/admin');
    revalidatePath('/admin/students');
    revalidatePath('/');

    return {
      success: true,
      receiptNumber: payment.receiptNumber,
      payment: {
        id: payment.id,
        receiptNumber: payment.receiptNumber,
        amount: Number(payment.amount),
        paymentMethod: payment.paymentMethod,
        status: payment.status,
        createdAt: payment.createdAt.toISOString(),
      },
      invoice: {
        id: invoice.id,
        invoiceNumber: invoice.invoiceNumber,
        paidAmount: Number(invoice.paidAmount),
        balanceAmount: Number(invoice.balanceAmount),
        status: invoice.status,
      },
    };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Failed to collect payment.' };
  }
}

const GenerateQuarterlyInvoicesActionSchema = z.object({
  academicYearId: z.string().uuid('Valid academic year ID required'),
  classGradeId: z.string().uuid('Valid class grade ID required'),
  feeTermId: z.string().uuid('Valid fee term ID required'),
});

export type GenerateQuarterlyInvoicesActionInput = z.infer<
  typeof GenerateQuarterlyInvoicesActionSchema
>;

export async function generateQuarterlyInvoicesAction(
  rawInput: GenerateQuarterlyInvoicesActionInput
) {
  const session = await getSessionFromCookies();
  if (
    !session ||
    (session.role !== 'ADMIN' && session.role !== 'SUPER_ADMIN' && session.role !== 'ACCOUNTANT')
  ) {
    return { success: false, error: 'Unauthorized: Admin or Accountant privileges required.' };
  }

  const validation = GenerateQuarterlyInvoicesActionSchema.safeParse(rawInput);
  if (!validation.success) {
    return {
      success: false,
      error: validation.error.errors.map((e) => e.message).join(', '),
    };
  }

  const tenantId = session.tenantId;
  if (!tenantId) {
    return { success: false, error: 'Tenant context required.' };
  }

  try {
    const result = await generateQuarterlyInvoicesForClass(tenantId, validation.data);

    // Audit log
    await prisma.auditLog.create({
      data: {
        tenantId,
        userId: session.sub,
        action: 'INVOICES_GENERATED',
        entityType: 'FeeInvoice',
        entityId: validation.data.feeTermId,
        newValues: {
          count: result.count,
          classGradeId: validation.data.classGradeId,
          academicYearId: validation.data.academicYearId,
        },
      },
    });

    revalidatePath('/admin/fees');
    revalidatePath('/admin');
    revalidatePath('/admin/students');
    revalidatePath('/');

    return {
      success: true,
      count: result.count,
    };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Failed to generate invoices.' };
  }
}

// ----------------------------------------------------------------------------
// ADMISSIONS INTAKE & 1-CLICK ENROLLMENT ACTIONS
// ----------------------------------------------------------------------------

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
  const session = await getSessionFromCookies();
  if (!session || (session.role !== 'ADMIN' && session.role !== 'SUPER_ADMIN')) {
    return { success: false, error: 'Unauthorized: Admin privileges required.' };
  }

  const validation = UpdateAdmissionStatusSchema.safeParse(rawInput);
  if (!validation.success) {
    return {
      success: false,
      error: validation.error.errors.map((e) => e.message).join(', '),
    };
  }

  const tenantId = session.tenantId;
  if (!tenantId) {
    return { success: false, error: 'Tenant context required.' };
  }

  try {
    const updated = await updateAdmissionStatus(tenantId, applicationId, validation.data);

    await prisma.auditLog.create({
      data: {
        tenantId,
        userId: session.sub,
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
  } catch (err: any) {
    return { success: false, error: err?.message || 'Failed to update admission status.' };
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
  const session = await getSessionFromCookies();
  if (!session || (session.role !== 'ADMIN' && session.role !== 'SUPER_ADMIN')) {
    return { success: false, error: 'Unauthorized: Admin privileges required.' };
  }

  const validation = EnrollStudentFromApplicationSchema.safeParse(rawInput);
  if (!validation.success) {
    return {
      success: false,
      error: validation.error.errors.map((e) => e.message).join(', '),
    };
  }

  const tenantId = session.tenantId;
  if (!tenantId) {
    return { success: false, error: 'Tenant context required.' };
  }

  try {
    const result = await enrollStudentFromApplication(tenantId, applicationId, validation.data);

    await prisma.auditLog.create({
      data: {
        tenantId,
        userId: session.sub,
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
  } catch (err: any) {
    return { success: false, error: err?.message || 'Failed to enroll student.' };
  }
}

// ----------------------------------------------------------------------------
// CIRCULAR & TIMETABLE/SUBSTITUTION ACTIONS
// ----------------------------------------------------------------------------

export async function deleteNoticeAction(noticeId: string) {
  const session = await getSessionFromCookies();
  if (!session || (session.role !== 'ADMIN' && session.role !== 'SUPER_ADMIN')) {
    return { success: false, error: 'Unauthorized: Admin privileges required.' };
  }

  const tenantId = session.tenantId;
  if (!tenantId) {
    return { success: false, error: 'Tenant context required.' };
  }

  try {
    const notice = await prisma.notice.findFirst({
      where: { id: noticeId, tenantId },
    });

    if (!notice) {
      return { success: false, error: 'Notice not found.' };
    }

    await prisma.notice.delete({
      where: { id: noticeId },
    });

    await prisma.auditLog.create({
      data: {
        tenantId,
        userId: session.sub,
        action: 'CIRCULAR_DELETED',
        entityType: 'Notice',
        entityId: noticeId,
        newValues: { title: notice.title },
      },
    });

    revalidatePath('/admin/notices');
    revalidatePath('/admin');
    revalidatePath('/');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Failed to delete circular.' };
  }
}

const AssignSubstitutionSchema = z.object({
  timetableEntryId: z.string().uuid('Valid timetable entry ID required'),
  substituteTeacherId: z.string().uuid('Valid substitute teacher ID required'),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date format must be YYYY-MM-DD'),
  reason: z.string().max(250).optional(),
});

export type AssignSubstitutionInput = z.infer<typeof AssignSubstitutionSchema>;

export async function assignTeacherSubstitutionAction(rawInput: AssignSubstitutionInput) {
  const session = await getSessionFromCookies();
  if (!session || (session.role !== 'ADMIN' && session.role !== 'SUPER_ADMIN')) {
    return { success: false, error: 'Unauthorized: Admin privileges required.' };
  }

  const validation = AssignSubstitutionSchema.safeParse(rawInput);
  if (!validation.success) {
    return {
      success: false,
      error: validation.error.errors.map((e) => e.message).join(', '),
    };
  }

  const tenantId = session.tenantId;
  if (!tenantId) {
    return { success: false, error: 'Tenant context required.' };
  }

  const { timetableEntryId, substituteTeacherId, date, reason } = validation.data;

  try {
    const timetableEntry = await prisma.timetableEntry.findFirst({
      where: { id: timetableEntryId, tenantId },
      include: {
        section: { include: { classGrade: true } },
        periodTimeSlot: true,
      },
    });

    if (!timetableEntry) {
      return { success: false, error: 'Timetable entry not found.' };
    }

    if (!timetableEntry.teacherId) {
      return { success: false, error: 'Timetable entry has no primary teacher assigned.' };
    }

    if (timetableEntry.teacherId === substituteTeacherId) {
      return { success: false, error: 'Substitute teacher cannot be the same as the assigned teacher.' };
    }

    const subDate = new Date(date);

    // Upsert substitution for this entry and date
    const substitution = await prisma.teacherSubstitution.upsert({
      where: {
        tenantId_timetableEntryId_date: {
          tenantId,
          timetableEntryId,
          date: subDate,
        },
      },
      update: {
        substituteTeacherId,
        reason: reason || 'Assigned by Administrator',
        status: 'ASSIGNED',
        assignedById: session.sub,
      },
      create: {
        tenantId,
        timetableEntryId,
        originalTeacherId: timetableEntry.teacherId,
        substituteTeacherId,
        date: subDate,
        reason: reason || 'Assigned by Administrator',
        status: 'ASSIGNED',
        assignedById: session.sub,
      },
    });

    await prisma.auditLog.create({
      data: {
        tenantId,
        userId: session.sub,
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

    revalidatePath('/admin/academics');
    revalidatePath('/admin/teachers');
    revalidatePath('/teacher');
    revalidatePath('/admin');

    return {
      success: true,
      substitution: {
        id: substitution.id,
        status: substitution.status,
        date: substitution.date.toISOString(),
      },
    };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Failed to assign substitution.' };
  }
}

export async function cancelTeacherSubstitutionAction(substitutionId: string) {
  const session = await getSessionFromCookies();
  if (!session || (session.role !== 'ADMIN' && session.role !== 'SUPER_ADMIN')) {
    return { success: false, error: 'Unauthorized: Admin privileges required.' };
  }

  const tenantId = session.tenantId;
  if (!tenantId) {
    return { success: false, error: 'Tenant context required.' };
  }

  try {
    const updated = await prisma.teacherSubstitution.update({
      where: { id: substitutionId },
      data: { status: 'CANCELLED' },
    });

    await prisma.auditLog.create({
      data: {
        tenantId,
        userId: session.sub,
        action: 'TEACHER_SUBSTITUTION_CANCELLED',
        entityType: 'TeacherSubstitution',
        entityId: substitutionId,
      },
    });

    revalidatePath('/admin/academics');
    revalidatePath('/admin/teachers');
    revalidatePath('/teacher');
    revalidatePath('/admin');

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Failed to cancel substitution.' };
  }
}



