'use server';

import { safeRevalidatePath as revalidatePath } from '@/lib/revalidate';
import { prisma } from '@/lib/db';
import { requireAuthGuard } from '@/lib/auth-guard';
import { Role } from '@/types';
import {
  CreateEmergencyContactSchema,
  type CreateEmergencyContactInput,
  UpdateEmergencyContactSchema,
  type UpdateEmergencyContactInput,
} from '@/lib/validations/emergency';
import { ContactCategory } from '@prisma/client';

/**
 * Retrieves all emergency contacts for the tenant, ordered by displayOrder.
 */
export async function getEmergencyContactsAction() {
  const guard = await requireAuthGuard();
  if (!guard.success) {
    return { success: false, error: guard.error };
  }

  try {
    const contacts = await prisma.emergencyContact.findMany({
      where: { tenantId: guard.context.tenantId },
      orderBy: [{ displayOrder: 'asc' }, { createdAt: 'asc' }],
    });

    return { success: true, contacts };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to retrieve emergency contacts.';
    return { success: false, error: message };
  }
}

/**
 * Creates a new emergency contact (Admin only).
 */
export async function createEmergencyContactAction(rawInput: CreateEmergencyContactInput) {
  const guard = await requireAuthGuard([Role.ADMIN, Role.SUPER_ADMIN]);
  if (!guard.success) {
    return { success: false, error: guard.error };
  }

  const validation = CreateEmergencyContactSchema.safeParse(rawInput);
  if (!validation.success) {
    return {
      success: false,
      error: validation.error.errors.map((e) => e.message).join(', '),
    };
  }

  const { tenantId, userId } = guard.context;
  const input = validation.data;

  try {
    const contact = await prisma.emergencyContact.create({
      data: {
        tenantId,
        name: input.name,
        designation: input.designation,
        phone: input.phone,
        email: input.email || null,
        category: input.category,
        displayOrder: input.displayOrder,
      },
    });

    // Audit log
    await prisma.auditLog.create({
      data: {
        tenantId,
        userId,
        action: 'EMERGENCY_CONTACT_CREATED',
        entityType: 'EmergencyContact',
        entityId: contact.id,
        newValues: { name: contact.name, designation: contact.designation, category: contact.category },
      },
    });

    revalidatePath('/admin/emergency');
    revalidatePath('/');
    return { success: true, contact };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to create emergency contact.';
    return { success: false, error: message };
  }
}

/**
 * Updates an emergency contact (Admin only).
 */
export async function updateEmergencyContactAction(rawInput: UpdateEmergencyContactInput) {
  const guard = await requireAuthGuard([Role.ADMIN, Role.SUPER_ADMIN]);
  if (!guard.success) {
    return { success: false, error: guard.error };
  }

  const validation = UpdateEmergencyContactSchema.safeParse(rawInput);
  if (!validation.success) {
    return {
      success: false,
      error: validation.error.errors.map((e) => e.message).join(', '),
    };
  }

  const { tenantId, userId } = guard.context;
  const input = validation.data;

  try {
    const existing = await prisma.emergencyContact.findFirst({
      where: { id: input.id, tenantId },
    });

    if (!existing) {
      return { success: false, error: 'Emergency contact not found.' };
    }

    await prisma.emergencyContact.updateMany({
      where: { id: input.id, tenantId },
      data: {
        ...(input.name !== undefined && { name: input.name }),
        ...(input.designation !== undefined && { designation: input.designation }),
        ...(input.phone !== undefined && { phone: input.phone }),
        ...(input.email !== undefined && { email: input.email || null }),
        ...(input.category !== undefined && { category: input.category }),
        ...(input.displayOrder !== undefined && { displayOrder: input.displayOrder }),
      },
    });

    const updated = await prisma.emergencyContact.findFirst({
      where: { id: input.id, tenantId },
    });

    // Audit log
    await prisma.auditLog.create({
      data: {
        tenantId,
        userId,
        action: 'EMERGENCY_CONTACT_UPDATED',
        entityType: 'EmergencyContact',
        entityId: input.id,
        newValues: { name: updated?.name, designation: updated?.designation },
      },
    });

    revalidatePath('/admin/emergency');
    revalidatePath('/');
    return { success: true, contact: updated };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to update emergency contact.';
    return { success: false, error: message };
  }
}

/**
 * Deletes an emergency contact (Admin only).
 */
export async function deleteEmergencyContactAction(id: string) {
  const guard = await requireAuthGuard([Role.ADMIN, Role.SUPER_ADMIN]);
  if (!guard.success) {
    return { success: false, error: guard.error };
  }

  const { tenantId, userId } = guard.context;

  try {
    const existing = await prisma.emergencyContact.findFirst({
      where: { id, tenantId },
    });

    if (!existing) {
      return { success: false, error: 'Emergency contact not found.' };
    }

    const result = await prisma.emergencyContact.deleteMany({
      where: { id, tenantId },
    });

    if (result.count === 0) {
      return { success: false, error: 'Emergency contact not found.' };
    }

    // Audit log
    await prisma.auditLog.create({
      data: {
        tenantId,
        userId,
        action: 'EMERGENCY_CONTACT_DELETED',
        entityType: 'EmergencyContact',
        entityId: id,
        newValues: { name: existing.name },
      },
    });

    revalidatePath('/admin/emergency');
    revalidatePath('/');
    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to delete emergency contact.';
    return { success: false, error: message };
  }
}
