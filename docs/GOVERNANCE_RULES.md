# CODE GOVERNANCE RULES: Autonomous Engineering & Quality Constraints

> **Document Type:** Code Quality & Security Governance
> **Version:** 1.0
> **Last Updated:** 2026-09-15
> **Enforcement Level:** Mandatory — any code violating these rules is considered a deployment blocker.

---

## Pre-Commit Checklist (4-Point Gate)

Every piece of code must pass these four checks before being considered complete:

- [ ] **Tenant Isolation:** Is every database operation strictly scoped by `tenant_id`?
- [ ] **Input Validation:** Is all user input validated with Zod at the boundary?
- [ ] **Transaction Safety:** Are monetary/accounting updates wrapped in `db.$transaction()`?
- [ ] **Type Safety:** Are all TypeScript types explicitly defined — zero `any` types?

---

## 1. Multi-Tenant Data Isolation & Security (Zero-Trust)

### 1.1 Absolute Tenant Scoping

> [!CAUTION]
> **ABSOLUTE RULE:** Never execute a database query without scoping it to the active `tenant_id`.

- Every `SELECT`, `UPDATE`, and `DELETE` on tenant tables **MUST** explicitly include `tenant_id`.
- The `tenant_id` is **never** trusted from client-supplied parameters (request bodies, query strings, route params).
- Always resolve and verify `tenant_id` **server-side** via the authenticated session or verified JWT context.

```typescript
// ✅ CORRECT: tenant_id from server context
const students = await db.student.findMany({
  where: {
    tenantId: ctx.tenantId, // Resolved server-side
    classId: input.classId,
  },
});

// ❌ FORBIDDEN: tenant_id from client input
const students = await db.student.findMany({
  where: {
    tenantId: req.body.tenantId, // NEVER DO THIS
    classId: input.classId,
  },
});
```

### 1.2 SQL Injection Prevention

- **Never** assemble raw SQL strings using template literals or string concatenation.
- Use **parameterized queries** or typed ORM builders (Prisma/Drizzle) exclusively.

### 1.3 Input Sanitization

- Validate **all** incoming payloads at the boundary using runtime schema validators (Zod).
- Use `.strict()` or `.strip()` to prevent mass assignment exploits.
- Strip unexpected fields before they reach business logic.

```typescript
// ✅ CORRECT: Strict Zod schema at the boundary
const CreateStudentSchema = z.object({
  firstName: z.string().min(1).max(100).trim(),
  lastName: z.string().min(1).max(100).trim(),
  classId: z.string().uuid(),
  sectionId: z.string().uuid(),
}).strict(); // Rejects any extra fields
```

### 1.4 Secret Management

- **Never** hardcode API keys, database credentials, or gateway secrets in source code.
- Access secrets strictly through typed environment variable parsers.
- Use `@t3-oss/env-nextjs` for compile-time env validation.

```typescript
// ✅ CORRECT: Typed env access
import { env } from "@/env";
const razorpayKey = env.RAZORPAY_KEY_SECRET;

// ❌ FORBIDDEN: Hardcoded secrets
const razorpayKey = "rzp_live_abc123xyz";
```

---

## 2. Defensive Programming & Error Handling (Zero Silent Failures)

### 2.1 No Empty Catch Blocks

> [!WARNING]
> Every `catch` block must handle the failure state meaningfully. `console.log(err)` alone is not handling.

```typescript
// ❌ FORBIDDEN
try {
  await sendWhatsAppMessage(payload);
} catch (err) {
  console.log(err); // Silent failure — parent never gets notified
}

// ✅ CORRECT
try {
  await sendWhatsAppMessage(payload);
} catch (err) {
  logger.error("WhatsApp delivery failed", {
    studentId: payload.studentId,
    tenantId: ctx.tenantId,
    error: err instanceof Error ? err.message : "Unknown error",
  });
  await enqueueSMSFallback(payload); // Graceful degradation
}
```

### 2.2 Structured Error Handling

Every async operation that can fail (external APIs, DB writes) must have:
1. **User-facing actionable error message** (clean, non-technical)
2. **Server-side context logging** (detailed, with tenant/entity IDs)
3. **Graceful degradation path** where applicable

### 2.3 No `any` Type — Ever

- TypeScript strict mode: `strict: true` in `tsconfig.json`.
- If a dynamic type is required, use `unknown` and perform runtime narrowing or schema parsing.
- `any` is a deployment blocker.

```typescript
// ❌ FORBIDDEN
function processWebhook(payload: any) { ... }

// ✅ CORRECT
function processWebhook(payload: unknown): ProcessedWebhookResult {
  const parsed = RazorpayWebhookSchema.parse(payload);
  // ... type-safe from here
}
```

### 2.4 Explicit Return Types

Always define explicit return types on:
- Backend route handlers
- Server actions
- Domain service functions

```typescript
// ✅ CORRECT
async function getStudentsByClass(
  tenantId: string,
  classId: string
): Promise<StudentWithSection[]> {
  // ...
}
```

### 2.5 ACID Transactions for Financial Operations

> [!CAUTION]
> Any operation involving fees, invoice balance updates, or inventory allocations **MUST** run inside an explicit database transaction.

```typescript
// ✅ CORRECT: Atomic financial operation
const result = await db.$transaction(async (tx) => {
  const invoice = await tx.invoice.update({
    where: { id: invoiceId, tenantId },
    data: { paidAmount: { increment: amount } },
  });

  const payment = await tx.payment.create({
    data: {
      tenantId,
      invoiceId,
      amount,
      method: paymentMethod,
      receiptNumber: await getNextReceiptNumber(tx, tenantId),
    },
  });

  return { invoice, payment };
});
// If payment.create fails, invoice.update is rolled back automatically
```

---

## 3. Clean Code, Readability & Maintainability

### 3.1 Separation of Concerns

The codebase follows a strict layered architecture:

```
┌──────────────────────────────────────────────────┐
│  /components     → Rendering & state bindings ONLY │
├──────────────────────────────────────────────────┤
│  /actions or /api → Request validation & auth ONLY │
├──────────────────────────────────────────────────┤
│  /services or /lib → Business logic, calculations, │
│                      DB queries, external API calls │
└──────────────────────────────────────────────────┘
```

| Layer | Responsibility | What It Does NOT Do |
|-------|---------------|-------------------|
| **Components** (`/components`) | Render UI, bind state, handle user interactions | No DB queries, no business logic, no validation |
| **Route Handlers / Server Actions** (`/actions`, `/api`) | Validate input (Zod), authenticate user, resolve `tenant_id` | No business logic calculations, no direct DB queries |
| **Services** (`/services`, `/lib`) | Business logic, fee calculations, grade points, attendance %, DB operations | No request/response handling, no UI concerns |

### 3.2 Function Length & Single Responsibility

- Keep functions **under 40 lines** where feasible.
- If a function validates input, fetches records, sends an SMS, and renders HTML — **split it**.
- One function = one job.

### 3.3 Meaningful Naming

```typescript
// ❌ BAD: Cryptic
const d = await getD();
const r = calcR(d);

// ✅ GOOD: Self-documenting
const pendingFeeInvoices = await getPendingInvoicesByStudentId(studentId, tenantId);
const totalOutstandingAmount = calculateOutstandingBalance(pendingFeeInvoices);
```

### 3.4 No Dead Code or Placeholders

> [!WARNING]
> Never generate:
> - `// TODO: implement later`
> - `// implementation goes here`
> - Mock implementations in production files
> - Commented-out code blocks
>
> **Write complete, functional code every time.**

---

## 4. Frontend & Performance Constraints

### 4.1 Server-First Rendering

- Default to **React Server Components (RSC)**.
- Only add `'use client'` if the component requires:
  - User interaction (`onClick`, form submissions)
  - Browser APIs (`window`, `localStorage`)
  - React lifecycle hooks (`useState`, `useEffect`)

### 4.2 Re-render Prevention

- Do **not** instantiate unmemoized objects or inline functions inside critical loops.
- Use `React.memo`, `useMemo`, `useCallback` judiciously where re-renders are measurably impacting performance.

### 4.3 Efficient Asset Delivery

- Use `next/image` for all images (school logos, student avatars, gallery photos).
- Always define explicit `width`, `height`, or `aspect-ratio` to prevent CLS (Cumulative Layout Shift).

### 4.4 Responsive-First Design

- Every UI component must be built **mobile-first** using Tailwind utility classes.
- Data tables and forms must degrade gracefully on small screens.
- **No horizontal viewport overflow** on mobile.

---

## 5. Architectural Integrity & Consistency

### 5.1 Vertical Feature Slices

Co-locate related features into vertical modules:

```
src/
  modules/
    fees/
      components/
      actions/
      services/
      schemas/
    attendance/
      components/
      actions/
      services/
      schemas/
    report-cards/
      components/
      actions/
      services/
      schemas/
```

### 5.2 Webhook Idempotency

> [!IMPORTANT]
> Webhook endpoints (Razorpay/Cashfree payment confirmations, WhatsApp receipts) **MUST** be idempotent.

- Verify transaction status and reference IDs **before** executing downstream operations.
- Prevent duplicate payment credits with idempotency key checks.

```typescript
// ✅ CORRECT: Idempotent webhook handler
async function handlePaymentWebhook(payload: ParsedWebhook): Promise<WebhookResult> {
  const existing = await db.payment.findUnique({
    where: {
      gatewayReferenceId: payload.referenceId,
      tenantId: payload.tenantId,
    },
  });

  if (existing) {
    return { status: "already_processed", paymentId: existing.id };
  }

  // Process new payment inside transaction...
}
```

### 5.3 Background Execution for Heavy Tasks

> [!WARNING]
> **Never** run long-running tasks in the main request-response cycle.

Push these to BullMQ queue workers:
- Batch PDF report card generation
- 1,000+ notification broadcasts
- Bulk data imports (Excel/CSV)
- Payment reconciliation reports
