"use client";

export default function CompareError({ reset }: { reset: () => void }) {
  return (
    <main className="grid min-h-[70dvh] place-items-center bg-sand-50 p-6">
      <div className="text-center">
        <h1 className="text-2xl font-extrabold text-ink">
          Comparison could not load
        </h1>
        <button onClick={reset} className="stitch-button mt-5">
          Try again
        </button>
      </div>
    </main>
  );
}
