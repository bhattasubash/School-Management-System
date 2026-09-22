import { z } from 'zod';

export const CreateFeeTermSchema = z
  .object({
    academicYearId: z.string().uuid('Valid academic year ID is required'),
    name: z.string().min(2, 'Term name is required (e.g., Quarter 1)').max(60),
    termNumber: z.number().int().min(1).max(12),
    startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Format must be YYYY-MM-DD'),
    endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Format must be YYYY-MM-DD'),
    dueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Format must be YYYY-MM-DD'),
    lateFeeGraceDays: z.number().int().min(0).max(60).default(10),
    lateFeeAmount: z.number().min(0).default(50),
    lateFeePerDay: z.boolean().default(false),
  })
  .strict();

export type CreateFeeTermInput = z.infer<typeof CreateFeeTermSchema>;

export const CollectFeePaymentSchema = z
  .object({
    feeInvoiceId: z.string().uuid('Valid fee invoice ID is required'),
    amount: z.number().positive('Payment amount must be greater than zero'),
    paymentMethod: z.enum([
      'CASH',
      'RAZORPAY_UPI',
      'RAZORPAY_CARD',
      'RAZORPAY_NETBANKING',
      'RAZORPAY_WALLET',
      'CHEQUE',
      'BANK_TRANSFER',
      'POS',
    ]),
    razorpayPaymentId: z.string().optional(),
    razorpayOrderId: z.string().optional(),
    razorpaySignature: z.string().optional(),
    remarks: z.string().max(250).optional(),
    collectedById: z.string().uuid().optional(),
  })
  .strict();

export type CollectFeePaymentInput = z.infer<typeof CollectFeePaymentSchema>;

export const GenerateQuarterlyInvoicesSchema = z
  .object({
    academicYearId: z.string().uuid('Valid academic year ID is required'),
    classGradeId: z.string().uuid('Valid class grade ID is required'),
    feeTermId: z.string().uuid('Valid fee term ID is required'),
  })
  .strict();

export type GenerateQuarterlyInvoicesInput = z.infer<typeof GenerateQuarterlyInvoicesSchema>;
