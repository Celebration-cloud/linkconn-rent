"use client";

import { useState, useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { LayoutGrid, MapPin, SlidersHorizontal } from "lucide-react";
import PropertyFilters from "@/components/PropertyFilters";
import { Drawer, DrawerContent, DrawerHeader, DrawerBody } from "@heroui/react";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { SearchBar } from "@/components/shared/searchbar";
import {
  setFilters,
  setView,
  fetchProperties,
} from "@/lib/redux/slices/propertiesSlice";
import { useRouter, useSearchParams } from "next/navigation";

export default function PropertiesLayout({ children }) {
  const dispatch = useDispatch();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const isMobile = useMediaQuery("(max-width: 768px)");
  const { filters } = useSelector((state) => state.properties);

  // Prevent double-fetch
  const initialized = useRef(false);

  // Sync URL params → Redux filters once on mount
  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    const params = Object.fromEntries(searchParams.entries());
    dispatch(setFilters(params));
    dispatch(fetchProperties());
  }, [dispatch, searchParams]);

  // Search handler (updates query + redux)
  const handleSearch = (value) => {
    const qs = new URLSearchParams(searchParams.toString());
    if (value) qs.set("q", value);
    else qs.delete("q");

    router.replace(`?${qs.toString()}`, { scroll: false });
    dispatch(setFilters({ ...filters, q: value }));
    dispatch(fetchProperties());
  };

  return (
    <>
      <div className="flex flex-col md:flex-row max-w-7xl mx-auto w-full gap-4 px-3 pb-6 sm:px-4 md:px-6 h-[calc(100vh-4rem)]">
        {/* Sidebar for desktop */}
        {!isMobile && (
          <aside className="w-72 rounded-xl p-4 bg-card h-full sticky top-16 overflow-y-auto styled-scrollbar">
            <PropertyFilters />
          </aside>
        )}

        {/* Main content */}
        <div className="flex-1 flex flex-col h-full w-full overflow-hidden">
          {/* Top controls */}
          <div className="flex flex-col sm:flex-row items-center justify-between sticky top-0 z-30 bg-background/80 backdrop-blur-md py-3 px-2 border-b border-border/40 gap-3 sm:gap-4 lg:gap-6">
            {/* Filters button (mobile) */}
            <div className="flex items-center gap-2 w-full sm:w-auto">
              {isMobile && (
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="flex items-center gap-1 px-3 py-2 rounded-lg bg-muted hover:bg-muted/80 text-sm font-medium"
                >
                  <SlidersHorizontal size={16} />
                  Filters
                </button>
              )}
            </div>

            {/* Search + View toggle */}
            <div className="flex flex-1 items-center gap-3 sm:gap-4 lg:gap-6 w-full sm:w-auto">
              <div className="flex-1 min-w-0">
                <SearchBar
                  value={filters.q || ""}
                  onChange={(e) => handleSearch(e.target.value)}
                  placeholder="Search properties..."
                />
              </div>
              <ViewToggle />
            </div>
          </div>

          {/* Main content */}
          <main className="flex-1 overflow-y-auto scrollbar-hide mt-2 sm:mt-0">
            {children}
          </main>
        </div>
      </div>

      {/* Drawer for mobile filters */}
      <Drawer
        isOpen={sidebarOpen}
        onOpenChange={setSidebarOpen}
        placement="left"
      >
        <DrawerContent>
          <DrawerHeader className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Filters</h3>
          </DrawerHeader>
          <DrawerBody className="scrollbar-hide">
            <PropertyFilters />
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </>
  );
}

function ViewToggle() {
  const dispatch = useDispatch();
  const { view } = useSelector((state) => state.properties);

  return (
    <div className="flex items-center gap-2 mt-2 sm:mt-0">
      <button
        onClick={() => dispatch(setView("grid"))}
        className={`p-2.5 rounded-lg transition-colors ${
          view === "grid"
            ? "bg-primary text-primary-foreground"
            : "bg-muted text-muted-foreground hover:bg-muted/80"
        }`}
      >
        <LayoutGrid size={18} />
      </button>
      <button
        onClick={() => dispatch(setView("map"))}
        className={`p-2.5 rounded-lg transition-colors ${
          view === "map"
            ? "bg-primary text-primary-foreground"
            : "bg-muted text-muted-foreground hover:bg-muted/80"
        }`}
      >
        <MapPin size={18} />
      </button>
    </div>
  );
}
