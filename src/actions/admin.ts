'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import * as XLSX from 'xlsx';
import { prisma } from '@/lib/db';
import { getSessionFromCookies } from '@/lib/session';
import { NoticePriority, NoticeAudience, Relationship } from '@prisma/client';
import { CreateStudentSchema, type CreateStudentInput } from '@/lib/validations/student';

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

// ============================================================================
// PARENT MANAGEMENT ACTIONS (Phase 6.2)
// ============================================================================

export async function getParentsAction() {
  const session = await getSessionFromCookies();
  if (!session || (session.role !== 'ADMIN' && session.role !== 'SUPER_ADMIN')) {
    return { success: false, error: 'Unauthorized: Admin privileges required.' };
  }

  const tenantId = session.tenantId;
  if (!tenantId) {
    return { success: false, error: 'Tenant context required.' };
  }

  try {
    const parents = await prisma.parentProfile.findMany({
      where: { tenantId },
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
  } catch (err: any) {
    return { success: false, error: err?.message || 'Failed to fetch parents.' };
  }
}

export async function linkParentToStudentAction(data: {
  parentId: string;
  studentId: string;
  isPrimary?: boolean;
}) {
  const session = await getSessionFromCookies();
  if (!session || (session.role !== 'ADMIN' && session.role !== 'SUPER_ADMIN')) {
    return { success: false, error: 'Unauthorized: Admin privileges required.' };
  }

  const tenantId = session.tenantId;
  if (!tenantId) {
    return { success: false, error: 'Tenant context required.' };
  }

  try {
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
        tenantId,
        parentId: data.parentId,
        studentId: data.studentId,
        isPrimary: Boolean(data.isPrimary),
      },
    });

    revalidatePath('/admin/parents');
    revalidatePath('/admin/students');

    return { success: true, link };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Failed to link parent to student.' };
  }
}

export async function unlinkParentAction(data: { parentId: string; studentId: string }) {
  const session = await getSessionFromCookies();
  if (!session || (session.role !== 'ADMIN' && session.role !== 'SUPER_ADMIN')) {
    return { success: false, error: 'Unauthorized: Admin privileges required.' };
  }

  try {
    await prisma.parentStudentLink.deleteMany({
      where: {
        parentId: data.parentId,
        studentId: data.studentId,
      },
    });

    revalidatePath('/admin/parents');
    revalidatePath('/admin/students');

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Failed to unlink parent.' };
  }
}

// ============================================================================
// ARCHIVE & DEACTIVATION ACTIONS (Phase 6.5)
// ============================================================================

export async function archiveStudentsAction(studentProfileIds: string[]) {
  const session = await getSessionFromCookies();
  if (!session || (session.role !== 'ADMIN' && session.role !== 'SUPER_ADMIN')) {
    return { success: false, error: 'Unauthorized: Admin privileges required.' };
  }

  const tenantId = session.tenantId;
  if (!tenantId) {
    return { success: false, error: 'Tenant context required.' };
  }

  try {
    const profiles = await prisma.studentProfile.findMany({
      where: { id: { in: studentProfileIds }, tenantId },
      select: { userId: true },
    });

    const userIds = profiles.map((p) => p.userId);

    await prisma.user.updateMany({
      where: { id: { in: userIds }, tenantId },
      data: {
        isActive: false,
        deletedAt: new Date(),
      },
    });

    await prisma.auditLog.create({
      data: {
        tenantId,
        userId: session.sub,
        action: 'STUDENTS_ARCHIVED',
        entityType: 'StudentProfile',
        newValues: { studentProfileIds, userIds },
      },
    });

    revalidatePath('/admin/students');
    return { success: true, count: userIds.length };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Failed to archive students.' };
  }
}

export async function reactivateStudentsAction(studentProfileIds: string[]) {
  const session = await getSessionFromCookies();
  if (!session || (session.role !== 'ADMIN' && session.role !== 'SUPER_ADMIN')) {
    return { success: false, error: 'Unauthorized: Admin privileges required.' };
  }

  const tenantId = session.tenantId;
  if (!tenantId) {
    return { success: false, error: 'Tenant context required.' };
  }

  try {
    const profiles = await prisma.studentProfile.findMany({
      where: { id: { in: studentProfileIds }, tenantId },
      select: { userId: true },
    });

    const userIds = profiles.map((p) => p.userId);

    await prisma.user.updateMany({
      where: { id: { in: userIds }, tenantId },
      data: {
        isActive: true,
        deletedAt: null,
      },
    });

    await prisma.auditLog.create({
      data: {
        tenantId,
        userId: session.sub,
        action: 'STUDENTS_REACTIVATED',
        entityType: 'StudentProfile',
        newValues: { studentProfileIds, userIds },
      },
    });

    revalidatePath('/admin/students');
    return { success: true, count: userIds.length };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Failed to reactivate students.' };
  }
}

export async function archiveTeacherAction(teacherProfileId: string) {
  const session = await getSessionFromCookies();
  if (!session || (session.role !== 'ADMIN' && session.role !== 'SUPER_ADMIN')) {
    return { success: false, error: 'Unauthorized: Admin privileges required.' };
  }

  const tenantId = session.tenantId;
  if (!tenantId) {
    return { success: false, error: 'Tenant context required.' };
  }

  try {
    const profile = await prisma.teacherProfile.findFirst({
      where: { id: teacherProfileId, tenantId },
      select: { userId: true },
    });

    if (!profile) {
      return { success: false, error: 'Teacher not found.' };
    }

    await prisma.user.update({
      where: { id: profile.userId },
      data: {
        isActive: false,
        deletedAt: new Date(),
      },
    });

    await prisma.auditLog.create({
      data: {
        tenantId,
        userId: session.sub,
        action: 'TEACHER_ARCHIVED',
        entityType: 'TeacherProfile',
        entityId: teacherProfileId,
      },
    });

    revalidatePath('/admin/teachers');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Failed to archive teacher.' };
  }
}

export async function reactivateTeacherAction(teacherProfileId: string) {
  const session = await getSessionFromCookies();
  if (!session || (session.role !== 'ADMIN' && session.role !== 'SUPER_ADMIN')) {
    return { success: false, error: 'Unauthorized: Admin privileges required.' };
  }

  const tenantId = session.tenantId;
  if (!tenantId) {
    return { success: false, error: 'Tenant context required.' };
  }

  try {
    const profile = await prisma.teacherProfile.findFirst({
      where: { id: teacherProfileId, tenantId },
      select: { userId: true },
    });

    if (!profile) {
      return { success: false, error: 'Teacher not found.' };
    }

    await prisma.user.update({
      where: { id: profile.userId },
      data: {
        isActive: true,
        deletedAt: null,
      },
    });

    await prisma.auditLog.create({
      data: {
        tenantId,
        userId: session.sub,
        action: 'TEACHER_REACTIVATED',
        entityType: 'TeacherProfile',
        entityId: teacherProfileId,
      },
    });

    revalidatePath('/admin/teachers');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Failed to reactivate teacher.' };
  }
}

export async function batchArchiveBySectionAction(sectionId: string) {
  const session = await getSessionFromCookies();
  if (!session || (session.role !== 'ADMIN' && session.role !== 'SUPER_ADMIN')) {
    return { success: false, error: 'Unauthorized: Admin privileges required.' };
  }

  const tenantId = session.tenantId;
  if (!tenantId) {
    return { success: false, error: 'Tenant context required.' };
  }

  try {
    const students = await prisma.studentProfile.findMany({
      where: { sectionId, tenantId },
      select: { id: true, userId: true },
    });

    const userIds = students.map((s) => s.userId);

    await prisma.user.updateMany({
      where: { id: { in: userIds }, tenantId },
      data: {
        isActive: false,
        deletedAt: new Date(),
      },
    });

    await prisma.auditLog.create({
      data: {
        tenantId,
        userId: session.sub,
        action: 'BATCH_SECTION_ARCHIVED',
        entityType: 'Section',
        entityId: sectionId,
        newValues: { studentCount: userIds.length },
      },
    });

    revalidatePath('/admin/students');
    return { success: true, count: userIds.length };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Failed to archive section.' };
  }
}

// ============================================================================
// BULK IMPORT PIPELINE ACTIONS (Phase 6.4)
// ============================================================================

export async function generateStudentTemplateAction(): Promise<{
  success: boolean;
  base64?: string;
  fileName?: string;
  error?: string;
}> {
  try {
    const headers = [
      'Admission Number',
      'First Name',
      'Last Name',
      'Email',
      'Phone',
      'Date of Birth (YYYY-MM-DD)',
      'Gender (Male/Female/Other)',
      'Blood Group',
      'Address',
      'Emergency Contact',
      'Class',
      'Section',
      'Father Name',
      'Father Phone',
      'Mother Name',
      'Mother Phone',
    ];

    const sampleRow = [
      'ADM-2026-001',
      'Rahul',
      'Verma',
      'rahul.verma@example.com',
      '9876543210',
      '2010-05-15',
      'Male',
      'B+',
      '123 Civil Lines, New Delhi',
      '9876543210',
      'Class 10',
      'A',
      'Suresh Verma',
      '9876543210',
      'Anita Verma',
      '9876543211',
    ];

    const ws = XLSX.utils.aoa_to_sheet([headers, sampleRow]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Students_Template');

    const buffer = XLSX.write(wb, { type: 'base64', bookType: 'xlsx' });
    return {
      success: true,
      base64: buffer,
      fileName: 'student_import_template.xlsx',
    };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Failed to generate template.' };
  }
}

export async function generateTeacherTemplateAction(): Promise<{
  success: boolean;
  base64?: string;
  fileName?: string;
  error?: string;
}> {
  try {
    const headers = [
      'Employee ID',
      'First Name',
      'Last Name',
      'Email',
      'Phone',
      'Department',
      'Qualification',
      'Specialization',
      'Joining Date (YYYY-MM-DD)',
    ];

    const sampleRow = [
      'EMP-101',
      'Sita',
      'Raman',
      'sita.raman@example.com',
      '9876543220',
      'Mathematics',
      'M.Sc. B.Ed.',
      'Calculus',
      '2022-06-01',
    ];

    const ws = XLSX.utils.aoa_to_sheet([headers, sampleRow]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Teachers_Template');

    const buffer = XLSX.write(wb, { type: 'base64', bookType: 'xlsx' });
    return {
      success: true,
      base64: buffer,
      fileName: 'teacher_import_template.xlsx',
    };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Failed to generate template.' };
  }
}

export async function importStudentsBatchAction(rows: Array<Record<string, any>>) {
  const session = await getSessionFromCookies();
  if (!session || (session.role !== 'ADMIN' && session.role !== 'SUPER_ADMIN')) {
    return { success: false, error: 'Unauthorized: Admin privileges required.' };
  }

  const tenantId = session.tenantId;
  if (!tenantId) {
    return { success: false, error: 'Tenant context required.' };
  }

  const results = {
    total: rows.length,
    imported: 0,
    skipped: 0,
    errors: [] as Array<{ row: number; identifier: string; reason: string }>,
  };

  const defaultPasswordHash = await bcrypt.hash('Student@123', 10);

  // Fetch sections and academic year for tenant
  const [sections, academicYear] = await Promise.all([
    prisma.section.findMany({
      where: { tenantId },
      include: { classGrade: true },
    }),
    prisma.academicYear.findFirst({
      where: { tenantId, isCurrent: true },
    }),
  ]);

  if (!academicYear) {
    return { success: false, error: 'Active academic year not found. Please configure an academic session first.' };
  }

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const rowNum = i + 1;
    const admissionNumber = String(row['Admission Number'] || row.admissionNumber || '').trim();
    const firstName = String(row['First Name'] || row.firstName || '').trim();
    const lastName = String(row['Last Name'] || row.lastName || '').trim();
    const email = String(row['Email'] || row.email || '').trim().toLowerCase();
    const phone = row['Phone'] || row.phone ? String(row['Phone'] || row.phone).trim() : null;
    const dobStr = String(row['Date of Birth (YYYY-MM-DD)'] || row.dateOfBirth || '').trim();
    const gender = String(row['Gender (Male/Female/Other)'] || row.gender || 'Male').trim();
    const className = String(row['Class'] || row.className || '').trim();
    const sectionName = String(row['Section'] || row.sectionName || '').trim();
    const address = String(row['Address'] || row.address || 'Address not provided').trim();
    const emergencyContact = String(row['Emergency Contact'] || row.emergencyContact || phone || '0000000000').trim();

    if (!admissionNumber || !firstName || !lastName || !email || !className || !sectionName) {
      results.skipped++;
      results.errors.push({
        row: rowNum,
        identifier: admissionNumber || email || `Row #${rowNum}`,
        reason: 'Missing mandatory fields (Admission Number, Names, Email, Class, Section)',
      });
      continue;
    }

    // Check admission number duplicate in tenant
    const existingStudent = await prisma.studentProfile.findFirst({
      where: { tenantId, admissionNumber },
    });

    if (existingStudent) {
      results.skipped++;
      results.errors.push({
        row: rowNum,
        identifier: admissionNumber,
        reason: 'Admission number already exists in this school.',
      });
      continue;
    }

    // Find section
    const targetSection = sections.find(
      (s) =>
        s.classGrade.name.toLowerCase() === className.toLowerCase() &&
        s.name.toLowerCase() === sectionName.toLowerCase()
    );

    if (!targetSection) {
      results.skipped++;
      results.errors.push({
        row: rowNum,
        identifier: admissionNumber,
        reason: `Class section "${className} - ${sectionName}" not found.`,
      });
      continue;
    }

    const dob = dobStr && !isNaN(Date.parse(dobStr)) ? new Date(dobStr) : new Date('2010-01-01');

    try {
      await prisma.$transaction(async (tx) => {
        // Create or find student User
        let user = await tx.user.findFirst({
          where: { tenantId, email },
        });

        if (!user) {
          user = await tx.user.create({
            data: {
              tenantId,
              email,
              phone,
              firstName,
              lastName,
              role: 'STUDENT',
              passwordHash: defaultPasswordHash,
              mustChangePassword: true,
            },
          });
        }

        // Create student profile
        const studentProfile = await tx.studentProfile.create({
          data: {
            tenantId,
            userId: user.id,
            admissionNumber,
            sectionId: targetSection.id,
            dateOfBirth: dob,
            gender,
            bloodGroup: row['Blood Group'] || row.bloodGroup || null,
            address,
            emergencyContact,
            admissionDate: new Date(),
          },
        });

        // Parent linking if parent info is provided
        const fatherName = String(row['Father Name'] || row.fatherName || '').trim();
        const fatherPhone = String(row['Father Phone'] || row.fatherPhone || '').trim();

        if (fatherName && fatherPhone) {
          const parentEmail = `parent.${admissionNumber.toLowerCase()}@school.edu.in`;
          let parentUser = await tx.user.findFirst({
            where: { tenantId, phone: fatherPhone },
          });

          if (!parentUser) {
            parentUser = await tx.user.create({
              data: {
                tenantId,
                email: parentEmail,
                phone: fatherPhone,
                firstName: fatherName.split(' ')[0] || fatherName,
                lastName: fatherName.split(' ').slice(1).join(' ') || 'Parent',
                role: 'PARENT',
                passwordHash: defaultPasswordHash,
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
                relationship: 'FATHER',
              },
            });
          }

          await tx.parentStudentLink.create({
            data: {
              tenantId,
              parentId: parentProfile.id,
              studentId: studentProfile.id,
              isPrimary: true,
            },
          });
        }
      });

      results.imported++;
    } catch (err: any) {
      results.skipped++;
      results.errors.push({
        row: rowNum,
        identifier: admissionNumber,
        reason: err?.message || 'Database error occurred while saving student.',
      });
    }
  }

  revalidatePath('/admin/students');
  return { success: true, results };
}

export async function importTeachersBatchAction(rows: Array<Record<string, any>>) {
  const session = await getSessionFromCookies();
  if (!session || (session.role !== 'ADMIN' && session.role !== 'SUPER_ADMIN')) {
    return { success: false, error: 'Unauthorized: Admin privileges required.' };
  }

  const tenantId = session.tenantId;
  if (!tenantId) {
    return { success: false, error: 'Tenant context required.' };
  }

  const results = {
    total: rows.length,
    imported: 0,
    skipped: 0,
    errors: [] as Array<{ row: number; identifier: string; reason: string }>,
  };

  const defaultPasswordHash = await bcrypt.hash('Teacher@123', 10);

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const rowNum = i + 1;
    const employeeId = String(row['Employee ID'] || row.employeeId || '').trim();
    const firstName = String(row['First Name'] || row.firstName || '').trim();
    const lastName = String(row['Last Name'] || row.lastName || '').trim();
    const email = String(row['Email'] || row.email || '').trim().toLowerCase();
    const phone = row['Phone'] || row.phone ? String(row['Phone'] || row.phone).trim() : null;
    const department = String(row['Department'] || row.department || 'General').trim();
    const qualification = String(row['Qualification'] || row.qualification || 'Graduate').trim();
    const specialization = row['Specialization'] || row.specialization ? String(row['Specialization'] || row.specialization).trim() : null;
    const joiningDateStr = String(row['Joining Date (YYYY-MM-DD)'] || row.joiningDate || '').trim();

    if (!employeeId || !firstName || !lastName || !email) {
      results.skipped++;
      results.errors.push({
        row: rowNum,
        identifier: employeeId || email || `Row #${rowNum}`,
        reason: 'Missing required fields (Employee ID, Names, Email)',
      });
      continue;
    }

    const existingTeacher = await prisma.teacherProfile.findFirst({
      where: { tenantId, employeeId },
    });

    if (existingTeacher) {
      results.skipped++;
      results.errors.push({
        row: rowNum,
        identifier: employeeId,
        reason: 'Employee ID already exists.',
      });
      continue;
    }

    const joiningDate = joiningDateStr && !isNaN(Date.parse(joiningDateStr)) ? new Date(joiningDateStr) : new Date();

    try {
      await prisma.$transaction(async (tx) => {
        let user = await tx.user.findFirst({
          where: { tenantId, email },
        });

        if (!user) {
          user = await tx.user.create({
            data: {
              tenantId,
              email,
              phone,
              firstName,
              lastName,
              role: 'TEACHER',
              passwordHash: defaultPasswordHash,
              mustChangePassword: true,
            },
          });
        }

        await tx.teacherProfile.create({
          data: {
            tenantId,
            userId: user.id,
            employeeId,
            department,
            qualification,
            specialization,
            joiningDate,
          },
        });
      });

      results.imported++;
    } catch (err: any) {
      results.skipped++;
      results.errors.push({
        row: rowNum,
        identifier: employeeId,
        reason: err?.message || 'Database error occurred.',
      });
    }
  }

  revalidatePath('/admin/teachers');
  return { success: true, results };
}

export async function createStudentAction(rawInput: CreateStudentInput) {
  const session = await getSessionFromCookies();
  if (!session || (session.role !== 'ADMIN' && session.role !== 'SUPER_ADMIN')) {
    return { success: false, error: 'Unauthorized: Admin privileges required.' };
  }

  const tenantId = session.tenantId;
  if (!tenantId) {
    return { success: false, error: 'Tenant context required.' };
  }

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

    const defaultPasswordHash = await bcrypt.hash('Student@123', 10);
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
          parentUser = await tx.user.create({
            data: {
              tenantId,
              email: parentEmail,
              phone: parentPhone,
              firstName: parentName.split(' ')[0] || parentName,
              lastName: parentName.split(' ').slice(1).join(' ') || 'Parent',
              role: 'PARENT',
              passwordHash: defaultPasswordHash,
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

    revalidatePath('/admin/students');
    revalidatePath('/admin/parents');

    return { success: true, studentId: result.studentProfile.id };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Failed to create student.' };
  }
}


// ════════════════════════════════════════════════════════════════════════════
// TIMETABLE MANAGEMENT ACTIONS (Phase 7)
// ════════════════════════════════════════════════════════════════════════════

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
import { validateTimetableSlotConflict, findAvailableSubstitutes } from '@/services/timetable-conflict.service';
import type { DayOfWeek } from '@prisma/client';

/**
 * Fetch all period time slots for the current tenant, ordered by `order`.
 */
export async function getPeriodTimeSlotsAction() {
  const session = await getSessionFromCookies();
  if (!session || !session.tenantId) {
    return { success: false as const, error: 'Unauthorized' };
  }
  try {
    const slots = await prisma.periodTimeSlot.findMany({
      where: { tenantId: session.tenantId },
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
  const session = await getSessionFromCookies();
  if (!session || !session.tenantId || (session.role !== 'ADMIN' && session.role !== 'SUPER_ADMIN')) {
    return { success: false as const, error: 'Unauthorized: Admin privileges required.' };
  }

  const validation = CreatePeriodTimeSlotSchema.safeParse(rawInput);
  if (!validation.success) {
    return { success: false as const, error: validation.error.errors.map(e => e.message).join(', ') };
  }

  try {
    const data = validation.data;

    // Check for duplicate order
    const existing = await prisma.periodTimeSlot.findFirst({
      where: { tenantId: session.tenantId, order: data.order },
    });
    if (existing) {
      return { success: false as const, error: `A period with order ${data.order} already exists.` };
    }

    const slot = await prisma.periodTimeSlot.create({
      data: {
        tenantId: session.tenantId,
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
  const session = await getSessionFromCookies();
  if (!session || !session.tenantId || (session.role !== 'ADMIN' && session.role !== 'SUPER_ADMIN')) {
    return { success: false as const, error: 'Unauthorized: Admin privileges required.' };
  }

  const validation = UpdatePeriodTimeSlotSchema.safeParse(rawInput);
  if (!validation.success) {
    return { success: false as const, error: validation.error.errors.map(e => e.message).join(', ') };
  }

  try {
    const { id, ...updateData } = validation.data;

    // If order is being changed, check for conflicts
    if (updateData.order !== undefined) {
      const existing = await prisma.periodTimeSlot.findFirst({
        where: { tenantId: session.tenantId, order: updateData.order, NOT: { id } },
      });
      if (existing) {
        return { success: false as const, error: `A period with order ${updateData.order} already exists.` };
      }
    }

    const slot = await prisma.periodTimeSlot.update({
      where: { id, tenantId: session.tenantId },
      data: updateData,
    });

    revalidatePath('/admin/timetable');
    return { success: true as const, slot };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to update time slot.';
    return { success: false as const, error: msg };
  }
}

/**
 * Delete a period time slot. Blocks deletion if timetable entries reference it.
 */
export async function deletePeriodTimeSlotAction(slotId: string) {
  const session = await getSessionFromCookies();
  if (!session || !session.tenantId || (session.role !== 'ADMIN' && session.role !== 'SUPER_ADMIN')) {
    return { success: false as const, error: 'Unauthorized: Admin privileges required.' };
  }

  try {
    const entriesCount = await prisma.timetableEntry.count({
      where: { tenantId: session.tenantId, periodTimeSlotId: slotId },
    });
    if (entriesCount > 0) {
      return {
        success: false as const,
        error: `Cannot delete: ${entriesCount} timetable entries reference this time slot. Remove them first.`,
      };
    }

    await prisma.periodTimeSlot.delete({
      where: { id: slotId, tenantId: session.tenantId },
    });

    revalidatePath('/admin/timetable');
    return { success: true as const };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to delete time slot.';
    return { success: false as const, error: msg };
  }
}

/**
 * Fetch the full timetable for a section: all entries with joins to subject, teacher, and period slot.
 */
export async function getTimetableAction(sectionId: string) {
  const session = await getSessionFromCookies();
  if (!session || !session.tenantId) {
    return { success: false as const, error: 'Unauthorized' };
  }

  try {
    const entries = await prisma.timetableEntry.findMany({
      where: { tenantId: session.tenantId, sectionId },
      include: {
        subject: { select: { id: true, name: true, code: true } },
        teacher: {
          select: {
            id: true,
            employeeId: true,
            user: { select: { firstName: true, lastName: true } },
          },
        },
        periodTimeSlot: {
          select: { id: true, name: true, startTime: true, endTime: true, order: true, isBreak: true },
        },
      },
      orderBy: { periodTimeSlot: { order: 'asc' } },
    });

    return { success: true as const, entries };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to load timetable.';
    return { success: false as const, error: msg };
  }
}

/**
 * Create or update a timetable entry with conflict detection.
 */
export async function saveTimetableEntryAction(rawInput: SaveTimetableEntryInput) {
  const session = await getSessionFromCookies();
  if (!session || !session.tenantId || (session.role !== 'ADMIN' && session.role !== 'SUPER_ADMIN')) {
    return { success: false as const, error: 'Unauthorized: Admin privileges required.' };
  }

  const validation = SaveTimetableEntrySchema.safeParse(rawInput);
  if (!validation.success) {
    return { success: false as const, error: validation.error.errors.map(e => e.message).join(', ') };
  }

  try {
    const data = validation.data;

    // Run conflict check via service
    const conflictResult = await validateTimetableSlotConflict(session.tenantId, {
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
        where: { id: data.entryId, tenantId: session.tenantId },
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
          periodTimeSlot: true,
        },
      });
    } else {
      // Create new with upsert (unique: sectionId + periodTimeSlotId + dayOfWeek)
      entry = await prisma.timetableEntry.upsert({
        where: {
          sectionId_periodTimeSlotId_dayOfWeek: {
            sectionId: data.sectionId,
            periodTimeSlotId: data.periodTimeSlotId,
            dayOfWeek: data.dayOfWeek as DayOfWeek,
          },
        },
        create: {
          tenantId: session.tenantId,
          sectionId: data.sectionId,
          periodTimeSlotId: data.periodTimeSlotId,
          dayOfWeek: data.dayOfWeek as DayOfWeek,
          subjectId: data.subjectId ?? null,
          teacherId: data.teacherId ?? null,
          roomNumber: data.roomNumber ?? null,
        },
        update: {
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
          periodTimeSlot: true,
        },
      });
    }

    revalidatePath('/admin/timetable');
    return { success: true as const, entry };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to save timetable entry.';
    return { success: false as const, error: msg };
  }
}

/**
 * Delete a timetable entry.
 */
export async function deleteTimetableEntryAction(entryId: string) {
  const session = await getSessionFromCookies();
  if (!session || !session.tenantId || (session.role !== 'ADMIN' && session.role !== 'SUPER_ADMIN')) {
    return { success: false as const, error: 'Unauthorized: Admin privileges required.' };
  }

  try {
    await prisma.timetableEntry.delete({
      where: { id: entryId, tenantId: session.tenantId },
    });

    revalidatePath('/admin/timetable');
    return { success: true as const };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to delete timetable entry.';
    return { success: false as const, error: msg };
  }
}

/**
 * Clone timetable from one section to another.
 * Copies all entries but clears teacherId (admin assigns manually).
 */
export async function cloneTimetableAction(rawInput: CloneTimetableInput) {
  const session = await getSessionFromCookies();
  if (!session || !session.tenantId || (session.role !== 'ADMIN' && session.role !== 'SUPER_ADMIN')) {
    return { success: false as const, error: 'Unauthorized: Admin privileges required.' };
  }

  const validation = CloneTimetableSchema.safeParse(rawInput);
  if (!validation.success) {
    return { success: false as const, error: validation.error.errors.map(e => e.message).join(', ') };
  }

  try {
    const { fromSectionId, toSectionId } = validation.data;

    // Fetch source entries
    const sourceEntries = await prisma.timetableEntry.findMany({
      where: { tenantId: session.tenantId, sectionId: fromSectionId },
    });

    if (sourceEntries.length === 0) {
      return { success: false as const, error: 'Source section has no timetable entries to clone.' };
    }

    // Delete existing entries in target section
    await prisma.timetableEntry.deleteMany({
      where: { tenantId: session.tenantId, sectionId: toSectionId },
    });

    // Create cloned entries without teacher assignments
    await prisma.timetableEntry.createMany({
      data: sourceEntries.map(entry => ({
        tenantId: session.tenantId!,
        sectionId: toSectionId,
        periodTimeSlotId: entry.periodTimeSlotId,
        dayOfWeek: entry.dayOfWeek,
        subjectId: entry.subjectId,
        teacherId: null, // Clear teacher — admin assigns manually
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
 * Get all timetable entries for a specific day for substitution management.
 * Returns entries grouped by teacher with availability info.
 */
export async function getSubstitutionDayViewAction(dateStr: string) {
  const session = await getSessionFromCookies();
  if (!session || !session.tenantId || (session.role !== 'ADMIN' && session.role !== 'SUPER_ADMIN')) {
    return { success: false as const, error: 'Unauthorized: Admin privileges required.' };
  }

  try {
    const dayMap: Record<number, DayOfWeek> = {
      0: 'SUNDAY' as DayOfWeek, 1: 'MONDAY' as DayOfWeek, 2: 'TUESDAY' as DayOfWeek,
      3: 'WEDNESDAY' as DayOfWeek, 4: 'THURSDAY' as DayOfWeek, 5: 'FRIDAY' as DayOfWeek,
      6: 'SATURDAY' as DayOfWeek,
    };

    const date = new Date(dateStr);
    const dayOfWeek = dayMap[date.getDay()];

    // Get all entries for the day with full joins
    const entries = await prisma.timetableEntry.findMany({
      where: {
        tenantId: session.tenantId,
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

    // Get existing substitutions for this date
    const dateStart = new Date(dateStr);
    dateStart.setHours(0, 0, 0, 0);
    const dateEnd = new Date(dateStr);
    dateEnd.setHours(23, 59, 59, 999);

    const substitutions = await prisma.teacherSubstitution.findMany({
      where: {
        tenantId: session.tenantId,
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

    // Get all teachers for absence marking
    const teachers = await prisma.teacherProfile.findMany({
      where: { tenantId: session.tenantId },
      select: {
        id: true,
        employeeId: true,
        department: true,
        specialization: true,
        user: { select: { firstName: true, lastName: true, id: true } },
      },
    });

    return { success: true as const, entries, substitutions, teachers, dayOfWeek };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to load substitution data.';
    return { success: false as const, error: msg };
  }
}

/**
 * Find available substitute teachers for a specific slot on a date.
 */
export async function getAvailableSubstitutesAction(dateStr: string, periodTimeSlotId: string) {
  const session = await getSessionFromCookies();
  if (!session || !session.tenantId || (session.role !== 'ADMIN' && session.role !== 'SUPER_ADMIN')) {
    return { success: false as const, error: 'Unauthorized: Admin privileges required.' };
  }

  try {
    const available = await findAvailableSubstitutes(session.tenantId, {
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
 * Get the school's configured working days.
 */
export async function getWorkingDaysAction() {
  const session = await getSessionFromCookies();
  if (!session || !session.tenantId) {
    return { success: false as const, error: 'Unauthorized' };
  }

  try {
    const tenant = await prisma.tenant.findUnique({
      where: { id: session.tenantId },
      select: { workingDays: true },
    });

    const defaultDays: DayOfWeek[] = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY'] as DayOfWeek[];
    return {
      success: true as const,
      workingDays: (tenant?.workingDays as DayOfWeek[]) ?? defaultDays,
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to load working days.';
    return { success: false as const, error: msg };
  }
}

/**
 * Update the school's working days configuration.
 */
export async function updateWorkingDaysAction(days: string[]) {
  const session = await getSessionFromCookies();
  if (!session || !session.tenantId || (session.role !== 'ADMIN' && session.role !== 'SUPER_ADMIN')) {
    return { success: false as const, error: 'Unauthorized: Admin privileges required.' };
  }

  const validDays = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];
  const filtered = days.filter(d => validDays.includes(d));
  if (filtered.length === 0) {
    return { success: false as const, error: 'At least one working day is required.' };
  }

  try {
    await prisma.tenant.update({
      where: { id: session.tenantId },
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
 * Fetch subjects mapped to a specific section (via ClassSubjectTeacher junction).
 */
export async function getSubjectsForSectionAction(sectionId: string) {
  const session = await getSessionFromCookies();
  if (!session || !session.tenantId) {
    return { success: false as const, error: 'Unauthorized' };
  }

  try {
    // Get subjects linked to this section via ClassSubjectTeacher
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

    // Extract unique subjects
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

    // If no ClassSubjectTeacher entries found, fall back to all tenant subjects
    if (subjectMap.size === 0) {
      const section = await prisma.section.findUnique({
        where: { id: sectionId },
        select: { classGradeId: true },
      });

      if (section) {
        const allSubjects = await prisma.subject.findMany({
          where: { tenantId: session.tenantId },
          select: { id: true, name: true, code: true },
        });
        for (const sub of allSubjects) {
          subjectMap.set(sub.id, sub);
        }
      }

      // Also get all teachers as fallback
      const allTeachers = await prisma.teacherProfile.findMany({
        where: { tenantId: session.tenantId },
        select: {
          id: true,
          employeeId: true,
          user: { select: { firstName: true, lastName: true } },
        },
      });

      const teacherList = allTeachers.map(t => ({
        id: t.id,
        name: `${t.user.firstName} ${t.user.lastName}`,
        employeeId: t.employeeId,
      }));

      // Assign all teachers to all subjects as fallback
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

