import { execSync } from 'child_process';

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
];

console.log('\n======================================================');
console.log(' STARTING FULL PLATFORM REGRESSION SUITE RUN');
console.log('======================================================\n');

let passed = 0;
let failed = 0;

for (const suite of testSuites) {
  process.stdout.write(`Executing ${suite} ... `);
  try {
    execSync(`npx tsx ${suite}`, { stdio: 'pipe' });
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
