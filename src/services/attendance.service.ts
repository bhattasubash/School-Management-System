import { prisma } from '@/lib/db';
import type { MarkDailyAttendanceInput } from '@/lib/validations/attendance';
import type { AttendanceStatus, DayOfWeek } from '@prisma/client';

export interface StudentRosterItem {
  id: string; // studentProfileId
  userId: string;
  admissionNumber: string;
  rollNumber: number | null;
  firstName: string;
  lastName: string;
  avatarUrl: string | null;
  status: AttendanceStatus;
  remarks: string | null;
}

export interface SectionInfo {
  id: string;
  name: string;
  classGradeId: string;
  classGradeName: string;
  isClassTeacher: boolean;
}

export interface TeacherPeriodScheduleItem {
  id: string;
  periodName: string;
  order: number;
  startTime: string;
  endTime: string;
  isBreak: boolean;
  className: string;
  sectionName: string;
  subjectName: string;
  subjectCode: string;
  roomNumber?: string;
  isSubstitution: boolean;
  originalTeacherName?: string;
  substitutionReason?: string;
}

export class AttendanceService {
  /**
   * Atomically records daily attendance for a class section inside a database transaction.
   * If attendance already exists for that date, existing records are replaced safely without duplicates.
   */
  static async markDailyAttendance(
    input: MarkDailyAttendanceInput,
    tenantId: string,
    markedByUserId?: string
  ): Promise<{ success: boolean; count: number; date: string; sectionId: string }> {
    if (!tenantId) {
      throw new Error('Tenant isolation security violation: tenantId is required');
    }

    const targetDate = new Date(`${input.date}T00:00:00.000Z`);

    // Verify section belongs to tenant
    const section = await prisma.section.findFirst({
      where: { id: input.sectionId, tenantId },
    });

    if (!section) {
      throw new Error('Section not found or unauthorized tenant access.');
    }

    // Holiday Check (Soft Block with override option)
    const holiday = await prisma.holiday.findFirst({
      where: {
        tenantId,
        date: targetDate,
      },
    });

    if (holiday && !input.overrideHoliday) {
      throw new Error(`Today is a scheduled holiday (${holiday.name}). Attendance marking is restricted unless holiday override is enabled.`);
    }

    // ACID Transaction: Atomic replace of daily attendance records for this section & date
    await prisma.$transaction(async (tx) => {
      // 1. Clear existing attendance for this specific section, date, and daily period (period = null)
      await tx.studentAttendance.deleteMany({
        where: {
          tenantId,
          sectionId: input.sectionId,
          date: targetDate,
          period: null,
        },
      });

      // 2. Batch create new attendance records
      await tx.studentAttendance.createMany({
        data: input.records.map((record) => ({
          tenantId,
          studentId: record.studentId,
          sectionId: input.sectionId,
          date: targetDate,
          period: null,
          status: record.status as AttendanceStatus,
          remarks: record.remarks?.trim() || null,
          markedBy: markedByUserId || null,
        })),
      });

      // 3. Write structured audit log
      try {
        await tx.auditLog.create({
          data: {
            tenantId,
            userId: markedByUserId || null,
            action: 'STUDENT_ATTENDANCE_MARKED',
            entityType: 'StudentAttendance',
            entityId: input.sectionId,
            newValues: {
              sectionId: input.sectionId,
              date: input.date,
              totalRecords: input.records.length,
              presentCount: input.records.filter((r) => r.status === 'PRESENT').length,
              absentCount: input.records.filter((r) => r.status === 'ABSENT').length,
            },
          },
        });
      } catch {
        // Defensive: never fail main transaction if audit logging fails
      }
    });

    return {
      success: true,
      count: input.records.length,
      date: input.date,
      sectionId: input.sectionId,
    };
  }

  /**
   * Retrieves the student attendance roster for a specific section and date.
   * If attendance was already marked, returns existing status; otherwise defaults to PRESENT.
   */
  static async getSectionAttendanceRoster(
    sectionId: string,
    dateStr: string,
    tenantId: string
  ): Promise<{
    section: SectionInfo;
    date: string;
    isAlreadyMarked: boolean;
    students: StudentRosterItem[];
  }> {
    const targetDate = new Date(`${dateStr}T00:00:00.000Z`);

    const section = await prisma.section.findFirst({
      where: { id: sectionId, tenantId },
      include: {
        classGrade: true,
      },
    });

    if (!section) {
      throw new Error('Section not found for tenant.');
    }

    // Fetch active students in this section
    const students = await prisma.studentProfile.findMany({
      where: {
        tenantId,
        sectionId,
        user: { isActive: true },
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatarUrl: true,
          },
        },
        attendances: {
          where: {
            tenantId,
            date: targetDate,
            period: null,
          },
          take: 1,
        },
      },
      orderBy: [
        { rollNumber: 'asc' },
        { user: { firstName: 'asc' } },
      ],
    });

    const isAlreadyMarked = students.some((s) => s.attendances.length > 0);

    const roster: StudentRosterItem[] = students.map((s) => {
      const attendance = s.attendances[0];
      return {
        id: s.id,
        userId: s.user.id,
        admissionNumber: s.admissionNumber,
        rollNumber: s.rollNumber,
        firstName: s.user.firstName,
        lastName: s.user.lastName,
        avatarUrl: s.user.avatarUrl,
        status: (attendance?.status as AttendanceStatus) || 'PRESENT',
        remarks: attendance?.remarks || null,
      };
    });

    return {
      section: {
        id: section.id,
        name: section.name,
        classGradeId: section.classGrade.id,
        classGradeName: section.classGrade.name,
        isClassTeacher: false,
      },
      date: dateStr,
      isAlreadyMarked,
      students: roster,
    };
  }

  /**
   * Retrieves all sections assigned to a teacher (either as Class Teacher or Subject Teacher).
   */
  static async getTeacherSections(teacherUserId: string, tenantId: string): Promise<SectionInfo[]> {
    const teacherProfile = await prisma.teacherProfile.findFirst({
      where: { userId: teacherUserId, tenantId },
      include: {
        classSubjects: {
          include: {
            section: {
              include: { classGrade: true },
            },
          },
        },
      },
    });

    if (!teacherProfile) {
      // Fallback: return default sections in tenant for admin or testing
      const allSections = await prisma.section.findMany({
        where: { tenantId },
        include: { classGrade: true },
        take: 5,
        orderBy: { classGrade: { numericOrder: 'asc' } },
      });

      return allSections.map((s) => ({
        id: s.id,
        name: s.name,
        classGradeId: s.classGrade.id,
        classGradeName: s.classGrade.name,
        isClassTeacher: false,
      }));
    }

    const sectionMap = new Map<string, SectionInfo>();

    // 1. Sections where assigned as Class Teacher
    const classTeacherSections = await prisma.section.findMany({
      where: {
        tenantId,
        classTeacherId: teacherProfile.id,
      },
      include: { classGrade: true },
    });

    for (const sec of classTeacherSections) {
      sectionMap.set(sec.id, {
        id: sec.id,
        name: sec.name,
        classGradeId: sec.classGrade.id,
        classGradeName: sec.classGrade.name,
        isClassTeacher: true,
      });
    }

    // 2. Sections where teaching a subject
    for (const cs of teacherProfile.classSubjects) {
      if (!sectionMap.has(cs.section.id)) {
        sectionMap.set(cs.section.id, {
          id: cs.section.id,
          name: cs.section.name,
          classGradeId: cs.section.classGrade.id,
          classGradeName: cs.section.classGrade.name,
          isClassTeacher: false,
        });
      }
    }

    // If teacher has no assigned sections yet, return the school's active sections so teacher can test
    if (sectionMap.size === 0) {
      const fallbackSections = await prisma.section.findMany({
        where: { tenantId },
        include: { classGrade: true },
        take: 3,
      });
      for (const s of fallbackSections) {
        sectionMap.set(s.id, {
          id: s.id,
          name: s.name,
          classGradeId: s.classGrade.id,
          classGradeName: s.classGrade.name,
          isClassTeacher: false,
        });
      }
    }

    return Array.from(sectionMap.values());
  }

  /**
   * Retrieves today's period schedule and active substitution alerts for a teacher.
   */
  static async getTeacherTodaySchedule(
    teacherUserId: string,
    tenantId: string,
    date: Date = new Date()
  ): Promise<{
    dayOfWeek: DayOfWeek;
    schedule: TeacherPeriodScheduleItem[];
    substitutions: TeacherPeriodScheduleItem[];
  }> {
    const dayNames: DayOfWeek[] = [
      'SUNDAY',
      'MONDAY',
      'TUESDAY',
      'WEDNESDAY',
      'THURSDAY',
      'FRIDAY',
      'SATURDAY',
    ];
    const dayOfWeek = dayNames[date.getDay()];
    const dateOnly = new Date(`${date.toISOString().split('T')[0]}T00:00:00.000Z`);

    const teacherProfile = await prisma.teacherProfile.findFirst({
      where: { userId: teacherUserId, tenantId },
    });

    if (!teacherProfile) {
      return { dayOfWeek, schedule: [], substitutions: [] };
    }

    // 1. Regular Timetable Entries for this teacher & day of week
    const timetableEntries = await prisma.timetableEntry.findMany({
      where: {
        tenantId,
        teacherId: teacherProfile.id,
        dayOfWeek,
      },
      include: {
        periodTimeSlot: true,
        section: {
          include: { classGrade: true },
        },
        subject: true,
      },
      orderBy: {
        periodTimeSlot: { order: 'asc' },
      },
    });

    const schedule: TeacherPeriodScheduleItem[] = timetableEntries.map((t) => ({
      id: t.id,
      periodName: t.periodTimeSlot.name,
      order: t.periodTimeSlot.order,
      startTime: t.periodTimeSlot.startTime,
      endTime: t.periodTimeSlot.endTime,
      isBreak: t.periodTimeSlot.isBreak,
      className: t.section.classGrade.name,
      sectionName: t.section.name,
      subjectName: t.subject?.name || 'Assigned Period',
      subjectCode: t.subject?.code || 'GEN',
      isSubstitution: false,
    }));

    // 2. Active Substitutions Assigned for Today
    const activeSubstitutions = await prisma.teacherSubstitution.findMany({
      where: {
        tenantId,
        substituteTeacherId: teacherProfile.id,
        date: dateOnly,
        status: 'ASSIGNED',
      },
      include: {
        timetableEntry: {
          include: {
            periodTimeSlot: true,
            section: { include: { classGrade: true } },
            subject: true,
          },
        },
      },
    });

    // Also look up original teacher names for substitutions
    const substitutions: TeacherPeriodScheduleItem[] = [];
    for (const sub of activeSubstitutions) {
      const origTeacher = await prisma.teacherProfile.findUnique({
        where: { id: sub.originalTeacherId },
        include: { user: true },
      });

      substitutions.push({
        id: sub.id,
        periodName: sub.timetableEntry.periodTimeSlot.name,
        order: sub.timetableEntry.periodTimeSlot.order,
        startTime: sub.timetableEntry.periodTimeSlot.startTime,
        endTime: sub.timetableEntry.periodTimeSlot.endTime,
        isBreak: sub.timetableEntry.periodTimeSlot.isBreak,
        className: sub.timetableEntry.section.classGrade.name,
        sectionName: sub.timetableEntry.section.name,
        subjectName: sub.timetableEntry.subject?.name || 'Substitute Period',
        subjectCode: sub.timetableEntry.subject?.code || 'SUB',
        isSubstitution: true,
        originalTeacherName: origTeacher
          ? `${origTeacher.user.firstName} ${origTeacher.user.lastName}`
          : 'Absent Colleague',
        substitutionReason: sub.reason || 'Medical / Emergency Leave',
      });
    }

    return {
      dayOfWeek,
      schedule,
      substitutions,
    };
  }
}
