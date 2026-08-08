import { mkdir } from "node:fs/promises";
import path from "node:path";
import { expect, request, test, type APIRequestContext, type Browser, type BrowserContext, type Page } from "@playwright/test";
import { authE2EPrisma as prisma } from "./support/prisma";
import { assertProfileMirror, assignFixtureRole, setAccountStatus } from "./support/database";
import { requireAuthE2EEnvironment, verifyNeonDatabasePreflight } from "./support/environment";
import { createInbox, waitForVerificationCode } from "./support/mailslurp";
import { AUTH_RESULTS_DIRECTORY, createManifest, readManifest, recordFixture } from "./support/manifest";
import { AUTH_ROLES, type AuthFixtureRecord, type AuthRole } from "./support/types";

const runId = process.env.AUTH_E2E_RUN_ID || "";
const env = requireAuthE2EEnvironment();

function fixtureName(role: AuthRole): string {
  return `linkconn-e2e-${runId}-${role.toLowerCase()}`;
}

function clientIp(role: AuthRole): string {
  return `198.51.100.${AUTH_ROLES.indexOf(role) + 20}`;
}

function headers(role: AuthRole) {
  return { origin: env.baseURL, "x-real-ip": clientIp(role) };
}

async function createRoleRequest(role: AuthRole): Promise<APIRequestContext> {
  return request.newContext({ baseURL: env.baseURL, extraHTTPHeaders: headers(role) });
}

async function profileFrom(context: APIRequestContext): Promise<{ id: string; emailVerified: boolean; role: AuthRole }> {
  const response = await context.get("/api/profile/me");
  expect(response.status()).toBe(200);
  const body = await response.json() as { success: boolean; data: { id: string; emailVerified: boolean; role: AuthRole } };
  expect(body.success).toBe(true);
  return body.data;
}

async function registerPrivileged(role: Exclude<AuthRole, "Tenant" | "Landlord">): Promise<AuthFixtureRecord> {
  const inbox = await createInbox(env.mailSlurpApiKey, fixtureName(role));
  const context = await createRoleRequest(role);
  const signup = await context.post("/api/auth/custom/signup", {
    data: { name: fixtureName(role), email: inbox.emailAddress, password: env.password, callbackURL: "/verify-email", role },
  });
  expect(signup.status()).toBe(200);
  const code = await waitForVerificationCode(env.mailSlurpApiKey, inbox.id);
  const verification = await context.post("/api/auth/custom/verify-email", { data: { email: inbox.emailAddress, otp: code } });
  expect(verification.status()).toBe(200);
  const profile = await profileFrom(context);
  expect(profile.role).toBe("Tenant");
  const userId = await assignFixtureRole(inbox.emailAddress, role);
  expect(userId.toLowerCase()).toBe(profile.id.toLowerCase());
  const storageStatePath = path.join(AUTH_RESULTS_DIRECTORY, `${runId}-${role}.json`);
  await context.storageState({ path: storageStatePath });
  await context.dispose();
  const fixture: AuthFixtureRecord = { runId, role, email: inbox.emailAddress, userId, inboxId: inbox.id, storageStatePath, cleanupStatus: "pending" };
  await recordFixture(runId, fixture);
  return fixture;
}

async function registerPublicRole(browser: Browser, role: "Tenant" | "Landlord"): Promise<AuthFixtureRecord> {
  const inbox = await createInbox(env.mailSlurpApiKey, fixtureName(role));
  const context = await browser.newContext({ baseURL: env.baseURL, extraHTTPHeaders: headers(role) });
  const page = await context.newPage();
  const diagnostics = capturePageFailures(page);
  const plan = role === "Tenant" ? "tenant-standard" : "landlord-standard";
  await page.goto(`/signup?role=${role}&plan=${plan}&billing=annual`);
  await page.getByLabel("Full name").fill(fixtureName(role));
  await page.getByLabel("Email").fill(inbox.emailAddress);
  await page.getByRole("button", { name: role, exact: true }).click();
  await page.getByLabel("Password", { exact: true }).fill(env.password);
  await page.getByLabel("Confirm password").fill(env.password);
  await page.getByRole("button", { name: "Create account" }).click();
  await expect(page).toHaveURL(/\/verify-email/);
  const duplicate = await page.request.post("/api/auth/custom/signup", {
    headers: headers(role),
    data: { name: fixtureName(role), email: inbox.emailAddress, password: env.password, callbackURL: "/verify-email" },
  });
  expect(duplicate.status()).toBe(400);
  expect((await duplicate.json() as { message: string }).message).toBe("Unable to create account with those details");
  const code = await waitForVerificationCode(env.mailSlurpApiKey, inbox.id);
  for (const [index, digit] of [...code].entries()) await page.getByLabel(`Digit ${index + 1}`).fill(digit);
  await page.getByRole("button", { name: "Verify email" }).click();
  await expect(page).toHaveURL(/\/onboarding/);

  await page.getByRole("button", { name: "Continue" }).click();
  await expect(page.getByText("Enter your first name")).toBeVisible();
  await page.getByLabel("First Name").fill("LinkConn");
  await page.getByLabel("Last Name").fill(`E2E${role}`);
  await page.getByLabel("Phone Number").fill("+2348012345678");
  await page.getByLabel(/NIN/).fill(role === "Tenant" ? "12345678901" : "10987654321");
  await page.getByRole("button", { name: "Continue" }).click();

  if (role === "Tenant") {
    await page.getByRole("button", { name: "Lagos", exact: true }).click();
    await page.getByRole("button", { name: "Flat / Apartment", exact: true }).click();
    await page.getByPlaceholder("Min e.g. 50000").fill("100000");
    await page.getByPlaceholder("Max e.g. 200000").fill("1000000");
    await page.getByRole("button", { name: "Continue" }).click();
    await page.getByLabel(/Employer Name/).fill("LinkConn Test");
    await page.getByLabel(/Job Title/).fill("Tester");
    await page.getByRole("button", { name: "Above ₦500,000", exact: true }).click();
  } else {
    await page.getByLabel(/Business \/ Agency Name/).fill(fixtureName(role));
    await page.getByLabel(/Number of Properties You Manage/).fill("2");
    await page.getByRole("button", { name: "Flat / Apartment", exact: true }).click();
    await page.getByRole("button", { name: "Continue" }).click();
    await page.getByRole("button", { name: "Select your bank" }).click();
    await page.getByRole("button", { name: "GTBank", exact: true }).click();
    await page.getByLabel("Account Number").fill("0123456789");
    await page.getByLabel("Account Name").fill("LinkConn Test Landlord");
  }
  await page.getByRole("button", { name: "Submit for Review" }).click();
  await expect(page).toHaveURL(/\/account-review/);
  const profile = await profileFrom(page.request);
  const storageStatePath = path.join(AUTH_RESULTS_DIRECTORY, `${runId}-${role}.json`);
  await context.storageState({ path: storageStatePath });
  diagnostics.assertClean();
  await context.close();
  const fixture: AuthFixtureRecord = { runId, role, email: inbox.emailAddress, userId: profile.id, inboxId: inbox.id, storageStatePath, cleanupStatus: "pending" };
  await recordFixture(runId, fixture);
  return fixture;
}

function onboardingPayload(role: "Tenant" | "Landlord") {
  const personal = { firstName: "LinkConn", lastName: `E2E${role}`, phone: "+2348012345678", nin: role === "Tenant" ? "12345678901" : "10987654321" };
  return role === "Tenant"
    ? { role, personal, preferences: { preferredLocations: ["Lagos"], preferredTypes: ["Flat / Apartment"], budgetMin: 100000, budgetMax: 1000000 }, employment: { employmentType: "Employed", employerName: "LinkConn Test", jobTitle: "Tester", incomeRange: "Above500k" } }
    : { role, personal, business: { businessName: fixtureName(role), propertyCount: 2, propertyTypesOffered: ["Flat / Apartment"] }, payout: { bankName: "GTBank", accountNumber: "0123456789", accountName: "LinkConn Test Landlord" } };
}

async function completeOnboarding(fixture: AuthFixtureRecord): Promise<void> {
  const context = await request.newContext({ baseURL: env.baseURL, storageState: fixture.storageStatePath || undefined, extraHTTPHeaders: headers(fixture.role) });
  const missingOrigin = await request.newContext({ baseURL: env.baseURL, storageState: fixture.storageStatePath || undefined });
  expect((await missingOrigin.post("/api/onboarding/complete", { data: onboardingPayload(fixture.role as "Tenant" | "Landlord") })).status()).toBe(403);
  await missingOrigin.dispose();
  const draft = await context.post("/api/onboarding/draft", { data: { role: fixture.role, currentStep: 0, personal: { firstName: "LinkConn" } } });
  expect(draft.status()).toBe(200);
  for (let attempt = 0; attempt < 2; attempt += 1) {
    const response = await context.post("/api/onboarding/complete", { data: onboardingPayload(fixture.role as "Tenant" | "Landlord") });
    expect(response.status()).toBe(200);
  }
  await context.storageState({ path: fixture.storageStatePath || undefined });
  await context.dispose();
  await assertProfileMirror({ email: fixture.email, userId: fixture.userId!, role: fixture.role, onboardingComplete: true });
  const review = await prisma.verificationSubmission.findFirst({ where: { ownerId: fixture.userId!, type: "Identity" }, orderBy: { createdAt: "desc" } });
  expect(review?.status).toBe("Pending");
}

async function assertRoleAccess(fixture: AuthFixtureRecord): Promise<void> {
  const context = await request.newContext({ baseURL: env.baseURL, storageState: fixture.storageStatePath || undefined, extraHTTPHeaders: headers(fixture.role) });
  const profile = await context.get("/api/profile/me");
  expect(profile.status()).toBe(200);
  const saved = await context.get("/api/saved-properties");
  expect(saved.status()).toBe(fixture.role === "Tenant" ? 200 : 403);
  const admin = await context.get("/api/admin/verifications");
  expect(admin.status()).toBe(["Moderator", "Admin", "SuperAdmin"].includes(fixture.role) ? 200 : 403);
  const moderation = await context.get("/api/admin/moderation");
  expect(moderation.status()).toBe(["Moderator", "Admin", "SuperAdmin"].includes(fixture.role) ? 200 : 403);
  const ownedProperties = await context.get("/api/properties/mine");
  expect(ownedProperties.status()).toBe(["Landlord", "PropertyManager"].includes(fixture.role) ? 200 : 403);
  await context.dispose();
}

function capturePageFailures(page: Page): { assertClean: () => void } {
  const failures: string[] = [];
  page.on("pageerror", (error) => failures.push(`pageerror: ${error.message}`));
  page.on("console", (message) => {
    if (message.type() === "error") failures.push(`console: ${message.text()}`);
  });
  page.on("response", (response) => {
    if (response.status() >= 500) failures.push(`response ${response.status()}: ${response.url()}`);
  });
  return {
    assertClean: () => expect(failures, failures.join("\n")).toEqual([]),
  };
}

async function approvePublicFixturesThroughAdmin(
  browser: Browser,
  admin: AuthFixtureRecord,
  targets: AuthFixtureRecord[]
): Promise<void> {
  const context = await browser.newContext({ baseURL: env.baseURL, storageState: admin.storageStatePath || undefined });
  const page = await context.newPage();
  const diagnostics = capturePageFailures(page);
  for (const target of targets) {
    await page.goto("/admin/verifications");
    const search = page.getByPlaceholder("Search by name, email, case or listing...");
    await search.fill(target.email);
    const result = page.locator("section button").first();
    await expect(result).toBeVisible();
    await result.click();
    await expect(page.getByText(target.email, { exact: true })).toBeVisible();
    await page.getByRole("button", { name: "Assign to me" }).click();
    page.once("dialog", (dialog) => dialog.accept("Verified by auth E2E suite"));
    await page.getByRole("button", { name: "Approve", exact: true }).click();
    await expect(page.getByText(target.email, { exact: true })).toBeHidden();
    const review = await prisma.verificationSubmission.findFirst({
      where: { ownerId: target.userId!, type: "Identity" },
      orderBy: { createdAt: "desc" },
    });
    expect(review?.status).toBe("Approved");
  }
  diagnostics.assertClean();
  await context.close();
}

async function assertDirectRouteAccess(browser: Browser, fixture: AuthFixtureRecord): Promise<void> {
  const context = await browser.newContext({ baseURL: env.baseURL, storageState: fixture.storageStatePath || undefined });
  const page = await context.newPage();
  const diagnostics = capturePageFailures(page);
  const allowedPath = ["Moderator", "Admin", "SuperAdmin"].includes(fixture.role)
    ? "/admin/verifications"
    : "/dashboard";
  await page.goto(allowedPath);
  await expect(page).toHaveURL(new RegExp(`${allowedPath.replaceAll("/", "\\/")}(?:$|\\?)`));

  await page.goto("/dashboard/properties/new");
  if (["Landlord", "PropertyManager"].includes(fixture.role)) {
    await expect(page).toHaveURL(/\/dashboard\/properties\/new/);
  } else {
    await expect(page).toHaveURL(/\/forbidden/);
  }
  diagnostics.assertClean();
  await context.close();
}

test("Guest and all six authenticated roles complete the production auth/security matrix", async ({ browser }) => {
  if (!runId) throw new Error("AUTH_E2E_RUN_ID is required; use npm run test:e2e:auth.");
  await mkdir(AUTH_RESULTS_DIRECTORY, { recursive: true });
  await createManifest(runId);
  await verifyNeonDatabasePreflight();

  const guestBrowser = await browser.newContext({ baseURL: env.baseURL });
  const guestPage = await guestBrowser.newPage();
  const guestDiagnostics = capturePageFailures(guestPage);
  await guestPage.goto("/dashboard");
  await expect(guestPage).toHaveURL(/\/login\?next=%2Fdashboard/);
  const publicResponse = await guestPage.goto("/properties");
  expect(publicResponse?.status()).toBe(200);
  await expect(guestPage.locator("body")).toBeVisible();
  guestDiagnostics.assertClean();
  await guestBrowser.close();

  const guest = await request.newContext({ baseURL: env.baseURL, extraHTTPHeaders: { origin: env.baseURL } });
  expect((await guest.get("/api/profile/me")).status()).toBe(401);
  expect((await guest.get("/api/admin/verifications")).status()).toBe(401);
  expect((await guest.get("/api/saved-properties")).status()).toBe(401);
  const externalCallback = await guest.post("/api/auth/custom/login", { data: { email: "nobody@example.com", password: "invalid-password", callbackURL: "//evil.example" } });
  expect(externalCallback.status()).toBe(400);
  const malformedJson = await guest.post("/api/auth/custom/login", {
    headers: { "content-type": "application/json" },
    data: "{not-json",
  });
  expect(malformedJson.status()).toBe(400);
  const oversized = await guest.post("/api/auth/custom/signup", {
    data: { name: "x".repeat(500), email: "oversized@example.com", password: env.password, callbackURL: "/" },
  });
  expect(oversized.status()).toBe(400);
  const isolated = await request.newContext({ baseURL: env.baseURL, extraHTTPHeaders: { origin: env.baseURL } });
  expect((await isolated.get("/api/profile/me")).status()).toBe(401);
  await isolated.dispose();
  const crossOrigin = await request.newContext({ baseURL: env.baseURL, extraHTTPHeaders: { origin: "https://evil.example" } });
  expect((await crossOrigin.post("/api/auth/custom/signup", { data: {} })).status()).toBe(403);
  await crossOrigin.dispose();
  await guest.dispose();

  const fixtures: AuthFixtureRecord[] = [];
  fixtures.push(await registerPublicRole(browser, "Tenant"));
  fixtures.push(await registerPublicRole(browser, "Landlord"));
  for (const role of ["PropertyManager", "Moderator", "Admin", "SuperAdmin"] as const) fixtures.push(await registerPrivileged(role));

  const enumeration = await createRoleRequest("Tenant");
  const knownReset = await enumeration.post("/api/auth/custom/forgot-password", { data: { email: fixtures[0].email, redirectTo: "/reset-password" } });
  const unknownReset = await enumeration.post("/api/auth/custom/forgot-password", { data: { email: "does-not-exist@example.com", redirectTo: "/reset-password" } });
  expect(knownReset.status()).toBe(200);
  expect(unknownReset.status()).toBe(200);
  expect((await knownReset.json() as { message: string }).message).toBe((await unknownReset.json() as { message: string }).message);
  await enumeration.dispose();
  await completeOnboarding(fixtures[0]);
  await completeOnboarding(fixtures[1]);

  for (const fixture of fixtures.slice(0, 2)) {
    const pendingContext = await browser.newContext({ baseURL: env.baseURL, storageState: fixture.storageStatePath || undefined });
    const pendingPage = await pendingContext.newPage();
    await pendingPage.goto("/dashboard");
    await expect(pendingPage).toHaveURL(/\/account-review/);
    await pendingContext.close();
  }

  for (const fixture of fixtures) {
    await assertProfileMirror({ email: fixture.email, userId: fixture.userId!, role: fixture.role, onboardingComplete: true });
    await assertRoleAccess(fixture);
  }

  const admin = fixtures.find((fixture) => fixture.role === "Admin")!;
  await approvePublicFixturesThroughAdmin(browser, admin, fixtures.slice(0, 2));
  for (const fixture of fixtures) await assertDirectRouteAccess(browser, fixture);

  const tenant = fixtures[0];
  await setAccountStatus(tenant.userId!, "Suspended");
  const suspended = await browser.newContext({ baseURL: env.baseURL, storageState: tenant.storageStatePath || undefined });
  const suspendedPage = await suspended.newPage();
  await suspendedPage.goto("/dashboard");
  await expect(suspendedPage).toHaveURL(/\/forbidden/);
  await suspended.close();
  await setAccountStatus(tenant.userId!, "Active");

  for (const fixture of fixtures) {
    const context = await request.newContext({ baseURL: env.baseURL, storageState: fixture.storageStatePath || undefined, extraHTTPHeaders: headers(fixture.role) });
    const cookiesBeforeLogout = (await context.storageState()).cookies;
    expect(cookiesBeforeLogout.some((cookie) => cookie.httpOnly && ["Lax", "Strict"].includes(cookie.sameSite))).toBe(true);
    const logout = await context.post("/api/auth/sign-out");
    expect(logout.ok()).toBe(true);
    expect((await context.get("/api/profile/me")).status()).toBe(401);
    const login = await context.post("/api/auth/custom/login", { data: { email: fixture.email, password: env.password, callbackURL: "/dashboard" } });
    expect(login.status()).toBe(200);
    await context.storageState({ path: fixture.storageStatePath || undefined });
    await context.dispose();
  }

  const throttled = await request.newContext({
    baseURL: env.baseURL,
    extraHTTPHeaders: { origin: env.baseURL, "x-real-ip": "203.0.113.99" },
  });
  const throttleStatuses: number[] = [];
  for (let attempt = 0; attempt < 6; attempt += 1) {
    const response = await throttled.post("/api/auth/custom/login", {
      headers: { "x-forwarded-for": `192.0.2.${attempt + 1}` },
      data: { email: "enumeration-check@example.com", password: "definitely-wrong", callbackURL: "/" },
    });
    throttleStatuses.push(response.status());
    if (attempt < 5) {
      const body = await response.json() as { message: string };
      expect(body.message).toBe("Invalid email or password");
    }
  }
  expect(throttleStatuses.at(-1)).toBe(429);
  await throttled.dispose();
});

test("@mobile Tenant, Landlord, and privileged navigation retain role boundaries", async ({ browser }) => {
  if (!runId) throw new Error("AUTH_E2E_RUN_ID is required; use npm run test:e2e:auth.");
  const manifest = await readManifest(runId);
  for (const role of ["Tenant", "Landlord", "Admin"] as const) {
    const fixture = manifest.fixtures.find((item) => item.role === role);
    expect(fixture?.storageStatePath).toBeTruthy();
    const context: BrowserContext = await browser.newContext({ baseURL: env.baseURL, storageState: fixture!.storageStatePath! });
    const page: Page = await context.newPage();
    const diagnostics = capturePageFailures(page);
    await page.goto(role === "Admin" ? "/admin" : "/dashboard");
    await expect(page).not.toHaveURL(/\/login/);
    await expect(page.locator("body")).toBeVisible();
    diagnostics.assertClean();
    await context.close();
  }
});

test.afterAll(async () => {
  await prisma.$disconnect();
});
