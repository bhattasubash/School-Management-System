'use server';

import { safeRevalidatePath as revalidatePath } from '@/lib/revalidate';
import * as XLSX from 'xlsx';
import { prisma } from '@/lib/db';
import { requireAuthGuard } from '@/lib/auth-guard';
import { Role } from '@/types';
import { AuthService } from '@/services/auth.service';

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
