export type AdminInvitationDto = {
  id: string;
  email: string;
  status: "Pending" | "Accepted" | "Revoked" | "Expired";
  expiresAt: string;
  acceptedAt: string | null;
  revokedAt: string | null;
  createdAt: string;
  invitedBy: string;
};

