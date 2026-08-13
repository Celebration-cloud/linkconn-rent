import type { AccountStatus, AppRole } from "@prisma/client";
import { BadgeCheck, UserRound } from "lucide-react";

type DashboardAccountProfile = {
  firstName: string;
  lastName: string;
  email: string;
  role: AppRole;
  accountStatus: AccountStatus;
  onboardingComplete: boolean;
};

export function DashboardAccountSummary({
  profile,
}: {
  profile: DashboardAccountProfile;
}) {
  const name = `${profile.firstName} ${profile.lastName}`.trim() || "LinkConn member";
  const initials = `${profile.firstName[0] || ""}${profile.lastName[0] || ""}`.toUpperCase() || "LC";
  const role = profile.role === "PropertyManager" ? "Property Manager" : profile.role;

  return (
    <section className="mx-auto max-w-5xl border border-line bg-white">
      <div className="grid md:grid-cols-[15rem_minmax(0,1fr)]">
        <div className="flex flex-col items-center justify-center bg-forest-950 p-7 text-center text-white">
          <div className="grid size-20 place-items-center rounded-xl bg-lime text-2xl font-extrabold text-forest-950">
            {initials}
          </div>
          <p className="mt-4 text-sm font-extrabold">{role}</p>
          <p className="mt-1 text-xs text-forest-200">{profile.accountStatus}</p>
        </div>
        <div className="min-w-0 p-5 sm:p-7">
          <div className="flex items-start gap-3">
            <UserRound className="mt-1 size-5 shrink-0 text-forest-700" aria-hidden="true" />
            <div className="min-w-0">
              <h2 className="break-words text-2xl font-extrabold tracking-[-0.02em] text-ink">{name}</h2>
              <p className="mt-1 break-all text-sm text-muted">{profile.email}</p>
            </div>
          </div>
          <dl className="mt-6 grid border border-line sm:grid-cols-2">
            <div className="p-4">
              <dt className="text-xs font-bold text-muted">Account status</dt>
              <dd className="mt-2 flex items-center gap-2 font-extrabold text-ink">
                <BadgeCheck className="size-4 text-forest-700" aria-hidden="true" />
                {profile.accountStatus}
              </dd>
            </div>
            <div className="border-t border-line p-4 sm:border-l sm:border-t-0">
              <dt className="text-xs font-bold text-muted">Onboarding</dt>
              <dd className="mt-2 font-extrabold text-ink">
                {profile.onboardingComplete ? "Complete" : "Incomplete"}
              </dd>
            </div>
          </dl>
          <p className="mt-5 max-w-[68ch] text-sm leading-6 text-muted">
            Profile changes are handled through the verified onboarding and account review process so your rental records stay consistent.
          </p>
        </div>
      </div>
    </section>
  );
}
