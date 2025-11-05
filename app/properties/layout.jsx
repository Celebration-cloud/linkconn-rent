"use client";

import { useState } from "react";
import { LayoutGrid, MapPin, SlidersHorizontal } from "lucide-react";
import PropertyFilters from "@/components/PropertyFilters";
import { Drawer, DrawerContent, DrawerHeader, DrawerBody } from "@heroui/react";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { usePropertiesUI } from "@/hooks/usePropertiesUI";
import { SearchBar } from "@/components/shared/searchbar";

export default function PropertiesLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const isMobile = useMediaQuery("(max-width: 768px)");
  const { filters, setFilters } = usePropertiesUI();

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
            {/* Left controls: Filters button on mobile */}
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

            {/* Center + right controls: Search bar + View toggle */}
            <div className="flex flex-1 items-center gap-3 sm:gap-4 lg:gap-6 w-full sm:w-auto">
              <div className="flex-1 min-w-0">
                <SearchBar
                  value={filters.q}
                  onChange={(e) =>
                    setFilters({ ...filters, q: e.target.value })
                  }
                  placeholder="Search properties..."
                />
              </div>
              <ViewToggle />
            </div>
          </div>

          {/* Scrollable main content */}
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
  const { view, setView } = usePropertiesUI();
  return (
    <div className="flex items-center gap-2 mt-2 sm:mt-0">
      <button
        onClick={() => setView("grid")}
        className={`p-2.5 rounded-lg transition-colors ${
          view === "grid"
            ? "bg-primary text-primary-foreground"
            : "bg-muted text-muted-foreground hover:bg-muted/80"
        }`}
      >
        <LayoutGrid size={18} />
      </button>
      <button
        onClick={() => setView("map")}
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
