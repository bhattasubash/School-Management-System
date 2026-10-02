import { redirect } from 'next/navigation';
import { getSessionFromCookies, getRoleDefaultPath } from '@/lib/session';
import LandingPage from '@/components/landing/LandingPage';

export const metadata = {
  title: 'Sunrise Public School - Learn • Grow • Excel | School Management System',
  description:
    'All-in-One School Management for a Brighter Tomorrow. Simplify administration, enhance communication, and create a better learning experience.',
};

export default async function HomePage() {
  const session = await getSessionFromCookies();
  if (session) {
    redirect(getRoleDefaultPath(session.role));
  }
  return <LandingPage />;
}

