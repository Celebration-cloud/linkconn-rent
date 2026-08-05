'use client';

import { useEffect } from 'react';

interface Props {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ResetPasswordError({ error, reset }: Props) {
  useEffect(() => {
    console.error('[ResetPassword Error]', error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-background px-4 text-center">
      <h2 className="text-xl font-semibold text-foreground">Reset Failed</h2>
      <p className="text-sm text-muted-foreground max-w-sm">
        {error.message ?? 'We could not reset your password. The link may have expired.'}
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
