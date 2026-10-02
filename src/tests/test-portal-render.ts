import { AuthService } from '@/services/auth.service';
import { Role } from '@/types';

async function testStudentPortal() {
  console.log('Authenticating student@dps.edu.in...');
  const loginRes = await AuthService.login({ email: 'student@dps.edu.in', password: 'Student@123' }, null);

  if (!loginRes.success || !loginRes.token) {
    console.error('Failed to log in:', loginRes.error);
    process.exit(1);
  }

  console.log('Login successful! Token:', loginRes.token.slice(0, 20) + '...');
  console.log('User:', loginRes.user?.email, 'Role:', loginRes.user?.role, 'Tenant:', loginRes.user?.tenantId);

  console.log('Testing GET http://localhost:3001/portal (manual redirect)...');

  const res = await fetch('http://localhost:3001/portal', {
    method: 'GET',
    headers: {
      Cookie: `session_token=${loginRes.token}`,
      Host: 'localhost:3001',
    },
    redirect: 'manual',
  });

  console.log('Response Status:', res.status);
  console.log('Location header:', res.headers.get('location'));
  const text = await res.text();
  console.log('Body slice:', text.slice(0, 300));

  process.exit(0);
}

testStudentPortal().catch((err) => {
  console.error(err);
  process.exit(1);
});
