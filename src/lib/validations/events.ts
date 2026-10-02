import { z } from 'zod';
import { EventCategory } from '@prisma/client';

export const CreateEventSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(200),
  description: z.string().min(5, 'Description must be at least 5 characters').max(5000),
  eventDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Format must be YYYY-MM-DD'),
  eventTime: z.string().max(50).optional(),
  location: z.string().max(200).optional(),
  category: z.nativeEnum(EventCategory).default(EventCategory.ACADEMIC),
  imageUrl: z.string().url('Must be a valid URL').or(z.string().startsWith('/')).optional().or(z.literal('')),
  isPublished: z.boolean().default(false),
});

export type CreateEventInput = z.infer<typeof CreateEventSchema>;

export const UpdateEventSchema = CreateEventSchema.partial().extend({
  id: z.string().uuid(),
});

export type UpdateEventInput = z.infer<typeof UpdateEventSchema>;
