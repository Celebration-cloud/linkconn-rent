"use client";
export default function AdminError({ reset }: { error: Error; reset: () => void }) { return <main className="grid min-h-screen place-items-center bg-sand-50 p-6 text-center"><div><h1 className="text-2xl font-extrabold">Admin center unavailable</h1><button onClick={reset} className="stitch-button mt-5">Try again</button></div></main>; }
