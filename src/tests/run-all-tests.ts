import { execSync } from 'child_process';
import { loadEnvConfig } from '@next/env';

// Load environment configuration from .env
loadEnvConfig(process.cwd());

// ----------------------------------------------------------------------------
// SECURITY HARD GUARD: Dedicated Test Database Enforcement
// ----------------------------------------------------------------------------
// If DATABASE_URL_TEST is set and DATABASE_URL is not explicitly a test DB, use DATABASE_URL_TEST
if (process.env.DATABASE_URL_TEST && (!process.env.DATABASE_URL || !process.env.DATABASE_URL.includes('_test'))) {
  process.env.DATABASE_URL = process.env.DATABASE_URL_TEST;
}

const dbUrl = process.env.DATABASE_URL || '';
let dbName = '';
try {
  const parsed = new URL(dbUrl);
  dbName = parsed.pathname.replace(/^\//, '');
} catch {
  const match = dbUrl.match(/\/([^/?#]+)(\?|$)/);
  if (match) dbName = match[1];
}

if (!dbName || !dbName.endsWith('_test')) {
  console.error('\n======================================================');
  console.error(' [SECURITY HARD GUARD] TEST EXECUTION REFUSED:');
  console.error(` Target database "${dbName || 'UNKNOWN'}" does not end with "_test".`);
  console.error(' Tests can ONLY be executed against a dedicated test database.');
  console.error(' Please set DATABASE_URL to target a database ending in "_test"');
  console.error(' (e.g. DATABASE_URL=".../school_erp_test?schema=public").');
  console.error('======================================================\n');
  process.exit(1);
}

const testSuites = [
  'src/tests/verify-auth-rbac.ts',
  'src/tests/verify-core-features.ts',
  'src/tests/verify-attendance.ts',
  'src/tests/verify-portal-integration.ts',
  'src/tests/verify-admin-base.ts',
  'src/tests/verify-admin-directories.ts',
  'src/tests/verify-fee-counter.ts',
  'src/tests/verify-admin-admissions.ts',
  'src/tests/verify-admin-academics-notices.ts',
  'src/tests/verify-superadmin.ts',
  'src/tests/verify-phase-9.ts',
  'src/tests/verify-security-hardening.ts',
  'src/tests/verify-comprehensive-matrix.ts',
];

console.log('\n======================================================');
console.log(` STARTING FULL PLATFORM REGRESSION SUITE RUN`);
console.log(` Target Test Database: ${dbName}`);
console.log('======================================================\n');

let passed = 0;
let failed = 0;

for (const suite of testSuites) {
  process.stdout.write(`Executing ${suite} ... `);
  try {
    execSync(`npx tsx ${suite}`, { stdio: 'pipe', env: process.env });
    console.log('PASS');
    passed++;
  } catch (err: any) {
    console.log('FAIL');
    console.error(`Error in ${suite}:`, err.stderr?.toString() || err.message);
    failed++;
  }
}

console.log('\n======================================================');
console.log(` RESULTS: ${passed}/${testSuites.length} SUITES PASSED (${failed} FAILED)`);
console.log('======================================================\n');

if (failed > 0) {
  process.exit(1);
}
