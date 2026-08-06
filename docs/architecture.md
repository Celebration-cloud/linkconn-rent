# Architecture

## Request and rendering flow

```text
Browser request
  → proxy.ts (route-level Neon Auth protection)
  → App Router page/layout (route inputs, authorization, initial reads)
  → feature server data or focused repository
  → Server Component composition
  → minimal Client Component islands
```

Mutations keep their public HTTP contracts:

```text
Client interaction
  → Route Handler
  → Zod validation + authentication + authorization
  → focused domain repository/service
  → targeted public-cache invalidation
  → { success, data, message }
```

## Component boundaries

Before:

```text
DashboardPage → AccountPage client → /api/dashboard → broad repository
PropertiesPage → PropertySearch client → /api/properties → broad repository
```

After the current slice:

```text
DashboardPage server
  → current profile + DashboardRepository in parallel/request time
  → AccountPage client (initial typed snapshot + interactions)

PropertiesPage server
  → parsed URL query + uncached discovery repository
  → PropertySearch client coordinator
     → pure query/restoration utilities

Public property/detail routes
  → cached feature server getters
  → mapped public DTOs
```

## Feature ownership and dependency direction

- Routes compose; they do not contain broad business logic.
- Feature modules own their UI interactions, schemas, DTOs, server reads, and pure utilities.
- Repositories own Prisma queries by domain.
- Shared `lib` modules own infrastructure such as auth, database, caching, and response helpers.
- UI primitives know nothing about repositories or authentication.
- Dependencies flow from routes to features to repositories/infrastructure, never from client code to server modules.

## State management

- URL state: public search, filters, sorting, pagination, map/list navigation.
- Local component state: drawers, sheets, draft filters, optimistic controls.
- Versioned `sessionStorage`: property-result restoration only.
- Global providers: genuine cross-route session/profile concerns only.
- Server state is fetched on the server where possible and passed as narrow typed props.

## Collaboration

Domain repositories make ownership explicit while the temporary
`OperatingSystemRepository` façade keeps existing route imports stable. New code
uses focused repositories; the façade can be removed after all consumers and
tests migrate in a dedicated change.
