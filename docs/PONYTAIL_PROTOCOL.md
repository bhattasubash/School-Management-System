# PONYTAIL PROTOCOL: Execution Workflow & Technology Stack

> **Document Type:** Agent Workflow Directive & Tech Stack Reference
> **Version:** 1.0
> **Last Updated:** 2026-09-15
> **Enforcement:** All engineering tasks MUST follow the 5-stage Ponytail lifecycle. No stage may be skipped.

---

## Part 1: The Ponytail Protocol (5-Stage Execution Lifecycle)

Every software engineering task follows this strict sequential pipeline:

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Stage 1   │───▶│   Stage 2   │───▶│   Stage 3   │───▶│   Stage 4   │───▶│   Stage 5   │
│  Discovery  │    │  Planning   │    │  Execution  │    │ Verification│    │   Summary   │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
```

---

### Stage 1: Discovery & Context Ingestion

**Purpose:** Understand the current state before making any changes.

| Action | Details |
|--------|---------|
| **Inspect conventions** | Review existing folder structure, naming patterns, and code style |
| **Verify dependencies** | Check `package.json` and existing imports — never assume a package exists |
| **State assumptions** | If requirements or API contracts are ambiguous, explicitly document assumptions before proceeding |

> [!NOTE]
> This stage is read-only. No code modifications, no file creations (except documentation).

---

### Stage 2: Planning & Impact Analysis

**Purpose:** Define scope, assess blast radius, and establish acceptance criteria.

Before any code modification, produce a concise **Implementation Plan**:

#### 2.1 Scope Definition
- List specific files to be **created** or **modified**
- Identify new dependencies required

#### 2.2 Blast Radius Assessment
- Identify existing components affected
- Flag database schema changes
- Note any shared utility or type modifications

#### 2.3 Acceptance Criteria
- Explicit checklist defining what "done" means
- Edge cases covered
- Error states handled

> [!IMPORTANT]
> **Approval Gate:** Wait for user confirmation before proceeding if the task involves:
> - Database migrations or schema changes
> - Breaking API contract changes
> - Authentication/authorization overrides
> - Changes to financial calculation logic

---

### Stage 3: Surgical Execution (Minimal Diff Principle)

**Purpose:** Implement changes with minimal footprint and maximum precision.

| Rule | Details |
|------|---------|
| **Minimal Diffs** | Do not rewrite entire files when modifying a specific function or section |
| **Preserve Conventions** | Match existing code style, naming patterns, and file structure |
| **No Scope Creep** | No unrequested refactoring, dead code cleanup, or cosmetic changes |
| **No Placeholders** | Never output `// TODO`, `// implement later`, or partial code — write complete, working implementations |
| **Complete Code** | Every function, every handler, every component must be fully functional |

---

### Stage 4: Verification & Lint Guard

**Purpose:** Validate correctness immediately after writing code.

Run this verification checklist:

```
┌─────────────────────────────────────────────────────────────┐
│ ✅ Static Typing       No TypeScript errors, no implicit `any` │
│ ✅ Import Resolution   All import/export paths resolve cleanly  │
│ ✅ Tenant Isolation    `tenant_id` present on ALL DB operations  │
│ ✅ Zod Validation      Input boundaries are schema-validated     │
│ ✅ Transaction Safety  Financial ops wrapped in $transaction     │
│ ✅ Build Check         `npm run build` passes without errors     │
└─────────────────────────────────────────────────────────────┘
```

> [!WARNING]
> If any check fails, **diagnose and fix immediately** before declaring the step complete. Never leave broken code.

---

### Stage 5: Summary & Diff Review

**Purpose:** Provide a clear, scannable summary of changes.

Every completed task must end with:

| Section | Content |
|---------|---------|
| **Files Changed** | Exact list of files created, modified, or deleted |
| **Verifications Passed** | Which checks from Stage 4 were run and passed |
| **Manual Testing Steps** | Specific steps the developer should run locally to validate |

---

## Part 2: Technology Stack

### Core Stack Overview

```
┌────────────────────────────────────────────────────────┐
│                    CLIENT LAYER                        │
│  Next.js (React) + Tailwind CSS + shadcn/ui + PWA     │
├────────────────────────────────────────────────────────┤
│                   SERVER LAYER                         │
│  Next.js Server Actions / API Routes                   │
│  (Alternative: NestJS for dedicated backend)           │
├────────────────────────────────────────────────────────┤
│                    DATA LAYER                          │
│  PostgreSQL (via Prisma or Drizzle ORM)               │
│  Redis (Caching) + BullMQ (Job Queue)                 │
├────────────────────────────────────────────────────────┤
│                  STORAGE LAYER                         │
│  Cloudflare R2 or AWS S3 (Blob Storage)               │
├────────────────────────────────────────────────────────┤
│               EXTERNAL SERVICES                        │
│  WhatsApp Cloud API | Msg91 / Fast2SMS                │
│  Razorpay / Cashfree / Easebuzz                       │
└────────────────────────────────────────────────────────┘
```

### Detailed Stack Breakdown

| Layer | Technology | Purpose & Rationale |
|-------|-----------|-------------------|
| **Frontend Framework** | Next.js (React) | Server-first rendering (RSC), file-based routing, API routes, middleware for tenant resolution, PWA support |
| **UI Styling** | Tailwind CSS | Utility-first, mobile-first responsive design, zero runtime CSS overhead |
| **Component Library** | shadcn/ui | Accessible, customizable, copy-paste components built on Radix UI primitives |
| **Backend API** | Next.js Server Actions / API Routes | Co-located with frontend for unified deployment; NestJS as alternative for dedicated backend services |
| **Database** | PostgreSQL | ACID-compliant, battle-tested relational DB — essential for financial data integrity |
| **ORM** | Prisma or Drizzle | Type-safe database access, migration management, parameterized queries by default |
| **Caching** | Redis | Tenant config caching, session storage, domain-to-tenant mapping cache |
| **Job Queue** | BullMQ (Redis-backed) | Async background processing — report card PDFs, bulk notifications, data imports |
| **Blob Storage** | Cloudflare R2 or AWS S3 | School logos, student photos, report card PDFs, gallery images |
| **WhatsApp API** | Meta WhatsApp Cloud API | Primary parent notification channel — attendance alerts, fee reminders, payment receipts |
| **SMS Fallback** | Msg91 / Fast2SMS | DLT-compliant SMS for parents without WhatsApp — regulatory compliance for Indian market |
| **Payment Gateway** | Razorpay / Cashfree / Easebuzz | Online fee collection — UPI, cards, net banking; webhook-based payment confirmation |
| **Frontend Hosting** | Vercel | Optimized for Next.js — edge functions, CDN, automatic SSL |
| **Backend & DB Hosting** | Render / Hetzner VPS | Cost-effective hosting for PostgreSQL, Redis, and BullMQ workers |

### Runtime Requirements

| Requirement | Minimum Version |
|-------------|----------------|
| Node.js | 20.x LTS |
| PostgreSQL | 15.x+ |
| Redis | 7.x+ |
| TypeScript | 5.x (strict mode) |

### Environment Variable Categories

```
# Database
DATABASE_URL=postgresql://...

# Redis
REDIS_URL=redis://...

# Authentication
JWT_SECRET=...
NEXTAUTH_SECRET=...

# WhatsApp
WHATSAPP_API_TOKEN=...
WHATSAPP_PHONE_NUMBER_ID=...

# SMS
MSG91_AUTH_KEY=...
MSG91_SENDER_ID=...

# Payment Gateway
RAZORPAY_KEY_ID=...
RAZORPAY_KEY_SECRET=...
RAZORPAY_WEBHOOK_SECRET=...

# Storage
S3_BUCKET_NAME=...
S3_ACCESS_KEY=...
S3_SECRET_KEY=...
S3_ENDPOINT=...

# App
NEXT_PUBLIC_APP_URL=...
NEXT_PUBLIC_APP_NAME=...
```

> [!IMPORTANT]
> All environment variables must be accessed through typed parsers (`@t3-oss/env-nextjs`). Never use `process.env.VAR` directly in application code without validation.
