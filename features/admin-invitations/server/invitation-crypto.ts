import "server-only";

import {
  createHash,
  createHmac,
  randomBytes,
  timingSafeEqual,
} from "node:crypto";

const TOKEN_BYTES = 32;
const CLAIM_TTL_SECONDS = 2 * 60 * 60;

type InvitationClaim = {
  invitationId: string;
  expiresAt: number;
};

function claimSecret() {
  const secret = process.env.ADMIN_INVITE_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error("ADMIN_INVITE_SECRET must contain at least 32 characters");
  }
  return secret;
}

export function generateInvitationToken() {
  return randomBytes(TOKEN_BYTES).toString("base64url");
}

export function hashInvitationToken(token: string) {
  return createHash("sha256").update(token, "utf8").digest("hex");
}

function signPayload(payload: string) {
  return createHmac("sha256", claimSecret()).update(payload).digest("base64url");
}

export function createInvitationClaim(invitationId: string, now = Date.now()) {
  const claim: InvitationClaim = {
    invitationId,
    expiresAt: now + CLAIM_TTL_SECONDS * 1000,
  };
  const payload = Buffer.from(JSON.stringify(claim), "utf8").toString("base64url");
  return `${payload}.${signPayload(payload)}`;
}

export function parseInvitationClaim(value: string, now = Date.now()): InvitationClaim | null {
  const [payload, signature, extra] = value.split(".");
  if (!payload || !signature || extra) return null;

  const expected = Buffer.from(signPayload(payload));
  const actual = Buffer.from(signature);
  if (expected.length !== actual.length || !timingSafeEqual(expected, actual)) return null;

  try {
    const parsed = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as Partial<InvitationClaim>;
    if (typeof parsed.invitationId !== "string" || typeof parsed.expiresAt !== "number") return null;
    if (parsed.expiresAt <= now) return null;
    return { invitationId: parsed.invitationId, expiresAt: parsed.expiresAt };
  } catch {
    return null;
  }
}

export const ADMIN_INVITATION_CLAIM_COOKIE = "linkconn_admin_invite_claim";
export const ADMIN_INVITATION_CLAIM_MAX_AGE = CLAIM_TTL_SECONDS;

