import { z } from "zod";

const coordinate = z.coerce.number().finite();

export const buildingsQuerySchema = z.object({
  latitude: coordinate.min(-90).max(90),
  longitude: coordinate.min(-180).max(180),
  radius: z.coerce.number().int().min(50).max(400).default(300),
});

export type BuildingsQuery = z.infer<typeof buildingsQuerySchema>;

export type BuildingFeature = {
  type: "Feature";
  id: string;
  geometry: {
    type: "Polygon";
    coordinates: [number, number][][];
  };
  properties: {
    osmId: number;
    heightMetres: number;
  };
};

export type BuildingFeatureCollection = {
  type: "FeatureCollection";
  features: BuildingFeature[];
};
