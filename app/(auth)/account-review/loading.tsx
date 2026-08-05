import { Loader2 } from "lucide-react";

export default function AccountReviewLoading() {
  return (
    <main className="grid min-h-[100dvh] place-items-center bg-sand-50">
      <div className="text-center">
        <Loader2 className="mx-auto size-8 animate-spin text-forest-700" />
        <p className="mt-3 text-sm font-bold text-muted">
          Loading your review status…
        </p>
      </div>
    </main>
  );
}
