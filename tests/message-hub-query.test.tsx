import { describe, expect, it, vi } from "vitest";

vi.mock("next/navigation", () => ({ useSearchParams: () => new URLSearchParams("conversation=conversation-2") }));
vi.mock("@/providers/auth-provider", () => ({ useAuth: () => ({ user: { id: "tenant-1" } }) }));

import { selectInitialConversationId } from "@/components/stitch/message-hub";

describe("message hub deep links", () => {
  it("selects the requested conversation only when it exists in the authorized loaded list", () => {
    const loaded = [{ id: "conversation-1" }, { id: "conversation-2" }];
    expect(selectInitialConversationId(loaded, "conversation-2")).toBe("conversation-2");
    expect(selectInitialConversationId(loaded, "foreign-conversation")).toBe("conversation-1");
    expect(selectInitialConversationId([], "conversation-2")).toBeNull();
  });
});
