# FEATURES & DESIGN SYSTEM: What to Build & How It Looks

> **Document Type:** Feature Matrix & Visual Design Specification
> **Version:** 1.0
> **Last Updated:** 2026-09-15

---

## Part 1: Authentication Model

> [!IMPORTANT]
> **There is NO public signup.** Only login. The admin provisions all user accounts and shares first-time credentials directly.

### Available Auth Flows

| Flow | Description |
|------|-------------|
| **Login** | Email/Phone + Password — the only entry point |
| **Forgot Password** | OTP-based password reset |
| **Change Password** | From user profile settings |

**Not Available:** No signup page. No self-registration. No social/OAuth login for end-users.

---

## Part 2: Feature Matrix by Role

### Student Features (13)

| # | Feature | Description |
|---|---------|-------------|
| 1 | **Attendance & Subjects** | View personal attendance records per subject with percentage tracking |
| 2 | **Timetable** | Daily/weekly class schedule with room numbers and teacher assignments |
| 3 | **Fee Collection & Accounting** | View fee invoices, outstanding dues, payment history, and make online payments |
| 4 | **Exam Date Sheet** | Upcoming examination schedule with subjects, dates, and timings |
| 5 | **Know Your Authorities** | Directory of school authorities (Principal, HOD, Mentor) with contact info and appointment booking |
| 6 | **In-App Messages** | Internal notification center for receiving messages from school admin and teachers |
| 7 | **Login & Password Management** | Login, forgot password (OTP), change password |
| 8 | **School Event Notifications** | News feed of school events, announcements, and happenings |
| 9 | **Complaint / Feedback Submission** | Submit grievances or feedback to school administration |
| 10 | **View Results** | Access examination results — marks, grades, and rankings |
| 11 | **List of Holidays** | Academic calendar showing all holidays and important dates |
| 12 | **Emergency Contact Numbers** | Quick access to emergency contacts (school nurse, administration, local services) |
| 13 | **Report Card** | Downloadable PDF report card with term-wise performance |

---

### Teacher Features (9)

| # | Feature | Description |
|---|---------|-------------|
| 1 | **Login & Password Management** | Login, forgot password (OTP), change password |
| 2 | **Teacher Attendance** | Mark own daily attendance |
| 3 | **Today's Classes** | View assigned classes for the day with room and section details |
| 4 | **Apply for Leave** | Submit leave applications with type, dates, and reason |
| 5 | **In-App Messages** | Receive and send messages within the platform |
| 6 | **School Event Notifications** | News feed of school events and announcements |
| 7 | **Upload Class Results** | Bulk upload marks via Excel/CSV or manual entry per student |
| 8 | **List of Holidays** | Academic calendar with holidays |
| 9 | **Emergency Contact Numbers** | Quick access to emergency contacts |

---

### Admin Features (19)

| # | Feature | Category | Description |
|---|---------|----------|-------------|
| 1 | **Student & Parent Record Manager** | SIS | CRUD operations for student and parent profiles, bulk import via Excel |
| 2 | **Staff & Teacher Directory** | HR | Manage teacher and staff records, assignments, and contact details |
| 3 | **Credential Manager** | Access Control | Deactivate/archive credentials for passing-out students or resigned teachers |
| 4 | **Class & Subject Mapping** | Academics | Map subjects to classes, assign teachers to subjects and sections |
| 5 | **Master Timetable Builder** | Academics | Build and manage school-wide timetable with period allocations |
| 6 | **Substitution Manager** | Academics | When a teacher is on leave, reassign their periods to available teachers |
| 7 | **Academic Calendar & Holidays** | Academics | Create and manage the academic year calendar with holidays and events |
| 8 | **Fee Structure Builder** | Finance | Define fee heads, amounts by class/stream, installment schedules, late fine rules |
| 9 | **Manual/Counter Fee Collection** | Finance | Accept walk-in payments (Cash/Cheque/UPI/POS), print receipts in under 15 seconds |
| 10 | **Defaulter & Ledger Reports** | Finance | View fee defaulters, generate outstanding balance reports, export ledgers |
| 11 | **Payment Gateway Settlement** | Finance | Reconcile online payment gateway settlements with internal records |
| 12 | **Exam Scheduler** | Exams | Create and publish examination date sheets with room allocations |
| 13 | **Marks Verification & Lock** | Exams | Review teacher-uploaded marks, verify accuracy, lock marks to prevent further edits |
| 14 | **Report Card Template Designer** | Exams | Design and customize report card templates per board/affiliation |
| 15 | **Push Notification & WhatsApp Broadcaster** | Communications | Send targeted or broadcast notifications via in-app push and WhatsApp |
| 16 | **School Event & News Manager** | Communications | Create, schedule, and publish school events and news articles |
| 17 | **Emergency Contacts & Authority Directory** | Directory | Manage the school's emergency contact list and authority profiles |
| 18 | **Teacher Leave Approval Portal** | HR | Review, approve, or reject teacher leave applications |
| 19 | **Attendance Oversight Dashboard** | Analytics | School-wide attendance analytics — class-wise, section-wise, trend charts |

---

## Part 3: Design System

### 3.1 Color System — 60/30/10 Distribution Rule

The visual weight follows the **60-30-10 Rule** for high readability and zero cognitive overload.

#### Primary Palette

| Distribution | Name | Hex Value | RGB | Usage |
|-------------|------|-----------|-----|-------|
| **60% (Dominant)** | Pure Canvas / White | `#FFFFFF` | `rgb(255, 255, 255)` | Page canvas, main card backgrounds, container surfaces, input field fills |
| **60% (Dominant)** | Light Gray Background | `#F4F6F9` | `rgb(244, 246, 249)` | Page background behind cards |
| **30% (Structural)** | Deep Navy Slate | `#111C2D` | `rgb(17, 28, 45)` | Primary headings, student names, timetable titles, top nav text, active tabs, icons |
| **10% (Accent)** | Warm Coral / Sunset Orange | `#FA896B` | `rgb(250, 137, 107)` | Primary action buttons, active filters, notification badges, attendance callouts, card accent borders |

#### Supporting / Semantic Colors

| Name | Hex Value | Usage |
|------|-----------|-------|
| Muted / Subtitle Text | `#64748B` | Roll numbers, class/section tags, teacher designations |
| Success / High Attendance | `#10B981` | Donut chart arcs ≥ 75%, "Nil due" fee tags |
| Warning / Low Attendance | `#F59E0B` | Donut chart arcs < 75%, overdue warnings |
| Card Border / Dividers | `#E2E8F0` | 1px solid borders on cards and section dividers |

---

### 3.2 Typography System

**Primary Font Family:** `"Plus Jakarta Sans", Helvetica, Arial, sans-serif`

| Style Name | Font Size | Weight | Line Height | Letter Spacing | Usage |
|-----------|-----------|--------|-------------|----------------|-------|
| Display / Metric | 24px (1.5rem) | 700 (Bold) | 32px | -0.02em | Metric values (82%, 7.78, ₹ 2.50 Cr) |
| Card / Section Header | 18px (1.125rem) | 600 (SemiBold) | 26px | -0.01em | "Upcoming Schedule", "Know Your Authorities" |
| Body Primary | 14px (0.875rem) | 500 (Medium) | 20px | 0 | Student name, subject names, timetable slots |
| Caption / Subtitle | 12px (0.75rem) | 400 (Regular) | 16px | +0.01em | Section, Roll number, room number, teacher email |
| Badge / Pill Tag | 11px (0.6875rem) | 600 (SemiBold) | 14px | +0.02em | Notification badges, "Lecture", "Tutorial" tags |

---

### 3.3 Spatial System, Spacing & Layout Architecture

| Property | Value |
|----------|-------|
| **Base Spacing Grid** | 4px / 8px scale (`p-2`: 8px, `p-4`: 16px, `p-6`: 24px, `p-8`: 32px) |
| **Page Max-Width** | 1440px centered |
| **Desktop Horizontal Padding** | 24px |
| **Mobile Horizontal Padding** | 16px |

#### Border Radii

| Element | Radius | Tailwind Class |
|---------|--------|----------------|
| Outer Cards | 16px–20px | `rounded-2xl` |
| Inner Elements / Schedule Bars | 12px | `rounded-xl` |
| Buttons & Badges | 9999px or 8px | `rounded-full` or `rounded-lg` |

#### Shadow Hierarchy

| State | Value |
|-------|-------|
| **Base Card** | `0 4px 20px -2px rgba(17, 28, 45, 0.05)` |
| **Hover Card** | `0 10px 25px -4px rgba(17, 28, 45, 0.08)` |

---

### 3.4 Component Inventory

#### A. Top Utility & Navigation Bar

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│ [Logo + Title]  │  Academics ▾  │  Admin ▾  │  Links ▾  │  🔍  │  🔔(35)  │  👤  │
└─────────────────────────────────────────────────────────────────────────────────┘
```

| Property | Value |
|----------|-------|
| Background | `#FFFFFF` |
| Height | `h-16` (64px) |
| Bottom Border | `1px solid #E2E8F0` |
| Left | School logo + platform title |
| Center | Navigation links with dropdown chevrons |
| Right | Pill search bar (`rounded-full`), dark mode toggle, bell icon with coral badge (`#FA896B`), profile avatar with name |

---

#### B. Hero Metric Tiles (4 Tiles)

| Property | Value |
|----------|-------|
| Background | `#FA896B` with subtle tonal organic blob (top-right) |
| Content | Center-aligned white icon + bold counter (24px, `#FFFFFF`) + label (12px, `#FFFFFF`) |
| Radius | `rounded-2xl` |
| Tiles | Happening, Messages, Assignments, Events |

---

#### C. Student Identity Card

| Property | Value |
|----------|-------|
| Layout | Horizontal — avatar thumbnail + identity details |
| Avatar | `w-16 h-16 rounded-xl object-cover` |
| Name | Bold, `#111C2D` |
| Subtitle | Admission ID, Section, Program — `#64748B` |
| Action | Light pill button (`bg-[#FEE2E2] text-[#FA896B]`) — "Raise RMS" (Grievance) |

---

#### D. Metric Rings (CGPA & Attendance Donuts)

| Property | Value |
|----------|-------|
| Container | White card with label and value |
| SVG Ring | `strokeWidth: 8px` |
| Unfilled Track | `#F1F5F9` |
| GPA Fill | `#FA896B` (Coral) |
| Attendance Fill | `#10B981` (Emerald Green) |

---

#### E. Class Attendance Progress Pills

| Property | Value |
|----------|-------|
| Layout | Mini horizontal cards with course code, title, percentage |
| Progress Bar | Thin linear bar (`h-1.5 rounded-full`), fills proportionally |
| Scrollable | Horizontal carousel with snap scrolling |

---

#### F. Upcoming Schedule / Timetable Widget

| Property | Value |
|----------|-------|
| Filter Tabs | Pill-shaped segmented control: "8 to 12", "12 to 3", "3 to 6" |
| Active Tab | Filled `#FA896B` with white text |
| Inactive Tab | Transparent with dark text |
| Class Entry | White strip with left accent border (`border-l-4 border-[#FA896B]`) |
| Entry Content | Class type badge, course code, room number, section, time slot |

---

#### G. Know Your Authorities / Faculty Carousel

| Property | Value |
|----------|-------|
| Avatar | `w-20 h-20 rounded-full mx-auto` with subtle ring |
| Role Tag | Soft tinted pill (`bg-[#FFF1ED] text-[#111C2D]`) — "Mentor", "HOD", "Head of School" |
| Details | Teacher name, academic title, department |
| Contact | Email and phone icons with metadata |
| Action | Pill button — "Book Appointment" with light coral outline |

---

### 3.5 Interactive States & Micro-Animations

| Element | Animation |
|---------|-----------|
| **Card Hover** | `transition: transform 0.2s ease, box-shadow 0.2s ease` → `translate-y-[-2px]` |
| **Button Click** | Active push: `transform: scale(0.98)` |
| **Progress Rings** | SVG `stroke-dashoffset` transition over `800ms ease-out` on initial load |
| **Horizontal Carousels** | `scroll-snap-type: x mandatory` with custom chevron navigators |

---

### 3.6 Full Dashboard Layout Structure

```
┌──────────────────────────────────────────────────────────────────────────────────────┐
│ [Top Navbar: Logo | Academics ▾ | Admin ▾ | Links ▾ || 🔍 | 🔔(35) | 👤 Profile]   │
├──────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                      │
│ ┌────────────────────────────────┐  ┌───────┐ ┌───────┐ ┌───────┐ ┌───────┐          │
│ │ [Student Identity Card]        │  │  10   │ │  21   │ │   4   │ │   0   │          │
│ │ Avatar, Name, Section, Program │  │Happen-│ │Messag-│ │Assign-│ │Events │          │
│ │ Raise Ticket Button            │  │  ing  │ │  es   │ │ ments │ │       │          │
│ └────────────────────────────────┘  └───────┘ └───────┘ └───────┘ └───────┘          │
│                                                                                      │
│ ┌───────────────────┐ ┌──────────┐ ┌──────────┐ ┌─────────────────────────────┐      │
│ │ Notice / Banner   │ │ GPA Ring │ │ Attend.  │ │ Due Fee: Nil               │      │
│ │ Admissions Promo  │ │  (7.78)  │ │  (82%)   │ │ [Pay Fee Button]           │      │
│ └───────────────────┘ └──────────┘ └──────────┘ └─────────────────────────────┘      │
│                                                                                      │
│ ┌────────────────────────────────────────────────────────────────────────────────┐    │
│ │ [Subject Attendance: Code | Progress Bar | %]          ◀ Carousel Scroll ▶    │    │
│ └────────────────────────────────────────────────────────────────────────────────┘    │
│                                                                                      │
│ ┌──────────────────────────┐  ┌──────────────────────────────────────────────────┐    │
│ │ Rulebook & Quick Tiles   │  │ 📅 Upcoming Schedule / Timetable                │    │
│ │ 6 Coral Quick-Access     │  │ [8-12 (Active)] [12-3] [3-6]                    │    │
│ │ (Syllabus, Guidelines)   │  │ • 09:20-10:10 | Class, Room, Section            │    │
│ └──────────────────────────┘  └──────────────────────────────────────────────────┘    │
│                                                                                      │
│ ┌────────────────────────────────────────────────────────────────────────────────┐    │
│ │ 👥 Know Your Authorities (Carousel)                                            │    │
│ │ [Avatar | Role Tag | Name & Email | Phone | Book Appointment]                  │    │
│ └────────────────────────────────────────────────────────────────────────────────┘    │
└──────────────────────────────────────────────────────────────────────────────────────┘
```

---

### 3.7 Tailwind CSS Configuration

Add these exact tokens to `tailwind.config.ts` for consistent design system usage:

```typescript
// tailwind.config.ts
import type { Config } from "tailwindcss";

export default {
  theme: {
    extend: {
      colors: {
        brand: {
          accent: "rgb(250, 137, 107)",   // #FA896B — Coral (10% Accent)
          dark: "rgb(17, 28, 45)",        // #111C2D — Navy Slate (30% Structural)
          canvas: "#FFFFFF",              // Pure White (60% Dominant)
          subtle: "#F4F6F9",              // Page background
          muted: "#64748B",               // Neutral slate subtitle text
        },
        semantic: {
          success: "#10B981",             // Emerald Green — attendance ≥ 75%, nil due
          warning: "#F59E0B",             // Amber — attendance < 75%, overdue
          border: "#E2E8F0",             // Card borders and dividers
        },
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', "Helvetica", "Arial", "sans-serif"],
      },
      borderRadius: {
        card: "18px",                     // Outer card radius
        tile: "14px",                     // Inner element radius
      },
      boxShadow: {
        card: "0 4px 20px -2px rgba(17, 28, 45, 0.05)",
        "card-hover": "0 10px 25px -4px rgba(17, 28, 45, 0.08)",
      },
      fontSize: {
        display: ["1.5rem", { lineHeight: "2rem", letterSpacing: "-0.02em", fontWeight: "700" }],
        "section-header": ["1.125rem", { lineHeight: "1.625rem", letterSpacing: "-0.01em", fontWeight: "600" }],
        "body-primary": ["0.875rem", { lineHeight: "1.25rem", letterSpacing: "0", fontWeight: "500" }],
        caption: ["0.75rem", { lineHeight: "1rem", letterSpacing: "0.01em", fontWeight: "400" }],
        badge: ["0.6875rem", { lineHeight: "0.875rem", letterSpacing: "0.02em", fontWeight: "600" }],
      },
    },
  },
} satisfies Config;
```
