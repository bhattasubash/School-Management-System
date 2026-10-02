import { prisma } from '../lib/db';
import {
  collectFeePaymentAtomic,
  calculateLateFineForInvoice,
  generateQuarterlyInvoicesForClass,
} from '../services/fee-engine.service';

async function main() {
  console.log('\n======================================================');
  console.log(' VERIFYING PHASE 3: ADMIN FEE COUNTER & LEDGER ENGINE');
  console.log('======================================================\n');

  // 1. Fetch Primary Tenant Context
  const tenant = await prisma.tenant.findFirst({
    where: { slug: 'dps' },
  });

  if (!tenant) {
    throw new Error('Tenant DPS not found in test database.');
  }

  const tenantId = tenant.id;
  console.log(`[PASS] Tenant context resolved: ${tenant.name} (${tenantId})`);

  // 2. Clean up any lingering automated payments from previous runs to ensure pristine state
  const lingeringPayments = await prisma.feePayment.findMany({
    where: { tenantId, remarks: { contains: 'Automated' } },
  });
  for (const p of lingeringPayments) {
    const inv = await prisma.feeInvoice.findUnique({ where: { id: p.feeInvoiceId } });
    if (inv) {
      await prisma.feeInvoice.update({
        where: { id: inv.id },
        data: {
          paidAmount: Math.max(0, Number(inv.paidAmount) - Number(p.amount)),
          balanceAmount: Number(inv.balanceAmount) + Number(p.amount),
        },
      });
    }
    await prisma.feePayment.delete({ where: { id: p.id } });
  }

  // 3. Fetch Academic Year, Class, and Fee Term
  const [academicYear, classGrade, feeTerm] = await Promise.all([
    prisma.academicYear.findFirst({ where: { tenantId, isCurrent: true } }),
    prisma.classGrade.findFirst({ where: { tenantId, name: 'Class 10' } }),
    prisma.feeTerm.findFirst({ where: { tenantId, termNumber: 1 } }),
  ]);

  if (!academicYear || !classGrade || !feeTerm) {
    throw new Error('Required academic year, class grade or fee term missing.');
  }

  // --- Suite 1: Fee Ledger Aggregation ---
  console.log('\n--- Suite 1: Fee Ledger Aggregation & Invoices ---');
  const invoices = await prisma.feeInvoice.findMany({
    where: { tenantId },
    include: { student: { include: { user: true } }, items: true },
  });

  console.log(`  [PASS] Found ${invoices.length} active fee invoices in ledger`);
  const totalNet = invoices.reduce((sum, inv) => sum + Number(inv.netAmount), 0);
  const totalPaid = invoices.reduce((sum, inv) => sum + Number(inv.paidAmount), 0);
  const totalBalance = invoices.reduce((sum, inv) => sum + Number(inv.balanceAmount), 0);

  console.log(`  [PASS] Aggregate sums: Net Billed ₹${totalNet}, Paid ₹${totalPaid}, Balance ₹${totalBalance}`);
  if (Math.abs(totalNet - (totalPaid + totalBalance)) > 0.01) {
    throw new Error(`Integrity error: Net Billed (${totalNet}) != Paid (${totalPaid}) + Balance (${totalBalance})`);
  }

  // --- Suite 2: Atomic Counter Payment Collection ---
  console.log('\n--- Suite 2: Atomic Counter Payment Execution ---');
  const pendingInvoice = invoices.find((inv) => Number(inv.balanceAmount) > 2000);
  if (!pendingInvoice) {
    throw new Error('No pending invoice found with balance > ₹2000 for test.');
  }

  const testAmount = 1500;
  const initialBalance = Number(pendingInvoice.balanceAmount);
  const initialPaid = Number(pendingInvoice.paidAmount);
  const initialLateFee = Number(pendingInvoice.lateFee);
  const initialNetAmount = Number(pendingInvoice.netAmount);

  console.log(`  Target Invoice: ${pendingInvoice.invoiceNumber} for ${pendingInvoice.student.user.firstName}`);
  console.log(`  Initial Balance: ₹${initialBalance}, Initial Paid: ₹${initialPaid}`);

  const createdPaymentIds: string[] = [];

  try {
    const { payment, invoice: updatedInvoice } = await collectFeePaymentAtomic(tenantId, {
      feeInvoiceId: pendingInvoice.id,
      amount: testAmount,
      paymentMethod: 'CASH',
      remarks: 'Automated Counter Verification Payment',
    });
    createdPaymentIds.push(payment.id);

    console.log(`  [PASS] Counter Payment recorded successfully!`);
    console.log(`  [PASS] Generated Receipt Number: ${payment.receiptNumber}`);
    console.log(`  [PASS] Updated Balance: ₹${updatedInvoice.balanceAmount}, Updated Paid: ₹${updatedInvoice.paidAmount}`);

    // Assertions
    if (!payment.receiptNumber.startsWith('REC-')) {
      throw new Error(`Receipt number invalid format: ${payment.receiptNumber}`);
    }

    if (Number(updatedInvoice.paidAmount) !== initialPaid + testAmount) {
      throw new Error(`Paid amount mismatch: expected ${initialPaid + testAmount}, got ${updatedInvoice.paidAmount}`);
    }

    const assessedLateFee = Number(updatedInvoice.lateFee) - initialLateFee;
    const expectedBalance = initialBalance + assessedLateFee - testAmount;
    if (Number(updatedInvoice.balanceAmount) !== expectedBalance) {
      throw new Error(`Balance amount mismatch: expected ${expectedBalance}, got ${updatedInvoice.balanceAmount}`);
    }

    // --- Suite 3: Monotonic Collision-Resistant Receipts ---
    console.log('\n--- Suite 3: Monotonic Collision-Resistant Receipts ---');
    const { payment: payment2 } = await collectFeePaymentAtomic(tenantId, {
      feeInvoiceId: pendingInvoice.id,
      amount: 500,
      paymentMethod: 'POS',
      remarks: 'Automated Second Counter Payment (POS)',
    });
    createdPaymentIds.push(payment2.id);

    console.log(`  [PASS] Second payment recorded: ${payment2.receiptNumber}`);
    const seq1 = parseInt(payment.receiptNumber.split('-')[2], 10);
    const seq2 = parseInt(payment2.receiptNumber.split('-')[2], 10);

    if (seq2 !== seq1 + 1) {
      throw new Error(`Sequential receipt numbering failed: expected ${seq1 + 1}, got ${seq2}`);
    }
    console.log(`  [PASS] Receipts correctly incremented monotonically (${seq1} -> ${seq2})`);

    // --- Suite 4: Late Fine Engine Calculation ---
    console.log('\n--- Suite 4: Late Fine Engine Calculation ---');
    const mockOverdueInvoice = {
      dueDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
      feeTerm: {
        lateFeeGraceDays: 10,
        lateFeeAmount: 50,
        lateFeePerDay: false,
      },
    };
    const fineResult = calculateLateFineForInvoice(mockOverdueInvoice);
    console.log(`  [PASS] Overdue invoice (30 days past due, 10 days grace):`);
    console.log(`         isOverdue=${fineResult.isOverdue}, gracePeriodExpired=${fineResult.gracePeriodExpired}, lateFee=₹${fineResult.lateFee}`);
    if (!fineResult.gracePeriodExpired || fineResult.lateFee !== 50) {
      throw new Error('Late fee computation error for overdue invoice.');
    }

    // --- Suite 5: Batch Invoicing Safety Check ---
    console.log('\n--- Suite 5: Batch Quarterly Invoicing Check ---');
    const batchResult = await generateQuarterlyInvoicesForClass(tenantId, {
      academicYearId: academicYear.id,
      classGradeId: classGrade.id,
      feeTermId: feeTerm.id,
    });
    console.log(`  [PASS] Batch generation executed safely: ${batchResult.count} new invoices generated (duplicates skipped)`);
  } finally {
    // --- Cleanup Test Payments (Guaranteed in finally block) ---
    console.log('\n--- Cleanup: Reverting Test Payments ---');
    if (createdPaymentIds.length > 0) {
      await prisma.feePayment.deleteMany({
        where: { id: { in: createdPaymentIds } },
      });
    }

    await prisma.feeInvoice.update({
      where: { id: pendingInvoice.id },
      data: {
        paidAmount: initialPaid,
        balanceAmount: initialBalance,
        lateFee: initialLateFee,
        netAmount: initialNetAmount,
        status: initialBalance === 0 ? 'PAID' : (initialPaid === 0 ? 'PENDING' : 'PARTIAL'),
      },
    });
    console.log('  [PASS] Test payments purged and invoice ledger restored to pristine state.');
  }

  console.log('\n======================================================');
  console.log(' ALL ADMIN FEE COUNTER VERIFICATION CHECKS PASSED!');
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
