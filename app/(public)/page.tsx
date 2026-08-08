import { PublicHome } from "@/components/stitch/public-home";
import { getFeaturedProperties } from "@/features/properties/server/public-property-data";

export default async function PublicHomePage() {
  const properties = await getFeaturedProperties();
  return <PublicHome properties={properties} />;
}
