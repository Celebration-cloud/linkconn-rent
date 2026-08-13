import "server-only";

import { auth } from "@/lib/neon-auth";
import { isFreshAuthentication } from "@/lib/auth/session-recency";

export async function hasFreshAuthentication() {
  const { data } = await auth.getSession();
  return isFreshAuthentication(data?.session);
}
