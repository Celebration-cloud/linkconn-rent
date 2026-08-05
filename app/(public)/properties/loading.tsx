export default function PropertiesLoading() {
  return (
    <div className="container mx-auto px-4 py-10 space-y-8 animate-pulse">
      {/* Page header */}
      <div className="space-y-3">
        <div className="h-9 w-64 rounded-lg bg-muted" />
        <div className="h-4 w-96 rounded bg-muted" />
      </div>
      {/* Filter bar */}
      <div className="flex flex-wrap gap-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-9 w-28 rounded-full bg-muted" />
        ))}
      </div>
      {/* Property grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="overflow-hidden rounded-2xl bg-card border border-border">
            <div className="h-52 w-full bg-muted" />
            <div className="p-4 space-y-3">
              <div className="h-5 w-3/4 rounded bg-muted" />
              <div className="h-4 w-1/2 rounded bg-muted" />
              <div className="flex items-center justify-between pt-1">
                <div className="h-6 w-24 rounded bg-muted" />
                <div className="h-8 w-20 rounded-lg bg-muted" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
