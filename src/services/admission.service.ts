import { prisma } from '@/lib/db';
import bcrypt from 'bcryptjs';
import {
  CreateAdmissionApplicationSchema,
  CreateAdmissionApplicationInput,
  UpdateAdmissionStatusSchema,
  UpdateAdmissionStatusInput,
  EnrollStudentFromApplicationSchema,
  EnrollStudentFromApplicationInput,
} from '@/lib/validations/admission';
import { AdmissionApplication, StudentProfile, User, ParentProfile, FeeInvoice } from '@prisma/client';

export interface AdmissionApplicationSummary {
  id: string;
  applicationNumber: string;
  studentName: string;
  classGradeName: string;
  parentName: string;
  parentPhone: string;
  status: string;
  isFeePaid: boolean;
  createdAt: Date;
}

export interface EnrollmentResult {
  applicationId: string;
  student: StudentProfile & { user: User };
  parent: ParentProfile & { user: User };
  initialInvoice: FeeInvoice | null;
}

/**
 * Ingests an online admission application from the school's white-label portal.
 * Scoped strictly to the resolved tenant.
 */
export async function submitAdmissionApplication(
  tenantId: string,
  rawInput: CreateAdmissionApplicationInput
): Promise<AdmissionApplication> {
  const input = CreateAdmissionApplicationSchema.parse(rawInput);

  // Generate unique tenant-scoped application number: e.g. ADM-2026-0001
  const currentYear = new Date().getFullYear();
  const count = await prisma.admissionApplication.count({
    where: {
      tenantId,
      createdAt: {
        gte: new Date(`${currentYear}-01-01`),
      },
    },
  });

  const sequentialNumber = String(count + 1).padStart(4, '0');
  const applicationNumber = `ADM-${currentYear}-${sequentialNumber}`;

  return prisma.admissionApplication.create({
    data: {
      tenantId,
      academicYearId: input.academicYearId,
      classGradeId: input.classGradeId,
      applicationNumber,
      studentFirstName: input.studentFirstName,
      studentLastName: input.studentLastName,
      dateOfBirth: new Date(input.dateOfBirth),
      gender: input.gender,
      bloodGroup: input.bloodGroup || null,
      aadhaarNumber: input.aadhaarNumber || null,
      parentName: input.parentName,
      parentPhone: input.parentPhone,
      parentEmail: input.parentEmail || null,
      relationship: input.relationship,
      address: input.address,
      previousSchool: input.previousSchool || null,
      previousMarks: input.previousMarks ? input.previousMarks : null,
      applicationFee: input.applicationFee,
      isFeePaid: false,
      status: 'SUBMITTED',
    },
  });
}

/**
 * Updates an admission application's state (e.g. DOCUMENT_VERIFIED, INTERVIEW_SCHEDULED, APPROVED, REJECTED).
 */
export async function updateAdmissionStatus(
  tenantId: string,
  applicationId: string,
  rawInput: UpdateAdmissionStatusInput
): Promise<AdmissionApplication> {
  const input = UpdateAdmissionStatusSchema.parse(rawInput);

  const application = await prisma.admissionApplication.findFirst({
    where: { id: applicationId, tenantId },
  });

  if (!application) {
    throw new Error(`Admission application with ID ${applicationId} not found for this school.`);
  }

  if (application.status === 'ENROLLED') {
    throw new Error('Cannot update status: applicant is already enrolled.');
  }

  return prisma.admissionApplication.update({
    where: { id: applicationId },
    data: {
      status: input.status,
      interviewDate: input.interviewDate ? new Date(input.interviewDate) : undefined,
      adminRemarks: input.adminRemarks !== undefined ? input.adminRemarks : undefined,
    },
  });
}

/**
 * 1-Click Atomic Enrollment: Converts an approved admission application into:
 * 1. Active Student User + StudentProfile
 * 2. Active Parent User + ParentProfile + ParentStudentLink
 * 3. Initial Fee Invoice (if fee structure is provided)
 * 4. Application status transitioned to ENROLLED
 *
 * Guaranteed ACID transaction: All or nothing. Zero partial state corruption.
 */
export async function enrollStudentFromApplication(
  tenantId: string,
  applicationId: string,
  rawInput: EnrollStudentFromApplicationInput
): Promise<EnrollmentResult> {
  const input = EnrollStudentFromApplicationSchema.parse(rawInput);

  return prisma.$transaction(async (tx) => {
    // 1. Verify Application exists, belongs to tenant, and is APPROVED
    const application = await tx.admissionApplication.findFirst({
      where: { id: applicationId, tenantId },
      include: {
        classGrade: true,
        academicYear: true,
      },
    });

    if (!application) {
      throw new Error(`Application ${applicationId} not found under tenant ${tenantId}.`);
    }

    if (application.status !== 'APPROVED') {
      throw new Error(`Application must be APPROVED before enrollment. Current status: ${application.status}`);
    }

    // 2. Check for duplicate admission number
    const existingAdmission = await tx.studentProfile.findFirst({
      where: { tenantId, admissionNumber: input.admissionNumber },
    });

    if (existingAdmission) {
      throw new Error(`Admission number '${input.admissionNumber}' is already assigned in this school.`);
    }

    // 3. Verify section belongs to application's class grade
    const section = await tx.section.findFirst({
      where: {
        id: input.sectionId,
        tenantId,
        classGradeId: application.classGradeId,
      },
    });

    if (!section) {
      throw new Error(`Section does not belong to Class ${application.classGrade.name}.`);
    }

    // 4. Create Student User & Profile
    const defaultStudentEmail = `std.${input.admissionNumber.toLowerCase()}@school.internal`;
    const defaultPasswordHash = await bcrypt.hash(`Welcome@${input.admissionNumber}`, 10);

    const studentUser = await tx.user.create({
      data: {
        tenantId,
        email: defaultStudentEmail,
        passwordHash: defaultPasswordHash,
        firstName: application.studentFirstName,
        lastName: application.studentLastName,
        role: 'STUDENT',
        isActive: true,
      },
    });

    const studentProfile = await tx.studentProfile.create({
      data: {
        tenantId,
        userId: studentUser.id,
        admissionNumber: input.admissionNumber,
        rollNumber: input.rollNumber ?? null,
        sectionId: input.sectionId,
        dateOfBirth: application.dateOfBirth,
        gender: application.gender,
        bloodGroup: application.bloodGroup,
        address: application.address,
        emergencyContact: application.parentPhone,
        admissionDate: new Date(),
        previousSchool: application.previousSchool,
      },
      include: { user: true },
    });

    // 5. Create or Find Parent User & Profile
    const parentEmail = application.parentEmail || `parent.${application.parentPhone}@school.internal`;
    let parentUser = await tx.user.findFirst({
      where: { tenantId, email: parentEmail },
    });

    if (!parentUser) {
      const parentPasswordHash = await bcrypt.hash(`Parent@${application.parentPhone.slice(-4)}`, 10);
      parentUser = await tx.user.create({
        data: {
          tenantId,
          email: parentEmail,
          phone: application.parentPhone,
          passwordHash: parentPasswordHash,
          firstName: application.parentName,
          lastName: '',
          role: 'PARENT',
          isActive: true,
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
          relationship: application.relationship,
        },
      });
    }

    // Link Parent to Student
    await tx.parentStudentLink.create({
      data: {
        tenantId,
        parentId: parentProfile.id,
        studentId: studentProfile.id,
        isPrimary: true,
      },
    });

    // 6. Generate Initial Admission Fee Invoice (if fee structure is configured)
    let initialInvoice: FeeInvoice | null = null;
    if (input.feeStructureId) {
      const feeStructure = await tx.feeStructure.findFirst({
        where: { id: input.feeStructureId, tenantId },
        include: { feeCategory: true },
      });

      if (feeStructure) {
        const invoiceYear = new Date().getFullYear();
        const invoiceCount = await tx.feeInvoice.count({ where: { tenantId } });
        const invoiceNumber = `INV-${invoiceYear}-${String(invoiceCount + 1).padStart(5, '0')}`;
        const dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + 15); // 15 days to pay

        initialInvoice = await tx.feeInvoice.create({
          data: {
            tenantId,
            studentId: studentProfile.id,
            academicYearId: application.academicYearId,
            invoiceNumber,
            totalAmount: feeStructure.amount,
            discountAmount: 0,
            lateFee: 0,
            netAmount: feeStructure.amount,
            paidAmount: 0,
            balanceAmount: feeStructure.amount,
            dueDate,
            status: 'PENDING',
            feeTermId: input.feeTermId ?? null,
            items: {
              create: [
                {
                  tenantId,
                  feeCategoryId: feeStructure.feeCategoryId,
                  amount: feeStructure.amount,
                  description: `Admission Term Fee - ${feeStructure.feeCategory.name}`,
                },
              ],
            },
          },
        });
      }
    }

    // 7. Update Application status to ENROLLED and store reference to student
    await tx.admissionApplication.update({
      where: { id: applicationId },
      data: {
        status: 'ENROLLED',
        enrolledStudentId: studentProfile.id,
      },
    });

    return {
      applicationId,
      student: studentProfile,
      parent: { ...parentProfile, user: parentUser },
      initialInvoice,
    };
  });
}
