import { PrismaClient, Role, SubscriptionStatus, DayOfWeek, SubstitutionStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('--- Starting Auth, RBAC & Teacher Attendance Seed ---');

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

  // 3. Ensure Academic Year & Section exist
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

  // 4. Seed Core Users across all roles
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
      email: 'colleague.teacher@dps.edu.in',
      password: 'Teacher@123',
      firstName: 'Rajesh',
      lastName: 'Nambiar',
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

  let mainTeacherProfileId: string | null = null;
  let colleagueTeacherProfileId: string | null = null;

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
    }

    // Role-specific profile links
    if (item.role === Role.TEACHER && item.tenantId) {
      let profile = await prisma.teacherProfile.findFirst({
        where: { userId: user.id },
      });
      if (!profile) {
        profile = await prisma.teacherProfile.create({
          data: {
            tenantId: item.tenantId,
            userId: user.id,
            employeeId: item.email.startsWith('colleague') ? 'EMP-DPS-102' : 'EMP-DPS-101',
            department: 'Mathematics & Computer Science',
            qualification: 'M.Sc, B.Ed, Ph.D Mathematics',
            joiningDate: new Date('2020-07-01'),
            specialization: 'Senior Secondary Mathematics',
          },
        });
      }

      if (item.email === 'teacher@dps.edu.in') {
        mainTeacherProfileId = profile.id;
      } else {
        colleagueTeacherProfileId = profile.id;
      }
    }

    if (item.role === Role.STUDENT && item.tenantId) {
      const existingProfile = await prisma.studentProfile.findFirst({
        where: { userId: user.id },
      });
      if (!existingProfile) {
        await prisma.studentProfile.create({
          data: {
            tenantId: item.tenantId,
            userId: user.id,
            admissionNumber: 'DPS-2022-4891',
            rollNumber: 1,
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

    if (item.role === Role.PARENT && item.tenantId) {
      const existingProfile = await prisma.parentProfile.findFirst({
        where: { userId: user.id },
      });
      if (!existingProfile) {
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

  // 5. Assign Teacher as Class Teacher for Section A
  if (mainTeacherProfileId) {
    await prisma.section.update({
      where: { id: section.id },
      data: { classTeacherId: mainTeacherProfileId },
    });
  }

  // 6. Seed Additional Class 10-A Students for Attendance Register
  const additionalStudents = [
    { firstName: 'Aanya', lastName: 'Patel', adm: 'DPS-2022-4892', roll: 2, gender: 'Female' },
    { firstName: 'Kabir', lastName: 'Verma', adm: 'DPS-2022-4893', roll: 3, gender: 'Male' },
    { firstName: 'Diya', lastName: 'Malhotra', adm: 'DPS-2022-4894', roll: 4, gender: 'Female' },
    { firstName: 'Arjun', lastName: 'Rao', adm: 'DPS-2022-4895', roll: 5, gender: 'Male' },
  ];

  for (const s of additionalStudents) {
    let u = await prisma.user.findFirst({
      where: { tenantId: tenant.id, email: `${s.firstName.toLowerCase()}.${s.lastName.toLowerCase()}@dps.edu.in` },
    });
    if (!u) {
      u = await prisma.user.create({
        data: {
          tenantId: tenant.id,
          email: `${s.firstName.toLowerCase()}.${s.lastName.toLowerCase()}@dps.edu.in`,
          passwordHash: await bcrypt.hash('Student@123', 12),
          firstName: s.firstName,
          lastName: s.lastName,
          role: Role.STUDENT,
        },
      });
    }

    let sp = await prisma.studentProfile.findFirst({
      where: { tenantId: tenant.id, userId: u.id },
    });
    if (!sp) {
      await prisma.studentProfile.create({
        data: {
          tenantId: tenant.id,
          userId: u.id,
          admissionNumber: s.adm,
          rollNumber: s.roll,
          sectionId: section.id,
          dateOfBirth: new Date('2010-08-20'),
          gender: s.gender,
          address: 'New Delhi',
          emergencyContact: '+91 98111 22233',
          admissionDate: new Date('2022-04-10'),
        },
      });
    }
  }

  // 7. Seed Subject, Period Time Slots, and Timetable Entries
  let subjectMath = await prisma.subject.findFirst({
    where: { tenantId: tenant.id, code: 'MATH-041' },
  });
  if (!subjectMath) {
    subjectMath = await prisma.subject.create({
      data: {
        tenantId: tenant.id,
        name: 'Mathematics',
        code: 'MATH-041',
      },
    });
  }

  let subjectSci = await prisma.subject.findFirst({
    where: { tenantId: tenant.id, code: 'SCI-086' },
  });
  if (!subjectSci) {
    subjectSci = await prisma.subject.create({
      data: {
        tenantId: tenant.id,
        name: 'Science & Lab',
        code: 'SCI-086',
      },
    });
  }

  const periods = [
    { name: 'Period 1', order: 1, start: '08:30', end: '09:15', isBreak: false },
    { name: 'Period 2', order: 2, start: '09:15', end: '10:00', isBreak: false },
    { name: 'Period 3', order: 3, start: '10:00', end: '10:45', isBreak: false },
    { name: 'Break', order: 4, start: '10:45', end: '11:15', isBreak: true },
    { name: 'Period 4', order: 5, start: '11:15', end: '12:00', isBreak: false },
  ];

  const slotMap: Record<number, string> = {};
  for (const p of periods) {
    let slot = await prisma.periodTimeSlot.findFirst({
      where: { tenantId: tenant.id, order: p.order },
    });
    if (!slot) {
      slot = await prisma.periodTimeSlot.create({
        data: {
          tenantId: tenant.id,
          name: p.name,
          order: p.order,
          startTime: p.start,
          endTime: p.end,
          isBreak: p.isBreak,
        },
      });
    }
    slotMap[p.order] = slot.id;
  }

  // Timetable entries for every weekday
  if (mainTeacherProfileId) {
    const days: DayOfWeek[] = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];
    for (const d of days) {
      let te = await prisma.timetableEntry.findFirst({
        where: {
          sectionId: section.id,
          periodTimeSlotId: slotMap[1],
          dayOfWeek: d,
        },
      });
      if (!te) {
        await prisma.timetableEntry.create({
          data: {
            tenantId: tenant.id,
            sectionId: section.id,
            periodTimeSlotId: slotMap[1],
            subjectId: subjectMath.id,
            teacherId: mainTeacherProfileId,
            dayOfWeek: d,
          },
        });
      }
    }
  }

  // 8. Seed a Sample Active Substitution for Today (Period 2 - Science)
  if (mainTeacherProfileId && colleagueTeacherProfileId) {
    const today = new Date();
    const todayDateOnly = new Date(`${today.toISOString().split('T')[0]}T00:00:00.000Z`);
    const dayNames: DayOfWeek[] = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
    const currentDay = dayNames[today.getDay()];

    let colleagueTimetable = await prisma.timetableEntry.findFirst({
      where: {
        sectionId: section.id,
        periodTimeSlotId: slotMap[2],
        dayOfWeek: currentDay,
      },
    });

    if (!colleagueTimetable) {
      colleagueTimetable = await prisma.timetableEntry.create({
        data: {
          tenantId: tenant.id,
          sectionId: section.id,
          periodTimeSlotId: slotMap[2],
          subjectId: subjectSci.id,
          teacherId: colleagueTeacherProfileId,
          dayOfWeek: currentDay,
        },
      });
    }

    const existingSub = await prisma.teacherSubstitution.findFirst({
      where: {
        tenantId: tenant.id,
        timetableEntryId: colleagueTimetable.id,
        date: todayDateOnly,
      },
    });

    if (!existingSub) {
      await prisma.teacherSubstitution.create({
        data: {
          tenantId: tenant.id,
          timetableEntryId: colleagueTimetable.id,
          originalTeacherId: colleagueTeacherProfileId,
          substituteTeacherId: mainTeacherProfileId,
          date: todayDateOnly,
          reason: 'Medical Leave (Fever)',
          status: SubstitutionStatus.ASSIGNED,
          assignedById: mainTeacherProfileId,
        },
      });
      console.log('Seeded sample active substitution for teacher');
    }
  }

  console.log('--- Teacher Portal & Attendance Seed Completed Successfully ---');
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
