import { PrismaClient, PaymentMethod, PaymentStatus, InvoiceStatus } from '@prisma/client';

const prisma = new PrismaClient();

export async function seedStudentFees() {
  console.log('Seeding Fee Categories & Invoices for demo student...');

  const student = await prisma.studentProfile.findFirst({
    include: { section: { include: { classGrade: true } } },
  });

  if (!student) {
    console.error('No student found to seed fees for!');
    return;
  }

  const tenantId = student.tenantId;

  const academicYear = await prisma.academicYear.findFirst({
    where: { tenantId, isCurrent: true },
  });

  if (!academicYear) {
    console.error('No academic year found!');
    return;
  }

  // 1. Fee Categories
  const categoriesData = [
    { name: 'Tuition Fee', description: 'Regular academic tuition' },
    { name: 'Computer & AI Science Lab Fee', description: 'Practical labs and computing' },
    { name: 'Library & Learning Resource Fee', description: 'Library, journals, online resources' },
    { name: 'Co-Curricular & Sports Wing Fee', description: 'Sports facilities and extracurriculars' },
    { name: 'Annual CBSE Examination Fee', description: 'Term 1 CBSE Assessment & Board Registration' },
  ];

  const categoryMap = new Map<string, string>();
  for (const cat of categoriesData) {
    let existing = await prisma.feeCategory.findFirst({
      where: { tenantId, name: cat.name },
    });
    if (!existing) {
      existing = await prisma.feeCategory.create({
        data: {
          tenantId,
          name: cat.name,
          description: cat.description,
          isRecurring: true,
        },
      });
    }
    categoryMap.set(cat.name, existing.id);
  }

  // 2. Fee Term Q3
  let feeTermQ3 = await prisma.feeTerm.findFirst({
    where: { tenantId, academicYearId: academicYear.id, name: 'Term 1 / Q3' },
  });
  if (!feeTermQ3) {
    feeTermQ3 = await prisma.feeTerm.create({
      data: {
        tenantId,
        academicYearId: academicYear.id,
        name: 'Term 1 / Q3',
        termNumber: 3,
        startDate: new Date('2026-10-01'),
        endDate: new Date('2026-12-31'),
        dueDate: new Date('2026-10-15'),
        lateFeeGraceDays: 10,
        lateFeeAmount: 50,
      },
    });
  }

  // 3. Clean up existing invoices for clean idempotency if needed
  const existingInvoices = await prisma.feeInvoice.findMany({
    where: { tenantId, studentId: student.id },
  });

  if (existingInvoices.length === 0) {
    // Invoice 1: Q1 Paid (₹16,000)
    const inv1 = await prisma.feeInvoice.create({
      data: {
        tenantId,
        studentId: student.id,
        academicYearId: academicYear.id,
        invoiceNumber: 'INV-2026-Q1-0428',
        totalAmount: 16000,
        discountAmount: 0,
        lateFee: 0,
        netAmount: 16000,
        paidAmount: 16000,
        balanceAmount: 0,
        dueDate: new Date('2026-04-15'),
        status: InvoiceStatus.PAID,
        generatedAt: new Date('2026-04-01'),
        items: {
          create: [
            {
              tenantId,
              feeCategoryId: categoryMap.get('Tuition Fee')!,
              amount: 12250,
              description: 'Tuition Fee Q1',
            },
            {
              tenantId,
              feeCategoryId: categoryMap.get('Computer & AI Science Lab Fee')!,
              amount: 1750,
              description: 'Lab Session Q1',
            },
            {
              tenantId,
              feeCategoryId: categoryMap.get('Library & Learning Resource Fee')!,
              amount: 900,
              description: 'Library Q1',
            },
            {
              tenantId,
              feeCategoryId: categoryMap.get('Co-Curricular & Sports Wing Fee')!,
              amount: 1100,
              description: 'Sports Q1',
            },
          ],
        },
        payments: {
          create: [
            {
              tenantId,
              amount: 16000,
              paymentMethod: PaymentMethod.RAZORPAY_NETBANKING,
              receiptNumber: 'RCP-2026-4401',
              status: PaymentStatus.SUCCESS,
              transactionDate: new Date('2026-04-10T16:15:00Z'),
              remarks: 'Quarter 1 Tuition & Labs via Net Banking',
            },
          ],
        },
      },
    });

    // Invoice 2: Q2 Paid (₹16,000)
    const inv2 = await prisma.feeInvoice.create({
      data: {
        tenantId,
        studentId: student.id,
        academicYearId: academicYear.id,
        invoiceNumber: 'INV-2026-Q2-0428',
        totalAmount: 16000,
        discountAmount: 0,
        lateFee: 0,
        netAmount: 16000,
        paidAmount: 16000,
        balanceAmount: 0,
        dueDate: new Date('2026-07-15'),
        status: InvoiceStatus.PAID,
        generatedAt: new Date('2026-07-01'),
        items: {
          create: [
            {
              tenantId,
              feeCategoryId: categoryMap.get('Tuition Fee')!,
              amount: 12250,
              description: 'Tuition Fee Q2',
            },
            {
              tenantId,
              feeCategoryId: categoryMap.get('Computer & AI Science Lab Fee')!,
              amount: 1750,
              description: 'Lab Session Q2',
            },
            {
              tenantId,
              feeCategoryId: categoryMap.get('Library & Learning Resource Fee')!,
              amount: 900,
              description: 'Library Q2',
            },
            {
              tenantId,
              feeCategoryId: categoryMap.get('Co-Curricular & Sports Wing Fee')!,
              amount: 1100,
              description: 'Sports Q2',
            },
          ],
        },
        payments: {
          create: [
            {
              tenantId,
              amount: 16000,
              paymentMethod: PaymentMethod.RAZORPAY_UPI,
              receiptNumber: 'RCP-2026-8812',
              status: PaymentStatus.SUCCESS,
              transactionDate: new Date('2026-07-14T11:32:00Z'),
              remarks: 'Quarter 2 Tuition via UPI (GPay)',
            },
          ],
        },
      },
    });

    // Invoice 3: Q3 Pending (₹4,500 - Annual CBSE Exam Fee)
    const inv3 = await prisma.feeInvoice.create({
      data: {
        tenantId,
        studentId: student.id,
        academicYearId: academicYear.id,
        feeTermId: feeTermQ3.id,
        invoiceNumber: 'INV-2026-Q3-0428',
        totalAmount: 4500,
        discountAmount: 0,
        lateFee: 0,
        netAmount: 4500,
        paidAmount: 0,
        balanceAmount: 4500,
        dueDate: new Date('2026-10-15'),
        status: InvoiceStatus.PENDING,
        generatedAt: new Date('2026-10-01'),
        items: {
          create: [
            {
              tenantId,
              feeCategoryId: categoryMap.get('Annual CBSE Examination Fee')!,
              amount: 4500,
              description: 'Annual CBSE Examination Fee (Term 1 Assessment & Board Registration)',
            },
          ],
        },
      },
    });

    console.log('✅ Seeded 3 invoices (Total paid: ₹32,000, Outstanding: ₹4,500)');
  } else {
    console.log(`Student already has ${existingInvoices.length} invoices.`);
  }
}

if (require.main === module) {
  seedStudentFees()
    .then(async () => {
      await prisma.$disconnect();
    })
    .catch(async (e) => {
      console.error(e);
      await prisma.$disconnect();
      process.exit(1);
    });
}
