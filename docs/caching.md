# Caching strategy

Cache Components are enabled. Caching is opt-in and belongs to the server data
function that understands freshness and invalidation—not to arbitrary pages.

## Policy matrix

| Data source | Consumer | Scope | Freshness | Cache location / duration | Tag | Invalidated by | Stale behavior / reason |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Marketing copy/assets | Public pages | Shared | Deployment | Build/CDN | None | Deployment | Immutable with code |
| Featured properties | Homepage | Shared public | Hourly | Cache Components: stale 5m, revalidate 1h, expire 1d | `properties`, `properties:featured` | Listing publish/status/moderation | Stale-while-revalidate is acceptable |
| Property detail/related | Detail + metadata | Shared public | 5 minutes | Cache Components: stale 1m, revalidate 5m, expire 1h | `properties`, `property:${id}` | Property/fee/status/moderation writes | Metadata and page reuse the same cached getter |
| Catalogue/count/bounds | Search and map | Public high-cardinality | Request time | Uncached repository read | None | None | Avoid faceted cache explosion |
| Directions | Map | Shared query | 5 minutes | Existing fetch cache | Provider URL | Expiry | Provider response is briefly reusable |
| Building overlays | Map viewport | Public high-cardinality | Request time | Uncached | None | None | Viewport-sensitive |
| Sessions/profiles/permissions | Protected routes | Personalized | Immediate | Never shared-cache | None | Direct read | Security and freshness |
| Dashboard/messages/payments/admin/saved IDs | Protected UI | Personalized | Immediate | Never shared-cache | None | Direct read | Contains private state |
| Search restoration | Current browser tab | Personalized | 30 minutes | Versioned sessionStorage | Normalized query key | Query/version/expiry | Navigation restoration only |

## Tags and invalidation

Tag creation is centralized in `lib/cache/property-tags.ts`:

- `properties` — all shared public property reads.
- `properties:featured` — homepage featured selection.
- `property:${propertyId}` — a property detail and related-property read.

Existing Route Handlers call `invalidatePropertyCache`, which uses
`revalidateTag(tag, "max")` after successful writes. This provides
stale-while-revalidate behavior suitable for public listings. Private reads are
not cached and therefore need no tag invalidation.

Use `updateTag` only in a future Server Action where the initiating user must see
their write immediately. Use `revalidatePath` only if a path-level rendering
artifact cannot be targeted by a data tag. Do not layer Redis, browser query
caches, database caching, or a custom cache handler without documenting the
owner, deployment topology, and invalidation path here.
