# LinkConn Connected Dashboard Completion Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development to implement this plan task-by-task. Steps use checkbox syntax for tracking.

**Goal:** Complete the Admin, Tenant, and Landlord workspaces as one synchronized rental operating system with real lifecycle data, complete record views, and production-ready responsive interactions.

**Architecture:** Deliver connected vertical slices. Shared domain status, history, notifications, and DTO contracts are defined first; each later slice spans Prisma, repositories, Route Handlers, Server Components, focused client interactions, and tests. Personalized records remain uncached.

**Tech Stack:** Next.js 16 App Router, React 19, strict TypeScript, Tailwind CSS 4, Prisma 6/PostgreSQL 17, Neon Auth, Zod, Vitest, Playwright, Lucide React.

## Global Constraints

- Preserve existing public routes, forest/sand identity, Manrope, Lucide icons, Paystack authority, API envelope, permission matrix, and private/no-store document delivery.
- Never write directly to `neon_auth`, store raw IP addresses, expose unrestricted Prisma records, fabricate analytics, add manual payment overrides, bulk sanctions, or arbitrary role editing.
- Admin verification uses an evidence-first queue/viewer/dossier layout. Tenant and Landlord use one role-aware shell; each tenancy/property has a focused workspace.
- Long records are URL-addressable list/detail pages. Dialogs contain only confirmations, reasons, scheduling, or compact validated forms.
- All mutations authenticate, authorize, validate with Zod, verify CSRF, enforce lifecycle transitions, create transactional activity/audit records, and handle conflicts.
- Apply schema changes only after Prisma validation and Neon temporary-branch migration verification. Production records must not be guessed into new relationships.

---

### Task 1: Lifecycle contracts and schema foundation

**Files:** Prisma schema/migration, feature schemas/types, pure lifecycle utilities, focused unit tests.

**Produces:** Lease/version/acceptance/schedule/activity, application/viewing activity, verification findings/revisions, durable notifications, nullable compatibility relations, canonical hashing and transition APIs.

- [ ] Write failing tests for lease, application, viewing, verification and notification transitions, hashing, acceptance invalidation, activation, redaction and role rules.
- [ ] Add the Prisma enums/models/relations/indexes and a reviewed migration without applying it live.
- [ ] Implement pure lifecycle and canonical agreement helpers until focused tests pass.
- [ ] Generate Prisma Client, validate schema, run focused tests and review the diff.

### Task 2: Shared role-aware dashboard shell and primitives

**Files:** Dashboard layout/feature shell, shared operations UI primitives, global admin/dashboard styling, component tests.

**Produces:** Canonical role navigation, mobile utility/menu, notification entry, page headers, list/detail layouts, status/timeline/dialog/loading/empty/error patterns and legacy tab redirects.

- [ ] Write failing component tests for Tenant/Landlord permissions, navigation, canonical routes, mobile menu, focus, reduced motion and notification badges.
- [ ] Implement the shared shell and reusable work surfaces.
- [ ] Convert dashboard entry points from query tabs/one-off shells to canonical routes while preserving redirects.
- [ ] Run component tests, typecheck and accessibility/static UI checks.

### Task 3: Profile and verification vertical slice

**Files:** Verification/profile schemas, repositories/services, existing user/admin verification routes, user/admin verification workspaces, tests.

**Produces:** Real profile persistence; summary/detail verification DTOs; NeedsChanges/checklist/revision flow; audited sensitive reveal and inline document viewing.

- [ ] Write failing repository, route and component tests for summary/detail separation, complete role facts, redaction, reveal auditing, checklist decisions and resubmission.
- [ ] Implement backend reads/mutations and transactional review history.
- [ ] Replace Admin verification with the selected evidence-first queue/viewer/dossier and rebuild the user verification workspace.
- [ ] Verify private/no-store delivery, role matrix, focus behavior, mobile detail flow and tests.

### Task 4: Applications, viewings, messages and notifications slice

**Files:** Domain schemas/repositories/routes, role workspaces, notification center, tests.

**Produces:** Application withdrawal/decision history, viewing lifecycle, context-aware messages, durable notifications and deep links.

- [ ] Write failing transition, authorization, idempotency, DTO and UI-state tests.
- [ ] Implement transactional application/viewing activities and notification delivery.
- [ ] Rebuild Tenant Applications/Viewings and Landlord Applicants/Calendar as synchronized list/detail workspaces.
- [ ] Integrate contextual messaging and notification read state; run focused tests and typecheck.

### Task 5: Lease, acceptance and payment slice

**Files:** Lease schemas/repository/service/routes, Paystack completion integration, Tenant/Landlord/Admin lease/payment workspaces, tests.

**Produces:** Immutable agreement versions, audited dual acceptance, payment schedules, provider-controlled activation, printable/private agreement document and complete tenancy workspace.

- [ ] Write failing tests for versioning, stale acceptance, consent evidence, dual-signature gating, payment activation, termination/completion and legacy payments.
- [ ] Implement lease creation on application acceptance, version actions, fresh-auth acceptance, schedule generation and Paystack activation transaction.
- [ ] Build Tenant My Tenancy and Landlord Tenancies/property workspaces plus admin read-only oversight.
- [ ] Verify private documents, failure/callback behavior, concurrency and focused tests.

### Task 6: Maintenance, support and remaining admin workspaces

**Files:** Maintenance/support domain modules/routes, role workspaces, existing admin feature modules, tests.

**Produces:** Active-lease maintenance eligibility, shared lifecycle/evidence/history, legacy labels and complete Admin user/property/payment/dispute/moderation/support/maintenance/audit/invitation/account surfaces.

- [ ] Write failing eligibility, role-action, redaction, linked-context and list/detail tests.
- [ ] Implement active-lease creation rules while preserving legacy requests.
- [ ] Rebuild role maintenance/support surfaces and expand every Admin detail workspace with real linked records.
- [ ] Remove dead tabs, alerts, simulated timers, fake counts, incomplete/nested dialogs and toast-only flows; run focused tests.

### Task 7: Migration, integrated verification and release correction

**Files:** Migration SQL, fixtures/test utilities, E2E specs, design documentation.

**Produces:** Verified temporary-branch migration, full automated evidence, responsive correction pass and production migration handoff.

- [ ] Validate/generate Prisma and test migration on a Neon temporary branch with isolated fixtures and count/constraint/restore checks.
- [ ] Run typecheck, lint, Vitest, architecture checks and production build.
- [ ] Run authenticated role journeys at 390px, 1024px and 1440px for all connected workflows; report credential-gated checks honestly.
- [ ] Perform one desktop/mobile visual review, one consolidated correction pass and one confirmation pass.
- [ ] Present the tested Neon migration for explicit approval before applying it to `main`.
