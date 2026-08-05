# CLAUDE.md — LinkConn Rent

> Claude-specific instructions for AI-assisted development on the **linkconn-rent** codebase.
> Claude must read this file at the start of every session before writing any code.

---

## 🎯 Primary Directive

You are working on a **production Next.js 15 App Router** project.
Every change must be:
- **Type-safe** (TypeScript strict, zero `any`)
- **Validated** (Zod on all inputs)
- **Performant** (Server Components first, minimal `use client`)
- **Accessible** (semantic HTML, ARIA where needed)
- **Mobile-first** (Tailwind CSS responsive classes)

---

## 📖 Always Read First

Before writing code, read these files:

1. `AGENTS.md` — full architecture and agent task rules
2. `prisma/schema.prisma` — current database schema
3. `middleware.ts` — route protection setup
4. `schemas/` directory — existing Zod schemas (don't duplicate)
5. `repositories/` directory — existing data access patterns

---

## 🤖 Claude Behavior Rules

### Response Style

- Be concise. Code > explanation.
- Show only changed files/sections unless asked for full context.
- Always include TypeScript types — never infer `any`.
- Format code with Prettier-compatible style (2 spaces, single quotes, trailing commas).

### When Asked to Add a Feature

1. Check if a similar component/hook/schema already exists.
2. Propose a file list before coding if changes touch > 3 files.
3. Follow the existing directory structure strictly.
4. Add a `loading.tsx` if creating a new route.
5. Add an `error.tsx` if the route fetches data.

### When Asked to Fix a Bug

1. Locate the root cause before suggesting a fix.
2. Do not mask errors with try/catch that swallows them silently.
3. Preserve existing tests — update them if the fix changes behavior.

### When Asked to Refactor

1. Keep the public API identical unless told otherwise.
2. Ensure the refactored code passes existing tests.
3. Split large files, never merge distinct concerns into one file.

---

## 🏗️ Code Patterns to Follow

### Server Component Data Fetching

```tsx
// app/(public)/properties/page.tsx
import { getProperties } from '@/repositories/property-repository';

export default async function PropertiesPage() {
  const properties = await getProperties();
  return <PropertyGrid properties={properties} />;
}
```

### Client Component

```tsx
'use client';

import { useState } from 'react';

interface Props {
  initialValue: string;
}

export function SearchInput({ initialValue }: Props) {
  const [value, setValue] = useState(initialValue);
  return <input value={value} onChange={(e) => setValue(e.target.value)} />;
}
```

### API Route Handler

```ts
// app/api/properties/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createProperty } from '@/repositories/property-repository';

const createPropertySchema = z.object({
  title: z.string().min(1).max(200),
  price: z.number().positive(),
  location: z.string().min(1),
});

export async function POST(req: NextRequest) {
  try {
    const body = createPropertySchema.parse(await req.json());
    const property = await createProperty(body);
    return NextResponse.json({
      success: true,
      data: property,
      message: 'Property created successfully',
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, message: 'Validation failed', errors: error.errors },
        { status: 422 }
      );
    }
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

### Zod Schema (reusable)

```ts
// schemas/property-schema.ts
import { z } from 'zod';

export const propertySchema = z.object({
  title: z.string().min(1, 'Title is required'),
  price: z.number().positive('Price must be positive'),
  location: z.string().min(1, 'Location is required'),
  type: z.enum(['apartment', 'house', 'studio', 'commercial']),
});

export type PropertySchema = z.infer<typeof propertySchema>;
```

### Loading Skeleton

```tsx
// app/(public)/properties/loading.tsx
export default function PropertiesLoading() {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="animate-pulse rounded-xl bg-muted h-72" />
      ))}
    </div>
  );
}
```

### Error Boundary

```tsx
// app/(public)/properties/error.tsx
'use client';

import { useEffect } from 'react';

interface Props {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function PropertiesError({ error, reset }: Props) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center gap-4 py-20">
      <h2 className="text-xl font-semibold">Something went wrong</h2>
      <button onClick={reset} className="btn-primary">Try again</button>
    </div>
  );
}
```

---

## 🚫 Claude Must Never

- Write `any` as a TypeScript type.
- Use `<img>` — always `next/image`.
- Create a new Zod schema that duplicates an existing one in `schemas/`.
- Write Prisma queries outside `repositories/`.
- Use `style={{}}` for static values — use Tailwind classes.
- Skip error handling in API routes.
- Add `'use client'` to files that don't need client interactivity.
- Suggest using the Pages Router.
- Hardcode URLs or secrets — use environment variables.

---

## 🔑 Key Files Reference

| File | Purpose |
|------|---------|
| `middleware.ts` | Clerk route protection |
| `lib/prisma.ts` | Prisma singleton |
| `app/layout.tsx` | Root layout with providers |
| `app/globals.css` | Global styles + CSS variables |
| `prisma/schema.prisma` | Database schema |
| `tailwind.config.ts` | Tailwind configuration |
| `next.config.ts` | Next.js configuration |
| `tsconfig.json` | TypeScript configuration |

---

## 💡 Tips for Claude

- When uncertain about the database schema, **read `prisma/schema.prisma` first**.
- When uncertain about existing components, **list `components/` and `features/`**.
- When creating forms, **always use React Hook Form + Zod Resolver**.
- When adding a new page, **always create `loading.tsx` and `error.tsx` alongside `page.tsx`**.
- Clerk user ID is the source of truth for user identity — always use `auth()` from `@clerk/nextjs/server` in Server Components.

---

*Last updated: 2026. Maintained by the LinkConn engineering team.*
