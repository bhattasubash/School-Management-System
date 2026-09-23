import { PrismaClient, Role, SubscriptionStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('--- Starting Auth & RBAC Seed ---');

  // 1. Ensure Subscription Plan exists
  let plan = await prisma.subscriptionPlan.findFirst({
    where: { name: 'Institutional Plan' },
  });

  if (!plan) {
    plan = await prisma.subscriptionPlan.create({
      data: {
        name: 'Institutional Plan',
        maxStudents: 5000,
        maxStaff: 500,
        features: {
          attendance: true,
          feeEngine: true,
          timetable: true,
          reportCards: true,
          whatsapp: true,
        },
        priceMonthly: 15000.0,
        priceAnnual: 150000.0,
      },
    });
    console.log('Created subscription plan:', plan.name);
  }

  // 2. Ensure Tenant exists (Delhi Public School)
  let tenant = await prisma.tenant.findUnique({
    where: { slug: 'dps' },
  });

  if (!tenant) {
    tenant = await prisma.tenant.create({
      data: {
        name: 'Delhi Public School',
        slug: 'dps',
        email: 'contact@dps.edu.in',
        phone: '+91 11 4339 9200',
        address: 'Mathura Road',
        city: 'New Delhi',
        state: 'Delhi',
        pincode: '110003',
        board: 'CBSE',
        subscriptionPlanId: plan.id,
        subscriptionStatus: SubscriptionStatus.ACTIVE,
      },
    });
    console.log('Created tenant:', tenant.name);
  }

  // 3. Ensure Academic Year & Section exist for student linking
  let academicYear = await prisma.academicYear.findFirst({
    where: { tenantId: tenant.id, name: '2026-27' },
  });

  if (!academicYear) {
    academicYear = await prisma.academicYear.create({
      data: {
        tenantId: tenant.id,
        name: '2026-27',
        startDate: new Date('2026-04-01'),
        endDate: new Date('2027-03-31'),
        isCurrent: true,
      },
    });
  }

  let classGrade = await prisma.classGrade.findFirst({
    where: { tenantId: tenant.id, academicYearId: academicYear.id, name: 'Class 10' },
  });

  if (!classGrade) {
    classGrade = await prisma.classGrade.create({
      data: {
        tenantId: tenant.id,
        academicYearId: academicYear.id,
        name: 'Class 10',
        numericOrder: 10,
      },
    });
  }

  let section = await prisma.section.findFirst({
    where: { tenantId: tenant.id, classGradeId: classGrade.id, name: 'A' },
  });

  if (!section) {
    section = await prisma.section.create({
      data: {
        tenantId: tenant.id,
        classGradeId: classGrade.id,
        name: 'A',
      },
    });
  }

  // 4. Seed Users across all roles
  const usersToSeed = [
    {
      email: 'superadmin@schoolerp.in',
      password: 'SuperAdmin@123',
      firstName: 'Platform',
      lastName: 'SuperAdmin',
      role: Role.SUPER_ADMIN,
      tenantId: null as string | null,
    },
    {
      email: 'admin@dps.edu.in',
      password: 'Admin@123',
      firstName: 'Virendra',
      lastName: 'Kapoor',
      role: Role.ADMIN,
      tenantId: tenant.id,
    },
    {
      email: 'accountant@dps.edu.in',
      password: 'Accountant@123',
      firstName: 'Sunil',
      lastName: 'Mehta',
      role: Role.ACCOUNTANT,
      tenantId: tenant.id,
    },
    {
      email: 'teacher@dps.edu.in',
      password: 'Teacher@123',
      firstName: 'Anandita',
      lastName: 'Sen',
      role: Role.TEACHER,
      tenantId: tenant.id,
    },
    {
      email: 'student@dps.edu.in',
      password: 'Student@123',
      firstName: 'Rohan',
      lastName: 'Sharma',
      role: Role.STUDENT,
      tenantId: tenant.id,
    },
    {
      email: 'parent@dps.edu.in',
      password: 'Parent@123',
      firstName: 'Rajesh',
      lastName: 'Sharma',
      role: Role.PARENT,
      tenantId: tenant.id,
    },
  ];

  for (const item of usersToSeed) {
    const passwordHash = await bcrypt.hash(item.password, 12);

    let user = await prisma.user.findFirst({
      where: {
        email: item.email,
        tenantId: item.tenantId,
      },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          email: item.email,
          passwordHash,
          firstName: item.firstName,
          lastName: item.lastName,
          role: item.role,
          tenantId: item.tenantId,
          isActive: true,
        },
      });
      console.log(`Created user [${item.role}]: ${item.email}`);
    } else {
      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          passwordHash,
          isActive: true,
          failedLoginAttempts: 0,
          lockedUntil: null,
        },
      });
      console.log(`Updated user credentials [${item.role}]: ${item.email}`);
    }

    // Role-specific profile links
    if (item.role === Role.TEACHER) {
      const existingProfile = await prisma.teacherProfile.findFirst({
        where: { userId: user.id },
      });
      if (!existingProfile && item.tenantId) {
        await prisma.teacherProfile.create({
          data: {
            tenantId: item.tenantId,
            userId: user.id,
            employeeId: 'EMP-DPS-101',
            department: 'Mathematics & Computer Science',
            qualification: 'M.Sc, B.Ed, Ph.D Mathematics',
            joiningDate: new Date('2020-07-01'),
            specialization: 'Senior Secondary Mathematics',
          },
        });
      }
    }

    if (item.role === Role.STUDENT) {
      const existingProfile = await prisma.studentProfile.findFirst({
        where: { userId: user.id },
      });
      if (!existingProfile && item.tenantId) {
        await prisma.studentProfile.create({
          data: {
            tenantId: item.tenantId,
            userId: user.id,
            admissionNumber: 'DPS-2022-4891',
            rollNumber: 14,
            sectionId: section.id,
            dateOfBirth: new Date('2010-05-15'),
            gender: 'Male',
            bloodGroup: 'B+',
            address: 'Sector 14, R.K. Puram, New Delhi',
            emergencyContact: '+91 98765 43210',
            admissionDate: new Date('2022-04-10'),
          },
        });
      }
    }

    if (item.role === Role.PARENT) {
      const existingProfile = await prisma.parentProfile.findFirst({
        where: { userId: user.id },
      });
      if (!existingProfile && item.tenantId) {
        await prisma.parentProfile.create({
          data: {
            tenantId: item.tenantId,
            userId: user.id,
            occupation: 'Architectural Consultant',
            annualIncome: 1800000.0,
          },
        });
      }
    }
  }

  console.log('--- Auth & RBAC Seed Completed Successfully ---');
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
