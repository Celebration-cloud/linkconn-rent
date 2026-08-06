# AGENTS.md — LinkConn Rent

LinkConn Rent is a Next.js 16 App Router rental platform using React 19,
TypeScript strict mode, Tailwind CSS 4, Prisma/PostgreSQL, Neon Auth, Zod,
Lucide React, and npm.

## Commands

- `npm run dev` — local Turbopack development server
- `npm run typecheck` — strict TypeScript validation
- `npm run lint` — ESLint and React Compiler diagnostics
- `npm test` — Vitest suite
- `npm run check:architecture` — server/client boundary audit
- `npm run build` — production build
- `npm run test:e2e` — Playwright journeys

## Architecture

- `app/` owns routes, layouts, metadata, loading/error boundaries, and thin Route Handlers.
- `features/<domain>/` owns feature components, client interactions, schemas, hooks, server reads, DTOs, and pure utilities.
- `components/ui/` contains genuinely reusable presentation primitives.
- `components/stitch/` is the shared visual system and legacy feature composition area; move code gradually, never with a big-bang rewrite.
- `repositories/` owns Prisma access. Use `lib/db/client.ts`; never instantiate Prisma elsewhere.
- `lib/auth/` and `lib/neon-auth.ts` own Neon Auth/session integration.
- `lib/cache/` owns tag conventions and invalidation helpers.

Dependencies point inward: routes → feature modules → repositories/shared `lib`.
Client modules must never import repositories, Prisma, auth secrets, payment
secrets, storage providers, or `features/**/server` modules.

## Server and client boundaries

- Server Components are the default. Route files read route inputs, authorize,
  fetch initial data directly, and compose feature components.
- Add `"use client"` at the smallest component that needs state, effects,
  browser APIs, event handlers, or a browser-only library.
- Pass typed, minimal DTOs to Client Components; never pass full Prisma records
  when fewer fields suffice.
- Do not call internal Route Handlers from Server Components. Call the repository
  or feature server function directly.
- Add `import "server-only"` to privileged data, auth, payment, storage, and
  repository modules.
- `proxy.ts` performs route-level Neon Auth protection. Mutations must still
  authenticate, authorize, and validate inputs on the server.

## Caching

- Cache Components are enabled. Cache only shared public data with an explicit
  `"use cache"`, `cacheLife`, and `cacheTag` policy.
- Never shared-cache sessions, profiles, permissions, dashboards, messages,
  payments, admin data, saved IDs, or one-time tokens.
- Property tags are centralized in `lib/cache/property-tags.ts`:
  `properties`, `properties:featured`, and `property:${propertyId}`.
- Route Handler mutations use `revalidateTag(tag, "max")` through the shared
  invalidation helper. Reserve `updateTag` for future Server Actions that need
  read-your-writes behavior.
- Catalogue, count, map-bound, and viewport queries remain uncached because of
  high cardinality. See `docs/caching.md` before adding another cache layer.

## Validation and APIs

- Reuse feature-owned Zod schemas for forms, external query parameters, Route
  Handlers, and Server Actions.
- Route Handlers preserve `{ success, data, message }` and existing status codes.
- Never trust client-supplied identity, authorization, price, or status fields.
- Do not expose raw Prisma errors, secrets, or internal records.

## Testing expectations

- Test extracted pure logic, repositories/services through mocked boundaries,
  authorization, validation, loading/empty/error states, and affected journeys.
- Avoid snapshot-only coverage.
- Before handoff run typecheck, lint, Vitest, architecture checks, build, and
  available Playwright journeys. Report credential-gated skips explicitly.

## Collaboration rules

- Preserve existing dirty-worktree changes; do not reset, overwrite, or reformat
  unrelated work.
- Keep routes and public API contracts stable unless the task explicitly changes them.
- Prefer explicit imports over large barrel files and avoid vague catch-all modules.
- Do not modify Prisma migrations, generated assets, lockfiles, auth contracts,
  or shared theme tokens casually.

## Adding functionality

For a new feature, place its schema and domain logic near the feature, add a
server-only data function or focused repository, keep the route thin, and expose
only the smallest necessary client island. For a Server Action, validate input,
recheck auth and authorization, call a feature service/repository, then invalidate
the narrowest cache tag. Do not add a Server Action merely to replace a stable
public HTTP contract.
