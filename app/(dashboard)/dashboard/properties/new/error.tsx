"use client";
export default function AddPropertyError({ reset }: { error: Error; reset: () => void }) { return <main className="grid min-h-screen place-items-center"><button onClick={reset} className="stitch-button">Retry listing setup</button></main>; }
