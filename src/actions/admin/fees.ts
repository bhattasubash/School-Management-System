'use server';

import { safeRevalidatePath as revalidatePath } from '@/lib/revalidate';
import { z } from 'zod';
import { prisma } from '@/lib/db';
import { requireAuthGuard } from '@/lib/auth-guard';
import { Role } from '@/types';
import { PaymentMethod, PaymentStatus } from '@prisma/client';
import {
  collectFeePaymentAtomic,
  generateQuarterlyInvoicesForClass,
} from '@/services/fee-engine.service';

const CollectCounterFeeSchema = z.object({
  feeInvoiceId: z.string().uuid('Valid invoice ID required'),
  amount: z.number().positive('Payment amount must be greater than zero'),
  paymentMethod: z.nativeEnum(PaymentMethod),
  remarks: z.string().max(250).optional(),
});

export type CollectCounterFeeInput = z.infer<typeof CollectCounterFeeSchema>;

export async function collectCounterFeeAction(rawInput: CollectCounterFeeInput) {
  const guard = await requireAuthGuard([Role.ADMIN, Role.SUPER_ADMIN, Role.ACCOUNTANT]);
  if (!guard.success) {
    return { success: false, error: guard.error };
  }

  const validation = CollectCounterFeeSchema.safeParse(rawInput);
  if (!validation.success) {
    return {
      success: false,
      error: validation.error.errors.map((e) => e.message).join(', '),
    };
  }

  const { context } = guard;

  try {
    const { payment, invoice } = await collectFeePaymentAtomic(context.tenantId, {
      ...validation.data,
      collectedById: context.userId,
    });

    await prisma.auditLog.create({
      data: {
        tenantId: context.tenantId,
        userId: context.userId,
        action: 'FEE_COLLECTED',
        entityType: 'FeePayment',
        entityId: payment.id,
        newValues: {
          receiptNumber: payment.receiptNumber,
          amount: Number(payment.amount),
          paymentMethod: payment.paymentMethod,
          invoiceNumber: invoice.invoiceNumber,
          newBalance: Number(invoice.balanceAmount),
          status: invoice.status,
        },
      },
    });

    revalidatePath('/admin/fees');
    revalidatePath('/admin');
    revalidatePath('/admin/students');
    revalidatePath('/');

    return {
      success: true,
      receiptNumber: payment.receiptNumber,
      payment: {
        id: payment.id,
        receiptNumber: payment.receiptNumber,
        amount: Number(payment.amount),
        paymentMethod: payment.paymentMethod,
        status: payment.status,
        createdAt: payment.createdAt.toISOString(),
      },
      invoice: {
        id: invoice.id,
        invoiceNumber: invoice.invoiceNumber,
        paidAmount: Number(invoice.paidAmount),
        balanceAmount: Number(invoice.balanceAmount),
        status: invoice.status,
      },
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to collect payment.';
    return { success: false, error: msg };
  }
}

const GenerateQuarterlyInvoicesActionSchema = z.object({
  academicYearId: z.string().uuid('Valid academic year ID required'),
  classGradeId: z.string().uuid('Valid class grade ID required'),
  feeTermId: z.string().uuid('Valid fee term ID required'),
});

export type GenerateQuarterlyInvoicesActionInput = z.infer<
  typeof GenerateQuarterlyInvoicesActionSchema
>;

export async function generateQuarterlyInvoicesAction(
  rawInput: GenerateQuarterlyInvoicesActionInput
) {
  const guard = await requireAuthGuard([Role.ADMIN, Role.SUPER_ADMIN, Role.ACCOUNTANT]);
  if (!guard.success) {
    return { success: false, error: guard.error };
  }

  const validation = GenerateQuarterlyInvoicesActionSchema.safeParse(rawInput);
  if (!validation.success) {
    return {
      success: false,
      error: validation.error.errors.map((e) => e.message).join(', '),
    };
  }

  const { context } = guard;

  try {
    const result = await generateQuarterlyInvoicesForClass(context.tenantId, validation.data);

    await prisma.auditLog.create({
      data: {
        tenantId: context.tenantId,
        userId: context.userId,
        action: 'INVOICES_GENERATED',
        entityType: 'FeeInvoice',
        entityId: validation.data.feeTermId,
        newValues: {
          count: result.count,
          classGradeId: validation.data.classGradeId,
          academicYearId: validation.data.academicYearId,
        },
      },
    });

    revalidatePath('/admin/fees');
    revalidatePath('/admin');
    revalidatePath('/admin/students');
    revalidatePath('/');

    return {
      success: true,
      count: result.count,
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to generate invoices.';
    return { success: false, error: msg };
  }
}

// ----------------------------------------------------------------------------
// P3-2: FEE REFUND WORKFLOW
// ----------------------------------------------------------------------------

const RefundPaymentSchema = z.object({
  paymentId: z.string().uuid('Valid payment ID required'),
  reason: z.string().min(5, 'Refund reason required (at least 5 characters)').max(250),
});

export type RefundPaymentInput = z.infer<typeof RefundPaymentSchema>;

/**
 * Controlled Fee Refund Workflow:
 * Atomically adjusts invoice balances, marks payment as REFUNDED, and logs an immutable audit trail.
 */
export async function refundFeePaymentAction(rawInput: RefundPaymentInput) {
  const guard = await requireAuthGuard([Role.ADMIN, Role.SUPER_ADMIN]);
  if (!guard.success) {
    return { success: false, error: guard.error };
  }

  const validation = RefundPaymentSchema.safeParse(rawInput);
  if (!validation.success) {
    return {
      success: false,
      error: validation.error.errors.map((e) => e.message).join(', '),
    };
  }

  const { context } = guard;
  const { paymentId, reason } = validation.data;

  try {
    const result = await prisma.$transaction(async (tx) => {
      // 1. Fetch payment and ensure it belongs to this tenant
      const payment = await tx.feePayment.findFirst({
        where: { id: paymentId, tenantId: context.tenantId },
        include: { feeInvoice: true },
      });

      if (!payment) {
        throw new Error('Payment not found or does not belong to your school.');
      }

      if (payment.status === PaymentStatus.REFUNDED) {
        throw new Error('This payment has already been refunded.');
      }

      if (payment.status !== PaymentStatus.SUCCESS) {
        throw new Error(`Cannot refund payment with status "${payment.status}".`);
      }

      const invoice = payment.feeInvoice;
      const refundAmount = Number(payment.amount);

      // 2. Adjust invoice balances safely
      const newPaidAmount = Math.max(0, Number(invoice.paidAmount) - refundAmount);
      const newBalanceAmount = Number(invoice.balanceAmount) + refundAmount;
      const newStatus = newPaidAmount === 0 ? 'PENDING' : 'PARTIAL';

      const updatedInvoice = await tx.feeInvoice.update({
        where: { id: invoice.id },
        data: {
          paidAmount: newPaidAmount,
          balanceAmount: newBalanceAmount,
          status: newStatus,
        },
      });

      // 3. Mark payment as REFUNDED
      const updatedPayment = await tx.feePayment.update({
        where: { id: payment.id },
        data: {
          status: PaymentStatus.REFUNDED,
          remarks: payment.remarks
            ? `${payment.remarks} | REFUND: ${reason}`
            : `REFUND: ${reason}`,
        },
      });

      // 4. Create immutable audit log
      await tx.auditLog.create({
        data: {
          tenantId: context.tenantId,
          userId: context.userId,
          action: 'FEE_PAYMENT_REFUNDED',
          entityType: 'FeePayment',
          entityId: payment.id,
          newValues: {
            receiptNumber: payment.receiptNumber,
            refundAmount,
            reason,
            invoiceNumber: invoice.invoiceNumber,
            newInvoicePaidAmount: newPaidAmount,
            newInvoiceBalanceAmount: newBalanceAmount,
            newInvoiceStatus: newStatus,
          },
        },
      });

      return { payment: updatedPayment, invoice: updatedInvoice };
    });

    revalidatePath('/admin/fees');
    revalidatePath('/admin');
    revalidatePath('/admin/students');
    revalidatePath('/');

    return {
      success: true,
      message: `Payment ${result.payment.receiptNumber} refunded successfully.`,
      paymentId: result.payment.id,
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to process refund.';
    return { success: false, error: msg };
  }
}
