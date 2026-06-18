import { redirect } from "next/navigation";

import { auth } from "@/lib/auth/server";
import { sql } from "@/lib/db";
import { headers } from "next/headers";

export default async function DashboardEntry() {
  

const sessionData = await auth.getSession({ headers: headers() });
  const session = sessionData.data;

  if (!session?.user) {
    redirect("/auth/login");
  }

  const userId = session.user.id;
  let role = "tenant";
  let onboarded = false;
  let verified = false;

  try {
    const profiles = await sql`
      SELECT role, onboarded, verified FROM profiles WHERE id = ${userId} LIMIT 1
    `;
    if (profiles.length > 0) {
      const profile = profiles[0];
      role = profile.role || "tenant";
      onboarded = profile.onboarded;
      verified = profile.verified;
    } else {
      // If no profile yet, they need onboarding
      redirect("/onboarding/tenant");
    }
  } catch (err) {
    console.error("Dashboard profile fetch error:", err);
    redirect("/auth/login");
  }

  if (!onboarded) {
    redirect(`/onboarding/${role}`);
  }

  if (!verified) {
    redirect(`/pending/${role}`);
  }

  redirect(`/dashboard/${role}`);
}
