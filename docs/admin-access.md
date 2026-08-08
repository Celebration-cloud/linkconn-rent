# Administrator access

LinkConn Rent uses Neon Auth for credentials and sessions. Prisma mirrors the
same Neon user ID in `Profile` and owns the application role. Never create a
Prisma-only administrator and never write directly to the `neon_auth` schema.

## Initial Super Admin

1. Start the production application at `ADMIN_BOOTSTRAP_BASE_URL` with the same
   Neon Auth and database environment as the target deployment.
2. Confirm the configured mailbox receives email and set
   `ADMIN_BOOTSTRAP_INBOX_CONFIRMED=true` for that terminal session.
3. Run `npm run admin:bootstrap -- --confirm`.
4. Enter the six-digit Neon verification code when prompted.
5. Copy the generated password shown after the login, profile-mirror, and
   `/admin` checks pass. The script does not save it.

To verify an existing bootstrap account, provide its password through the
ephemeral `ADMIN_BOOTSTRAP_PASSWORD` environment variable and run
`npm run admin:bootstrap:verify`.

If a verified bootstrap completed but its one-time password output was lost,
run `npm run admin:bootstrap:recover-password -- --confirm`. This uses Neon
Auth's password-reset OTP flow, verifies the replacement through a fresh login,
and prints it once without persisting it.

The command refuses non-PostgreSQL or non-pooled Neon endpoints, conflicting
profiles, unverified identities, and a second active bootstrap Super Admin.

## Inviting administrators

Only a Super Admin can open `/admin/invitations`. A created link grants the
Admin role, expires after 72 hours, and can be used once. Share it through a
trusted private channel. Rotating or revoking an invitation invalidates the
previous link. Raw invitation tokens are never stored in PostgreSQL.
