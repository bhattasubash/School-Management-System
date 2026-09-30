import { redirect } from 'next/navigation';
import { prisma } from '@/lib/db';
import { getSessionFromCookies } from '@/lib/session';
import AdminDashboardClient from '@/components/admin/AdminDashboardClient';

export const dynamic = 'force-dynamic';

export default async function AdminDashboardPage() {
  const session = await getSessionFromCookies();
  if (!session || (session.role !== 'ADMIN' && session.role !== 'SUPER_ADMIN')) {
    redirect('/login?redirect=/admin');
  }

  const tenantId = session.tenantId;
  if (!tenantId) {
    return (
      <div className="p-8 text-center bg-white rounded-xl border border-slate-200">
        <h2 className="text-base font-bold text-slate-900">Platform Super Admin Context</h2>
        <p className="text-xs text-slate-500 mt-1">
          Please select a specific school tenant from the Super Admin Command Center.
        </p>
      </div>
    );
  }

  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

  // Run queries in parallel for high performance
  const [
    tenant,
    totalStudents,
    totalTeachers,
    todayAttendanceRecords,
    allAttendanceRecords,
    feeInvoices,
    activeSubstitutions,
    notices,
    auditLogs,
    sections,
    pendingAdmissionsCount,
  ] = await Promise.all([
    prisma.tenant.findUnique({
      where: { id: tenantId },
      select: { name: true, board: true },
    }),
    prisma.studentProfile.count({ where: { tenantId } }),
    prisma.teacherProfile.count({ where: { tenantId } }),
    prisma.studentAttendance.findMany({
      where: {
        tenantId,
        date: { gte: todayStart, lte: todayEnd },
      },
      select: { status: true, sectionId: true },
    }),
    prisma.studentAttendance.findMany({
      where: { tenantId },
      select: { status: true },
      take: 200,
    }),
    prisma.feeInvoice.findMany({
      where: { tenantId },
      select: { netAmount: true, paidAmount: true, balanceAmount: true, status: true, dueDate: true },
    }),
    prisma.teacherSubstitution.count({
      where: { tenantId, status: 'ASSIGNED', date: { gte: todayStart, lte: todayEnd } },
    }),
    prisma.notice.findMany({
      where: { tenantId },
      orderBy: { publishedAt: 'desc' },
      take: 6,
    }),
    prisma.auditLog.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'desc' },
      take: 8,
      include: {
        user: {
          select: { firstName: true, lastName: true },
        },
      },
    }),
    prisma.section.findMany({
      where: { tenantId },
      include: {
        classGrade: true,
        students: { select: { id: true } },
      },
    }),
    prisma.admissionApplication.count({
      where: { tenantId, status: 'SUBMITTED' },
    }),
  ]);

  // Resolve Class Teachers
  const teacherIds = sections
    .map((s) => s.classTeacherId)
    .filter((id): id is string => Boolean(id));

  const classTeachers =
    teacherIds.length > 0
      ? await prisma.teacherProfile.findMany({
          where: { id: { in: teacherIds } },
          include: {
            user: { select: { firstName: true, lastName: true } },
          },
        })
      : [];

  const teacherMap = new Map(classTeachers.map((t) => [t.id, t]));

  // Attendance metrics calculation (Today's actual attendance)
  const submittedSectionIds = new Set(todayAttendanceRecords.map((r) => r.sectionId));
  const unsubmittedSections = sections.filter((s) => !submittedSectionIds.has(s.id));
  const totalSectionsCount = sections.length;
  const submittedSectionsCount = totalSectionsCount - unsubmittedSections.length;

  const todayPresentCount = todayAttendanceRecords.filter((r) => r.status === 'PRESENT').length;
  const todayTotalAttendance = todayAttendanceRecords.length;
  const todayAttendanceRate =
    todayTotalAttendance > 0
      ? Math.round((todayPresentCount / todayTotalAttendance) * 100)
      : allAttendanceRecords.length > 0
      ? Math.round((allAttendanceRecords.filter((r) => r.status === 'PRESENT').length / allAttendanceRecords.length) * 100)
      : 100;

  // Fee metrics calculation
  const totalFeeInvoiced = feeInvoices.reduce((sum, inv) => sum + Number(inv.netAmount), 0);
  const totalFeePaid = feeInvoices.reduce((sum, inv) => sum + Number(inv.paidAmount), 0);
  const totalFeePending = feeInvoices.reduce((sum, inv) => sum + Number(inv.balanceAmount), 0);
  const collectionPercentage =
    totalFeeInvoiced > 0 ? Math.round((totalFeePaid / totalFeeInvoiced) * 100) : 0;

  // Overdue fees
  const overdueInvoices = feeInvoices.filter(
    (inv) => Number(inv.balanceAmount) > 0 && inv.dueDate && new Date(inv.dueDate) < todayStart
  );
  const totalOverdueAmount = overdueInvoices.reduce((sum, inv) => sum + Number(inv.balanceAmount), 0);

  const formattedNotices = notices.map((n) => ({
    id: n.id,
    title: n.title,
    content: n.content,
    date: n.publishedAt.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }),
    priority: n.priority,
    targetAudience: n.targetAudience,
  }));

  // Filter out routine USER_LOGIN spam from primary audit view
  const sensitiveAudit = auditLogs.filter((l) => l.action !== 'USER_LOGIN');
  const logsToRender = sensitiveAudit.length > 0 ? sensitiveAudit : auditLogs.slice(0, 4);

  const formattedAuditLogs = logsToRender.map((log) => {
    let cleanAction = log.action;
    if (log.action === 'USER_LOGIN') cleanAction = 'User signed in';
    else if (log.action === 'CREATE_NOTICE') cleanAction = 'Circular published';
    else if (log.action === 'MARK_ATTENDANCE') cleanAction = 'Attendance marked';
    else if (log.action === 'RECORD_FEE_PAYMENT') cleanAction = 'Fee receipt recorded';

    // Never show ::1
    const safeIp = log.ipAddress && !log.ipAddress.includes('::1') && !log.ipAddress.includes('127.0.0.1')
      ? log.ipAddress
      : null;

    return {
      id: log.id,
      action: cleanAction,
      entityType: log.entityType,
      timestamp: log.createdAt.toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
      }),
      ipAddress: safeIp,
      userName: log.user ? `${log.user.firstName} ${log.user.lastName}` : 'Administrator',
    };
  });

  const formattedSections = sections.map((sec) => {
    const teacher = sec.classTeacherId ? teacherMap.get(sec.classTeacherId) : null;
    const isSubmittedToday = submittedSectionIds.has(sec.id);

    return {
      id: sec.id,
      className: sec.classGrade.name,
      sectionName: sec.name,
      studentCount: sec.students.length,
      classTeacherName: teacher?.user
        ? `${teacher.user.firstName} ${teacher.user.lastName}`
        : 'Unassigned',
      isSubmittedToday,
    };
  });

  return (
    <AdminDashboardClient
      schoolName={tenant?.name || 'Delhi Public School'}
      board={tenant?.board || 'CBSE'}
      metrics={{
        totalStudents,
        totalTeachers,
        attendanceRate: todayAttendanceRate,
        submittedSectionsCount,
        totalSectionsCount,
        presentCount: todayPresentCount,
        totalFeeCollected: totalFeePaid,
        totalFeePending,
        totalFeeInvoiced,
        totalOverdueAmount,
        overdueCount: overdueInvoices.length,
        collectionPercentage,
        totalNotices: notices.length,
        activeSubstitutions,
        pendingAdmissionsCount,
      }}
      unsubmittedSections={unsubmittedSections.map((s) => ({
        id: s.id,
        name: `${s.classGrade.name}-${s.name}`,
      }))}
      recentNotices={formattedNotices}
      recentAuditLogs={formattedAuditLogs}
      classSections={formattedSections}
    />
  );
}
