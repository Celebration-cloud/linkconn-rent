"use client";

import {
  createContext,
  useContext,
  useMemo,
  useState,
  useEffect,
  useCallback,
} from "react";

export const PropertiesUIContext = createContext(null);

export function usePropertiesUI() {
  return useContext(PropertiesUIContext);
}

export function PropertiesUIProvider({ children }) {
  const [view, setView] = useState("grid");

  const [filters, setFilters] = useState({
    q: "",
    type: "",
    category: "",
    purpose: "",
    status: "",
    minPrice: "",
    maxPrice: "",
    verified: false,
    state: "",
    city: "",
    minBeds: "",
    minBaths: "",
    minSize: "",
    maxSize: "",
    kitchen_available: "",
    toilet_available: "",
  });

  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [hasNext, setHasNext] = useState(false);
  const [hasPrev, setHasPrev] = useState(false);
  const [limit] = useState(9);

  // Fetch data from API
  const loadProperties = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const qs = new URLSearchParams();

      Object.entries(filters).forEach(([key, value]) => {
        if (value !== "" && value !== null && value !== undefined) {
          if (key === "verified" && value) qs.set("verified", "1");
          else qs.set(key, value);
        }
      });

      qs.set("page", page);
      qs.set("limit", limit);

      const res = await fetch(`/api/properties?${qs.toString()}`, {
        cache: "no-store",
      });

      if (!res.ok) throw new Error("Failed to fetch properties");

      const data = await res.json();
      console.log("Fetched properties:", data);

      setProperties(data.data || []);
      setTotalPages(data.pagination?.totalPages || 1);
      setHasNext(data.pagination?.hasNext || false);
      setHasPrev(data.pagination?.hasPrev || false);
    } catch (err) {
      setError(err.message);
      setProperties([]);
      setTotalPages(1);
      setHasNext(false);
      setHasPrev(false);
    } finally {
      setLoading(false);
    }
  }, [filters, page, limit]);

  // Auto reload when filters or page change
  useEffect(() => {
    loadProperties();
  }, [loadProperties]);

  // Reset page to 1 whenever filters change
  useEffect(() => {
    setPage(1);
  }, [filters]);

  const ctx = useMemo(
    () => ({
      view,
      setView,
      filters,
      setFilters,
      properties,
      loading,
      error,
      reload: loadProperties,
      page,
      setPage,
      totalPages,
      hasNext,
      hasPrev,
    }),
    [
      view,
      filters,
      properties,
      loading,
      error,
      loadProperties,
      page,
      totalPages,
      hasNext,
      hasPrev,
    ]
  );

  return (
    <PropertiesUIContext.Provider value={ctx}>
      {children}
    </PropertiesUIContext.Provider>
  );
}
