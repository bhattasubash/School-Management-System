import { z } from 'zod';
import { ContactCategory } from '@prisma/client';

export const CreateEmergencyContactSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  designation: z.string().min(2, 'Designation must be at least 2 characters').max(100),
  phone: z.string().min(3, 'Phone number must be at least 3 digits').max(30),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
  category: z.nativeEnum(ContactCategory).default(ContactCategory.OTHER),
  displayOrder: z.number().int().min(0).default(0),
});

export type CreateEmergencyContactInput = z.infer<typeof CreateEmergencyContactSchema>;

export const UpdateEmergencyContactSchema = CreateEmergencyContactSchema.partial().extend({
  id: z.string().uuid(),
});

export type UpdateEmergencyContactInput = z.infer<typeof UpdateEmergencyContactSchema>;
