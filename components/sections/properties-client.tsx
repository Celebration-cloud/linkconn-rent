"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import PropertyCard from "@/components/shared/property-card";
import { PROPERTY_TYPES, CITIES, AMENITIES } from "@/domain/constants/property";
import type { Property } from "@/domain/types/property";
import { Close, Filter, Heart, Search } from "@/components/shared/icons";
import { Search as SearchIcon } from "lucide-react";
import { Input, Select } from "@/components/ui/form-controls";

const priceRanges = [
  { label: "Any Price", min: 0, max: Infinity },
  { label: "Under ₦1M", min: 0, max: 1_000_000 },
  { label: "₦1M - ₦3M", min: 1_000_000, max: 3_000_000 },
  { label: "₦3M - ₦6M", min: 3_000_000, max: 6_000_000 },
  { label: "₦6M - ₦15M", min: 6_000_000, max: 15_000_000 },
  { label: "₦15M+", min: 15_000_000, max: Infinity },
];

export default function PropertiesClient({ initialProperties }: { initialProperties: Property[] }) {
  const router = useRouter();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCity, setSelectedCity] = useState("All");
  const [selectedType, setSelectedType] = useState("All");
  const [selectedPriceRange, setSelectedPriceRange] = useState(0);
  const [minBedrooms, setMinBedrooms] = useState(0);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState("featured");
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const searchActive = searchQuery.trim().length > 0;

  const filteredProperties = useMemo(() => {
    const range = priceRanges[selectedPriceRange];

    const result = initialProperties.filter((p) => {
      const query = searchQuery.toLowerCase();
      const matchesSearch =
        query === "" ||
        p.title.toLowerCase().includes(query) ||
        p.location.toLowerCase().includes(query) ||
        p.city.toLowerCase().includes(query) ||
        p.description.toLowerCase().includes(query);

      const matchesCity = selectedCity === "All" || p.city.toLowerCase() === selectedCity.toLowerCase();
      const matchesType = selectedType === "All" || p.type.toLowerCase() === selectedType.toLowerCase();
      const matchesPrice = p.price >= range.min && p.price <= range.max;
      const matchesBedrooms = minBedrooms === 0 || p.bedrooms >= minBedrooms;
      const matchesAmenities = selectedAmenities.every((amenity) => p.amenities.includes(amenity));

      return matchesSearch && matchesCity && matchesType && matchesPrice && matchesBedrooms && matchesAmenities;
    });

    if (sortBy === "price-asc") {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === "price-desc") {
      result.sort((a, b) => b.price - a.price);
    } else if (sortBy === "rating") {
      result.sort((a, b) => b.rating - a.rating);
    } else {
      result.sort((a, b) => {
        if (a.featured && !b.featured) return -1;
        if (!a.featured && b.featured) return 1;
        return b.rating - a.rating;
      });
    }

    return result;
  }, [searchQuery, selectedCity, selectedType, selectedPriceRange, minBedrooms, selectedAmenities, sortBy, initialProperties]);

  const toggleSave = (id: string) => {
    setSavedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const toggleAmenity = (name: string) => {
    setSelectedAmenities((prev) => (prev.includes(name) ? prev.filter((x) => x !== name) : [...prev, name]));
  };

  const resetFilters = () => {
    setSearchQuery("");
    setSelectedCity("All");
    setSelectedType("All");
    setSelectedPriceRange(0);
    setMinBedrooms(0);
    setSelectedAmenities([]);
    setSortBy("featured");
  };

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (searchActive) count++;
    if (selectedCity !== "All") count++;
    if (selectedType !== "All") count++;
    if (selectedPriceRange !== 0) count++;
    if (minBedrooms !== 0) count++;
    if (selectedAmenities.length > 0) count += selectedAmenities.length;
    return count;
  }, [searchActive, selectedCity, selectedType, selectedPriceRange, minBedrooms, selectedAmenities]);

  const visibleAmenityLabels = selectedAmenities.slice(0, 2);
  const extraAmenityCount = Math.max(0, selectedAmenities.length - visibleAmenityLabels.length);

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-5 lg:px-8">
      <div className="rounded-[2rem] border border-navy-100 bg-white/90 p-6 shadow-[0_20px_70px_rgba(18,55,42,0.06)] backdrop-blur sm:p-8">
        <div className="flex flex-col gap-5 border-b border-navy-100 pb-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-brandgreen-100 bg-brandgreen-50 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.22em] text-brandgreen-700">
              Verified market
            </div>
            <h1 id="main-properties-title" className="mt-4 text-3xl font-black tracking-tight text-navy-950 sm:text-4xl lg:text-5xl">
              Direct & Verified Homes
            </h1>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-navy-500 sm:text-base">
              Scam-free rental portal. Connect directly with verified Nigerian landlords and skip the usual agency friction.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 rounded-full border border-red-100 bg-red-50 px-4 py-2 text-sm font-semibold text-red-600">
              <Heart className="h-4 w-4" filled /> {savedIds.length} saved
            </div>
            <div className="hidden items-center gap-2 rounded-full border border-navy-100 bg-navy-50 px-4 py-2 text-sm font-semibold text-navy-600 sm:flex">
              <Filter className="h-4 w-4" /> {activeFiltersCount} active filters
            </div>
            <button
              onClick={() => setShowMobileFilters(true)}
              className="flex items-center gap-2 rounded-full border border-navy-200 bg-navy-950 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition-transform transition-colors hover:-translate-y-[1px] hover:bg-navy-800 md:hidden cursor-pointer"
            >
              <Filter className="h-4 w-4" />
              Filters {activeFiltersCount > 0 && `(${activeFiltersCount})`}
            </button>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-2">
          {searchActive && (
            <span className="rounded-full bg-navy-100 px-3 py-1 text-[11px] font-bold text-navy-700">
              Search: {searchQuery}
            </span>
          )}
          {selectedCity !== "All" && (
            <span className="rounded-full bg-navy-100 px-3 py-1 text-[11px] font-bold text-navy-700">
              City: {selectedCity}
            </span>
          )}
          {selectedType !== "All" && (
            <span className="rounded-full bg-navy-100 px-3 py-1 text-[11px] font-bold text-navy-700">
              Type: {selectedType}
            </span>
          )}
          {selectedPriceRange !== 0 && (
            <span className="rounded-full bg-navy-100 px-3 py-1 text-[11px] font-bold text-navy-700">
              Budget: {priceRanges[selectedPriceRange].label}
            </span>
          )}
          {minBedrooms !== 0 && (
            <span className="rounded-full bg-navy-100 px-3 py-1 text-[11px] font-bold text-navy-700">
              {minBedrooms}+ beds
            </span>
          )}
          {visibleAmenityLabels.map((amenity) => (
            <span key={amenity} className="rounded-full bg-brandgreen-50 px-3 py-1 text-[11px] font-bold text-brandgreen-700">
              {amenity}
            </span>
          ))}
          {extraAmenityCount > 0 && (
            <span className="rounded-full bg-brandgreen-50 px-3 py-1 text-[11px] font-bold text-brandgreen-700">
              +{extraAmenityCount} more
            </span>
          )}
          {activeFiltersCount > 0 && (
            <button
              onClick={resetFilters}
              className="rounded-full border border-navy-200 px-3 py-1 text-[11px] font-bold text-navy-600 transition-colors hover:border-brandgreen-200 hover:bg-brandgreen-50 hover:text-brandgreen-700 cursor-pointer"
            >
              Clear all
            </button>
          )}
        </div>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[18rem_minmax(0,1fr)]">
        <aside className="hidden space-y-6 md:block lg:sticky lg:top-6 lg:self-start">
          <div className="rounded-[1.75rem] border border-navy-100 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-extrabold uppercase tracking-wider text-navy-900">Filters</h2>
              {activeFiltersCount > 0 && (
                <button onClick={resetFilters} className="cursor-pointer text-xs font-bold text-brandgreen-600 hover:underline">
                  Reset All
                </button>
              )}
            </div>

            <div className="mt-5">
              <label className="block text-xs font-bold uppercase tracking-wide text-navy-400">Search Location</label>
              <div className="mt-2">
                <Input
                  type="text"
                  placeholder="e.g. Lekki, Abuja"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="text-xs font-semibold"
                  leadingIcon={SearchIcon}
                />
              </div>
            </div>

            <div className="mt-6">
              <label className="block text-xs font-bold uppercase tracking-wide text-navy-400">City</label>
              <Select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="mt-2 text-xs font-semibold"
              >
                <option value="All">All Cities</option>
                {CITIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </Select>
            </div>

            <div className="mt-6">
              <label className="block text-xs font-bold uppercase tracking-wide text-navy-400">Property Type</label>
              <Select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="mt-2 text-xs font-semibold"
              >
                <option value="All">All Types</option>
                {PROPERTY_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </Select>
            </div>

            <div className="mt-6">
              <label className="block text-xs font-bold uppercase tracking-wide text-navy-400">Max Budget</label>
              <Select
                value={selectedPriceRange}
                onChange={(e) => setSelectedPriceRange(Number(e.target.value))}
                className="mt-2 text-xs font-semibold"
              >
                {priceRanges.map((r, i) => (
                  <option key={r.label} value={i}>
                    {r.label}
                  </option>
                ))}
              </Select>
            </div>

            <div className="mt-6">
              <label className="block text-xs font-bold uppercase tracking-wide text-navy-400">Min Bedrooms</label>
              <div className="mt-2 grid grid-cols-5 gap-1">
                {[0, 1, 2, 3, 4].map((b) => (
                  <button
                    key={b}
                    onClick={() => setMinBedrooms(b)}
                    className={`rounded-lg py-2 text-center text-xs font-bold transition-all cursor-pointer ${
                      minBedrooms === b ? "bg-navy-950 text-white" : "border border-navy-100 bg-navy-50 text-navy-600 hover:bg-navy-100"
                    }`}
                  >
                    {b === 0 ? "Any" : b}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-6 border-t border-navy-100 pt-5">
              <label className="block text-xs font-bold uppercase tracking-wide text-navy-400">Amenities</label>
              <div className="mt-3 max-h-48 space-y-2 overflow-y-auto pr-1">
                {AMENITIES.map((a) => {
                  const checked = selectedAmenities.includes(a);
                  return (
                    <label key={a} className="flex cursor-pointer select-none items-center gap-2.5 text-xs font-semibold text-navy-700">
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleAmenity(a)}
                        className="h-4 w-4 cursor-pointer rounded border-navy-300 text-brandgreen-600 focus:ring-brandgreen-500"
                      />
                      {a}
                    </label>
                  );
                })}
              </div>
            </div>
          </div>
        </aside>

        <main className="min-w-0">
          <div className="rounded-[1.75rem] border border-navy-100 bg-white p-4 shadow-sm">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <span className="text-sm font-semibold text-navy-500">
                  Showing <span className="font-extrabold text-navy-950">{filteredProperties.length}</span> {filteredProperties.length === 1 ? "home" : "homes"}
                </span>
                <p className="mt-1 text-xs text-navy-400">
                  Sorted by{" "}
                  <span className="font-semibold text-navy-600">
                    {sortBy === "featured" ? "featured listings" : sortBy.replace("-", " ")}
                  </span>
                </p>
              </div>

              <div className="flex items-center gap-2">
                <label className="text-xs font-semibold text-navy-500">Sort by:</label>
                <Select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="min-h-10 rounded-full py-2 text-xs font-bold"
                >
                  <option value="featured">Featured First</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                  <option value="rating">Highest Rated</option>
                </Select>
              </div>
            </div>
          </div>

          <motion.div layout className="mt-6 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            <AnimatePresence mode="popLayout">
              {filteredProperties.map((p) => (
                <PropertyCard
                  key={p.id}
                  p={p}
                  saved={savedIds.includes(p.id)}
                  onToggle={() => toggleSave(p.id)}
                  onOpen={() => router.push(`/properties/${p.id}`)}
                />
              ))}
            </AnimatePresence>
          </motion.div>

          {filteredProperties.length === 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mt-8 overflow-hidden rounded-[1.75rem] border border-dashed border-navy-200 bg-white shadow-sm"
            >
              <div className="bg-gradient-to-br from-navy-50 via-white to-brandgreen-50 px-6 py-14 text-center sm:px-10">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-navy-100 bg-white text-navy-500 shadow-sm">
                  <Search className="h-6 w-6" />
                </div>
                <h3 className="mt-5 text-lg font-black tracking-tight text-navy-950">No properties match your filters</h3>
                <p className="mx-auto mt-2 max-w-lg text-sm leading-relaxed text-navy-500">
                  Try widening the budget, removing a bedroom constraint, or clearing amenities to surface more listings.
                </p>
                <button
                  onClick={resetFilters}
                  className="mt-7 rounded-full bg-navy-950 px-5 py-3 text-sm font-bold text-white transition-transform transition-colors hover:-translate-y-[1px] hover:bg-brandgreen-600 cursor-pointer"
                >
                  Reset Filters
                </button>
              </div>
            </motion.div>
          )}
        </main>
      </div>

      <AnimatePresence>
        {showMobileFilters && (
          <div className="fixed inset-0 z-50 flex justify-end md:hidden">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowMobileFilters(false)}
              className="absolute inset-0 bg-navy-950/50 backdrop-blur-sm"
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 220 }}
              className="relative flex h-full w-full max-w-sm flex-col bg-white p-6 shadow-2xl"
            >
              <div className="flex items-center justify-between border-b border-navy-100 pb-4">
                <div>
                  <h2 className="text-base font-extrabold text-navy-900">Filters</h2>
                  <p className="mt-1 text-xs text-navy-500">{activeFiltersCount} active</p>
                </div>
                <button
                  onClick={() => setShowMobileFilters(false)}
                  className="rounded-full p-2 text-navy-500 transition-colors hover:bg-navy-50"
                  aria-label="Close filters"
                >
                  <Close className="h-5 w-5" />
                </button>
              </div>

              <div className="flex-1 space-y-5 overflow-y-auto py-5">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wide text-navy-400">Search</label>
                  <Input
                    type="text"
                    placeholder="e.g. Lekki, Abuja"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="mt-2 text-xs font-semibold"
                    leadingIcon={SearchIcon}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wide text-navy-400">City</label>
                  <Select
                    value={selectedCity}
                    onChange={(e) => setSelectedCity(e.target.value)}
                    className="mt-2 text-xs font-semibold"
                  >
                    <option value="All">All Cities</option>
                    {CITIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </Select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wide text-navy-400">Type</label>
                  <Select
                    value={selectedType}
                    onChange={(e) => setSelectedType(e.target.value)}
                    className="mt-2 text-xs font-semibold"
                  >
                    <option value="All">All Types</option>
                    {PROPERTY_TYPES.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </Select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wide text-navy-400">Max Budget</label>
                  <Select
                    value={selectedPriceRange}
                    onChange={(e) => setSelectedPriceRange(Number(e.target.value))}
                    className="mt-2 text-xs font-semibold"
                  >
                    {priceRanges.map((r, i) => (
                      <option key={r.label} value={i}>
                        {r.label}
                      </option>
                    ))}
                  </Select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wide text-navy-400">Min Bedrooms</label>
                  <div className="mt-2 grid grid-cols-5 gap-1">
                    {[0, 1, 2, 3, 4].map((b) => (
                      <button
                        key={b}
                        onClick={() => setMinBedrooms(b)}
                        className={`rounded-lg py-2 text-center text-xs font-bold transition-all cursor-pointer ${
                          minBedrooms === b ? "bg-navy-950 text-white" : "border border-navy-100 bg-navy-50 text-navy-600"
                        }`}
                      >
                        {b === 0 ? "Any" : b}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wide text-navy-400">Amenities</label>
                  <div className="mt-3 space-y-2">
                    {AMENITIES.map((a) => (
                      <label key={a} className="flex cursor-pointer items-center gap-2.5 text-xs font-semibold text-navy-700">
                        <input
                          type="checkbox"
                          checked={selectedAmenities.includes(a)}
                          onChange={() => toggleAmenity(a)}
                          className="h-4 w-4 cursor-pointer rounded border-navy-300 text-brandgreen-600 focus:ring-brandgreen-500"
                        />
                        {a}
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex gap-3 border-t border-navy-100 pt-4">
                <button
                  onClick={resetFilters}
                  className="flex-1 rounded-xl border border-navy-200 py-3 text-xs font-bold text-navy-800 transition-colors hover:bg-navy-50 cursor-pointer"
                >
                  Reset
                </button>
                <button
                  onClick={() => setShowMobileFilters(false)}
                  className="flex-1 rounded-xl bg-brandgreen-500 py-3 text-xs font-bold text-white shadow-md shadow-brandgreen-500/25 transition-colors hover:bg-brandgreen-600 cursor-pointer"
                >
                  Apply Filters
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
