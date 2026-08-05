import { describe, expect, it, vi } from "vitest";
import { performLogout } from "@/lib/auth/logout";

describe("logout sequencing", () => {
  it("waits for the remote session to close before clearing and navigating", async () => {
    const order: string[] = [];
    const signOut = vi.fn(async () => {
      order.push("sign-out");
    });
    const afterSessionCleared = vi.fn(() => {
      order.push("clear");
    });
    const navigateHome = vi.fn(() => {
      order.push("navigate");
    });

    await performLogout({ signOut, afterSessionCleared, navigateHome });

    expect(order).toEqual(["sign-out", "clear", "navigate"]);
  });

  it("keeps the current client state when remote sign-out fails", async () => {
    const afterSessionCleared = vi.fn();
    const navigateHome = vi.fn();

    await expect(
      performLogout({
        signOut: async () => {
          throw new Error("network unavailable");
        },
        afterSessionCleared,
        navigateHome,
      }),
    ).rejects.toThrow("network unavailable");
    expect(afterSessionCleared).not.toHaveBeenCalled();
    expect(navigateHome).not.toHaveBeenCalled();
  });
});
