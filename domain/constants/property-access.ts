import type { AppRole } from "@prisma/client";
import type { Role } from "@/domain/types/auth";

const PROPERTY_LISTING_ROLES = new Set<Role | AppRole>([
  "Landlord",
  "Property Manager",
  "PropertyManager",
]);

export function canListProperties(
  role: Role | AppRole | null | undefined,
): boolean {
  return role ? PROPERTY_LISTING_ROLES.has(role) : false;
}
