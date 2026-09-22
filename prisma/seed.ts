import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database for School Management System...');

  // 1. Create Subscription Plan
  const growthPlan = await prisma.subscriptionPlan.upsert({
    where: { id: '00000000-0000-0000-0000-000000000001' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000001',
      name: 'Growth School Plan (CBSE)',
      maxStudents: 1500,
      maxStaff: 100,
      features: {
        attendance: true,
        fees: true,
        exams: true,
        timetable: true,
        notices: true,
        customDomain: true,
        pwa: true,
      },
      priceMonthly: 4999.0,
      priceAnnual: 49999.0,
      isActive: true,
    },
  });

  // 2. Create Super Admin
  const superAdminPassword = await bcrypt.hash('SuperAdmin@123', 12);
  const existingSuperAdmin = await prisma.user.findFirst({
    where: { email: 'superadmin@schoolerp.in', tenantId: null },
  });
  const superAdmin =
    existingSuperAdmin ??
    (await prisma.user.create({
      data: {
        email: 'superadmin@schoolerp.in',
        passwordHash: superAdminPassword,
        firstName: 'Platform',
        lastName: 'SuperAdmin',
        role: 'SUPER_ADMIN',
        isActive: true,
      },
    }));

  // 3. Create Tenant: Delhi Public School
  const dpsTenant = await prisma.tenant.upsert({
    where: { slug: 'dps' },
    update: {},
    create: {
      name: 'Delhi Public School',
      slug: 'dps',
      email: 'principal@dpsdelhi.edu.in',
      phone: '+91 11 23456789',
      address: 'Sector 4, R.K. Puram',
      city: 'New Delhi',
      state: 'Delhi',
      pincode: '110022',
      board: 'CBSE',
      subscriptionPlanId: growthPlan.id,
      branding: {
        create: {
          primaryColor: '#111C2D',
          secondaryColor: '#F4F6F9',
          accentColor: '#FA896B',
          tagline: 'Service Before Self',
        },
      },
      domains: {
        create: [
          {
            domain: 'portal.dpsdelhi.edu.in',
            isPrimary: true,
            isVerified: true,
            verifiedAt: new Date(),
          },
        ],
      },
    },
  });

  console.log(`✅ Tenant created: ${dpsTenant.name} (Slug: ${dpsTenant.slug})`);

  // 4. Create School Admin
  const adminPassword = await bcrypt.hash('Admin@1234', 12);
  const dpsAdmin = await prisma.user.upsert({
    where: {
      tenantId_email: {
        tenantId: dpsTenant.id,
        email: 'admin@dpsdelhi.edu.in',
      },
    },
    update: {},
    create: {
      tenantId: dpsTenant.id,
      email: 'admin@dpsdelhi.edu.in',
      phone: '+91 9876543210',
      passwordHash: adminPassword,
      firstName: 'Rajesh',
      lastName: 'Sharma',
      role: 'ADMIN',
      isActive: true,
    },
  });

  // 5. Create Academic Year
  const academicYear = await prisma.academicYear.upsert({
    where: {
      tenantId_name: {
        tenantId: dpsTenant.id,
        name: '2026-27',
      },
    },
    update: {},
    create: {
      tenantId: dpsTenant.id,
      name: '2026-27',
      startDate: new Date('2026-04-01'),
      endDate: new Date('2027-03-31'),
      isCurrent: true,
    },
  });

  // 6. Create Class 10 & Section A
  const class10 = await prisma.classGrade.upsert({
    where: {
      tenantId_academicYearId_name: {
        tenantId: dpsTenant.id,
        academicYearId: academicYear.id,
        name: 'Class 10',
      },
    },
    update: {},
    create: {
      tenantId: dpsTenant.id,
      academicYearId: academicYear.id,
      name: 'Class 10',
      numericOrder: 10,
    },
  });

  const sectionA = await prisma.section.upsert({
    where: {
      classGradeId_name: {
        classGradeId: class10.id,
        name: 'A',
      },
    },
    update: {},
    create: {
      tenantId: dpsTenant.id,
      classGradeId: class10.id,
      name: 'A',
    },
  });

  // 7. Create Student User & Profile: Rohan Sharma
  const studentPassword = await bcrypt.hash('Student@123', 12);
  const studentUser = await prisma.user.upsert({
    where: {
      tenantId_email: {
        tenantId: dpsTenant.id,
        email: 'rohan.sharma@dpsdelhi.edu.in',
      },
    },
    update: {},
    create: {
      tenantId: dpsTenant.id,
      email: 'rohan.sharma@dpsdelhi.edu.in',
      passwordHash: studentPassword,
      firstName: 'Rohan',
      lastName: 'Sharma',
      role: 'STUDENT',
      isActive: true,
    },
  });

  const studentProfile = await prisma.studentProfile.upsert({
    where: {
      tenantId_admissionNumber: {
        tenantId: dpsTenant.id,
        admissionNumber: 'DPS-2022-4891',
      },
    },
    update: {},
    create: {
      tenantId: dpsTenant.id,
      userId: studentUser.id,
      admissionNumber: 'DPS-2022-4891',
      rollNumber: 14,
      sectionId: sectionA.id,
      dateOfBirth: new Date('2011-05-15'),
      gender: 'MALE',
      bloodGroup: 'B+',
      address: 'Flat 402, Green Valley Apartments, R.K. Puram, New Delhi',
      emergencyContact: '+91 98765 43210',
      admissionDate: new Date('2022-04-01'),
    },
  });

  console.log(`✅ Seed complete for ${dpsTenant.name}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
