import { redirect } from 'next/navigation';
import { getSessionFromCookies } from '@/lib/session';
import { prisma } from '@/lib/db';
import EventsManagerClient, {
  type SchoolEventItem,
} from '@/components/admin/EventsManagerClient';

export const dynamic = 'force-dynamic';

export default async function AdminEventsPage() {
  const session = await getSessionFromCookies();
  if (!session || (session.role !== 'ADMIN' && session.role !== 'SUPER_ADMIN')) {
    redirect('/unauthorized');
  }

  const tenantId = session.tenantId;
  if (!tenantId) {
    redirect('/login');
  }

  const dbEvents = await prisma.event.findMany({
    where: { tenantId },
    orderBy: { eventDate: 'desc' },
  });

  const formattedEvents: SchoolEventItem[] = dbEvents.map((e) => ({
    id: e.id,
    title: e.title,
    description: e.description,
    eventDate: e.eventDate.toISOString(),
    eventTime: e.eventTime,
    location: e.location,
    category: e.category,
    imageUrl: e.imageUrl,
    isPublished: e.isPublished,
    createdAt: e.createdAt.toISOString(),
  }));

  return <EventsManagerClient initialEvents={formattedEvents} />;
}
