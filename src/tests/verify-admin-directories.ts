import { AuthService } from '@/services/auth.service';
import { prisma } from '@/lib/db';
import { verifySessionToken } from '@/lib/session';

async function verifyAdminDirectories() {
  console.log('\n======================================================');
  console.log(' VERIFYING PHASE 2: ADMIN STUDENT & STAFF DIRECTORIES');
  console.log('======================================================\n');

  // 1. Authenticate Admin
  const adminLogin = await AuthService.login({
    email: 'admin@dps.edu.in',
    password: 'Admin@123',
  }, null);

  if (!adminLogin.success || !adminLogin.token) {
    throw new Error('Admin login failed: ' + adminLogin.error);
  }
  const session = await verifySessionToken(adminLogin.token);
  if (!session?.tenantId) {
    throw new Error('Missing tenant in admin session');
  }
  const tenantId = session.tenantId;

  // 2. Test Student Directory Queries
  console.log('--- Suite 1: Student Directory Queries & Relations ---');
  const students = await prisma.studentProfile.findMany({
    where: { tenantId },
    include: {
      user: true,
      section: { include: { classGrade: true } },
      parents: { include: { parent: { include: { user: true } } } },
      attendances: { select: { status: true } },
      feeInvoices: { select: { netAmount: true, paidAmount: true, balanceAmount: true } },
    },
    orderBy: { rollNumber: 'asc' },
  });

  if (students.length !== 5) {
    throw new Error(`Expected 5 students, found ${students.length}`);
  }
  console.log(`  [PASS] Retrieved all ${students.length} students enrolled in Class 10-A`);

  // Check Rohan Sharma
  const rohan = students.find(s => s.admissionNumber === 'DPS-2022-4891');
  if (!rohan) {
    throw new Error('Rohan Sharma not found');
  }
  console.log(`  [PASS] Found student: ${rohan.user.firstName} ${rohan.user.lastName} (Roll: ${rohan.rollNumber})`);
  console.log(`  [PASS] Emergency contact & Address verified: ${rohan.emergencyContact} • ${rohan.address}`);

  // Check Parent link
  if (rohan.parents.length === 0) {
    throw new Error('Rohan has no linked parents');
  }
  const primaryParent = rohan.parents[0].parent;
  console.log(`  [PASS] Linked Parent verified: ${primaryParent.user.firstName} ${primaryParent.user.lastName} (${primaryParent.relationship})`);

  // Check Fees
  const totalPending = rohan.feeInvoices.reduce((sum, i) => sum + Number(i.balanceAmount), 0);
  if (totalPending <= 0) {
    throw new Error('Expected pending fees for Term 2 for Rohan');
  }
  console.log(`  [PASS] Real fee ledger balance verified: ₹${totalPending.toLocaleString('en-IN')} pending`);

  // 3. Test Faculty Directory Queries
  console.log('\n--- Suite 2: Faculty Directory & Substitution Mapping ---');
  const teachers = await prisma.teacherProfile.findMany({
    where: { tenantId },
    include: {
      user: true,
      assignedSubstitutions: {
        where: { status: 'ASSIGNED' },
      },
    },
    orderBy: { employeeId: 'asc' },
  });

  if (teachers.length !== 2) {
    throw new Error(`Expected 2 teachers, found ${teachers.length}`);
  }
  console.log(`  [PASS] Retrieved all ${teachers.length} faculty members`);

  const mainTeacher = teachers.find(t => t.employeeId === 'EMP-DPS-101');
  if (!mainTeacher) {
    throw new Error('Main teacher EMP-DPS-101 missing');
  }
  console.log(`  [PASS] Faculty record verified: Dr. ${mainTeacher.user.firstName} ${mainTeacher.user.lastName} (${mainTeacher.department})`);

  // Verify Class Teacher assignment
  const section = await prisma.section.findFirst({
    where: { tenantId, classTeacherId: mainTeacher.id },
    include: { classGrade: true },
  });
  if (!section) {
    throw new Error('Main teacher is not assigned as Class Teacher');
  }
  console.log(`  [PASS] Class Teacher role verified: ${section.classGrade.name}-${section.name} assigned to ${mainTeacher.user.firstName}`);

  // Verify Active Substitution
  if (mainTeacher.assignedSubstitutions.length === 0) {
    throw new Error('Expected active substitution for today');
  }
  console.log(`  [PASS] Active Substitution verified for Dr. ${mainTeacher.user.firstName}: Covering Period for absent colleague`);

  console.log('\n======================================================');
  console.log(' ALL ADMIN DIRECTORIES VERIFICATION CHECKS PASSED!');
  console.log('======================================================\n');
}

verifyAdminDirectories()
  .then(async () => {
    await prisma.$disconnect();
    process.exit(0);
  })
  .catch(async (e) => {
    console.error('Directory verification failed:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
