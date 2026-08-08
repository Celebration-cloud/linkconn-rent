import type { Metadata } from "next";
import { Suspense } from "react";
import { AdminAuthShell } from "@/components/auth/admin-auth-shell";
import ForgotPasswordForm from "@/components/auth/forgot-password-form";

export const metadata: Metadata = {
  title: "Administrator password recovery | LinkConn Rent",
  robots: { index: false, follow: false },
  referrer: "no-referrer",
};

export default function AdminForgotPasswordPage() {
  return (
    <AdminAuthShell
      eyebrow="Administrator recovery"
      title="Recover admin access"
      description="Request a secure reset link for an authorized administrator account."
      footerHref="/admin/login"
      footerLabel="Return to administrator sign in"
    >
      <Suspense fallback={<div className="rounded-xl bg-sand-100 px-4 py-6 text-sm text-muted">Loading password recovery…</div>}>
        <ForgotPasswordForm
          portal="admin"
          redirectTo="/admin/reset-password?next=%2Fadmin%2Flogin"
        />
      </Suspense>
    </AdminAuthShell>
  );
}
