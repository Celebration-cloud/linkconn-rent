export default function PropertyDetailLoading() {
  return (
    <div className="container mx-auto px-4 py-10 space-y-8 animate-pulse">
      {/* Image gallery */}
      <div className="grid grid-cols-4 grid-rows-2 gap-2 h-[420px] rounded-2xl overflow-hidden">
        <div className="col-span-2 row-span-2 bg-muted" />
        <div className="bg-muted" />
        <div className="bg-muted" />
        <div className="bg-muted" />
        <div className="bg-muted" />
      </div>
      {/* Content */}
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-3">
        {/* Left — details */}
        <div className="lg:col-span-2 space-y-6">
          <div className="space-y-3">
            <div className="h-8 w-3/4 rounded-lg bg-muted" />
            <div className="h-5 w-1/2 rounded bg-muted" />
            <div className="flex gap-4 pt-1">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-6 w-20 rounded-full bg-muted" />
              ))}
            </div>
          </div>
          <div className="h-px w-full bg-muted" />
          <div className="space-y-3">
            <div className="h-6 w-32 rounded bg-muted" />
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-4 w-full rounded bg-muted" />
            ))}
            <div className="h-4 w-2/3 rounded bg-muted" />
          </div>
          <div className="h-px w-full bg-muted" />
          <div className="space-y-3">
            <div className="h-6 w-24 rounded bg-muted" />
            <div className="grid grid-cols-3 gap-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-10 rounded-lg bg-muted" />
              ))}
            </div>
          </div>
        </div>
        {/* Right — booking card */}
        <div className="rounded-2xl border border-border bg-card p-6 space-y-4 h-fit">
          <div className="h-7 w-36 rounded bg-muted" />
          <div className="h-10 w-full rounded-lg bg-muted" />
          <div className="h-10 w-full rounded-lg bg-muted" />
          <div className="h-px w-full bg-muted" />
          <div className="space-y-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex justify-between">
                <div className="h-4 w-28 rounded bg-muted" />
                <div className="h-4 w-16 rounded bg-muted" />
              </div>
            ))}
          </div>
          <div className="h-11 w-full rounded-lg bg-primary/20" />
        </div>
      </div>
    </div>
  );
}
