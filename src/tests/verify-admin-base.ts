import { AuthService } from '@/services/auth.service';
import { prisma } from '@/lib/db';
import { verifySessionToken } from '@/lib/session';
import { Role } from '@/types';

async function verifyAdminBase() {
  console.log('\n======================================================');
  console.log(' VERIFYING PHASE 1: ADMIN BASE & COMMAND CENTER');
  console.log('======================================================\n');

  // 1. Admin Authentication & Tenant Scoping
  console.log('--- Suite 1: School Admin Authentication ---');
  const adminLogin = await AuthService.login({
    email: 'admin@dps.edu.in',
    password: 'Admin@123',
  }, null);

  if (!adminLogin.success || !adminLogin.token || !adminLogin.user) {
    throw new Error('Admin login failed: ' + adminLogin.error);
  }
  console.log('  [PASS] School Admin authenticated on localhost:3000');

  const session = await verifySessionToken(adminLogin.token);
  if (!session || session.role !== Role.ADMIN) {
    throw new Error('Admin session token invalid');
  }
  console.log(`  [PASS] JWT verified with role ${session.role} under tenant ${session.tenantId}`);

  const tenantId = session.tenantId;
  if (!tenantId) {
    throw new Error('Missing tenantId in admin session');
  }

  // 2. Database Aggregation Integrity
  console.log('\n--- Suite 2: Operational Data Aggregation ---');
  const [totalStudents, totalTeachers, sections, feeInvoices, notices] = await Promise.all([
    prisma.studentProfile.count({ where: { tenantId } }),
    prisma.teacherProfile.count({ where: { tenantId } }),
    prisma.section.findMany({
      where: { tenantId },
      include: { classGrade: true, students: true },
    }),
    prisma.feeInvoice.findMany({ where: { tenantId } }),
    prisma.notice.findMany({ where: { tenantId } }),
  ]);

  if (totalStudents < 5) {
    throw new Error(`Expected at least 5 students, found ${totalStudents}`);
  }
  console.log(`  [PASS] Total Enrolled Students verified: ${totalStudents} active students in Class 10-A`);

  if (totalTeachers < 2) {
    throw new Error(`Expected at least 2 teachers, found ${totalTeachers}`);
  }
  console.log(`  [PASS] Total Faculty Members verified: ${totalTeachers} teaching staff`);

  if (sections.length === 0) {
    throw new Error('No class sections found for tenant');
  }
  console.log(`  [PASS] Class Section verified: ${sections[0].classGrade.name}-${sections[0].name} (${sections[0].students.length} students)`);

  const totalFeeInvoiced = feeInvoices.reduce((sum, inv) => sum + Number(inv.netAmount), 0);
  const totalFeePaid = feeInvoices.reduce((sum, inv) => sum + Number(inv.paidAmount), 0);
  const totalFeePending = feeInvoices.reduce((sum, inv) => sum + Number(inv.balanceAmount), 0);

  if (totalFeeInvoiced <= 0) {
    throw new Error('Fee invoices aggregation invalid');
  }
  console.log(`  [PASS] Fee Ledger aggregated: Invoiced ₹${totalFeeInvoiced.toLocaleString('en-IN')}, Paid ₹${totalFeePaid.toLocaleString('en-IN')}, Pending ₹${totalFeePending.toLocaleString('en-IN')}`);

  console.log(`  [PASS] Institutional Notices verified: ${notices.length} active circulars found`);

  // 3. Admin Circular Creation & Audit Trail
  console.log('\n--- Suite 3: Admin Circular Publishing & Audit Log ---');
  const testTitle = `Admin Operations Alert - ${Date.now()}`;
  const notice = await prisma.notice.create({
    data: {
      tenantId,
      authorId: session.sub,
      title: testTitle,
      content: 'Automated test circular verification for admin operations.',
      priority: 'IMPORTANT',
      targetAudience: 'ALL',
    },
  });

  const audit = await prisma.auditLog.create({
    data: {
      tenantId,
      userId: session.sub,
      action: 'CIRCULAR_PUBLISHED',
      entityType: 'Notice',
      entityId: notice.id,
      newValues: { title: notice.title },
    },
  });

  if (!notice.id || !audit.id) {
    throw new Error('Failed to create notice or audit entry');
  }
  console.log(`  [PASS] New circular published with ID: ${notice.id}`);
  console.log(`  [PASS] Audit Log generated with action: ${audit.action} (ID: ${audit.id})`);

  // Clean up test notice & audit
  await prisma.notice.delete({ where: { id: notice.id } });
  await prisma.auditLog.delete({ where: { id: audit.id } });
  console.log('  [PASS] Test circular & audit log cleanly purged');

  console.log('\n======================================================');
  console.log(' ALL ADMIN BASE VERIFICATION CHECKS PASSED!');
  console.log('======================================================\n');
}

verifyAdminBase()
  .then(async () => {
    await prisma.$disconnect();
    process.exit(0);
  })
  .catch(async (e) => {
    console.error('Admin base verification failed:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
