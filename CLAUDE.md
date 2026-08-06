# CLAUDE.md — LinkConn Rent

Follow `AGENTS.md` as the authoritative repository guide.

This is a production Next.js 16 App Router project using React 19, strict
TypeScript, Tailwind CSS 4, Prisma/PostgreSQL, Neon Auth, Zod, and npm.

Before editing, inspect the relevant route, feature module, schema, repository,
`proxy.ts`, and existing tests. Preserve public routes, API envelopes, visual
behavior, accessibility, and responsive layouts.

Use Server Components by default and keep `"use client"` boundaries narrow.
Server Components call feature server functions or repositories directly rather
than internal HTTP endpoints. Privileged modules must import `server-only`.

Cache Components are enabled. Shared public property data may use the documented
tags in `lib/cache/property-tags.ts`; private or personalized data must remain
request-time and uncached. Read `docs/caching.md` before changing cache behavior.

Validate all mutation and external query inputs with Zod, recheck authorization
on the server, and never expose secrets or raw Prisma records. Use the Prisma
singleton from `lib/db/client.ts` and Neon Auth through `lib/neon-auth.ts` and
`lib/auth/`.

Use `npm run typecheck`, `npm run lint`, `npm test`,
`npm run check:architecture`, and `npm run build` as staged validation gates.
