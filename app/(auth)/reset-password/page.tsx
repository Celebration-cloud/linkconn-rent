import AuthPageShell from "@/components/auth/auth-page-shell";
import ResetPasswordForm from "@/components/auth/reset-password-form";
import { Suspense } from "react";

export default function ResetPasswordPage() {
  return (
    <AuthPageShell
      eyebrow="Set new password"
      title="Create a fresh password"
      description="Use the token in your reset email to securely set a new password."
      footerText="Need a fresh reset email?"
      footerHref="/forgot-password"
      footerLabel="Request one"
    >
      <Suspense fallback={<div className="rounded-2xl border border-navy-100 bg-navy-50 px-4 py-6 text-sm text-navy-500">Loading password reset form...</div>}>
        <ResetPasswordForm />
      </Suspense>
    </AuthPageShell>
  );
}
