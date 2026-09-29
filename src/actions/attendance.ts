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
