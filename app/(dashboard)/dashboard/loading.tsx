export default function DashboardLoading() {
  return (
    <div className="min-h-screen bg-background p-6 space-y-6 animate-pulse">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="h-8 w-48 rounded-lg bg-muted" />
        <div className="h-9 w-32 rounded-lg bg-muted" />
      </div>
      {/* Stats cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-xl bg-card border border-border p-5 space-y-3">
            <div className="h-4 w-28 rounded bg-muted" />
            <div className="h-8 w-20 rounded bg-muted" />
            <div className="h-3 w-24 rounded bg-muted" />
          </div>
        ))}
      </div>
      {/* Content area */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-xl bg-card border border-border p-6 space-y-4">
          <div className="h-6 w-40 rounded bg-muted" />
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-16 w-full rounded-lg bg-muted" />
          ))}
        </div>
        <div className="rounded-xl bg-card border border-border p-6 space-y-4">
          <div className="h-6 w-32 rounded bg-muted" />
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-full bg-muted" />
              <div className="flex-1 space-y-1.5">
                <div className="h-3.5 w-3/4 rounded bg-muted" />
                <div className="h-3 w-1/2 rounded bg-muted" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
