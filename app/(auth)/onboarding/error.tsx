'use client';

import { useEffect } from 'react';
import Link from 'next/link';

interface Props {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function OnboardingError({ error, reset }: Props) {
  useEffect(() => {
    console.error('[Onboarding Error]', error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-background px-4 text-center">
      <div className="space-y-2">
        <h2 className="text-xl font-semibold text-foreground">Onboarding Error</h2>
        <p className="text-sm text-muted-foreground max-w-sm">
          {error.message ?? 'Something went wrong during onboarding. Your progress may be saved.'}
        </p>
        {error.digest && (
          <p className="text-xs text-muted-foreground">Ref: {error.digest}</p>
        )}
      </div>
      <div className="flex gap-3">
        <button
          onClick={reset}
          className="rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity"
        >
          Retry
        </button>
        <Link
          href="/dashboard"
          className="rounded-lg border border-border px-5 py-2.5 text-sm font-medium text-foreground hover:bg-muted transition-colors"
        >
          Go to Dashboard
        </Link>
      </div>
    </div>
  );
}
