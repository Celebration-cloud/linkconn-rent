export default function VerifyLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-md space-y-6 animate-pulse text-center">
        <div className="mx-auto h-16 w-16 rounded-full bg-muted" />
        <div className="space-y-3">
          <div className="h-7 w-48 rounded-lg bg-muted mx-auto" />
          <div className="h-4 w-64 rounded bg-muted mx-auto" />
          <div className="h-4 w-48 rounded bg-muted mx-auto" />
        </div>
        {/* OTP input placeholders */}
        <div className="flex justify-center gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-12 w-10 rounded-lg bg-muted" />
          ))}
        </div>
        <div className="h-10 w-full rounded-lg bg-primary/20" />
      </div>
    </div>
  );
}
