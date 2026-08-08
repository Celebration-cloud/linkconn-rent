import { expect, test } from "@playwright/test";

test("login waits for review resolution and never requests dashboard for a pending account", async ({
  page,
}) => {
  const dashboardRequests: string[] = [];
  page.on("request", (request) => {
    const url = new URL(request.url());
    if (url.pathname.startsWith("/dashboard")) dashboardRequests.push(request.url());
  });

  const session = {
    user: {
      id: "pending-login-user",
      name: "Pending Tenant",
      email: "pending@example.com",
      emailVerified: true,
      image: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    session: {
      id: "pending-session",
      token: "test-session-token",
      userId: "pending-login-user",
      expiresAt: new Date(Date.now() + 3_600_000).toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  };

  await page.route("**/api/auth/get-session**", (route) =>
    route.fulfill({ contentType: "application/json", body: JSON.stringify(session) }),
  );
  await page.route("**/api/profile/me**", (route) =>
    route.fulfill({
      contentType: "application/json",
      body: JSON.stringify({
        success: true,
        data: {
          id: session.user.id,
          role: "Tenant",
          firstName: "Pending",
          lastName: "Tenant",
          onboardingComplete: true,
          accountReviewStatus: "Pending",
          verificationLevel: "Unverified",
        },
      }),
    }),
  );
  await page.route("**/api/auth/custom/login", async (route) => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    await route.fulfill({
      contentType: "application/json",
      body: JSON.stringify({
        success: true,
        message: "Signed in successfully",
        data: { user: session.user, url: "/account-review" },
      }),
    });
  });

  await page.goto("/login");
  await page.getByLabel("Email address").fill("pending@example.com");
  await page.getByLabel("Password").fill("correct-password");
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(
    page.getByRole("button", { name: "Signing in and checking account…" }),
  ).toBeDisabled();
  await expect(page).toHaveURL(/\/account-review$/);
  await expect(
    page.getByRole("heading", { name: /profile is in the review queue/i }),
  ).toBeVisible();
  expect(dashboardRequests).toEqual([]);
});
