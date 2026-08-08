import { expect, test, type Page } from "@playwright/test";

const routePayload = {
  success: true,
  message: "Driving route loaded",
  data: {
    geometry: {
      type: "LineString",
      coordinates: [[3.35, 6.52], [3.37, 6.51], [3.39, 6.5]],
    },
    origin: [3.35, 6.52],
    destination: [3.39, 6.5],
    distanceMetres: 5_200,
    durationSeconds: 900,
    steps: [
      {
        instruction: "Continue on Herbert Macaulay Way",
        maneuverType: "continue",
        modifier: "straight",
        roadName: "Herbert Macaulay Way",
        location: [3.35, 6.52],
        distanceMetres: 4_000,
        durationSeconds: 700,
      },
      {
        instruction: "Turn right onto University Road",
        maneuverType: "turn",
        modifier: "right",
        roadName: "University Road",
        location: [3.38, 6.505],
        distanceMetres: 1_200,
        durationSeconds: 200,
      },
    ],
  },
};

async function mockNavigation(page: Page) {
  await page.route("**/api/maps/directions", (route) => route.fulfill({
    contentType: "application/json",
    body: JSON.stringify(routePayload),
  }));
  await page.route("**/api/maps/distances", async (route) => {
    const body = route.request().postDataJSON() as { propertyIds: string[] };
    await route.fulfill({
      contentType: "application/json",
      body: JSON.stringify({
        success: true,
        message: "Driving distances loaded",
        data: body.propertyIds.map((propertyId, index) => ({
          propertyId,
          distanceMetres: 3_000 + index * 2_000,
          durationSeconds: 600 + index * 300,
        })),
      }),
    });
  });
}

async function propertyLinks(page: Page) {
  await page.goto("/properties", { waitUntil: "domcontentloaded" });
  const apiLinks = await page.evaluate(async () => {
    const response = await fetch("/api/properties?page=1&pageSize=2");
    const envelope = await response.json() as { data?: { items?: Array<{ id: string }> } };
    return (envelope.data?.items ?? []).map((property) => `/properties/${property.id}`);
  });
  if (apiLinks.length >= 2) return apiLinks;
  const links = await page.locator('a[href^="/properties/"]').evaluateAll((elements) =>
    [...new Set(elements.map((element) => (element as HTMLAnchorElement).getAttribute("href")).filter((href): href is string => Boolean(href) && !href!.includes("/map")))],
  );
  return links;
}

test("property detail provides permission-driven exact live directions", async ({ context, page }) => {
  test.setTimeout(120_000);
  await context.grantPermissions(["geolocation"]);
  await context.setGeolocation({ longitude: 3.1, latitude: 10.5 });
  await mockNavigation(page);
  const links = await propertyLinks(page);
  test.skip(!links[0], "The configured database has no public property fixture.");
  await page.goto(links[0], { waitUntil: "domcontentloaded" });
  await expect(page.getByRole("heading", { name: "Location and directions" })).toBeVisible();
  await page.getByRole("button", { name: "Start directions" }).click();
  await expect(page.locator('[data-directions-state="tracking"]')).toBeVisible();
  await expect(page.getByText("5.2 km")).toBeVisible();
  await expect(page.getByText("Continue on Herbert Macaulay Way")).toBeVisible();
  await expect(page.getByRole("status")).toContainText(/route|location/i);
});

test("comparison exposes expanded facts, shared map, distance, and differences mode", async ({ context, page }) => {
  test.setTimeout(120_000);
  await context.grantPermissions(["geolocation"]);
  await context.setGeolocation({ longitude: 3.1, latitude: 10.5 });
  await mockNavigation(page);
  const links = await propertyLinks(page);
  test.skip(links.length < 2, "The configured database needs two public property fixtures.");
  const ids = links.slice(0, 2).map((href) => href.split("/")[2].split("?")[0]);
  await page.goto(`/compare?properties=${ids.join(",")}`, { waitUntil: "domcontentloaded" });
  await expect(page.getByText("Cost", { exact: true })).toBeVisible();
  await expect(page.getByText("Space", { exact: true })).toBeVisible();
  await expect(page.getByText("Trust and listing", { exact: true })).toBeVisible();
  await expect(page.getByText("Amenities", { exact: true })).toBeVisible();
  await expect(page.locator(".leaflet-container")).toBeVisible({ timeout: 30_000 });
  await page.getByRole("button", { name: "Use my location" }).click();
  await expect(page.getByText("3.0 km")).toBeVisible();
  await page.getByLabel("Show differences only").check();
  await expect(page.getByLabel("Show differences only")).toBeChecked();
  await expect(page.getByRole("status")).toContainText(/route|location/i);
});
