type PropertyItem = {
  id: string;
  price: number;
};

type PropertySearchResponse = {
  success: boolean;
  data?: {
    items: PropertyItem[];
    pagination: { totalItems: number; page: number; pageSize: number };
  };
  message: string;
};

type CountResponse = {
  success: boolean;
  data?: { totalItems: number };
  message: string;
};

function validateSuccessfulResponse(body: PropertySearchResponse | CountResponse) {
  return body.success;
}

type Scenario = {
  name: string;
  path: string;
  validate: typeof validateSuccessfulResponse;
};

function hasPropertyItems(
  body: PropertySearchResponse | CountResponse,
): body is PropertySearchResponse & { data: NonNullable<PropertySearchResponse["data"]> } {
  return Boolean(body.data && "items" in body.data);
}

function getTotalItems(body: PropertySearchResponse | CountResponse) {
  if (!body.data) return 0;
  return "items" in body.data ? body.data.pagination.totalItems : body.data.totalItems;
}

const RUNS_PER_SCENARIO = 7;

function percentile(values: number[], ratio: number) {
  const sorted = [...values].sort((first, second) => first - second);
  return sorted[Math.max(0, Math.ceil(sorted.length * ratio) - 1)] ?? 0;
}

function isSorted(items: PropertyItem[], direction: "asc" | "desc") {
  return items.every((item, index) => {
    const previous = items[index - 1];
    if (!previous) return true;
    return direction === "asc" ? previous.price <= item.price : previous.price >= item.price;
  });
}

export async function benchmarkPropertyApi(baseUrl: string) {
  const scenarios: Scenario[] = [
    { name: "recommended", path: "/api/properties?sort=recommended", validate: validateSuccessfulResponse },
    { name: "newest", path: "/api/properties?sort=newest", validate: (body) => body.success },
    {
      name: "lowest-rent",
      path: "/api/properties?sort=lowest-rent",
      validate: (body) => body.success && hasPropertyItems(body) && isSorted(body.data.items, "asc"),
    },
    {
      name: "highest-rent",
      path: "/api/properties?sort=highest-rent",
      validate: (body) => body.success && hasPropertyItems(body) && isSorted(body.data.items, "desc"),
    },
    { name: "keyword", path: "/api/properties?q=Airy", validate: (body) => body.success && getTotalItems(body) > 0 },
    { name: "location", path: "/api/properties?location=Lagos", validate: (body) => body.success },
    { name: "type", path: "/api/properties?types=Apartment", validate: (body) => body.success },
    { name: "multi-type", path: "/api/properties?types=Apartment,Duplex", validate: (body) => body.success },
    { name: "price", path: "/api/properties?minPrice=1000000&maxPrice=5000000", validate: (body) => body.success },
    { name: "bedrooms", path: "/api/properties?bedrooms=4", validate: (body) => body.success },
    { name: "bathrooms", path: "/api/properties?bathrooms=3", validate: (body) => body.success },
    { name: "amenities", path: "/api/properties?amenities=Security,Parking", validate: (body) => body.success },
    { name: "period", path: "/api/properties?period=month", validate: (body) => body.success },
    { name: "verified", path: "/api/properties?verified=true", validate: (body) => body.success },
    { name: "count", path: "/api/properties/count?types=Apartment,Duplex&bathrooms=2", validate: (body) => body.success && getTotalItems(body) > 0 },
    {
      name: "map-bounds",
      path: "/api/properties?mode=map&pageSize=200&north=6.7&south=6.3&east=3.7&west=3.1",
      validate: (body) => body.success && hasPropertyItems(body) && body.data.items.length <= 200,
    },
  ];

  const results = [];
  for (const scenario of scenarios) {
    const durations: number[] = [];
    let correct = true;
    let resultCount = 0;
    for (let run = 0; run < RUNS_PER_SCENARIO; run += 1) {
      const startedAt = performance.now();
      const response = await fetch(new URL(scenario.path, baseUrl), { cache: "no-store" });
      const body = (await response.json()) as PropertySearchResponse | CountResponse;
      durations.push(performance.now() - startedAt);
      correct = correct && response.ok && scenario.validate(body);
      resultCount = getTotalItems(body);
    }
    const sorted = [...durations].sort((first, second) => first - second);
    results.push({
      scenario: scenario.name,
      runs: RUNS_PER_SCENARIO,
      correct,
      resultCount,
      minimumMs: Number((sorted[0] ?? 0).toFixed(1)),
      medianMs: Number(percentile(durations, 0.5).toFixed(1)),
      p95Ms: Number(percentile(durations, 0.95).toFixed(1)),
      maximumMs: Number((sorted.at(-1) ?? 0).toFixed(1)),
    });
  }

  const pages = await Promise.all(
    [1, 2, 3].map(async (page) => {
      const response = await fetch(new URL(`/api/properties?page=${page}&pageSize=12`, baseUrl));
      const body = (await response.json()) as PropertySearchResponse;
      if (!response.ok || !body.success || !body.data) throw new Error(`Unable to load page ${page}`);
      return body.data.items.map((property) => property.id);
    }),
  );
  const flattenedIds = pages.flat();
  const paginationStable = new Set(flattenedIds).size === flattenedIds.length;
  const report = {
    baseUrl,
    generatedAt: new Date().toISOString(),
    pagination: { pages: 3, ids: flattenedIds.length, duplicateFree: paginationStable },
    scenarios: results,
    valid: paginationStable && results.every((result) => result.correct),
  };
  console.log(JSON.stringify(report, null, 2));
  if (!report.valid) throw new Error("One or more property benchmark correctness checks failed");
}
