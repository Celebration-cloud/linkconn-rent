# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

LinkConn Rent serves Nigerian tenants, landlords, property managers, moderators, administrators, and Super Administrators. The administrator experience is primarily for daily trust-and-operations work: triaging queues, reviewing evidence, resolving cases, moderating listings and accounts, and preserving an accountable record of every decision.

## Product Purpose

LinkConn Rent is a Nigeria-first rental operating system that connects property discovery with verification, applications, viewings, leases, protected payments, maintenance, support, moderation, and dispute handling. Success means every important rental action is understandable, recoverable, permission-aware, and traceable.

## Positioning

The product joins marketplace discovery with an operational record of trust: identity evidence, property evidence, payment state, messages, decisions, and audit history stay connected instead of being scattered across informal channels.

## Operating Context

Administrators work across high-volume property records and lower-volume, higher-risk queues. They need dense desktop workflows, complete mobile access, fast filtering, clear assignment and state, secure evidence review, and explicit reasons for consequential actions. Currency, locations, dates, and terminology follow Nigerian rental conventions.

## Capabilities and Constraints

- Next.js App Router, React, strict TypeScript, Tailwind, Prisma/PostgreSQL, Neon Auth, Zod, Lucide React, and npm.
- Admin routes remain stable; Support and Maintenance are added as administrator workspaces.
- Moderator, Admin, and SuperAdmin permissions remain distinct and are enforced on the server.
- Neon Auth owns credentials and sessions; Prisma mirrors the same user ID and owns application roles and operational data.
- Payment status remains provider-controlled. Public property locations remain approximate. Private verification records never enter shared caches.
- All administrator mutations require validation, authorization, CSRF protection, legal lifecycle transitions, and audit records.

## Brand Commitments

The LinkConn Rent name, logo, forest-and-sand color identity, Manrope typography, direct human voice, and Lucide icon language remain recognizable. The administrator surface uses a distinct dense operations-console composition rather than the public product's editorial layouts or generic dashboard cards.

## Evidence on Hand

- The Prisma schema and current Neon database provide real operational entities and realistic record ranges.
- Existing Stitch exports are implementation history and anti-reference, not a composition to reproduce.
- `DESIGN.md` records the shared brand, content, privacy, motion, and responsive rules.
- No fabricated performance benchmarks, customer claims, or operational analytics may be introduced.

## Product Principles

- Put the next accountable action ahead of decorative reporting.
- Keep evidence, state, people, and audit history connected.
- Make permissions and destructive consequences unmistakable.
- Preserve public privacy while giving authorized operators enough context.
- Keep expert workflows dense without becoming visually noisy.

## Accessibility & Inclusion

All administrator tasks must work with keyboard navigation, visible focus, screen-reader labels, reduced motion, non-color status cues, and touch targets of at least 44px. The responsive system must remain fully operational at 390px, 1024px, and 1440px.
