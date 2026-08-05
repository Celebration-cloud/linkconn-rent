"use client";

export default function ApplicantsError({ reset }: { reset: () => void }) {
  return <main className="grid min-h-[100dvh] place-items-center bg-sand-50"><button className="stitch-button" onClick={reset}>Reload applicants</button></main>;
}
