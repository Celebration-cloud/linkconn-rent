# Architecture refactor audit

## Baseline

- Next.js 15.5.21 and React/React DOM 19.2.4, npm lockfile, strict TypeScript.
- App Router only; no Pages Router.
- Cache Components and React Compiler were disabled.
- Neon Auth is the active auth implementation; old collaboration docs named Clerk.
- Baseline typecheck, lint, `git diff --check`, and 81 Vitest tests passed.

## Data categories

| Category | Examples | Ownership |
| --- | --- | --- |
| Shared static | Marketing copy, bundled assets | Server/build output |
| Shared public | Featured homes, public property details | Feature server cache |
| High-cardinality public | Catalogue, count, bounds searches | Request-time repository query |
| Personalized | Profile, saved homes, dashboards, messages | Request-time server read |
| Mutation-driven | Listings, fees, moderation | Route Handler → repository → cache invalidation |
| Browser session | Search restoration and compare state | Versioned sessionStorage |

## Refactoring candidates

| Component at audit | Responsibilities | Boundary decision |
| --- | --- | --- |
| `property-map.tsx` (1,076 lines) | Queries, URL state, location, directions, panels, canvas orchestration | Keep orchestration client-side; extract geometry/query logic and keep Leaflet behind `ssr: false` |
| `dashboard-tabs.tsx` (1,025) | Multiple dashboard domains and interactions | Migrate tab ownership incrementally; server-provide initial snapshot |
| `property-search.tsx` (943) | Query state, pagination, restoration, filters, saves, comparison | Keep coordinator client-side; pure query/restoration logic outside component |
| `public-home.tsx` (700) | Static marketing and interactive hero/pricing/role actions | Future slice: server sections plus small motion/action islands |
| `property-map-canvas.tsx` (660) | Leaflet lifecycle, overlays, markers, imperative map API | Retain browser boundary; separate overlays/markers in later slice |
| `auth-provider.tsx` (645) | Session/profile plus dashboard-local notification/device state | Future slice: keep auth global and move mock dashboard state local |

## Implemented slice

- Upgraded framework and lint configuration without a router migration.
- Added Cache Components and React Compiler configuration.
- Migrated middleware to the Next.js 16 `proxy.ts` convention.
- Added server-only enforcement to privileged modules.
- Added shared public-property cache functions and targeted invalidation.
- Server-provided the dashboard's initial snapshot, removing its hydration fetch.
- Split the broad operating repository into domain repositories behind a temporary façade.
- Extracted map geometry and committed-bounds query transformation as tested pure logic.

The remaining large coordinators are intentionally not split by line count alone;
each future extraction should move a complete interaction or ownership boundary.
