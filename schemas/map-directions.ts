import { z } from "zod";

const coordinate = z.coerce.number().finite();

export const directionsQuerySchema = z.object({
  originLongitude: coordinate.min(-180).max(180),
  originLatitude: coordinate.min(-90).max(90),
  destinationLongitude: coordinate.min(-180).max(180),
  destinationLatitude: coordinate.min(-90).max(90),
});

export type DirectionsQuery = z.infer<typeof directionsQuerySchema>;
