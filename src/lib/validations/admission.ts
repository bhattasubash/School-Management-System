import { z } from 'zod';

export const CreateAdmissionApplicationSchema = z
  .object({
    academicYearId: z.string().uuid('Valid academic year ID is required'),
    classGradeId: z.string().uuid('Valid class grade ID is required'),
    studentFirstName: z.string().min(2, 'First name must be at least 2 characters').max(50),
    studentLastName: z.string().min(1, 'Last name is required').max(50),
    dateOfBirth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'DOB must be in YYYY-MM-DD format'),
    gender: z.enum(['MALE', 'FEMALE', 'OTHER']),
    bloodGroup: z.string().optional(),
    aadhaarNumber: z
      .string()
      .regex(/^\d{12}$/, 'Aadhaar must be a 12-digit number')
      .optional()
      .or(z.literal('')),
    parentName: z.string().min(2, 'Parent name must be at least 2 characters'),
    parentPhone: z.string().min(10, 'Valid 10-digit mobile number required'),
    parentEmail: z.string().email('Valid email address required').optional().or(z.literal('')),
    relationship: z.enum(['FATHER', 'MOTHER', 'GUARDIAN']).default('FATHER'),
    address: z.string().min(5, 'Residential address is required'),
    previousSchool: z.string().optional(),
    previousMarks: z.number().min(0).max(100).optional(),
    applicationFee: z.number().positive().default(500),
  })
  .strict();

export type CreateAdmissionApplicationInput = z.infer<typeof CreateAdmissionApplicationSchema>;

export const UpdateAdmissionStatusSchema = z
  .object({
    status: z.enum([
      'DRAFT',
      'SUBMITTED',
      'DOCUMENT_VERIFIED',
      'INTERVIEW_SCHEDULED',
      'APPROVED',
      'ENROLLED',
      'REJECTED',
    ]),
    interviewDate: z.string().datetime().optional().nullable(),
    adminRemarks: z.string().max(500).optional().nullable(),
  })
  .strict();

export type UpdateAdmissionStatusInput = z.infer<typeof UpdateAdmissionStatusSchema>;

export const EnrollStudentFromApplicationSchema = z
  .object({
    sectionId: z.string().uuid('Valid section ID is required'),
    admissionNumber: z.string().min(1, 'Admission number is required'),
    rollNumber: z.number().int().positive().optional(),
    feeStructureId: z.string().uuid().optional(),
    feeTermId: z.string().uuid().optional(),
  })
  .strict();

export type EnrollStudentFromApplicationInput = z.infer<typeof EnrollStudentFromApplicationSchema>;
