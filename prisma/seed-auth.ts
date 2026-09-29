import {
  PrismaClient,
  Role,
  SubscriptionStatus,
  DayOfWeek,
  SubstitutionStatus,
  NoticeAudience,
  NoticePriority,
  AttendanceStatus,
  InvoiceStatus,
} from '@prisma/client';
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
      let existingProfile = await prisma.studentProfile.findFirst({
        where: {
          OR: [
            { userId: user.id },
            { tenantId: item.tenantId, admissionNumber: 'DPS-2022-4891' },
          ],
        },
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
      } else if (existingProfile.userId !== user.id) {
        await prisma.studentProfile.update({
          where: { id: existingProfile.id },
          data: { userId: user.id },
        });
      }
    }

    if (item.role === Role.PARENT && item.tenantId) {
      let existingProfile = await prisma.parentProfile.findFirst({
        where: { userId: user.id },
      });
      if (!existingProfile) {
        await prisma.parentProfile.create({
          data: {
            tenantId: item.tenantId,
            userId: user.id,
            occupation: 'Architectural Consultant',
            annualIncome: 1800000.0,
            relationship: 'FATHER',
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
      where: {
        OR: [
          { tenantId: tenant.id, userId: u.id },
          { tenantId: tenant.id, admissionNumber: s.adm },
        ],
      },
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
    } else if (sp.userId !== u.id) {
      await prisma.studentProfile.update({
        where: { id: sp.id },
        data: { userId: u.id },
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

  // 9. Ensure Remaining CBSE Subjects exist (ENG-184, SOC-087, HIN-002)
  const moreSubjects = [
    { code: 'ENG-184', name: 'English Language & Lit.' },
    { code: 'SOC-087', name: 'Social Science' },
    { code: 'HIN-002', name: 'Hindi Course A' },
  ];
  for (const s of moreSubjects) {
    let sub = await prisma.subject.findFirst({
      where: { tenantId: tenant.id, code: s.code },
    });
    if (!sub) {
      await prisma.subject.create({
        data: {
          tenantId: tenant.id,
          code: s.code,
          name: s.name,
        },
      });
    }
  }

  // 10. Link Parent (Rajesh Sharma) to Rohan Sharma (Primary) and Aanya Patel (Sibling)
  const parentUser = await prisma.user.findFirst({
    where: { tenantId: tenant.id, email: 'parent@dps.edu.in' },
    include: { parentProfile: true },
  });

  const rohanProfile = await prisma.studentProfile.findFirst({
    where: { tenantId: tenant.id, admissionNumber: 'DPS-2022-4891' },
  });

  const aanyaProfile = await prisma.studentProfile.findFirst({
    where: { tenantId: tenant.id, admissionNumber: 'DPS-2022-4892' },
  });

  if (parentUser?.parentProfile && rohanProfile) {
    const linkRohan = await prisma.parentStudentLink.findUnique({
      where: {
        parentId_studentId: {
          parentId: parentUser.parentProfile.id,
          studentId: rohanProfile.id,
        },
      },
    });
    if (!linkRohan) {
      await prisma.parentStudentLink.create({
        data: {
          tenantId: tenant.id,
          parentId: parentUser.parentProfile.id,
          studentId: rohanProfile.id,
          isPrimary: true,
        },
      });
      console.log('Linked Parent to Rohan Sharma (Primary Child)');
    }
  }

  if (parentUser?.parentProfile && aanyaProfile) {
    const linkAanya = await prisma.parentStudentLink.findUnique({
      where: {
        parentId_studentId: {
          parentId: parentUser.parentProfile.id,
          studentId: aanyaProfile.id,
        },
      },
    });
    if (!linkAanya) {
      await prisma.parentStudentLink.create({
        data: {
          tenantId: tenant.id,
          parentId: parentUser.parentProfile.id,
          studentId: aanyaProfile.id,
          isPrimary: false,
        },
      });
      console.log('Linked Parent to Aanya Patel (Sibling)');
    }
  }

  // 11. Seed Student Attendance records for Rohan Sharma (past 15 school days)
  if (rohanProfile) {
    const today = new Date();
    for (let i = 1; i <= 20; i++) {
      const pastDate = new Date(today);
      pastDate.setDate(today.getDate() - i);
      // Skip weekends
      if (pastDate.getDay() === 0 || pastDate.getDay() === 6) continue;

      const dateOnly = new Date(`${pastDate.toISOString().split('T')[0]}T00:00:00.000Z`);

      const existingAtt = await prisma.studentAttendance.findFirst({
        where: {
          tenantId: tenant.id,
          studentId: rohanProfile.id,
          date: dateOnly,
          period: null,
        },
      });

      if (!existingAtt) {
        let status: AttendanceStatus = AttendanceStatus.PRESENT;
        if (i === 4) status = AttendanceStatus.LATE;
        else if (i === 11) status = AttendanceStatus.EXCUSED;

        await prisma.studentAttendance.create({
          data: {
            tenantId: tenant.id,
            studentId: rohanProfile.id,
            sectionId: rohanProfile.sectionId,
            date: dateOnly,
            period: null,
            status,
            remarks: status === AttendanceStatus.LATE ? 'Delayed by school bus route' : undefined,
          },
        });
      }
    }
  }

  // 12. Seed Exam Term, Exam Schedules, and Exam Results
  let examTerm = await prisma.examTerm.findFirst({
    where: { tenantId: tenant.id, academicYearId: academicYear.id, name: 'Mid-Term Examination 2026' },
  });
  if (!examTerm) {
    examTerm = await prisma.examTerm.create({
      data: {
        tenantId: tenant.id,
        academicYearId: academicYear.id,
        name: 'Mid-Term Examination 2026',
        startDate: new Date('2026-09-01'),
        endDate: new Date('2026-09-20'),
      },
    });
  }

  const allSubjects = await prisma.subject.findMany({
    where: { tenantId: tenant.id },
  });

  const scoresByCode: Record<string, { marks: number; grade: string; gp: number }> = {
    'MATH-041': { marks: 92, grade: 'A1', gp: 10.0 },
    'SCI-086': { marks: 86, grade: 'A2', gp: 9.0 },
    'ENG-184': { marks: 95, grade: 'A1', gp: 10.0 },
    'SOC-087': { marks: 78, grade: 'B1', gp: 8.0 },
    'HIN-002': { marks: 71, grade: 'B1', gp: 8.0 },
  };

  if (rohanProfile && mainTeacherProfileId) {
    for (const sub of allSubjects) {
      if (!scoresByCode[sub.code]) continue;

      let sched = await prisma.examSchedule.findFirst({
        where: {
          tenantId: tenant.id,
          examTermId: examTerm.id,
          classGradeId: classGrade.id,
          subjectId: sub.id,
        },
      });

      if (!sched) {
        sched = await prisma.examSchedule.create({
          data: {
            tenantId: tenant.id,
            examTermId: examTerm.id,
            classGradeId: classGrade.id,
            subjectId: sub.id,
            examDate: new Date('2026-09-10'),
            startTime: '09:00',
            endTime: '12:00',
            maxMarks: 100,
            passingMarks: 33,
          },
        });
      }

      const existingResult = await prisma.examResult.findFirst({
        where: {
          tenantId: tenant.id,
          examScheduleId: sched.id,
          studentId: rohanProfile.id,
        },
      });

      if (!existingResult) {
        const score = scoresByCode[sub.code];
        await prisma.examResult.create({
          data: {
            tenantId: tenant.id,
            examScheduleId: sched.id,
            studentId: rohanProfile.id,
            marksObtained: score.marks,
            grade: score.grade,
            gradePoint: score.gp,
            enteredById: mainTeacherProfileId,
          },
        });
      }
    }
  }

  // 13. Seed Fee Invoices for Rohan Sharma
  if (rohanProfile) {
    let inv1 = await prisma.feeInvoice.findFirst({
      where: { tenantId: tenant.id, invoiceNumber: 'INV-2026-0001' },
    });
    if (!inv1) {
      await prisma.feeInvoice.create({
        data: {
          tenantId: tenant.id,
          studentId: rohanProfile.id,
          academicYearId: academicYear.id,
          invoiceNumber: 'INV-2026-0001',
          totalAmount: 22000.0,
          discountAmount: 0.0,
          lateFee: 0.0,
          netAmount: 22000.0,
          paidAmount: 22000.0,
          balanceAmount: 0.0,
          dueDate: new Date('2026-05-10'),
          status: InvoiceStatus.PAID,
        },
      });
    }

    let inv2 = await prisma.feeInvoice.findFirst({
      where: { tenantId: tenant.id, invoiceNumber: 'INV-2026-0002' },
    });
    if (!inv2) {
      const nextMonth = new Date();
      nextMonth.setDate(nextMonth.getDate() + 15);
      await prisma.feeInvoice.create({
        data: {
          tenantId: tenant.id,
          studentId: rohanProfile.id,
          academicYearId: academicYear.id,
          invoiceNumber: 'INV-2026-0002',
          totalAmount: 18500.0,
          discountAmount: 0.0,
          lateFee: 0.0,
          netAmount: 18500.0,
          paidAmount: 0.0,
          balanceAmount: 18500.0,
          dueDate: nextMonth,
          status: InvoiceStatus.PENDING,
        },
      });
    }
  }

  // 14. Seed Institutional Notices
  const noticesToSeed = [
    {
      title: 'CBSE Class 10 Term-I Practical Examination Schedule Released',
      content: 'All class 10 students are required to review the physics and chemistry laboratory schedule.',
      priority: NoticePriority.IMPORTANT,
      audience: NoticeAudience.ALL,
    },
    {
      title: 'Mid-Term Assessment Report Cards Distribution',
      content: 'Official CBSE verified scorecards for Term 1 will be uploaded and accessible via portal.',
      priority: NoticePriority.NORMAL,
      audience: NoticeAudience.PARENTS,
    },
    {
      title: 'Annual Inter-School STEM and Robotics Championship 2026',
      content: 'Students wishing to participate in the upcoming regional robotics Olympiad should submit their names.',
      priority: NoticePriority.NORMAL,
      audience: NoticeAudience.STUDENTS,
    },
    {
      title: 'Winter Uniform Mandatory Guidelines Effective Next Monday',
      content: 'In accordance with school dress code policy, full winter blazers and ties are mandatory.',
      priority: NoticePriority.NORMAL,
      audience: NoticeAudience.ALL,
    },
  ];

  const adminUser = await prisma.user.findFirst({
    where: { tenantId: tenant.id, role: Role.ADMIN },
  });

  if (adminUser) {
    for (const n of noticesToSeed) {
      let existingNotice = await prisma.notice.findFirst({
        where: { tenantId: tenant.id, title: n.title },
      });
      if (!existingNotice) {
        await prisma.notice.create({
          data: {
            tenantId: tenant.id,
            authorId: adminUser.id,
            title: n.title,
            content: n.content,
            priority: n.priority,
            targetAudience: n.audience,
          },
        });
      }
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
