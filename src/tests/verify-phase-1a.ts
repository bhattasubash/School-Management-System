import { NextRequest } from 'next/server';
import { loadEnvConfig } from '@next/env';

// Load environment configuration from .env
loadEnvConfig(process.cwd());

import { middleware } from '@/middleware';
import {
  createSessionToken,
  getJwtSecretKey,
} from '@/lib/jwt';
import {
  validateSpreadsheetBuffer,
  parseSpreadsheetRows,
  createExcelWorkbookBuffer,
  MAX_FILE_SIZE_BYTES,
} from '@/lib/excel';
import { Role } from '@/types';

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

async function runPhase1AVerification() {
  console.log('\n======================================================');
  console.log(' RUNNING PHASE 1A CRITICAL SECURITY HARMONIZATION TESTS');
  console.log('======================================================\n');

  // --------------------------------------------------------------------------
  // SUITE 1: Next.js Middleware Protection & CVE-2025-29927 Defense-in-Depth
  // --------------------------------------------------------------------------
  console.log('--- Suite 1: Middleware & CVE-2025-29927 Subrequest Protection ---');

  // 1.1 Forged x-middleware-subrequest header without session on protected page
  const forgedPageReq = new NextRequest(new URL('/admin/dashboard', 'http://localhost:3000'), {
    headers: {
      'host': 'localhost:3000',
      'x-middleware-subrequest': '1',
      'x-middleware-rewrite': 'http://localhost:3000/superadmin',
    },
  });
  const forgedPageRes = await middleware(forgedPageReq);
  const location = forgedPageRes.headers.get('location') || '';
  assert(
    forgedPageRes.status === 307 || forgedPageRes.status === 308 || forgedPageRes.status === 302 || location.includes('/login'),
    'Unauthenticated forged x-middleware-subrequest on /admin redirects to login',
    `Status: ${forgedPageRes.status}, Location: ${location}`
  );

  // 1.2 Forged x-middleware-subrequest header without session on protected API route
  const forgedApiReq = new NextRequest(new URL('/api/admin/users', 'http://localhost:3000'), {
    headers: {
      'host': 'localhost:3000',
      'x-middleware-subrequest': 'true',
    },
  });
  const forgedApiRes = await middleware(forgedApiReq);
  assert(
    forgedApiRes.status === 401,
    'Unauthenticated forged x-middleware-subrequest on /api/admin/* returns 401 Unauthorized',
    `Status: ${forgedApiRes.status}`
  );

  // 1.3 Forged subrequest on /teacher route
  const forgedTeacherReq = new NextRequest(new URL('/teacher/classes', 'http://localhost:3000'), {
    headers: {
      'host': 'localhost:3000',
      'x-middleware-subrequest': '1',
    },
  });
  const forgedTeacherRes = await middleware(forgedTeacherReq);
  const teacherLoc = forgedTeacherRes.headers.get('location') || '';
  assert(
    teacherLoc.includes('/login'),
    'Unauthenticated forged subrequest on /teacher redirects to login',
    `Location: ${teacherLoc}`
  );

  // 1.4 Forged subrequest on /superadmin route
  const forgedSuperAdminReq = new NextRequest(new URL('/superadmin/tenants', 'http://localhost:3000'), {
    headers: {
      'host': 'localhost:3000',
      'x-middleware-subrequest': '1',
    },
  });
  const forgedSuperAdminRes = await middleware(forgedSuperAdminReq);
  const superAdminLoc = forgedSuperAdminRes.headers.get('location') || '';
  assert(
    superAdminLoc.includes('/login'),
    'Unauthenticated forged subrequest on /superadmin redirects to login',
    `Location: ${superAdminLoc}`
  );

  // --------------------------------------------------------------------------
  // SUITE 2: Accountant Least-Privilege Route Isolation
  // --------------------------------------------------------------------------
  console.log('\n--- Suite 2: Accountant Least-Privilege Authorization Matrix ---');

  const accountantToken = await createSessionToken({
    sub: '00000000-0000-0000-0000-accountant01',
    email: 'accountant@school.edu.in',
    role: Role.ACCOUNTANT,
    tenantId: '11111111-1111-1111-1111-111111111111',
    firstName: 'Mohan',
    lastName: 'Sharma',
  });

  // 2.1 Accountant allowed on /admin/fees
  const accFeesReq = new NextRequest(new URL('/admin/fees', 'http://localhost:3000'), {
    headers: {
      'host': 'localhost:3000',
      'cookie': `session_token=${accountantToken}`,
    },
  });
  const accFeesRes = await middleware(accFeesReq);
  const accFeesLoc = accFeesRes.headers.get('location') || '';
  assert(
    !accFeesLoc.includes('/unauthorized') && !accFeesLoc.includes('/login'),
    'Accountant is allowed to access /admin/fees',
    `Location: ${accFeesLoc}`
  );

  // 2.2 Accountant allowed on /api/admin/fees
  const accFeesApiReq = new NextRequest(new URL('/api/admin/fees', 'http://localhost:3000'), {
    headers: {
      'host': 'localhost:3000',
      'cookie': `session_token=${accountantToken}`,
    },
  });
  const accFeesApiRes = await middleware(accFeesApiReq);
  assert(
    accFeesApiRes.status !== 403 && accFeesApiRes.status !== 401,
    'Accountant is allowed to access /api/admin/fees',
    `Status: ${accFeesApiRes.status}`
  );

  // 2.3 Accountant blocked from /admin/students
  const accStudentsReq = new NextRequest(new URL('/admin/students', 'http://localhost:3000'), {
    headers: {
      'host': 'localhost:3000',
      'cookie': `session_token=${accountantToken}`,
    },
  });
  const accStudentsRes = await middleware(accStudentsReq);
  const accStudentsLoc = accStudentsRes.headers.get('location') || '';
  assert(
    accStudentsLoc.includes('/unauthorized'),
    'Accountant is blocked from /admin/students and redirected to /unauthorized',
    `Location: ${accStudentsLoc}`
  );

  // 2.4 Accountant blocked from /admin/teachers
  const accTeachersReq = new NextRequest(new URL('/admin/teachers', 'http://localhost:3000'), {
    headers: {
      'host': 'localhost:3000',
      'cookie': `session_token=${accountantToken}`,
    },
  });
  const accTeachersRes = await middleware(accTeachersReq);
  const accTeachersLoc = accTeachersRes.headers.get('location') || '';
  assert(
    accTeachersLoc.includes('/unauthorized'),
    'Accountant is blocked from /admin/teachers and redirected to /unauthorized',
    `Location: ${accTeachersLoc}`
  );

  // 2.5 Accountant blocked from /admin/admissions
  const accAdmissionsReq = new NextRequest(new URL('/admin/admissions', 'http://localhost:3000'), {
    headers: {
      'host': 'localhost:3000',
      'cookie': `session_token=${accountantToken}`,
    },
  });
  const accAdmissionsRes = await middleware(accAdmissionsReq);
  const accAdmissionsLoc = accAdmissionsRes.headers.get('location') || '';
  assert(
    accAdmissionsLoc.includes('/unauthorized'),
    'Accountant is blocked from /admin/admissions and redirected to /unauthorized',
    `Location: ${accAdmissionsLoc}`
  );

  // 2.6 Accountant blocked from /api/admin/students (API returns 403)
  const accStudentsApiReq = new NextRequest(new URL('/api/admin/students', 'http://localhost:3000'), {
    headers: {
      'host': 'localhost:3000',
      'cookie': `session_token=${accountantToken}`,
    },
  });
  const accStudentsApiRes = await middleware(accStudentsApiReq);
  assert(
    accStudentsApiRes.status === 403,
    'Accountant receives 403 Forbidden on /api/admin/students',
    `Status: ${accStudentsApiRes.status}`
  );

  // 2.7 Accountant blocked from /superadmin
  const accSuperAdminReq = new NextRequest(new URL('/superadmin', 'http://localhost:3000'), {
    headers: {
      'host': 'localhost:3000',
      'cookie': `session_token=${accountantToken}`,
    },
  });
  const accSuperAdminRes = await middleware(accSuperAdminReq);
  const accSuperAdminLoc = accSuperAdminRes.headers.get('location') || '';
  assert(
    accSuperAdminLoc.includes('/unauthorized'),
    'Accountant is blocked from /superadmin and redirected to /unauthorized',
    `Location: ${accSuperAdminLoc}`
  );

  // --------------------------------------------------------------------------
  // SUITE 3: JWT Fail-Closed Security Under Missing/Weak Secrets
  // --------------------------------------------------------------------------
  console.log('\n--- Suite 3: JWT Production Fail-Closed Invariants ---');

  // In test mode, getJwtSecretKey returns valid key
  const validKey = getJwtSecretKey();
  assert(
    validKey instanceof Uint8Array && validKey.length >= 32,
    'getJwtSecretKey returns >= 32-byte key in test environment'
  );

  // Simulate production environment with missing JWT_SECRET
  const originalEnv = process.env.NODE_ENV;
  const originalSecret = process.env.JWT_SECRET;
  try {
    (process.env as any).NODE_ENV = 'production';
    process.env.JWT_SECRET = '';

    let threwError = false;
    try {
      getJwtSecretKey();
    } catch (err: any) {
      threwError = true;
      assert(
        err.message.includes('FATAL SECURITY MISCONFIGURATION'),
        'getJwtSecretKey throws FATAL error when JWT_SECRET is empty in production'
      );
    }
    assert(threwError, 'getJwtSecretKey strictly fails closed when secret is empty in production');

    // Test with secret shorter than 32 characters
    process.env.JWT_SECRET = 'too-short-secret';
    let threwShortError = false;
    try {
      getJwtSecretKey();
    } catch (err: any) {
      threwShortError = true;
      assert(
        err.message.includes('FATAL SECURITY MISCONFIGURATION'),
        'getJwtSecretKey throws FATAL error when JWT_SECRET is < 32 chars in production'
      );
    }
    assert(threwShortError, 'getJwtSecretKey rejects secrets < 32 characters in production');
  } finally {
    (process.env as any).NODE_ENV = originalEnv;
    process.env.JWT_SECRET = originalSecret;
  }

  // --------------------------------------------------------------------------
  // SUITE 4: ExcelJS & Spreadsheet Upload Security Guards
  // --------------------------------------------------------------------------
  console.log('\n--- Suite 4: Spreadsheet Upload Security Validation ---');

  // 4.1 Generate a valid OpenXML spreadsheet buffer using createExcelWorkbookBuffer
  const validColumns = [
    { header: 'Admission Number', key: 'admissionNumber', width: 20 },
    { header: 'First Name', key: 'firstName', width: 18 },
    { header: 'Class', key: 'class', width: 15 },
    { header: 'Section', key: 'section', width: 12 },
  ];
  const sampleData = [
    { admissionNumber: 'ADM-001', firstName: 'Rahul', class: 'Class 10', section: 'A' },
    { admissionNumber: 'ADM-002', firstName: 'Priya', class: 'Class 10', section: 'B' },
  ];
  const validBuffer = await createExcelWorkbookBuffer('Students', validColumns, sampleData);

  assert(
    validBuffer.length > 0,
    'createExcelWorkbookBuffer successfully generates non-empty buffer'
  );

  // 4.2 Validate legitimate .xlsx buffer
  const validCheck = validateSpreadsheetBuffer(validBuffer, 'students.xlsx');
  assert(
    validCheck.valid === true && validCheck.isCsv === false,
    'validateSpreadsheetBuffer accepts genuine OpenXML (.xlsx) buffer'
  );

  // 4.3 Parse legitimate .xlsx buffer
  const parsed = await parseSpreadsheetRows(validBuffer, 'students.xlsx');
  assert(
    parsed.totalRows === 2,
    'parseSpreadsheetRows parses exact row count from valid .xlsx',
    `Expected 2, got ${parsed.totalRows}`
  );
  assert(
    parsed.rows[0]['Admission Number'] === 'ADM-001' && parsed.rows[0]['First Name'] === 'Rahul',
    'parseSpreadsheetRows preserves header-keyed cell data accurately'
  );

  // 4.4 Reject oversized upload (> 5MB)
  const oversizedBuffer = Buffer.alloc(MAX_FILE_SIZE_BYTES + 1024);
  const oversizedCheck = validateSpreadsheetBuffer(oversizedBuffer, 'huge.xlsx');
  assert(
    oversizedCheck.valid === false && (oversizedCheck.error || '').includes('5MB security limit'),
    'validateSpreadsheetBuffer rejects files exceeding 5MB'
  );

  // 4.5 Reject Windows/DOS executable binary (MZ header: 0x4D, 0x5A)
  const mzBuffer = Buffer.from([0x4d, 0x5a, 0x90, 0x00, 0x03, 0x00, 0x00, 0x00]);
  const mzCheck = validateSpreadsheetBuffer(mzBuffer, 'malware.xlsx');
  assert(
    mzCheck.valid === false && (mzCheck.error || '').includes('Executable binary file upload rejected'),
    'validateSpreadsheetBuffer rejects files with MZ executable header'
  );

  // 4.6 Reject fake .xlsx (plain text masquerading as .xlsx)
  const fakeXlsxBuffer = Buffer.from('Admission Number,First Name\nADM-001,Rahul\n');
  const fakeCheck = validateSpreadsheetBuffer(fakeXlsxBuffer, 'spoofed.xlsx');
  assert(
    fakeCheck.valid === false && (fakeCheck.error || '').includes('Magic byte mismatch'),
    'validateSpreadsheetBuffer detects and rejects spoofed non-ZIP .xlsx file'
  );

  // 4.7 Accept legitimate CSV file
  const validCsvBuffer = Buffer.from('Admission Number,First Name,Class,Section\nADM-001,Rahul,Class 10,A\nADM-002,Priya,Class 10,B\n');
  const csvCheck = validateSpreadsheetBuffer(validCsvBuffer, 'students.csv');
  assert(
    csvCheck.valid === true && csvCheck.isCsv === true,
    'validateSpreadsheetBuffer accepts valid UTF-8 text .csv file'
  );

  // 4.8 Parse legitimate CSV file
  const parsedCsv = await parseSpreadsheetRows(validCsvBuffer, 'students.csv');
  assert(
    parsedCsv.totalRows === 2,
    'parseSpreadsheetRows parses legitimate CSV file properly'
  );

  // 4.9 Reject binary content / null bytes in CSV file
  const binaryCsvBuffer = Buffer.from('Admission Number\x00,First Name\nADM-001,Rahul\n');
  const binaryCsvCheck = validateSpreadsheetBuffer(binaryCsvBuffer, 'corrupted.csv');
  assert(
    binaryCsvCheck.valid === false && (binaryCsvCheck.error || '').includes('Binary content detected'),
    'validateSpreadsheetBuffer rejects CSV containing binary null bytes'
  );

  // 4.10 Enforce row limit threshold (> 2,000 rows limit or custom limit)
  let rowLimitThrew = false;
  try {
    // Test with maxRows = 1 on 2-row buffer
    await parseSpreadsheetRows(validBuffer, 'students.xlsx', 1);
  } catch (err: any) {
    rowLimitThrew = true;
    assert(
      err.message.includes('exceeds the maximum limit of 1 rows'),
      'parseSpreadsheetRows rejects uploads exceeding row threshold'
    );
  }
  assert(rowLimitThrew, 'parseSpreadsheetRows enforces maximum row count cap');

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

runPhase1AVerification()
  .then(() => {
    process.exit(0);
  })
  .catch((err) => {
    console.error('Fatal error running Phase 1A verification:', err);
    process.exit(1);
  });
