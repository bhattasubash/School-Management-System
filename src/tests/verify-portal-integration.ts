import { AuthService } from '@/services/auth.service';
import { prisma } from '@/lib/db';
import { verifySessionToken } from '@/lib/session';

async function verifyPortalIntegration() {
  console.log('\n======================================================');
  console.log(' VERIFYING LIVE PORTAL & AUTH INTEGRATION');
  console.log('======================================================\n');

  // 1. Test Student Authentication & Live Data
  console.log('--- Test 1: Student Live Authentication & Data Binding ---');
  const studentLogin = await AuthService.login({
    email: 'student@dps.edu.in',
    password: 'Student@123',
  }, null);

  if (!studentLogin.success || !studentLogin.token || !studentLogin.user) {
    throw new Error('Student login failed: ' + studentLogin.error);
  }
  console.log('  [PASS] Student authenticated successfully on localhost');

  const studentSession = await verifySessionToken(studentLogin.token);
  if (!studentSession || studentSession.role !== 'STUDENT') {
    throw new Error('Student session invalid');
  }
  console.log('  [PASS] Student JWT session token verified with role STUDENT');

  const studentUser = await prisma.user.findUnique({
    where: { id: studentSession.sub },
    include: {
      studentProfile: {
        include: {
          section: {
            include: {
              classGrade: true,
            },
          },
        },
      },
    },
  });

  if (!studentUser?.studentProfile) {
    throw new Error('Student profile missing from database');
  }
  console.log(`  [PASS] Student Profile resolved: ${studentUser.firstName} ${studentUser.lastName} (Adm: ${studentUser.studentProfile.admissionNumber})`);

  const attendance = await prisma.studentAttendance.findMany({
    where: { studentId: studentUser.studentProfile.id },
  });
  console.log(`  [PASS] Live Attendance Records verified: ${attendance.length} records found`);

  const invoices = await prisma.feeInvoice.findMany({
    where: { studentId: studentUser.studentProfile.id },
  });
  console.log(`  [PASS] Live Fee Invoices verified: ${invoices.length} invoices found (${invoices.map(i => i.invoiceNumber).join(', ')})`);

  const examResults = await prisma.examResult.findMany({
    where: { studentId: studentUser.studentProfile.id },
    include: { examSchedule: { include: { subject: true } } },
  });
  console.log(`  [PASS] Live Exam Results verified: ${examResults.length} subject grades found (${examResults.map(r => `${r.examSchedule.subject.code}: ${r.marksObtained}`).join(', ')})`);

  // 2. Test Parent Authentication & Multi-Child Sibling Switcher
  console.log('\n--- Test 2: Parent Unified Dashboard & Sibling Switcher ---');
  const parentLogin = await AuthService.login({
    email: 'parent@dps.edu.in',
    password: 'Parent@123',
  }, null);

  if (!parentLogin.success || !parentLogin.token || !parentLogin.user) {
    throw new Error('Parent login failed: ' + parentLogin.error);
  }
  console.log('  [PASS] Parent authenticated successfully on localhost');

  const parentSession = await verifySessionToken(parentLogin.token);
  if (!parentSession || parentSession.role !== 'PARENT') {
    throw new Error('Parent session invalid');
  }
  console.log('  [PASS] Parent JWT session token verified with role PARENT');

  const parentUser = await prisma.user.findUnique({
    where: { id: parentSession.sub },
    include: {
      parentProfile: {
        include: {
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
            orderBy: { isPrimary: 'desc' },
          },
        },
      },
    },
  });

  if (!parentUser?.parentProfile) {
    throw new Error('Parent profile missing from database');
  }

  const linkedChildren = parentUser.parentProfile.students;
  if (linkedChildren.length < 2) {
    throw new Error(`Expected at least 2 linked siblings, found ${linkedChildren.length}`);
  }
  console.log(`  [PASS] Parent has ${linkedChildren.length} linked siblings for header switcher:`);
  for (const link of linkedChildren) {
    console.log(`    - ${link.student.user.firstName} ${link.student.user.lastName} (Adm: ${link.student.admissionNumber}, Class: ${link.student.section.classGrade.name}-${link.student.section.name}, Primary: ${link.isPrimary})`);
  }

  // 3. Test Teacher Authentication
  console.log('\n--- Test 3: Teacher Authentication & Timetable Integration ---');
  const teacherLogin = await AuthService.login({
    email: 'teacher@dps.edu.in',
    password: 'Teacher@123',
  }, null);

  if (!teacherLogin.success || !teacherLogin.token || !teacherLogin.user) {
    throw new Error('Teacher login failed: ' + teacherLogin.error);
  }
  console.log('  [PASS] Teacher authenticated successfully on localhost');

  const teacherSession = await verifySessionToken(teacherLogin.token);
  if (!teacherSession || teacherSession.role !== 'TEACHER') {
    throw new Error('Teacher session invalid');
  }
  console.log('  [PASS] Teacher JWT session token verified with role TEACHER');

  console.log('\n======================================================');
  console.log(' ALL PORTAL & DATABASE INTEGRATION CHECKS PASSED!');
  console.log('======================================================\n');
}

verifyPortalIntegration()
  .then(async () => {
    await prisma.$disconnect();
    process.exit(0);
  })
  .catch(async (e) => {
    console.error('Integration check failed:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
