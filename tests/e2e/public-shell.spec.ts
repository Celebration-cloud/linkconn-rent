import { expect, test } from "@playwright/test";

test("guest public shell hides listing actions and exposes valid navigation", async ({
  page,
}) => {
  test.setTimeout(60_000);
  await page.goto("/");
  await expect(page.getByRole("banner")).toBeVisible();

  await expect(
    page.getByRole("link", { name: /list a property/i }),
  ).toHaveCount(0);
  await expect(page.getByText("List a property directly")).toHaveCount(0);
  await expect(page.getByText("List your property")).toHaveCount(0);

  const primaryNavigation = page.getByRole("navigation", {
    name: "Primary navigation",
  });
  const viewport = page.viewportSize();
  if (viewport && viewport.width < 1280) {
    const menuButton = page.getByRole("button", {
      name: "Open navigation menu",
    });
    await menuButton.click();
    await expect(
      page.getByRole("button", { name: "Close navigation menu" }),
    ).toHaveAttribute("aria-expanded", "true");
    const mobileNavigation = page.getByRole("navigation", {
      name: "Mobile navigation",
    });
    await expect(
      mobileNavigation.getByRole("link", { name: "Rent", exact: true }),
    ).toBeVisible();
    await expect(
      mobileNavigation.getByRole("link", { name: "Help", exact: true }),
    ).toBeVisible();

    await Promise.all([
      page.waitForURL(/\/properties\/map$/, { timeout: 30_000 }),
      mobileNavigation
        .getByRole("link", { name: "Map", exact: true })
        .click(),
    ]);
    await expect(
      page.getByRole("button", { name: "Open navigation menu" }),
    ).toHaveAttribute("aria-expanded", "false");
  } else {
    await expect(
      primaryNavigation.getByRole("link", { name: "Rent", exact: true }),
    ).toBeVisible();
    await Promise.all([
      page.waitForURL(/\/properties\/map$/, { timeout: 30_000 }),
      primaryNavigation
        .getByRole("link", { name: "Map", exact: true })
        .click(),
    ]);
    await expect(
      primaryNavigation.getByRole("link", { name: "Map", exact: true }),
    ).toHaveAttribute("aria-current", "page");
    await expect(
      primaryNavigation.getByRole("link", { name: "Rent", exact: true }),
    ).not.toHaveAttribute("aria-current", "page");
  }

  await page.goto("/");
  const footer = page.getByRole("contentinfo");
  await footer.scrollIntoViewIfNeeded();
  await expect(footer).toBeVisible();
  await expect(footer.getByRole("link", { name: "Rentals" })).toHaveAttribute(
    "href",
    "/properties",
  );
  await expect(
    footer.getByRole("link", { name: "Compare homes" }),
  ).toHaveAttribute("href", "/compare");
  await expect(
    footer.getByRole("link", { name: "support@linkconn.rent" }),
  ).toHaveAttribute("href", "mailto:support@linkconn.rent");
  await expect(footer.getByText("Payments secured by Paystack")).toBeVisible();
});
