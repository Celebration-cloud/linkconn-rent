"use client";

import { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Pagination } from "@heroui/react";
import { useSearchParams, useRouter } from "next/navigation";

import PropertyCard from "./PropertyCard";
import { SpinnerLoading } from "./shared/spinner-loading";
import NoResults from "./NoResults";
import { fetchProperties, setPage } from "@/lib/redux/slices/propertiesSlice";

export default function PropertyGrid() {
  const dispatch = useDispatch();
  const router = useRouter();
  const searchParams = useSearchParams();

  const initialized = useRef(false);

  const { properties, loading, error, page, totalPages } = useSelector(
    (state) => state.properties
  );

  // Sync URL params -> Redux state on first mount only
  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    const params = Object.fromEntries(searchParams.entries());
    if (params.page) {
      dispatch(setPage(Number(params.page)));
    }
    dispatch(fetchProperties());
  }, [dispatch, searchParams]);

  // Fetch when page changes
  useEffect(() => {
    if (!initialized.current) return;
    dispatch(fetchProperties());
  }, [page, dispatch]);

  // Update URL when page changes (without retriggering fetch loop)
  useEffect(() => {
    const qs = new URLSearchParams(searchParams.toString());
    qs.set("page", page);
    router.replace(`?${qs.toString()}`, { scroll: false });
  }, [page, router]);

  if (loading) return <SpinnerLoading message="Loading properties..." />;
  if (error) return <p className="text-center text-red-500">{error}</p>;
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
      {totalPages > 1 && (
        <div className="flex justify-center">
          <Pagination
            page={page}
            total={totalPages}
            onChange={(newPage) => dispatch(setPage(newPage))}
            showControls
          />
        </div>
      )}
    </div>
  );
}
