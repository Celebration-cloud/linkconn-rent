# Authentication E2E verification

The authentication suite is intentionally separate from the ordinary Playwright journeys because it creates real, disposable identities in Neon Auth and mirrored profiles in the primary Neon PostgreSQL database.

## Safety contract

The runner fails before building or writing unless all of these variables are available locally:

- `E2E_ALLOW_PRIMARY_MUTATIONS=true`
- `E2E_AUTH_TEST_PASSWORD` (16+ characters with upper, lower, number, and symbol)
- `MAILSLURP_API_KEY`
- `E2E_AUTH_BASE_URL` (defaults to `http://127.0.0.1:3100`)

The configured `DATABASE_URL` must be a pooled Neon PostgreSQL URL and the database must contain the `neon_auth` schema. The app continues to use the unified `createNeonAuth` integration; tests do not write directly to Neon Auth tables.

Run the complete production-mode journey with:

```powershell
npm run test:e2e:auth
```

The suite builds the app, starts `next start`, creates MailSlurp inboxes, signs up and verifies six users, completes the role matrix, and cleans exact fixtures only after success. Manifest files under `test-results/auth-fixtures/` contain run IDs, roles, generated email addresses, Neon user IDs, inbox IDs, storage-state paths, and cleanup status. They never contain passwords or API keys and are ignored by Git.

Failed runs retain their fixtures by default so the trace, video, screenshot, manifest, and database state can be inspected. Clean one recorded run with:

```powershell
npm run test:e2e:auth:cleanup -- --run-id 0000000000000-00000000
```

Cleanup signs in as each exact fixture, calls Neon Auth's authenticated `delete-user` endpoint, removes the exact mirrored Prisma profile if it remains, deletes the recorded MailSlurp inbox, and verifies that none of the recorded profile IDs remain. It refuses malformed or mismatched run IDs.

## Coverage

- Guest protected-route and API rejection
- Tenant and Landlord signup UI, OTP verification, draft persistence, onboarding validation/idempotency, pending review, Admin-UI approval, dashboard entry, logout, and re-login
- Property Manager, Moderator, Admin, and Super Admin real Neon Auth identities with controlled Prisma role fixtures
- Direct route and API authorization for all roles
- Suspended-account rejection
- Desktop and mobile session/navigation checks
- Internal callback enforcement, origin/CSRF enforcement, invalid/oversized payloads, cookie attributes, session isolation, forwarded-IP spoof resistance, and low-volume throttling
- Neon Auth user/Profile ID equality, email-verification mirroring, role/sub-profile state, and exact cleanup

## Residual production risk

Rate limits are stored in process memory. This is suitable for local verification but does not coordinate counters across multiple production instances. A shared limiter should be selected only as a separate deployment architecture decision; this suite does not introduce an external cache or rate-limit service.
