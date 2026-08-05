import { expect, test } from "@playwright/test";

test("search, labelled 2.5D map, directions, and details stay connected", async ({
  context,
  page,
}) => {
  test.setTimeout(120_000);
  await context.grantPermissions(["geolocation"]);
  await context.setGeolocation({ longitude: 3.35, latitude: 6.52 });
  await page.route("**/api/maps/directions?**", async (route) => {
    await route.fulfill({
      contentType: "application/json",
      body: JSON.stringify({
        success: true,
        message: "Driving route loaded",
        data: {
          geometry: {
            type: "LineString",
            coordinates: [
              [3.35, 6.52],
              [3.37, 6.51],
              [3.391234, 6.501234],
            ],
          },
          distanceMetres: 5200,
          durationSeconds: 900,
        },
      }),
    });
  });
  await page.route("**/api/maps/buildings?**", async (route) => {
    const requestUrl = new URL(route.request().url());
    const latitude = Number(requestUrl.searchParams.get("latitude"));
    const longitude = Number(requestUrl.searchParams.get("longitude"));
    await route.fulfill({
      contentType: "application/json",
      body: JSON.stringify({
        success: true,
        message: "Building detail loaded",
        data: {
          type: "FeatureCollection",
          features: [
            {
              type: "Feature",
              id: "way-browser-check",
              geometry: {
                type: "Polygon",
                coordinates: [
                  [
                    [longitude - 0.0002, latitude - 0.0002],
                    [longitude + 0.0002, latitude - 0.0002],
                    [longitude + 0.0002, latitude + 0.0002],
                    [longitude - 0.0002, latitude - 0.0002],
                  ],
                ],
              },
              properties: { osmId: 101, heightMetres: 12 },
            },
          ],
        },
      }),
    });
  });
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "Rent directly",
  );
  await page.goto("/properties", { waitUntil: "domcontentloaded" });
  await expect(page).toHaveURL(/\/properties/, { timeout: 15_000 });
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();

  await page.goto("/properties/map", { waitUntil: "domcontentloaded" });
  await expect(page.locator(".leaflet-container")).toBeVisible({
    timeout: 30_000,
  });
  await expect(page.locator('[data-map-status="ready"]')).toHaveText(
    "Map ready",
    { timeout: 30_000 },
  );
  await expect(page.locator(".linkconn-cluster-marker").first()).toBeVisible();
  await expect(page.locator(".linkconn-property-marker").first()).toBeVisible();
  await expect(page.locator(".leaflet-control-attribution")).toBeAttached();
  await expect(
    page.getByRole("button", { name: "Toggle 2.5D buildings" }),
  ).toHaveAttribute("aria-pressed", "true");
  await page.locator(".linkconn-property-marker").first().click();
  await expect(
    page.locator(".leaflet-building-roof-pane path").first(),
  ).toBeVisible();
  await expect(
    page.getByRole("button", {
      name: "Directions from my location",
    }),
  ).toHaveCount(2);
  await page
    .getByRole("button", {
      name: "Directions from my location",
    })
    .filter({ hasText: "Directions from my location" })
    .click();
  await expect(
    page.getByRole("heading", {
      name: "Use your location for live directions?",
    }),
  ).toBeVisible();
  await expect(page.getByText(/it is not saved or shared/i)).toBeVisible();
  await page.getByRole("button", { name: "Allow location" }).click();
  await expect(page.getByText(/5\.2 km/)).toBeVisible();
  await expect(page.getByText("Live location on")).toBeVisible();
  await expect(
    page.getByRole("tooltip", {
      name: /your live location · accurate to about/i,
    }),
  ).toBeVisible();
  await expect(page.getByText(/browser accuracy: ±/i)).toBeVisible();
  await expect(
    page.getByText(/public approximate property pin/i),
  ).toBeVisible();

  await expect(page.getByText("Search this area")).toBeVisible();
});

test("mobile map and list remain keyboard-accessible", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/properties/map", { waitUntil: "domcontentloaded" });
  await expect(page.locator('[data-map-status="ready"]')).toHaveText(
    "Map ready",
    { timeout: 30_000 },
  );
  await page.getByRole("button", { name: "list", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Homes across Nigeria" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "map", exact: true }).click();
  await expect(page.locator(".leaflet-container")).toBeVisible();
});

test("property discovery keeps search and staged mobile filters in the URL", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/properties", { waitUntil: "domcontentloaded" });

  const search = page.getByRole("textbox", { name: "Search properties" });
  await search.fill("Yaba studio");
  await search.press("Enter");
  await expect(page).toHaveURL(/q=Yaba(?:\+|%20)studio/);
  await expect(page.getByRole("button", { name: /“Yaba studio”/ })).toBeVisible();

  await page.getByRole("button", { name: /More filters/ }).click();
  const filters = page.getByRole("dialog", { name: "More property filters" });
  await filters.getByLabel("Minimum rent").fill("500000");
  await expect(page).not.toHaveURL(/minPrice/);
  await filters.getByRole("button", { name: "Show results" }).click();
  await expect(page).toHaveURL(/minPrice=500000/);
  await expect(page.getByRole("button", { name: /From ₦500K/ })).toBeVisible();
});

test("Leaflet map remains usable at acceptance viewports", async (
  { page },
  testInfo,
) => {
  test.skip(
    testInfo.project.name !== "desktop",
    "One browser project covers the explicit viewport matrix.",
  );
  test.setTimeout(120_000);

  for (const viewport of [
    { width: 390, height: 844 },
    { width: 1024, height: 768 },
    { width: 1440, height: 900 },
  ]) {
    await page.setViewportSize(viewport);
    await page.goto("/properties/map", { waitUntil: "domcontentloaded" });
    await expect(page.locator('[data-map-status="ready"]')).toHaveText(
      "Map ready",
      { timeout: 30_000 },
    );
    await expect(page.locator(".leaflet-container")).toBeVisible();
    await expect(page.locator(".leaflet-control-attribution")).toBeAttached();
    await expect(
      page.getByRole("button", { name: "Toggle 2.5D buildings" }),
    ).toBeVisible();
  }
});

test("tile failure keeps the property-list recovery available", async ({
  page,
}) => {
  await page.route("**/*", async (route) => {
    if (route.request().url().includes("tile.openstreetmap.org")) {
      await route.abort("failed");
      return;
    }
    await route.continue();
  });
  await page.goto("/properties/map", { waitUntil: "domcontentloaded" });
  await expect(page.locator('[data-map-status="error"]')).toHaveText(
    "Map unavailable",
    { timeout: 30_000 },
  );
  await expect(
    page.getByRole("heading", { name: "The live map is unavailable" }),
  ).toBeVisible();
  await expect(page.getByText(/keep browsing the full property list/i)).toBeVisible();
});

test("live directions requests location permission and denial leaves map usable", async ({
  context,
  page,
}) => {
  test.setTimeout(120_000);
  await context.clearPermissions();
  await page.goto("/properties/map", { waitUntil: "domcontentloaded" });
  await expect(page.locator(".leaflet-container")).toBeVisible({
    timeout: 30_000,
  });
  await page.evaluate(() => {
    const deniedError = {
      code: 1,
      message: "User denied Geolocation",
      PERMISSION_DENIED: 1,
      POSITION_UNAVAILABLE: 2,
      TIMEOUT: 3,
    } as GeolocationPositionError;
    Object.defineProperty(navigator, "geolocation", {
      configurable: true,
      value: {
        getCurrentPosition: (
          _success: PositionCallback,
          error?: PositionErrorCallback,
        ) => error?.(deniedError),
        watchPosition: (
          _success: PositionCallback,
          error?: PositionErrorCallback,
        ) => {
          error?.(deniedError);
          return 1;
        },
        clearWatch: () => undefined,
      },
    });
  });
  await page
    .getByRole("button", { name: "Directions from my location" })
    .filter({ hasText: "Directions from my location" })
    .click();
  await expect(
    page.getByRole("heading", {
      name: "Use your location for live directions?",
    }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Allow location" }).click();
  await expect(
    page.getByRole("alert").filter({ hasText: /location permission was denied/i }),
  ).toBeVisible();
  await expect(page.locator('[data-location-permission="denied"]')).toBeAttached();
  await expect(
    page.getByRole("heading", { name: "Homes across Nigeria" }),
  ).toBeVisible();
});

test("email and password are the only sign-in options", async ({ page }) => {
  await page.goto("/login");
  await expect(page.getByLabel(/email/i)).toBeVisible();
  await expect(page.getByLabel(/password/i)).toBeVisible();
  await expect(page.getByText(/google|passkey/i)).toHaveCount(0);
});

test("signup exposes role before account creation", async ({ page }) => {
  await page.goto("/signup");
  await expect(page.getByText(/tenant|landlord/i).first()).toBeVisible();
});

test("an incomplete signed-in account can browse public pages without forced onboarding", async ({
  page,
}) => {
  await page.route("**/api/auth/get-session**", async (route) => {
    await route.fulfill({
      contentType: "application/json",
      body: JSON.stringify({
        user: {
          id: "tenant-incomplete",
          name: "Chidi Okafor",
          email: "tenant@example.com",
          emailVerified: true,
          image: null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        session: {
          id: "session-incomplete",
          token: "test-session-token",
          userId: "tenant-incomplete",
          expiresAt: new Date(Date.now() + 3_600_000).toISOString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      }),
    });
  });
  await page.route("**/api/profile/me**", async (route) => {
    await route.fulfill({
      contentType: "application/json",
      body: JSON.stringify({
        success: true,
        data: {
          id: "tenant-incomplete",
          role: "Tenant",
          firstName: "Chidi",
          lastName: "Okafor",
          onboardingComplete: false,
          accountReviewStatus: "NotSubmitted",
          verificationLevel: "Unverified",
        },
      }),
    });
  });

  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "Rent directly",
  );
  await expect(page).toHaveURL("/");
  await page.waitForTimeout(750);
  await expect(page).toHaveURL("/");
});

test("pending account sees review page and logout closes the remote session", async ({
  page,
}) => {
  let signOutRequests = 0;
  await page.route("**/api/auth/get-session**", async (route) => {
    await route.fulfill({
      contentType: "application/json",
      body: JSON.stringify({
        user: {
          id: "tenant-review",
          name: "Chidi Okafor",
          email: "tenant@example.com",
          emailVerified: true,
          image: null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        session: {
          id: "session-review",
          token: "test-session-token",
          userId: "tenant-review",
          expiresAt: new Date(Date.now() + 3_600_000).toISOString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      }),
    });
  });
  await page.route("**/api/profile/me**", async (route) => {
    await route.fulfill({
      contentType: "application/json",
      body: JSON.stringify({
        success: true,
        data: {
          id: "tenant-review",
          role: "Tenant",
          firstName: "Chidi",
          lastName: "Okafor",
          onboardingComplete: true,
          accountReviewStatus: "Pending",
          verificationLevel: "Unverified",
        },
      }),
    });
  });
  await page.route("**/api/auth/sign-out**", async (route) => {
    signOutRequests += 1;
    await route.fulfill({
      contentType: "application/json",
      body: JSON.stringify({ success: true }),
    });
  });

  await page.goto("/account-review");
  await expect(
    page.getByRole("heading", { name: /profile is in the review queue/i }),
  ).toBeVisible();
  await expect(page.getByText(/administrator will check/i)).toBeVisible();

  await page.getByRole("button", { name: /sign out/i }).click();
  await expect(page).toHaveURL("/login");
  expect(signOutRequests).toBe(1);
});

test("mobile no-results recovery keeps filters usable", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/properties?location=DefinitelyNowhere&verified=true");
  await expect(page.getByRole("heading", { name: /no matching homes yet/i })).toBeVisible();
  await page.getByRole("button", { name: /clear filters/i }).click();
  await expect(page).toHaveURL(/\/properties$/);
});
