'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { logoutAction } from '@/actions/auth';

// Navigation & Layout Shell
import PortalSidebar from './PortalSidebar';
import PortalHeader from './PortalHeader';
import LeaveRequestModal from './LeaveRequestModal';
import AppointmentBookingModal from './AppointmentBookingModal';

// Screens
import DashboardScreen from './screens/DashboardScreen';
import StudentIdCardScreen from './screens/StudentIdCardScreen';
import ProfileSettingsScreen from './screens/ProfileSettingsScreen';
import TodayTimetableScreen from './screens/TodayTimetableScreen';
import WeeklyTimetableScreen from './screens/WeeklyTimetableScreen';
import SyllabusCurriculumScreen from './screens/SyllabusCurriculumScreen';
import MyAttendanceScreen from './screens/MyAttendanceScreen';
import AttendanceCalendarScreen from './screens/AttendanceCalendarScreen';
import ExamDateSheetScreen from './screens/ExamDateSheetScreen';
import ResultsMarksScreen from './screens/ResultsMarksScreen';
import ReportCardScreen from './screens/ReportCardScreen';
import ExamGuidelinesScreen from './screens/ExamGuidelinesScreen';
import FeeSummaryScreen from './screens/FeeSummaryScreen';
import FeeInvoicesScreen from './screens/FeeInvoicesScreen';
import PaymentHistoryScreen from './screens/PaymentHistoryScreen';
import OnlinePaymentScreen from './screens/OnlinePaymentScreen';
import NotificationsScreen from './screens/NotificationsScreen';
import CircularsNoticesScreen from './screens/CircularsNoticesScreen';
import SchoolEventsScreen from './screens/SchoolEventsScreen';
import HolidayCalendarScreen from './screens/HolidayCalendarScreen';
import KnowAuthoritiesScreen from './screens/KnowAuthoritiesScreen';
import EmergencyContactsScreen from './screens/EmergencyContactsScreen';
import GrievanceFeedbackScreen from './screens/GrievanceFeedbackScreen';
import HelpSupportScreen from './screens/HelpSupportScreen';

export interface ChildOption {
  id: string;
  name: string;
  rollNumber: number | null;
  admissionNumber: string;
  className: string;
  sectionName: string;
  isPrimary: boolean;
}

export interface StudentDashboardProps {
  student: {
    id: string;
    name: string;
    admissionNumber: string;
    rollNumber: number | null;
    sectionName: string;
    className: string;
    board: string;
    batchYear: string;
    avatarUrl?: string | null;
  };
  parentContext?: {
    isParentView: boolean;
    parentName: string;
    relationship: string;
    children: ChildOption[];
  };
  stats: {
    attendancePercentage: number;
    totalClasses: number;
    presentClasses: number;
    cgpa: number;
    feeStatus: {
      isOverdue: boolean;
      pendingAmount: number;
      nextDueDate: string;
      totalPaid: number;
      statusText: string;
    };
    counts: {
      happenings: number;
      messages: number;
      assignments: number;
      events: number;
    };
  };
  subjects: Array<{
    code: string;
    percent: number;
    name: string;
  }>;
  todaySchedule: Array<{
    type: string;
    subject: string;
    code: string;
    room: string;
    section: string;
    teacher: string;
    time: string;
    isSubstitute?: boolean;
  }>;
  notices: Array<{
    id: string;
    title: string;
    date: string;
    category: string;
    priority: string;
  }>;
  faculty: Array<{
    id?: string;
    roleBadge: string;
    name: string;
    designation: string;
    department: string;
    email: string;
    phone: string;
  }>;
  events?: Array<{
    id: string;
    title: string;
    description: string;
    eventDate: string;
    eventTime: string | null;
    location: string | null;
    category: string;
    imageUrl?: string | null;
  }>;
  holidays?: Array<{
    id: string;
    name: string;
    date: string;
    type: string;
  }>;
  initialView?: string;
}

export default function StudentParentDashboardClient({
  student,
  parentContext,
  stats,
  subjects,
  todaySchedule,
  notices,
  faculty,
  events = [],
  holidays = [],
  initialView = 'dashboard',
}: StudentDashboardProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Active navigation view state
  const viewFromQuery = searchParams?.get('view') || initialView;
  const [activeNav, setActiveNav] = useState<string>(viewFromQuery || 'dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);

  // Modals state
  const [leaveModalOpen, setLeaveModalOpen] = useState(false);
  const [appointmentModalOpen, setAppointmentModalOpen] = useState(false);
  const [selectedAuthority, setSelectedAuthority] = useState<(typeof faculty)[0] | null>(null);

  // Sync state if query changes
  useEffect(() => {
    const qView = searchParams?.get('view');
    if (qView && qView !== activeNav) {
      setActiveNav(qView);
    }
  }, [searchParams]);

  const handleSelectNav = (navId: string) => {
    setActiveNav(navId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    const url = new URL(window.location.href);
    if (navId === 'dashboard') {
      url.searchParams.delete('view');
    } else {
      url.searchParams.set('view', navId);
    }
    window.history.pushState({}, '', url.toString());
  };

  const handleSignOut = async () => {
    setIsSigningOut(true);
    await logoutAction();
  };

  const handleOpenAppointment = (person: (typeof faculty)[0]) => {
    setSelectedAuthority(person);
    setAppointmentModalOpen(true);
  };

  const handleSelectChild = (childId: string) => {
    router.push(`/portal?child=${childId}`);
  };

  return (
    <div className="min-h-screen bg-[#EBF6FD] text-slate-900 font-sans antialiased relative">
      {/* Top Cyan Accent Band matching the reference screenshot */}
      <div className="h-1.5 w-full bg-[#20C5FE] sticky top-0 z-50" />

      {/* Global Shell Wrapper */}
      <div className="flex min-h-[calc(100vh-6px)] p-3 sm:p-4 gap-4 sm:gap-5">
        {/* Left Sidebar */}
        <PortalSidebar
          activeNav={activeNav}
          onSelectNav={handleSelectNav}
          isOpenMobile={mobileMenuOpen}
          onCloseMobile={() => setMobileMenuOpen(false)}
          unreadCount={stats.counts.messages}
        />

        {/* Main Content Area (offset by sidebar on desktop) */}
        <div className="flex-1 lg:pl-64 flex flex-col min-w-0 space-y-4 sm:space-y-5">
          {/* Top Header */}
          <PortalHeader
            studentName={student.name}
            className={student.className}
            sectionName={student.sectionName}
            avatarUrl={student.avatarUrl}
            unreadCount={stats.counts.messages}
            onOpenMobileMenu={() => setMobileMenuOpen(true)}
            onSelectNav={handleSelectNav}
            onSignOut={handleSignOut}
            isSigningOut={isSigningOut}
            parentContext={parentContext}
            onSelectChild={handleSelectChild}
            selectedChildId={student.id}
          />

          {/* Dynamic Screen View */}
          <main className="flex-1 min-w-0">
            {activeNav === 'dashboard' && (
              <DashboardScreen
                student={student}
                onSelectNav={handleSelectNav}
                onRequestLeave={() => setLeaveModalOpen(true)}
              />
            )}

            {activeNav === 'student-id-card' && (
              <StudentIdCardScreen
                student={student}
                onBackToDashboard={() => handleSelectNav('dashboard')}
              />
            )}

            {activeNav === 'profile-settings' && (
              <ProfileSettingsScreen
                student={student}
                onBackToDashboard={() => handleSelectNav('dashboard')}
              />
            )}

            {activeNav === 'today-timetable' && (
              <TodayTimetableScreen
                todaySchedule={todaySchedule}
                onBackToDashboard={() => handleSelectNav('dashboard')}
                onSelectNav={handleSelectNav}
              />
            )}

            {activeNav === 'weekly-timetable' && (
              <WeeklyTimetableScreen
                onBackToDashboard={() => handleSelectNav('dashboard')}
                onSelectNav={handleSelectNav}
              />
            )}

            {activeNav === 'syllabus-curriculum' && (
              <SyllabusCurriculumScreen
                onBackToDashboard={() => handleSelectNav('dashboard')}
              />
            )}

            {activeNav === 'my-attendance' && (
              <MyAttendanceScreen
                stats={stats}
                onBackToDashboard={() => handleSelectNav('dashboard')}
                onSelectNav={handleSelectNav}
                onRequestLeave={() => setLeaveModalOpen(true)}
              />
            )}

            {activeNav === 'attendance-calendar' && (
              <AttendanceCalendarScreen
                onBackToDashboard={() => handleSelectNav('dashboard')}
                onSelectNav={handleSelectNav}
              />
            )}

            {activeNav === 'exam-datesheet' && (
              <ExamDateSheetScreen
                onBackToDashboard={() => handleSelectNav('dashboard')}
                onSelectNav={handleSelectNav}
              />
            )}

            {activeNav === 'results-marks' && (
              <ResultsMarksScreen
                subjects={subjects}
                onBackToDashboard={() => handleSelectNav('dashboard')}
                onSelectNav={handleSelectNav}
              />
            )}

            {activeNav === 'report-card' && (
              <ReportCardScreen
                student={student}
                onBackToDashboard={() => handleSelectNav('dashboard')}
              />
            )}

            {activeNav === 'exam-guidelines' && (
              <ExamGuidelinesScreen
                onBackToDashboard={() => handleSelectNav('dashboard')}
                onSelectNav={handleSelectNav}
              />
            )}

            {activeNav === 'fee-summary' && (
              <FeeSummaryScreen
                feeStatus={stats.feeStatus}
                onBackToDashboard={() => handleSelectNav('dashboard')}
                onSelectNav={handleSelectNav}
              />
            )}

            {activeNav === 'fee-invoices' && (
              <FeeInvoicesScreen
                onBackToDashboard={() => handleSelectNav('dashboard')}
                onSelectNav={handleSelectNav}
              />
            )}

            {activeNav === 'payment-history' && (
              <PaymentHistoryScreen
                onBackToDashboard={() => handleSelectNav('dashboard')}
                onSelectNav={handleSelectNav}
              />
            )}

            {activeNav === 'online-payment' && (
              <OnlinePaymentScreen
                onBackToDashboard={() => handleSelectNav('dashboard')}
                onSelectNav={handleSelectNav}
              />
            )}

            {activeNav === 'notifications' && (
              <NotificationsScreen
                onBackToDashboard={() => handleSelectNav('dashboard')}
                onSelectNav={handleSelectNav}
              />
            )}

            {activeNav === 'circulars-notices' && (
              <CircularsNoticesScreen
                notices={notices}
                onBackToDashboard={() => handleSelectNav('dashboard')}
              />
            )}

            {activeNav === 'school-events' && (
              <SchoolEventsScreen
                events={events}
                onBackToDashboard={() => handleSelectNav('dashboard')}
              />
            )}

            {activeNav === 'holiday-calendar' && (
              <HolidayCalendarScreen
                holidays={holidays}
                onBackToDashboard={() => handleSelectNav('dashboard')}
              />
            )}

            {activeNav === 'know-authorities' && (
              <KnowAuthoritiesScreen
                faculty={faculty}
                onBackToDashboard={() => handleSelectNav('dashboard')}
                onBookAppointment={handleOpenAppointment}
              />
            )}

            {activeNav === 'emergency-contacts' && (
              <EmergencyContactsScreen
                onBackToDashboard={() => handleSelectNav('dashboard')}
              />
            )}

            {activeNav === 'grievance-feedback' && (
              <GrievanceFeedbackScreen
                onBackToDashboard={() => handleSelectNav('dashboard')}
              />
            )}

            {activeNav === 'help-support' && (
              <HelpSupportScreen
                onBackToDashboard={() => handleSelectNav('dashboard')}
              />
            )}
          </main>
        </div>
      </div>

      {/* Modals */}
      <LeaveRequestModal
        isOpen={leaveModalOpen}
        onClose={() => setLeaveModalOpen(false)}
        studentName={student.name}
        className={student.className}
        sectionName={student.sectionName}
      />

      <AppointmentBookingModal
        isOpen={appointmentModalOpen}
        onClose={() => {
          setAppointmentModalOpen(false);
          setSelectedAuthority(null);
        }}
        selectedAuthority={selectedAuthority}
      />
    </div>
  );
}
