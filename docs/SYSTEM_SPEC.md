# SYSTEM_SPEC: Multi-Tenant School ERP & White-Label CMS Engine

> **Document Type:** Architecture & Multi-Tenancy Specification
> **Version:** 1.0
> **Last Updated:** 2026-09-15

---

## 1. System Vision & Core Product Philosophy

An enterprise-grade, multi-tenant B2B SaaS platform designed specifically for the private school ecosystem in India — with a primary focus on budget and mid-tier K–10 and K–12 schools.

### The Product Model

The platform is a **single codebase** powering two tightly coupled surfaces per school:

| Surface | Description | Access |
|---------|-------------|--------|
| **Public Face (White-Label Portal)** | A high-performance, branded public website hosted on the school's custom domain (e.g., `yourschool.com`) or tenant subdomain (`yourschool.saasdomain.com`). Serves as the school's digital presence — admissions inquiries, public notices, photo galleries, and regulatory disclosures. | Public |
| **Operational Core (School ERP)** | A role-based internal operating system accessed by School Administrators, Teachers, Accountants, and Parents/Students. Manages academic records, daily attendance, fee collections, exam marks, and communication. | Authenticated Users Only |

---

## 2. Target Personas & Operational Realities

All system interactions are designed around these real-world constraints:

### 2.1 The Administrator / Principal

- **Profile:** Time-starved, non-technical.
- **Needs:** A high-level command center with:
  - Real-time fee recovery and defaulter tracking
  - Daily absent rate summaries
  - Cash-counter reconciliation
  - One-click regulatory report exports

### 2.2 The School Accountant / Clerk

- **Profile:** High keyboard/counter throughput operator.
- **Needs:**
  - Issue fee receipts in **under 15 seconds**
  - Accept Cash / UPI / POS payments
  - Print paper receipts
  - **Zero tolerance for ledger discrepancies**

### 2.3 The Teacher

- **Profile:** Mobile-first, time-constrained.
- **Needs:**
  - Mark daily attendance for 45 students in **under 30 seconds**
  - Bulk-friendly mark uploads (Excel/CSV paste)
  - Dead-simple UI on mobile browsers

### 2.4 The Parent

- **Profile:** High device-storage sensitivity, varying digital literacy.
- **Needs:**
  - **No bulky 60MB native application**
  - Interaction primarily via **automated WhatsApp notifications / payment links**
  - Lightweight, fast Progressive Web App (PWA)

---

## 3. Multi-Tenancy Architecture

> [!CAUTION]
> **Architecture Type: Shared Database, Shared Schema, Row-Level Isolation.**
> Every violation of tenant isolation is a critical security incident.

### 3.1 Tenant Boundary

- The `Tenant` entity is the **root of all data ownership**.
- Every operational database table **MUST** include an indexed `tenant_id` foreign key.
- No exceptions. No shortcuts.

### 3.2 Zero Cross-Tenant Leakage

- No query, mutation, or background worker may execute without an authenticated, verified `tenant_id` context resolved **server-side**.
- The `tenant_id` is **never** trusted from client input (request bodies, query params, route params).

### 3.3 Domain Resolution Pipeline

```
Incoming Request
       │
       ▼
Next.js Middleware inspects `Host` header
       │
       ├──▶ Subdomain: e.g., `dps.saas.com` → lookup tenant_id
       │
       └──▶ Custom Domain: e.g., `dpsludhiana.com` → lookup tenant_id (cached)
              │
              ▼
       tenant_id injected into server execution context (headers/session)
```

### 3.4 Data Privacy Guarantee

One school must **never** be able to:
- Inspect another school's data
- Query another school's students
- Infer another school's existence
- Access another school's financial ledgers

---

## 4. Domain Boundaries & Core Subsystems

### A. Tenant Configuration & White-Label CMS

| Capability | Details |
|------------|---------|
| Tenant Lifecycle | Provisioning, suspension, subscription status management |
| Branding Assets | Logo, primary theme colors, crest, school code, affiliation board |
| CMS Pages | Public landing page, Principal's desk, faculty directory, gallery, contact/inquiry forms |

---

### B. Student Information System (SIS) & Access Control

> [!IMPORTANT]
> **No Public Signups.** All users (`ADMIN`, `ACCOUNTANT`, `TEACHER`, `STUDENT`/`PARENT`) are provisioned by the School Admin or imported via bulk Excel upload. The admin shares first-time login credentials directly.

| Entity | Examples |
|--------|----------|
| Academic Sessions | `2026-2027` |
| Classes | `Class 1` through `Class 12` |
| Sections | `A`, `B`, `C` |
| Student Identifiers | Roll Number, SRN, PEN, Admission Number |

---

### C. Financial & Fee Management Engine

> [!CAUTION]
> **Zero Margin for Error.** All financial operations require ACID transactional guarantees.

| Capability | Details |
|------------|---------|
| Fee Structures | Master structures by Class/Stream — Tuition, Transport, Admission, Annual Charges, Late Fines |
| Transaction Flow | Invoice created → Partial/full payments recorded → Receipt numbers auto-incremented per tenant → Atomic commit |
| Offline Collection | Cash / Cheque / POS with printable dual-copy slips |
| Online Collection | Dynamic UPI / Payment Gateway webhooks (Razorpay, Cashfree, Easebuzz) |

**Transactional Integrity Rule:**
```
BEGIN TRANSACTION
  → Create/update invoice
  → Record payment against invoice
  → Auto-increment receipt number (tenant-scoped)
  → Update outstanding balance
COMMIT (or ROLLBACK on any failure)
```

---

### D. Attendance & Real-Time Communications

| Capability | Details |
|------------|---------|
| Attendance Register | Daily class-level: `PRESENT`, `ABSENT`, `LATE`, `HALF_DAY` |
| Alert Pipeline | Attendance submission → async queue job → WhatsApp API or SMS fallback to parent |

**Event Flow:**
```
Teacher submits attendance
       │
       ▼
Server validates & persists to DB (tenant-scoped)
       │
       ▼
Enqueue job to BullMQ
       │
       ▼
Worker sends WhatsApp message via Meta Cloud API
       │
       └──▶ Fallback: SMS via Msg91 / Fast2SMS (DLT compliant)
```

---

### E. Examination & Report Card Generation

| Capability | Details |
|------------|---------|
| Exam Terms | Unit Tests, Mid-Term, Final |
| Mark Entry | Per subject, with grade weightages |
| Report Cards | Board-compliant PDF generation — batch compiled asynchronously (no browser freeze) |

**Processing Strategy:**
- Report card generation is a **background job** (BullMQ worker).
- PDFs are generated server-side and stored in blob storage (R2/S3).
- Parents receive a download link via WhatsApp/in-app notification.

---

## 5. Architectural Non-Negotiables

These rules are **absolute and non-negotiable** for every line of code written:

| # | Rule | Enforcement |
|---|------|-------------|
| 1 | **Always enforce `tenant_id`** | Every DB lookup, insert, update, delete must include `tenant_id` |
| 2 | **ACID transactions for money** | All invoice/payment/ledger mutations execute inside `db.$transaction()` |
| 3 | **Strict validation** | Zod schemas on every input boundary — no unchecked client data |
| 4 | **No heavy native app** | Client is a responsive web app / PWA — WhatsApp is the primary notification channel |
| 5 | **No hallucinated code** | Production-grade, complete TypeScript — zero stubs, placeholders, or speculative dependencies |

---

## 6. Authentication Model

> [!IMPORTANT]
> There is **no public signup flow**. The system operates on an **admin-provisioned credential model**.

```
Admin creates user account (Student/Teacher/Parent/Accountant)
       │
       ▼
Admin shares first-time login credentials with the user
       │
       ▼
User logs in → System prompts for password change (optional/configurable)
       │
       ▼
Available auth flows:
  ├── Login (email/phone + password)
  ├── Forgot Password (OTP-based reset)
  └── Change Password (from profile settings)
```

**No signup page. No self-registration. No OAuth for end-users.**
