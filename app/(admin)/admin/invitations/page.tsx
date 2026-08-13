import { redirect } from "next/navigation";
import { AdminInvitationsPanel } from "@/features/admin-invitations/components/admin-invitations-panel";
import { listAdminInvitations } from "@/features/admin-invitations/server/invitation-service";
import { getCurrentProfile } from "@/lib/auth/current-profile";

export default async function AdminInvitationsPage() {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login?next=/admin/invitations");
  if (profile.role !== "SuperAdmin") redirect("/forbidden");
  const invitations = await listAdminInvitations(profile);

  return (
    <div className="admin-canvas max-w-6xl">
      <div>
        <header className="admin-page-heading"><div><h1>Administrator access</h1><p>Create, rotate, and revoke one-time invitation links without sharing passwords or granting Super Admin access.</p></div></header>
        <div className="mt-6"><AdminInvitationsPanel initialInvitations={invitations} /></div>
      </div>
    </div>
  );
}
