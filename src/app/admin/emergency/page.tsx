import { redirect } from 'next/navigation';
import { getSessionFromCookies } from '@/lib/session';
import { prisma } from '@/lib/db';
import EmergencyManagerClient, {
  type EmergencyContactItem,
} from '@/components/admin/EmergencyManagerClient';

export const dynamic = 'force-dynamic';

export default async function AdminEmergencyPage() {
  const session = await getSessionFromCookies();
  if (!session || (session.role !== 'ADMIN' && session.role !== 'SUPER_ADMIN')) {
    redirect('/unauthorized');
  }

  const tenantId = session.tenantId;
  if (!tenantId) {
    redirect('/login');
  }

  const dbContacts = await prisma.emergencyContact.findMany({
    where: { tenantId },
    orderBy: [{ displayOrder: 'asc' }, { createdAt: 'asc' }],
  });

  const formattedContacts: EmergencyContactItem[] = dbContacts.map((c) => ({
    id: c.id,
    name: c.name,
    designation: c.designation,
    phone: c.phone,
    email: c.email,
    category: c.category,
    displayOrder: c.displayOrder,
  }));

  return <EmergencyManagerClient initialContacts={formattedContacts} />;
}
