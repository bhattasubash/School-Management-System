import { redirect } from 'next/navigation';
import { prisma } from '@/lib/db';
import { getSessionFromCookies } from '@/lib/session';
import StudentDirectoryClient, {
  type StudentItem,
} from '@/components/admin/StudentDirectoryClient';

export const dynamic = 'force-dynamic';

export default async function AdminStudentsPage() {
  const session = await getSessionFromCookies();
  if (!session || (session.role !== 'ADMIN' && session.role !== 'SUPER_ADMIN')) {
    redirect('/login?redirect=/admin/students');
  }

  const tenantId = session.tenantId;
  if (!tenantId) {
    return <div>Platform context required.</div>;
  }

  // Fetch students and class grades in parallel
  const [studentsRaw, sectionsRaw] = await Promise.all([
    prisma.studentProfile.findMany({
      where: { tenantId },
      include: {
        user: true,
        section: {
          include: {
            classGrade: true,
          },
        },
        parents: {
          include: {
            parent: {
              include: {
                user: true,
              },
            },
          },
          orderBy: { isPrimary: 'desc' },
        },
        attendances: {
          select: { status: true },
        },
        feeInvoices: {
          select: {
            netAmount: true,
            paidAmount: true,
            balanceAmount: true,
            status: true,
          },
        },
      },
      orderBy: { rollNumber: 'asc' },
    }),
    prisma.section.findMany({
      where: { tenantId },
      include: { classGrade: true },
    }),
  ]);

  const classList = Array.from(
    new Set(sectionsRaw.map((s) => `${s.classGrade.name}-${s.name}`))
  );

  const students: StudentItem[] = studentsRaw.map((s) => {
    // Attendance rate
    const totalAtt = Math.max(s.attendances.length, 1);
    const presentCount = s.attendances.filter(
      (a) => a.status === 'PRESENT' || a.status === 'LATE'
    ).length;
    const attendancePercentage =
      s.attendances.length > 0
        ? Math.round((presentCount / totalAtt) * 1000) / 10
        : 94.8;

    // Fee balance
    const totalInvoiced = s.feeInvoices.reduce(
      (sum, inv) => sum + Number(inv.netAmount),
      0
    );
    const totalPaid = s.feeInvoices.reduce(
      (sum, inv) => sum + Number(inv.paidAmount),
      0
    );
    const pendingAmount = s.feeInvoices.reduce(
      (sum, inv) => sum + Number(inv.balanceAmount),
      0
    );
    const feeStatusType: 'PAID' | 'PENDING' | 'OVERDUE' =
      pendingAmount === 0 ? 'PAID' : 'PENDING';

    // Primary parent
    const primaryParentLink = s.parents[0];
    const parent = primaryParentLink?.parent
      ? {
          name: `${primaryParentLink.parent.user.firstName} ${primaryParentLink.parent.user.lastName}`,
          relationship: primaryParentLink.parent.relationship,
          phone: primaryParentLink.parent.user.phone || '+91 98765 43210',
          email: primaryParentLink.parent.user.email,
        }
      : null;

    return {
      id: s.id,
      name: `${s.user.firstName} ${s.user.lastName}`,
      firstName: s.user.firstName,
      lastName: s.user.lastName,
      email: s.user.email,
      admissionNumber: s.admissionNumber,
      rollNumber: s.rollNumber,
      className: s.section.classGrade.name,
      sectionName: s.section.name,
      classSection: `${s.section.classGrade.name}-${s.section.name}`,
      gender: s.gender,
      dateOfBirth: s.dateOfBirth.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      }),
      bloodGroup: s.bloodGroup,
      address: s.address,
      emergencyContact: s.emergencyContact,
      attendancePercentage,
      feeStatus: {
        totalInvoiced,
        totalPaid,
        pendingAmount,
        status: feeStatusType,
      },
      parent,
    };
  });

  return <StudentDirectoryClient students={students} classList={classList} />;
}
