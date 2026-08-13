import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getCurrentProfile: vi.fn(),
  listConversations: vi.fn(),
  listMessages: vi.fn(),
  markRead: vi.fn(),
  count: vi.fn(),
}));
vi.mock("@/lib/auth/current-profile", () => ({ getCurrentProfile: mocks.getCurrentProfile, isAccountOperational: () => true }));
vi.mock("@/repositories/operating-system.repository", () => ({ OperatingSystemRepository: { listConversations: mocks.listConversations, listMessages: mocks.listMessages } }));
vi.mock("@/repositories/notification.repository", () => ({ NotificationRepository: { markRead: mocks.markRead, markAllRead: vi.fn(), list: vi.fn(), unreadCount: mocks.count } }));
vi.mock("@/lib/security/csrf", () => ({ verifyCsrf: () => true }));

import { GET as GET_CONVERSATIONS } from "@/app/api/conversations/route";
import { GET as GET_MESSAGES } from "@/app/api/conversations/[id]/messages/route";
import { PATCH as PATCH_NOTIFICATIONS } from "@/app/api/notifications/route";

describe("conversation and notification hardening", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getCurrentProfile.mockResolvedValue({ id: "tenant-1", role: "Tenant", accountStatus: "Active" });
    mocks.listConversations.mockResolvedValue([]);
    mocks.listMessages.mockResolvedValue([]);
    mocks.markRead.mockResolvedValue({ id: "notification-1", readAt: new Date() });
    mocks.count.mockResolvedValue(7);
  });

  it("marks conversation list and message reads private and no-store", async () => {
    const conversations = await GET_CONVERSATIONS();
    const messages = await GET_MESSAGES(new Request("http://localhost/api/conversations/conversation-1/messages"), { params: Promise.resolve({ id: "conversation-1" }) });
    expect(conversations.headers.get("cache-control")).toContain("private");
    expect(conversations.headers.get("cache-control")).toContain("no-store");
    expect(messages.headers.get("cache-control")).toContain("private");
    expect(messages.headers.get("cache-control")).toContain("no-store");
  });

  it("returns the authoritative unread total after a mark-one mutation", async () => {
    const response = await PATCH_NOTIFICATIONS(new Request("http://localhost:3000/api/notifications", { method: "PATCH", headers: { origin: "http://localhost:3000", "content-type": "application/json" }, body: JSON.stringify({ action: "mark_read", notificationId: "11111111-1111-4111-8111-111111111111" }) }));
    expect(await response.json()).toEqual(expect.objectContaining({ success: true, data: expect.objectContaining({ unreadCount: 7 }) }));
    expect(mocks.count).toHaveBeenCalledWith("tenant-1");
  });
});
