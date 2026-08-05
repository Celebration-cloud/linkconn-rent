import AuthPageShell from "@/components/auth/auth-page-shell";
import ForgotPasswordForm from "@/components/auth/forgot-password-form";
import { Suspense } from "react";

export default function ForgotPasswordPage() {
  return (
    <AuthPageShell
      eyebrow="Password reset"
      title="Recover account access"
      description="Request a reset link and return to a dedicated password update page."
      footerText="Remembered your password?"
      footerHref="/login"
      footerLabel="Back to sign in"
    >
      <Suspense fallback={<div className="rounded-2xl border border-navy-100 bg-navy-50 px-4 py-6 text-sm text-navy-500">Loading reset request form...</div>}>
        <ForgotPasswordForm />
      </Suspense>
    </AuthPageShell>
  );
}
