export default function OnboardingLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-2xl space-y-8 animate-pulse">
        {/* Step indicator */}
        <div className="flex items-center justify-center gap-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-muted" />
              {i < 3 && <div className="h-1 w-12 rounded bg-muted" />}
            </div>
          ))}
        </div>
        {/* Card */}
        <div className="space-y-6 rounded-2xl bg-card p-8 shadow-sm">
          <div className="h-7 w-56 rounded bg-muted" />
          <div className="h-4 w-80 rounded bg-muted" />
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="h-4 w-28 rounded bg-muted" />
                <div className="h-10 w-full rounded-lg bg-muted" />
              </div>
            ))}
          </div>
          <div className="flex justify-between pt-4">
            <div className="h-10 w-24 rounded-lg bg-muted" />
            <div className="h-10 w-24 rounded-lg bg-primary/20" />
          </div>
        </div>
      </div>
    </div>
  );
}
