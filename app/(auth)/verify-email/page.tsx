import AuthPageShell from "@/components/auth/auth-page-shell";
import VerifyEmailPanel from "@/components/auth/verify-email-panel";
import { Suspense } from "react";

export default function VerifyEmailPage() {
  return (
    <AuthPageShell
      eyebrow="Verify email"
      title="Confirm your inbox"
      description="Open the verification link we sent, or resend the email if it hasn't arrived yet."
      footerText="Need help finding the email?"
      footerHref="/contact"
      footerLabel="Contact support"
    >
      <Suspense fallback={<div className="rounded-2xl border border-navy-100 bg-navy-50 px-4 py-6 text-sm text-navy-500">Loading verification panel...</div>}>
        <VerifyEmailPanel />
      </Suspense>
    </AuthPageShell>
  );
}
