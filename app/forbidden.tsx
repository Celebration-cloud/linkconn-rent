import Link from 'next/link';

/**
 * forbidden.tsx — Shown when auth() returns a userId but the user lacks permission.
 *
 * Called automatically by Next.js when `forbidden()` is thrown in a Server Component,
 * Server Action, or Route Handler.
 *
 * Reference: https://nextjs.org/docs/app/api-reference/file-conventions/forbidden
 */
export default function Forbidden() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-background px-4 text-center">
      <div className="space-y-2">
        <p className="text-6xl font-extrabold text-destructive">403</p>
        <h2 className="text-2xl font-semibold text-foreground">Access Forbidden</h2>
        <p className="text-muted-foreground max-w-md text-sm">
          You do not have permission to view this resource.
          If you believe this is a mistake, please contact support.
        </p>
      </div>
      <div className="flex gap-3">
        <Link
          href="/dashboard"
          className="rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:opacity-90 transition-opacity"
        >
          Go to Dashboard
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
