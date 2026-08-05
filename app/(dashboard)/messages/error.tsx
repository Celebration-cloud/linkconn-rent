"use client";

export default function MessagesError({ reset }: { reset: () => void }) {
  return (
    <main className="grid min-h-[100dvh] place-items-center bg-sand-50 p-6 text-center">
      <div>
        <h1 className="text-2xl font-extrabold text-ink">Messages are unavailable</h1>
        <button onClick={reset} className="stitch-button mt-5">Try again</button>
      </div>
    </main>
  );
}
