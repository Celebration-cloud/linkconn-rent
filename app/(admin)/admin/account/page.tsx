import { redirect } from "next/navigation";
import { ShieldCheck } from "lucide-react";
import { AdminPasswordForm } from "@/features/admin/components/admin-workspaces";
import { getCurrentProfile } from "@/lib/auth/current-profile";

export default async function AdminAccountPage() {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/admin/login?next=/admin/account");
  const initials = `${profile.firstName[0] ?? ""}${profile.lastName[0] ?? ""}`.toUpperCase() || "AD";
  return <div className="admin-canvas max-w-5xl">
    <header className="admin-page-heading"><div><h1>Profile and security</h1><p>Your authenticated administrator identity, access level, and password controls.</p></div><span className="inline-flex min-h-11 items-center gap-2 bg-forest-950 px-4 text-xs font-bold text-white"><ShieldCheck className="size-4 text-lime" />Neon Auth protected</span></header>
    <section className="admin-ledger grid md:grid-cols-[14rem_minmax(0,1fr)]">
      <div className="flex flex-col items-center justify-center bg-forest-950 p-7 text-center text-white"><div className="grid size-20 place-items-center bg-lime text-2xl font-extrabold text-forest-950">{initials}</div><p className="mt-4 text-sm font-extrabold">{profile.role}</p><p className="mt-1 text-xs text-forest-200">{profile.accountStatus}</p></div>
      <div className="min-w-0 p-5 sm:p-7"><h2 className="break-words text-2xl font-extrabold">{profile.firstName || "Administrator"} {profile.lastName}</h2><p className="mt-1 break-all text-sm text-muted">{profile.email}</p><dl className="mt-6 grid border border-[#d6ddd5] sm:grid-cols-2"><div className="p-4"><dt className="text-[10px] font-bold uppercase tracking-[.08em] text-muted">Account status</dt><dd className="mt-1 font-bold">{profile.accountStatus}</dd></div><div className="border-t border-[#d6ddd5] p-4 sm:border-l sm:border-t-0"><dt className="text-[10px] font-bold uppercase tracking-[.08em] text-muted">Onboarding</dt><dd className="mt-1 font-bold">{profile.onboardingComplete ? "Complete" : "Not required / incomplete"}</dd></div></dl></div>
    </section>
    <div className="mt-4"><AdminPasswordForm /></div>
  </div>;
}
