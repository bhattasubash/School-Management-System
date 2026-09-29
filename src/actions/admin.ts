'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { prisma } from '@/lib/db';
import { getSessionFromCookies } from '@/lib/session';
import { NoticePriority, NoticeAudience } from '@prisma/client';

const PublishNoticeSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters').max(200),
  content: z.string().min(10, 'Content must be at least 10 characters').max(2000),
  priority: z.nativeEnum(NoticePriority).default(NoticePriority.NORMAL),
  targetAudience: z.nativeEnum(NoticeAudience).default(NoticeAudience.ALL),
});

export type PublishNoticeInput = z.infer<typeof PublishNoticeSchema>;

export async function publishNoticeAction(rawInput: PublishNoticeInput) {
  const session = await getSessionFromCookies();
  if (!session || (session.role !== 'ADMIN' && session.role !== 'SUPER_ADMIN')) {
    return { success: false, error: 'Unauthorized: Admin privileges required.' };
  }

  const validation = PublishNoticeSchema.safeParse(rawInput);
  if (!validation.success) {
    return {
      success: false,
      error: validation.error.errors.map((e) => e.message).join(', '),
    };
  }

  const input = validation.data;
  const tenantId = session.tenantId;

  if (!tenantId) {
    return { success: false, error: 'Tenant context required.' };
  }

  try {
    const notice = await prisma.notice.create({
      data: {
        tenantId,
        authorId: session.sub,
        title: input.title,
        content: input.content,
        priority: input.priority,
        targetAudience: input.targetAudience,
      },
    });

    // Create Audit Log
    await prisma.auditLog.create({
      data: {
        tenantId,
        userId: session.sub,
        action: 'CIRCULAR_PUBLISHED',
        entityType: 'Notice',
        entityId: notice.id,
        newValues: { title: notice.title, priority: notice.priority, audience: notice.targetAudience },
      },
    });

    revalidatePath('/admin');
    revalidatePath('/');
    return { success: true, notice };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Failed to publish notice.' };
  }
}
