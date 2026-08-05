import type { Property } from "@/domain/types/property";
import type { PropertySearchResult } from "@/domain/types/property-search";
import type { PropertySearchInput } from "@/schemas/operating-system";

export function getNormalizedTypes(input: PropertySearchInput) {
  return input.types?.length
    ? input.types
    : input.type
      ? [input.type]
      : [];
}

export function searchFallbackProperties(
  properties: Property[],
  input: PropertySearchInput,
): PropertySearchResult {
  const query = input.q?.toLocaleLowerCase() || "";
  const location = input.location?.toLocaleLowerCase() || "";
  const types = getNormalizedTypes(input).map((type) => type.toLocaleLowerCase());

  const filtered = properties.filter((property) => {
    const searchable = `${property.title} ${property.location} ${property.city} ${property.description}`.toLocaleLowerCase();
    if (query && !searchable.includes(query)) return false;
    if (
      location &&
      !`${property.location} ${property.city}`.toLocaleLowerCase().includes(location)
    ) return false;
    if (types.length && !types.includes(property.type.toLocaleLowerCase())) return false;
    if (input.period && property.period !== input.period) return false;
    if (input.verified !== undefined && property.verified !== input.verified) return false;
    if (input.bedrooms !== undefined && property.bedrooms < input.bedrooms) return false;
    if (input.bathrooms !== undefined && property.bathrooms < input.bathrooms) return false;
    if (input.minPrice !== undefined && property.price < input.minPrice) return false;
    if (input.maxPrice !== undefined && property.price > input.maxPrice) return false;
    if (
      input.amenities?.length &&
      !input.amenities.every((amenity) => property.amenities.includes(amenity))
    ) return false;
    return true;
  });

  filtered.sort((first, second) => {
    if (input.sort === "lowest-rent") return first.price - second.price || first.id.localeCompare(second.id);
    if (input.sort === "highest-rent") return second.price - first.price || first.id.localeCompare(second.id);
    if (input.sort === "newest") return first.id.localeCompare(second.id);
    return (
      Number(second.featured) - Number(first.featured) ||
      Number(second.verified) - Number(first.verified) ||
      second.rating - first.rating ||
      first.id.localeCompare(second.id)
    );
  });

  const pageSize = input.mode === "map" ? 200 : input.pageSize;
  const totalItems = filtered.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const page = input.mode === "map" ? 1 : Math.min(input.page, totalPages);
  const start = (page - 1) * pageSize;

  return {
    items: filtered.slice(start, start + pageSize),
    pagination: {
      page,
      pageSize,
      totalItems,
      totalPages,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    },
  };
}
