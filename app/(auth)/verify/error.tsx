'use client';

import { useEffect } from 'react';

interface Props {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function VerifyError({ error, reset }: Props) {
  useEffect(() => {
    console.error('[Verify Error]', error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-background px-4 text-center">
      <h2 className="text-xl font-semibold text-foreground">Verification Error</h2>
      <p className="text-sm text-muted-foreground max-w-sm">
        {error.message ?? 'We could not verify your code. Please request a new one.'}
      </p>
      <button
        onClick={reset}
        className="rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity"
      >
        Try Again
      </button>
    </div>
  );
}
