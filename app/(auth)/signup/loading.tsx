export default function SignupLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-md space-y-6 animate-pulse">
        <div className="h-8 w-48 rounded-lg bg-muted mx-auto" />
        <div className="space-y-4 rounded-2xl bg-card p-8 shadow-sm">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="h-4 w-20 rounded bg-muted" />
              <div className="h-10 w-full rounded-lg bg-muted" />
            </div>
            <div className="space-y-2">
              <div className="h-4 w-20 rounded bg-muted" />
              <div className="h-10 w-full rounded-lg bg-muted" />
            </div>
          </div>
          <div className="h-5 w-24 rounded bg-muted" />
          <div className="h-10 w-full rounded-lg bg-muted" />
          <div className="h-5 w-24 rounded bg-muted" />
          <div className="h-10 w-full rounded-lg bg-muted" />
          <div className="h-10 w-full rounded-lg bg-primary/20" />
        </div>
      </div>
    </div>
  );
}
