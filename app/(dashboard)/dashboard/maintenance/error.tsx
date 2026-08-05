"use client";
export default function MaintenanceError({ reset }: { error: Error; reset: () => void }) { return <main className="grid min-h-screen place-items-center"><button onClick={reset} className="stitch-button">Retry maintenance center</button></main>; }
