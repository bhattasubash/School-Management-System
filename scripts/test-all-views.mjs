import { createSessionToken } from '../src/lib/jwt.js';
import { prisma } from '../src/lib/db.js';

const VIEWS = [
  'dashboard',
  'student-id-card',
  'profile-settings',
  'today-timetable',
  'weekly-timetable',
  'syllabus-curriculum',
  'my-attendance',
  'attendance-calendar',
  'exam-datesheet',
  'results-marks',
  'report-card',
  'exam-guidelines',
  'fee-summary',
  'fee-invoices',
  'payment-history',
  'online-payment',
  'notifications',
  'circulars-notices',
  'school-events',
  'holiday-calendar',
  'know-authorities',
  'emergency-contacts',
  'grievance-feedback',
  'help-support'
];

async function main() {
  const user = await prisma.user.findFirst({
    where: { email: 'student@dps.edu.in' },
    include: { studentProfile: true }
  });

  if (!user) throw new Error('Student user not found');

  const token = await createSessionToken({
    sub: user.id,
    email: user.email,
    role: user.role,
    tenantId: user.tenantId,
    name: `${user.firstName} ${user.lastName}`
  });

  console.log('Testing all 24 portal views with authenticated session...');

  let successCount = 0;
  for (const view of VIEWS) {
    const url = view === 'dashboard' ? 'http://localhost:3000/portal' : `http://localhost:3000/portal?view=${view}`;
    const res = await fetch(url, {
      headers: { cookie: `session_token=${token}` }
    });
    if (res.status === 200) {
      successCount++;
      const text = await res.text();
      console.log(`[PASS] view=${view} (HTTP 200, HTML size: ${text.length})`);
    } else {
      console.error(`[FAIL] view=${view} (HTTP ${res.status})`);
    }
  }

  console.log(`\nResults: ${successCount}/${VIEWS.length} views rendered successfully with HTTP 200!`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
