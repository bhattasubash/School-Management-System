import { redirect } from 'next/navigation';
import { prisma } from '@/lib/db';
import { getSessionFromCookies } from '@/lib/session';
import FeeCounterClient, {
  InvoiceItem,
  PaymentItem,
  StudentLookupItem,
} from '@/components/admin/FeeCounterClient';
import { calculateLateFineForInvoice } from '@/services/fee-engine.service';

export const dynamic = 'force-dynamic';

export default async function AdminFeesPage() {
  const session = await getSessionFromCookies();
  if (
    !session ||
    (session.role !== 'ADMIN' && session.role !== 'SUPER_ADMIN' && session.role !== 'ACCOUNTANT')
  ) {
    redirect('/unauthorized');
  }

  const tenantId = session.tenantId;
  if (!tenantId) {
    redirect('/unauthorized');
  }

  const now = new Date();

  // Parallel database fetch for high performance
  const [invoicesRaw, paymentsRaw, studentsRaw, academicYears, classGrades, feeTerms] =
    await Promise.all([
      prisma.feeInvoice.findMany({
        where: { tenantId },
        include: {
          student: {
            include: {
              user: true,
              section: {
                include: { classGrade: true },
              },
            },
          },
          feeTerm: true,
          items: {
            include: { feeCategory: true },
          },
        },
        orderBy: { generatedAt: 'desc' },
      }),

      prisma.feePayment.findMany({
        where: { tenantId },
        include: {
          feeInvoice: {
            include: {
              student: {
                include: {
                  user: true,
                  section: {
                    include: { classGrade: true },
                  },
                },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: 100,
      }),

      prisma.studentProfile.findMany({
        where: { tenantId, user: { isActive: true } },
        include: {
          user: true,
          section: {
            include: { classGrade: true },
          },
          parents: {
            include: {
              parent: {
                include: { user: true },
              },
            },
          },
        },
        orderBy: { admissionNumber: 'asc' },
      }),

      prisma.academicYear.findMany({
        where: { tenantId },
        select: { id: true, name: true },
        orderBy: { startDate: 'desc' },
      }),

      prisma.classGrade.findMany({
        where: { tenantId },
        select: { id: true, name: true },
        orderBy: { numericOrder: 'asc' },
      }),

      prisma.feeTerm.findMany({
        where: { tenantId },
        select: { id: true, name: true, termNumber: true, academicYearId: true },
        orderBy: { termNumber: 'asc' },
      }),
    ]);

  // Resolve collector names for payment receipts
  const collectorIds = Array.from(
    new Set(paymentsRaw.map((p) => p.collectedById).filter(Boolean) as string[])
  );
  const collectors =
    collectorIds.length > 0
      ? await prisma.user.findMany({
          where: { id: { in: collectorIds } },
          select: { id: true, firstName: true, lastName: true },
        })
      : [];
  const collectorMap = new Map(
    collectors.map((c) => [c.id, `${c.firstName} ${c.lastName}`])
  );

  // Map invoices into clean serializable objects
  const invoices: InvoiceItem[] = invoicesRaw.map((inv) => {
    const isDuePassed = new Date(inv.dueDate) < now;
    const isOverdue = isDuePassed && Number(inv.balanceAmount) > 0;
    const lateCalc = calculateLateFineForInvoice(inv, now);

    return {
      id: inv.id,
      invoiceNumber: inv.invoiceNumber,
      studentId: inv.studentId,
      studentName: `${inv.student.user.firstName} ${inv.student.user.lastName}`,
      admissionNumber: inv.student.admissionNumber,
      className: `${inv.student.section.classGrade.name}-${inv.student.section.name}`,
      termName: inv.feeTerm?.name || 'General Term',
      dueDate: inv.dueDate.toISOString(),
      totalAmount: Number(inv.totalAmount),
      paidAmount: Number(inv.paidAmount),
      balanceAmount: Number(inv.balanceAmount),
      lateFee: Number(inv.lateFee) || lateCalc.lateFee,
      status: inv.status as any,
      isOverdue,
      items: inv.items.map((it) => ({
        category: it.feeCategory.name,
        amount: Number(it.amount),
        description: it.description || it.feeCategory.name,
      })),
    };
  });

  // Map payments into clean serializable objects
  const payments: PaymentItem[] = paymentsRaw.map((p) => {
    const student = p.feeInvoice.student;
    return {
      id: p.id,
      receiptNumber: p.receiptNumber,
      invoiceNumber: p.feeInvoice.invoiceNumber,
      studentName: `${student.user.firstName} ${student.user.lastName}`,
      admissionNumber: student.admissionNumber,
      className: `${student.section.classGrade.name}-${student.section.name}`,
      amount: Number(p.amount),
      paymentMethod: p.paymentMethod,
      remarks: p.remarks,
      date: p.createdAt.toISOString(),
      collectorName: p.collectedById ? collectorMap.get(p.collectedById) || 'Admin' : 'System',
    };
  });

  // Map students for autocomplete search
  const studentsList: StudentLookupItem[] = studentsRaw.map((s) => {
    const firstParent = s.parents[0]?.parent;
    return {
      id: s.id,
      name: `${s.user.firstName} ${s.user.lastName}`,
      admissionNumber: s.admissionNumber,
      className: `${s.section.classGrade.name}-${s.section.name}`,
      parentName: firstParent ? `${firstParent.user.firstName} ${firstParent.user.lastName}` : null,
      parentPhone: firstParent?.user.phone || null,
    };
  });

  // Calculate metrics
  const totalInvoiced = invoices.reduce((sum, inv) => sum + inv.totalAmount, 0);
  const totalCollected = payments.reduce((sum, p) => sum + p.amount, 0);
  const totalPending = invoices.reduce((sum, inv) => sum + inv.balanceAmount, 0);
  const overdueCount = invoices.filter((inv) => inv.isOverdue).length;

  return (
    <FeeCounterClient
      metrics={{
        totalInvoiced,
        totalCollected,
        totalPending,
        overdueCount,
      }}
      invoices={invoices}
      payments={payments}
      students={studentsList}
      academicYears={academicYears}
      classGrades={classGrades}
      feeTerms={feeTerms}
    />
  );
}
