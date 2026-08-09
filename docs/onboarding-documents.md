# Private onboarding documents

Tenant and Landlord onboarding uploads use a Vercel Blob **Private** store. The
application remains fail-closed when the store is not configured: drafts can be
saved, but files cannot be uploaded and onboarding cannot be submitted.

## Environment

Connect a private Blob store to the Vercel project, then pull its generated
`BLOB_READ_WRITE_TOKEN` into the local environment. Set:

- `DOCUMENT_STORAGE_PROVIDER=vercel-blob`
- `BLOB_READ_WRITE_TOKEN` to the generated private-store token
- `CRON_SECRET` to a strong deployment secret
- `VERCEL_BLOB_CALLBACK_URL` only when Blob cannot infer the deployed callback
  URL. It must point to `/api/verifications/uploads`; localhost requires an
  HTTPS tunnel.

Never commit these values. The repository contains names and safe placeholders
only.

## Data and access boundaries

- Browser uploads use ten-minute, owner-bound client tokens.
- Paths contain opaque UUIDs, not names, emails, roles, NINs, or original names.
- Completion verifies Blob metadata and JPEG, PNG, or PDF file signatures.
- Client DTOs never receive a storage key.
- Raw files are delivered only through the authenticated admin route, only for
  `Admin` and `SuperAdmin`, with `no-store` response headers and an audit event.
- Moderators can review metadata but cannot retrieve raw documents.

## Retention

Approval or rejection sets each uploaded document's deletion deadline to
exactly 60 days after `reviewedAt`. Vercel invokes
`/api/cron/document-retention` daily at 03:00 UTC. The endpoint requires
`Authorization: Bearer $CRON_SECRET`.

Cleanup deletes Blob content first, then clears its storage key and original
file name while retaining category, MIME type, size, deletion time, decision,
and review audit history. Failures retain the key and error so the next daily
run retries. Reopening a rejected review before cleanup clears its deadlines;
already-deleted files must be uploaded again.

## Deployment sequence

1. Connect the private Blob store and configure the deployment variables.
2. Run `npx prisma migrate deploy` against the intended Neon branch. On the
   affected Windows/Prisma 6 setup, use
   `npm run prisma:migrate:verification-documents`; it applies only the checked-in
   document migration transactionally, records its Prisma checksum, and aborts
   on partial or inconsistent state.
3. Deploy the application and verify the cron appears in Vercel project settings.
4. Complete one disposable Tenant or Landlord staging journey, then verify that
   an Admin can open the file while a Moderator receives `403`.
