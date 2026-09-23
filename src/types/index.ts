export const Role = {
  SUPER_ADMIN: 'SUPER_ADMIN',
  ADMIN: 'ADMIN',
  TEACHER: 'TEACHER',
  ACCOUNTANT: 'ACCOUNTANT',
  PARENT: 'PARENT',
  STUDENT: 'STUDENT',
} as const;

export type RoleType = (typeof Role)[keyof typeof Role];

export const SubscriptionStatus = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
  SUSPENDED: 'SUSPENDED',
} as const;

export const AttendanceStatus = {
  PRESENT: 'PRESENT',
  ABSENT: 'ABSENT',
  LATE: 'LATE',
  HALF_DAY: 'HALF_DAY',
  EXCUSED: 'EXCUSED',
} as const;

export const FeeFrequency = {
  MONTHLY: 'MONTHLY',
  QUARTERLY: 'QUARTERLY',
  SEMI_ANNUAL: 'SEMI_ANNUAL',
  ANNUAL: 'ANNUAL',
  ONE_TIME: 'ONE_TIME',
} as const;

export const InvoiceStatus = {
  PENDING: 'PENDING',
  PARTIAL: 'PARTIAL',
  PAID: 'PAID',
  OVERDUE: 'OVERDUE',
  CANCELLED: 'CANCELLED',
} as const;

export const PaymentMethod = {
  RAZORPAY_UPI: 'RAZORPAY_UPI',
  RAZORPAY_CARD: 'RAZORPAY_CARD',
  RAZORPAY_NETBANKING: 'RAZORPAY_NETBANKING',
  RAZORPAY_WALLET: 'RAZORPAY_WALLET',
  CASH: 'CASH',
  CHEQUE: 'CHEQUE',
  BANK_TRANSFER: 'BANK_TRANSFER',
  POS: 'POS',
} as const;

export const NoticePriority = {
  NORMAL: 'NORMAL',
  IMPORTANT: 'IMPORTANT',
  URGENT: 'URGENT',
} as const;

export const NoticeAudience = {
  ALL: 'ALL',
  TEACHERS: 'TEACHERS',
  PARENTS: 'PARENTS',
  STUDENTS: 'STUDENTS',
  SPECIFIC_CLASSES: 'SPECIFIC_CLASSES',
} as const;

export const AdmissionStatus = {
  DRAFT: 'DRAFT',
  SUBMITTED: 'SUBMITTED',
  DOCUMENT_VERIFIED: 'DOCUMENT_VERIFIED',
  INTERVIEW_SCHEDULED: 'INTERVIEW_SCHEDULED',
  APPROVED: 'APPROVED',
  ENROLLED: 'ENROLLED',
  REJECTED: 'REJECTED',
} as const;

export type AdmissionStatusType = (typeof AdmissionStatus)[keyof typeof AdmissionStatus];

export const SubstitutionStatus = {
  ASSIGNED: 'ASSIGNED',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
} as const;

export type SubstitutionStatusType = (typeof SubstitutionStatus)[keyof typeof SubstitutionStatus];


// ----------------------------------------------------------------------------
// TENANT CONTEXT & AUTH TYPES
// ----------------------------------------------------------------------------

export interface TenantContext {
  tenantId: string;
  slug: string;
  name: string;
  customDomain?: string | null;
  branding?: {
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
    logoUrl: string | null;
    faviconUrl: string | null;
    tagline: string | null;
  } | null;
}

export interface JWTPayload {
  sub: string; // userId
  tenantId: string | null; // null for Super Admin
  role: RoleType;
  email: string;
  firstName?: string;
  lastName?: string;
  iat?: number;
  exp?: number;
}

export interface UserSession {
  userId: string;
  tenantId: string | null;
  role: RoleType;
  email: string;
  firstName: string;
  lastName: string;
  avatarUrl?: string | null;
}

export interface AuthResult {
  success: boolean;
  user?: UserSession;
  redirectUrl?: string;
  error?: string;
}

// ----------------------------------------------------------------------------
// API STANDARD ENVELOPE
// ----------------------------------------------------------------------------

export interface ApiResponse<T = unknown> {
  success: boolean;
  data: T | null;
  error: {
    code: string;
    message: string;
    details?: Array<{ field?: string; message: string }> | null;
  } | null;
  meta: {
    timestamp: string;
    requestId: string;
    tenantId?: string | null;
    total?: number;
  };
}
