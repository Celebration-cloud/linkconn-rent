import { expect, test } from "@playwright/test";

test.describe("500-property load dataset", () => {
  test.skip(
    process.env.E2E_LOAD_TEST_DATASET !== "true",
    "Set E2E_LOAD_TEST_DATASET=true after seeding live-properties-500-v1.",
  );

  test("catalogue pagination, filters, sorting, and map remain correct", async ({ request }) => {
    const pages = await Promise.all(
      [1, 2, 3].map(async (page) => {
        const response = await request.get(`/api/properties?page=${page}&pageSize=12&sort=newest`);
        expect(response.ok()).toBe(true);
        const body = await response.json();
        expect(body.success).toBe(true);
        expect(body.data.items).toHaveLength(12);
        return body.data.items as Array<{ id: string; price: number }>;
      }),
    );
    const ids = pages.flat().map((property) => property.id);
    expect(new Set(ids).size).toBe(ids.length);

    const filtered = await request.get(
      "/api/properties?types=Apartment,Duplex&amenities=Security,Parking&verified=true&pageSize=12",
    );
    expect(filtered.ok()).toBe(true);
    const filteredBody = await filtered.json();
    expect(filteredBody.success).toBe(true);
    expect(filteredBody.data.pagination.totalItems).toBeGreaterThan(0);

    const ascending = await request.get("/api/properties?sort=lowest-rent&pageSize=12");
    const ascendingBody = await ascending.json();
    const prices = (ascendingBody.data.items as Array<{ price: number }>).map((property) => property.price);
    expect(prices).toEqual([...prices].sort((first, second) => first - second));

    const map = await request.get(
      "/api/properties?mode=map&north=6.7&south=6.3&east=3.7&west=3.1",
    );
    const mapBody = await map.json();
    expect(map.ok()).toBe(true);
    expect(mapBody.data.items.length).toBeLessThanOrEqual(200);
  });
});
