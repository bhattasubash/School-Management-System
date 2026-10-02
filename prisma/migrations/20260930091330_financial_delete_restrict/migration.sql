-- DropForeignKey
ALTER TABLE "FeeInvoice" DROP CONSTRAINT "FeeInvoice_academicYearId_fkey";

-- DropForeignKey
ALTER TABLE "FeeInvoice" DROP CONSTRAINT "FeeInvoice_feeTermId_fkey";

-- DropForeignKey
ALTER TABLE "FeeInvoice" DROP CONSTRAINT "FeeInvoice_studentId_fkey";

-- DropForeignKey
ALTER TABLE "FeePayment" DROP CONSTRAINT "FeePayment_feeInvoiceId_fkey";

-- AddForeignKey
ALTER TABLE "FeeInvoice" ADD CONSTRAINT "FeeInvoice_academicYearId_fkey" FOREIGN KEY ("academicYearId") REFERENCES "AcademicYear"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FeeInvoice" ADD CONSTRAINT "FeeInvoice_feeTermId_fkey" FOREIGN KEY ("feeTermId") REFERENCES "FeeTerm"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FeeInvoice" ADD CONSTRAINT "FeeInvoice_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "StudentProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FeePayment" ADD CONSTRAINT "FeePayment_feeInvoiceId_fkey" FOREIGN KEY ("feeInvoiceId") REFERENCES "FeeInvoice"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
