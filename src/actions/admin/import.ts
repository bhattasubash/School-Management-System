'use server';

import { safeRevalidatePath as revalidatePath } from '@/lib/revalidate';
import {
  createExcelWorkbookBuffer,
  parseSpreadsheetRows,
} from '@/lib/excel';
import { prisma } from '@/lib/db';
import { requireAuthGuard } from '@/lib/auth-guard';
import { Role } from '@/types';
import { AuthService } from '@/services/auth.service';

export async function parseSpreadsheetUploadAction(
  base64Data: string,
  fileName: string
): Promise<{
  success: boolean;
  rows?: Record<string, string>[];
  totalRows?: number;
  error?: string;
}> {
  const guard = await requireAuthGuard([Role.ADMIN, Role.SUPER_ADMIN]);
  if (!guard.success) {
    return { success: false, error: guard.error };
  }

  try {
    const buffer = Buffer.from(base64Data, 'base64');
    const { rows, totalRows } = await parseSpreadsheetRows(buffer, fileName);
    return { success: true, rows, totalRows };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to parse spreadsheet.';
    return { success: false, error: msg };
  }
}

export async function generateStudentTemplateAction(): Promise<{
  success: boolean;
  base64?: string;
  fileName?: string;
  error?: string;
}> {
  try {
    const columns = [
      { header: 'Admission Number', key: 'admissionNumber', width: 20 },
      { header: 'First Name', key: 'firstName', width: 18 },
      { header: 'Last Name', key: 'lastName', width: 18 },
      { header: 'Email', key: 'email', width: 28 },
      { header: 'Phone', key: 'phone', width: 18 },
      { header: 'Date of Birth (YYYY-MM-DD)', key: 'dateOfBirth', width: 26 },
      { header: 'Gender (Male/Female/Other)', key: 'gender', width: 26 },
      { header: 'Blood Group', key: 'bloodGroup', width: 15 },
      { header: 'Address', key: 'address', width: 32 },
      { header: 'Emergency Contact', key: 'emergencyContact', width: 22 },
      { header: 'Class', key: 'class', width: 15 },
      { header: 'Section', key: 'section', width: 12 },
      { header: 'Father Name', key: 'fatherName', width: 20 },
      { header: 'Father Phone', key: 'fatherPhone', width: 18 },
      { header: 'Mother Name', key: 'motherName', width: 20 },
      { header: 'Mother Phone', key: 'motherPhone', width: 18 },
    ];

    const sampleRows = [
      {
        admissionNumber: 'ADM-2026-001',
        firstName: 'Rahul',
        lastName: 'Verma',
        email: 'rahul.verma@example.com',
        phone: '9876543210',
        dateOfBirth: '2010-05-15',
        gender: 'Male',
        bloodGroup: 'B+',
        address: '123 Civil Lines, New Delhi',
        emergencyContact: '9876543210',
        class: 'Class 10',
        section: 'A',
        fatherName: 'Suresh Verma',
        fatherPhone: '9876543210',
        motherName: 'Anita Verma',
        motherPhone: '9876543211',
      },
    ];

    const buffer = await createExcelWorkbookBuffer('Students_Template', columns, sampleRows);
    return {
      success: true,
      base64: buffer.toString('base64'),
      fileName: 'student_import_template.xlsx',
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to generate template.';
    return { success: false, error: msg };
  }
}

export async function generateTeacherTemplateAction(): Promise<{
  success: boolean;
  base64?: string;
  fileName?: string;
  error?: string;
}> {
  try {
    const columns = [
      { header: 'Employee ID', key: 'employeeId', width: 18 },
      { header: 'First Name', key: 'firstName', width: 18 },
      { header: 'Last Name', key: 'lastName', width: 18 },
      { header: 'Email', key: 'email', width: 28 },
      { header: 'Phone', key: 'phone', width: 18 },
      { header: 'Department', key: 'department', width: 24 },
      { header: 'Qualification', key: 'qualification', width: 22 },
      { header: 'Specialization', key: 'specialization', width: 24 },
      { header: 'Joining Date (YYYY-MM-DD)', key: 'joiningDate', width: 26 },
    ];

    const sampleRows = [
      {
        employeeId: 'EMP-101',
        firstName: 'Sita',
        lastName: 'Raman',
        email: 'sita.raman@example.com',
        phone: '9876543220',
        department: 'Mathematics',
        qualification: 'M.Sc. B.Ed.',
        specialization: 'Calculus',
        joiningDate: '2022-06-01',
      },
    ];

    const buffer = await createExcelWorkbookBuffer('Teachers_Template', columns, sampleRows);
    return {
      success: true,
      base64: buffer.toString('base64'),
      fileName: 'teacher_import_template.xlsx',
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to generate template.';
    return { success: false, error: msg };
  }
}

/**
 * P1-3 & P2-1 REMEDIATION:
 * 1. Preloads tenant records to eliminate N+1 database queries.
 * 2. Generates unique, secure temporary passwords per user instead of predictable universal passwords.
 */
export async function importStudentsBatchAction(rows: Array<Record<string, unknown>>) {
  const guard = await requireAuthGuard([Role.ADMIN, Role.SUPER_ADMIN]);
  if (!guard.success) {
    return { success: false, error: guard.error };
  }

  const { context } = guard;
  const tenantId = context.tenantId;

  const results = {
    total: rows.length,
    imported: 0,
    skipped: 0,
    errors: [] as Array<{ row: number; identifier: string; reason: string }>,
    credentials: [] as Array<{ admissionNumber: string; studentEmail: string; temporaryPassword?: string }>,
  };

  // 1. Preload sections, academic year, existing admissions, and existing emails (Eliminates N+1 queries)
  const [sections, academicYear, existingStudentProfiles, existingUsers, existingParents] = await Promise.all([
    prisma.section.findMany({
      where: { tenantId },
      include: { classGrade: true },
    }),
    prisma.academicYear.findFirst({
      where: { tenantId, isCurrent: true },
    }),
    prisma.studentProfile.findMany({
      where: { tenantId },
      select: { admissionNumber: true },
    }),
    prisma.user.findMany({
      where: { tenantId },
      select: { id: true, email: true },
    }),
    prisma.parentProfile.findMany({
      where: { tenantId },
      include: { user: { select: { id: true, phone: true } } },
    }),
  ]);

  if (!academicYear) {
    return { success: false, error: 'Active academic year not found. Please configure an academic session first.' };
  }

  // In-memory sets for O(1) duplicate lookups
  const existingAdmissionsSet = new Set(existingStudentProfiles.map((s) => s.admissionNumber.toLowerCase()));
  const existingEmailsMap = new Map(existingUsers.map((u) => [u.email.toLowerCase(), u.id]));
  const existingParentsByPhone = new Map(
    existingParents.filter((p) => p.user?.phone).map((p) => [p.user.phone!, p])
  );

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

    // In-memory check (0 DB queries)
    if (existingAdmissionsSet.has(admissionNumber.toLowerCase())) {
      results.skipped++;
      results.errors.push({
        row: rowNum,
        identifier: admissionNumber,
        reason: 'Admission number already exists in this school.',
      });
      continue;
    }

    // Find section in-memory (0 DB queries)
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

    // Generate unique, cryptographically random temporary password (P1-3)
    const tempPassword = AuthService.generateSecureTemporaryPassword();
    const passwordHash = await AuthService.hashPassword(tempPassword);

    try {
      await prisma.$transaction(async (tx) => {
        // Create or find student User
        let userId = existingEmailsMap.get(email);

        if (!userId) {
          const user = await tx.user.create({
            data: {
              tenantId,
              email,
              phone,
              firstName,
              lastName,
              role: 'STUDENT',
              passwordHash,
              mustChangePassword: true,
            },
          });
          userId = user.id;
          existingEmailsMap.set(email, userId);
        }

        // Create student profile
        const studentProfile = await tx.studentProfile.create({
          data: {
            tenantId,
            userId,
            admissionNumber,
            sectionId: targetSection.id,
            dateOfBirth: dob,
            gender,
            bloodGroup: (row['Blood Group'] || row.bloodGroup || null) as string | null,
            address,
            emergencyContact,
            admissionDate: new Date(),
          },
        });

        existingAdmissionsSet.add(admissionNumber.toLowerCase());

        // Parent linking if parent info is provided
        const fatherName = String(row['Father Name'] || row.fatherName || '').trim();
        const fatherPhone = String(row['Father Phone'] || row.fatherPhone || '').trim();

        if (fatherName && fatherPhone) {
          let parentProfile = existingParentsByPhone.get(fatherPhone);

          if (!parentProfile) {
            const parentEmail = `parent.${admissionNumber.toLowerCase()}@school.edu.in`;
            const parentTempPassword = AuthService.generateSecureTemporaryPassword();
            const parentPasswordHash = await AuthService.hashPassword(parentTempPassword);

            const parentUser = await tx.user.create({
              data: {
                tenantId,
                email: parentEmail,
                phone: fatherPhone,
                firstName: fatherName.split(' ')[0] || fatherName,
                lastName: fatherName.split(' ').slice(1).join(' ') || 'Parent',
                role: 'PARENT',
                passwordHash: parentPasswordHash,
                mustChangePassword: true,
              },
            });

            parentProfile = await tx.parentProfile.create({
              data: {
                tenantId,
                userId: parentUser.id,
                relationship: 'FATHER',
              },
              include: { user: { select: { id: true, phone: true } } },
            });

            existingParentsByPhone.set(fatherPhone, parentProfile);
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
      results.credentials.push({
        admissionNumber,
        studentEmail: email,
        temporaryPassword: tempPassword,
      });
    } catch (err: unknown) {
      results.skipped++;
      const msg = err instanceof Error ? err.message : 'Database error occurred while saving student.';
      results.errors.push({
        row: rowNum,
        identifier: admissionNumber,
        reason: msg,
      });
    }
  }

  revalidatePath('/admin/students');
  return { success: true, results };
}

/**
 * P1-3 & P2-1 REMEDIATION for Teachers batch import:
 * Eliminates N+1 queries and issues individual secure temporary passwords.
 */
export async function importTeachersBatchAction(rows: Array<Record<string, unknown>>) {
  const guard = await requireAuthGuard([Role.ADMIN, Role.SUPER_ADMIN]);
  if (!guard.success) {
    return { success: false, error: guard.error };
  }

  const { context } = guard;
  const tenantId = context.tenantId;

  const results = {
    total: rows.length,
    imported: 0,
    skipped: 0,
    errors: [] as Array<{ row: number; identifier: string; reason: string }>,
    credentials: [] as Array<{ employeeId: string; email: string; temporaryPassword?: string }>,
  };

  // Pre-load existing teachers & users to eliminate N+1 lookups
  const [existingTeachers, existingUsers] = await Promise.all([
    prisma.teacherProfile.findMany({
      where: { tenantId },
      select: { employeeId: true },
    }),
    prisma.user.findMany({
      where: { tenantId },
      select: { id: true, email: true },
    }),
  ]);

  const existingEmployeesSet = new Set(existingTeachers.map((t) => t.employeeId.toLowerCase()));
  const existingEmailsMap = new Map(existingUsers.map((u) => [u.email.toLowerCase(), u.id]));

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

    if (existingEmployeesSet.has(employeeId.toLowerCase())) {
      results.skipped++;
      results.errors.push({
        row: rowNum,
        identifier: employeeId,
        reason: 'Employee ID already exists.',
      });
      continue;
    }

    const joiningDate = joiningDateStr && !isNaN(Date.parse(joiningDateStr)) ? new Date(joiningDateStr) : new Date();

    const tempPassword = AuthService.generateSecureTemporaryPassword();
    const passwordHash = await AuthService.hashPassword(tempPassword);

    try {
      await prisma.$transaction(async (tx) => {
        let userId = existingEmailsMap.get(email);

        if (!userId) {
          const user = await tx.user.create({
            data: {
              tenantId,
              email,
              phone,
              firstName,
              lastName,
              role: 'TEACHER',
              passwordHash,
              mustChangePassword: true,
            },
          });
          userId = user.id;
          existingEmailsMap.set(email, userId);
        }

        await tx.teacherProfile.create({
          data: {
            tenantId,
            userId,
            employeeId,
            department,
            qualification,
            specialization,
            joiningDate,
          },
        });

        existingEmployeesSet.add(employeeId.toLowerCase());
      });

      results.imported++;
      results.credentials.push({
        employeeId,
        email,
        temporaryPassword: tempPassword,
      });
    } catch (err: unknown) {
      results.skipped++;
      const msg = err instanceof Error ? err.message : 'Database error occurred.';
      results.errors.push({
        row: rowNum,
        identifier: employeeId,
        reason: msg,
      });
    }
  }

  revalidatePath('/admin/teachers');
  return { success: true, results };
}
