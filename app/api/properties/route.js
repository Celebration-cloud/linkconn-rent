import { siteConfig } from "@/config/site";
import { NextResponse } from "next/server";
import { MOCK } from "./mock";

export async function GET(req) {
  try {
    const url = new URL(req.url);

    // Text search
    const q = url.searchParams.get("q")?.toLowerCase() || "";

    // Exact matches / multiple options
    const type = url.searchParams.get("type") || "";
    const category = url.searchParams.get("category") || "";
    const purpose = url.searchParams.get("purpose") || "";
    const status = url.searchParams.get("status") || "";
    const kitchen = url.searchParams.get("kitchen")?.toLowerCase() || "";
    const toilet = url.searchParams.get("toilet")?.toLowerCase() || "";

    // Allow multiple amenities separated by comma
    const amenitiesParam =
      url.searchParams.get("amenities")?.toLowerCase() || "";
    const amenities = amenitiesParam ? amenitiesParam.split(",") : [];

    // Allow multiple cities/states
    const citiesParam = url.searchParams.get("cities")?.toLowerCase() || "";
    const cities = citiesParam ? citiesParam.split(",") : [];
    const statesParam = url.searchParams.get("states")?.toLowerCase() || "";
    const states = statesParam ? statesParam.split(",") : [];

    // Boolean filters
    const verified = url.searchParams.get("verified") === "1";

    // Numeric ranges
    const minBeds = Number(url.searchParams.get("minBeds") || 0);
    const maxBeds = Number(url.searchParams.get("maxBeds") || 1e12);
    const minBaths = Number(url.searchParams.get("minBaths") || 0);
    const maxBaths = Number(url.searchParams.get("maxBaths") || 1e12);
    const minSize = Number(url.searchParams.get("minSize") || 0);
    const maxSize = Number(url.searchParams.get("maxSize") || 1e12);
    const minPrice = Number(url.searchParams.get("minPrice") || 0);
    const maxPrice = Number(url.searchParams.get("maxPrice") || 1e12);
    const minFloor = Number(url.searchParams.get("minFloor") || 0);
    const maxFloor = Number(url.searchParams.get("maxFloor") || 1e12);
    const minFavorites = Number(url.searchParams.get("minFavorites") || 0);
    const maxFavorites = Number(url.searchParams.get("maxFavorites") || 1e12);

    // Sorting
    const sort = url.searchParams.get("sort") || ""; // e.g., price_asc, size_desc, newest

    // Pagination
    const page = Number(url.searchParams.get("page") || 1);
    const limit = Number(url.searchParams.get("limit") || 6);

    let results = [...MOCK];

    // Global text search
    if (q) {
      results = results.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.address.toLowerCase().includes(q) ||
          p.city.toLowerCase().includes(q) ||
          p.state.toLowerCase().includes(q) ||
          (p.type && p.type.toLowerCase().includes(q)) ||
          (p.category && p.category.toLowerCase().includes(q))
      );
    }

    // Exact filters
    if (type) results = results.filter((p) => p.type === type);
    if (category) results = results.filter((p) => p.category === category);
    if (purpose) results = results.filter((p) => p.purpose === purpose);
    if (status) results = results.filter((p) => p.status === status);
    if (kitchen)
      results = results.filter(
        (p) => p.kitchen_type?.toLowerCase() === kitchen
      );
    if (toilet)
      results = results.filter((p) => p.toilet_type?.toLowerCase() === toilet);
    if (verified) results = results.filter((p) => p.verified);

    // Multi-value filters
    if (amenities.length) {
      results = results.filter((p) =>
        amenities.every((a) =>
          p.amenities.map((x) => x.toLowerCase()).includes(a)
        )
      );
    }
    if (cities.length)
      results = results.filter((p) => cities.includes(p.city.toLowerCase()));
    if (states.length)
      results = results.filter((p) => states.includes(p.state.toLowerCase()));

    // Numeric filters
    results = results.filter(
      (p) =>
        p.price >= minPrice &&
        p.price <= maxPrice &&
        p.size >= minSize &&
        p.size <= maxSize &&
        p.beds >= minBeds &&
        p.beds <= maxBeds &&
        p.baths >= minBaths &&
        p.baths <= maxBaths &&
        p.floor_level >= minFloor &&
        p.floor_level <= maxFloor &&
        p.favorites >= minFavorites &&
        p.favorites <= maxFavorites
    );

    // Sorting
    if (sort) {
      const [key, order] = sort.split("_"); // e.g., price_asc
      results.sort((a, b) => {
        if (!a[key] || !b[key]) return 0;
        if (order === "asc") return a[key] - b[key];
        if (order === "desc") return b[key] - a[key];
        return 0;
      });
    }

    // Pagination
    const total = results.length;
    const totalPages = Math.ceil(total / limit);
    const start = (page - 1) * limit;
    const paginated = results.slice(start, start + limit);

    return NextResponse.json({
      data: paginated,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
