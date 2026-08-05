"use client";

export function WorkspaceRouteError({
  reset,
}: {
  reset: () => void;
}) {
  return (
    <main className="grid min-h-[70dvh] place-items-center bg-sand-50 p-6">
      <div className="max-w-md text-center">
        <h1 className="text-2xl font-extrabold text-ink">
          This workspace could not load
        </h1>
        <p className="mt-2 text-sm text-muted">
          Your information is safe. Retry the request to continue.
        </p>
        <button onClick={reset} className="stitch-button mt-5">
          Try again
        </button>
      </div>
    </main>
  );
}

export function WorkspaceRouteLoading() {
  return (
    <main className="min-h-[100dvh] bg-sand-50 p-6">
      <div className="mx-auto max-w-6xl space-y-5 pt-20">
        <div className="h-12 w-64 animate-pulse rounded-xl bg-sand-200" />
        <div className="grid gap-4 sm:grid-cols-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="h-40 animate-pulse rounded-2xl bg-sand-200"
            />
          ))}
        </div>
      </div>
    </main>
  );
}
