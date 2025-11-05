"use client";

import PropertyCard from "./PropertyCard";
import { Pagination } from "@heroui/react";
import { SpinnerLoading } from "./shared/spinner-loading";
import { usePropertiesUI } from "@/hooks/usePropertiesUI";

export default function PropertyGrid({ properties = [] }) {
  const { loading, error, page, setPage, totalPages } = usePropertiesUI();

  if (loading) return <SpinnerLoading message="Loading properties..." />;
  // if (error) return <p>Error: {error}</p>;

  // Trigger Next.js not-found route if there are no properties
  if (!properties.length) return <NoResults />;

  return (
    <div className="space-y-8 py-6">
      {/* Property Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {properties.map((p) => (
          <PropertyCard key={p.id} property={p} />
        ))}
      </div>

      {/* Pagination */}
      {totalPages >= 1 && (
        <div className="flex justify-center">
          <Pagination
            page={page}
            total={totalPages}
            onChange={setPage}
            showControls
          />
        </div>
      )}
    </div>
  );
}
