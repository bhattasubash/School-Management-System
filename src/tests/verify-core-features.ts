import {
  CreateAdmissionApplicationSchema,
  UpdateAdmissionStatusSchema,
  EnrollStudentFromApplicationSchema,
} from '../lib/validations/admission';
import {
  CreateFeeTermSchema,
  CollectFeePaymentSchema,
  GenerateQuarterlyInvoicesSchema,
} from '../lib/validations/fee-term';
import {
  ValidateTimetableSlotSchema,
  FindAvailableSubstitutesSchema,
  AssignSubstitutionSchema,
} from '../lib/validations/substitution';
import { calculateLateFineForInvoice } from '../services/fee-engine.service';

/**
 * Self-contained verification suite to validate all 3 Indian K-12 core features:
 * 1. Online Admission Funnel
 * 2. Indian Quarterly Fee & Late Fine Engine
 * 3. Timetable Conflict & Teacher Substitution
 */
function runVerificationSuite() {
  console.log('🧪 Starting Indian K-12 Core Features Verification Suite...\n');
  let passedCount = 0;
  let failedCount = 0;

  function assert(condition: boolean, testName: string, detail?: string) {
    if (condition) {
      console.log(`  ✅ PASS: ${testName}`);
      passedCount++;
    } else {
      console.error(`  ❌ FAIL: ${testName}${detail ? ` - ${detail}` : ''}`);
      failedCount++;
    }
  }

  // ==========================================================================
  // SUITE 1: ONLINE ADMISSION INTAKE & ENROLLMENT
  // ==========================================================================
  console.log('--- Suite 1: Admission Application & Enrollment Schemas ---');

  // Test 1.1: Valid Admission Application
  const validAdmissionInput = {
    academicYearId: '11111111-1111-1111-1111-111111111111',
    classGradeId: '22222222-2222-2222-2222-222222222222',
    studentFirstName: 'Aarav',
    studentLastName: 'Sharma',
    dateOfBirth: '2018-05-15',
    gender: 'MALE' as const,
    bloodGroup: 'B+',
    aadhaarNumber: '123456789012',
    parentName: 'Rajesh Sharma',
    parentPhone: '9876543210',
    parentEmail: 'rajesh.sharma@example.in',
    relationship: 'FATHER' as const,
    address: '42, Shanti Nagar, New Delhi',
    previousSchool: 'Little Flowers Prep School',
    previousMarks: 92.5,
    applicationFee: 500,
  };

  const parsedAdmission = CreateAdmissionApplicationSchema.safeParse(validAdmissionInput);
  assert(parsedAdmission.success, 'Valid admission application passes Zod validation');

  // Test 1.2: Invalid Aadhaar (not 12 digits)
  const invalidAadhaarInput = { ...validAdmissionInput, aadhaarNumber: '12345' };
  const aadhaarCheck = CreateAdmissionApplicationSchema.safeParse(invalidAadhaarInput);
  assert(!aadhaarCheck.success, 'Invalid Aadhaar number (<12 digits) is rejected');

  // Test 1.3: Status Transitions Schema
  const validStatusUpdate = {
    status: 'DOCUMENT_VERIFIED' as const,
    adminRemarks: 'Original birth certificate and Aadhaar verified successfully.',
  };
  const parsedStatus = UpdateAdmissionStatusSchema.safeParse(validStatusUpdate);
  assert(parsedStatus.success, 'Valid status transition to DOCUMENT_VERIFIED accepted');

  // Test 1.4: 1-Click Enrollment Schema
  const validEnrollmentInput = {
    sectionId: '33333333-3333-3333-3333-333333333333',
    admissionNumber: 'DPS-2026-0142',
    rollNumber: 15,
    feeStructureId: '44444444-4444-4444-4444-444444444444',
  };
  const parsedEnrollment = EnrollStudentFromApplicationSchema.safeParse(validEnrollmentInput);
  assert(parsedEnrollment.success, '1-Click enrollment input validated successfully');

  // ==========================================================================
  // SUITE 2: INDIAN QUARTERLY FEE & LATE FINE ENGINE
  // ==========================================================================
  console.log('\n--- Suite 2: Indian Fee Terms & Late Fine Engine ---');

  // Test 2.1: Valid Fee Term Schema (Quarter 1)
  const validFeeTermInput = {
    academicYearId: '11111111-1111-1111-1111-111111111111',
    name: 'Quarter 1 (Apr - Jun)',
    termNumber: 1,
    startDate: '2026-04-01',
    endDate: '2026-06-30',
    dueDate: '2026-04-10',
    lateFeeGraceDays: 10,
    lateFeeAmount: 50,
    lateFeePerDay: false,
  };
  const parsedFeeTerm = CreateFeeTermSchema.safeParse(validFeeTermInput);
  assert(parsedFeeTerm.success, 'Quarterly fee term schedule validated');

  // Test 2.2: Late Fine Calculation - Before Due Date
  const dueDate = new Date('2026-04-10');
  const termRule = {
    lateFeeGraceDays: 10,
    lateFeeAmount: 50,
    lateFeePerDay: false,
  };

  const beforeDueCheck = calculateLateFineForInvoice(
    { dueDate, feeTerm: termRule },
    new Date('2026-04-05') // 5 days before due date
  );
  assert(
    !beforeDueCheck.isOverdue && beforeDueCheck.lateFee === 0,
    'Before due date: isOverdue is false and late fee is 0'
  );

  // Test 2.3: Late Fine Calculation - Within 10-day Grace Period (e.g. 15th April)
  const withinGraceCheck = calculateLateFineForInvoice(
    { dueDate, feeTerm: termRule },
    new Date('2026-04-15') // 5 days past due, but within 10 days grace
  );
  assert(
    withinGraceCheck.isOverdue && !withinGraceCheck.gracePeriodExpired && withinGraceCheck.lateFee === 0,
    'Within grace period (April 15): isOverdue is true, but late fee is 0'
  );

  // Test 2.4: Late Fine Calculation - After Grace Period (April 25)
  const afterGraceCheck = calculateLateFineForInvoice(
    { dueDate, feeTerm: termRule },
    new Date('2026-04-25') // 15 days past due (15 > 10 grace days)
  );
  assert(
    afterGraceCheck.isOverdue && afterGraceCheck.gracePeriodExpired && afterGraceCheck.lateFee === 50,
    'After grace period (April 25): Flat late fine of ₹50 applied correctly'
  );

  // Test 2.5: Late Fine Calculation - Per-Day Rule (₹10/day after grace period)
  const perDayTermRule = {
    lateFeeGraceDays: 10,
    lateFeeAmount: 10,
    lateFeePerDay: true,
  };
  const perDayCheck = calculateLateFineForInvoice(
    { dueDate, feeTerm: perDayTermRule },
    new Date('2026-04-25') // 15 days past due: 15 - 10 grace days = 5 overdue days * ₹10 = ₹50
  );
  assert(
    perDayCheck.gracePeriodExpired && perDayCheck.lateFee === 50,
    'Per-day late fine calculation: 5 days past grace * ₹10/day = ₹50'
  );

  // Test 2.6: Payment Collection Schema
  const validPayment = {
    feeInvoiceId: '55555555-5555-5555-5555-555555555555',
    amount: 12500,
    paymentMethod: 'RAZORPAY_UPI' as const,
    razorpayPaymentId: 'pay_ABC123XYZ',
    remarks: 'Quarter 1 Tuition + Lab Fee',
  };
  const parsedPayment = CollectFeePaymentSchema.safeParse(validPayment);
  assert(parsedPayment.success, 'Fee payment collection schema validated');

  // ==========================================================================
  // SUITE 3: TIMETABLE CONFLICT & TEACHER SUBSTITUTION
  // ==========================================================================
  console.log('\n--- Suite 3: Timetable Conflict & Teacher Substitution ---');

  // Test 3.1: Slot Validation Schema
  const validSlot = {
    sectionId: '33333333-3333-3333-3333-333333333333',
    periodTimeSlotId: '66666666-6666-6666-6666-666666666666',
    dayOfWeek: 'MONDAY' as const,
    teacherId: '77777777-7777-7777-7777-777777777777',
    subjectId: '88888888-8888-8888-8888-888888888888',
  };
  const parsedSlot = ValidateTimetableSlotSchema.safeParse(validSlot);
  assert(parsedSlot.success, 'Timetable slot assignment schema validated');

  // Test 3.2: Find Available Substitutes Schema
  const validSearchSubstitutes = {
    date: '2026-09-23',
    periodTimeSlotId: '66666666-6666-6666-6666-666666666666',
  };
  const parsedSearch = FindAvailableSubstitutesSchema.safeParse(validSearchSubstitutes);
  assert(parsedSearch.success, 'Find available substitutes query validated');

  // Test 3.3: Assign Substitution Schema
  const validAssignSub = {
    timetableEntryId: '99999999-9999-9999-9999-999999999999',
    substituteTeacherId: '77777777-7777-7777-7777-777777777777',
    date: '2026-09-23',
    reason: 'Mathematics teacher on medical leave',
    assignedById: '00000000-0000-0000-0000-000000000001',
  };
  const parsedAssign = AssignSubstitutionSchema.safeParse(validAssignSub);
  assert(parsedAssign.success, 'Teacher substitution assignment validated');

  // ==========================================================================
  // SUMMARY
  // ==========================================================================
  console.log('\n==========================================================');
  console.log(`Total Checks: ${passedCount + failedCount} | Passed: ${passedCount} | Failed: ${failedCount}`);
  if (failedCount === 0) {
    console.log('🎉 ALL INDIAN K-12 CORE FEATURES VERIFIED SUCCESSFULLY!');
  } else {
    console.error('💥 Some verification tests failed. Please review.');
    process.exit(1);
  }
}

runVerificationSuite();
