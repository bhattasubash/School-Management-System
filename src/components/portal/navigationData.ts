import {
  LayoutDashboard,
  Contact,
  UserCog,
  CalendarClock,
  CalendarDays,
  BookOpen,
  UserCheck,
  CalendarCheck2,
  CalendarRange,
  BarChart3,
  FileText,
  Info,
  Wallet,
  FileSpreadsheet,
  History,
  CreditCard,
  Bell,
  Megaphone,
  Sparkles,
  Sun,
  ShieldAlert,
  PhoneCall,
  MessageSquareHeart,
  HelpCircle,
  type LucideIcon,
} from 'lucide-react';

export interface PortalNavItem {
  id: string;
  label: string;
  icon: LucideIcon;
  badge?: string | number;
}

export interface PortalNavSection {
  title: string;
  items: PortalNavItem[];
}

export const PORTAL_NAV_SECTIONS: PortalNavSection[] = [
  {
    title: 'MAIN',
    items: [
      { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { id: 'student-id-card', label: 'Student ID Card', icon: Contact },
      { id: 'profile-settings', label: 'Profile & Settings', icon: UserCog },
    ],
  },
  {
    title: 'ACADEMIC',
    items: [
      { id: 'today-timetable', label: "Today's Timetable", icon: CalendarClock },
      { id: 'weekly-timetable', label: 'Weekly Timetable', icon: CalendarDays },
      { id: 'syllabus-curriculum', label: 'Syllabus & Curriculum', icon: BookOpen },
    ],
  },
  {
    title: 'ATTENDANCE',
    items: [
      { id: 'my-attendance', label: 'My Attendance', icon: UserCheck },
      { id: 'attendance-calendar', label: 'Attendance Calendar', icon: CalendarCheck2 },
    ],
  },
  {
    title: 'EXAMS & RESULTS',
    items: [
      { id: 'exam-datesheet', label: 'Exam Date Sheet', icon: CalendarRange },
      { id: 'results-marks', label: 'Results & Marks', icon: BarChart3 },
      { id: 'report-card', label: 'Report Card', icon: FileText },
      { id: 'exam-guidelines', label: 'Exam Guidelines', icon: Info },
    ],
  },
  {
    title: 'FEES & PAYMENTS',
    items: [
      { id: 'fee-summary', label: 'Fee Summary', icon: Wallet },
      { id: 'fee-invoices', label: 'Fee Invoices', icon: FileSpreadsheet },
      { id: 'payment-history', label: 'Payment History', icon: History },
      { id: 'online-payment', label: 'Online Payment', icon: CreditCard },
    ],
  },
  {
    title: 'COMMUNICATION & SUPPORT',
    items: [
      { id: 'notifications', label: 'Notifications', icon: Bell },
      { id: 'circulars-notices', label: 'Circulars & Notice Board', icon: Megaphone },
      { id: 'school-events', label: 'School Events', icon: Sparkles },
      { id: 'holiday-calendar', label: 'Holiday Calendar', icon: Sun },
      { id: 'know-authorities', label: 'Know Your Authorities', icon: ShieldAlert },
      { id: 'emergency-contacts', label: 'Emergency Contacts', icon: PhoneCall },
      { id: 'grievance-feedback', label: 'Grievance / Feedback', icon: MessageSquareHeart },
    ],
  },
];
