import AuthPageShell from "@/components/auth/auth-page-shell";
import SignupForm from "@/components/auth/signup-form";
import { Suspense } from "react";

export default function SignupPage() {
  return (
    <AuthPageShell
      eyebrow="Create account"
      title="Start your rental journey"
      description="Create an email-only account, verify your inbox, and continue into a cleaner tenant or landlord flow."
      footerText="Already registered?"
      footerHref="/login"
      footerLabel="Sign in"
    >
      <Suspense fallback={<div className="rounded-2xl border border-navy-100 bg-navy-50 px-4 py-6 text-sm text-navy-500">Loading sign up form...</div>}>
        <SignupForm />
      </Suspense>
    </AuthPageShell>
  );
}
