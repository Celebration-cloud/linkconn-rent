'use client';

import { useEffect } from 'react';
import Link from 'next/link';

interface Props {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function PropertiesError({ error, reset }: Props) {
  useEffect(() => {
    console.error('[Properties Error]', error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6 px-4 text-center">
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold text-foreground">Could Not Load Properties</h2>
        <p className="text-sm text-muted-foreground max-w-sm">
          {error.message ?? 'Something went wrong while fetching properties. Please try again.'}
        </p>
      </div>
      <div className="flex gap-3">
        <button
          onClick={reset}
          className="rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity"
        >
          Retry
        </button>
        <Link
          href="/"
          className="rounded-lg border border-border px-5 py-2.5 text-sm font-medium text-foreground hover:bg-muted transition-colors"
        >
          Go Home
        </Link>
      </div>
    </div>
  );
}
