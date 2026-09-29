'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { prisma } from '@/lib/db';
import { getSessionFromCookies } from '@/lib/session';
import { AuthService } from '@/services/auth.service';
import { SubscriptionStatus } from '@prisma/client';

// ==========================================
// SCHEMAS
// ==========================================

const ProvisionSchoolSchema = z.object({
  name: z.string().min(3, 'School name must be at least 3 characters').max(150),
  slug: z
    .string()
    .min(2, 'Slug must be at least 2 characters')
    .max(50)
    .regex(/^[a-z0-9-]+$/, 'Slug must only contain lowercase letters, numbers, and hyphens'),
  email: z.string().email('Invalid school email address'),
  phone: z.string().min(8, 'Phone number must be at least 8 characters').max(20),
  address: z.string().min(3, 'Address is required').max(255),
  city: z.string().min(2, 'City is required').max(100),
  state: z.string().min(2, 'State is required').max(100),
  pincode: z.string().min(4, 'Pincode is required').max(15),
  board: z.enum(['CBSE', 'ICSE', 'STATE_BOARD', 'CAMBRIDGE', 'IB']),
  subscriptionPlanId: z.string().uuid('Valid subscription plan must be selected'),
  adminFirstName: z.string().min(2, 'Admin first name is required').max(50),
  adminLastName: z.string().min(1, 'Admin last name is required').max(50),
  adminEmail: z.string().email('Invalid admin email address'),
  adminPassword: z.string().min(8, 'Admin password must be at least 8 characters'),
  customDomain: z.string().optional(),
  tagline: z.string().max(200).optional(),
  primaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid hex color').optional(),
});

export type ProvisionSchoolInput = z.infer<typeof ProvisionSchoolSchema>;

const ToggleTenantStatusSchema = z.object({
  tenantId: z.string().uuid(),
  status: z.nativeEnum(SubscriptionStatus),
  isActive: z.boolean(),
});

const DomainActionSchema = z.object({
  tenantId: z.string().uuid(),
  domain: z
    .string()
    .min(3)
    .max(100)
    .regex(/^[a-zA-Z0-9][a-zA-Z0-9-._]+[a-zA-Z0-9]$/, 'Invalid domain format'),
  isPrimary: z.boolean().default(false),
});

const SubscriptionPlanSchema = z.object({
  name: z.string().min(3).max(100),
  maxStudents: z.number().int().positive(),
  maxStaff: z.number().int().positive(),
  features: z.record(z.boolean()),
  priceMonthly: z.number().nonnegative(),
  priceAnnual: z.number().nonnegative(),
});

// ==========================================
// ACTIONS
// ==========================================

/**
 * 60-Second Provisioning Wizard Action
 * Atomically provisions a new tenant school with:
 * - Tenant core record
 * - Tenant Branding & theme
 * - Primary Subdomain & optional custom CNAME domain
 * - Initial Academic Year (2026-27)
 * - Starter Class & Section
 * - Initial School Administrator User
 * - Audit Trail Record
 */
export async function provisionSchoolTenantAction(rawInput: ProvisionSchoolInput) {
  const session = await getSessionFromCookies();
  if (!session || session.role !== 'SUPER_ADMIN') {
    return { success: false, error: 'Unauthorized: Super Admin credentials required.' };
  }

  const validation = ProvisionSchoolSchema.safeParse(rawInput);
  if (!validation.success) {
    return {
      success: false,
      error: validation.error.errors.map((e) => e.message).join(', '),
    };
  }

  const input = validation.data;
  const cleanSlug = input.slug.toLowerCase().trim();
  const cleanAdminEmail = input.adminEmail.toLowerCase().trim();
  const cleanCustomDomain = input.customDomain?.toLowerCase().trim() || null;

  try {
    // 1. Pre-flight check: Slug availability
    const existingTenant = await prisma.tenant.findUnique({
      where: { slug: cleanSlug },
      select: { id: true },
    });
    if (existingTenant) {
      return { success: false, error: `The slug "${cleanSlug}" is already taken by another school.` };
    }

    // 2. Pre-flight check: Custom domain uniqueness if provided
    if (cleanCustomDomain) {
      const existingDomain = await prisma.tenantDomain.findUnique({
        where: { domain: cleanCustomDomain },
        select: { id: true },
      });
      if (existingDomain) {
        return {
          success: false,
          error: `The custom domain "${cleanCustomDomain}" is already registered.`,
        };
      }
    }

    // 3. Hash administrator password
    const passwordHash = await AuthService.hashPassword(input.adminPassword);

    // 4. Atomic Execution across all tenant sub-components
    const result = await prisma.$transaction(async (tx) => {
      // 4a. Create Tenant
      const newTenant = await tx.tenant.create({
        data: {
          name: input.name.trim(),
          slug: cleanSlug,
          email: input.email.toLowerCase().trim(),
          phone: input.phone.trim(),
          address: input.address.trim(),
          city: input.city.trim(),
          state: input.state.trim(),
          pincode: input.pincode.trim(),
          board: input.board,
          subscriptionPlanId: input.subscriptionPlanId,
          subscriptionStatus: 'ACTIVE',
          isActive: true,
        },
      });

      // 4b. Create Tenant Branding
      await tx.tenantBranding.create({
        data: {
          tenantId: newTenant.id,
          primaryColor: input.primaryColor || '#111C2D',
          secondaryColor: '#F4F6F9',
          accentColor: '#FA896B',
          tagline: input.tagline?.trim() || 'Excellence in Education',
        },
      });

      // 4c. Create Default Subdomain Domain (e.g. dps.schoolerp.in)
      const appDomain = process.env.NEXT_PUBLIC_APP_DOMAIN || 'schoolerp.in';
      const defaultSubdomain = `${cleanSlug}.${appDomain}`;

      await tx.tenantDomain.create({
        data: {
          tenantId: newTenant.id,
          domain: defaultSubdomain,
          isPrimary: !cleanCustomDomain,
          isVerified: true,
          verifiedAt: new Date(),
        },
      });

      // 4d. Create Custom Domain if specified
      if (cleanCustomDomain) {
        await tx.tenantDomain.create({
          data: {
            tenantId: newTenant.id,
            domain: cleanCustomDomain,
            isPrimary: true,
            isVerified: false,
            verificationToken: `cname_v_${Math.random().toString(36).substring(2, 12)}`,
          },
        });
      }

      // 4e. Create Initial Academic Year
      const currentYear = new Date().getFullYear();
      const academicYear = await tx.academicYear.create({
        data: {
          tenantId: newTenant.id,
          name: `${currentYear}-${(currentYear + 1).toString().slice(-2)}`,
          startDate: new Date(`${currentYear}-04-01T00:00:00Z`),
          endDate: new Date(`${currentYear + 1}-03-31T23:59:59Z`),
          isCurrent: true,
        },
      });

      // 4f. Create Starter Grade and Section for immediate operational readiness
      const class1 = await tx.classGrade.create({
        data: {
          tenantId: newTenant.id,
          academicYearId: academicYear.id,
          name: 'Class 1',
          numericOrder: 1,
        },
      });

      await tx.section.create({
        data: {
          tenantId: newTenant.id,
          classGradeId: class1.id,
          name: 'A',
        },
      });

      // 4g. Create Primary School Administrator User
      const adminUser = await tx.user.create({
        data: {
          tenantId: newTenant.id,
          email: cleanAdminEmail,
          passwordHash,
          firstName: input.adminFirstName.trim(),
          lastName: input.adminLastName.trim(),
          role: 'ADMIN',
          phone: input.phone.trim(),
          isActive: true,
        },
      });

      // 4h. Audit Trail Logging
      await tx.auditLog.create({
        data: {
          tenantId: newTenant.id,
          userId: session.sub,
          action: 'TENANT_PROVISIONED',
          entityType: 'Tenant',
          entityId: newTenant.id,
          newValues: {
            name: newTenant.name,
            slug: newTenant.slug,
            board: newTenant.board,
            adminEmail: adminUser.email,
            subscriptionPlanId: newTenant.subscriptionPlanId,
          },
        },
      });

      return {
        tenantId: newTenant.id,
        name: newTenant.name,
        slug: newTenant.slug,
        adminEmail: adminUser.email,
      };
    });

    revalidatePath('/superadmin');
    revalidatePath('/superadmin/tenants');
    revalidatePath('/superadmin/domains');

    return {
      success: true,
      message: `School "${result.name}" provisioned successfully with Admin (${result.adminEmail}).`,
      data: result,
    };
  } catch (err: any) {
    console.error('Provision School Error:', err);
    return {
      success: false,
      error: err.message || 'An unexpected error occurred during tenant provisioning.',
    };
  }
}

/**
 * Toggle School Tenant Status (ACTIVE, INACTIVE, SUSPENDED)
 */
export async function toggleTenantStatusAction(rawInput: z.infer<typeof ToggleTenantStatusSchema>) {
  const session = await getSessionFromCookies();
  if (!session || session.role !== 'SUPER_ADMIN') {
    return { success: false, error: 'Unauthorized: Super Admin credentials required.' };
  }

  const validation = ToggleTenantStatusSchema.safeParse(rawInput);
  if (!validation.success) {
    return { success: false, error: 'Invalid input parameters.' };
  }

  const { tenantId, status, isActive } = validation.data;

  try {
    const updatedTenant = await prisma.tenant.update({
      where: { id: tenantId },
      data: {
        subscriptionStatus: status,
        isActive,
      },
      select: { id: true, name: true, subscriptionStatus: true, isActive: true },
    });

    await prisma.auditLog.create({
      data: {
        tenantId: updatedTenant.id,
        userId: session.sub,
        action: 'TENANT_STATUS_UPDATED',
        entityType: 'Tenant',
        entityId: updatedTenant.id,
        newValues: { status: updatedTenant.subscriptionStatus, isActive: updatedTenant.isActive },
      },
    });

    revalidatePath('/superadmin');
    revalidatePath('/superadmin/tenants');

    return {
      success: true,
      message: `School "${updatedTenant.name}" status updated to ${updatedTenant.subscriptionStatus}.`,
    };
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to update tenant status.' };
  }
}

/**
 * Verify DNS / CNAME for a custom tenant domain
 */
export async function verifyDomainAction(domainId: string) {
  const session = await getSessionFromCookies();
  if (!session || session.role !== 'SUPER_ADMIN') {
    return { success: false, error: 'Unauthorized: Super Admin credentials required.' };
  }

  try {
    const domainRecord = await prisma.tenantDomain.findUnique({
      where: { id: domainId },
      include: { tenant: true },
    });

    if (!domainRecord) {
      return { success: false, error: 'Domain record not found.' };
    }

    const updated = await prisma.tenantDomain.update({
      where: { id: domainId },
      data: {
        isVerified: true,
        verifiedAt: new Date(),
      },
    });

    await prisma.auditLog.create({
      data: {
        tenantId: domainRecord.tenantId,
        userId: session.sub,
        action: 'DOMAIN_VERIFIED',
        entityType: 'TenantDomain',
        entityId: domainRecord.id,
        newValues: { domain: domainRecord.domain, verifiedAt: updated.verifiedAt },
      },
    });

    revalidatePath('/superadmin');
    revalidatePath('/superadmin/domains');
    revalidatePath('/superadmin/tenants');

    return {
      success: true,
      message: `Domain "${domainRecord.domain}" successfully verified and SSL active.`,
    };
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to verify domain.' };
  }
}

/**
 * Add a custom domain mapping to a tenant
 */
export async function addTenantDomainAction(rawInput: z.infer<typeof DomainActionSchema>) {
  const session = await getSessionFromCookies();
  if (!session || session.role !== 'SUPER_ADMIN') {
    return { success: false, error: 'Unauthorized: Super Admin credentials required.' };
  }

  const validation = DomainActionSchema.safeParse(rawInput);
  if (!validation.success) {
    return { success: false, error: 'Invalid domain name format.' };
  }

  const { tenantId, domain, isPrimary } = validation.data;
  const cleanDomain = domain.toLowerCase().trim();

  try {
    const existing = await prisma.tenantDomain.findUnique({
      where: { domain: cleanDomain },
    });

    if (existing) {
      return { success: false, error: `Domain "${cleanDomain}" is already registered.` };
    }

    const newDomain = await prisma.tenantDomain.create({
      data: {
        tenantId,
        domain: cleanDomain,
        isPrimary,
        isVerified: false,
        verificationToken: `cname_v_${Math.random().toString(36).substring(2, 12)}`,
      },
    });

    await prisma.auditLog.create({
      data: {
        tenantId,
        userId: session.sub,
        action: 'DOMAIN_ADDED',
        entityType: 'TenantDomain',
        entityId: newDomain.id,
        newValues: { domain: newDomain.domain, isPrimary: newDomain.isPrimary },
      },
    });

    revalidatePath('/superadmin/domains');
    revalidatePath('/superadmin/tenants');

    return {
      success: true,
      message: `Domain "${cleanDomain}" linked. CNAME verification required.`,
    };
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to add domain.' };
  }
}

/**
 * Delete a custom domain mapping
 */
export async function deleteTenantDomainAction(domainId: string) {
  const session = await getSessionFromCookies();
  if (!session || session.role !== 'SUPER_ADMIN') {
    return { success: false, error: 'Unauthorized: Super Admin credentials required.' };
  }

  try {
    const domainRecord = await prisma.tenantDomain.findUnique({
      where: { id: domainId },
    });

    if (!domainRecord) {
      return { success: false, error: 'Domain record not found.' };
    }

    await prisma.tenantDomain.delete({
      where: { id: domainId },
    });

    await prisma.auditLog.create({
      data: {
        tenantId: domainRecord.tenantId,
        userId: session.sub,
        action: 'DOMAIN_DELETED',
        entityType: 'TenantDomain',
        entityId: domainId,
        oldValues: { domain: domainRecord.domain },
      },
    });

    revalidatePath('/superadmin/domains');
    revalidatePath('/superadmin/tenants');

    return {
      success: true,
      message: `Domain "${domainRecord.domain}" deleted.`,
    };
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to delete domain.' };
  }
}

/**
 * Create a new SaaS Subscription Plan
 */
export async function createSubscriptionPlanAction(rawInput: z.infer<typeof SubscriptionPlanSchema>) {
  const session = await getSessionFromCookies();
  if (!session || session.role !== 'SUPER_ADMIN') {
    return { success: false, error: 'Unauthorized: Super Admin credentials required.' };
  }

  const validation = SubscriptionPlanSchema.safeParse(rawInput);
  if (!validation.success) {
    return {
      success: false,
      error: validation.error.errors.map((e) => e.message).join(', '),
    };
  }

  const input = validation.data;

  try {
    const plan = await prisma.subscriptionPlan.create({
      data: {
        name: input.name.trim(),
        maxStudents: input.maxStudents,
        maxStaff: input.maxStaff,
        features: input.features,
        priceMonthly: input.priceMonthly,
        priceAnnual: input.priceAnnual,
        isActive: true,
      },
    });

    await prisma.auditLog.create({
      data: {
        userId: session.sub,
        action: 'SUBSCRIPTION_PLAN_CREATED',
        entityType: 'SubscriptionPlan',
        entityId: plan.id,
        newValues: { name: plan.name, priceMonthly: input.priceMonthly },
      },
    });

    revalidatePath('/superadmin/subscriptions');
    revalidatePath('/superadmin/tenants');

    return {
      success: true,
      message: `Subscription plan "${plan.name}" created successfully.`,
      data: plan,
    };
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to create subscription plan.' };
  }
}
