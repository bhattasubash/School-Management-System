/**
 * PHASE 1C VERIFICATION SUITE
 *
 * Verifies:
 * 1. Aadhaar UIDAI compliance: masking last-4, AES-256-GCM encryption, decryption, tamper detection, and display sanitization.
 * 2. Aadhaar Zod validation schema and database migration helper.
 * 3. Redis fail-closed behavior for login rate limiting during Redis outages.
 * 4. Redis fail-closed behavior for session revocation during Redis outages.
 * 5. Session cookie security flags (httpOnly, secure, sameSite, path, maxAge).
 * 6. Next.js serverActions.allowedOrigins configuration in next.config.js.
 */

import assert from 'assert';
import { prisma } from '../lib/db';
import {
  maskAadhaar,
  encryptAadhaar,
  decryptAadhaar,
  processAadhaarForStorage,
  sanitizeAadhaarForDisplay,
  isValidAadhaarNumber,
  isAadhaarMasked,
  migrateAadhaarRecords,
} from '../lib/aadhaar';
import { CreateAdmissionApplicationSchema } from '../lib/validations/admission';
import { rateLimit, resetMemoryRateLimiter } from '../lib/rate-limit';
import {
  isSessionRevoked,
  revokeAllUserSessions,
  resetMemoryRevocationStore,
} from '../lib/session-revocation';
import { getSessionCookieOptions, SESSION_MAX_AGE } from '../lib/session';

async function runPhase1CTests() {
  console.log('====================================================');
  console.log('PHASE 1C: REMAINING SECURITY VERIFICATION SUITE');
  console.log('====================================================\n');

  let passed = 0;
  let total = 0;

  function test(name: string, fn: () => void | Promise<void>) {
    total++;
    try {
      const res = fn();
      if (res instanceof Promise) {
        return res
          .then(() => {
            passed++;
            console.log(`  [PASS] ${name}`);
          })
          .catch((err) => {
            console.error(`  [FAIL] ${name}: ${err.message}`);
            throw err;
          });
      }
      passed++;
      console.log(`  [PASS] ${name}`);
    } catch (err: any) {
      console.error(`  [FAIL] ${name}: ${err.message}`);
      throw err;
    }
  }

  // ============================================================================
  // SECTION 1: Aadhaar Masking & UIDAI Compliance
  // ============================================================================
  console.log('--- 1. Aadhaar Masking & UIDAI Compliance ---');

  test('1.1: Raw 12-digit Aadhaar number is masked to XXXX-XXXX-last4', () => {
    const raw = '123456789012';
    const masked = maskAadhaar(raw);
    assert.strictEqual(masked, 'XXXX-XXXX-9012');
  });

  test('1.2: Hyphen-separated 12-digit Aadhaar is normalized and masked', () => {
    const formatted = '9876-5432-1098';
    const masked = maskAadhaar(formatted);
    assert.strictEqual(masked, 'XXXX-XXXX-1098');
  });

  test('1.3: Already-masked Aadhaar string is safely preserved', () => {
    const alreadyMasked = 'XXXX-XXXX-4321';
    const result = maskAadhaar(alreadyMasked);
    assert.strictEqual(result, 'XXXX-XXXX-4321');
  });

  test('1.4: Null or empty Aadhaar input returns null', () => {
    assert.strictEqual(maskAadhaar(null), null);
    assert.strictEqual(maskAadhaar(''), null);
    assert.strictEqual(maskAadhaar('   '), null);
  });

  test('1.5: Malformed Aadhaar format throws error on masking attempt', () => {
    assert.throws(() => maskAadhaar('12345'), /Invalid Aadhaar format/);
    assert.throws(() => maskAadhaar('abcd-efgh-ijkl'), /Invalid Aadhaar format/);
  });

  test('1.6: Validation helpers correctly identify valid raw vs masked Aadhaar', () => {
    assert.strictEqual(isValidAadhaarNumber('123456789012'), true);
    assert.strictEqual(isValidAadhaarNumber('1234-5678-9012'), true);
    assert.strictEqual(isValidAadhaarNumber('12345'), false);
    assert.strictEqual(isAadhaarMasked('XXXX-XXXX-9012'), true);
    assert.strictEqual(isAadhaarMasked('XXXXXXXX9012'), true);
    assert.strictEqual(isAadhaarMasked('123456789012'), false);
  });

  // ============================================================================
  // SECTION 2: AES-256-GCM Encryption, Decryption & Tamper Proofing
  // ============================================================================
  console.log('\n--- 2. Aadhaar AES-256-GCM Encryption & Tamper Detection ---');

  const testKey = 'test-encryption-key-for-aadhaar-32chars!';

  test('2.1: Aadhaar encryption produces enc:v1 prefix with 3 hex parts (IV, Tag, Cipher)', () => {
    const raw = '987654321098';
    const encrypted = encryptAadhaar(raw, testKey);
    assert(encrypted.startsWith('enc:v1:'), 'Must start with enc:v1: prefix');
    const parts = encrypted.slice('enc:v1:'.length).split(':');
    assert.strictEqual(parts.length, 3, 'Must have IV, authTag, and ciphertext parts');
    assert.strictEqual(parts[0].length, 24, 'IV must be 12 bytes (24 hex characters)');
    assert.strictEqual(parts[1].length, 32, 'Auth tag must be 16 bytes (32 hex characters)');
  });

  test('2.2: Aadhaar decryption restores original 12-digit number', () => {
    const raw = '876543210987';
    const encrypted = encryptAadhaar(raw, testKey);
    const decrypted = decryptAadhaar(encrypted, testKey);
    assert.strictEqual(decrypted, raw);
  });

  test('2.3: Tampering with ciphertext fails GCM authentication check', () => {
    const raw = '876543210987';
    const encrypted = encryptAadhaar(raw, testKey);
    const parts = encrypted.slice('enc:v1:'.length).split(':');
    // Tamper with the last byte of ciphertext (parts[2])
    const lastPart = parts[2];
    const tamperedLast = lastPart.slice(0, -2) + (lastPart.slice(-2) === 'aa' ? 'bb' : 'aa');
    const tamperedPayload = `enc:v1:${parts[0]}:${parts[1]}:${tamperedLast}`;

    assert.throws(
      () => decryptAadhaar(tamperedPayload, testKey),
      /Unsupported state or unable to authenticate data|bad decrypt/i,
      'GCM must reject tampered ciphertext'
    );
  });

  test('2.4: Tampering with auth tag fails GCM authentication check', () => {
    const raw = '876543210987';
    const encrypted = encryptAadhaar(raw, testKey);
    const parts = encrypted.slice('enc:v1:'.length).split(':');
    // Tamper with auth tag (parts[1])
    const tamperedTag = parts[1].slice(0, -2) + (parts[1].slice(-2) === '00' ? '11' : '00');
    const tamperedPayload = `enc:v1:${parts[0]}:${tamperedTag}:${parts[2]}`;

    assert.throws(
      () => decryptAadhaar(tamperedPayload, testKey),
      /Unsupported state or unable to authenticate data|bad decrypt/i,
      'GCM must reject tampered auth tag'
    );
  });

  test('2.5: Attempting to encrypt invalid Aadhaar throws validation error', () => {
    assert.throws(() => encryptAadhaar('12345', testKey), /must be 12 digits/);
  });

  // ============================================================================
  // SECTION 3: Storage Processing & Display Sanitization
  // ============================================================================
  console.log('\n--- 3. Aadhaar Storage Processing & Display Sanitization ---');

  test('3.1: Default storage processing stores masked last-4 (no raw storage)', () => {
    delete process.env.AADHAAR_FULL_STORAGE_REQUIRED;
    const stored = processAadhaarForStorage('112233445566');
    assert.strictEqual(stored, 'XXXX-XXXX-5566');
  });

  test('3.2: Full storage processing stores AES-256-GCM encrypted payload when required', () => {
    process.env.AADHAAR_FULL_STORAGE_REQUIRED = 'true';
    const stored = processAadhaarForStorage('112233445566');
    assert(stored?.startsWith('enc:v1:'), 'Should store encrypted payload');
    delete process.env.AADHAAR_FULL_STORAGE_REQUIRED;
  });

  test('3.3: Display sanitization masks encrypted payload (NEVER displays raw digits)', () => {
    const encrypted = encryptAadhaar('554433221100');
    const display = sanitizeAadhaarForDisplay(encrypted);
    assert.strictEqual(display, 'XXXX-XXXX-1100', 'Decrypted display must still be masked');
  });

  test('3.4: Display sanitization masks legacy plaintext numbers', () => {
    const legacyPlaintext = '998877665544';
    const display = sanitizeAadhaarForDisplay(legacyPlaintext);
    assert.strictEqual(display, 'XXXX-XXXX-5544');
  });

  // ============================================================================
  // SECTION 4: Admission Validation Schema
  // ============================================================================
  console.log('\n--- 4. Admission Zod Schema Aadhaar Validation ---');

  const baseApplication = {
    academicYearId: 'a0000000-0000-0000-0000-000000000001',
    classGradeId: 'b0000000-0000-0000-0000-000000000001',
    studentFirstName: 'Rohan',
    studentLastName: 'Mehta',
    dateOfBirth: '2017-06-15',
    gender: 'MALE' as const,
    parentName: 'Suresh Mehta',
    parentPhone: '9876543210',
    address: '123 Park Avenue',
  };

  test('4.1: Schema accepts valid 12-digit raw Aadhaar', () => {
    const parsed = CreateAdmissionApplicationSchema.safeParse({
      ...baseApplication,
      aadhaarNumber: '123456789012',
    });
    assert(parsed.success, 'Valid 12 digits must pass');
  });

  test('4.2: Schema accepts pre-masked Aadhaar format', () => {
    const parsed = CreateAdmissionApplicationSchema.safeParse({
      ...baseApplication,
      aadhaarNumber: 'XXXX-XXXX-9012',
    });
    assert(parsed.success, 'Masked format must pass');
  });

  test('4.3: Schema rejects invalid Aadhaar strings (<12 digits or malformed)', () => {
    const parsedShort = CreateAdmissionApplicationSchema.safeParse({
      ...baseApplication,
      aadhaarNumber: '12345',
    });
    assert(!parsedShort.success, 'Short Aadhaar must fail');

    const parsedAlpha = CreateAdmissionApplicationSchema.safeParse({
      ...baseApplication,
      aadhaarNumber: '12345678901a',
    });
    assert(!parsedAlpha.success, 'Alphanumeric non-masked must fail');
  });

  // ============================================================================
  // SECTION 5: Aadhaar Database Migration / Backfill Helper
  // ============================================================================
  console.log('\n--- 5. Aadhaar Database Migration Helper ---');

  await test('5.1: migrateAadhaarRecords scans and transforms unmasked records', async () => {
    // Find existing seeded fixtures
    const tenant = await prisma.tenant.findFirstOrThrow();
    const academicYear = await prisma.academicYear.findFirstOrThrow({
      where: { tenantId: tenant.id },
    });
    const classGrade = await prisma.classGrade.findFirstOrThrow({
      where: { tenantId: tenant.id },
    });

    // Seed a legacy record with raw plaintext Aadhaar
    const appNumber = `MIGRATE-${Date.now()}`;
    const legacyApp = await prisma.admissionApplication.create({
      data: {
        tenantId: tenant.id,
        academicYearId: academicYear.id,
        classGradeId: classGrade.id,
        applicationNumber: appNumber,
        studentFirstName: 'Legacy',
        studentLastName: 'Student',
        dateOfBirth: new Date('2018-01-01'),
        gender: 'FEMALE',
        parentName: 'Legacy Parent',
        parentPhone: '9998887776',
        address: 'Test Address',
        aadhaarNumber: '987654321098', // Raw 12 digits
      },
    });

    // Run migration
    const result = await migrateAadhaarRecords(prisma);
    assert(result.totalChecked >= 1, 'Must check at least 1 record');
    assert(result.migrated >= 1, 'Must migrate the legacy record');

    // Verify record in database is now masked
    const updated = await prisma.admissionApplication.findUnique({
      where: { id: legacyApp.id },
    });
    assert(updated, 'Record must exist');
    assert.strictEqual(
      updated.aadhaarNumber,
      'XXXX-XXXX-1098',
      'Database record must now store masked last-4'
    );

    // Clean up test record
    await prisma.admissionApplication.delete({ where: { id: legacyApp.id } });
  });

  // ============================================================================
  // SECTION 6: Redis Fail-Closed Behavior for Login Rate Limiting
  // ============================================================================
  console.log('\n--- 6. Redis Rate Limit Fail-Closed Behavior ---');

  await test('6.1: When failClosed=true and Redis is offline, rateLimit denies requests', async () => {
    // When Redis is offline and failClosed is true:
    const result = await rateLimit({
      prefix: 'rl:login',
      key: `192.168.1.1:attacker@example.com`,
      maxRequests: 5,
      windowSeconds: 60,
      failClosed: true,
    });

    assert.strictEqual(result.allowed, false, 'Must deny request when Redis offline in fail-closed mode');
    assert.strictEqual(result.remaining, 0, 'Remaining count must be 0');
    assert(
      result.error?.includes('fail-closed'),
      `Error message must indicate fail-closed, got: ${result.error}`
    );
  });

  await test('6.2: When failClosed=false, rateLimit falls back gracefully to memory store', async () => {
    resetMemoryRateLimiter();
    const testKey = `graceful-${Date.now()}`;
    const result1 = await rateLimit({
      prefix: 'rl:test-open',
      key: testKey,
      maxRequests: 2,
      windowSeconds: 60,
      failClosed: false,
    });
    assert.strictEqual(result1.allowed, true, 'First attempt allowed in fallback');

    const result2 = await rateLimit({
      prefix: 'rl:test-open',
      key: testKey,
      maxRequests: 2,
      windowSeconds: 60,
      failClosed: false,
    });
    assert.strictEqual(result2.allowed, true, 'Second attempt allowed in fallback');

    const result3 = await rateLimit({
      prefix: 'rl:test-open',
      key: testKey,
      maxRequests: 2,
      windowSeconds: 60,
      failClosed: false,
    });
    assert.strictEqual(result3.allowed, false, 'Third attempt rejected by memory rate limiter');
  });

  // ============================================================================
  // SECTION 7: Redis Fail-Closed Behavior for Session Revocation
  // ============================================================================
  console.log('\n--- 7. Redis Session Revocation Fail-Closed Behavior ---');

  await test('7.1: When failClosed=true and Redis is offline, isSessionRevoked returns true (rejects session)', async () => {
    const userId = `failclosed-user-${Date.now()}`;
    const iatSeconds = Math.floor(Date.now() / 1000);

    const revoked = await isSessionRevoked(userId, iatSeconds, { failClosed: true });
    assert.strictEqual(
      revoked,
      true,
      'When Redis is unreachable in fail-closed mode, session MUST be treated as revoked'
    );
  });

  await test('7.2: When failClosed=true and Redis is offline, revokeAllUserSessions throws error', async () => {
    const userId = `failclosed-user-${Date.now()}`;

    await assert.rejects(
      async () => {
        await revokeAllUserSessions(userId, { failClosed: true });
      },
      /Failed to revoke sessions: Redis unavailable \(fail-closed\)/,
      'Must reject revocation when Redis cannot persist distributed event'
    );
  });

  await test('7.3: When failClosed=false, session revocation falls back to in-memory store', async () => {
    resetMemoryRevocationStore();
    const userId = `mem-user-${Date.now()}`;
    const nowSeconds = Math.floor(Date.now() / 1000);

    // Initial check: not revoked
    const initial = await isSessionRevoked(userId, nowSeconds, { failClosed: false });
    assert.strictEqual(initial, false, 'Session is valid before revocation in fallback store');

    // Revoke
    await revokeAllUserSessions(userId, { failClosed: false });

    // Past token is now revoked
    const pastRevoked = await isSessionRevoked(userId, nowSeconds - 5, { failClosed: false });
    assert.strictEqual(pastRevoked, true, 'Past token is revoked in memory store');

    // Future token is valid
    const futureValid = await isSessionRevoked(userId, nowSeconds + 5, { failClosed: false });
    assert.strictEqual(futureValid, false, 'Future token is valid in memory store');
  });

  // ============================================================================
  // SECTION 8: Cookie Security Flags
  // ============================================================================
  console.log('\n--- 8. Session Cookie Security Flags ---');

  test('8.1: getSessionCookieOptions enforces httpOnly, path, and 7-day maxAge', () => {
    const options = getSessionCookieOptions(SESSION_MAX_AGE);
    assert.strictEqual(options.httpOnly, true, 'Cookie MUST have httpOnly: true');
    assert.strictEqual(options.sameSite, 'lax', 'Cookie MUST have sameSite: lax');
    assert.strictEqual(options.path, '/', 'Cookie path MUST be /');
    assert.strictEqual(options.maxAge, 7 * 24 * 60 * 60, 'Cookie maxAge MUST be 7 days');
  });

  test('8.2: getSessionCookieOptions sets secure=true when NODE_ENV=production or COOKIE_SECURE=true', () => {
    const originalNodeEnv = process.env.NODE_ENV;
    const originalCookieSecure = process.env.COOKIE_SECURE;

    try {
      // Test production
      (process.env as any).NODE_ENV = 'production';
      delete process.env.COOKIE_SECURE;
      const prodOptions = getSessionCookieOptions();
      assert.strictEqual(prodOptions.secure, true, 'Must be secure: true in production');

      // Test COOKIE_SECURE=true
      (process.env as any).NODE_ENV = 'development';
      process.env.COOKIE_SECURE = 'true';
      const devSecureOptions = getSessionCookieOptions();
      assert.strictEqual(devSecureOptions.secure, true, 'Must be secure: true when COOKIE_SECURE=true');
    } finally {
      (process.env as any).NODE_ENV = originalNodeEnv;
      if (originalCookieSecure !== undefined) {
        process.env.COOKIE_SECURE = originalCookieSecure;
      } else {
        delete process.env.COOKIE_SECURE;
      }
    }
  });

  // ============================================================================
  // SECTION 9: Next.js serverActions.allowedOrigins Configuration
  // ============================================================================
  console.log('\n--- 9. Next.js serverActions.allowedOrigins ---');

  test('9.1: next.config.js configures experimental.serverActions.allowedOrigins', () => {
    // Dynamically require next.config.js
    const nextConfig = require('../../next.config.js');
    assert(nextConfig.experimental, 'next.config.js must have experimental block');
    assert(
      nextConfig.experimental.serverActions,
      'next.config.js must have experimental.serverActions block'
    );
    const origins = nextConfig.experimental.serverActions.allowedOrigins;
    assert(Array.isArray(origins), 'allowedOrigins must be an array');
    assert(origins.includes('localhost:3000'), 'Must include localhost:3000');
    assert(origins.includes('127.0.0.1:3000'), 'Must include 127.0.0.1:3000');
  });

  console.log('\n====================================================');
  console.log(`PHASE 1C COMPLETE: ${passed}/${total} TESTS PASSED`);
  console.log('====================================================\n');
}

runPhase1CTests()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Fatal error during Phase 1C verification:', err);
    process.exit(1);
  });
