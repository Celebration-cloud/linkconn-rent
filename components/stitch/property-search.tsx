"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";
import {
  ArrowUp,
  Check,
  ChevronLeft,
  ChevronRight,
  Map,
  RotateCcw,
  Scale,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react";
import { Input, Select } from "@/components/ui/form-controls";
import type { Property } from "@/domain/types/property";
import type {
  PropertyPagination,
  PropertySearchEnvelope,
  PropertySearchResult,
} from "@/domain/types/property-search";
import type { PropertySearchInput } from "@/schemas/operating-system";
import { toastError, toastInfo } from "@/stores/toast-store";
import { useAuth } from "@/providers/auth-provider";
import { formatCompactNaira } from "@/utils/map-property";
import {
  PROPERTY_TYPES,
  PropertyFilterPanel,
  type AdvancedFilterDraft,
} from "./property-filter-panel";
import { StitchPropertyCard } from "./property-card";

const STORAGE_PREFIX = "linkconn.property-search.v1:";
const CACHE_TTL = 30 * 60 * 1_000;

type ResultBatch = { page: number; items: Property[] };
type CachedSearchState = {
  savedAt: number;
  batches: ResultBatch[];
  pagination: PropertyPagination;
  compareIds: string[];
  scrollY: number;
};

type FilterChip = {
  key: string;
  label: string;
  remove: Record<string, string | null>;
};

function createAdvancedDraft(filters: PropertySearchInput): AdvancedFilterDraft {
  return {
    minPrice: filters.minPrice === undefined ? "" : String(filters.minPrice),
    maxPrice: filters.maxPrice === undefined ? "" : String(filters.maxPrice),
    bathrooms: filters.bathrooms === undefined ? "" : String(filters.bathrooms),
    types: filters.types?.length
      ? filters.types
      : filters.type
        ? [filters.type]
        : [],
    amenities: filters.amenities || [],
  };
}

function pageHref(baseQuery: string, page: number) {
  const params = new URLSearchParams(baseQuery);
  if (page > 1) params.set("page", String(page));
  else params.delete("page");
  const query = params.toString();
  return query ? `/properties?${query}` : "/properties";
}

function PropertySkeleton() {
  return (
    <div className="overflow-hidden rounded-xl border border-line bg-white" aria-hidden="true">
      <div className="aspect-[16/10] animate-pulse bg-sand-200" />
      <div className="space-y-3 p-4">
        <div className="h-5 w-2/5 animate-pulse rounded bg-sand-200" />
        <div className="h-4 w-4/5 animate-pulse rounded bg-sand-200" />
        <div className="h-11 animate-pulse rounded-lg bg-sand-200" />
      </div>
    </div>
  );
}

export function PropertySearch({
  initialResult,
  initialFilters,
}: {
  initialResult: PropertySearchResult;
  initialFilters: PropertySearchInput;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isLoadingProfile } = useAuth();
  const requestController = useRef<AbortController | null>(null);
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const resultsRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const filterButtonRef = useRef<HTMLButtonElement>(null);
  const drawerRef = useRef<HTMLDivElement>(null);
  const scrollFrame = useRef<number | null>(null);

  const baseQuery = useMemo(() => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("page");
    params.delete("mode");
    return params.toString();
  }, [searchParams]);
  const storageKey = `${STORAGE_PREFIX}${baseQuery || "all"}`;

  const [searchValue, setSearchValue] = useState(initialFilters.q || "");
  const [draft, setDraft] = useState(() => createAdvancedDraft(initialFilters));
  const [batches, setBatches] = useState<ResultBatch[]>([
    { page: initialResult.pagination.page, items: initialResult.items },
  ]);
  const [pagination, setPagination] = useState(initialResult.pagination);
  const [loadingNext, setLoadingNext] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [automaticLoads, setAutomaticLoads] = useState(2);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [compareIds, setCompareIds] = useState<string[]>([]);
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [savingIds, setSavingIds] = useState<Set<string>>(new Set());
  const [restored, setRestored] = useState(false);

  const properties = useMemo(() => {
    const seen = new Set<string>();
    return batches.flatMap((batch) =>
      batch.items.filter((property) => {
        if (seen.has(property.id)) return false;
        seen.add(property.id);
        return true;
      }),
    );
  }, [batches]);
  const lastPage = Math.max(...batches.map((batch) => batch.page));
  const canShowSave = !isLoadingProfile && (!user || user.role === "Tenant");

  const replaceQuery = useCallback(
    (updates: Record<string, string | null>) => {
      const next = new URLSearchParams(baseQuery);
      for (const [key, value] of Object.entries(updates)) {
        if (value) next.set(key, value);
        else next.delete(key);
      }
      next.delete("page");
      if (Object.hasOwn(updates, "types")) next.delete("type");
      const query = next.toString();
      router.replace(query ? `/properties?${query}` : "/properties", {
        scroll: false,
      });
    },
    [baseQuery, router],
  );

  const applySearch = useCallback(() => {
    if (searchTimer.current) clearTimeout(searchTimer.current);
    replaceQuery({ q: searchValue.trim() || null });
  }, [replaceQuery, searchValue]);

  useEffect(() => {
    if (searchValue.trim() === (initialFilters.q || "")) return;
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(applySearch, 350);
    return () => {
      if (searchTimer.current) clearTimeout(searchTimer.current);
    };
  }, [applySearch, initialFilters.q, searchValue]);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(storageKey);
      if (!raw) {
        setRestored(true);
        return;
      }
      const cached = JSON.parse(raw) as CachedSearchState;
      if (
        Date.now() - cached.savedAt > CACHE_TTL ||
        !cached.batches.length ||
        cached.batches.at(-1)!.page < initialResult.pagination.page
      ) {
        sessionStorage.removeItem(storageKey);
        setRestored(true);
        return;
      }
      setBatches(cached.batches);
      setPagination(cached.pagination);
      setCompareIds(cached.compareIds.slice(0, 4));
      setAutomaticLoads(0);
      requestAnimationFrame(() =>
        requestAnimationFrame(() => window.scrollTo({ top: cached.scrollY })),
      );
    } catch {
      sessionStorage.removeItem(storageKey);
    } finally {
      setRestored(true);
    }
  }, [initialResult.pagination.page, storageKey]);

  const persistState = useCallback(
    (scrollY = window.scrollY) => {
      const next: CachedSearchState = {
        savedAt: Date.now(),
        batches,
        pagination,
        compareIds,
        scrollY,
      };
      try {
        sessionStorage.setItem(storageKey, JSON.stringify(next));
      } catch {
        // Browsing remains functional when storage is unavailable.
      }
    },
    [batches, compareIds, pagination, storageKey],
  );

  useEffect(() => {
    if (!restored) return;
    persistState();
  }, [persistState, restored]);

  useEffect(() => {
    const rememberScroll = () => {
      if (scrollFrame.current !== null) return;
      scrollFrame.current = requestAnimationFrame(() => {
        scrollFrame.current = null;
        persistState(window.scrollY);
      });
    };
    window.addEventListener("scroll", rememberScroll, { passive: true });
    window.addEventListener("pagehide", rememberScroll);
    return () => {
      window.removeEventListener("scroll", rememberScroll);
      window.removeEventListener("pagehide", rememberScroll);
      if (scrollFrame.current !== null) cancelAnimationFrame(scrollFrame.current);
    };
  }, [persistState]);

  useEffect(() => {
    if (user?.role !== "Tenant") return;
    const controller = new AbortController();
    void fetch("/api/saved-properties", {
      cache: "no-store",
      signal: controller.signal,
    })
      .then(async (response) => {
        const result = (await response.json()) as {
          success: boolean;
          data?: { propertyIds: string[] };
        };
        if (response.ok && result.success && result.data) {
          setSavedIds(new Set(result.data.propertyIds));
        }
      })
      .catch(() => undefined);
    return () => controller.abort();
  }, [user?.role]);

  const loadNextPage = useCallback(async () => {
    if (loadingNext || !pagination.hasNextPage) return;
    requestController.current?.abort();
    const controller = new AbortController();
    requestController.current = controller;
    const nextPage = lastPage + 1;
    const params = new URLSearchParams(baseQuery);
    params.set("page", String(nextPage));
    params.set("pageSize", "12");
    setLoadingNext(true);
    setLoadError(null);

    try {
      const response = await fetch(`/api/properties?${params.toString()}`, {
        cache: "no-store",
        signal: controller.signal,
      });
      const result = (await response.json()) as PropertySearchEnvelope;
      if (!response.ok || !result.success || !result.data) {
        throw new Error(result.message || "Unable to load more properties");
      }
      setBatches((current) => [
        ...current,
        { page: result.data!.pagination.page, items: result.data!.items },
      ]);
      setPagination(result.data.pagination);
      setAutomaticLoads((remaining) => Math.max(0, remaining - 1));
    } catch (error) {
      if (!(error instanceof DOMException && error.name === "AbortError")) {
        setLoadError(
          error instanceof Error ? error.message : "Unable to load more properties",
        );
      }
    } finally {
      if (requestController.current === controller) setLoadingNext(false);
    }
  }, [baseQuery, lastPage, loadingNext, pagination.hasNextPage]);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || automaticLoads <= 0 || !pagination.hasNextPage) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) void loadNextPage();
      },
      { rootMargin: "320px 0px" },
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [automaticLoads, loadNextPage, pagination.hasNextPage]);

  useEffect(() => {
    const root = resultsRef.current;
    if (!root || batches.length < 2) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((first, second) => second.intersectionRatio - first.intersectionRatio)[0];
        const page = Number((visible?.target as HTMLElement | undefined)?.dataset.propertyPage);
        if (!page) return;
        const href = pageHref(baseQuery, page);
        window.history.replaceState(window.history.state, "", href);
      },
      { threshold: [0.35, 0.6] },
    );
    root.querySelectorAll<HTMLElement>("[data-property-page]").forEach((batch) => observer.observe(batch));
    return () => observer.disconnect();
  }, [baseQuery, batches]);

  useEffect(() => {
    if (!drawerOpen) return;
    const drawer = drawerRef.current;
    const focusable = drawer?.querySelectorAll<HTMLElement>(
      "button:not([disabled]), input:not([disabled]), select:not([disabled])",
    );
    focusable?.[0]?.focus();
    const onKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape") {
        setDrawerOpen(false);
        filterButtonRef.current?.focus();
        return;
      }
      if (event.key !== "Tab" || !focusable?.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [drawerOpen]);

  useEffect(() => () => requestController.current?.abort(), []);

  const applyAdvanced = () => {
    replaceQuery({
      minPrice: draft.minPrice || null,
      maxPrice: draft.maxPrice || null,
      bathrooms: draft.bathrooms || null,
      types: draft.types.length ? draft.types.join(",") : null,
      amenities: draft.amenities.length ? draft.amenities.join(",") : null,
    });
    setDrawerOpen(false);
  };

  const toggleSaved = async (property: Property) => {
    if (!user) {
      persistState();
      const next = `${window.location.pathname}${window.location.search}`;
      router.push(`/login?next=${encodeURIComponent(next)}`);
      return;
    }
    if (user.role !== "Tenant" || savingIds.has(property.id)) return;
    const wasSaved = savedIds.has(property.id);
    setSavedIds((current) => {
      const next = new Set(current);
      if (wasSaved) next.delete(property.id);
      else next.add(property.id);
      return next;
    });
    setSavingIds((current) => new Set(current).add(property.id));
    try {
      const response = await fetch("/api/saved-properties", {
        method: wasSaved ? "DELETE" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ propertyId: property.id }),
      });
      if (!response.ok) throw new Error("Unable to update this saved property");
      toastInfo(wasSaved ? "Removed from saved homes" : "Property saved");
    } catch (error) {
      setSavedIds((current) => {
        const next = new Set(current);
        if (wasSaved) next.add(property.id);
        else next.delete(property.id);
        return next;
      });
      toastError(
        "Save failed",
        error instanceof Error ? error.message : "Please try again.",
      );
    } finally {
      setSavingIds((current) => {
        const next = new Set(current);
        next.delete(property.id);
        return next;
      });
    }
  };

  const toggleCompare = (propertyId: string) => {
    setCompareIds((current) => {
      if (current.includes(propertyId)) return current.filter((id) => id !== propertyId);
      if (current.length >= 4) {
        toastInfo("Comparison is full", "Remove one home before adding another.");
        return current;
      }
      return [...current, propertyId];
    });
  };

  const filterChips = useMemo<FilterChip[]>(() => {
    const chips: FilterChip[] = [];
    if (initialFilters.q) chips.push({ key: "q", label: `“${initialFilters.q}”`, remove: { q: null } });
    const types = initialFilters.types?.length
      ? initialFilters.types
      : initialFilters.type
        ? [initialFilters.type]
        : [];
    types.forEach((type) => {
      const remaining = types.filter((item) => item !== type);
      chips.push({
        key: `type-${type}`,
        label: type,
        remove: { types: remaining.length ? remaining.join(",") : null },
      });
    });
    if (initialFilters.verified !== undefined) chips.push({ key: "verified", label: initialFilters.verified ? "Verified only" : "Unverified", remove: { verified: null } });
    if (initialFilters.period) chips.push({ key: "period", label: initialFilters.period === "month" ? "Monthly rent" : "Yearly rent", remove: { period: null } });
    if (initialFilters.bedrooms !== undefined) chips.push({ key: "bedrooms", label: `${initialFilters.bedrooms}+ bedrooms`, remove: { bedrooms: null } });
    if (initialFilters.bathrooms !== undefined) chips.push({ key: "bathrooms", label: `${initialFilters.bathrooms}+ bathrooms`, remove: { bathrooms: null } });
    if (initialFilters.minPrice !== undefined) chips.push({ key: "minPrice", label: `From ${formatCompactNaira(initialFilters.minPrice)}`, remove: { minPrice: null } });
    if (initialFilters.maxPrice !== undefined) chips.push({ key: "maxPrice", label: `Up to ${formatCompactNaira(initialFilters.maxPrice)}`, remove: { maxPrice: null } });
    initialFilters.amenities?.forEach((amenity) => {
      const remaining = initialFilters.amenities!.filter((item) => item !== amenity);
      chips.push({
        key: `amenity-${amenity}`,
        label: amenity,
        remove: { amenities: remaining.length ? remaining.join(",") : null },
      });
    });
    return chips;
  }, [initialFilters]);

  const mapParams = new URLSearchParams(baseQuery);
  mapParams.delete("pageSize");
  const mapHref = mapParams.toString()
    ? `/properties/map?${mapParams.toString()}`
    : "/properties/map";

  function onSearchKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter") applySearch();
  }

  return (
    <main id="main-content" className="min-h-screen bg-sand-50 pb-28 pt-16">
      <section className="border-b border-line bg-sand-100">
        <div className="stitch-container py-9 sm:py-11">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-forest-700">Verified rentals across Nigeria</p>
          <div className="mt-2 flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
            <div>
              <h1 className="max-w-3xl text-3xl font-extrabold tracking-[-0.045em] text-ink sm:text-4xl">
                Find a home with the full cost in view.
              </h1>
              <p className="mt-2 text-sm text-muted">
                <span className="font-bold tabular-nums text-forest-900">{pagination.totalItems}</span>{" "}
                {pagination.totalItems === 1 ? "property matches" : "properties match"} your search.
              </p>
            </div>
            <Link href={mapHref} className="stitch-button stitch-button-secondary shrink-0">
              <Map className="size-4" aria-hidden="true" /> Show map
            </Link>
          </div>

          <div className="mt-7 grid gap-3 lg:grid-cols-[minmax(0,1fr)_13rem]">
            <Input
              value={searchValue}
              onChange={(event) => setSearchValue(event.target.value)}
              onKeyDown={onSearchKeyDown}
              leadingIcon={Search}
              placeholder="Search by area, city, property name or keyword"
              aria-label="Search properties"
              className="h-14 bg-white text-base shadow-[0_8px_24px_rgba(18,55,42,0.07)]"
              trailingAction={searchValue ? (
                <button
                  type="button"
                  onClick={() => {
                    setSearchValue("");
                    replaceQuery({ q: null });
                  }}
                  aria-label="Clear property search"
                  className="grid size-9 place-items-center rounded-md text-muted hover:bg-sand-100 hover:text-forest-900"
                >
                  <X className="size-4" aria-hidden="true" />
                </button>
              ) : undefined}
            />
            <Select
              value={initialFilters.sort || "recommended"}
              onChange={(event) => replaceQuery({ sort: event.target.value === "recommended" ? null : event.target.value })}
              aria-label="Sort properties"
              className="h-14 bg-white font-semibold"
            >
              <option value="recommended">Recommended</option>
              <option value="newest">Newest</option>
              <option value="lowest-rent">Rent: low to high</option>
              <option value="highest-rent">Rent: high to low</option>
            </Select>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2" aria-label="Quick property filters">
            <button
              type="button"
              onClick={() => replaceQuery({ verified: initialFilters.verified === true ? null : "true" })}
              aria-pressed={initialFilters.verified === true}
              className={`min-h-11 rounded-lg border px-3 text-xs font-bold transition ${initialFilters.verified === true ? "border-forest-700 bg-forest-700 text-white" : "border-line bg-white text-muted hover:border-forest-300"}`}
            >
              Verified only
            </button>
            <Select
              value={
                initialFilters.types?.length === 1
                  ? initialFilters.types[0]
                  : initialFilters.type || ""
              }
              onChange={(event) => replaceQuery({ types: event.target.value || null })}
              aria-label="Property type"
              className="min-w-36 bg-white text-xs font-bold"
            >
              <option value="">Any property type</option>
              {PROPERTY_TYPES.map((type) => <option key={type}>{type}</option>)}
            </Select>
            <Select
              value={initialFilters.period || ""}
              onChange={(event) => replaceQuery({ period: event.target.value || null })}
              aria-label="Rent period"
              className="min-w-36 bg-white text-xs font-bold"
            >
              <option value="">Any rent period</option>
              <option value="year">Yearly</option>
              <option value="month">Monthly</option>
            </Select>
            {["", "1", "2", "3"].map((value) => (
              <button
                key={value || "any-bedrooms"}
                type="button"
                onClick={() => replaceQuery({ bedrooms: value || null })}
                aria-pressed={(initialFilters.bedrooms === undefined ? "" : String(initialFilters.bedrooms)) === value}
                className={`min-h-11 rounded-lg border px-3 text-xs font-bold transition ${(initialFilters.bedrooms === undefined ? "" : String(initialFilters.bedrooms)) === value ? "border-forest-700 bg-forest-50 text-forest-900" : "border-line bg-white text-muted hover:border-forest-300"}`}
              >
                {value ? `${value}${value === "3" ? "+" : ""} beds` : "Any beds"}
              </button>
            ))}
            <button
              ref={filterButtonRef}
              type="button"
              onClick={() => setDrawerOpen(true)}
              aria-expanded={drawerOpen}
              className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-line bg-white px-3 text-xs font-bold text-forest-900 lg:hidden"
            >
              <SlidersHorizontal className="size-4" aria-hidden="true" />
              More filters
              {filterChips.length ? <span className="grid size-5 place-items-center rounded bg-lime text-[10px] text-forest-950">{filterChips.length}</span> : null}
            </button>
          </div>
        </div>
      </section>

      <div className="stitch-container grid gap-8 py-8 lg:grid-cols-[17rem_minmax(0,1fr)]">
        <aside className="hidden h-fit border-r border-line pr-7 lg:sticky lg:top-24 lg:block">
          <PropertyFilterPanel
            draft={draft}
            onChange={setDraft}
            onApply={applyAdvanced}
            onReset={() => setDraft({ minPrice: "", maxPrice: "", bathrooms: "", types: [], amenities: [] })}
            idPrefix="desktop"
          />
        </aside>

        <section aria-busy={loadingNext} aria-describedby="property-result-status">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p id="property-result-status" className="text-sm font-semibold text-muted" aria-live="polite">
              Showing {properties.length} of {pagination.totalItems} properties
            </p>
            {filterChips.length ? (
              <button type="button" onClick={() => router.replace("/properties", { scroll: false })} className="inline-flex min-h-11 items-center gap-1.5 text-xs font-bold text-forest-700">
                <RotateCcw className="size-3.5" aria-hidden="true" /> Clear all
              </button>
            ) : null}
          </div>

          {filterChips.length ? (
            <div className="mt-3 flex flex-wrap gap-2" aria-label="Applied filters">
              {filterChips.map((chip) => (
                <button
                  key={chip.key}
                  type="button"
                  onClick={() => replaceQuery(chip.remove)}
                  className="inline-flex min-h-10 items-center gap-1.5 rounded-lg border border-forest-200 bg-forest-50 px-3 text-xs font-bold text-forest-900 transition hover:border-forest-500"
                >
                  {chip.label}<X className="size-3.5" aria-hidden="true" />
                </button>
              ))}
            </div>
          ) : null}

          {properties.length ? (
            <div ref={resultsRef} className="mt-5 space-y-8">
              {batches.map((batch) => (
                <div key={batch.page} data-property-page={batch.page} className="scroll-mt-28">
                  <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                    {batch.items.map((property) => (
                      <StitchPropertyCard
                        key={property.id}
                        property={property}
                        compact
                        saved={savedIds.has(property.id)}
                        saving={savingIds.has(property.id)}
                        compareSelected={compareIds.includes(property.id)}
                        onToggleSaved={canShowSave ? () => void toggleSaved(property) : undefined}
                        onToggleCompare={() => toggleCompare(property.id)}
                        onOpenDetails={() => persistState()}
                      />
                    ))}
                  </div>
                </div>
              ))}
              {loadingNext ? (
                <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3" aria-label="Loading more properties">
                  {Array.from({ length: 3 }, (_, index) => <PropertySkeleton key={index} />)}
                </div>
              ) : null}
            </div>
          ) : (
            <div className="mt-5 grid min-h-80 place-items-center rounded-2xl border border-dashed border-line bg-sand-100 p-8 text-center">
              <div>
                <Search className="mx-auto size-9 text-forest-700" aria-hidden="true" />
                <h2 className="mt-4 text-xl font-extrabold text-ink">No matching homes yet</h2>
                <p className="mt-2 max-w-sm text-sm leading-6 text-muted">Try a broader search or remove one filter to see more approved properties.</p>
                <button type="button" onClick={() => router.replace("/properties")} className="stitch-button mt-5">Clear filters</button>
              </div>
            </div>
          )}

          <div ref={sentinelRef} className="h-px" aria-hidden="true" />

          {loadError ? (
            <div role="alert" className="mt-6 flex flex-col items-center rounded-xl border border-error/30 bg-error-muted p-5 text-center">
              <p className="text-sm font-bold text-error">{loadError}</p>
              <button type="button" onClick={() => void loadNextPage()} className="stitch-button mt-3">Retry</button>
            </div>
          ) : null}

          {!loadError && pagination.hasNextPage && automaticLoads === 0 ? (
            <div className="mt-8 text-center">
              <button type="button" onClick={() => setAutomaticLoads(3)} className="stitch-button">
                Continue browsing <ChevronRight className="size-4" aria-hidden="true" />
              </button>
              <p className="mt-2 text-xs text-muted">Loading pauses here so you can reach the rest of the page.</p>
            </div>
          ) : null}

          <nav aria-label="Property result pages" className="mt-10 flex items-center justify-center gap-3 border-t border-line pt-6">
            {pagination.page > 1 ? (
              <Link href={pageHref(baseQuery, pagination.page - 1)} className="inline-flex min-h-11 items-center gap-1 rounded-lg border border-line bg-white px-3 text-sm font-bold text-muted hover:border-forest-300 hover:text-forest-800">
                <ChevronLeft className="size-4" aria-hidden="true" /> Previous
              </Link>
            ) : <span />}
            <span aria-current="page" className="min-h-11 rounded-lg bg-forest-700 px-4 py-3 text-sm font-bold text-white">
              Page {pagination.page} of {pagination.totalPages}
            </span>
            {pagination.hasNextPage ? (
              <Link href={pageHref(baseQuery, pagination.page + 1)} className="inline-flex min-h-11 items-center gap-1 rounded-lg border border-line bg-white px-3 text-sm font-bold text-muted hover:border-forest-300 hover:text-forest-800">
                Next <ChevronRight className="size-4" aria-hidden="true" />
              </Link>
            ) : <span />}
          </nav>

          {batches.length > 1 ? (
            <div className="mt-6 text-center">
              <button type="button" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} className="inline-flex min-h-11 items-center gap-2 text-sm font-bold text-forest-700">
                <ArrowUp className="size-4" aria-hidden="true" /> Back to top
              </button>
            </div>
          ) : null}
        </section>
      </div>

      {drawerOpen ? (
        <div className="fixed inset-0 z-50 bg-forest-950/45 p-3 backdrop-blur-sm lg:hidden" role="presentation" onMouseDown={(event) => {
          if (event.target === event.currentTarget) setDrawerOpen(false);
        }}>
          <div ref={drawerRef} role="dialog" aria-modal="true" aria-label="More property filters" className="ml-auto h-full w-full max-w-md overflow-y-auto rounded-2xl bg-sand-50 p-5 shadow-[0_24px_80px_rgba(18,55,42,0.28)]">
            <div className="flex justify-end">
              <button type="button" onClick={() => {
                setDrawerOpen(false);
                filterButtonRef.current?.focus();
              }} aria-label="Close filters" className="grid size-11 place-items-center rounded-lg border border-line bg-white text-forest-900">
                <X className="size-5" aria-hidden="true" />
              </button>
            </div>
            <PropertyFilterPanel
              draft={draft}
              onChange={setDraft}
              onApply={applyAdvanced}
              onReset={() => setDraft({ minPrice: "", maxPrice: "", bathrooms: "", types: [], amenities: [] })}
              idPrefix="mobile"
            />
          </div>
        </div>
      ) : null}

      {compareIds.length ? (
        <div className="fixed inset-x-0 bottom-4 z-40 mx-auto flex w-[calc(100%-2rem)] max-w-xl items-center justify-between gap-3 rounded-xl border border-forest-300 bg-forest-950 px-4 py-3 text-white shadow-[0_18px_45px_rgba(18,55,42,0.28)]">
          <div className="flex min-w-0 items-center gap-3">
            <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-lime text-forest-950"><Scale className="size-4" aria-hidden="true" /></span>
            <div className="min-w-0">
              <p className="text-sm font-bold">{compareIds.length} of 4 selected</p>
              <p className="truncate text-xs text-forest-100">Choose at least two homes to compare.</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button type="button" onClick={() => setCompareIds([])} aria-label="Clear comparison" className="grid size-11 place-items-center rounded-lg text-forest-100 hover:bg-white/10"><X className="size-4" aria-hidden="true" /></button>
            {compareIds.length >= 2 ? (
              <Link href={`/compare?properties=${compareIds.join(",")}`} onClick={() => persistState()} className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-lime px-4 text-sm font-extrabold text-forest-950">
                Compare <Check className="size-4" aria-hidden="true" />
              </Link>
            ) : null}
          </div>
        </div>
      ) : null}
    </main>
  );
}
