import "server-only";

import { apiError } from "@/lib/api-response";
import { AdminInvitationError } from "@/features/admin-invitations/server/invitation-service";

export function adminInvitationHttpError(error: unknown) {
  if (error instanceof AdminInvitationError) return apiError(error.message, error.status);
  console.error("[admin-invitations]", error);
  return apiError("Unable to process administrator invitation", 500);
}

