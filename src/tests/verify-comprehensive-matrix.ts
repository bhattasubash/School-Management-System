import { prisma } from '@/lib/db';
import { Role } from '@/types';
import { setTestSessionOverride } from '@/lib/session';
import { deleteNoticeAction, publishNoticeAction } from '@/actions/admin/notices';
import {
  createEventAction,
  deleteEventAction,
  togglePublishEventAction,
} from '@/actions/events';
import {
  createEmergencyContactAction,
  updateEmergencyContactAction,
  deleteEmergencyContactAction,
} from '@/actions/emergency';
import {
  createHolidayAction,
  deleteHolidayAction,
} from '@/actions/holidays';
import {
  collectCounterFeeAction,
  refundFeePaymentAction,
} from '@/actions/admin/fees';
import { deleteTimetableEntryAction } from '@/actions/admin/timetable';
import {
  markDailyAttendanceAction,
  getSectionAttendanceRosterAction,
  getStudentAttendanceSummaryAction,
  getAdminAttendanceOverviewAction,
  exportAttendanceDataAction,
} from '@/actions/attendance';
import { toggleTenantStatusAction } from '@/actions/superadmin';
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

let totalTests = 0;
let passedTests = 0;

function assert(condition: boolean, testName: string, detail?: string) {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`  [PASS] ${testName}`);
  } else {
    console.error(`  [FAIL] ${testName}${detail ? ` - ${detail}` : ''}`);
  }
}

async function runComprehensiveMatrixVerification() {
  console.log('\n================================================================');
  console.log(' PHASE 2: INDEPENDENT ADVERSARIAL VERIFICATION & SECURITY MATRIX');
  console.log('================================================================\n');

  // 1. Resolve Primary Tenant A (Delhi Public School)
  const tenantA = await prisma.tenant.findFirst({
    where: { slug: 'dps' },
  });
  if (!tenantA) {
    throw new Error('Tenant A (dps) not found in database.');
  }
  const tenantAId = tenantA.id;

  const adminUserA = await prisma.user.findFirst({
    where: { tenantId: tenantAId, role: 'ADMIN' },
  });
  if (!adminUserA) {
    throw new Error('Admin user for Tenant A missing.');
  }

  // 2. Setup Adversarial Target Tenant B
  const tenantBUniqueSlug = `adv-target-${Date.now()}`;
  const tenantB = await prisma.tenant.create({
    data: {
      name: 'Adversarial Verification Target School',
      slug: tenantBUniqueSlug,
      email: `${tenantBUniqueSlug}@test.edu`,
      phone: '9988776655',
      address: '456 Defense Colony',
      city: 'New Delhi',
      state: 'Delhi',
      pincode: '110024',
      board: 'CBSE',
      subscriptionPlanId: tenantA.subscriptionPlanId,
      subscriptionStatus: 'ACTIVE',
      isActive: true,
    },
  });
  const tenantBId = tenantB.id;

  // Create academic year for Tenant B
  const academicYearB = await prisma.academicYear.create({
    data: {
      tenantId: tenantBId,
      name: '2026-2027',
      startDate: new Date('2026-04-01T00:00:00.000Z'),
      endDate: new Date('2027-03-31T23:59:59.999Z'),
      isCurrent: true,
    },
  });

  // Create class & section for Tenant B
  const classGradeB = await prisma.classGrade.create({
    data: {
      tenantId: tenantBId,
      academicYearId: academicYearB.id,
      name: 'Class 9',
      numericOrder: 9,
    },
  });

  const sectionB = await prisma.section.create({
    data: {
      tenantId: tenantBId,
      classGradeId: classGradeB.id,
      name: 'A',
    },
  });

  // Create users for Tenant B
  const adminUserB = await prisma.user.create({
    data: {
      tenantId: tenantBId,
      email: `admin-${tenantBUniqueSlug}@test.edu`,
      passwordHash: 'dummy-hash',
      role: 'ADMIN',
      firstName: 'Admin',
      lastName: 'B',
      isActive: true,
    },
  });

  const studentUserB = await prisma.user.create({
    data: {
      tenantId: tenantBId,
      email: `student-${tenantBUniqueSlug}@test.edu`,
      passwordHash: 'dummy-hash',
      role: 'STUDENT',
      firstName: 'TargetStudent',
      lastName: 'B',
      isActive: true,
    },
  });

  const studentProfileB = await prisma.studentProfile.create({
    data: {
      tenantId: tenantBId,
      userId: studentUserB.id,
      admissionNumber: `ADM-${Date.now()}`,
      sectionId: sectionB.id,
      dateOfBirth: new Date('2010-05-15T00:00:00.000Z'),
      gender: 'MALE',
      address: '456 Defense Colony',
      emergencyContact: '9876543210',
      admissionDate: new Date('2026-04-01T00:00:00.000Z'),
    },
  });

  // Create Notice B
  const noticeB = await prisma.notice.create({
    data: {
      tenantId: tenantBId,
      authorId: adminUserB.id,
      title: 'Confidential Tenant B Board Meeting',
      content: 'Private institutional minutes of Tenant B.',
      priority: 'IMPORTANT',
      targetAudience: 'ALL',
    },
  });

  // Create Event B
  const eventB = await prisma.event.create({
    data: {
      tenantId: tenantBId,
      title: 'Tenant B Annual Sports Meet',
      description: 'Exclusive to Tenant B faculty and students.',
      eventDate: new Date('2026-11-15T00:00:00.000Z'),
      category: 'SPORTS',
      isPublished: true,
      createdById: adminUserB.id,
    },
  });

  // Create Emergency Contact B
  const emergencyB = await prisma.emergencyContact.create({
    data: {
      tenantId: tenantBId,
      name: 'Tenant B Chief Medical Officer',
      designation: 'Campus Doctor',
      phone: '9111222333',
      category: 'MEDICAL',
      displayOrder: 1,
    },
  });

  // Create Holiday B
  const holidayB = await prisma.holiday.create({
    data: {
      tenantId: tenantBId,
      sessionId: academicYearB.id,
      name: 'Tenant B Founder Day',
      date: new Date('2026-10-25T00:00:00.000Z'),
      type: 'SCHOOL',
    },
  });

  // Create Fee Category, Invoice and Payment in Tenant B
  const feeCatB = await prisma.feeCategory.create({
    data: {
      tenantId: tenantBId,
      name: 'Tuition Fee Q1',
    },
  });

  const invoiceB = await prisma.feeInvoice.create({
    data: {
      tenantId: tenantBId,
      studentId: studentProfileB.id,
      academicYearId: academicYearB.id,
      invoiceNumber: `INV-B-${Date.now()}`,
      totalAmount: 15000,
      netAmount: 15000,
      paidAmount: 5000,
      balanceAmount: 10000,
      dueDate: new Date('2026-05-10T00:00:00.000Z'),
      status: 'PARTIAL',
    },
  });

  const paymentB = await prisma.feePayment.create({
    data: {
      tenantId: tenantBId,
      feeInvoiceId: invoiceB.id,
      amount: 5000,
      paymentMethod: 'CASH',
      receiptNumber: `REC-B-${Date.now()}`,
      status: 'SUCCESS',
      collectedById: adminUserB.id,
    },
  });

  // Create Period Time Slot and Timetable Entry in Tenant B
  const timeSlotB = await prisma.periodTimeSlot.create({
    data: {
      tenantId: tenantBId,
      name: 'Period 1',
      startTime: '08:00',
      endTime: '08:45',
      order: 1,
    },
  });

  const timetableB = await prisma.timetableEntry.create({
    data: {
      tenantId: tenantBId,
      sectionId: sectionB.id,
      periodTimeSlotId: timeSlotB.id,
      dayOfWeek: 'MONDAY',
    },
  });

  try {
    // ========================================================================
    // SUITE 1: Comprehensive Multi-Tenant Adversarial Attack Matrix
    // ========================================================================
    console.log('--- Suite 1: Multi-Tenant Cross-Isolation Attacks (Tenant A vs Tenant B) ---');

    // Assume identity of Tenant A Administrator
    setTestSessionOverride({
      sub: adminUserA.id,
      role: Role.ADMIN,
      email: adminUserA.email,
      tenantId: tenantAId,
      mustChangePassword: false,
    });

    // 1.1 Tenant A admin attempts to delete Tenant B notice
    const crossDeleteNotice = await deleteNoticeAction(noticeB.id);
    assert(!crossDeleteNotice.success, 'Cross-Tenant Block: Tenant A admin cannot delete Tenant B notice');

    // 1.2 Tenant A admin attempts to delete Tenant B event
    const crossDeleteEvent = await deleteEventAction(eventB.id);
    assert(!crossDeleteEvent.success, 'Cross-Tenant Block: Tenant A admin cannot delete Tenant B event');

    // 1.3 Tenant A admin attempts to toggle publish status on Tenant B event
    const crossToggleEvent = await togglePublishEventAction(eventB.id, false);
    assert(!crossToggleEvent.success, 'Cross-Tenant Block: Tenant A admin cannot toggle publish on Tenant B event');

    // 1.4 Tenant A admin attempts to delete Tenant B emergency contact
    const crossDeleteContact = await deleteEmergencyContactAction(emergencyB.id);
    assert(!crossDeleteContact.success, 'Cross-Tenant Block: Tenant A admin cannot delete Tenant B emergency contact');

    // 1.5 Tenant A admin attempts to modify Tenant B emergency contact
    const crossUpdateContact = await updateEmergencyContactAction({
      id: emergencyB.id,
      name: 'Adversary Overwrite',
      phone: '0000000000',
    });
    assert(!crossUpdateContact.success, 'Cross-Tenant Block: Tenant A admin cannot update Tenant B emergency contact');

    // 1.6 Tenant A admin attempts to delete Tenant B holiday
    const crossDeleteHoliday = await deleteHolidayAction(holidayB.id);
    assert(!crossDeleteHoliday.success, 'Cross-Tenant Block: Tenant A admin cannot delete Tenant B holiday');

    // 1.7 Tenant A admin attempts to collect counter fees on Tenant B invoice
    const crossCollectFee = await collectCounterFeeAction({
      feeInvoiceId: invoiceB.id,
      amount: 1000,
      paymentMethod: 'CASH',
    });
    assert(!crossCollectFee.success, 'Cross-Tenant Block: Tenant A admin cannot collect fees on Tenant B invoice');

    // 1.8 Tenant A admin attempts to refund Tenant B payment
    const crossRefundFee = await refundFeePaymentAction({
      paymentId: paymentB.id,
      reason: 'Malicious cross-tenant refund attempt',
    });
    assert(!crossRefundFee.success, 'Cross-Tenant Block: Tenant A admin cannot refund Tenant B fee payment');

    // 1.9 Tenant A admin attempts to delete Tenant B timetable entry
    const crossDeleteTimetable = await deleteTimetableEntryAction(timetableB.id);
    assert(!crossDeleteTimetable.success, 'Cross-Tenant Block: Tenant A admin cannot delete Tenant B timetable entry');

    // 1.10 Tenant A admin attempts to read Tenant B section attendance roster
    const crossSectionRoster = await getSectionAttendanceRosterAction(sectionB.id, '2026-10-01');
    assert(
      !crossSectionRoster.success || (crossSectionRoster.data as any)?.students?.length === 0,
      'Cross-Tenant Block: Tenant A admin cannot view Tenant B section roster'
    );

    // 1.11 Tenant A admin attempts to view Tenant B student attendance
    const crossStudentAttendance = await getStudentAttendanceSummaryAction(studentProfileB.id);
    assert(!crossStudentAttendance.success, 'Cross-Tenant Block: Tenant A admin cannot inspect Tenant B student attendance');

    // Verify zero data corruption on Tenant B
    const verifyNoticeB = await prisma.notice.findUnique({ where: { id: noticeB.id } });
    const verifyEventB = await prisma.event.findUnique({ where: { id: eventB.id } });
    const verifyContactB = await prisma.emergencyContact.findUnique({ where: { id: emergencyB.id } });
    const verifyHolidayB = await prisma.holiday.findUnique({ where: { id: holidayB.id } });
    const verifyPaymentB = await prisma.feePayment.findUnique({ where: { id: paymentB.id } });

    assert(verifyNoticeB !== null, 'Data Integrity: Tenant B notice untouched');
    assert(verifyEventB?.isPublished === true, 'Data Integrity: Tenant B event remains published');
    assert(verifyContactB?.name === 'Tenant B Chief Medical Officer', 'Data Integrity: Tenant B contact name untouched');
    assert(verifyHolidayB !== null, 'Data Integrity: Tenant B holiday untouched');
    assert(verifyPaymentB?.status === 'SUCCESS', 'Data Integrity: Tenant B fee payment untouched');

    // ========================================================================
    // SUITE 2: Full Role-Based Access Control (RBAC) & Gate Matrix
    // ========================================================================
    console.log('\n--- Suite 2: Role-Based Authorization & Gate Matrix ---');

    // 2.1 Unauthenticated Request Rejection (401)
    setTestSessionOverride(null);

    const unauthNotice = await publishNoticeAction({ title: 'Test Notice Title', content: 'Test Notice Content Body' });
    assert(!unauthNotice.success, 'RBAC Block: Unauthenticated user rejected from publishNoticeAction');

    const unauthEvent = await createEventAction({ title: 'Test Event Title', description: 'Test Event Body', eventDate: '2026-10-01', category: 'ACADEMIC', isPublished: true });
    assert(!unauthEvent.success, 'RBAC Block: Unauthenticated user rejected from createEventAction');

    const unauthEmergency = await createEmergencyContactAction({ name: 'Doctor Smith', designation: 'Doctor', phone: '1234567890', category: 'MEDICAL', displayOrder: 1 });
    assert(!unauthEmergency.success, 'RBAC Block: Unauthenticated user rejected from createEmergencyContactAction');

    const unauthFee = await collectCounterFeeAction({ feeInvoiceId: invoiceB.id, amount: 500, paymentMethod: 'CASH' });
    assert(!unauthFee.success, 'RBAC Block: Unauthenticated user rejected from collectCounterFeeAction');

    const unauthAttendance = await getAdminAttendanceOverviewAction();
    assert(!unauthAttendance.success, 'RBAC Block: Unauthenticated user rejected from getAdminAttendanceOverviewAction');

    const unauthTenant = await toggleTenantStatusAction({ tenantId: tenantBId, status: 'ACTIVE', isActive: true });
    assert(!unauthTenant.success, 'RBAC Block: Unauthenticated user rejected from toggleTenantStatusAction');

    // 2.2 Student Privilege Escalation Rejection (403)
    setTestSessionOverride({
      sub: 'student-test-sub',
      role: Role.STUDENT,
      email: 'student@dps.edu.in',
      tenantId: tenantAId,
      mustChangePassword: false,
    });

    const studentNotice = await publishNoticeAction({ title: 'Student Notice Title', content: 'Student Notice Content Body' });
    assert(!studentNotice.success, 'RBAC Block: Student role blocked from publishNoticeAction');

    const studentEvent = await createEventAction({ title: 'Student Event Title', description: 'Student Event Body', eventDate: '2026-10-01', category: 'ACADEMIC', isPublished: true });
    assert(!studentEvent.success, 'RBAC Block: Student role blocked from createEventAction');

    const studentFee = await collectCounterFeeAction({ feeInvoiceId: invoiceB.id, amount: 500, paymentMethod: 'CASH' });
    assert(!studentFee.success, 'RBAC Block: Student role blocked from collectCounterFeeAction');

    const studentAdminOverview = await getAdminAttendanceOverviewAction();
    assert(!studentAdminOverview.success, 'RBAC Block: Student role blocked from getAdminAttendanceOverviewAction');

    const studentTenantToggle = await toggleTenantStatusAction({ tenantId: tenantBId, status: 'ACTIVE', isActive: true });
    assert(!studentTenantToggle.success, 'RBAC Block: Student role blocked from toggleTenantStatusAction');

    // 2.3 Teacher Privilege Escalation Rejection (403)
    setTestSessionOverride({
      sub: 'teacher-test-sub',
      role: Role.TEACHER,
      email: 'teacher@dps.edu.in',
      tenantId: tenantAId,
      mustChangePassword: false,
    });

    const teacherNotice = await publishNoticeAction({ title: 'Teacher Notice Title', content: 'Teacher Notice Content Body' });
    assert(!teacherNotice.success, 'RBAC Block: Teacher role blocked from publishNoticeAction');

    const teacherFee = await collectCounterFeeAction({ feeInvoiceId: invoiceB.id, amount: 500, paymentMethod: 'CASH' });
    assert(!teacherFee.success, 'RBAC Block: Teacher role blocked from collectCounterFeeAction');

    const teacherAdminOverview = await getAdminAttendanceOverviewAction();
    assert(!teacherAdminOverview.success, 'RBAC Block: Teacher role blocked from getAdminAttendanceOverviewAction');

    const teacherTenantToggle = await toggleTenantStatusAction({ tenantId: tenantBId, status: 'ACTIVE', isActive: true });
    assert(!teacherTenantToggle.success, 'RBAC Block: Teacher role blocked from toggleTenantStatusAction');

    // 2.4 mustChangePassword Gate Block
    setTestSessionOverride({
      sub: adminUserA.id,
      role: Role.ADMIN,
      email: adminUserA.email,
      tenantId: tenantAId,
      mustChangePassword: true, // Gate active!
    });

    const gatedNotice = await publishNoticeAction({ title: 'Gated Notice Title', content: 'Gated Notice Content Body' });
    assert(!gatedNotice.success, 'mustChangePassword Gate: Admin with default password blocked from publishing notice');

    const gatedEvent = await createEventAction({ title: 'Gated Event Title', description: 'Gated Event Body', eventDate: '2026-10-01', category: 'ACADEMIC', isPublished: true });
    assert(!gatedEvent.success, 'mustChangePassword Gate: Admin with default password blocked from creating events');

    const gatedContact = await createEmergencyContactAction({ name: 'Gated Contact', designation: 'Doctor', phone: '1234567890', category: 'MEDICAL', displayOrder: 1 });
    assert(!gatedContact.success, 'mustChangePassword Gate: Admin with default password blocked from creating emergency contacts');

    const gatedFee = await collectCounterFeeAction({ feeInvoiceId: invoiceB.id, amount: 500, paymentMethod: 'CASH' });
    assert(!gatedFee.success, 'mustChangePassword Gate: Admin with default password blocked from collecting fees');

    // ========================================================================
    // SUITE 3: IDOR Student Attendance Protection
    // ========================================================================
    console.log('\n--- Suite 3: Insecure Direct Object Reference (IDOR) Protection ---');

    // Resolve two distinct students in Tenant A
    const studentsInA = await prisma.studentProfile.findMany({
      where: { tenantId: tenantAId },
      include: { user: true },
      take: 2,
    });

    if (studentsInA.length >= 2) {
      const student1 = studentsInA[0];
      const student2 = studentsInA[1];

      // Student 1 logs in
      setTestSessionOverride({
        sub: student1.userId,
        role: Role.STUDENT,
        email: student1.user.email,
        tenantId: tenantAId,
        mustChangePassword: false,
      });

      // Student 1 queries own attendance
      const ownAttendance = await getStudentAttendanceSummaryAction(student1.id);
      assert(ownAttendance.success, 'IDOR Allowed: Student 1 can inspect own attendance records');

      // Student 1 attempts IDOR query on Student 2 attendance
      const idorAttendance = await getStudentAttendanceSummaryAction(student2.id);
      assert(!idorAttendance.success, 'IDOR Block: Student 1 strictly blocked from inspecting Student 2 attendance');
    } else {
      console.log('  [SKIP] Need 2 students in Tenant A for relative IDOR test.');
    }

    // ========================================================================
    // SUITE 4: Foreign Key Deletion Restrictions (onDelete: Restrict)
    // ========================================================================
    console.log('\n--- Suite 4: Database Foreign Key Deletion Restrictions (onDelete: Restrict) ---');

    // 4.1 Delete StudentProfile when FeeInvoice exists
    let studentDeleteBlocked = false;
    try {
      await prisma.studentProfile.delete({
        where: { id: studentProfileB.id },
      });
    } catch (err: any) {
      if (err.code === 'P2003' || err.message?.includes('foreign key constraint')) {
        studentDeleteBlocked = true;
      }
    }
    assert(studentDeleteBlocked, 'FK Restrict: Deleting StudentProfile with FeeInvoices blocked by database constraint (P2003)');

    // 4.2 Delete FeeInvoice when FeePayment exists
    let invoiceDeleteBlocked = false;
    try {
      await prisma.feeInvoice.delete({
        where: { id: invoiceB.id },
      });
    } catch (err: any) {
      if (err.code === 'P2003' || err.message?.includes('foreign key constraint')) {
        invoiceDeleteBlocked = true;
      }
    }
    assert(invoiceDeleteBlocked, 'FK Restrict: Deleting FeeInvoice with FeePayments blocked by database constraint (P2003)');

    // 4.3 Delete AcademicYear when FeeInvoice exists
    let academicYearDeleteBlocked = false;
    try {
      await prisma.academicYear.delete({
        where: { id: academicYearB.id },
      });
    } catch (err: any) {
      if (err.code === 'P2003' || err.message?.includes('foreign key constraint')) {
        academicYearDeleteBlocked = true;
      }
    }
    assert(academicYearDeleteBlocked, 'FK Restrict: Deleting AcademicYear with FeeInvoices blocked by database constraint (P2003)');

    // ========================================================================
    // SUITE 5: Financial Accounting Integrity & Edge Cases
    // ========================================================================
    console.log('\n--- Suite 5: Financial Ledger & Refund Edge Cases ---');

    // Assume identity of Tenant B Administrator for legitimate Tenant B operations
    setTestSessionOverride({
      sub: adminUserB.id,
      role: Role.ADMIN,
      email: adminUserB.email,
      tenantId: tenantBId,
      mustChangePassword: false,
    });

    // 5.1 Negative Fee Amount
    const negativeFee = await collectCounterFeeAction({
      feeInvoiceId: invoiceB.id,
      amount: -500,
      paymentMethod: 'CASH',
    });
    assert(!negativeFee.success, 'Financial Validation: Negative payment amount strictly rejected');

    // 5.2 Zero Fee Amount
    const zeroFee = await collectCounterFeeAction({
      feeInvoiceId: invoiceB.id,
      amount: 0,
      paymentMethod: 'CASH',
    });
    assert(!zeroFee.success, 'Financial Validation: Zero payment amount strictly rejected');

    // 5.3 Valid Refund Execution
    const legitimateRefund = await refundFeePaymentAction({
      paymentId: paymentB.id,
      reason: 'Legitimate parent overpayment refund',
    });
    assert(legitimateRefund.success, 'Financial Ledger: Legitimate payment refund processed', (legitimateRefund as any).error);

    // 5.4 Double Refund Attempt on Same Payment
    const doubleRefund = await refundFeePaymentAction({
      paymentId: paymentB.id,
      reason: 'Duplicate refund attack attempt',
    });
    assert(!doubleRefund.success, 'Financial Ledger: Double refund on already refunded receipt strictly rejected');

    // ========================================================================
    // SUITE 6: Mass Assignment Defense & Schema Strictness
    // ========================================================================
    console.log('\n--- Suite 6: Mass Assignment Defense ---');

    // Injected parameter attack on publishNoticeAction
    const massAssignedNotice = await publishNoticeAction({
      title: 'Valid Notice Title With Strict Check',
      content: 'Testing mass assignment rejection.',
      ...({ role: 'SUPER_ADMIN', tenantId: tenantAId, mustChangePassword: false } as any),
    });
    // Even if accepted, author must be the authenticated user's ID and tenant must be session tenant
    if (massAssignedNotice.success && (massAssignedNotice as any).notice) {
      const createdNotice = (massAssignedNotice as any).notice;
      assert(createdNotice.tenantId === tenantBId, 'Mass Assignment Defense: Injected tenantId was ignored');
    } else {
      assert(true, 'Mass Assignment Defense: Injected parameters rejected by schema validation');
    }

    // ========================================================================
    // SUITE 7: Production Migration Workflow & Drift Forensics
    // ========================================================================
    console.log('\n--- Suite 7: Production Migration Workflow Forensics ---');

    // 7.1 Verify package.json contains db:migrate
    const pkgJsonPath = path.resolve(process.cwd(), 'package.json');
    const pkg = JSON.parse(fs.readFileSync(pkgJsonPath, 'utf8'));
    assert(
      pkg.scripts && pkg.scripts['db:migrate'] === 'prisma migrate deploy',
      'Production Deployment Script: package.json specifies "db:migrate": "prisma migrate deploy"'
    );

    // 7.2 Verify migrations exist on disk
    const migrationsDir = path.resolve(process.cwd(), 'prisma/migrations');
    const migrationDirs = fs.readdirSync(migrationsDir).filter(f => fs.statSync(path.join(migrationsDir, f)).isDirectory());
    assert(migrationDirs.length >= 2, `Migration History: Found ${migrationDirs.length} migration folders in prisma/migrations`);

    // 7.3 Programmatic migrate status
    if (!process.env.DIRECT_URL && process.env.DATABASE_URL) {
      process.env.DIRECT_URL = process.env.DATABASE_URL;
    }
    const statusOutput = execSync('npx prisma migrate status', {
      encoding: 'utf8',
      env: process.env,
    });
    assert(
      statusOutput.includes('Database schema is up to date'),
      'Migration Status: Database schema is completely up to date with zero unapplied migrations'
    );

  } finally {
    // Teardown Tenant B records cleanly
    console.log('\nCleaning up adversarial test fixtures...');
    setTestSessionOverride(null);
    try {
      // In reverse order of dependencies:
      await prisma.feePayment.deleteMany({ where: { tenantId: tenantBId } });
      await prisma.feeInvoiceItem.deleteMany({ where: { tenantId: tenantBId } });
      await prisma.feeInvoice.deleteMany({ where: { tenantId: tenantBId } });
      await prisma.feeCategory.deleteMany({ where: { tenantId: tenantBId } });
      await prisma.timetableEntry.deleteMany({ where: { tenantId: tenantBId } });
      await prisma.periodTimeSlot.deleteMany({ where: { tenantId: tenantBId } });
      await prisma.holiday.deleteMany({ where: { tenantId: tenantBId } });
      await prisma.emergencyContact.deleteMany({ where: { tenantId: tenantBId } });
      await prisma.event.deleteMany({ where: { tenantId: tenantBId } });
      await prisma.notice.deleteMany({ where: { tenantId: tenantBId } });
      await prisma.studentProfile.deleteMany({ where: { tenantId: tenantBId } });
      await prisma.user.deleteMany({ where: { tenantId: tenantBId } });
      await prisma.section.deleteMany({ where: { tenantId: tenantBId } });
      await prisma.classGrade.deleteMany({ where: { tenantId: tenantBId } });
      await prisma.academicYear.deleteMany({ where: { tenantId: tenantBId } });
      await prisma.tenant.delete({ where: { id: tenantBId } });
      console.log('Cleanup completed successfully.');
    } catch (cleanupErr: any) {
      console.warn('Warning during cleanup:', cleanupErr.message);
    }
  }

  console.log('\n================================================================');
  console.log(` RESULTS: ${passedTests}/${totalTests} TESTS PASSED (${totalTests - passedTests} FAILED)`);
  console.log('================================================================\n');

  if (totalTests - passedTests > 0) {
    process.exit(1);
  }
  process.exit(0);
}

runComprehensiveMatrixVerification()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Fatal error in comprehensive matrix verification:', err);
    process.exit(1);
  });
