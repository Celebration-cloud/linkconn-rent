# Property load-test dataset

The `live-properties-500-v1` dataset is a deterministic set of 500 public property records for exercising catalogue search, filters, sorting, pagination, and map bounds. It uses Prisma against the configured pooled Neon PostgreSQL endpoint. It never creates Neon Auth users or profile records.

## Safety model

- `scripts/seed.ts` is not involved because that general seed resets existing data.
- Six existing `Landlord` profiles must be present under the allowlisted emails in `dataset.ts`.
- A read-only preflight confirms PostgreSQL, a pooled `*.neon.tech` connection, matching Neon Auth configuration, required map-coordinate columns, and eligible owners before any write.
- IDs are deterministic. Zero matches permits one `createMany`; 500 valid matches is an idempotent no-op; any partial dataset aborts.
- Cleanup targets only those 500 IDs, reports dependent records first, and requires `--confirm`.

## Commands

```bash
npm run db:properties:dry-run
npm run db:properties:seed
npm run db:properties:verify
npm run db:properties:benchmark -- --base-url=http://127.0.0.1:3000
npm run db:properties:cleanup -- --confirm
```

Run the benchmark while the application is serving the same database. It reports timing without enforcing a latency threshold. The expanded-data Playwright check is opt-in with `E2E_LOAD_TEST_DATASET=true` so ordinary test databases are not expected to contain the production load fixture.
