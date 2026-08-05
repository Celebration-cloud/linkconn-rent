import { beforeEach, describe, expect, it, vi } from "vitest";
import type { AppRole } from "@prisma/client";
import { canListProperties } from "@/domain/constants/property-access";
import type { Role } from "@/domain/types/auth";

const mocks = vi.hoisted(() => ({
  getCurrentProfile: vi.fn(),
  redirect: vi.fn(),
  saveDraft: vi.fn(),
}));

vi.mock("@/lib/auth/current-profile", () => ({
  getCurrentProfile: mocks.getCurrentProfile,
}));

vi.mock("next/navigation", () => ({
  redirect: mocks.redirect,
}));

vi.mock("@/repositories/operating-system.repository", () => ({
  OperatingSystemRepository: {
    saveDraft: mocks.saveDraft,
    searchProperties: vi.fn(),
  },
}));

import PropertyManagementLayout from "@/app/(dashboard)/dashboard/properties/layout";
import { POST } from "@/app/api/properties/route";

const profile = (role: string) => ({
  id: `profile-${role}`,
  email: `${role.toLowerCase().replaceAll(" ", "-")}@linkconn.rent`,
  firstName: "Test",
  lastName: "User",
  role,
  accountStatus: "Active",
  onboardingComplete: true,
});

const validDraft = {
  title: "Bright two-bedroom apartment",
  type: "Apartment",
  location: "Lekki Phase One, Lagos",
  city: "Lagos",
  description: "A well maintained apartment with secure parking and steady water.",
  price: 3_600_000,
  period: "year",
  bedrooms: 2,
  bathrooms: 2,
  toilets: 3,
  area: 120,
  images: [],
  amenities: ["Parking"],
  houseRules: ["No smoking"],
  cautionFee: 300_000,
  legalFee: 100_000,
  agencyFee: 0,
  serviceCharge: 250_000,
  publish: false,
};

describe("property-listing role policy", () => {
  const roleCases: ReadonlyArray<
    readonly [Role | AppRole | null | undefined, boolean]
  > = [
    ["Landlord", true],
    ["Property Manager", true],
    ["PropertyManager", true],
    ["Tenant", false],
    ["Guest", false],
    ["Moderator", false],
    ["Admin", false],
    ["Super Admin", false],
    ["SuperAdmin", false],
    [null, false],
    [undefined, false],
  ];

  it.each(roleCases)("returns %s access as %s", (role, expected) => {
    expect(canListProperties(role)).toBe(expected);
  });
});

describe("property-listing page guard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.redirect.mockImplementation((destination: string) => {
      throw new Error(`REDIRECT:${destination}`);
    });
  });

  it("sends guests to login", async () => {
    mocks.getCurrentProfile.mockResolvedValue(null);

    await expect(
      PropertyManagementLayout({ children: "listing" }),
    ).rejects.toThrow("REDIRECT:/login");
  });

  it("sends authenticated non-listing roles to forbidden", async () => {
    mocks.getCurrentProfile.mockResolvedValue(profile("Tenant"));

    await expect(
      PropertyManagementLayout({ children: "listing" }),
    ).rejects.toThrow("REDIRECT:/forbidden");
  });

  it.each(["Landlord", "PropertyManager"])(
    "renders the listing flow for %s",
    async (role) => {
      mocks.getCurrentProfile.mockResolvedValue(profile(role));

      await expect(
        PropertyManagementLayout({ children: "listing" }),
      ).resolves.toBe("listing");
    },
  );
});

describe("property creation API access", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.saveDraft.mockResolvedValue({ id: "property-1" });
  });

  it("returns 401 for guests", async () => {
    mocks.getCurrentProfile.mockResolvedValue(null);

    const response = await POST(
      new Request("http://localhost/api/properties", { method: "POST" }),
    );

    expect(response.status).toBe(401);
    expect(mocks.saveDraft).not.toHaveBeenCalled();
  });

  it.each(["Tenant", "Moderator", "Admin", "SuperAdmin"])(
    "returns 403 for %s",
    async (role) => {
      mocks.getCurrentProfile.mockResolvedValue(profile(role));

      const response = await POST(
        new Request("http://localhost/api/properties", { method: "POST" }),
      );

      expect(response.status).toBe(403);
      expect(mocks.saveDraft).not.toHaveBeenCalled();
    },
  );

  it.each(["Landlord", "PropertyManager"])(
    "allows %s to save a property draft",
    async (role) => {
      mocks.getCurrentProfile.mockResolvedValue(profile(role));

      const response = await POST(
        new Request("http://localhost/api/properties", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(validDraft),
        }),
      );

      expect(response.status).toBe(201);
      expect(mocks.saveDraft).toHaveBeenCalledWith(
        `profile-${role}`,
        expect.objectContaining({ title: validDraft.title, publish: false }),
      );
    },
  );
});
