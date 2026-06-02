"use client";

import { useSelector } from "react-redux";
import dynamic from "next/dynamic";

import { usePropertiesUI } from "@/hooks/usePropertiesUI";
import PropertyGrid from "@/components/PropertyGrid";
const PropertyMap = dynamic(() => import("@/components/PropertyMap"), {
  ssr: false,
});

import NoResults from "@/components/NoResults";
import { SpinnerLoading } from "@/components/shared/spinner-loading";

export default function PropertiesPage() {
  const { loading, error } = usePropertiesUI();
  const { properties, view } = useSelector((state) => state.properties);

  console.log("properties on page:", properties);

  if (loading) return <SpinnerLoading message="Loading properties..." />;

  if (error)
    return (
      <div className="text-center py-12">
        <p className="text-red-500">Failed to load properties.</p>
        <p className="text-sm text-muted-foreground mt-2">{error}</p>
      </div>
    );

  if (!properties?.length) return <NoResults />;

  return view === "map" ? (
    <PropertyMap properties={properties} />
  ) : (
    <PropertyGrid />
  );
}
