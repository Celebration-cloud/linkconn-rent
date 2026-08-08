import { describe, expect, it, vi } from "vitest";
import { NextRequest, NextResponse } from "next/server";

vi.mock("@/lib/neon-auth", () => ({
  auth: {
    middleware: ({ loginUrl }: { loginUrl: string }) => async (request: NextRequest) =>
      NextResponse.redirect(new URL(loginUrl, request.url)),
  },
}));

import { proxy } from "@/proxy";

describe("administrator proxy routing", () => {
  it("redirects a guest admin route to the separate login and preserves the return path", async () => {
    const response = await proxy(
      new NextRequest("http://localhost/admin/invitations?status=active"),
    );
    const location = new URL(response.headers.get("location")!);

    expect(location.pathname).toBe("/admin/login");
    expect(location.searchParams.get("next")).toBe("/admin/invitations?status=active");
  });

  it.each(["/admin/login", "/admin/forgot-password", "/admin/reset-password?token=safe"])(
    "leaves the public administrator auth route %s accessible",
    async (path) => {
      const response = await proxy(new NextRequest(`http://localhost${path}`));
      expect(response.status).toBe(200);
      expect(response.headers.get("location")).toBeNull();
    },
  );

  it("continues sending non-admin protected routes to the public login", async () => {
    const response = await proxy(new NextRequest("http://localhost/dashboard?tab=saved"));
    const location = new URL(response.headers.get("location")!);

    expect(location.pathname).toBe("/login");
    expect(location.searchParams.get("next")).toBe("/dashboard?tab=saved");
  });
});
