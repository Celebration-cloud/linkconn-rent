export default function HowItWorksLoading() {
  return (
    <div className="container mx-auto px-4 py-16 space-y-16 animate-pulse">
      {/* Hero */}
      <div className="text-center space-y-4 max-w-2xl mx-auto">
        <div className="h-10 w-64 rounded-lg bg-muted mx-auto" />
        <div className="h-5 w-96 rounded bg-muted mx-auto" />
        <div className="h-5 w-80 rounded bg-muted mx-auto" />
      </div>
      {/* Steps */}
      <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="rounded-2xl bg-card border border-border p-8 space-y-4 text-center">
            <div className="mx-auto h-16 w-16 rounded-full bg-muted" />
            <div className="h-6 w-32 rounded bg-muted mx-auto" />
            <div className="space-y-2">
              <div className="h-4 w-full rounded bg-muted" />
              <div className="h-4 w-5/6 rounded bg-muted" />
              <div className="h-4 w-4/5 rounded bg-muted" />
            </div>
          </div>
        ))}
      </div>
      {/* CTA */}
      <div className="text-center">
        <div className="h-12 w-40 rounded-lg bg-primary/20 mx-auto" />
      </div>
    </div>
  );
}
