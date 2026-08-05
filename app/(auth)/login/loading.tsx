export default function LoginLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-md space-y-6 animate-pulse">
        <div className="h-8 w-40 rounded-lg bg-muted mx-auto" />
        <div className="space-y-4 rounded-2xl bg-card p-8 shadow-sm">
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
