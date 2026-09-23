import { AuthService } from '../services/auth.service';
import {
  createSessionToken,
  verifySessionToken,
  getRoleDefaultPath,
  isRouteAllowedForRole,
} from '../lib/session';
import { LoginSchema } from '../lib/validations/auth';
import { Role } from '../types';

let totalTests = 0;
let passedTests = 0;

function assert(condition: boolean, testName: string, detail?: string) {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`  [PASS] ${testName}`);
  } else {
    console.error(`  [FAIL] ${testName}${detail ? ` - ${detail}` : ''}`);
  }
}

async function runAuthRBACTests() {
  console.log('\n======================================================');
  console.log(' RUNNING PHASE 3: AUTH & RBAC VERIFICATION SUITE');
  console.log('======================================================\n');

  // --------------------------------------------------------------------------
  // TEST 1: Password Hashing & Verification (bcryptjs)
  // --------------------------------------------------------------------------
  console.log('--- Suite 1: Password Hashing & Timing Protection ---');
  const plainPassword = 'SecurePassword@2026';
  const hashedPassword = await AuthService.hashPassword(plainPassword);

  assert(
    typeof hashedPassword === 'string' && hashedPassword.startsWith('$2'),
    'AuthService.hashPassword creates valid bcrypt hash'
  );

  const isMatch = await AuthService.verifyPassword(plainPassword, hashedPassword);
  assert(isMatch === true, 'AuthService.verifyPassword accepts correct password');

  const isWrongMatch = await AuthService.verifyPassword('WrongPassword', hashedPassword);
  assert(isWrongMatch === false, 'AuthService.verifyPassword rejects incorrect password');

  // --------------------------------------------------------------------------
  // TEST 2: JWT Session Token Creation & Verification (jose)
  // --------------------------------------------------------------------------
  console.log('\n--- Suite 2: JWT Session Token Engine (jose) ---');
  const mockPayload = {
    sub: '11111111-2222-3333-4444-555555555555',
    tenantId: 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee',
    role: Role.TEACHER,
    email: 'teacher@dps.edu.in',
    firstName: 'Anandita',
    lastName: 'Sen',
  };

  const token = await createSessionToken(mockPayload);
  assert(typeof token === 'string' && token.split('.').length === 3, 'createSessionToken outputs signed 3-part JWT');

  const verified = await verifySessionToken(token);
  assert(verified !== null, 'verifySessionToken decodes valid token');
  assert(verified?.sub === mockPayload.sub, 'verifySessionToken preserves userId (sub)');
  assert(verified?.tenantId === mockPayload.tenantId, 'verifySessionToken preserves tenantId');
  assert(verified?.role === Role.TEACHER, 'verifySessionToken preserves role');

  // Tampered token test
  const tamperedToken = token.slice(0, -5) + 'xxxxx';
  const tamperedVerified = await verifySessionToken(tamperedToken);
  assert(tamperedVerified === null, 'verifySessionToken strictly rejects tampered token signatures');

  const emptyVerified = await verifySessionToken('invalid.token.string');
  assert(emptyVerified === null, 'verifySessionToken handles garbage token strings safely');

  // --------------------------------------------------------------------------
  // TEST 3: Unified Student & Parent Portal Navigation
  // --------------------------------------------------------------------------
  console.log('\n--- Suite 3: Unified Portal Navigation Invariants ---');
  assert(
    getRoleDefaultPath(Role.STUDENT) === '/',
    'Student role routes to primary dashboard (/)'
  );
  assert(
    getRoleDefaultPath(Role.PARENT) === '/',
    'Parent role routes to identical unified student dashboard (/)'
  );
  assert(
    getRoleDefaultPath(Role.TEACHER) === '/teacher',
    'Teacher role routes to /teacher'
  );
  assert(
    getRoleDefaultPath(Role.ADMIN) === '/admin',
    'Admin role routes to /admin'
  );
  assert(
    getRoleDefaultPath(Role.SUPER_ADMIN) === '/superadmin',
    'Super Admin role routes to /superadmin'
  );
  assert(
    getRoleDefaultPath(Role.ACCOUNTANT) === '/admin/fees',
    'Accountant role routes to /admin/fees'
  );

  // --------------------------------------------------------------------------
  // TEST 4: Role-Based Access Control (RBAC) Route Guards
  // --------------------------------------------------------------------------
  console.log('\n--- Suite 4: RBAC Route Guard Permissions ---');
  // Admin route checks
  assert(isRouteAllowedForRole(Role.ADMIN, '/admin') === true, 'Admin allowed on /admin');
  assert(isRouteAllowedForRole(Role.TEACHER, '/admin') === false, 'Teacher forbidden on /admin');
  assert(isRouteAllowedForRole(Role.STUDENT, '/admin') === false, 'Student forbidden on /admin');
  assert(isRouteAllowedForRole(Role.PARENT, '/admin') === false, 'Parent forbidden on /admin');

  // Teacher route checks
  assert(isRouteAllowedForRole(Role.TEACHER, '/teacher') === true, 'Teacher allowed on /teacher');
  assert(isRouteAllowedForRole(Role.STUDENT, '/teacher') === false, 'Student forbidden on /teacher');
  assert(isRouteAllowedForRole(Role.PARENT, '/teacher') === false, 'Parent forbidden on /teacher');

  // Super Admin bypass checks
  assert(isRouteAllowedForRole(Role.SUPER_ADMIN, '/admin') === true, 'Super Admin allowed on /admin');
  assert(isRouteAllowedForRole(Role.SUPER_ADMIN, '/teacher') === true, 'Super Admin allowed on /teacher');
  assert(isRouteAllowedForRole(Role.SUPER_ADMIN, '/superadmin') === true, 'Super Admin allowed on /superadmin');
  assert(isRouteAllowedForRole(Role.ADMIN, '/superadmin') === false, 'School Admin forbidden on /superadmin');

  // Unified student/parent portal checks
  assert(isRouteAllowedForRole(Role.STUDENT, '/') === true, 'Student allowed on unified portal (/)');
  assert(isRouteAllowedForRole(Role.PARENT, '/') === true, 'Parent allowed on unified portal (/)');

  // --------------------------------------------------------------------------
  // TEST 5: Boundary Zod Validation (LoginSchema)
  // --------------------------------------------------------------------------
  console.log('\n--- Suite 5: Boundary Zod Validation ---');
  const validResult = LoginSchema.safeParse({
    email: 'rohan.sharma@dps.edu.in',
    password: 'Password@123',
  });
  assert(validResult.success === true, 'LoginSchema accepts valid email and password');

  const invalidEmailResult = LoginSchema.safeParse({
    email: 'not-an-email',
    password: 'Password@123',
  });
  assert(invalidEmailResult.success === false, 'LoginSchema rejects invalid email format');

  const emptyPasswordResult = LoginSchema.safeParse({
    email: 'rohan.sharma@dps.edu.in',
    password: '',
  });
  assert(emptyPasswordResult.success === false, 'LoginSchema rejects empty password');

  const unknownFieldResult = LoginSchema.safeParse({
    email: 'rohan.sharma@dps.edu.in',
    password: 'Password@123',
    injectedRole: 'SUPER_ADMIN', // Mass assignment exploit attempt
  });
  assert(unknownFieldResult.success === false, 'LoginSchema strict() rejects unexpected injected fields');

  // --------------------------------------------------------------------------
  // FINAL SCORECARD
  // --------------------------------------------------------------------------
  console.log('\n======================================================');
  console.log(` RESULTS: ${passedTests} / ${totalTests} TESTS PASSED`);
  console.log('======================================================\n');

  if (passedTests !== totalTests) {
    process.exit(1);
  }
}

runAuthRBACTests().catch((err) => {
  console.error('Test execution error:', err);
  process.exit(1);
});
