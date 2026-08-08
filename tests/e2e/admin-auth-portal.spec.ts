import { expect, test } from "@playwright/test";

test("guest admin routes use the separate login and preserve the return path", async ({ page }) => {
  await page.goto("/admin/invitations?status=active");

  await expect(page).toHaveURL(/\/admin\/login\?next=/);
  const url = new URL(page.url());
  expect(url.searchParams.get("next")).toBe("/admin/invitations?status=active");
  await expect(page.getByRole("heading", { name: "Sign in to the admin portal" })).toBeVisible();
  await expect(page.getByRole("link", { name: /create/i })).toHaveCount(0);
});

test("administrator login submits the admin portal discriminator", async ({ page }) => {
  let submittedBody: Record<string, unknown> | null = null;
  await page.route("**/api/auth/custom/login", async (route) => {
    submittedBody = route.request().postDataJSON() as Record<string, unknown>;
    await route.fulfill({
      status: 403,
      contentType: "application/json",
      body: JSON.stringify({
        success: false,
        data: null,
        message: "Invalid credentials or administrator access is unavailable.",
      }),
    });
  });

  await page.goto("/admin/login?next=%2Fadmin%2Finvitations");
  await page.getByLabel("Email address").fill("admin@example.com");
  await page.getByLabel("Password").fill("correct-password");
  await page.getByRole("button", { name: "Sign in" }).click();

  await expect(page.getByRole("alert").filter({ hasText: "administrator access is unavailable" })).toBeVisible();
  expect(submittedBody).toMatchObject({
    portal: "admin",
    callbackURL: "/admin/invitations",
  });
  await expect(page.getByRole("button", { name: "Reset password" })).toBeVisible();
});

test("administrator password recovery stays inside the admin portal", async ({ page }) => {
  let submittedBody: Record<string, unknown> | null = null;
  await page.route("**/api/auth/custom/forgot-password", async (route) => {
    submittedBody = route.request().postDataJSON() as Record<string, unknown>;
    await route.fulfill({
      contentType: "application/json",
      body: JSON.stringify({
        success: true,
        data: null,
        message: "If an account exists for that email, a reset link will be sent.",
      }),
    });
  });

  await page.goto("/admin/forgot-password");
  await page.getByLabel("Email").fill("admin@example.com");
  await page.getByRole("button", { name: "Send reset link" }).click();

  await expect(page.getByText("Check your inbox for the reset link.")).toBeVisible();
  expect(submittedBody).toMatchObject({
    portal: "admin",
    redirectTo: "/admin/reset-password?next=%2Fadmin%2Flogin",
  });
  await expect(page.getByRole("link", { name: "Return to administrator sign in" })).toHaveAttribute(
    "href",
    "/admin/login",
  );
});
