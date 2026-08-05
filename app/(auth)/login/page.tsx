import AuthPageShell from "@/components/auth/auth-page-shell";
import LoginForm from "@/components/auth/login-form";
import { Suspense } from "react";

export default function LoginPage() {
  return (
    <AuthPageShell
      eyebrow="Welcome back"
      title="Sign in to LinkConn Rent"
      description="Access your shortlist, secure chats, saved homes, and dashboard tools with a fast email-first sign-in flow."
      footerText="Need a new account?"
      footerHref="/signup"
      footerLabel="Create one here"
    >
      <Suspense fallback={<div className="rounded-2xl border border-navy-100 bg-navy-50 px-4 py-6 text-sm text-navy-500">Loading sign in form...</div>}>
        <LoginForm />
      </Suspense>
    </AuthPageShell>
  );
}
