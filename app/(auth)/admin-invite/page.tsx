import type { Metadata } from "next";
import AuthPageShell from "@/components/auth/auth-page-shell";
import { AdminInvitationAcceptance } from "@/features/admin-invitations/components/admin-invitation-acceptance";

export const metadata: Metadata = {
  title: "Administrator invitation | LinkConn Rent",
  robots: { index: false, follow: false },
  referrer: "no-referrer",
};

export default function AdminInvitationPage() {
  return (
    <AuthPageShell
      eyebrow="Administrator access"
      title="Accept your secure invitation"
      description="Verify the invitation, authenticate with the invited email, and activate your Admin access."
      footerText="Need a new link?"
      footerHref="mailto:support@linkconn.rent"
      footerLabel="Contact support"
    >
      <AdminInvitationAcceptance />
    </AuthPageShell>
  );
}

