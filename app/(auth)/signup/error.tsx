'use client';

import { useEffect } from 'react';
import Link from 'next/link';

interface Props {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function SignupError({ error, reset }: Props) {
  useEffect(() => {
    console.error('[Signup Error]', error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-background px-4 text-center">
      <div className="space-y-2">
        <h2 className="text-xl font-semibold text-foreground">Sign Up Unavailable</h2>
        <p className="text-sm text-muted-foreground max-w-sm">
          {error.message ?? 'We could not load the sign up page. Please try again.'}
        </p>
      </div>
      <div className="flex gap-3">
        <button
          onClick={reset}
          className="rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity"
        >
          Try Again
        </button>
        <Link
          href="/login"
          className="rounded-lg border border-border px-5 py-2.5 text-sm font-medium text-foreground hover:bg-muted transition-colors"
        >
          Back to Login
        </Link>
      </div>
    </div>
  );
}
