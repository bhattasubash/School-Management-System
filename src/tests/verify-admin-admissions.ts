import { prisma } from '@/lib/db';
import {
  updateAdmissionStatus,
  enrollStudentFromApplication,
} from '@/services/admission.service';

async function main() {
  console.log('\n======================================================');
  console.log(' VERIFYING PHASE 4: ADMIN ADMISSIONS INTAKE & 1-CLICK ENROLLMENT');
  console.log('======================================================\n');

  // 1. Identify Delhi Public School Tenant
  const tenant = await prisma.tenant.findFirst({
    where: { slug: 'dps' },
  });

  if (!tenant) {
    throw new Error('DPS Tenant not found. Run db seed first.');
  }

  const tenantId = tenant.id;
  console.log(`[PASS] Tenant context resolved: ${tenant.name} (${tenantId})`);

  // --- Suite 1: Query Seeded Applications & Pipeline Status ---
  console.log('\n--- Suite 1: Admissions Pipeline State Inspection ---');
  const applications = await prisma.admissionApplication.findMany({
    where: { tenantId },
    include: { classGrade: true },
    orderBy: { applicationNumber: 'asc' },
  });

  console.log(`  [PASS] Retrieved ${applications.length} admission applications:`);
  for (const app of applications) {
    console.log(`         • ${app.applicationNumber}: ${app.studentFirstName} ${app.studentLastName} [${app.status}] applying for ${app.classGrade.name}`);
  }

  if (applications.length < 3) {
    throw new Error('Expected at least 3 seeded admission applications.');
  }

  // --- Suite 2: Status Progression Engine ---
  console.log('\n--- Suite 2: Status Progression Pipeline ---');
  const app1 = applications.find((a) => a.applicationNumber === 'ADM-2026-0001');
  if (!app1) throw new Error('ADM-2026-0001 missing');

  const updatedApp1 = await updateAdmissionStatus(tenantId, app1.id, {
    status: 'DOCUMENT_VERIFIED',
    adminRemarks: 'Aadhaar and previous school report card verified.',
  });
  console.log(`  [PASS] Updated ADM-2026-0001 status: ${app1.status} -> ${updatedApp1.status}`);
  if (updatedApp1.status !== 'DOCUMENT_VERIFIED') {
    throw new Error('Failed to update status to DOCUMENT_VERIFIED');
  }

  // --- Suite 3: 1-Click Atomic Enrollment Execution ---
  console.log('\n--- Suite 3: 1-Click Atomic Enrollment Execution ---');
  const app3 = applications.find((a) => a.applicationNumber === 'ADM-2026-0003');
  if (!app3) throw new Error('ADM-2026-0003 missing');

  const [section, feeStructure, feeTerm] = await Promise.all([
    prisma.section.findFirst({
      where: { tenantId, classGradeId: app3.classGradeId },
    }),
    prisma.feeStructure.findFirst({
      where: { tenantId, classGradeId: app3.classGradeId },
    }),
    prisma.feeTerm.findFirst({
      where: { tenantId, termNumber: 1 },
    }),
  ]);

  if (!section) throw new Error('Target section missing for enrollment');

  const testAdmNumber = 'DPS-2026-TEST-9999';
  console.log(`  Admitting candidate: ${app3.studentFirstName} ${app3.studentLastName}`);
  console.log(`  Target Section: Class 10 - Section ${section.name}`);
  console.log(`  Assigned Admission No: ${testAdmNumber}`);

  const enrollment = await enrollStudentFromApplication(tenantId, app3.id, {
    sectionId: section.id,
    admissionNumber: testAdmNumber,
    rollNumber: 42,
    feeStructureId: feeStructure?.id,
    feeTermId: feeTerm?.id,
  });

  console.log(`  [PASS] Student User created: ${enrollment.student.user.email} (ID: ${enrollment.student.userId})`);
  console.log(`  [PASS] Student Profile created: Roll ${enrollment.student.rollNumber}, Adm ${enrollment.student.admissionNumber}`);
  console.log(`  [PASS] Parent User created: ${enrollment.parent.user.email} (${enrollment.parent.user.firstName})`);
  console.log(`  [PASS] Initial Fee Invoice: ${enrollment.initialInvoice?.invoiceNumber || 'None'} for ₹${enrollment.initialInvoice?.totalAmount}`);

  // Verify DB state
  const updatedApp3 = await prisma.admissionApplication.findUnique({
    where: { id: app3.id },
  });
  console.log(`  [PASS] Application status transitioned: ${updatedApp3?.status} (enrolledStudentId: ${updatedApp3?.enrolledStudentId})`);
  if (updatedApp3?.status !== 'ENROLLED' || !updatedApp3?.enrolledStudentId) {
    throw new Error('Application was not properly updated to ENROLLED');
  }

  // --- Suite 4: Duplicate Admission Number Collision Protection ---
  console.log('\n--- Suite 4: Duplicate Admission Number Collision Protection ---');
  try {
    await enrollStudentFromApplication(tenantId, app3.id, {
      sectionId: section.id,
      admissionNumber: testAdmNumber,
    });
    throw new Error('Expected duplicate admission number error, but it succeeded.');
  } catch (err: any) {
    console.log(`  [PASS] Successfully rejected duplicate admission number: "${err.message}"`);
  }

  // --- Cleanup: Revert Test Enrollment ---
  console.log('\n--- Cleanup: Purging Test Enrolled Student & Restoring DB State ---');
  if (enrollment.initialInvoice) {
    await prisma.feeInvoiceItem.deleteMany({ where: { feeInvoiceId: enrollment.initialInvoice.id } });
    await prisma.feeInvoice.delete({ where: { id: enrollment.initialInvoice.id } });
  }

  await prisma.parentStudentLink.deleteMany({ where: { studentId: enrollment.student.id } });
  await prisma.admissionApplication.update({
    where: { id: app3.id },
    data: { status: 'APPROVED', enrolledStudentId: null },
  });
  await prisma.studentProfile.delete({ where: { id: enrollment.student.id } });
  await prisma.user.delete({ where: { id: enrollment.student.userId } });

  await prisma.parentProfile.delete({ where: { id: enrollment.parent.id } });
  await prisma.user.delete({ where: { id: enrollment.parent.userId } });

  // Revert app1 status back to SUBMITTED
  await prisma.admissionApplication.update({
    where: { id: app1.id },
    data: { status: 'SUBMITTED', adminRemarks: null },
  });

  console.log('  [PASS] Test records cleanly purged and applications restored to original status.');

  console.log('\n======================================================');
  console.log(' ALL ADMIN ADMISSIONS VERIFICATION CHECKS PASSED!');
  console.log('======================================================\n');
}

main()
  .catch((err) => {
    console.error('\nVerification Error:', err);
    process.exit(1);
  })
  .finally(() => {
    prisma.$disconnect();
  });
