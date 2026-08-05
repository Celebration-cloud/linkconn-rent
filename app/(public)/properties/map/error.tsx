"use client";

export default function MapSearchError({ reset }: { reset: () => void }) {
  return (
    <main className="grid min-h-[100dvh] place-items-center bg-sand-50 p-6">
      <div className="max-w-md text-center">
        <h1 className="text-2xl font-extrabold text-ink">The map could not load</h1>
        <p className="mt-2 text-sm text-muted">Check the map tile connection or return to the property list.</p>
        <button onClick={reset} className="stitch-button mt-5">Try again</button>
      </div>
    </main>
  );
}
