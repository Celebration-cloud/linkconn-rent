export const propertyCacheTags = {
  all: "properties",
  featured: "properties:featured",
  detail: (propertyId: string) => `property:${propertyId}`,
} as const;
