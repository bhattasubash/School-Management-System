import { z } from 'zod';

export const DayOfWeekEnum = z.enum([
  'MONDAY',
  'TUESDAY',
  'WEDNESDAY',
  'THURSDAY',
  'FRIDAY',
  'SATURDAY',
  'SUNDAY',
]);

export const ValidateTimetableSlotSchema = z
  .object({
    sectionId: z.string().uuid('Valid section ID is required'),
    periodTimeSlotId: z.string().uuid('Valid period time slot ID is required'),
    dayOfWeek: DayOfWeekEnum,
    teacherId: z.string().uuid('Valid teacher ID is required').optional().nullable(),
    subjectId: z.string().uuid('Valid subject ID is required').optional().nullable(),
    excludeEntryId: z.string().uuid().optional(),
  })
  .strict();

export type ValidateTimetableSlotInput = z.infer<typeof ValidateTimetableSlotSchema>;

export const FindAvailableSubstitutesSchema = z
  .object({
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
    periodTimeSlotId: z.string().uuid('Valid period time slot ID is required'),
  })
  .strict();

export type FindAvailableSubstitutesInput = z.infer<typeof FindAvailableSubstitutesSchema>;

export const AssignSubstitutionSchema = z
  .object({
    timetableEntryId: z.string().uuid('Valid timetable entry ID is required'),
    substituteTeacherId: z.string().uuid('Valid substitute teacher ID is required'),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
    reason: z.string().max(250).optional(),
    assignedById: z.string().uuid('Valid assigner user ID is required'),
  })
  .strict();

export type AssignSubstitutionInput = z.infer<typeof AssignSubstitutionSchema>;
