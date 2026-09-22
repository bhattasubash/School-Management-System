import { prisma } from '@/lib/db';
import {
  CreateFeeTermSchema,
  CreateFeeTermInput,
  CollectFeePaymentSchema,
  CollectFeePaymentInput,
  GenerateQuarterlyInvoicesSchema,
  GenerateQuarterlyInvoicesInput,
} from '@/lib/validations/fee-term';
import { FeeTerm, FeeInvoice, FeePayment, Prisma } from '@prisma/client';

export interface LateFeeCalculationResult {
  isOverdue: boolean;
  daysPastDue: number;
  gracePeriodExpired: boolean;
  lateFee: number;
}

/**
 * Creates an academic fee term (e.g. Q1, Q2, Q3, Q4) with Indian school late-fee rules.
 */
export async function createFeeTerm(
  tenantId: string,
  rawInput: CreateFeeTermInput
): Promise<FeeTerm> {
  const input = CreateFeeTermSchema.parse(rawInput);

  return prisma.feeTerm.create({
    data: {
      tenantId,
      academicYearId: input.academicYearId,
      name: input.name,
      termNumber: input.termNumber,
      startDate: new Date(input.startDate),
      endDate: new Date(input.endDate),
      dueDate: new Date(input.dueDate),
      lateFeeGraceDays: input.lateFeeGraceDays,
      lateFeeAmount: input.lateFeeAmount,
      lateFeePerDay: input.lateFeePerDay,
    },
  });
}

/**
 * Calculates whether an invoice has breached its grace period and computes the exact late fine.
 * Follows the Indian school convention: e.g. Due on 10th + 5 days grace period = Late fine from 16th.
 */
export function calculateLateFineForInvoice(
  invoice: {
    dueDate: Date;
    feeTerm?: {
      lateFeeGraceDays: number;
      lateFeeAmount: Prisma.Decimal | number;
      lateFeePerDay: boolean;
    } | null;
  },
  asOfDate: Date = new Date()
): LateFeeCalculationResult {
  const dueTime = new Date(invoice.dueDate).getTime();
  const currentTime = asOfDate.getTime();
  const diffDays = Math.floor((currentTime - dueTime) / (1000 * 60 * 60 * 24));

  if (diffDays <= 0) {
    return {
      isOverdue: false,
      daysPastDue: 0,
      gracePeriodExpired: false,
      lateFee: 0,
    };
  }

  const graceDays = invoice.feeTerm?.lateFeeGraceDays ?? 10;
  const rawLateFeeAmount = invoice.feeTerm?.lateFeeAmount ?? 50;
  const lateFeeAmount = Number(rawLateFeeAmount);
  const isPerDay = invoice.feeTerm?.lateFeePerDay ?? false;

  if (diffDays <= graceDays) {
    return {
      isOverdue: true,
      daysPastDue: diffDays,
      gracePeriodExpired: false,
      lateFee: 0,
    };
  }

  // Grace period expired: apply fine
  const overdueDaysAfterGrace = diffDays - graceDays;
  const lateFee = isPerDay ? overdueDaysAfterGrace * lateFeeAmount : lateFeeAmount;

  return {
    isOverdue: true,
    daysPastDue: diffDays,
    gracePeriodExpired: true,
    lateFee,
  };
}

/**
 * Bulk generates quarterly fee invoices for all active students in a Class Grade.
 * Bundles all applicable FeeCategory heads into itemized invoice lines.
 */
export async function generateQuarterlyInvoicesForClass(
  tenantId: string,
  rawInput: GenerateQuarterlyInvoicesInput
): Promise<{ count: number; invoices: FeeInvoice[] }> {
  const input = GenerateQuarterlyInvoicesSchema.parse(rawInput);

  return prisma.$transaction(async (tx) => {
    // 1. Fetch fee term
    const feeTerm = await tx.feeTerm.findFirst({
      where: { id: input.feeTermId, tenantId, academicYearId: input.academicYearId },
    });

    if (!feeTerm) {
      throw new Error(`Fee term ${input.feeTermId} not found for this academic year.`);
    }

    // 2. Fetch fee structures defined for this class grade
    const feeStructures = await tx.feeStructure.findMany({
      where: {
        tenantId,
        academicYearId: input.academicYearId,
        classGradeId: input.classGradeId,
      },
      include: { feeCategory: true },
    });

    if (feeStructures.length === 0) {
      throw new Error(`No fee structures configured for this class grade.`);
    }

    // 3. Fetch all active students in this class grade
    const students = await tx.studentProfile.findMany({
      where: {
        tenantId,
        section: { classGradeId: input.classGradeId },
        user: { isActive: true },
      },
      include: { user: true },
    });

    if (students.length === 0) {
      return { count: 0, invoices: [] };
    }

    const currentYear = new Date().getFullYear();
    let currentCount = await tx.feeInvoice.count({ where: { tenantId } });

    const totalTermAmount = feeStructures.reduce((sum, fs) => sum + Number(fs.amount), 0);
    const createdInvoices: FeeInvoice[] = [];

    for (const student of students) {
      // Check if invoice already exists for this student and term
      const existing = await tx.feeInvoice.findFirst({
        where: {
          tenantId,
          studentId: student.id,
          feeTermId: feeTerm.id,
        },
      });

      if (existing) {
        continue; // Don't duplicate invoices
      }

      currentCount++;
      const invoiceNumber = `INV-${currentYear}-${String(currentCount).padStart(5, '0')}`;

      const invoice = await tx.feeInvoice.create({
        data: {
          tenantId,
          studentId: student.id,
          academicYearId: input.academicYearId,
          feeTermId: feeTerm.id,
          invoiceNumber,
          totalAmount: totalTermAmount,
          discountAmount: 0,
          lateFee: 0,
          netAmount: totalTermAmount,
          paidAmount: 0,
          balanceAmount: totalTermAmount,
          dueDate: feeTerm.dueDate,
          status: 'PENDING',
          items: {
            create: feeStructures.map((fs) => ({
              tenantId,
              feeCategoryId: fs.feeCategoryId,
              amount: fs.amount,
              description: `${feeTerm.name} - ${fs.feeCategory.name}`,
            })),
          },
        },
      });

      createdInvoices.push(invoice);
    }

    return { count: createdInvoices.length, invoices: createdInvoices };
  });
}

/**
 * Counter/Online Fee Collection with Atomic Transaction Safety.
 * Guarantees that:
 * 1. Receipt numbers are monotonically auto-incremented per school.
 * 2. Invoice paid/balance amounts are updated in the exact same transaction.
 * 3. Overdue invoices automatically compute and lock the applicable late fee.
 */
export async function collectFeePaymentAtomic(
  tenantId: string,
  rawInput: CollectFeePaymentInput
): Promise<{ payment: FeePayment; invoice: FeeInvoice }> {
  const input = CollectFeePaymentSchema.parse(rawInput);

  return prisma.$transaction(async (tx) => {
    // 1. Fetch invoice with its term details
    const invoice = await tx.feeInvoice.findFirst({
      where: { id: input.feeInvoiceId, tenantId },
      include: { feeTerm: true },
    });

    if (!invoice) {
      throw new Error(`Invoice ${input.feeInvoiceId} not found under tenant.`);
    }

    if (invoice.status === 'PAID') {
      throw new Error(`Invoice ${invoice.invoiceNumber} has already been paid in full.`);
    }

    if (invoice.status === 'CANCELLED') {
      throw new Error(`Cannot collect payment for a cancelled invoice.`);
    }

    // 2. Assess Late Fines if overdue and not yet recorded
    let updatedLateFee = Number(invoice.lateFee);
    let updatedNetAmount = Number(invoice.netAmount);
    let updatedBalance = Number(invoice.balanceAmount);

    if (updatedLateFee === 0 && invoice.feeTerm) {
      const lateCalc = calculateLateFineForInvoice(invoice, new Date());
      if (lateCalc.gracePeriodExpired && lateCalc.lateFee > 0) {
        updatedLateFee = lateCalc.lateFee;
        updatedNetAmount += updatedLateFee;
        updatedBalance += updatedLateFee;
      }
    }

    if (input.amount > updatedBalance) {
      throw new Error(
        `Payment amount (₹${input.amount}) exceeds outstanding balance (₹${updatedBalance}).`
      );
    }

    // 3. Generate tenant-scoped receipt number: REC-2026-00001
    const currentYear = new Date().getFullYear();
    const paymentCount = await tx.feePayment.count({ where: { tenantId } });
    const receiptNumber = `REC-${currentYear}-${String(paymentCount + 1).padStart(5, '0')}`;

    // 4. Create Fee Payment
    const payment = await tx.feePayment.create({
      data: {
        tenantId,
        feeInvoiceId: invoice.id,
        amount: input.amount,
        paymentMethod: input.paymentMethod,
        razorpayPaymentId: input.razorpayPaymentId || null,
        razorpayOrderId: input.razorpayOrderId || null,
        razorpaySignature: input.razorpaySignature || null,
        receiptNumber,
        remarks: input.remarks || null,
        collectedById: input.collectedById || null,
        status: 'SUCCESS',
      },
    });

    // 5. Update Invoice Balances & Status
    const newPaidAmount = Number(invoice.paidAmount) + input.amount;
    const newBalanceAmount = updatedBalance - input.amount;
    const newStatus = newBalanceAmount === 0 ? 'PAID' : 'PARTIAL';

    const updatedInvoice = await tx.feeInvoice.update({
      where: { id: invoice.id },
      data: {
        lateFee: updatedLateFee,
        netAmount: updatedNetAmount,
        paidAmount: newPaidAmount,
        balanceAmount: newBalanceAmount,
        status: newStatus,
      },
    });

    return { payment, invoice: updatedInvoice };
  });
}
