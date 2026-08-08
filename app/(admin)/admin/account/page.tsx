import { redirect } from "next/navigation";
import { AdminPasswordForm } from "@/features/admin/components/admin-workspaces";
import { getCurrentProfile } from "@/lib/auth/current-profile";

export default async function AdminAccountPage() {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/admin/login?next=/admin/account");
  const initials = `${profile.firstName[0] ?? ""}${profile.lastName[0] ?? ""}`.toUpperCase() || "AD";
  return <div className="mx-auto w-full max-w-4xl p-4 pb-28 sm:p-6 md:pb-8 lg:p-8"><p className="text-xs font-bold uppercase tracking-[.14em] text-forest-700">Administrator account</p><h1 className="mt-2 text-3xl font-extrabold text-ink">Profile and security</h1><section className="mt-6 rounded-xl border border-line bg-white p-5"><div className="flex flex-col gap-4 sm:flex-row sm:items-center"><div className="grid size-16 shrink-0 place-items-center rounded-2xl bg-forest-800 text-lg font-extrabold text-white">{initials}</div><div className="min-w-0"><h2 className="break-words text-xl font-extrabold">{profile.firstName || "Administrator"} {profile.lastName}</h2><p className="break-all text-sm text-muted">{profile.email}</p><span className="mt-2 inline-flex rounded-full bg-forest-100 px-3 py-1 text-xs font-bold text-forest-800">{profile.role}</span></div></div><dl className="mt-6 grid gap-4 border-t border-line pt-5 sm:grid-cols-2"><div><dt className="text-xs font-bold text-muted">Account status</dt><dd className="mt-1 font-bold">{profile.accountStatus}</dd></div><div><dt className="text-xs font-bold text-muted">Onboarding</dt><dd className="mt-1 font-bold">{profile.onboardingComplete ? "Complete" : "Not required / incomplete"}</dd></div></dl></section><div className="mt-6"><AdminPasswordForm /></div></div>;
}
