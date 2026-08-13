import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getCurrentProfile: vi.fn(),
  list: vi.fn(),
  markRead: vi.fn(),
  markAllRead: vi.fn(),
  unreadCount: vi.fn(),
  verifyCsrf: vi.fn(() => true),
}));

vi.mock("@/lib/auth/current-profile", () => ({
  getCurrentProfile: mocks.getCurrentProfile,
  isAccountOperational: (profile: { accountStatus: string }) => profile.accountStatus !== "Suspended",
}));
vi.mock("@/lib/security/csrf", () => ({ verifyCsrf: mocks.verifyCsrf }));
vi.mock("@/repositories/notification.repository", () => ({ NotificationRepository: {
  list: mocks.list,
  markRead: mocks.markRead,
  markAllRead: mocks.markAllRead,
  unreadCount: mocks.unreadCount,
} }));

import { GET, PATCH } from "@/app/api/notifications/route";

const profile = { id: "tenant-1", role: "Tenant", accountStatus: "Active" };

describe("notification route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getCurrentProfile.mockResolvedValue(profile);
    mocks.list.mockResolvedValue({ items: [], unreadCount: 0 });
    mocks.markRead.mockResolvedValue({ id: "notification-1", readAt: new Date() });
    mocks.markAllRead.mockResolvedValue({ count: 2 });
    mocks.unreadCount.mockResolvedValue(0);
  });

  it("returns a personalized private no-store notification center", async () => {
    const response = await GET();
    expect(response.status).toBe(200);
    expect(response.headers.get("cache-control")).toContain("private");
    expect(response.headers.get("cache-control")).toContain("no-store");
    expect(mocks.list).toHaveBeenCalledWith("tenant-1");
  });

  it("derives ownership from the session when marking one read", async () => {
    const response = await PATCH(new Request("http://localhost:3000/api/notifications", {
      method: "PATCH",
      headers: { origin: "http://localhost:3000", "content-type": "application/json" },
      body: JSON.stringify({ action: "mark_read", notificationId: "11111111-1111-4111-8111-111111111111" }),
    }));
    expect(response.status).toBe(200);
    expect(mocks.markRead).toHaveBeenCalledWith("tenant-1", "11111111-1111-4111-8111-111111111111");
  });

  it("rejects cross-site mutation attempts before persistence", async () => {
    mocks.verifyCsrf.mockReturnValueOnce(false);
    const response = await PATCH(new Request("https://evil.example/api/notifications", {
      method: "PATCH",
      body: JSON.stringify({ action: "mark_all_read" }),
    }));
    expect(response.status).toBe(403);
    expect(mocks.markAllRead).not.toHaveBeenCalled();
  });
});
