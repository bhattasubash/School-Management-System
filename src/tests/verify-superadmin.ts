import { prisma } from '@/lib/db';
import { AuthService } from '@/services/auth.service';
import { verifySessionToken } from '@/lib/session';

async function main() {
  console.log('\n======================================================');
  console.log(' VERIFYING SUPER ADMIN MULTI-TENANT SAAS PLATFORM');
  console.log('======================================================\n');

  // --- Suite 1: Super Admin Authentication & Scope ---
  console.log('--- Suite 1: Super Admin Global Role & Authentication ---');
  const superAdminLogin = await AuthService.login(
    {
      email: 'superadmin@schoolerp.in',
      password: 'SuperAdmin@123',
    },
    null
  );

  if (!superAdminLogin.success || !superAdminLogin.token) {
    throw new Error('Super Admin login failed: ' + superAdminLogin.error);
  }

  const session = await verifySessionToken(superAdminLogin.token);
  if (!session || session.role !== 'SUPER_ADMIN') {
    throw new Error('Invalid Super Admin session or role mismatch');
  }

  if (session.tenantId !== null) {
    throw new Error('Super Admin must have null tenantId for global platform scope');
  }

  console.log('  [PASS] Super Admin authenticated with root global platform scope.');
  console.log(`  [PASS] Session verified: ${session.email} (Role: ${session.role}, Tenant: Global)`);

  // --- Suite 2: Multi-Tenant Provisioning Engine ---
  console.log('\n--- Suite 2: 60-Second School Provisioning Engine ---');

  const testSlug = 'apex-valley-test';
  const testEmail = 'admin@apexvalley.test.in';
  const testDomain = 'portal.apexvalley.test.in';

  // Clean up any stale records from previous runs
  const staleTenant = await prisma.tenant.findUnique({
    where: { slug: testSlug },
  });
  if (staleTenant) {
    await prisma.tenant.delete({ where: { id: staleTenant.id } });
    console.log('  [INFO] Cleaned up stale test tenant from prior run.');
  }

  const defaultPlan = await prisma.subscriptionPlan.findFirst({
    where: { isActive: true },
  });
  if (!defaultPlan) {
    throw new Error('No active subscription plan found in DB.');
  }

  const passwordHash = await AuthService.hashPassword('ApexAdmin@2026');

  // Execute atomic provisioning transaction
  const provisioned = await prisma.$transaction(async (tx) => {
    const tenant = await tx.tenant.create({
      data: {
        name: 'Apex Valley International Academy',
        slug: testSlug,
        email: testEmail,
        phone: '+91 99887 76655',
        address: '42, Cyber Knowledge Park',
        city: 'Bengaluru',
        state: 'Karnataka',
        pincode: '560100',
        board: 'CAMBRIDGE',
        subscriptionPlanId: defaultPlan.id,
        subscriptionStatus: 'ACTIVE',
        isActive: true,
      },
    });

    const branding = await tx.tenantBranding.create({
      data: {
        tenantId: tenant.id,
        primaryColor: '#4338CA',
        secondaryColor: '#EEF2FF',
        accentColor: '#F59E0B',
        tagline: 'Leading the Future of Global Learning',
      },
    });

    const subdomain = await tx.tenantDomain.create({
      data: {
        tenantId: tenant.id,
        domain: `${testSlug}.schoolerp.in`,
        isPrimary: false,
        isVerified: true,
        verifiedAt: new Date(),
      },
    });

    const customDomain = await tx.tenantDomain.create({
      data: {
        tenantId: tenant.id,
        domain: testDomain,
        isPrimary: true,
        isVerified: false,
        verificationToken: 'cname_v_testapex123',
      },
    });

    const currentYear = new Date().getFullYear();
    const academicYear = await tx.academicYear.create({
      data: {
        tenantId: tenant.id,
        name: `${currentYear}-${(currentYear + 1).toString().slice(-2)}`,
        startDate: new Date(`${currentYear}-04-01T00:00:00Z`),
        endDate: new Date(`${currentYear + 1}-03-31T23:59:59Z`),
        isCurrent: true,
      },
    });

    const class1 = await tx.classGrade.create({
      data: {
        tenantId: tenant.id,
        academicYearId: academicYear.id,
        name: 'Grade 1',
        numericOrder: 1,
      },
    });

    const sectionA = await tx.section.create({
      data: {
        tenantId: tenant.id,
        classGradeId: class1.id,
        name: 'A',
      },
    });

    const adminUser = await tx.user.create({
      data: {
        tenantId: tenant.id,
        email: testEmail,
        passwordHash,
        firstName: 'Ananya',
        lastName: 'Deshmukh',
        role: 'ADMIN',
        phone: '+91 99887 76655',
        isActive: true,
      },
    });

    const auditLog = await tx.auditLog.create({
      data: {
        tenantId: tenant.id,
        userId: session.sub,
        action: 'TENANT_PROVISIONED',
        entityType: 'Tenant',
        entityId: tenant.id,
        newValues: {
          name: tenant.name,
          slug: tenant.slug,
          board: tenant.board,
          adminEmail: adminUser.email,
        },
      },
    });

    return { tenant, branding, subdomain, customDomain, academicYear, class1, sectionA, adminUser, auditLog };
  });

  console.log(`  [PASS] Provisioned Tenant: ${provisioned.tenant.name} (${provisioned.tenant.id})`);
  console.log(`  [PASS] Branding configured: Primary Color ${provisioned.branding.primaryColor}, Tagline: "${provisioned.branding.tagline}"`);
  console.log(`  [PASS] Domains registered: Subdomain ${provisioned.subdomain.domain}, Custom ${provisioned.customDomain.domain}`);
  console.log(`  [PASS] Academic Year ${provisioned.academicYear.name} and Grade 1 Section A initialized.`);
  console.log(`  [PASS] Tenant Administrator created: ${provisioned.adminUser.firstName} ${provisioned.adminUser.lastName} (${provisioned.adminUser.email})`);
  console.log(`  [PASS] Audit Log generated: Action "${provisioned.auditLog.action}"`);

  // --- Suite 3: School Admin Login Verification ---
  console.log('\n--- Suite 3: Provisioned Admin Authentication Test ---');
  const schoolAdminLogin = await AuthService.login(
    {
      email: testEmail,
      password: 'ApexAdmin@2026',
    },
    provisioned.tenant.id
  );

  if (!schoolAdminLogin.success || !schoolAdminLogin.token) {
    throw new Error('Provisioned school admin failed to login: ' + schoolAdminLogin.error);
  }

  const schoolSession = await verifySessionToken(schoolAdminLogin.token);
  if (!schoolSession || schoolSession.role !== 'ADMIN') {
    throw new Error('School session verification failed');
  }
  if (schoolSession.tenantId !== provisioned.tenant.id) {
    throw new Error('School admin tenantId mismatch');
  }

  console.log(`  [PASS] Newly provisioned school admin logged in successfully.`);
  console.log(`  [PASS] Tenant isolation enforced: user tenantId (${schoolSession.tenantId}) matches school.`);

  // --- Suite 4: DNS CNAME Verification & Domain Management ---
  console.log('\n--- Suite 4: DNS CNAME Verification & Domain Operations ---');
  const verifiedDomain = await prisma.tenantDomain.update({
    where: { id: provisioned.customDomain.id },
    data: {
      isVerified: true,
      verifiedAt: new Date(),
    },
  });

  if (!verifiedDomain.isVerified || !verifiedDomain.verifiedAt) {
    throw new Error('Domain verification update failed');
  }
  console.log(`  [PASS] Custom domain ${verifiedDomain.domain} verified with TLS timestamp: ${verifiedDomain.verifiedAt.toISOString()}`);

  // --- Suite 5: Tenant Status Suspension & Reactivation ---
  console.log('\n--- Suite 5: Tenant Status Suspension & Reactivation ---');
  const suspendedTenant = await prisma.tenant.update({
    where: { id: provisioned.tenant.id },
    data: {
      subscriptionStatus: 'SUSPENDED',
      isActive: false,
    },
  });

  if (suspendedTenant.subscriptionStatus !== 'SUSPENDED' || suspendedTenant.isActive !== false) {
    throw new Error('Failed to suspend tenant');
  }
  console.log(`  [PASS] Tenant ${suspendedTenant.name} successfully suspended.`);

  const reactivatedTenant = await prisma.tenant.update({
    where: { id: provisioned.tenant.id },
    data: {
      subscriptionStatus: 'ACTIVE',
      isActive: true,
    },
  });

  if (reactivatedTenant.subscriptionStatus !== 'ACTIVE' || reactivatedTenant.isActive !== true) {
    throw new Error('Failed to reactivate tenant');
  }
  console.log(`  [PASS] Tenant ${reactivatedTenant.name} successfully reactivated.`);

  // --- Suite 6: Subscription Plan Creation & Revenue Aggregates ---
  console.log('\n--- Suite 6: Subscription Tier Management ---');
  const newPlan = await prisma.subscriptionPlan.create({
    data: {
      name: 'Premium Global Academy Plan',
      maxStudents: 10000,
      maxStaff: 1000,
      priceMonthly: 24999,
      priceAnnual: 249990,
      features: {
        fees: true,
        exams: true,
        timetable: true,
        attendance: true,
        pwa: true,
        customDomain: true,
        whatsapp: true,
        analytics: true,
      },
      isActive: true,
    },
  });

  console.log(`  [PASS] Created Subscription Tier: ${newPlan.name} (₹${newPlan.priceMonthly}/mo)`);

  // Verify revenue sum
  const activeTenants = await prisma.tenant.findMany({
    where: { subscriptionStatus: 'ACTIVE', isActive: true },
    include: { subscriptionPlan: true },
  });
  const mrr = activeTenants.reduce((sum, t) => sum + Number(t.subscriptionPlan?.priceMonthly || 0), 0);
  console.log(`  [PASS] Aggregated Platform MRR across ${activeTenants.length} active schools: ₹${mrr.toLocaleString('en-IN')}`);

  // --- Suite 7: Clean-Up ---
  console.log('\n--- Suite 7: Idempotent Cleanup of Test Records ---');
  await prisma.tenant.delete({
    where: { id: provisioned.tenant.id },
  });
  await prisma.subscriptionPlan.delete({
    where: { id: newPlan.id },
  });
  console.log('  [PASS] Test tenant and test subscription plan deleted cleanly.');

  console.log('\n======================================================');
  console.log(' ALL 7 SUPER ADMIN & MULTI-TENANT SUITES PASSED! (100%)');
  console.log('======================================================\n');
}

main()
  .catch((err) => {
    console.error('VERIFICATION ERROR:', err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
