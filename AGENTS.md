# AGENTS.md — LinkConn Rent

> Agentic AI coding instructions for the **linkconn-rent** repository.
> Read this file before performing any task in this codebase.

---

## 🧭 Project Overview

**LinkConn Rent** is a Next.js 15 (App Router) property rental platform.
Stack: TypeScript · Tailwind CSS 4 · Framer Motion · Prisma · Clerk · Zod · Lucide React.

---

## ⚙️ Tech Stack Constraints

| Concern          | Tool / Convention                         |
|------------------|-------------------------------------------|
| Framework        | Next.js 15 **App Router only**            |
| Language         | TypeScript (strict mode, no `any`)        |
| Styling          | **Tailwind CSS 4** — no inline styles     |
| Animation        | Framer Motion — prefer transform/opacity  |
| Auth             | **Clerk** (`@clerk/nextjs`)               |
| ORM              | **Prisma** → `lib/prisma.ts` singleton    |
| Validation       | **Zod** — all forms + all API routes      |
| Icons            | **Lucide React** only                     |
| Images           | **next/image** only                       |
| Fonts            | **next/font** only                        |
| HTTP responses   | Consistent `{ success, data, message }`   |

---

## 📁 Directory Map

```
app/
  (auth)/          ← auth pages (login, signup, onboarding, …)
  (dashboard)/     ← protected user dashboard
  (public)/        ← public marketing / listing pages
  api/             ← Route Handlers (thin, delegate to services/repos)
components/        ← Reusable presentational components
features/          ← Feature-sliced business-logic modules
hooks/             ← Custom React hooks (useSomething)
lib/               ← Shared utilities, Prisma client, auth helpers
providers/         ← React context / Zustand stores
repositories/      ← Data access layer (Prisma queries)
schemas/           ← Zod schemas (reused FE + BE)
domain/            ← Domain constants, types, mock data
utils/             ← Pure utility functions
scripts/           ← One-off scripts (seed, migrations)
tests/             ← Vitest / Playwright test suites
prisma/            ← schema.prisma + migrations
public/            ← Static assets
```

---

## 🚦 Routing Rules

- **Route Groups**: `(auth)`, `(dashboard)`, `(public)` — never break the group convention.
- **Dynamic segments**: `[id]` for property detail, follow Next.js naming.
- **Protected routes**: Handled by `middleware.ts` using Clerk — do not add ad-hoc auth checks in page files.
- **API routes**: Live in `app/api/` as Route Handlers (`route.ts`). Validate input with Zod. Return `{ success, data, message }`.

---

## 🗂️ File-System Conventions (Applied Across All Routes)

Every route segment should implement these Next.js special files as appropriate:

| File             | Purpose                                              |
|------------------|------------------------------------------------------|
| `page.tsx`       | Route UI — always a Server Component unless interactive |
| `layout.tsx`     | Shared layout wrapping child routes                  |
| `loading.tsx`    | Suspense skeleton shown while page/data loads        |
| `error.tsx`      | Error boundary UI (`'use client'`, `useEffect`)      |
| `not-found.tsx`  | 404 UI for `notFound()` calls                        |
| `template.tsx`   | Re-mounts layout on nav (use sparingly)              |
| `default.tsx`    | Parallel route fallback                              |
| `route.ts`       | API Route Handler                                    |

> **loading.tsx must exist for every route segment** to enable automatic Suspense streaming.

---

## ✅ Agent Task Rules

### Before Writing Any Code

1. Read `AGENTS.md` (this file) and `CLAUDE.md`.
2. Check `schemas/` for existing Zod schemas before creating new ones.
3. Check `repositories/` before writing Prisma queries inline.
4. Check `components/` and `features/` for reusable components.
5. Never duplicate business logic — refactor to `lib/` or `utils/`.

### Component Rules

- **Server Components** by default.
- Add `'use client'` only when using hooks, event handlers, or browser APIs.
- Name components **PascalCase**. File names **kebab-case**.
- Keep components focused — split when > ~150 lines.
- Use `cn()` (clsx + tailwind-merge) for conditional class names.

### API Route Rules

```ts
// CORRECT pattern for every route.ts
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const schema = z.object({ ... });

export async function POST(req: NextRequest) {
  try {
    const body = schema.parse(await req.json());
    const data = await someRepository.doSomething(body);
    return NextResponse.json({ success: true, data, message: 'Done' });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Error' }, { status: 500 });
  }
}
```

### Database Rules

- Use the Prisma singleton at `lib/prisma.ts` — never `new PrismaClient()` in components.
- All DB access through `repositories/` layer.
- Never expose raw Prisma errors to the client.

### Styling Rules

- Tailwind CSS classes only — no inline `style={{}}` unless absolutely required for dynamic values.
- Mobile-first (`sm:`, `md:`, `lg:` breakpoints).
- Dark mode via Tailwind's `dark:` variants.
- Color palette: use CSS variables defined in `globals.css`.

### Animation Rules

- Use `framer-motion` variants defined in `lib/animations.ts` or local `variants` objects.
- Always respect `prefers-reduced-motion`:
  ```ts
  const prefersReduced = useReducedMotion();
  ```
- Do not animate `width` / `height` — prefer `scaleX` / `scaleY`.

---

## 🚫 Forbidden Practices

- ❌ Pages Router (`pages/` directory)
- ❌ `any` TypeScript type
- ❌ Inline styles (except truly dynamic values)
- ❌ `new PrismaClient()` outside `lib/prisma.ts`
- ❌ Hardcoded secrets or API keys
- ❌ Skipping Zod validation in API routes
- ❌ Installing packages without checking existing deps first
- ❌ Disabling ESLint rules globally
- ❌ Using `<img>` instead of `next/image`

---

## 🧪 Testing

- Unit tests: **Vitest** in `tests/`
- E2E tests: **Playwright**
- Run: `pnpm test`
- Test critical paths: auth flows, API routes, form validation, DB repositories.

---

## 🔄 Git Commit Convention

```
feat: add property search filter
fix: resolve hydration mismatch on dashboard
refactor: extract auth helpers to lib/auth
chore: update prisma schema for landlord model
```

Follow [Conventional Commits](https://www.conventionalcommits.org/).

---

## 📞 Getting Help

- Check `README.md` for setup instructions.
- Check `CLAUDE.md` for Claude-specific AI guidance.
- Review `prisma/schema.prisma` before any DB changes.
- Review `middleware.ts` before changing route protection logic.
