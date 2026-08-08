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
    <div className="p-4 pb-24 sm:p-7 md:pb-8">
      <div className="mx-auto max-w-5xl">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-forest-700">Access management</p>
        <h1 className="mt-2 text-3xl font-extrabold tracking-[-0.04em] text-ink">Administrator invitations</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">Create, rotate, and revoke one-time links without sharing passwords or granting Super Admin access.</p>
        <div className="mt-6"><AdminInvitationsPanel initialInvitations={invitations} /></div>
      </div>
    </div>
  );
}

