import { z } from 'zod';
import { HolidayType } from '@prisma/client';

export const CreateHolidaySchema = z.object({
  sessionId: z.string().uuid('Academic session ID required'),
  name: z.string().min(2, 'Holiday name must be at least 2 characters').max(150),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Format must be YYYY-MM-DD'),
  type: z.nativeEnum(HolidayType).default(HolidayType.SCHOOL),
  isRecurring: z.boolean().default(false),
});

export type CreateHolidayInput = z.infer<typeof CreateHolidaySchema>;

export const UpdateHolidaySchema = CreateHolidaySchema.partial().extend({
  id: z.string().uuid(),
});

export type UpdateHolidayInput = z.infer<typeof UpdateHolidaySchema>;
