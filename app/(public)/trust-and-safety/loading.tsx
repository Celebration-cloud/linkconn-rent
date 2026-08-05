export default function TrustAndSafetyLoading() {
  return (
    <div className="container mx-auto px-4 py-16 space-y-12 animate-pulse">
      {/* Hero */}
      <div className="text-center space-y-4 max-w-2xl mx-auto">
        <div className="h-10 w-72 rounded-lg bg-muted mx-auto" />
        <div className="h-5 w-96 rounded bg-muted mx-auto" />
      </div>
      {/* Safety features */}
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex gap-4 rounded-2xl bg-card border border-border p-6">
            <div className="h-12 w-12 flex-shrink-0 rounded-xl bg-muted" />
            <div className="flex-1 space-y-2">
              <div className="h-5 w-40 rounded bg-muted" />
              <div className="h-4 w-full rounded bg-muted" />
              <div className="h-4 w-5/6 rounded bg-muted" />
            </div>
          </div>
        ))}
      </div>
      {/* FAQ */}
      <div className="max-w-2xl mx-auto space-y-4">
        <div className="h-7 w-48 rounded bg-muted mx-auto" />
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-border bg-card px-6 py-4 space-y-2">
            <div className="h-5 w-3/4 rounded bg-muted" />
            <div className="h-4 w-full rounded bg-muted" />
          </div>
        ))}
      </div>
    </div>
  );
}
