import { redirect } from 'next/navigation';
import { getSessionFromCookies } from '@/lib/session';
import { prisma } from '@/lib/db';
import HolidaysManagerClient, {
  type HolidayItem,
  type AcademicSessionOption,
} from '@/components/admin/HolidaysManagerClient';

export const dynamic = 'force-dynamic';

export default async function AdminHolidaysPage() {
  const session = await getSessionFromCookies();
  if (!session || (session.role !== 'ADMIN' && session.role !== 'SUPER_ADMIN')) {
    redirect('/unauthorized');
  }

  const tenantId = session.tenantId;
  if (!tenantId) {
    redirect('/login');
  }

  const [dbAcademicYears, dbHolidays] = await Promise.all([
    prisma.academicYear.findMany({
      where: { tenantId },
      orderBy: { startDate: 'desc' },
      select: { id: true, name: true, isCurrent: true },
    }),
    prisma.holiday.findMany({
      where: { tenantId },
      orderBy: { date: 'asc' },
    }),
  ]);

  const sessions: AcademicSessionOption[] = dbAcademicYears.map((ay) => ({
    id: ay.id,
    name: ay.name,
    isCurrent: ay.isCurrent,
  }));

  const activeSession = sessions.find((s) => s.isCurrent) || sessions[0] || {
    id: '00000000-0000-0000-0000-000000000000',
    name: 'Current Session',
    isCurrent: true,
  };

  const formattedHolidays: HolidayItem[] = dbHolidays.map((h) => ({
    id: h.id,
    name: h.name,
    date: h.date.toISOString().split('T')[0],
    type: h.type,
    isRecurring: h.isRecurring,
    sessionId: h.sessionId,
  }));

  return (
    <HolidaysManagerClient
      initialHolidays={formattedHolidays}
      sessions={sessions}
      activeSessionId={activeSession.id}
    />
  );
}
