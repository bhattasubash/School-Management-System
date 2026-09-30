import { redirect } from 'next/navigation';
import { getSessionFromCookies } from '@/lib/session';
import BulkImportClient from '@/components/admin/BulkImportClient';

export const dynamic = 'force-dynamic';

export default async function AdminBulkImportPage() {
  const session = await getSessionFromCookies();
  if (!session || (session.role !== 'ADMIN' && session.role !== 'SUPER_ADMIN')) {
    redirect('/login?redirect=/admin/bulk-import');
  }

  const tenantId = session.tenantId;
  if (!tenantId) {
    return <div className="p-8">Platform tenant context required.</div>;
  }

  return <BulkImportClient />;
}
