import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  searchProperties: vi.fn(),
  getCurrentProfile: vi.fn(),
}));

vi.mock("@/lib/auth/current-profile", () => ({
  getCurrentProfile: mocks.getCurrentProfile,
}));

vi.mock("@/repositories/operating-system.repository", () => ({
  OperatingSystemRepository: {
    searchProperties: mocks.searchProperties,
  },
}));

vi.mock("@/utils/map-property", () => ({
  mapProperty: (property: unknown) => property,
}));

import { GET } from "@/app/api/properties/route";

describe("properties search route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.searchProperties.mockResolvedValue({
      items: [{ id: "property-1", title: "Yaba studio" }],
      pagination: {
        page: 2,
        pageSize: 12,
        totalItems: 13,
        totalPages: 2,
        hasNextPage: false,
        hasPreviousPage: true,
      },
    });
  });

  it("returns items and complete pagination metadata", async () => {
    const response = await GET(
      new Request("http://localhost/api/properties?q=Yaba&page=2"),
    );
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({
      success: true,
      data: {
        items: [{ id: "property-1" }],
        pagination: { page: 2, totalItems: 13, hasPreviousPage: true },
      },
    });
    expect(mocks.searchProperties).toHaveBeenCalledWith(
      expect.objectContaining({ q: "Yaba", page: 2, pageSize: 12, mode: "list" }),
    );
  });

  it("accepts the bounded map response mode", async () => {
    const response = await GET(
      new Request("http://localhost/api/properties?mode=map&pageSize=200"),
    );
    expect(response.status).toBe(200);
    expect(mocks.searchProperties).toHaveBeenCalledWith(
      expect.objectContaining({ mode: "map", pageSize: 200 }),
    );
  });

  it("rejects oversized list pages", async () => {
    const response = await GET(
      new Request("http://localhost/api/properties?pageSize=25"),
    );
    expect(response.status).toBe(400);
    expect(mocks.searchProperties).not.toHaveBeenCalled();
  });
});
