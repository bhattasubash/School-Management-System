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

// ──────────────────────────────────────────────────
// Period Time Slot Schemas
// ──────────────────────────────────────────────────

export const CreatePeriodTimeSlotSchema = z
  .object({
    name: z.string().min(1, 'Period name is required').max(50),
    startTime: z.string().regex(/^\d{2}:\d{2}$/, 'Start time must be HH:MM format'),
    endTime: z.string().regex(/^\d{2}:\d{2}$/, 'End time must be HH:MM format'),
    order: z.number().int().min(1, 'Order must be at least 1'),
    isBreak: z.boolean().default(false),
  })
  .strict();

export type CreatePeriodTimeSlotInput = z.infer<typeof CreatePeriodTimeSlotSchema>;

export const UpdatePeriodTimeSlotSchema = CreatePeriodTimeSlotSchema.partial().extend({
  id: z.string().uuid('Valid time slot ID is required'),
});

export type UpdatePeriodTimeSlotInput = z.infer<typeof UpdatePeriodTimeSlotSchema>;

// ──────────────────────────────────────────────────
// Timetable Entry Schemas
// ──────────────────────────────────────────────────

export const SaveTimetableEntrySchema = z
  .object({
    sectionId: z.string().uuid('Valid section ID is required'),
    periodTimeSlotId: z.string().uuid('Valid period time slot ID is required'),
    dayOfWeek: DayOfWeekEnum,
    subjectId: z.string().uuid('Valid subject ID is required').optional().nullable(),
    teacherId: z.string().uuid('Valid teacher ID is required').optional().nullable(),
    roomNumber: z.string().max(20, 'Room number is too long').optional().nullable(),
    entryId: z.string().uuid('Valid entry ID is required').optional(), // for edit mode
  })
  .strict();

export type SaveTimetableEntryInput = z.infer<typeof SaveTimetableEntrySchema>;

// ──────────────────────────────────────────────────
// Clone Timetable Schema
// ──────────────────────────────────────────────────

export const CloneTimetableSchema = z
  .object({
    fromSectionId: z.string().uuid('Source section ID is required'),
    toSectionId: z.string().uuid('Target section ID is required'),
  })
  .strict()
  .refine((data) => data.fromSectionId !== data.toSectionId, {
    message: 'Source and target sections must be different',
    path: ['toSectionId'],
  });

export type CloneTimetableInput = z.infer<typeof CloneTimetableSchema>;
