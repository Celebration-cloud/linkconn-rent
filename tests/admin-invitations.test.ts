import { beforeEach, describe, expect, it } from "vitest";
import {
  createInvitationClaim,
  generateInvitationToken,
  hashInvitationToken,
  parseInvitationClaim,
} from "@/features/admin-invitations/server/invitation-crypto";
import { canManageAdminInvitations, getAdminInvitationStatus } from "@/features/admin-invitations/server/invitation-service";
import {
  adminInvitationEmailSchema,
  normalizeInvitationEmail,
} from "@/features/admin-invitations/schemas";
import {
  generateBootstrapPassword,
  validateBootstrapDatabaseUrl,
} from "@/scripts/admin-bootstrap/utils";

describe("administrator invitation security primitives", () => {
  beforeEach(() => {
    process.env.ADMIN_INVITE_SECRET = "test-secret-that-is-longer-than-thirty-two-characters";
  });

  it("generates unique tokens and hashes without retaining the raw value", () => {
    const first = generateInvitationToken();
    const second = generateInvitationToken();
    expect(first).not.toBe(second);
    expect(first.length).toBeGreaterThanOrEqual(40);
    expect(hashInvitationToken(first)).toMatch(/^[a-f0-9]{64}$/);
    expect(hashInvitationToken(first)).not.toContain(first);
  });

  it("signs, verifies, expires, and rejects modified claim cookies", () => {
    const now = Date.UTC(2026, 7, 6);
    const claim = createInvitationClaim("invite-1", now);
    expect(parseInvitationClaim(claim, now + 1_000)?.invitationId).toBe("invite-1");
    expect(parseInvitationClaim(`${claim}x`, now + 1_000)).toBeNull();
    expect(parseInvitationClaim(claim, now + 2 * 60 * 60 * 1000 + 1)).toBeNull();
  });

  it("normalizes email and rejects invalid addresses", () => {
    expect(normalizeInvitationEmail(" Admin@Example.COM ")).toBe("admin@example.com");
    expect(adminInvitationEmailSchema.safeParse({ email: "not-an-email" }).success).toBe(false);
  });

  it("derives invitation status with terminal states taking precedence", () => {
    const future = new Date("2026-08-09T00:00:00Z");
    const now = new Date("2026-08-06T00:00:00Z");
    expect(getAdminInvitationStatus({ acceptedAt: null, revokedAt: null, expiresAt: future }, now)).toBe("Pending");
    expect(getAdminInvitationStatus({ acceptedAt: null, revokedAt: now, expiresAt: future }, now)).toBe("Revoked");
    expect(getAdminInvitationStatus({ acceptedAt: now, revokedAt: null, expiresAt: future }, now)).toBe("Accepted");
    expect(getAdminInvitationStatus({ acceptedAt: null, revokedAt: null, expiresAt: now }, now)).toBe("Expired");
  });

  it.each([
    ["Tenant", false],
    ["Landlord", false],
    ["PropertyManager", false],
    ["Moderator", false],
    ["Admin", false],
    ["SuperAdmin", true],
  ] as const)("limits invitation management for %s", (role, expected) => {
    expect(canManageAdminInvitations(role)).toBe(expected);
  });
});

describe("Super Admin bootstrap safeguards", () => {
  it("generates a strong one-time password", () => {
    const password = generateBootstrapPassword();
    expect(password).toMatch(/^[A-Za-z0-9_-]+$/);
    expect(password.length).toBeGreaterThanOrEqual(40);
  });

  it("accepts only pooled Neon PostgreSQL URLs", () => {
    expect(validateBootstrapDatabaseUrl("postgresql://user:pass@ep-test-pooler.eu-west-2.aws.neon.tech/db").hostname)
      .toBe("ep-test-pooler.eu-west-2.aws.neon.tech");
    expect(() => validateBootstrapDatabaseUrl("postgresql://localhost/db")).toThrow(/Neon pooled endpoint/);
    expect(() => validateBootstrapDatabaseUrl("mysql://example.com/db")).toThrow(/not PostgreSQL/);
  });
});
