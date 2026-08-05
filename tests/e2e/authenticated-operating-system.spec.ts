import { expect, test, type Page } from "@playwright/test";

const tenantEmail = process.env.E2E_TENANT_EMAIL;
const tenantPassword = process.env.E2E_TENANT_PASSWORD;
const landlordEmail = process.env.E2E_LANDLORD_EMAIL;
const landlordPassword = process.env.E2E_LANDLORD_PASSWORD;
const adminEmail = process.env.E2E_ADMIN_EMAIL;
const adminPassword = process.env.E2E_ADMIN_PASSWORD;

async function signIn(page: Page, email: string, password: string) {
  await page.goto("/login");
  await page.getByLabel(/email/i).fill(email);
  await page.getByLabel(/password/i).fill(password);
  await page.getByRole("button", { name: /sign in/i }).click();
  await page.waitForURL(/\/(dashboard|onboarding)/);
}

test("tenant dashboard, messages, and verification routes", async ({ page }) => {
  test.skip(!tenantEmail || !tenantPassword, "Set tenant E2E credentials");
  await signIn(page, tenantEmail!, tenantPassword!);
  await page.goto("/dashboard");
  await expect(page.getByText(/saved homes|active applications/i).first()).toBeVisible();
  await page.goto("/messages");
  await expect(page.getByRole("heading", { name: "Messages" })).toBeVisible();
});

test("landlord listing and applicant decision surfaces", async ({ page }) => {
  test.skip(!landlordEmail || !landlordPassword, "Set landlord E2E credentials");
  await signIn(page, landlordEmail!, landlordPassword!);
  await page.goto("/dashboard/properties/new/fees");
  await expect(page.getByRole("heading", { name: /rent & fees/i })).toBeVisible();
  await page.goto("/dashboard/applicants");
  await expect(page.getByRole("heading", { name: /manage applicants/i })).toBeVisible();
});

test("mobile tenant maintenance and disabled identity upload", async ({ page }) => {
  test.skip(!tenantEmail || !tenantPassword, "Set tenant E2E credentials");
  await page.setViewportSize({ width: 390, height: 844 });
  await signIn(page, tenantEmail!, tenantPassword!);
  await page.goto("/dashboard/maintenance");
  await expect(page.getByRole("heading", { name: /maintenance/i }).first()).toBeVisible();
  await page.goto("/verification/identity");
  await expect(page.getByText(/document upload unavailable/i)).toBeVisible();
  await expect(page.getByRole("button", { name: /submit verification/i })).toBeDisabled();
});

test("landlord property portfolio and full listing wizard", async ({ page }) => {
  test.skip(!landlordEmail || !landlordPassword, "Set landlord E2E credentials");
  await signIn(page, landlordEmail!, landlordPassword!);
  await page.goto("/dashboard/properties");
  await expect(page.getByRole("heading", { name: /my properties/i })).toBeVisible();
  await page.goto("/dashboard/properties/new");
  await expect(page.getByRole("heading", { name: /details/i })).toBeVisible();
});

test("admin verification, dispute, and moderation centers", async ({ page }) => {
  test.skip(!adminEmail || !adminPassword, "Set admin E2E credentials");
  await signIn(page, adminEmail!, adminPassword!);
  for (const [path, heading] of [
    ["/admin/verifications", /verification queue/i],
    ["/admin/disputes", /fraud & dispute center/i],
    ["/admin/moderation", /platform moderation/i],
  ] as const) {
    await page.goto(path);
    await expect(page.getByRole("heading", { name: heading })).toBeVisible();
  }
});
