import { AuthService } from '@/services/auth.service';
import { Role } from '@/types';
import { prisma } from '@/lib/db';

async function testAllLogins() {
  const accounts = [
    { role: Role.SUPER_ADMIN, email: 'superadmin@schoolerp.in', pass: 'SuperAdmin@123' },
    { role: Role.ADMIN, email: 'admin@dps.edu.in', pass: 'Admin@123' },
    { role: Role.TEACHER, email: 'teacher@dps.edu.in', pass: 'Teacher@123' },
    { role: Role.ACCOUNTANT, email: 'accountant@dps.edu.in', pass: 'Accountant@123' },
    { role: Role.STUDENT, email: 'student@dps.edu.in', pass: 'Student@123' },
    { role: Role.PARENT, email: 'parent@dps.edu.in', pass: 'Parent@123' },
  ];

  for (const acc of accounts) {
    const res = await AuthService.login({ email: acc.email, password: acc.pass }, null);
    if (!res.success) {
      console.error(`FAIL: ${acc.email} -> ${res.error}`);
      process.exit(1);
    }
    console.log(`PASS: ${acc.email} (${res.user?.role}) -> Tenant: ${res.user?.tenantId || 'GLOBAL'}`);
  }
  console.log('ALL DEMO ACCOUNTS LOGGED IN SUCCESSFULLY ON LOCALHOST!');
}

testAllLogins()
  .then(async () => {
    await prisma.$disconnect();
    process.exit(0);
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
