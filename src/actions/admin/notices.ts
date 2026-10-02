'use server';

import { safeRevalidatePath as revalidatePath } from '@/lib/revalidate';
import { z } from 'zod';
import { prisma } from '@/lib/db';
import { requireAuthGuard } from '@/lib/auth-guard';
import { NoticePriority, NoticeAudience } from '@prisma/client';
import { Role } from '@/types';

const PublishNoticeSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters').max(200),
  content: z.string().min(10, 'Content must be at least 10 characters').max(2000),
  priority: z.nativeEnum(NoticePriority).default(NoticePriority.NORMAL),
  targetAudience: z.nativeEnum(NoticeAudience).default(NoticeAudience.ALL),
});

export type PublishNoticeInput = z.input<typeof PublishNoticeSchema>;

export async function publishNoticeAction(rawInput: PublishNoticeInput) {
  const guard = await requireAuthGuard([Role.ADMIN, Role.SUPER_ADMIN]);
  if (!guard.success) {
    return { success: false, error: guard.error };
  }

  const validation = PublishNoticeSchema.safeParse(rawInput);
  if (!validation.success) {
    return {
      success: false,
      error: validation.error.errors.map((e) => e.message).join(', '),
    };
  }

  const { context } = guard;
  const input = validation.data;

  try {
    const notice = await prisma.notice.create({
      data: {
        tenantId: context.tenantId,
        authorId: context.userId,
        title: input.title,
        content: input.content,
        priority: input.priority,
        targetAudience: input.targetAudience,
      },
    });

    await prisma.auditLog.create({
      data: {
        tenantId: context.tenantId,
        userId: context.userId,
        action: 'CIRCULAR_PUBLISHED',
        entityType: 'Notice',
        entityId: notice.id,
        newValues: { title: notice.title, priority: notice.priority, audience: notice.targetAudience },
      },
    });

    revalidatePath('/admin');
    revalidatePath('/');
    return { success: true, notice };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to publish notice.';
    return { success: false, error: msg };
  }
}

export async function deleteNoticeAction(noticeId: string) {
  const guard = await requireAuthGuard([Role.ADMIN, Role.SUPER_ADMIN]);
  if (!guard.success) {
    return { success: false, error: guard.error };
  }

  const { context } = guard;

  try {
    // Atomic tenant-scoped deletion (prevents cross-tenant deletion attacks)
    const result = await prisma.notice.deleteMany({
      where: { id: noticeId, tenantId: context.tenantId },
    });

    if (result.count === 0) {
      return { success: false, error: 'Notice not found or unauthorized.' };
    }

    await prisma.auditLog.create({
      data: {
        tenantId: context.tenantId,
        userId: context.userId,
        action: 'CIRCULAR_DELETED',
        entityType: 'Notice',
        entityId: noticeId,
      },
    });

    revalidatePath('/admin/notices');
    revalidatePath('/admin');
    revalidatePath('/');
    return { success: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to delete circular.';
    return { success: false, error: msg };
  }
}
