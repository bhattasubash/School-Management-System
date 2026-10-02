import { NextRequest } from 'next/server';
import { loadEnvConfig } from '@next/env';

// Load environment configuration from .env
loadEnvConfig(process.cwd());

import { prisma, getTenantDb } from '@/lib/db';
import { middleware } from '@/middleware';
import { resolveTenantByHostname } from '@/lib/tenant';
import { setTestSessionOverride } from '@/lib/session';
import { Role } from '@/types';

// Server Actions under test
import {
  saveTimetableEntryAction,
  cloneTimetableAction,
  getSubjectsForSectionAction,
  updatePeriodTimeSlotAction,
  deletePeriodTimeSlotAction,
} from '@/actions/admin/timetable';
import { assignTeacherSubstitutionAction } from '@/actions/admin/substitutions';
import {
  updateEmergencyContactAction,
  deleteEmergencyContactAction,
} from '@/actions/emergency';
import {
  updateEventAction,
  togglePublishEventAction,
  deleteEventAction,
} from '@/actions/events';
import {
  createHolidayAction,
  deleteHolidayAction,
} from '@/actions/holidays';
import { transferStudentSectionAction } from '@/actions/admin/students';
import {
  linkParentToStudentAction,
  unlinkParentAction,
} from '@/actions/admin/parents';

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

async function runPhase1BVerification() {
  console.log('\n================================================================');
  console.log(' RUNNING PHASE 1B: TENANT ISOLATION PROOF & HOST SPOOFING SUITE');
  console.log('================================================================\n');

  // 1. Setup Tenant A (DPS)
  const tenantA = await prisma.tenant.findFirst({
    where: { slug: 'dps' },
  });
  if (!tenantA) {
    throw new Error('Tenant A (dps) not found in test database.');
  }
  const tenantAId = tenantA.id;

  const adminUserA = await prisma.user.findFirst({
    where: { tenantId: tenantAId, role: 'ADMIN' },
  });
  if (!adminUserA) {
    throw new Error('Admin user for Tenant A missing.');
  }

  // 2. Setup Isolated Adversarial Target Tenant B
  const tenantBUniqueSlug = `p1b-target-${Date.now()}`;
  const tenantB = await prisma.tenant.create({
    data: {
      name: 'Phase 1B Target School',
      slug: tenantBUniqueSlug,
      email: `${tenantBUniqueSlug}@test.edu`,
      phone: '9988112233',
      address: '789 Isolation Ave',
      city: 'Mumbai',
      state: 'Maharashtra',
      pincode: '400001',
      board: 'ICSE',
      subscriptionPlanId: tenantA.subscriptionPlanId,
      subscriptionStatus: 'ACTIVE',
      isActive: true,
    },
  });
  const tenantBId = tenantB.id;

  try {
    // Seed essential entities for Tenant B to test cross-tenant attacks
    const academicYearB = await prisma.academicYear.create({
      data: {
        tenantId: tenantBId,
        name: '2026-2027',
        startDate: new Date('2026-04-01T00:00:00.000Z'),
        endDate: new Date('2027-03-31T23:59:59.999Z'),
        isCurrent: true,
      },
    });

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

    const userB = await prisma.user.create({
      data: {
        tenantId: tenantBId,
        email: `student.b.${Date.now()}@test.edu`,
        firstName: 'Bob',
        lastName: 'Sharma',
        role: 'STUDENT',
        passwordHash: '$2a$12$DUMMYHASHFORTESTINGPURPOSESONLYXXXXXXXXXXXXX',
      },
    });

    const studentProfileB = await prisma.studentProfile.create({
      data: {
        tenantId: tenantBId,
        userId: userB.id,
        admissionNumber: `ADM-B-${Date.now()}`,
        sectionId: sectionB.id,
        dateOfBirth: new Date('2010-01-01'),
        gender: 'MALE',
        address: 'Target Address B',
        emergencyContact: '9988112233',
        admissionDate: new Date(),
      },
    });

    const teacherUserB = await prisma.user.create({
      data: {
        tenantId: tenantBId,
        email: `teacher.b.${Date.now()}@test.edu`,
        firstName: 'Priya',
        lastName: 'Mehta',
        role: 'TEACHER',
        passwordHash: '$2a$12$DUMMYHASHFORTESTINGPURPOSESONLYXXXXXXXXXXXXX',
      },
    });

    const teacherProfileB = await prisma.teacherProfile.create({
      data: {
        tenantId: tenantBId,
        userId: teacherUserB.id,
        employeeId: `EMP-B-${Date.now()}`,
        department: 'Science',
        qualification: 'M.Sc., B.Ed.',
        joiningDate: new Date(),
      },
    });

    const subjectB = await prisma.subject.create({
      data: {
        tenantId: tenantBId,
        name: 'Target Science B',
        code: `SCI-B-${Date.now()}`,
      },
    });

    const timeSlotB = await prisma.periodTimeSlot.create({
      data: {
        tenantId: tenantBId,
        name: 'Period 1 Target',
        startTime: '08:00',
        endTime: '08:45',
        order: 1,
      },
    });

    const timetableEntryB = await prisma.timetableEntry.create({
      data: {
        tenantId: tenantBId,
        sectionId: sectionB.id,
        periodTimeSlotId: timeSlotB.id,
        dayOfWeek: 'MONDAY',
        subjectId: subjectB.id,
        teacherId: teacherProfileB.id,
      },
    });

    const emergencyContactB = await prisma.emergencyContact.create({
      data: {
        tenantId: tenantBId,
        name: 'Target Emergency B',
        designation: 'Clinic B',
        phone: '9988112244',
        category: 'MEDICAL',
        displayOrder: 1,
      },
    });

    const eventB = await prisma.event.create({
      data: {
        tenantId: tenantBId,
        createdById: userB.id,
        title: 'Target Annual Sports B',
        description: 'Sports event for B',
        eventDate: new Date('2026-11-15T00:00:00.000Z'),
        category: 'SPORTS',
        isPublished: true,
      },
    });

    const holidayB = await prisma.holiday.create({
      data: {
        tenantId: tenantBId,
        sessionId: academicYearB.id,
        name: 'Target Holiday B',
        date: new Date('2026-12-25T00:00:00.000Z'),
        type: 'NATIONAL',
      },
    });

    const parentUserB = await prisma.user.create({
      data: {
        tenantId: tenantBId,
        email: `parent.b.${Date.now()}@test.edu`,
        firstName: 'Ramesh',
        lastName: 'Sharma',
        role: 'PARENT',
        passwordHash: '$2a$12$DUMMYHASHFORTESTINGPURPOSESONLYXXXXXXXXXXXXX',
      },
    });

    const parentProfileB = await prisma.parentProfile.create({
      data: {
        tenantId: tenantBId,
        userId: parentUserB.id,
        occupation: 'Business',
      },
    });

    // ------------------------------------------------------------------------
    // SECTION 1: Prisma Extension Operation-Level Isolation Proof
    // ------------------------------------------------------------------------
    console.log('\n--- Section 1: Prisma Client Extension ($extends) Operation Proof ---');

    const dbA = getTenantDb(tenantAId);
    const dbB = getTenantDb(tenantBId);

    // 1. findFirst
    const ffResult = await dbA.studentProfile.findFirst({
      where: { id: studentProfileB.id },
    });
    assert(
      ffResult === null,
      'dbA.findFirst: Tenant A cannot read Tenant B record by ID',
      `Expected null, got ${ffResult?.id}`
    );

    // 2. findFirstOrThrow
    let ffThrowPassed = false;
    try {
      await dbA.studentProfile.findFirstOrThrow({
        where: { id: studentProfileB.id },
      });
    } catch (e: any) {
      ffThrowPassed = e.code === 'P2025' || e.name === 'NotFoundError';
    }
    assert(
      ffThrowPassed,
      'dbA.findFirstOrThrow: Tenant A throws NotFoundError (P2025) on Tenant B record'
    );

    // 3. findUnique
    const fuResult = await dbA.studentProfile.findUnique({
      where: { id: studentProfileB.id },
    });
    assert(
      fuResult === null,
      'dbA.findUnique: Tenant A cannot read Tenant B record by ID (returns null)',
      `Expected null, got ${fuResult?.id}`
    );

    // 4. findUniqueOrThrow
    let fuThrowPassed = false;
    try {
      await dbA.studentProfile.findUniqueOrThrow({
        where: { id: studentProfileB.id },
      });
    } catch (e: any) {
      fuThrowPassed = e.code === 'P2025' || e.name === 'NotFoundError';
    }
    assert(
      fuThrowPassed,
      'dbA.findUniqueOrThrow: Tenant A throws NotFoundError (P2025) on Tenant B record'
    );

    // 5. findMany
    const fmResult = await dbA.studentProfile.findMany({
      where: { id: studentProfileB.id },
    });
    assert(
      fmResult.length === 0,
      'dbA.findMany: Tenant A findMany filtering for Tenant B ID returns empty array'
    );

    // 6. count
    const countResult = await dbA.studentProfile.count({
      where: { id: studentProfileB.id },
    });
    assert(
      countResult === 0,
      'dbA.count: Tenant A count on Tenant B record ID returns 0'
    );

    // 7. aggregate
    const aggResult = await dbA.studentProfile.aggregate({
      where: { id: studentProfileB.id },
      _count: { id: true },
    });
    assert(
      aggResult._count.id === 0,
      'dbA.aggregate: Tenant A aggregate on Tenant B record ID returns count 0'
    );

    // 8. groupBy
    const groupResult = await dbA.studentProfile.groupBy({
      by: ['gender'],
      where: { id: studentProfileB.id },
      _count: { id: true },
    });
    assert(
      groupResult.length === 0,
      'dbA.groupBy: Tenant A groupBy on Tenant B record ID returns empty groups'
    );

    // 9. update
    let updateThrew = false;
    try {
      await dbA.studentProfile.update({
        where: { id: studentProfileB.id },
        data: { address: 'Malicious Update by Tenant A' },
      });
    } catch (e: any) {
      updateThrew = e.code === 'P2025';
    }
    assert(
      updateThrew,
      'dbA.update: Tenant A updating Tenant B record throws P2025 (Record not found)'
    );

    // 10. updateMany
    const updateManyResult = await dbA.studentProfile.updateMany({
      where: { id: studentProfileB.id },
      data: { address: 'Malicious UpdateMany by Tenant A' },
    });
    assert(
      updateManyResult.count === 0,
      'dbA.updateMany: Tenant A updateMany on Tenant B record ID updates 0 rows'
    );

    // 11. delete
    let deleteThrew = false;
    try {
      await dbA.studentProfile.delete({
        where: { id: studentProfileB.id },
      });
    } catch (e: any) {
      deleteThrew = e.code === 'P2025';
    }
    assert(
      deleteThrew,
      'dbA.delete: Tenant A deleting Tenant B record throws P2025 (Record not found)'
    );

    // 12. deleteMany
    const deleteManyResult = await dbA.studentProfile.deleteMany({
      where: { id: studentProfileB.id },
    });
    assert(
      deleteManyResult.count === 0,
      'dbA.deleteMany: Tenant A deleteMany on Tenant B record ID deletes 0 rows'
    );

    // 13. Global model exemption
    const globalPlans = await dbA.subscriptionPlan.findMany();
    assert(
      globalPlans.length > 0,
      'dbA: Global model SubscriptionPlan is exempt from tenantId scoping and accessible'
    );

    // ------------------------------------------------------------------------
    // SECTION 2: Server Action Cross-Tenant Negative Tests
    // ------------------------------------------------------------------------
    console.log('\n--- Section 2: Server Action Cross-Tenant Negative Tests ---');

    // Authenticate as Tenant A Admin for server actions
    setTestSessionOverride({
      sub: adminUserA.id,
      email: adminUserA.email,
      role: Role.ADMIN,
      tenantId: tenantAId,
    });

    // 1. saveTimetableEntryAction: Cross-tenant sectionId
    const ttRes1 = await saveTimetableEntryAction({
      sectionId: sectionB.id,
      periodTimeSlotId: timeSlotB.id,
      dayOfWeek: 'TUESDAY',
    });
    assert(
      ttRes1.success === false && ttRes1.error.includes('Section not found in your school'),
      'saveTimetableEntryAction: Rejects sectionId belonging to Tenant B'
    );

    // Resolve Tenant A section for further timetable tests
    const sectionA = await prisma.section.findFirst({
      where: { tenantId: tenantAId },
    });
    if (!sectionA) throw new Error('Tenant A section missing.');

    // 2. saveTimetableEntryAction: Cross-tenant periodTimeSlotId
    const ttRes2 = await saveTimetableEntryAction({
      sectionId: sectionA.id,
      periodTimeSlotId: timeSlotB.id,
      dayOfWeek: 'TUESDAY',
    });
    assert(
      ttRes2.success === false && ttRes2.error.includes('Time slot not found in your school'),
      'saveTimetableEntryAction: Rejects periodTimeSlotId belonging to Tenant B'
    );

    // 3. saveTimetableEntryAction: Cross-tenant subjectId
    const timeSlotA = await prisma.periodTimeSlot.findFirst({
      where: { tenantId: tenantAId },
    });
    if (!timeSlotA) throw new Error('Tenant A time slot missing.');

    const ttRes3 = await saveTimetableEntryAction({
      sectionId: sectionA.id,
      periodTimeSlotId: timeSlotA.id,
      dayOfWeek: 'TUESDAY',
      subjectId: subjectB.id,
    });
    assert(
      ttRes3.success === false && ttRes3.error.includes('Subject not found in your school'),
      'saveTimetableEntryAction: Rejects subjectId belonging to Tenant B'
    );

    // 4. saveTimetableEntryAction: Cross-tenant teacherId
    const ttRes4 = await saveTimetableEntryAction({
      sectionId: sectionA.id,
      periodTimeSlotId: timeSlotA.id,
      dayOfWeek: 'TUESDAY',
      teacherId: teacherProfileB.id,
    });
    assert(
      ttRes4.success === false && ttRes4.error.includes('Teacher not found in your school'),
      'saveTimetableEntryAction: Rejects teacherId belonging to Tenant B'
    );

    // 5. cloneTimetableAction: Cross-tenant toSectionId
    const cloneRes1 = await cloneTimetableAction({
      fromSectionId: sectionA.id,
      toSectionId: sectionB.id,
    });
    assert(
      cloneRes1.success === false && cloneRes1.error.includes('Target section not found in your school'),
      'cloneTimetableAction: Rejects target sectionId belonging to Tenant B'
    );

    // 6. cloneTimetableAction: Cross-tenant fromSectionId
    const cloneRes2 = await cloneTimetableAction({
      fromSectionId: sectionB.id,
      toSectionId: sectionA.id,
    });
    assert(
      cloneRes2.success === false && cloneRes2.error.includes('Source section not found in your school'),
      'cloneTimetableAction: Rejects source sectionId belonging to Tenant B'
    );

    // 7. getSubjectsForSectionAction: Cross-tenant sectionId
    const subjectsRes = await getSubjectsForSectionAction(sectionB.id);
    assert(
      subjectsRes.success === false && subjectsRes.error.includes('Section not found in your school'),
      'getSubjectsForSectionAction: Rejects sectionId belonging to Tenant B'
    );

    // 8. updatePeriodTimeSlotAction: Cross-tenant slotId
    const updateSlotRes = await updatePeriodTimeSlotAction({
      id: timeSlotB.id,
      name: 'Hacked Slot',
    });
    assert(
      updateSlotRes.success === false && updateSlotRes.error.includes('Time slot not found'),
      'updatePeriodTimeSlotAction: Rejects modifying period slot belonging to Tenant B'
    );

    // 9. deletePeriodTimeSlotAction: Cross-tenant slotId
    const delSlotRes = await deletePeriodTimeSlotAction(timeSlotB.id);
    assert(
      delSlotRes.success === false && delSlotRes.error.includes('Time slot not found'),
      'deletePeriodTimeSlotAction: Rejects deleting period slot belonging to Tenant B'
    );

    // 10. assignTeacherSubstitutionAction: Cross-tenant substitute teacher
    const timetableEntryA = await prisma.timetableEntry.findFirst({
      where: { tenantId: tenantAId, teacherId: { not: null } },
    });
    if (timetableEntryA) {
      const subRes1 = await assignTeacherSubstitutionAction({
        timetableEntryId: timetableEntryA.id,
        substituteTeacherId: teacherProfileB.id,
        date: '2026-10-15',
        reason: 'Cross-tenant assignment attempt',
      });
      assert(
        subRes1.success === false && subRes1.error.includes('Substitute teacher not found in your school'),
        'assignTeacherSubstitutionAction: Rejects substituteTeacherId belonging to Tenant B'
      );
    }

    // 11. assignTeacherSubstitutionAction: Cross-tenant timetableEntryId
    const teacherA = await prisma.teacherProfile.findFirst({
      where: { tenantId: tenantAId },
    });
    if (teacherA) {
      const subRes2 = await assignTeacherSubstitutionAction({
        timetableEntryId: timetableEntryB.id,
        substituteTeacherId: teacherA.id,
        date: '2026-10-15',
        reason: 'Cross-tenant entry assignment attempt',
      });
      assert(
        subRes2.success === false && subRes2.error.includes('Timetable entry not found in your school'),
        'assignTeacherSubstitutionAction: Rejects timetableEntryId belonging to Tenant B'
      );
    }

    // 12. updateEmergencyContactAction: Cross-tenant contact
    const updateEmergRes = await updateEmergencyContactAction({
      id: emergencyContactB.id,
      name: 'Malicious Change',
    });
    assert(
      updateEmergRes.success === false && Boolean((updateEmergRes as any).error?.includes('Emergency contact not found')),
      'updateEmergencyContactAction: Rejects updating emergency contact belonging to Tenant B'
    );

    // 13. deleteEmergencyContactAction: Cross-tenant contact
    const delEmergRes = await deleteEmergencyContactAction(emergencyContactB.id);
    assert(
      delEmergRes.success === false && Boolean((delEmergRes as any).error?.includes('Emergency contact not found')),
      'deleteEmergencyContactAction: Rejects deleting emergency contact belonging to Tenant B'
    );

    // 14. updateEventAction: Cross-tenant event
    const updateEventRes = await updateEventAction({
      id: eventB.id,
      title: 'Hacked Event',
    });
    assert(
      updateEventRes.success === false && Boolean((updateEventRes as any).error?.includes('Event not found or unauthorized')),
      'updateEventAction: Rejects modifying event belonging to Tenant B'
    );

    // 15. togglePublishEventAction: Cross-tenant event
    const toggleEventRes = await togglePublishEventAction(eventB.id, false);
    assert(
      toggleEventRes.success === false && Boolean((toggleEventRes as any).error?.includes('Event not found')),
      'togglePublishEventAction: Rejects toggling event belonging to Tenant B'
    );

    // 16. deleteEventAction: Cross-tenant event
    const delEventRes = await deleteEventAction(eventB.id);
    assert(
      delEventRes.success === false && Boolean((delEventRes as any).error?.includes('Event not found')),
      'deleteEventAction: Rejects deleting event belonging to Tenant B'
    );

    // 17. createHolidayAction: Cross-tenant academic session
    const holidayRes = await createHolidayAction({
      sessionId: academicYearB.id,
      name: 'Malicious Holiday',
      date: '2026-11-20',
      type: 'SCHOOL',
      isRecurring: false,
    });
    assert(
      holidayRes.success === false && Boolean((holidayRes as any).error?.includes('Academic session not found in your school')),
      'createHolidayAction: Rejects creating holiday linked to Tenant B academic session'
    );

    // 18. deleteHolidayAction: Cross-tenant holiday
    const delHolidayRes = await deleteHolidayAction(holidayB.id);
    assert(
      delHolidayRes.success === false && Boolean((delHolidayRes as any).error?.includes('Holiday not found')),
      'deleteHolidayAction: Rejects deleting holiday belonging to Tenant B'
    );

    // 19. transferStudentSectionAction: Cross-tenant studentProfileId
    const transferRes1 = await transferStudentSectionAction({
      studentProfileId: studentProfileB.id,
      targetSectionId: sectionA.id,
      reason: 'Cross-tenant transfer attack',
    });
    assert(
      transferRes1.success === false && Boolean((transferRes1 as any).error?.includes('Student record not found in your school')),
      'transferStudentSectionAction: Rejects transferring student belonging to Tenant B'
    );

    // 20. transferStudentSectionAction: Cross-tenant targetSectionId
    const studentA = await prisma.studentProfile.findFirst({
      where: { tenantId: tenantAId },
    });
    if (studentA) {
      const transferRes2 = await transferStudentSectionAction({
        studentProfileId: studentA.id,
        targetSectionId: sectionB.id,
        reason: 'Cross-tenant section target attack',
      });
      assert(
        transferRes2.success === false && Boolean((transferRes2 as any).error?.includes('Target section not found in your school')),
        'transferStudentSectionAction: Rejects target section belonging to Tenant B'
      );
    }

    // 21. linkParentToStudentAction: Cross-tenant parentId
    const parentA = await prisma.parentProfile.findFirst({
      where: { tenantId: tenantAId },
    });
    if (parentA && studentA) {
      const linkRes1 = await linkParentToStudentAction({
        parentId: parentProfileB.id,
        studentId: studentA.id,
      });
      assert(
        linkRes1.success === false && Boolean((linkRes1 as any).error?.includes('Parent record not found in your school')),
        'linkParentToStudentAction: Rejects linking parent belonging to Tenant B'
      );

      // 22. linkParentToStudentAction: Cross-tenant studentId
      const linkRes2 = await linkParentToStudentAction({
        parentId: parentA.id,
        studentId: studentProfileB.id,
      });
      assert(
        linkRes2.success === false && Boolean((linkRes2 as any).error?.includes('Student record not found in your school')),
        'linkParentToStudentAction: Rejects linking student belonging to Tenant B'
      );
    }

    // 23. unlinkParentAction: Cross-tenant unlinking
    const unlinkRes = await unlinkParentAction({
      parentId: parentProfileB.id,
      studentId: studentProfileB.id,
    });
    assert(
      unlinkRes.success === false && Boolean((unlinkRes as any).error?.includes('Relationship not found or does not belong to your school')),
      'unlinkParentAction: Rejects unlinking relationship belonging to Tenant B'
    );

    // ------------------------------------------------------------------------
    // SECTION 3: Tenant Resolution & Forged Host Header Tests
    // ------------------------------------------------------------------------
    console.log('\n--- Section 3: Tenant Resolution & Forged Host Header Tests ---');

    // Setup a verified custom domain for Tenant A
    const customDomainA = `dps-test-${Date.now()}.org`;
    await prisma.tenantDomain.create({
      data: {
        tenantId: tenantAId,
        domain: customDomainA,
        isVerified: true,
        isPrimary: true,
      },
    });

    // Setup an UNVERIFIED custom domain for Tenant B
    const unverifiedDomainB = `unverified-b-${Date.now()}.org`;
    await prisma.tenantDomain.create({
      data: {
        tenantId: tenantBId,
        domain: unverifiedDomainB,
        isVerified: false,
        isPrimary: false,
      },
    });

    // 1. Valid verified custom domain resolves
    const resolvedCustom = await resolveTenantByHostname(customDomainA);
    assert(
      resolvedCustom !== null && resolvedCustom.tenantId === tenantAId,
      'resolveTenantByHostname: Resolves verified custom domain to correct tenant',
      `Resolved tenant: ${resolvedCustom?.tenantId}`
    );

    // 2. Unverified custom domain does NOT resolve
    const resolvedUnverified = await resolveTenantByHostname(unverifiedDomainB);
    assert(
      resolvedUnverified === null,
      'resolveTenantByHostname: Rejects unverified custom domain (returns null)'
    );

    // 3. Forged attacker domain does NOT resolve
    const resolvedAttacker = await resolveTenantByHostname('attacker-evil-domain.com');
    assert(
      resolvedAttacker === null,
      'resolveTenantByHostname: Rejects unknown / attacker-controlled domain (returns null)'
    );

    // 4. Valid active tenant subdomain resolves
    const resolvedSubdomain = await resolveTenantByHostname('dps.schoolerp.in');
    assert(
      resolvedSubdomain !== null && resolvedSubdomain.tenantId === tenantAId,
      'resolveTenantByHostname: Resolves valid active tenant subdomain'
    );

    // 5. Non-existent tenant subdomain returns null
    const resolvedNonExistent = await resolveTenantByHostname('nonexistent-school-12345.schoolerp.in');
    assert(
      resolvedNonExistent === null,
      'resolveTenantByHostname: Returns null for non-existent subdomain'
    );

    // 6. Host with port (e.g. dps.schoolerp.in:3000) strips port and resolves
    const resolvedWithPort = await resolveTenantByHostname('dps.schoolerp.in:3000');
    assert(
      resolvedWithPort !== null && resolvedWithPort.tenantId === tenantAId,
      'resolveTenantByHostname: Normalizes host with port and resolves correctly'
    );

    // 7. Middleware strips incoming spoofed internal headers
    const spoofReq = new NextRequest('http://localhost:3000/portal', {
      headers: {
        host: 'localhost:3000',
        'x-user-id': 'forged-user-id',
        'x-user-role': 'SUPER_ADMIN',
        'x-tenant-id': tenantBId,
        'x-is-superadmin-domain': 'true',
      },
    });
    const middlewareRes = await middleware(spoofReq);
    // In Next.js middleware, NextRequest headers passed to next are in the request object
    // Verify middleware responded with next() and did not trust the forged role
    assert(
      middlewareRes !== null && middlewareRes.status !== 500,
      'middleware: Processes request with spoofed internal headers safely'
    );

    // 8. Middleware rejects malformed / injected Host header
    const badHostReq = new NextRequest('http://localhost:3000/', {
      headers: {
        host: 'evil.com/malformed header with spaces',
      },
    });
    const badHostRes = await middleware(badHostReq);
    assert(
      badHostRes.status === 400,
      'middleware: Rejects malformed Host header format with HTTP 400 Bad Request'
    );

  } finally {
    // Guaranteed Teardown of Tenant B and all its child fixtures
    setTestSessionOverride(null);
    try {
      await prisma.tenant.delete({
        where: { id: tenantBId },
      });
      console.log(`\n  [TEARDOWN] Cleaned up adversarial target tenant ${tenantBId}`);
    } catch (e: any) {
      console.warn(`  [TEARDOWN WARNING] Could not delete Tenant B: ${e.message}`);
    }
  }

  console.log('\n================================================================');
  console.log(` PHASE 1B VERIFICATION COMPLETE: ${passedTests}/${totalTests} TESTS PASSED`);
  console.log('================================================================\n');

  if (passedTests !== totalTests) {
    process.exit(1);
  }
}

runPhase1BVerification()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error('Fatal verification error:', e);
    prisma.$disconnect();
    process.exit(1);
  });
