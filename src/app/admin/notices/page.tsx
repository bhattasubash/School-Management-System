import { redirect } from 'next/navigation';
import { prisma } from '@/lib/db';
import { getSessionFromCookies } from '@/lib/session';
import NoticesManagerClient, { NoticeItem } from '@/components/admin/NoticesManagerClient';

export const dynamic = 'force-dynamic';

export default async function AdminNoticesPage() {
  const session = await getSessionFromCookies();
  if (!session || (session.role !== 'ADMIN' && session.role !== 'SUPER_ADMIN')) {
    redirect('/unauthorized');
  }

  const tenantId = session.tenantId;
  if (!tenantId) {
    redirect('/unauthorized');
  }

  const noticesRaw = await prisma.notice.findMany({
    where: { tenantId },
    include: {
      author: {
        select: {
          firstName: true,
          lastName: true,
        },
      },
    },
    orderBy: { publishedAt: 'desc' },
  });

  const notices: NoticeItem[] = noticesRaw.map((n) => ({
    id: n.id,
    title: n.title,
    content: n.content,
    priority: n.priority,
    targetAudience: n.targetAudience,
    publishedAt: n.publishedAt.toISOString(),
    authorName: `${n.author.firstName} ${n.author.lastName}`,
  }));

  return <NoticesManagerClient notices={notices} />;
}
