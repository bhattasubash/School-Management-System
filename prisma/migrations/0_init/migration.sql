-- CreateEnum
CREATE TYPE "SubscriptionStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('SUPER_ADMIN', 'ADMIN', 'TEACHER', 'ACCOUNTANT', 'PARENT', 'STUDENT');

-- CreateEnum
CREATE TYPE "Relationship" AS ENUM ('FATHER', 'MOTHER', 'GUARDIAN');

-- CreateEnum
CREATE TYPE "SubjectType" AS ENUM ('THEORY', 'PRACTICAL', 'LANGUAGE');

-- CreateEnum
CREATE TYPE "AttendanceStatus" AS ENUM ('PRESENT', 'ABSENT', 'LATE', 'HALF_DAY', 'EXCUSED');

-- CreateEnum
CREATE TYPE "FeeFrequency" AS ENUM ('MONTHLY', 'QUARTERLY', 'SEMI_ANNUAL', 'ANNUAL', 'ONE_TIME');

-- CreateEnum
CREATE TYPE "DiscountType" AS ENUM ('PERCENTAGE', 'FIXED');

-- CreateEnum
CREATE TYPE "InvoiceStatus" AS ENUM ('PENDING', 'PARTIAL', 'PAID', 'OVERDUE', 'CANCELLED');

-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('RAZORPAY_UPI', 'RAZORPAY_CARD', 'RAZORPAY_NETBANKING', 'RAZORPAY_WALLET', 'CASH', 'CHEQUE', 'BANK_TRANSFER', 'POS');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('SUCCESS', 'FAILED', 'PENDING', 'REFUNDED');

-- CreateEnum
CREATE TYPE "DayOfWeek" AS ENUM ('MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY');

-- CreateEnum
CREATE TYPE "NoticeAudience" AS ENUM ('ALL', 'TEACHERS', 'PARENTS', 'STUDENTS', 'SPECIFIC_CLASSES');

-- CreateEnum
CREATE TYPE "NoticePriority" AS ENUM ('NORMAL', 'IMPORTANT', 'URGENT');

-- CreateEnum
CREATE TYPE "AdmissionStatus" AS ENUM ('DRAFT', 'SUBMITTED', 'DOCUMENT_VERIFIED', 'INTERVIEW_SCHEDULED', 'APPROVED', 'ENROLLED', 'REJECTED');

-- CreateEnum
CREATE TYPE "SubstitutionStatus" AS ENUM ('ASSIGNED', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('GENERAL', 'ATTENDANCE', 'FEE', 'EXAM', 'EVENT', 'SYSTEM', 'LEAVE', 'COMPLAINT');

-- CreateEnum
CREATE TYPE "EventCategory" AS ENUM ('ACADEMIC', 'CULTURAL', 'SPORTS', 'ANNOUNCEMENT');

-- CreateEnum
CREATE TYPE "HolidayType" AS ENUM ('NATIONAL', 'STATE', 'SCHOOL', 'EXAM_BREAK');

-- CreateEnum
CREATE TYPE "ContactCategory" AS ENUM ('MEDICAL', 'ADMINISTRATION', 'SECURITY', 'FIRE', 'POLICE', 'OTHER');

-- CreateTable
CREATE TABLE "SubscriptionPlan" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "maxStudents" INTEGER NOT NULL,
    "maxStaff" INTEGER NOT NULL,
    "features" JSONB NOT NULL,
    "priceMonthly" DECIMAL(10,2) NOT NULL,
    "priceAnnual" DECIMAL(10,2) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SubscriptionPlan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Tenant" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "pincode" TEXT NOT NULL,
    "board" TEXT NOT NULL,
    "logoUrl" TEXT,
    "subscriptionPlanId" UUID NOT NULL,
    "subscriptionStatus" "SubscriptionStatus" NOT NULL DEFAULT 'ACTIVE',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "workingDays" "DayOfWeek"[] DEFAULT ARRAY['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY']::"DayOfWeek"[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Tenant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TenantDomain" (
    "id" UUID NOT NULL,
    "tenantId" UUID NOT NULL,
    "domain" TEXT NOT NULL,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "verificationToken" TEXT,
    "verifiedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TenantDomain_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TenantBranding" (
    "id" UUID NOT NULL,
    "tenantId" UUID NOT NULL,
    "primaryColor" TEXT NOT NULL DEFAULT '#111C2D',
    "secondaryColor" TEXT NOT NULL DEFAULT '#F4F6F9',
    "accentColor" TEXT NOT NULL DEFAULT '#FA896B',
    "logoUrl" TEXT,
    "faviconUrl" TEXT,
    "loginBannerUrl" TEXT,
    "tagline" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TenantBranding_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" UUID NOT NULL,
    "tenantId" UUID,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "passwordHash" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "role" "Role" NOT NULL,
    "avatarUrl" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "mustChangePassword" BOOLEAN NOT NULL DEFAULT false,
    "lastLoginAt" TIMESTAMP(3),
    "failedLoginAttempts" INTEGER NOT NULL DEFAULT 0,
    "lockedUntil" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RefreshToken" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "userAgent" TEXT,
    "ipAddress" TEXT,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RefreshToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TeacherProfile" (
    "id" UUID NOT NULL,
    "tenantId" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "employeeId" TEXT NOT NULL,
    "department" TEXT NOT NULL,
    "qualification" TEXT NOT NULL,
    "joiningDate" TIMESTAMP(3) NOT NULL,
    "specialization" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TeacherProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StudentProfile" (
    "id" UUID NOT NULL,
    "tenantId" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "admissionNumber" TEXT NOT NULL,
    "rollNumber" INTEGER,
    "sectionId" UUID NOT NULL,
    "dateOfBirth" TIMESTAMP(3) NOT NULL,
    "gender" TEXT NOT NULL,
    "bloodGroup" TEXT,
    "address" TEXT NOT NULL,
    "emergencyContact" TEXT NOT NULL,
    "admissionDate" TIMESTAMP(3) NOT NULL,
    "previousSchool" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StudentProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ParentProfile" (
    "id" UUID NOT NULL,
    "tenantId" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "occupation" TEXT,
    "annualIncome" DECIMAL(12,2),
    "relationship" "Relationship" NOT NULL DEFAULT 'FATHER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ParentProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ParentStudentLink" (
    "id" UUID NOT NULL,
    "tenantId" UUID NOT NULL,
    "parentId" UUID NOT NULL,
    "studentId" UUID NOT NULL,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ParentStudentLink_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AcademicYear" (
    "id" UUID NOT NULL,
    "tenantId" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "isCurrent" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AcademicYear_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClassGrade" (
    "id" UUID NOT NULL,
    "tenantId" UUID NOT NULL,
    "academicYearId" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "numericOrder" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ClassGrade_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Section" (
    "id" UUID NOT NULL,
    "tenantId" UUID NOT NULL,
    "classGradeId" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "classTeacherId" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Section_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Subject" (
    "id" UUID NOT NULL,
    "tenantId" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "subjectType" "SubjectType" NOT NULL DEFAULT 'THEORY',
    "isElective" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Subject_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClassSubjectTeacher" (
    "id" UUID NOT NULL,
    "tenantId" UUID NOT NULL,
    "sectionId" UUID NOT NULL,
    "subjectId" UUID NOT NULL,
    "teacherId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ClassSubjectTeacher_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StudentAttendance" (
    "id" UUID NOT NULL,
    "tenantId" UUID NOT NULL,
    "studentId" UUID NOT NULL,
    "sectionId" UUID NOT NULL,
    "date" DATE NOT NULL,
    "period" INTEGER,
    "status" "AttendanceStatus" NOT NULL DEFAULT 'PRESENT',
    "remarks" TEXT,
    "markedBy" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StudentAttendance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StaffAttendance" (
    "id" UUID NOT NULL,
    "tenantId" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "date" DATE NOT NULL,
    "status" "AttendanceStatus" NOT NULL DEFAULT 'PRESENT',
    "checkInTime" TIMESTAMP(3),
    "checkOutTime" TIMESTAMP(3),
    "remarks" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StaffAttendance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FeeCategory" (
    "id" UUID NOT NULL,
    "tenantId" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "isRecurring" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FeeCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FeeStructure" (
    "id" UUID NOT NULL,
    "tenantId" UUID NOT NULL,
    "academicYearId" UUID NOT NULL,
    "classGradeId" UUID NOT NULL,
    "feeCategoryId" UUID NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "frequency" "FeeFrequency" NOT NULL DEFAULT 'QUARTERLY',
    "dueDay" INTEGER NOT NULL DEFAULT 10,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FeeStructure_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FeeDiscount" (
    "id" UUID NOT NULL,
    "tenantId" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "discountType" "DiscountType" NOT NULL DEFAULT 'PERCENTAGE',
    "value" DECIMAL(10,2) NOT NULL,
    "applicableCategories" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FeeDiscount_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FeeInvoice" (
    "id" UUID NOT NULL,
    "tenantId" UUID NOT NULL,
    "studentId" UUID NOT NULL,
    "academicYearId" UUID NOT NULL,
    "invoiceNumber" TEXT NOT NULL,
    "totalAmount" DECIMAL(10,2) NOT NULL,
    "discountAmount" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "lateFee" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "netAmount" DECIMAL(10,2) NOT NULL,
    "paidAmount" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "balanceAmount" DECIMAL(10,2) NOT NULL,
    "dueDate" TIMESTAMP(3) NOT NULL,
    "status" "InvoiceStatus" NOT NULL DEFAULT 'PENDING',
    "feeTermId" UUID,
    "generatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "FeeInvoice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FeeInvoiceItem" (
    "id" UUID NOT NULL,
    "tenantId" UUID NOT NULL,
    "feeInvoiceId" UUID NOT NULL,
    "feeCategoryId" UUID NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FeeInvoiceItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FeePayment" (
    "id" UUID NOT NULL,
    "tenantId" UUID NOT NULL,
    "feeInvoiceId" UUID NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "paymentMethod" "PaymentMethod" NOT NULL,
    "razorpayPaymentId" TEXT,
    "razorpayOrderId" TEXT,
    "razorpaySignature" TEXT,
    "receiptNumber" TEXT NOT NULL,
    "status" "PaymentStatus" NOT NULL DEFAULT 'SUCCESS',
    "collectedById" UUID,
    "remarks" TEXT,
    "transactionDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FeePayment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExamTerm" (
    "id" UUID NOT NULL,
    "tenantId" UUID NOT NULL,
    "academicYearId" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "isLocked" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ExamTerm_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExamSchedule" (
    "id" UUID NOT NULL,
    "tenantId" UUID NOT NULL,
    "examTermId" UUID NOT NULL,
    "classGradeId" UUID NOT NULL,
    "subjectId" UUID NOT NULL,
    "examDate" DATE NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "maxMarks" DECIMAL(5,2) NOT NULL,
    "passingMarks" DECIMAL(5,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ExamSchedule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExamResult" (
    "id" UUID NOT NULL,
    "tenantId" UUID NOT NULL,
    "examScheduleId" UUID NOT NULL,
    "studentId" UUID NOT NULL,
    "marksObtained" DECIMAL(5,2) NOT NULL,
    "grade" TEXT,
    "gradePoint" DECIMAL(3,1),
    "remarks" TEXT,
    "enteredById" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ExamResult_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GradeScale" (
    "id" UUID NOT NULL,
    "tenantId" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "minPercentage" DECIMAL(5,2) NOT NULL,
    "maxPercentage" DECIMAL(5,2) NOT NULL,
    "grade" TEXT NOT NULL,
    "gradePoint" DECIMAL(3,1) NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GradeScale_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PeriodTimeSlot" (
    "id" UUID NOT NULL,
    "tenantId" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "isBreak" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PeriodTimeSlot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TimetableEntry" (
    "id" UUID NOT NULL,
    "tenantId" UUID NOT NULL,
    "sectionId" UUID NOT NULL,
    "periodTimeSlotId" UUID NOT NULL,
    "subjectId" UUID,
    "teacherId" UUID,
    "dayOfWeek" "DayOfWeek" NOT NULL,
    "roomNumber" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TimetableEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notice" (
    "id" UUID NOT NULL,
    "tenantId" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "authorId" UUID NOT NULL,
    "priority" "NoticePriority" NOT NULL DEFAULT 'NORMAL',
    "targetAudience" "NoticeAudience" NOT NULL DEFAULT 'ALL',
    "targetClasses" JSONB,
    "publishedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" UUID NOT NULL,
    "tenantId" UUID,
    "userId" UUID,
    "action" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT,
    "oldValues" JSONB,
    "newValues" JSONB,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ParentalConsent" (
    "id" UUID NOT NULL,
    "tenantId" UUID NOT NULL,
    "parentId" UUID NOT NULL,
    "studentId" UUID NOT NULL,
    "consentType" TEXT NOT NULL,
    "consentGiven" BOOLEAN NOT NULL DEFAULT true,
    "consentText" TEXT NOT NULL,
    "ipAddress" TEXT,
    "givenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "revokedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ParentalConsent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdmissionApplication" (
    "id" UUID NOT NULL,
    "tenantId" UUID NOT NULL,
    "academicYearId" UUID NOT NULL,
    "classGradeId" UUID NOT NULL,
    "applicationNumber" TEXT NOT NULL,
    "studentFirstName" TEXT NOT NULL,
    "studentLastName" TEXT NOT NULL,
    "dateOfBirth" DATE NOT NULL,
    "gender" TEXT NOT NULL,
    "bloodGroup" TEXT,
    "aadhaarNumber" TEXT,
    "parentName" TEXT NOT NULL,
    "parentPhone" TEXT NOT NULL,
    "parentEmail" TEXT,
    "relationship" "Relationship" NOT NULL DEFAULT 'FATHER',
    "address" TEXT NOT NULL,
    "previousSchool" TEXT,
    "previousMarks" DECIMAL(5,2),
    "applicationFee" DECIMAL(10,2) NOT NULL DEFAULT 500.00,
    "isFeePaid" BOOLEAN NOT NULL DEFAULT false,
    "paymentReference" TEXT,
    "status" "AdmissionStatus" NOT NULL DEFAULT 'SUBMITTED',
    "enrolledStudentId" UUID,
    "interviewDate" TIMESTAMP(3),
    "adminRemarks" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AdmissionApplication_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FeeTerm" (
    "id" UUID NOT NULL,
    "tenantId" UUID NOT NULL,
    "academicYearId" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "termNumber" INTEGER NOT NULL,
    "startDate" DATE NOT NULL,
    "endDate" DATE NOT NULL,
    "dueDate" DATE NOT NULL,
    "lateFeeGraceDays" INTEGER NOT NULL DEFAULT 10,
    "lateFeeAmount" DECIMAL(10,2) NOT NULL DEFAULT 50.00,
    "lateFeePerDay" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FeeTerm_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TeacherSubstitution" (
    "id" UUID NOT NULL,
    "tenantId" UUID NOT NULL,
    "timetableEntryId" UUID NOT NULL,
    "originalTeacherId" UUID NOT NULL,
    "substituteTeacherId" UUID NOT NULL,
    "date" DATE NOT NULL,
    "reason" TEXT,
    "status" "SubstitutionStatus" NOT NULL DEFAULT 'ASSIGNED',
    "assignedById" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TeacherSubstitution_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" UUID NOT NULL,
    "tenantId" UUID NOT NULL,
    "recipientId" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "actionUrl" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Event" (
    "id" UUID NOT NULL,
    "tenantId" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "eventDate" TIMESTAMP(3) NOT NULL,
    "eventTime" TEXT,
    "location" TEXT,
    "category" "EventCategory" NOT NULL,
    "imageUrl" TEXT,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "createdById" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Event_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Holiday" (
    "id" UUID NOT NULL,
    "tenantId" UUID NOT NULL,
    "sessionId" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "type" "HolidayType" NOT NULL,
    "isRecurring" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Holiday_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmergencyContact" (
    "id" UUID NOT NULL,
    "tenantId" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "designation" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT,
    "category" "ContactCategory" NOT NULL,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EmergencyContact_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Tenant_slug_key" ON "Tenant"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "TenantDomain_domain_key" ON "TenantDomain"("domain");

-- CreateIndex
CREATE INDEX "TenantDomain_tenantId_idx" ON "TenantDomain"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "TenantBranding_tenantId_key" ON "TenantBranding"("tenantId");

-- CreateIndex
CREATE INDEX "User_tenantId_role_idx" ON "User"("tenantId", "role");

-- CreateIndex
CREATE UNIQUE INDEX "User_tenantId_email_key" ON "User"("tenantId", "email");

-- CreateIndex
CREATE UNIQUE INDEX "RefreshToken_tokenHash_key" ON "RefreshToken"("tokenHash");

-- CreateIndex
CREATE INDEX "RefreshToken_userId_idx" ON "RefreshToken"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "TeacherProfile_userId_key" ON "TeacherProfile"("userId");

-- CreateIndex
CREATE INDEX "TeacherProfile_tenantId_idx" ON "TeacherProfile"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "TeacherProfile_tenantId_employeeId_key" ON "TeacherProfile"("tenantId", "employeeId");

-- CreateIndex
CREATE UNIQUE INDEX "StudentProfile_userId_key" ON "StudentProfile"("userId");

-- CreateIndex
CREATE INDEX "StudentProfile_tenantId_sectionId_idx" ON "StudentProfile"("tenantId", "sectionId");

-- CreateIndex
CREATE UNIQUE INDEX "StudentProfile_tenantId_admissionNumber_key" ON "StudentProfile"("tenantId", "admissionNumber");

-- CreateIndex
CREATE UNIQUE INDEX "ParentProfile_userId_key" ON "ParentProfile"("userId");

-- CreateIndex
CREATE INDEX "ParentProfile_tenantId_idx" ON "ParentProfile"("tenantId");

-- CreateIndex
CREATE INDEX "ParentStudentLink_tenantId_studentId_idx" ON "ParentStudentLink"("tenantId", "studentId");

-- CreateIndex
CREATE UNIQUE INDEX "ParentStudentLink_parentId_studentId_key" ON "ParentStudentLink"("parentId", "studentId");

-- CreateIndex
CREATE INDEX "AcademicYear_tenantId_isCurrent_idx" ON "AcademicYear"("tenantId", "isCurrent");

-- CreateIndex
CREATE UNIQUE INDEX "AcademicYear_tenantId_name_key" ON "AcademicYear"("tenantId", "name");

-- CreateIndex
CREATE INDEX "ClassGrade_tenantId_academicYearId_idx" ON "ClassGrade"("tenantId", "academicYearId");

-- CreateIndex
CREATE UNIQUE INDEX "ClassGrade_tenantId_academicYearId_name_key" ON "ClassGrade"("tenantId", "academicYearId", "name");

-- CreateIndex
CREATE INDEX "Section_tenantId_classGradeId_idx" ON "Section"("tenantId", "classGradeId");

-- CreateIndex
CREATE INDEX "Section_tenantId_classTeacherId_idx" ON "Section"("tenantId", "classTeacherId");

-- CreateIndex
CREATE UNIQUE INDEX "Section_classGradeId_name_key" ON "Section"("classGradeId", "name");

-- CreateIndex
CREATE INDEX "Subject_tenantId_idx" ON "Subject"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "Subject_tenantId_code_key" ON "Subject"("tenantId", "code");

-- CreateIndex
CREATE INDEX "ClassSubjectTeacher_tenantId_teacherId_idx" ON "ClassSubjectTeacher"("tenantId", "teacherId");

-- CreateIndex
CREATE UNIQUE INDEX "ClassSubjectTeacher_sectionId_subjectId_key" ON "ClassSubjectTeacher"("sectionId", "subjectId");

-- CreateIndex
CREATE INDEX "StudentAttendance_tenantId_sectionId_date_idx" ON "StudentAttendance"("tenantId", "sectionId", "date");

-- CreateIndex
CREATE INDEX "StudentAttendance_tenantId_markedBy_idx" ON "StudentAttendance"("tenantId", "markedBy");

-- CreateIndex
CREATE UNIQUE INDEX "StudentAttendance_tenantId_studentId_date_period_key" ON "StudentAttendance"("tenantId", "studentId", "date", "period");

-- CreateIndex
CREATE INDEX "StaffAttendance_tenantId_date_idx" ON "StaffAttendance"("tenantId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "StaffAttendance_tenantId_userId_date_key" ON "StaffAttendance"("tenantId", "userId", "date");

-- CreateIndex
CREATE INDEX "FeeCategory_tenantId_idx" ON "FeeCategory"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "FeeCategory_tenantId_name_key" ON "FeeCategory"("tenantId", "name");

-- CreateIndex
CREATE INDEX "FeeStructure_tenantId_classGradeId_idx" ON "FeeStructure"("tenantId", "classGradeId");

-- CreateIndex
CREATE UNIQUE INDEX "FeeStructure_tenantId_academicYearId_classGradeId_feeCatego_key" ON "FeeStructure"("tenantId", "academicYearId", "classGradeId", "feeCategoryId");

-- CreateIndex
CREATE INDEX "FeeDiscount_tenantId_idx" ON "FeeDiscount"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "FeeDiscount_tenantId_name_key" ON "FeeDiscount"("tenantId", "name");

-- CreateIndex
CREATE INDEX "FeeInvoice_tenantId_studentId_status_idx" ON "FeeInvoice"("tenantId", "studentId", "status");

-- CreateIndex
CREATE INDEX "FeeInvoice_tenantId_status_dueDate_idx" ON "FeeInvoice"("tenantId", "status", "dueDate");

-- CreateIndex
CREATE UNIQUE INDEX "FeeInvoice_tenantId_invoiceNumber_key" ON "FeeInvoice"("tenantId", "invoiceNumber");

-- CreateIndex
CREATE INDEX "FeeInvoiceItem_feeInvoiceId_idx" ON "FeeInvoiceItem"("feeInvoiceId");

-- CreateIndex
CREATE INDEX "FeeInvoiceItem_tenantId_feeCategoryId_idx" ON "FeeInvoiceItem"("tenantId", "feeCategoryId");

-- CreateIndex
CREATE UNIQUE INDEX "FeePayment_razorpayPaymentId_key" ON "FeePayment"("razorpayPaymentId");

-- CreateIndex
CREATE INDEX "FeePayment_tenantId_feeInvoiceId_idx" ON "FeePayment"("tenantId", "feeInvoiceId");

-- CreateIndex
CREATE INDEX "FeePayment_tenantId_collectedById_idx" ON "FeePayment"("tenantId", "collectedById");

-- CreateIndex
CREATE UNIQUE INDEX "FeePayment_tenantId_receiptNumber_key" ON "FeePayment"("tenantId", "receiptNumber");

-- CreateIndex
CREATE INDEX "ExamTerm_tenantId_academicYearId_idx" ON "ExamTerm"("tenantId", "academicYearId");

-- CreateIndex
CREATE UNIQUE INDEX "ExamTerm_tenantId_academicYearId_name_key" ON "ExamTerm"("tenantId", "academicYearId", "name");

-- CreateIndex
CREATE INDEX "ExamSchedule_tenantId_examTermId_idx" ON "ExamSchedule"("tenantId", "examTermId");

-- CreateIndex
CREATE INDEX "ExamSchedule_tenantId_subjectId_idx" ON "ExamSchedule"("tenantId", "subjectId");

-- CreateIndex
CREATE UNIQUE INDEX "ExamSchedule_examTermId_classGradeId_subjectId_key" ON "ExamSchedule"("examTermId", "classGradeId", "subjectId");

-- CreateIndex
CREATE INDEX "ExamResult_tenantId_studentId_idx" ON "ExamResult"("tenantId", "studentId");

-- CreateIndex
CREATE INDEX "ExamResult_tenantId_enteredById_idx" ON "ExamResult"("tenantId", "enteredById");

-- CreateIndex
CREATE UNIQUE INDEX "ExamResult_examScheduleId_studentId_key" ON "ExamResult"("examScheduleId", "studentId");

-- CreateIndex
CREATE INDEX "GradeScale_tenantId_idx" ON "GradeScale"("tenantId");

-- CreateIndex
CREATE INDEX "PeriodTimeSlot_tenantId_idx" ON "PeriodTimeSlot"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "PeriodTimeSlot_tenantId_order_key" ON "PeriodTimeSlot"("tenantId", "order");

-- CreateIndex
CREATE INDEX "TimetableEntry_tenantId_teacherId_dayOfWeek_idx" ON "TimetableEntry"("tenantId", "teacherId", "dayOfWeek");

-- CreateIndex
CREATE UNIQUE INDEX "TimetableEntry_sectionId_periodTimeSlotId_dayOfWeek_key" ON "TimetableEntry"("sectionId", "periodTimeSlotId", "dayOfWeek");

-- CreateIndex
CREATE INDEX "Notice_tenantId_publishedAt_idx" ON "Notice"("tenantId", "publishedAt");

-- CreateIndex
CREATE INDEX "AuditLog_tenantId_createdAt_idx" ON "AuditLog"("tenantId", "createdAt");

-- CreateIndex
CREATE INDEX "AuditLog_tenantId_action_idx" ON "AuditLog"("tenantId", "action");

-- CreateIndex
CREATE INDEX "ParentalConsent_tenantId_studentId_idx" ON "ParentalConsent"("tenantId", "studentId");

-- CreateIndex
CREATE INDEX "ParentalConsent_tenantId_parentId_idx" ON "ParentalConsent"("tenantId", "parentId");

-- CreateIndex
CREATE UNIQUE INDEX "AdmissionApplication_enrolledStudentId_key" ON "AdmissionApplication"("enrolledStudentId");

-- CreateIndex
CREATE INDEX "AdmissionApplication_tenantId_status_idx" ON "AdmissionApplication"("tenantId", "status");

-- CreateIndex
CREATE INDEX "AdmissionApplication_tenantId_classGradeId_idx" ON "AdmissionApplication"("tenantId", "classGradeId");

-- CreateIndex
CREATE UNIQUE INDEX "AdmissionApplication_tenantId_applicationNumber_key" ON "AdmissionApplication"("tenantId", "applicationNumber");

-- CreateIndex
CREATE INDEX "FeeTerm_tenantId_academicYearId_idx" ON "FeeTerm"("tenantId", "academicYearId");

-- CreateIndex
CREATE UNIQUE INDEX "FeeTerm_tenantId_academicYearId_termNumber_key" ON "FeeTerm"("tenantId", "academicYearId", "termNumber");

-- CreateIndex
CREATE INDEX "TeacherSubstitution_tenantId_date_idx" ON "TeacherSubstitution"("tenantId", "date");

-- CreateIndex
CREATE INDEX "TeacherSubstitution_tenantId_substituteTeacherId_date_idx" ON "TeacherSubstitution"("tenantId", "substituteTeacherId", "date");

-- CreateIndex
CREATE INDEX "TeacherSubstitution_tenantId_originalTeacherId_idx" ON "TeacherSubstitution"("tenantId", "originalTeacherId");

-- CreateIndex
CREATE INDEX "TeacherSubstitution_tenantId_assignedById_idx" ON "TeacherSubstitution"("tenantId", "assignedById");

-- CreateIndex
CREATE UNIQUE INDEX "TeacherSubstitution_tenantId_timetableEntryId_date_key" ON "TeacherSubstitution"("tenantId", "timetableEntryId", "date");

-- CreateIndex
CREATE INDEX "Notification_tenantId_recipientId_isRead_idx" ON "Notification"("tenantId", "recipientId", "isRead");

-- CreateIndex
CREATE INDEX "Notification_tenantId_createdAt_idx" ON "Notification"("tenantId", "createdAt");

-- CreateIndex
CREATE INDEX "Event_tenantId_isPublished_eventDate_idx" ON "Event"("tenantId", "isPublished", "eventDate");

-- CreateIndex
CREATE INDEX "Event_tenantId_createdById_idx" ON "Event"("tenantId", "createdById");

-- CreateIndex
CREATE INDEX "Holiday_tenantId_sessionId_idx" ON "Holiday"("tenantId", "sessionId");

-- CreateIndex
CREATE UNIQUE INDEX "Holiday_tenantId_sessionId_date_key" ON "Holiday"("tenantId", "sessionId", "date");

-- CreateIndex
CREATE INDEX "EmergencyContact_tenantId_idx" ON "EmergencyContact"("tenantId");

-- AddForeignKey
ALTER TABLE "Tenant" ADD CONSTRAINT "Tenant_subscriptionPlanId_fkey" FOREIGN KEY ("subscriptionPlanId") REFERENCES "SubscriptionPlan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TenantDomain" ADD CONSTRAINT "TenantDomain_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TenantBranding" ADD CONSTRAINT "TenantBranding_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RefreshToken" ADD CONSTRAINT "RefreshToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeacherProfile" ADD CONSTRAINT "TeacherProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeacherProfile" ADD CONSTRAINT "TeacherProfile_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentProfile" ADD CONSTRAINT "StudentProfile_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "Section"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentProfile" ADD CONSTRAINT "StudentProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentProfile" ADD CONSTRAINT "StudentProfile_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ParentProfile" ADD CONSTRAINT "ParentProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ParentProfile" ADD CONSTRAINT "ParentProfile_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ParentStudentLink" ADD CONSTRAINT "ParentStudentLink_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "ParentProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ParentStudentLink" ADD CONSTRAINT "ParentStudentLink_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "StudentProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ParentStudentLink" ADD CONSTRAINT "ParentStudentLink_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AcademicYear" ADD CONSTRAINT "AcademicYear_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClassGrade" ADD CONSTRAINT "ClassGrade_academicYearId_fkey" FOREIGN KEY ("academicYearId") REFERENCES "AcademicYear"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClassGrade" ADD CONSTRAINT "ClassGrade_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Section" ADD CONSTRAINT "Section_classGradeId_fkey" FOREIGN KEY ("classGradeId") REFERENCES "ClassGrade"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Section" ADD CONSTRAINT "Section_classTeacherId_fkey" FOREIGN KEY ("classTeacherId") REFERENCES "TeacherProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Section" ADD CONSTRAINT "Section_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subject" ADD CONSTRAINT "Subject_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClassSubjectTeacher" ADD CONSTRAINT "ClassSubjectTeacher_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "Section"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClassSubjectTeacher" ADD CONSTRAINT "ClassSubjectTeacher_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "Subject"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClassSubjectTeacher" ADD CONSTRAINT "ClassSubjectTeacher_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "TeacherProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClassSubjectTeacher" ADD CONSTRAINT "ClassSubjectTeacher_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentAttendance" ADD CONSTRAINT "StudentAttendance_markedBy_fkey" FOREIGN KEY ("markedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentAttendance" ADD CONSTRAINT "StudentAttendance_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "Section"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentAttendance" ADD CONSTRAINT "StudentAttendance_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "StudentProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentAttendance" ADD CONSTRAINT "StudentAttendance_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StaffAttendance" ADD CONSTRAINT "StaffAttendance_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StaffAttendance" ADD CONSTRAINT "StaffAttendance_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FeeCategory" ADD CONSTRAINT "FeeCategory_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FeeStructure" ADD CONSTRAINT "FeeStructure_academicYearId_fkey" FOREIGN KEY ("academicYearId") REFERENCES "AcademicYear"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FeeStructure" ADD CONSTRAINT "FeeStructure_classGradeId_fkey" FOREIGN KEY ("classGradeId") REFERENCES "ClassGrade"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FeeStructure" ADD CONSTRAINT "FeeStructure_feeCategoryId_fkey" FOREIGN KEY ("feeCategoryId") REFERENCES "FeeCategory"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FeeStructure" ADD CONSTRAINT "FeeStructure_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FeeDiscount" ADD CONSTRAINT "FeeDiscount_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FeeInvoice" ADD CONSTRAINT "FeeInvoice_academicYearId_fkey" FOREIGN KEY ("academicYearId") REFERENCES "AcademicYear"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FeeInvoice" ADD CONSTRAINT "FeeInvoice_feeTermId_fkey" FOREIGN KEY ("feeTermId") REFERENCES "FeeTerm"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FeeInvoice" ADD CONSTRAINT "FeeInvoice_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "StudentProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FeeInvoice" ADD CONSTRAINT "FeeInvoice_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FeeInvoiceItem" ADD CONSTRAINT "FeeInvoiceItem_feeCategoryId_fkey" FOREIGN KEY ("feeCategoryId") REFERENCES "FeeCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FeeInvoiceItem" ADD CONSTRAINT "FeeInvoiceItem_feeInvoiceId_fkey" FOREIGN KEY ("feeInvoiceId") REFERENCES "FeeInvoice"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FeeInvoiceItem" ADD CONSTRAINT "FeeInvoiceItem_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FeePayment" ADD CONSTRAINT "FeePayment_collectedById_fkey" FOREIGN KEY ("collectedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FeePayment" ADD CONSTRAINT "FeePayment_feeInvoiceId_fkey" FOREIGN KEY ("feeInvoiceId") REFERENCES "FeeInvoice"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FeePayment" ADD CONSTRAINT "FeePayment_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExamTerm" ADD CONSTRAINT "ExamTerm_academicYearId_fkey" FOREIGN KEY ("academicYearId") REFERENCES "AcademicYear"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExamTerm" ADD CONSTRAINT "ExamTerm_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExamSchedule" ADD CONSTRAINT "ExamSchedule_classGradeId_fkey" FOREIGN KEY ("classGradeId") REFERENCES "ClassGrade"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExamSchedule" ADD CONSTRAINT "ExamSchedule_examTermId_fkey" FOREIGN KEY ("examTermId") REFERENCES "ExamTerm"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExamSchedule" ADD CONSTRAINT "ExamSchedule_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "Subject"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExamSchedule" ADD CONSTRAINT "ExamSchedule_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExamResult" ADD CONSTRAINT "ExamResult_enteredById_fkey" FOREIGN KEY ("enteredById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExamResult" ADD CONSTRAINT "ExamResult_examScheduleId_fkey" FOREIGN KEY ("examScheduleId") REFERENCES "ExamSchedule"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExamResult" ADD CONSTRAINT "ExamResult_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "StudentProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExamResult" ADD CONSTRAINT "ExamResult_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GradeScale" ADD CONSTRAINT "GradeScale_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PeriodTimeSlot" ADD CONSTRAINT "PeriodTimeSlot_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TimetableEntry" ADD CONSTRAINT "TimetableEntry_periodTimeSlotId_fkey" FOREIGN KEY ("periodTimeSlotId") REFERENCES "PeriodTimeSlot"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TimetableEntry" ADD CONSTRAINT "TimetableEntry_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "Section"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TimetableEntry" ADD CONSTRAINT "TimetableEntry_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "Subject"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TimetableEntry" ADD CONSTRAINT "TimetableEntry_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "TeacherProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TimetableEntry" ADD CONSTRAINT "TimetableEntry_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notice" ADD CONSTRAINT "Notice_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notice" ADD CONSTRAINT "Notice_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ParentalConsent" ADD CONSTRAINT "ParentalConsent_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "ParentProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ParentalConsent" ADD CONSTRAINT "ParentalConsent_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "StudentProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ParentalConsent" ADD CONSTRAINT "ParentalConsent_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdmissionApplication" ADD CONSTRAINT "AdmissionApplication_academicYearId_fkey" FOREIGN KEY ("academicYearId") REFERENCES "AcademicYear"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdmissionApplication" ADD CONSTRAINT "AdmissionApplication_classGradeId_fkey" FOREIGN KEY ("classGradeId") REFERENCES "ClassGrade"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdmissionApplication" ADD CONSTRAINT "AdmissionApplication_enrolledStudentId_fkey" FOREIGN KEY ("enrolledStudentId") REFERENCES "StudentProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdmissionApplication" ADD CONSTRAINT "AdmissionApplication_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FeeTerm" ADD CONSTRAINT "FeeTerm_academicYearId_fkey" FOREIGN KEY ("academicYearId") REFERENCES "AcademicYear"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FeeTerm" ADD CONSTRAINT "FeeTerm_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeacherSubstitution" ADD CONSTRAINT "TeacherSubstitution_assignedById_fkey" FOREIGN KEY ("assignedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeacherSubstitution" ADD CONSTRAINT "TeacherSubstitution_originalTeacherId_fkey" FOREIGN KEY ("originalTeacherId") REFERENCES "TeacherProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeacherSubstitution" ADD CONSTRAINT "TeacherSubstitution_substituteTeacherId_fkey" FOREIGN KEY ("substituteTeacherId") REFERENCES "TeacherProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeacherSubstitution" ADD CONSTRAINT "TeacherSubstitution_timetableEntryId_fkey" FOREIGN KEY ("timetableEntryId") REFERENCES "TimetableEntry"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeacherSubstitution" ADD CONSTRAINT "TeacherSubstitution_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_recipientId_fkey" FOREIGN KEY ("recipientId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Holiday" ADD CONSTRAINT "Holiday_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmergencyContact" ADD CONSTRAINT "EmergencyContact_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

