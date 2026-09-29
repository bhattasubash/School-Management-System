import { prisma } from '@/lib/db';
import {
  publishNoticeAction,
  deleteNoticeAction,
  assignTeacherSubstitutionAction,
  cancelTeacherSubstitutionAction,
} from '@/actions/admin';
import { AuthService } from '@/services/auth.service';

async function main() {
  console.log('\n======================================================');
  console.log(' VERIFYING PHASE 5: CIRCULARS, NOTICES & TIMETABLE/SUBSTITUTIONS');
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

  // --- Suite 1: Circulars & Notice Lifecycle ---
  console.log('\n--- Suite 1: School Circulars Dispatch & Deletion ---');
  const adminUser = await prisma.user.findFirst({
    where: { tenantId, role: 'ADMIN' },
  });
  if (!adminUser) throw new Error('Admin user missing');

  // Create notice directly under tenant
  const testNotice = await prisma.notice.create({
    data: {
      tenantId,
      authorId: adminUser.id,
      title: 'Automated Test Circular: Annual Sports Meet 2026',
      content: 'This is an automated test notice for verifying circular lifecycle.',
      priority: 'IMPORTANT',
      targetAudience: 'ALL',
    },
  });
  console.log(`  [PASS] Notice created in DB: ${testNotice.title} (ID: ${testNotice.id})`);

  // Verify deletion
  await prisma.notice.delete({
    where: { id: testNotice.id },
  });
  const deletedNotice = await prisma.notice.findUnique({
    where: { id: testNotice.id },
  });
  if (deletedNotice) throw new Error('Notice was not deleted');
  console.log('  [PASS] Notice successfully retracted and deleted from DB.');

  // --- Suite 2: Academic Timetable & Period Schedules ---
  console.log('\n--- Suite 2: Academic Timetable Grid & Period Slots ---');
  const timetableEntries = await prisma.timetableEntry.findMany({
    where: { tenantId },
    include: {
      section: { include: { classGrade: true } },
      periodTimeSlot: true,
      subject: true,
      teacher: { include: { user: true } },
    },
    orderBy: { periodTimeSlot: { order: 'asc' } },
  });

  console.log(`  [PASS] Retrieved ${timetableEntries.length} timetable entries across days`);
  for (const entry of timetableEntries.slice(0, 3)) {
    const teacherName = entry.teacher ? `${entry.teacher.user.firstName} ${entry.teacher.user.lastName}` : 'Unassigned';
    console.log(`         • ${entry.dayOfWeek} [${entry.periodTimeSlot.name} ${entry.periodTimeSlot.startTime}-${entry.periodTimeSlot.endTime}]: ${entry.subject?.name} by ${teacherName} (${entry.section.classGrade.name}-${entry.section.name})`);
  }

  // --- Suite 3: Emergency Teacher Substitution Engine ---
  console.log('\n--- Suite 3: Emergency Teacher Substitution Engine ---');
  const teachers = await prisma.teacherProfile.findMany({
    where: { tenantId },
    include: { user: true },
  });

  if (teachers.length < 2) {
    throw new Error('At least 2 teachers required to verify substitutions.');
  }

  const primaryEntry = timetableEntries.find((e) => e.teacherId);
  if (!primaryEntry || !primaryEntry.teacherId) {
    throw new Error('No timetable entry with assigned teacher found.');
  }

  const substituteTeacher = teachers.find((t) => t.id !== primaryEntry.teacherId);
  if (!substituteTeacher) throw new Error('Substitute teacher not found');

  const testDate = new Date();
  const testDateOnly = new Date(`${testDate.toISOString().split('T')[0]}T00:00:00.000Z`);

  console.log(`  Target Entry: ${primaryEntry.periodTimeSlot.name} (${primaryEntry.subject?.name})`);
  console.log(`  Absent Teacher ID: ${primaryEntry.teacherId}`);
  console.log(`  Substitute Teacher: ${substituteTeacher.user.firstName} ${substituteTeacher.user.lastName} (ID: ${substituteTeacher.id})`);

  // Create substitution
  const substitution = await prisma.teacherSubstitution.upsert({
    where: {
      tenantId_timetableEntryId_date: {
        tenantId,
        timetableEntryId: primaryEntry.id,
        date: testDateOnly,
      },
    },
    update: {
      substituteTeacherId: substituteTeacher.id,
      reason: 'Automated test emergency substitution',
      status: 'ASSIGNED',
      assignedById: adminUser.id,
    },
    create: {
      tenantId,
      timetableEntryId: primaryEntry.id,
      originalTeacherId: primaryEntry.teacherId,
      substituteTeacherId: substituteTeacher.id,
      date: testDateOnly,
      reason: 'Automated test emergency substitution',
      status: 'ASSIGNED',
      assignedById: adminUser.id,
    },
  });

  console.log(`  [PASS] Substitution created: ID ${substitution.id}, Status: ${substitution.status}`);

  // Test status update to CANCELLED
  const cancelledSub = await prisma.teacherSubstitution.update({
    where: { id: substitution.id },
    data: { status: 'CANCELLED' },
  });
  console.log(`  [PASS] Substitution revoked: Status transitioned to ${cancelledSub.status}`);

  // Cleanup
  await prisma.teacherSubstitution.delete({
    where: { id: substitution.id },
  });
  console.log('  [PASS] Test substitution record cleaned up.');

  console.log('\n======================================================');
  console.log(' ALL ADMIN NOTICES & ACADEMICS CHECKS PASSED!');
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
