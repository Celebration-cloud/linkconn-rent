import type { Metadata } from "next";
import { Suspense } from "react";
import { AdminAuthShell } from "@/components/auth/admin-auth-shell";
import ResetPasswordForm from "@/components/auth/reset-password-form";

export const metadata: Metadata = {
  title: "Reset administrator password | LinkConn Rent",
  robots: { index: false, follow: false },
  referrer: "no-referrer",
};

export default function AdminResetPasswordPage() {
  return (
    <AdminAuthShell
      eyebrow="Administrator recovery"
      title="Set a new admin password"
      description="Use the secure token from your reset email to replace your administrator password."
      footerHref="/admin/forgot-password"
      footerLabel="Request a new administrator reset link"
    >
      <Suspense fallback={<div className="rounded-xl bg-sand-100 px-4 py-6 text-sm text-muted">Loading password reset…</div>}>
        <ResetPasswordForm defaultDestination="/admin/login" />
      </Suspense>
    </AdminAuthShell>
  );
}
