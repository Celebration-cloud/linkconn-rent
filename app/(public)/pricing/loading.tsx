export default function PricingLoading() {
  return (
    <div className="container mx-auto px-4 py-16 space-y-12 animate-pulse">
      {/* Header */}
      <div className="text-center space-y-4 max-w-xl mx-auto">
        <div className="h-10 w-48 rounded-lg bg-muted mx-auto" />
        <div className="h-5 w-80 rounded bg-muted mx-auto" />
      </div>
      {/* Toggle */}
      <div className="flex justify-center">
        <div className="h-10 w-48 rounded-full bg-muted" />
      </div>
      {/* Pricing cards */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3 max-w-5xl mx-auto">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className={`rounded-2xl border p-8 space-y-6 ${i === 1 ? 'bg-primary/10 border-primary/30' : 'bg-card border-border'}`}
          >
            <div className="h-6 w-24 rounded bg-muted" />
            <div className="h-10 w-32 rounded-lg bg-muted" />
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, j) => (
                <div key={j} className="flex items-center gap-2">
                  <div className="h-4 w-4 rounded-full bg-muted" />
                  <div className="h-4 w-full rounded bg-muted" />
                </div>
              ))}
            </div>
            <div className="h-11 w-full rounded-lg bg-muted" />
          </div>
        ))}
      </div>
    </div>
  );
}
