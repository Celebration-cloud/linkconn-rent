import Link from 'next/link';

/**
 * unauthorized.tsx — Shown when auth() returns no userId (unauthenticated access).
 *
 * Called automatically by Next.js when `unauthorized()` is thrown in a Server Component,
 * Server Action, or Route Handler.
 *
 * Reference: https://nextjs.org/docs/app/api-reference/file-conventions/unauthorized
 */
export default function Unauthorized() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-background px-4 text-center">
      <div className="space-y-2">
        <p className="text-6xl font-extrabold text-primary">401</p>
        <h2 className="text-2xl font-semibold text-foreground">Authentication Required</h2>
        <p className="text-muted-foreground max-w-md text-sm">
          You need to be signed in to access this page.
        </p>
      </div>
      <div className="flex gap-3">
        <Link
          href="/login"
          className="rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:opacity-90 transition-opacity"
        >
          Sign In
        </Link>
        <Link
          href="/"
          className="rounded-lg border border-border px-6 py-3 text-sm font-semibold text-foreground hover:bg-muted transition-colors"
        >
          Go Home
        </Link>
      </div>
    </div>
  );
}
