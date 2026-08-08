import { z } from "zod";

const latitude = z.coerce.number().finite().min(-90).max(90);
const longitude = z.coerce.number().finite().min(-180).max(180);

export const geographicCoordinatesSchema = z.object({
  latitude,
  longitude,
});

export const directionsQuerySchema = z.object({
  originLongitude: longitude,
  originLatitude: latitude,
  destinationLongitude: longitude,
  destinationLatitude: latitude,
});

export const propertyDirectionsSchema = z.object({
  origin: geographicCoordinatesSchema,
  propertyId: z.string().uuid(),
});

export const propertyDistanceMatrixSchema = z.object({
  origin: geographicCoordinatesSchema,
  propertyIds: z.array(z.string().uuid()).min(1).max(4),
});

export type DirectionsQuery = z.infer<typeof directionsQuerySchema>;
export type PropertyDirectionsInput = z.infer<typeof propertyDirectionsSchema>;
