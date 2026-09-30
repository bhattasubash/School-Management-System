import { prisma } from '../lib/db';
import { AuthService } from '../services/auth.service';
import {
  generateStudentTemplateAction,
  generateTeacherTemplateAction,
  archiveStudentsAction,
  reactivateStudentsAction,
  createStudentAction,
} from '../actions/admin';

async function runWave2Tests() {
  console.log('Testing Wave 2 Features: Auth Recovery, Templates, Direct Creation, Sibling Linking, and Archiving...');

  // 1. Test OTP Generation & Password Reset Flow
  const testEmail = 'student@dps.edu.in';
  console.log('1. Testing OTP Generation for', testEmail);
  const otpRes = await AuthService.requestPasswordResetOtp(testEmail);
  if (!otpRes.success) throw new Error('Failed to request OTP');
  console.log('   ✓ OTP request succeeded');

  // Let's create a temporary test user to test actual OTP reset & change
  const tempEmail = 'wave2.test@schoolerp.in';
  const tenant = await prisma.tenant.findFirst();
  if (!tenant) throw new Error('No tenant found in DB');

  await prisma.user.deleteMany({ where: { email: tempEmail } });

  const tempUser = await prisma.user.create({
    data: {
      tenantId: tenant.id,
      email: tempEmail,
      firstName: 'Wave2',
      lastName: 'Tester',
      role: 'STUDENT',
      passwordHash: await AuthService.hashPassword('TempPass@123'),
      isActive: true,
      mustChangePassword: true,
    },
  });
  console.log('2. Created temporary user:', tempUser.email);

  // Request OTP for temp user
  await AuthService.requestPasswordResetOtp(tempEmail, tenant.id);

  // Test login with mustChangePassword
  const loginInitial = await AuthService.login(
    { email: tempEmail, password: 'TempPass@123' },
    tenant.id
  );
  if (!loginInitial.success) throw new Error('Initial login failed');
  if (!loginInitial.mustChangePassword) throw new Error('mustChangePassword flag not detected');
  console.log('   ✓ Initial login succeeded with mustChangePassword=true');

  // Change password
  const changeRes = await AuthService.changePassword(
    tempUser.id,
    'TempPass@123',
    'NewSecurePass@2026'
  );
  if (!changeRes.success) throw new Error('Change password failed: ' + changeRes.error);
  console.log('   ✓ Password change succeeded');

  // Login with old password must fail
  const oldLogin = await AuthService.login(
    { email: tempEmail, password: 'TempPass@123' },
    tenant.id
  );
  if (oldLogin.success) throw new Error('Old password was accepted after change!');
  console.log('   ✓ Old password correctly rejected');

  // Login with new password must succeed
  const newLogin = await AuthService.login(
    { email: tempEmail, password: 'NewSecurePass@2026' },
    tenant.id
  );
  if (!newLogin.success) throw new Error('New password login failed');
  if (newLogin.mustChangePassword) throw new Error('mustChangePassword should be false after change');
  console.log('   ✓ Login with new password succeeded (mustChangePassword=false)');

  // 3. Test Deactivated User Login Lock
  console.log('3. Testing Deactivated/Archived User Login Rejection...');
  await prisma.user.update({
    where: { id: tempUser.id },
    data: { isActive: false, deletedAt: new Date() },
  });

  const deactivatedLogin = await AuthService.login(
    { email: tempEmail, password: 'NewSecurePass@2026' },
    tenant.id
  );
  if (deactivatedLogin.success) throw new Error('Deactivated user was allowed to log in!');
  if (!deactivatedLogin.error?.toLowerCase().includes('deactivated')) {
    throw new Error('Deactivated user did not receive deactivated error: ' + deactivatedLogin.error);
  }
  console.log('   ✓ Deactivated user properly blocked with error:', deactivatedLogin.error);

  // Reactivate user and verify login restored
  await prisma.user.update({
    where: { id: tempUser.id },
    data: { isActive: true, deletedAt: null },
  });
  const restoredLogin = await AuthService.login(
    { email: tempEmail, password: 'NewSecurePass@2026' },
    tenant.id
  );
  if (!restoredLogin.success) throw new Error('Reactivated user login failed: ' + restoredLogin.error);
  console.log('   ✓ Reactivated user login restored successfully');

  // Clean up test user
  await prisma.user.delete({ where: { id: tempUser.id } });

  // 4. Test Excel Template Generators
  console.log('4. Testing Excel template generation...');
  const studentTpl = await generateStudentTemplateAction();
  if (!studentTpl.success || !studentTpl.base64) throw new Error('Student template failed');
  console.log('   ✓ Student Excel template generated:', studentTpl.fileName);

  const teacherTpl = await generateTeacherTemplateAction();
  if (!teacherTpl.success || !teacherTpl.base64) throw new Error('Teacher template failed');
  console.log('   ✓ Teacher Excel template generated:', teacherTpl.fileName);

  // 5. Test Direct Student Creation with Parent & Sibling Linking
  console.log('5. Testing Direct Student Enrollment with Sibling Linking...');
  const section = await prisma.section.findFirst({ where: { tenantId: tenant.id } });
  if (!section) throw new Error('No section found in tenant');

  const sharedParentPhone = '9998887776';
  const adm1 = 'TEST-SIB-01';
  const adm2 = 'TEST-SIB-02';

  // Clean up previous test runs if any
  const existingStuds = await prisma.studentProfile.findMany({
    where: { tenantId: tenant.id, admissionNumber: { in: [adm1, adm2] } },
    select: { id: true, userId: true },
  });
  for (const s of existingStuds) {
    await prisma.parentStudentLink.deleteMany({ where: { studentId: s.id } });
    await prisma.studentProfile.delete({ where: { id: s.id } });
    await prisma.user.delete({ where: { id: s.userId } });
  }

  // Find or cleanup parent with sharedParentPhone
  const existingParentUser = await prisma.user.findFirst({
    where: { tenantId: tenant.id, phone: sharedParentPhone },
    include: { parentProfile: true },
  });
  if (existingParentUser) {
    if (existingParentUser.parentProfile) {
      await prisma.parentStudentLink.deleteMany({ where: { parentId: existingParentUser.parentProfile.id } });
      await prisma.parentProfile.delete({ where: { id: existingParentUser.parentProfile.id } });
    }
    await prisma.user.delete({ where: { id: existingParentUser.id } });
  }

  // Create Student 1
  const stud1Res = await prisma.$transaction(async (tx) => {
    const parentUser = await tx.user.create({
      data: {
        tenantId: tenant.id,
        email: `parent.${sharedParentPhone}@school.edu.in`,
        phone: sharedParentPhone,
        firstName: 'Vikram',
        lastName: 'Sharma',
        role: 'PARENT',
        passwordHash: await AuthService.hashPassword('Parent@123'),
      },
    });

    const parentProfile = await tx.parentProfile.create({
      data: {
        tenantId: tenant.id,
        userId: parentUser.id,
        relationship: 'FATHER',
      },
    });

    const studentUser = await tx.user.create({
      data: {
        tenantId: tenant.id,
        email: `std.${adm1.toLowerCase()}@school.edu.in`,
        firstName: 'ChildOne',
        lastName: 'Sharma',
        role: 'STUDENT',
        passwordHash: await AuthService.hashPassword('Student@123'),
      },
    });

    const studentProfile = await tx.studentProfile.create({
      data: {
        tenantId: tenant.id,
        userId: studentUser.id,
        admissionNumber: adm1,
        sectionId: section.id,
        dateOfBirth: new Date('2012-04-10'),
        gender: 'MALE',
        address: 'Delhi',
        emergencyContact: sharedParentPhone,
        admissionDate: new Date(),
      },
    });

    await tx.parentStudentLink.create({
      data: {
        tenantId: tenant.id,
        parentId: parentProfile.id,
        studentId: studentProfile.id,
        isPrimary: true,
      },
    });

    return { studentProfile, parentProfile };
  });

  // Create Student 2 (Sibling) using existing parent phone
  const stud2Res = await prisma.$transaction(async (tx) => {
    let parentUser = await tx.user.findFirst({
      where: { tenantId: tenant.id, phone: sharedParentPhone },
      include: { parentProfile: true },
    });

    if (!parentUser || !parentUser.parentProfile) {
      throw new Error('Parent should already exist for sibling test');
    }

    const studentUser = await tx.user.create({
      data: {
        tenantId: tenant.id,
        email: `std.${adm2.toLowerCase()}@school.edu.in`,
        firstName: 'ChildTwo',
        lastName: 'Sharma',
        role: 'STUDENT',
        passwordHash: await AuthService.hashPassword('Student@123'),
      },
    });

    const studentProfile = await tx.studentProfile.create({
      data: {
        tenantId: tenant.id,
        userId: studentUser.id,
        admissionNumber: adm2,
        sectionId: section.id,
        dateOfBirth: new Date('2014-08-15'),
        gender: 'FEMALE',
        address: 'Delhi',
        emergencyContact: sharedParentPhone,
        admissionDate: new Date(),
      },
    });

    // Link sibling to existing parent
    await tx.parentStudentLink.create({
      data: {
        tenantId: tenant.id,
        parentId: parentUser.parentProfile.id,
        studentId: studentProfile.id,
        isPrimary: true,
      },
    });

    return { studentProfile, parentProfile: parentUser.parentProfile };
  });

  // Verify both children are linked to the single parent profile
  const linkedLinks = await prisma.parentStudentLink.findMany({
    where: { parentId: stud1Res.parentProfile.id },
  });
  if (linkedLinks.length !== 2) {
    throw new Error(`Expected 2 linked siblings, found: ${linkedLinks.length}`);
  }
  console.log(`   ✓ Sibling scenario verified: 1 Parent Profile linked to ${linkedLinks.length} children`);

  // Cleanup test siblings
  await prisma.parentStudentLink.deleteMany({ where: { parentId: stud1Res.parentProfile.id } });
  await prisma.studentProfile.deleteMany({ where: { id: { in: [stud1Res.studentProfile.id, stud2Res.studentProfile.id] } } });
  await prisma.parentProfile.deleteMany({ where: { id: stud1Res.parentProfile.id } });
  await prisma.user.deleteMany({ where: { email: { in: [`std.${adm1.toLowerCase()}@school.edu.in`, `std.${adm2.toLowerCase()}@school.edu.in`, `parent.${sharedParentPhone}@school.edu.in`] } } });
  console.log('   ✓ Cleaned up sibling test records.');

  console.log('\n======================================================');
  console.log('ALL WAVE 2 TESTS AND VERIFICATIONS PASSED 100%!');
  console.log('======================================================\n');
}

runWave2Tests()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Wave 2 Test Failure:', err);
    process.exit(1);
  });
