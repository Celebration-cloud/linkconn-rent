import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { AdminAuthShell } from "@/components/auth/admin-auth-shell";
import LoginForm from "@/components/auth/login-form";
import { getCurrentProfile, isAccountOperational } from "@/lib/auth/current-profile";
import { isAdministratorRole } from "@/lib/auth/review-access";

export const metadata: Metadata = {
  title: "Administrator sign in | LinkConn Rent",
  robots: { index: false, follow: false },
  referrer: "no-referrer",
};

export default async function AdminLoginPage() {
  const profile = await getCurrentProfile();
  if (profile && isAdministratorRole(profile.role) && isAccountOperational(profile)) redirect("/admin");

  return (
    <AdminAuthShell
      eyebrow="Administrator access"
      title="Sign in to the admin portal"
      description="Use your authorized administrator email and password to continue."
      footerHref="/"
      footerLabel="Return to the LinkConn Rent website"
    >
      <Suspense fallback={<div className="rounded-xl bg-sand-100 px-4 py-6 text-sm text-muted">Loading administrator sign in…</div>}>
        <LoginForm
          portal="admin"
          defaultDestination="/admin"
          forgotPasswordHref="/admin/forgot-password"
        />
      </Suspense>
    </AdminAuthShell>
  );
}
