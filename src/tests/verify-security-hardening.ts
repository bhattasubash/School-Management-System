import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { Role } from '@/types';
import { AuthService } from '@/services/auth.service';
import {
  createSessionToken,
  verifySessionToken,
  getJwtSecretKey,
} from '@/lib/jwt';
import { setTestSessionOverride } from '@/lib/session';
import { requireAuthGuard } from '@/lib/auth-guard';
import { rateLimit } from '@/lib/rate-limit';
import { revokeAllUserSessions, isSessionRevoked } from '@/lib/session-revocation';
import { middleware } from '@/middleware';
import { cancelTeacherSubstitutionAction } from '@/actions/admin/substitutions';
import { unlinkParentAction } from '@/actions/admin/parents';
import { archiveTeacherAction } from '@/actions/admin/archive';
import { transferStudentSectionAction } from '@/actions/admin/students';
import { refundFeePaymentAction } from '@/actions/admin/fees';
import { GET as healthLivenessHandler } from '@/app/api/health/route';
import { GET as healthReadyHandler } from '@/app/api/health/ready/route';

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

async function runSecurityHardeningVerification() {
  console.log('\n======================================================');
  console.log(' RUNNING PRODUCTION HARDENING & SECURITY VERIFICATION');
  console.log('======================================================\n');

  // Resolve Primary Seeded Tenant (Delhi Public School)
  const tenantA = await prisma.tenant.findFirst({
    where: { slug: 'dps' },
  });

  if (!tenantA) {
    throw new Error('Tenant A (DPS) not found in database. Run db seed first.');
  }

  const tenantAId = tenantA.id;
  const adminUserA = await prisma.user.findFirst({
    where: { tenantId: tenantAId, role: 'ADMIN' },
  });

  if (!adminUserA) {
    throw new Error('Admin user for Tenant A missing.');
  }

  // --------------------------------------------------------------------------
  // SUITE 1: JWT Production Security & Fail-Closed Behavior (P0-1)
  // --------------------------------------------------------------------------
  console.log('--- Suite 1: JWT Production Hardening & Fail-Closed Protection ---');

  // 1.1 Valid Token Creation & Verification
  const validToken = await createSessionToken({
    sub: adminUserA.id,
    role: Role.ADMIN,
    email: adminUserA.email,
    tenantId: tenantAId,
    mustChangePassword: false,
  });
  const decoded = await verifySessionToken(validToken);
  assert(decoded !== null && decoded.sub === adminUserA.id, 'Session token round-trip verifies successfully');

  // 1.2 Tampered Token Rejection
  const tamperedToken = validToken.slice(0, -6) + 'abcdef';
  const tamperedVerify = await verifySessionToken(tamperedToken);
  assert(tamperedVerify === null, 'Tampered JWT signature strictly rejected');

  // 1.3 Production Fail-Closed on Missing/Weak JWT_SECRET
  const originalEnv = process.env.NODE_ENV;
  const originalSecret = process.env.JWT_SECRET;
  try {
    (process.env as Record<string, string | undefined>).NODE_ENV = 'production';
    delete process.env.JWT_SECRET;

    let threwExpectedError = false;
    try {
      getJwtSecretKey();
    } catch (err: unknown) {
      if (err instanceof Error && err.message.includes('FATAL SECURITY MISCONFIGURATION')) {
        threwExpectedError = true;
      }
    }
    assert(threwExpectedError, 'getJwtSecretKey() fails closed in production when JWT_SECRET is unset');

    // Test with weak secret (< 32 chars) in production
    process.env.JWT_SECRET = 'short-secret';
    let threwWeakError = false;
    try {
      getJwtSecretKey();
    } catch (err: unknown) {
      if (err instanceof Error && err.message.includes('FATAL SECURITY MISCONFIGURATION')) {
        threwWeakError = true;
      }
    }
    assert(threwWeakError, 'getJwtSecretKey() fails closed in production when JWT_SECRET is shorter than 32 characters');
  } finally {
    (process.env as Record<string, string | undefined>).NODE_ENV = originalEnv;
    if (originalSecret) {
      process.env.JWT_SECRET = originalSecret;
    } else {
      delete process.env.JWT_SECRET;
    }
  }

  // --------------------------------------------------------------------------
  // SUITE 2: OTP Cryptographic Security, Invalidation & Rate Limits (P0-2, P1-6)
  // --------------------------------------------------------------------------
  console.log('\n--- Suite 2: OTP Cryptographic Integrity, Rate Limits & Invalidation ---');

  // 2.1 OTP Generation Rate Limit (Max 3 per 15 min per email)
  const testEmail = `otp-test-${Date.now()}@example.com`;

  // First 3 requests permitted by rate limiter
  const rl1 = await rateLimit({ prefix: 'rl:otp-req', key: testEmail, maxRequests: 3, windowSeconds: 900 });
  const rl2 = await rateLimit({ prefix: 'rl:otp-req', key: testEmail, maxRequests: 3, windowSeconds: 900 });
  const rl3 = await rateLimit({ prefix: 'rl:otp-req', key: testEmail, maxRequests: 3, windowSeconds: 900 });
  const rl4 = await rateLimit({ prefix: 'rl:otp-req', key: testEmail, maxRequests: 3, windowSeconds: 900 });

  assert(rl1.allowed && rl2.allowed && rl3.allowed, 'Initial 3 OTP requests allowed within 15-minute window');
  assert(!rl4.allowed && rl4.remaining === 0, '4th OTP request blocked by rate limiter (429 protection)');

  // 2.2 Attempt Limit / Brute-Force Invalidation on OTP Verification
  const otpUser = await prisma.user.findFirst({
    where: { tenantId: tenantAId, isActive: true },
  });

  if (otpUser) {
    // Generate valid OTP
    const resetReq = await AuthService.requestPasswordResetOtp(otpUser.email, tenantAId);
    assert(Boolean(resetReq.success), 'OTP password reset request accepted without user enumeration');

    // Simulate 5 incorrect guesses
    for (let attempt = 1; attempt <= 5; attempt++) {
      await AuthService.verifyOtpAndResetPassword(otpUser.email, '000000', 'NewPassword@123', tenantAId);
    }

    // 6th attempt should return that code has been invalidated due to too many attempts
    const lockedAttempt = await AuthService.verifyOtpAndResetPassword(
      otpUser.email,
      '000000',
      'NewPassword@123',
      tenantAId
    );
    assert(
      Boolean(
        !lockedAttempt.success &&
          (lockedAttempt.error?.includes('invalidated') ||
            lockedAttempt.error?.includes('expired') ||
            lockedAttempt.error?.includes('Too many'))
      ),
      'OTP invalidated after 5 consecutive incorrect attempts'
    );
  }

  // --------------------------------------------------------------------------
  // SUITE 3: Multi-Tenant Mutation Isolation & Exploit Prevention (P0-3, P0-4)
  // --------------------------------------------------------------------------
  console.log('\n--- Suite 3: Multi-Tenant Mutation Isolation & Exploit Prevention ---');

  // Create a synthetic Tenant B for cross-tenant attack verification
  const tenantB = await prisma.tenant.upsert({
    where: { slug: 'test-tenant-b' },
    update: {},
    create: {
      name: 'Test Tenant B School',
      slug: 'test-tenant-b',
      email: 'contact@tenantb.local',
      phone: '+919999999999',
      address: '123 Test St',
      city: 'Delhi',
      state: 'Delhi',
      pincode: '110001',
      board: 'CBSE',
      subscriptionPlanId: tenantA.subscriptionPlanId,
      subscriptionStatus: 'ACTIVE',
      isActive: true,
    },
  });

  const tenantBId = tenantB.id;

  // Create Tenant B teacher user & profile
  const userB = await prisma.user.upsert({
    where: { tenantId_email: { tenantId: tenantBId, email: 'teacher@tenantb.local' } },
    update: {},
    create: {
      tenantId: tenantBId,
      email: 'teacher@tenantb.local',
      passwordHash: 'dummy',
      role: 'TEACHER',
      firstName: 'Teacher',
      lastName: 'B',
    },
  });

  const teacherProfileB = await prisma.teacherProfile.upsert({
    where: { userId: userB.id },
    update: {},
    create: {
      tenantId: tenantBId,
      userId: userB.id,
      employeeId: 'EMP-B-001',
      department: 'Academics',
      qualification: 'M.Sc., B.Ed.',
      joiningDate: new Date('2024-01-01'),
    },
  });

  // Create Tenant B Academic Year and Class Grade for testing
  const academicYearB = await prisma.academicYear.upsert({
    where: { tenantId_name: { tenantId: tenantBId, name: '2026-2027' } },
    update: {},
    create: {
      tenantId: tenantBId,
      name: '2026-2027',
      startDate: new Date('2026-04-01'),
      endDate: new Date('2027-03-31'),
      isCurrent: true,
    },
  });

  const gradeB = await prisma.classGrade.create({
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
      classGradeId: gradeB.id,
      name: 'A',
    },
  });

  const timeSlotB = await prisma.periodTimeSlot.create({
    data: {
      tenantId: tenantBId,
      name: 'Period 1',
      startTime: '08:00',
      endTime: '08:45',
      order: 1,
    },
  });

  const subjectB = await prisma.subject.create({
    data: {
      tenantId: tenantBId,
      name: 'Mathematics B',
      code: 'MATH-B',
    },
  });

  const timetableEntryB = await prisma.timetableEntry.create({
    data: {
      tenantId: tenantBId,
      sectionId: sectionB.id,
      subjectId: subjectB.id,
      teacherId: teacherProfileB.id,
      periodTimeSlotId: timeSlotB.id,
      dayOfWeek: 'MONDAY',
    },
  });

  // Create Tenant B Teacher Substitution
  const substitutionB = await prisma.teacherSubstitution.create({
    data: {
      tenantId: tenantBId,
      timetableEntryId: timetableEntryB.id,
      originalTeacherId: teacherProfileB.id,
      substituteTeacherId: teacherProfileB.id,
      date: new Date('2026-10-05'),
      status: 'ASSIGNED',
      reason: 'Sick leave',
      assignedById: userB.id,
    },
  });

  // ATTACK 1: Tenant A Admin attempts to cancel Tenant B's substitution (P0-3)
  setTestSessionOverride({
    sub: adminUserA.id,
    role: Role.ADMIN,
    email: adminUserA.email,
    tenantId: tenantAId,
    mustChangePassword: false,
  });

  const crossCancelResult = await cancelTeacherSubstitutionAction(substitutionB.id);
  assert(
    crossCancelResult.success === false,
    'Cross-Tenant Attack Denied: School A Admin cannot cancel School B substitution'
  );

  const subBCheck = await prisma.teacherSubstitution.findUnique({
    where: { id: substitutionB.id },
  });
  assert(
    subBCheck?.status === 'ASSIGNED',
    'Data Integrity: Tenant B substitution status remained ASSIGNED (0 rows mutated)'
  );

  // ATTACK 2: Tenant A Admin attempts to unlink Tenant B's parent (P0-4)
  const parentUserB = await prisma.user.create({
    data: {
      tenantId: tenantBId,
      email: `parent-b-${Date.now()}@tenantb.local`,
      passwordHash: 'dummy',
      role: 'PARENT',
      firstName: 'Parent',
      lastName: 'B',
    },
  });

  const parentProfileB = await prisma.parentProfile.create({
    data: {
      tenantId: tenantBId,
      userId: parentUserB.id,
      relationship: 'FATHER',
    },
  });

  const studentUserB = await prisma.user.create({
    data: {
      tenantId: tenantBId,
      email: `student-b-${Date.now()}@tenantb.local`,
      passwordHash: 'dummy',
      role: 'STUDENT',
      firstName: 'Student',
      lastName: 'B',
    },
  });

  const studentProfileB = await prisma.studentProfile.create({
    data: {
      tenantId: tenantBId,
      userId: studentUserB.id,
      admissionNumber: `ADM-B-${Date.now()}`,
      sectionId: sectionB.id,
      dateOfBirth: new Date('2010-01-01'),
      gender: 'MALE',
      address: '123 Test St',
      emergencyContact: '+919876543210',
      admissionDate: new Date('2024-04-01'),
    },
  });

  const linkB = await prisma.parentStudentLink.create({
    data: {
      tenantId: tenantBId,
      parentId: parentProfileB.id,
      studentId: studentProfileB.id,
      isPrimary: true,
    },
  });

  const crossUnlinkResult = await unlinkParentAction({
    parentId: parentProfileB.id,
    studentId: studentProfileB.id,
  });
  assert(
    crossUnlinkResult.success === false,
    'Cross-Tenant Attack Denied: School A Admin cannot unlink School B parent-student relationship'
  );

  const linkBCheck = await prisma.parentStudentLink.findUnique({
    where: { id: linkB.id },
  });
  assert(linkBCheck !== null, 'Data Integrity: Tenant B parent link remained intact');

  // ATTACK 3: Tenant A Admin attempts to archive Tenant B's teacher
  const crossArchiveResult = await archiveTeacherAction(teacherProfileB.id);
  assert(
    crossArchiveResult.success === false,
    'Cross-Tenant Attack Denied: School A Admin cannot archive School B teacher'
  );

  const teacherBUserCheck = await prisma.user.findUnique({
    where: { id: userB.id },
  });
  assert(teacherBUserCheck?.isActive === true, 'Data Integrity: Tenant B teacher account remained active');

  // --------------------------------------------------------------------------
  // SUITE 4: API Route Protection & mustChangePassword Enforcement (P1-1, P1-2)
  // --------------------------------------------------------------------------
  console.log('\n--- Suite 4: API Route Protection & mustChangePassword Enforcement ---');

  // 4.1 Unauthenticated Request to Protected Admin API
  const unauthReq = new NextRequest('http://localhost:3000/api/admin/system');
  const unauthRes = await middleware(unauthReq);
  assert(unauthRes.status === 401, 'Unauthenticated request to /api/admin/* returns 401 Unauthorized');

  // 4.2 Request with mustChangePassword: true to /api/admin/users
  const tempPasswordToken = await createSessionToken({
    sub: adminUserA.id,
    role: Role.ADMIN,
    email: adminUserA.email,
    tenantId: tenantAId,
    mustChangePassword: true,
  });

  const changePwReq = new NextRequest('http://localhost:3000/api/admin/users', {
    headers: { cookie: `session_token=${tempPasswordToken}` },
  });
  const changePwRes = await middleware(changePwReq);
  assert(
    changePwRes.status === 403,
    'Request with mustChangePassword: true to /api/admin/* strictly blocked with 403 Forbidden'
  );

  // 4.3 Request with mustChangePassword: true to allowed auth endpoints
  const allowedChangePwReq = new NextRequest('http://localhost:3000/api/auth/change-password', {
    headers: { cookie: `session_token=${tempPasswordToken}` },
  });
  const allowedRes = await middleware(allowedChangePwReq);
  assert(
    allowedRes.status !== 403,
    'Request with mustChangePassword: true permitted to reach /api/auth/change-password'
  );

  // 4.4 Role Privilege Escalation Protection (Teacher calling Admin API)
  const teacherToken = await createSessionToken({
    sub: 'teacher-user-id',
    role: Role.TEACHER,
    email: 'teacher@school.com',
    tenantId: tenantAId,
    mustChangePassword: false,
  });

  const teacherEscalationReq = new NextRequest('http://localhost:3000/api/admin/settings', {
    headers: { cookie: `session_token=${teacherToken}` },
  });
  const teacherEscalationRes = await middleware(teacherEscalationReq);
  assert(
    teacherEscalationRes.status === 403,
    'Teacher calling /api/admin/* returns 403 Forbidden (Privilege escalation blocked)'
  );

  // 4.5 Server Action requireAuthGuard with mustChangePassword
  setTestSessionOverride({
    sub: adminUserA.id,
    role: Role.ADMIN,
    email: adminUserA.email,
    tenantId: tenantAId,
    mustChangePassword: true,
  });

  const actionGuardResult = await requireAuthGuard([Role.ADMIN]);
  assert(
    actionGuardResult.success === false && actionGuardResult.mustChangePassword === true,
    'requireAuthGuard blocks mutations when user has mustChangePassword: true'
  );

  // --------------------------------------------------------------------------
  // SUITE 5: Cryptographically Secure Temporary Password Generator (P1-3)
  // --------------------------------------------------------------------------
  console.log('\n--- Suite 5: Cryptographic Temporary Password Generation ---');

  const passwords = new Set<string>();
  for (let i = 0; i < 20; i++) {
    const pw = AuthService.generateSecureTemporaryPassword();
    passwords.add(pw);
  }

  assert(passwords.size === 20, 'Generated 20 unique temporary passwords with 0 collisions');

  const samplePw = Array.from(passwords)[0];
  const hasMinLength = samplePw.length >= 12;
  const hasUpper = /[A-Z]/.test(samplePw);
  const hasLower = /[a-z]/.test(samplePw);
  const hasDigit = /[0-9]/.test(samplePw);
  const hasSpecial = /[^A-Za-z0-9]/.test(samplePw);

  assert(
    hasMinLength && hasUpper && hasLower && hasDigit && hasSpecial,
    'Temporary password meets enterprise complexity (>=12 chars, upper, lower, digit, symbol)'
  );

  // --------------------------------------------------------------------------
  // SUITE 6: Distributed Session Revocation Engine (P2-11)
  // --------------------------------------------------------------------------
  console.log('\n--- Suite 6: Session Revocation Engine (Logout / Password Change) ---');

  const testUserId = `revocation-user-${Date.now()}`;
  const nowSeconds = Math.floor(Date.now() / 1000);

  // Issued at current timestamp
  const beforeRevocation = await isSessionRevoked(testUserId, nowSeconds);
  assert(beforeRevocation === false, 'Session is valid prior to revocation');

  // Trigger revocation
  await revokeAllUserSessions(testUserId);

  // Session issued 5 seconds in the past should now be revoked
  const pastSessionRevoked = await isSessionRevoked(testUserId, nowSeconds - 5);
  assert(pastSessionRevoked === true, 'Token issued prior to revocation event is strictly revoked');

  // Token issued 5 seconds after revocation should remain valid
  const futureSessionValid = await isSessionRevoked(testUserId, nowSeconds + 5);
  assert(futureSessionValid === false, 'Token issued after revocation event is accepted');

  // --------------------------------------------------------------------------
  // SUITE 7: Centralized Rate Limiter Protection (P1-6)
  // --------------------------------------------------------------------------
  console.log('\n--- Suite 7: Centralized Rate Limiting Protection ---');

  const rlKey = `test-limit-${Date.now()}`;
  const r1 = await rateLimit({ prefix: 'rl:test', key: rlKey, maxRequests: 2, windowSeconds: 60 });
  const r2 = await rateLimit({ prefix: 'rl:test', key: rlKey, maxRequests: 2, windowSeconds: 60 });
  const r3 = await rateLimit({ prefix: 'rl:test', key: rlKey, maxRequests: 2, windowSeconds: 60 });

  assert(r1.allowed && r1.remaining === 1, 'Rate limiter: 1st request permitted');
  assert(r2.allowed && r2.remaining === 0, 'Rate limiter: 2nd request permitted (at limit)');
  assert(!r3.allowed && r3.retryAfterSeconds > 0, 'Rate limiter: 3rd request rejected with retryAfterSeconds');

  // --------------------------------------------------------------------------
  // SUITE 8: Production Liveness & Readiness Health Probes (P2-25)
  // --------------------------------------------------------------------------
  console.log('\n--- Suite 8: Infrastructure Health Probes ---');

  const livenessRes = await healthLivenessHandler();
  assert(livenessRes.status === 200, 'Liveness probe (/api/health) returns 200 OK');

  const readyRes = await healthReadyHandler();
  assert(readyRes.status === 200, 'Readiness probe (/api/health/ready) returns 200 OK');
  const readyData = await readyRes.json();
  assert(readyData.checks?.database === 'ok', 'Readiness probe reports PostgreSQL database connectivity healthy');

  // --------------------------------------------------------------------------
  // SUITE 9: Domain Business Logic Safeguards (P3-1, P3-2)
  // --------------------------------------------------------------------------
  console.log('\n--- Suite 9: Domain Logic Safeguards (Transfers & Refunds) ---');

  setTestSessionOverride({
    sub: adminUserA.id,
    role: Role.ADMIN,
    email: adminUserA.email,
    tenantId: tenantAId,
    mustChangePassword: false,
  });

  // 9.1 Reject Transfer of Foreign Student
  const invalidTransfer = await transferStudentSectionAction({
    studentProfileId: studentProfileB.id, // belongs to Tenant B
    targetSectionId: sectionB.id,
    reason: 'Transfer attempt across tenant boundary',
  });
  assert(
    invalidTransfer.success === false,
    'transferStudentSectionAction rejects student profile belonging to another school'
  );

  // 9.2 Reject Refund of Non-Existent or Foreign Payment
  const invalidRefund = await refundFeePaymentAction({
    paymentId: '00000000-0000-0000-0000-000000000000',
    reason: 'Fraudulent refund attempt',
  });
  assert(
    invalidRefund.success === false,
    'refundFeePaymentAction rejects non-existent/cross-tenant fee payment refund'
  );

  // --------------------------------------------------------------------------
  // CLEANUP: Purge Temporary Tenant B Test Records
  // --------------------------------------------------------------------------
  console.log('\n--- Cleaning up synthetic test artifacts ---');
  await prisma.parentStudentLink.deleteMany({ where: { tenantId: tenantBId } });
  await prisma.parentProfile.deleteMany({ where: { tenantId: tenantBId } });
  await prisma.studentProfile.deleteMany({ where: { tenantId: tenantBId } });
  await prisma.teacherSubstitution.deleteMany({ where: { tenantId: tenantBId } });
  await prisma.timetableEntry.deleteMany({ where: { tenantId: tenantBId } });
  await prisma.periodTimeSlot.deleteMany({ where: { tenantId: tenantBId } });
  await prisma.subject.deleteMany({ where: { tenantId: tenantBId } });
  await prisma.section.deleteMany({ where: { tenantId: tenantBId } });
  await prisma.classGrade.deleteMany({ where: { tenantId: tenantBId } });
  await prisma.academicYear.deleteMany({ where: { tenantId: tenantBId } });
  await prisma.teacherProfile.deleteMany({ where: { tenantId: tenantBId } });
  await prisma.user.deleteMany({ where: { tenantId: tenantBId } });
  await prisma.tenant.delete({ where: { id: tenantBId } });
  console.log('  [PASS] Synthetic Tenant B artifacts completely cleaned');

  // Reset test override
  setTestSessionOverride(null);

  // --------------------------------------------------------------------------
  // FINAL SCORECARD
  // --------------------------------------------------------------------------
  console.log('\n======================================================');
  console.log(` PRODUCTION HARDENING SCORECARD: ${passedTests} / ${totalTests} TESTS PASSED`);
  console.log('======================================================\n');

  if (passedTests !== totalTests) {
    process.exit(1);
  }
  process.exit(0);
}

runSecurityHardeningVerification()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Hardening test error:', err);
    process.exit(1);
  });
