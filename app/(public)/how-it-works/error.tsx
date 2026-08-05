'use client';

import { useEffect } from 'react';

interface Props {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function HowItWorksError({ error, reset }: Props) {
  useEffect(() => {
    console.error('[HowItWorks Error]', error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6 px-4 text-center">
      <h2 className="text-xl font-semibold text-foreground">Page Unavailable</h2>
      <p className="text-sm text-muted-foreground max-w-sm">
        {error.message ?? 'Could not load this page. Please try again.'}
      </p>
      <button
        onClick={reset}
        className="rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity"
      >
        Retry
      </button>
    </div>
  );
}
