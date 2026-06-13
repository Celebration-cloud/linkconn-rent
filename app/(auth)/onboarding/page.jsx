import { redirect } from "next/navigation";

import { auth } from "@/lib/auth/server";
import { sql } from "@/lib/db";

export default async function OnboardingPage() {
  const session = await auth.getSession();

  if (!session?.user) {
    redirect("/auth/login");
  }

  const userId = session.user.id;
  let role = "tenant";

  try {
    const profiles = await sql`
      SELECT role FROM profiles WHERE id = ${userId} LIMIT 1
    `;
    if (profiles.length > 0) {
      role = profiles[0].role || "tenant";
    }
  } catch (err) {
    console.error("Onboarding role fetch error:", err);
  }

  redirect(`/onboarding/${role}`);
}
