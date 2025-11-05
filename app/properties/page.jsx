"use client";

import { usePropertiesUI } from "@/hooks/usePropertiesUI";
import PropertyGrid from "@/components/PropertyGrid";
import PropertyMap from "@/components/PropertyMap";
import NoResults from "@/components/NoResults";
import { SpinnerLoading } from "@/components/shared/spinner-loading";

export default function PropertiesPage() {
  const { view, properties, loading, error } = usePropertiesUI();

  if (loading) return <SpinnerLoading message="Loading properties..." />;

  if (error)
    return (
      <div className="text-center py-12">
        <p className="text-red-500">Failed to load properties.</p>
        <p className="text-sm text-muted-foreground mt-2">{error}</p>
      </div>
    );

  if (!properties.length) return <NoResults />;

  return view === "map" ? (
    <PropertyMap properties={properties} />
  ) : (
    <PropertyGrid properties={properties} />
  );
}
