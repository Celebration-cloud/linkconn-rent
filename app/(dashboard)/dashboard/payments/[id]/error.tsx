"use client";
export default function PaymentError({ reset }: { error: Error; reset: () => void }) { return <main className="grid min-h-screen place-items-center"><button onClick={reset} className="stitch-button">Retry protected payment</button></main>; }
