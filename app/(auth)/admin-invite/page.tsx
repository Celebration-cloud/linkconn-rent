import type { Metadata } from "next";
import { AdminAuthShell } from "@/components/auth/admin-auth-shell";
import { AdminInvitationAcceptance } from "@/features/admin-invitations/components/admin-invitation-acceptance";

export const metadata: Metadata = {
  title: "Administrator invitation | LinkConn Rent",
  robots: { index: false, follow: false },
  referrer: "no-referrer",
};

export default function AdminInvitationPage() {
  return (
    <AdminAuthShell
      eyebrow="Administrator access"
      title="Accept your secure invitation"
      description="Verify the invitation, authenticate with the invited email, and activate your Admin access."
      footerHref="mailto:support@linkconn.rent"
      footerLabel="Contact support"
    >
      <AdminInvitationAcceptance />
    </AdminAuthShell>
  );
}
