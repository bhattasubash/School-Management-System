import { z } from 'zod';

export const CreateStudentSchema = z
  .object({
    admissionNumber: z.string().min(1, 'Admission number is required'),
    rollNumber: z.number().int().positive().optional(),
    firstName: z.string().min(2, 'First name is required'),
    lastName: z.string().min(1, 'Last name is required'),
    email: z.string().email().optional().or(z.literal('')),
    phone: z.string().optional(),
    dateOfBirth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Format must be YYYY-MM-DD'),
    gender: z.enum(['MALE', 'FEMALE', 'OTHER']),
    bloodGroup: z.string().optional(),
    address: z.string().min(5, 'Address is required'),
    sectionId: z.string().uuid('Valid section ID is required'),
    fatherName: z.string().min(2, 'Father name is required'),
    fatherPhone: z.string().min(10, 'Valid father phone number is required'),
    fatherEmail: z.string().email().optional().or(z.literal('')),
    fatherOccupation: z.string().optional(),
    motherName: z.string().min(2, 'Mother name is required'),
    motherPhone: z.string().optional(),
    motherEmail: z.string().email().optional().or(z.literal('')),
    emergencyContact: z.string().min(10, 'Emergency contact number required'),
    admissionDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    previousSchool: z.string().optional(),
  })
  .strict();

export type CreateStudentInput = z.infer<typeof CreateStudentSchema>;
