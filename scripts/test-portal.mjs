import { AuthService } from '../src/services/auth.service.js';
import { createSessionToken } from '../src/lib/jwt.js';
import { prisma } from '../src/lib/db.js';

async function main() {
  const user = await prisma.user.findFirst({
    where: { email: 'student@dps.edu.in' },
    include: { studentProfile: true }
  });

  if (!user) {
    console.error('Student user not found');
    return;
  }

  console.log('Found student:', user.email, 'Role:', user.role, 'Profile ID:', user.studentProfile?.id);

  const token = await createSessionToken({
    sub: user.id,
    email: user.email,
    role: user.role,
    tenantId: user.tenantId,
    name: `${user.firstName} ${user.lastName}`
  });

  console.log('Generated token length:', token.length);

  // Test fetching portal page with cookie
  const res = await fetch('http://localhost:3000/portal', {
    headers: {
      cookie: `session_token=${token}`
    }
  });

  console.log('Portal HTTP Status:', res.status);
  const html = await res.text();
  console.log('HTML contains Subash Bhatta:', html.includes('Subash Bhatta'));
  console.log('HTML contains My Activities:', html.includes('My Activities'));
  console.log('HTML contains ref_school_hero_clean.png:', html.includes('ref_school_hero_clean.png'));
  console.log('HTML contains illust_study_materials_clean.png:', html.includes('illust_study_materials_clean.png'));
  console.log('HTML contains illust_results.png:', html.includes('illust_results.png'));
  console.log('HTML length:', html.length);
}

main().catch(console.error).finally(() => prisma.$disconnect());
