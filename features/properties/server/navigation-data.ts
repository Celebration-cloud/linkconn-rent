import "server-only";

import { PropertyRepository } from "@/repositories/property.repository";
import { mapNavigationTarget } from "@/features/properties/utils/navigation-target";

export async function getPropertyNavigationTarget(propertyId: string) {
  return mapNavigationTarget(await PropertyRepository.findNavigationTarget(propertyId));
}

export async function getPropertyNavigationTargets(propertyIds: string[]) {
  const records = await PropertyRepository.findNavigationTargets(propertyIds);
  return records.flatMap((record) => {
    const target = mapNavigationTarget(record);
    return target ? [target] : [];
  });
}
