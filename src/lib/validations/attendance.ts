import { z } from 'zod';

export const DailyAttendanceRecordSchema = z
  .object({
    studentId: z.string().uuid(),
    status: z.enum(['PRESENT', 'ABSENT', 'LATE', 'HALF_DAY', 'EXCUSED']),
    remarks: z.string().max(255).optional(),
  })
  .strict();

export const MarkDailyAttendanceSchema = z
  .object({
    sectionId: z.string().uuid(),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Format must be YYYY-MM-DD'),
    records: z.array(DailyAttendanceRecordSchema).min(1, 'At least one student record is required'),
  })
  .strict();

export type MarkDailyAttendanceInput = z.infer<typeof MarkDailyAttendanceSchema>;
