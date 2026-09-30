'use server';

import { getSessionFromCookies } from '@/lib/session';
import { AttendanceService } from '@/services/attendance.service';
import { MarkDailyAttendanceSchema, type MarkDailyAttendanceInput } from '@/lib/validations/attendance';
import { Role, type RoleType } from '@/types';

/**
 * Server Action for marking daily section attendance.
 * Validates session, checks role permissions, and runs atomic database transaction.
 */
export async function markDailyAttendanceAction(input: MarkDailyAttendanceInput) {
  // 1. Authenticate session
  const session = await getSessionFromCookies();
  if (!session || !session.tenantId) {
    return {
      success: false,
      error: 'Unauthorized: Valid tenant session required.',
    };
  }

  // 2. Authorize role (Teachers, Admins, Super Admins can mark attendance)
  const allowedRoles: RoleType[] = [Role.TEACHER, Role.ADMIN, Role.SUPER_ADMIN];
  if (!allowedRoles.includes(session.role)) {
    return {
      success: false,
      error: 'Forbidden: Insufficient permissions to mark student attendance.',
    };
  }

  // 3. Boundary Zod Validation
  const validation = MarkDailyAttendanceSchema.safeParse(input);
  if (!validation.success) {
    const errorMsg = validation.error.errors.map((e) => e.message).join(', ');
    return {
      success: false,
      error: errorMsg || 'Invalid attendance payload.',
    };
  }

  try {
    const result = await AttendanceService.markDailyAttendance(
      validation.data,
      session.tenantId,
      session.sub
    );

    return {
      success: true,
      count: result.count,
      date: result.date,
      sectionId: result.sectionId,
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to record attendance.';
    return {
      success: false,
      error: message,
    };
  }
}

/**
 * Server Action to retrieve the student roster and current attendance status for a section and date.
 */
export async function getSectionAttendanceRosterAction(sectionId: string, dateStr: string) {
  const session = await getSessionFromCookies();
  if (!session || !session.tenantId) {
    return { success: false, error: 'Unauthorized: Active session required.' };
  }

  try {
    const data = await AttendanceService.getSectionAttendanceRoster(
      sectionId,
      dateStr,
      session.tenantId
    );
    return { success: true, data };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to load section roster.';
    return { success: false, error: message };
  }
}

/**
 * Server Action to retrieve all sections assigned to the logged-in teacher.
 */
export async function getTeacherSectionsAction() {
  const session = await getSessionFromCookies();
  if (!session || !session.tenantId) {
    return { success: false, error: 'Unauthorized: Active session required.' };
  }

  try {
    const sections = await AttendanceService.getTeacherSections(session.sub, session.tenantId);
    return { success: true, sections };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to load teacher sections.';
    return { success: false, error: message };
  }
}

/**
 * Server Action to retrieve today's assigned periods and active substitution alerts for the logged-in teacher.
 */
export async function getTeacherTodayScheduleAction() {
  const session = await getSessionFromCookies();
  if (!session || !session.tenantId) {
    return { success: false, error: 'Unauthorized: Active session required.' };
  }

  try {
    const scheduleData = await AttendanceService.getTeacherTodaySchedule(
      session.sub,
      session.tenantId,
      new Date()
    );
    return { success: true, ...scheduleData };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to load teacher schedule.';
    return { success: false, error: message };
  }
}

/**
 * Server Action for faculty to acknowledge a substitution cover request.
 */
export async function acknowledgeSubstitutionAction(substitutionId: string) {
  const session = await getSessionFromCookies();
  if (!session || !session.tenantId) {
    return { success: false, error: 'Unauthorized: Active session required.' };
  }

  try {
    const { prisma } = await import('@/lib/db');
    await prisma.teacherSubstitution.update({
      where: {
        id: substitutionId,
        tenantId: session.tenantId,
      },
      data: {
        status: 'COMPLETED',
      },
    });

    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to acknowledge substitution.';
    return { success: false, error: message };
  }
}


// ════════════════════════════════════════════════════════════════════════════
// TEACHER SELF-ATTENDANCE ACTIONS (Phase 8.3)
// ════════════════════════════════════════════════════════════════════════════

/**
 * Teacher check-in: creates StaffAttendance record with checkInTime = now.
 * Blocks duplicate check-ins for the same day.
 */
export async function markTeacherCheckInAction() {
  const session = await getSessionFromCookies();
  if (!session || !session.tenantId) {
    return { success: false, error: 'Unauthorized: Active session required.' };
  }

  const allowedRoles: RoleType[] = [Role.TEACHER, Role.ADMIN, Role.SUPER_ADMIN];
  if (!allowedRoles.includes(session.role)) {
    return { success: false, error: 'Forbidden: Only teachers can check in.' };
  }

  try {
    const { prisma } = await import('@/lib/db');
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Check if already checked in today
    const existing = await prisma.staffAttendance.findFirst({
      where: {
        tenantId: session.tenantId,
        userId: session.sub,
        date: today,
      },
    });

    if (existing) {
      return {
        success: false,
        error: 'Already checked in today.',
        alreadyCheckedIn: true,
        checkInTime: existing.checkInTime?.toISOString() ?? null,
        checkOutTime: existing.checkOutTime?.toISOString() ?? null,
      };
    }

    const now = new Date();
    const record = await prisma.staffAttendance.create({
      data: {
        tenantId: session.tenantId,
        userId: session.sub,
        date: today,
        status: 'PRESENT',
        checkInTime: now,
      },
    });

    return {
      success: true,
      checkInTime: record.checkInTime?.toISOString() ?? null,
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to check in.';
    return { success: false, error: message };
  }
}

/**
 * Teacher check-out: updates checkOutTime on today's StaffAttendance.
 */
export async function markTeacherCheckOutAction() {
  const session = await getSessionFromCookies();
  if (!session || !session.tenantId) {
    return { success: false, error: 'Unauthorized: Active session required.' };
  }

  try {
    const { prisma } = await import('@/lib/db');
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const existing = await prisma.staffAttendance.findFirst({
      where: {
        tenantId: session.tenantId,
        userId: session.sub,
        date: today,
      },
    });

    if (!existing) {
      return { success: false, error: 'No check-in found for today. Please check in first.' };
    }

    if (existing.checkOutTime) {
      return {
        success: false,
        error: 'Already checked out today.',
        checkOutTime: existing.checkOutTime.toISOString(),
      };
    }

    const now = new Date();
    await prisma.staffAttendance.update({
      where: { id: existing.id },
      data: { checkOutTime: now },
    });

    return { success: true, checkOutTime: now.toISOString() };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to check out.';
    return { success: false, error: message };
  }
}

/**
 * Get teacher's attendance summary for a specific month.
 */
export async function getTeacherAttendanceSummaryAction(month?: number, year?: number) {
  const session = await getSessionFromCookies();
  if (!session || !session.tenantId) {
    return { success: false, error: 'Unauthorized' };
  }

  try {
    const { prisma } = await import('@/lib/db');
    const now = new Date();
    const m = month ?? now.getMonth();
    const y = year ?? now.getFullYear();

    const startDate = new Date(y, m, 1);
    const endDate = new Date(y, m + 1, 0, 23, 59, 59, 999);

    const records = await prisma.staffAttendance.findMany({
      where: {
        tenantId: session.tenantId,
        userId: session.sub,
        date: { gte: startDate, lte: endDate },
      },
      orderBy: { date: 'asc' },
    });

    // Check today's status
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayRecord = records.find(r => {
      const rDate = new Date(r.date);
      rDate.setHours(0, 0, 0, 0);
      return rDate.getTime() === today.getTime();
    });

    const present = records.filter(r => r.status === 'PRESENT').length;
    const absent = records.filter(r => r.status === 'ABSENT').length;
    const late = records.filter(r => r.status === 'LATE').length;
    const totalDays = records.length;
    const percentage = totalDays > 0 ? Math.round((present / totalDays) * 100) : 100;

    return {
      success: true,
      summary: {
        present,
        absent,
        late,
        totalDays,
        percentage,
        month: m,
        year: y,
      },
      todayStatus: todayRecord ? {
        checkInTime: todayRecord.checkInTime?.toISOString() ?? null,
        checkOutTime: todayRecord.checkOutTime?.toISOString() ?? null,
        status: todayRecord.status,
      } : null,
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to load attendance summary.';
    return { success: false, error: message };
  }
}


// ════════════════════════════════════════════════════════════════════════════
// STUDENT ATTENDANCE SUMMARY (Phase 8.2)
// ════════════════════════════════════════════════════════════════════════════

/**
 * Get student's attendance summary: overall stats, subject-wise, and day-by-day.
 */
export async function getStudentAttendanceSummaryAction(studentId: string) {
  const session = await getSessionFromCookies();
  if (!session || !session.tenantId) {
    return { success: false, error: 'Unauthorized' };
  }

  try {
    const { prisma } = await import('@/lib/db');

    // Get all attendance records for this student
    const records = await prisma.studentAttendance.findMany({
      where: {
        tenantId: session.tenantId,
        studentId,
      },
      orderBy: { date: 'asc' },
    });

    const totalDays = records.filter(r => r.period === null).length || records.length;
    const present = records.filter(r => r.status === 'PRESENT' && r.period === null).length;
    const absent = records.filter(r => r.status === 'ABSENT' && r.period === null).length;
    const late = records.filter(r => r.status === 'LATE' && r.period === null).length;
    const percentage = totalDays > 0 ? Math.round((present / totalDays) * 100) : 100;

    // Day-by-day records for calendar (daily attendance, period = null)
    const dailyRecords = records
      .filter(r => r.period === null)
      .map(r => ({
        date: r.date.toISOString().split('T')[0],
        status: r.status,
      }));

    // Subject-wise breakdown (period-based attendance)
    const periodRecords = records.filter(r => r.period !== null);

    // Get timetable entries to map periods to subjects
    const student = await prisma.studentProfile.findUnique({
      where: { id: studentId },
      select: { sectionId: true },
    });

    let subjectWise: Array<{ subjectName: string; subjectCode: string; total: number; present: number; percentage: number }> = [];

    if (student?.sectionId) {
      const timetableEntries = await prisma.timetableEntry.findMany({
        where: {
          tenantId: session.tenantId,
          sectionId: student.sectionId,
          subjectId: { not: null },
        },
        include: {
          subject: { select: { id: true, name: true, code: true } },
        },
      });

      // Get unique subjects from timetable
      const subjects = new Map<string, { name: string; code: string }>();
      for (const entry of timetableEntries) {
        if (entry.subject) {
          subjects.set(entry.subject.id, { name: entry.subject.name, code: entry.subject.code });
        }
      }

      // For now, distribute overall attendance across subjects (even split)
      subjectWise = Array.from(subjects.values()).map(sub => ({
        subjectName: sub.name,
        subjectCode: sub.code,
        total: totalDays,
        present,
        percentage,
      }));
    }

    return {
      success: true,
      summary: {
        totalDays,
        present,
        absent,
        late,
        percentage,
        dailyRecords,
        subjectWise,
      },
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to load attendance summary.';
    return { success: false, error: message };
  }
}


// ════════════════════════════════════════════════════════════════════════════
// ADMIN ATTENDANCE OVERSIGHT (Phase 8.4)
// ════════════════════════════════════════════════════════════════════════════

/**
 * Admin overview: today's totals, classes not marked, class-wise breakdown, 7-day trend.
 */
export async function getAdminAttendanceOverviewAction() {
  const session = await getSessionFromCookies();
  if (!session || !session.tenantId || (session.role !== 'ADMIN' && session.role !== 'SUPER_ADMIN')) {
    return { success: false, error: 'Unauthorized: Admin privileges required.' };
  }

  try {
    const { prisma } = await import('@/lib/db');
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

    // Get all sections with class info
    const sections = await prisma.section.findMany({
      where: { tenantId: session.tenantId },
      include: {
        classGrade: { select: { name: true } },
        students: { select: { id: true } },
      },
    });

    // Get class teacher info
    const teacherIds = sections.map(s => s.classTeacherId).filter((id): id is string => Boolean(id));
    const classTeachers = teacherIds.length > 0
      ? await prisma.teacherProfile.findMany({
          where: { id: { in: teacherIds } },
          include: { user: { select: { firstName: true, lastName: true } } },
        })
      : [];
    const teacherMap = new Map(classTeachers.map(t => [t.id, `${t.user.firstName} ${t.user.lastName}`]));

    // Today's attendance records
    const todayRecords = await prisma.studentAttendance.findMany({
      where: {
        tenantId: session.tenantId,
        date: { gte: todayStart, lte: todayEnd },
        period: null, // daily attendance only
      },
      select: { status: true, sectionId: true },
    });

    const totalPresent = todayRecords.filter(r => r.status === 'PRESENT').length;
    const totalAbsent = todayRecords.filter(r => r.status === 'ABSENT').length;
    const totalLate = todayRecords.filter(r => r.status === 'LATE').length;
    const totalMarked = todayRecords.length;
    const totalStudents = sections.reduce((sum, s) => sum + s.students.length, 0);
    const attendancePercentage = totalMarked > 0
      ? Math.round((totalPresent / totalMarked) * 100)
      : 0;

    // Classes not yet marked
    const markedSectionIds = new Set(todayRecords.map(r => r.sectionId));
    const classesNotMarked = sections
      .filter(s => !markedSectionIds.has(s.id) && s.students.length > 0)
      .map(s => ({
        id: s.id,
        className: s.classGrade.name,
        sectionName: s.name,
        classTeacherName: s.classTeacherId ? (teacherMap.get(s.classTeacherId) ?? 'Unassigned') : 'Unassigned',
        studentCount: s.students.length,
      }));

    // Class-wise breakdown
    const classWise = sections.map(s => {
      const sectionRecords = todayRecords.filter(r => r.sectionId === s.id);
      const sPresent = sectionRecords.filter(r => r.status === 'PRESENT').length;
      const sAbsent = sectionRecords.filter(r => r.status === 'ABSENT').length;
      const sLate = sectionRecords.filter(r => r.status === 'LATE').length;
      const sTotal = sectionRecords.length;
      return {
        id: s.id,
        className: s.classGrade.name,
        sectionName: s.name,
        totalStudents: s.students.length,
        present: sPresent,
        absent: sAbsent,
        late: sLate,
        percentage: sTotal > 0 ? Math.round((sPresent / sTotal) * 100) : 0,
        isMarked: sTotal > 0,
      };
    });

    // 7-day trend
    const trend: Array<{ date: string; dayLabel: string; percentage: number; total: number; present: number }> = [];
    const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dayStart = new Date(d.getFullYear(), d.getMonth(), d.getDate());
      const dayEnd = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999);

      const dayRecords = await prisma.studentAttendance.findMany({
        where: {
          tenantId: session.tenantId,
          date: { gte: dayStart, lte: dayEnd },
          period: null,
        },
        select: { status: true },
      });

      const dayPresent = dayRecords.filter(r => r.status === 'PRESENT').length;
      const dayTotal = dayRecords.length;

      trend.push({
        date: dayStart.toISOString().split('T')[0],
        dayLabel: dayLabels[dayStart.getDay()],
        percentage: dayTotal > 0 ? Math.round((dayPresent / dayTotal) * 100) : 0,
        total: dayTotal,
        present: dayPresent,
      });
    }

    return {
      success: true,
      overview: {
        totalPresent,
        totalAbsent,
        totalLate,
        totalStudents,
        attendancePercentage,
        classesNotMarked,
        classWise,
        trend,
      },
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to load attendance overview.';
    return { success: false, error: message };
  }
}

/**
 * Export attendance data as CSV or XLSX for a date range.
 */
export async function exportAttendanceDataAction(
  startDate: string,
  endDate: string,
  format: 'csv' | 'xlsx' = 'csv'
) {
  const session = await getSessionFromCookies();
  if (!session || !session.tenantId || (session.role !== 'ADMIN' && session.role !== 'SUPER_ADMIN')) {
    return { success: false, error: 'Unauthorized: Admin privileges required.' };
  }

  try {
    const { prisma } = await import('@/lib/db');
    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    const records = await prisma.studentAttendance.findMany({
      where: {
        tenantId: session.tenantId,
        date: { gte: start, lte: end },
        period: null,
      },
      include: {
        student: {
          include: {
            user: { select: { firstName: true, lastName: true } },
            section: {
              include: { classGrade: { select: { name: true } } },
            },
          },
        },
      },
      orderBy: [{ date: 'asc' }, { student: { user: { firstName: 'asc' } } }],
    });

    const rows = records.map(r => ({
      Date: r.date.toISOString().split('T')[0],
      'Student Name': `${r.student.user.firstName} ${r.student.user.lastName}`,
      'Admission No': r.student.admissionNumber,
      Class: r.student.section?.classGrade?.name ?? '-',
      Section: r.student.section?.name ?? '-',
      Status: r.status,
      Remarks: r.remarks ?? '',
    }));

    if (format === 'xlsx') {
      const XLSX = await import('xlsx');
      const worksheet = XLSX.utils.json_to_sheet(rows);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Attendance');
      const buffer = XLSX.write(workbook, { type: 'base64', bookType: 'xlsx' });
      return {
        success: true,
        data: buffer as string,
        fileName: `attendance_${startDate}_to_${endDate}.xlsx`,
        mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        format: 'xlsx' as const,
      };
    }

    // CSV format
    if (rows.length === 0) {
      return { success: true, data: '', fileName: `attendance_${startDate}_to_${endDate}.csv`, mimeType: 'text/csv', format: 'csv' as const };
    }

    const headers = Object.keys(rows[0]);
    const csvLines = [
      headers.join(','),
      ...rows.map(row =>
        headers.map(h => {
          const val = String(row[h as keyof typeof row] ?? '');
          return val.includes(',') || val.includes('"') ? `"${val.replace(/"/g, '""')}"` : val;
        }).join(',')
      ),
    ];

    return {
      success: true,
      data: csvLines.join('\n'),
      fileName: `attendance_${startDate}_to_${endDate}.csv`,
      mimeType: 'text/csv',
      format: 'csv' as const,
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to export attendance data.';
    return { success: false, error: message };
  }
}
