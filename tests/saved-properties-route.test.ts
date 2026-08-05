import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getCurrentProfile: vi.fn(),
  listSavedPropertyIds: vi.fn(),
}));

vi.mock("@/lib/auth/current-profile", () => ({
  getCurrentProfile: mocks.getCurrentProfile,
  hasRole: (profile: { role: string }, roles: string[]) =>
    roles.includes(profile.role),
}));

vi.mock("@/repositories/operating-system.repository", () => ({
  OperatingSystemRepository: {
    listSavedPropertyIds: mocks.listSavedPropertyIds,
  },
}));

import { GET } from "@/app/api/saved-properties/route";

describe("saved property IDs", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns 401 for guests", async () => {
    mocks.getCurrentProfile.mockResolvedValue(null);
    const response = await GET();
    expect(response.status).toBe(401);
  });

  it("returns 403 for non-tenant accounts", async () => {
    mocks.getCurrentProfile.mockResolvedValue({ id: "landlord-1", role: "Landlord" });
    const response = await GET();
    expect(response.status).toBe(403);
  });

  it("returns the current tenant's saved IDs", async () => {
    mocks.getCurrentProfile.mockResolvedValue({ id: "tenant-1", role: "Tenant" });
    mocks.listSavedPropertyIds.mockResolvedValue(["property-2", "property-1"]);
    const response = await GET();
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({
      success: true,
      data: { propertyIds: ["property-2", "property-1"] },
    });
  });
});
