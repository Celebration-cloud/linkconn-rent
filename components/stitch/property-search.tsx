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
  type MouseEvent,
} from "react";
import {
  ArrowDownUp,
  ArrowUp,
  Check,
  ChevronLeft,
  ChevronRight,
  List,
  Map,
  RotateCcw,
  Scale,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react";
import { Checkbox, Input, Select } from "@/components/ui/form-controls";
import type { Property } from "@/domain/types/property";
import type {
  PropertySearchEnvelope,
  PropertySearchResult,
} from "@/domain/types/property-search";
import type { PropertySearchInput } from "@/schemas/operating-system";
import { toastError, toastInfo } from "@/stores/toast-store";
import { useAuth } from "@/providers/auth-provider";
import { formatCompactNaira } from "@/utils/map-property";
import {
  getPropertySearchStorageKey,
  isPropertySearchRestorationCompatible,
  parsePropertySearchRestoration,
  PROPERTY_SEARCH_RESTORE_TTL,
  PROPERTY_SEARCH_RESTORE_VERSION,
  type PropertyResultBatch,
  type PropertySearchRestorationState,
} from "@/utils/property-search-restoration";
import {
  PropertyFilterPanel,
  type AdvancedFilterDraft,
} from "./property-filter-panel";
import { StitchPropertyCard } from "./property-card";

type FilterChip = {
  key: string;
  label: string;
  remove: Record<string, string | null>;
};

const EMPTY_ADVANCED_FILTERS: AdvancedFilterDraft = {
  minPrice: "",
  maxPrice: "",
  bathrooms: "",
  types: [],
  amenities: [],
};

const SORT_OPTIONS = [
  ["recommended", "Recommended"],
  ["newest", "Newest"],
  ["lowest-rent", "Rent: low to high"],
  ["highest-rent", "Rent: high to low"],
] as const;

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

function getBlockEndPage(firstPage: number, batchCount: number) {
  return firstPage + Math.ceil(batchCount / 3) * 3 - 1;
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
  const countController = useRef<AbortController | null>(null);
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const countTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const resultsRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const drawerRef = useRef<HTMLDivElement>(null);
  const sortSheetRef = useRef<HTMLDivElement>(null);
  const activeTriggerRef = useRef<HTMLButtonElement | null>(null);
  const scrollFrame = useRef<number | null>(null);
  const waitingForSentinelExit = useRef(false);

  const baseQuery = useMemo(() => {
    const params = new URLSearchParams(searchParams.toString());
    ["page", "mode", "north", "south", "east", "west"].forEach((key) =>
      params.delete(key),
    );
    return params.toString();
  }, [searchParams]);
  const storageKey = getPropertySearchStorageKey(baseQuery);

  const initialBatch = {
    page: initialResult.pagination.page,
    items: initialResult.items,
  };
  const [searchValue, setSearchValue] = useState(initialFilters.q || "");
  const [draftFilters, setDraftFilters] = useState(() =>
    createAdvancedDraft(initialFilters),
  );
  const [batches, setBatches] = useState<PropertyResultBatch[]>([initialBatch]);
  const [pagination, setPagination] = useState(initialResult.pagination);
  const [loadingNext, setLoadingNext] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [blockEndPage, setBlockEndPage] = useState(initialBatch.page + 2);
  const [lastVisiblePage, setLastVisiblePage] = useState(initialBatch.page);
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);
  const [previewCount, setPreviewCount] = useState<number | null>(
    initialResult.pagination.totalItems,
  );
  const [counting, setCounting] = useState(false);
  const [countError, setCountError] = useState<string | null>(null);
  const [countRetry, setCountRetry] = useState(0);
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
  const isPaused = lastPage >= blockEndPage;
  const canShowSave = !isLoadingProfile && (!user || user.role === "Tenant");
  const appliedAdvancedFilters = useMemo(
    () => createAdvancedDraft(initialFilters),
    [initialFilters],
  );

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
    const raw = sessionStorage.getItem(storageKey);
    if (!raw) {
      setRestored(true);
      return;
    }
    const cached = parsePropertySearchRestoration(raw);
    if (!cached || !isPropertySearchRestorationCompatible(cached, initialResult.pagination)) {
      sessionStorage.removeItem(storageKey);
      setRestored(true);
      return;
    }
    setBatches(cached.batches);
    setPagination(cached.pagination);
    setCompareIds(cached.compareIds);
    setLastVisiblePage(cached.lastVisiblePage);
    setBlockEndPage(
      getBlockEndPage(cached.batches[0].page, cached.batches.length),
    );
    requestAnimationFrame(() =>
      requestAnimationFrame(() => window.scrollTo({ top: cached.scrollY })),
    );
    setRestored(true);
  }, [initialResult.pagination, storageKey]);

  const persistState = useCallback(
    (scrollY = window.scrollY) => {
      const next: PropertySearchRestorationState = {
        version: PROPERTY_SEARCH_RESTORE_VERSION,
        expiresAt: Date.now() + PROPERTY_SEARCH_RESTORE_TTL,
        batches,
        pagination,
        compareIds,
        lastVisiblePage,
        scrollY,
      };
      try {
        sessionStorage.setItem(storageKey, JSON.stringify(next));
      } catch {
        // Search remains usable when browser storage is unavailable.
      }
    },
    [batches, compareIds, lastVisiblePage, pagination, storageKey],
  );

  useEffect(() => {
    if (restored) persistState();
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
      setBatches((current) =>
        current.some((batch) => batch.page === result.data!.pagination.page)
          ? current
          : [...current, { page: result.data!.pagination.page, items: result.data!.items }],
      );
      setPagination(result.data.pagination);
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
    if (!sentinel || isPaused || !pagination.hasNextPage) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) {
          waitingForSentinelExit.current = false;
          return;
        }
        if (waitingForSentinelExit.current) return;
        waitingForSentinelExit.current = true;
        void loadNextPage();
      },
      { rootMargin: "240px 0px" },
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [isPaused, loadNextPage, pagination.hasNextPage]);

  useEffect(() => {
    const root = resultsRef.current;
    if (!root || batches.length < 2) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((first, second) => second.intersectionRatio - first.intersectionRatio)[0];
        const page = Number(
          (visible?.target as HTMLElement | undefined)?.dataset.propertyPage,
        );
        if (!page) return;
        setLastVisiblePage(page);
        window.history.replaceState(
          window.history.state,
          "",
          pageHref(baseQuery, page),
        );
      },
      { threshold: [0.35, 0.6] },
    );
    root
      .querySelectorAll<HTMLElement>("[data-property-page]")
      .forEach((batch) => observer.observe(batch));
    return () => observer.disconnect();
  }, [baseQuery, batches]);

  const closeAdvanced = useCallback(() => {
    countController.current?.abort();
    if (countTimer.current) clearTimeout(countTimer.current);
    setDraftFilters(appliedAdvancedFilters);
    setAdvancedOpen(false);
    activeTriggerRef.current?.focus();
  }, [appliedAdvancedFilters]);

  useEffect(() => {
    if (!advancedOpen) return;
    const drawer = drawerRef.current;
    const focusable = drawer?.querySelectorAll<HTMLElement>(
      "button:not([disabled]), input:not([disabled]), select:not([disabled])",
    );
    focusable?.[0]?.focus();
    const onKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape") {
        closeAdvanced();
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
  }, [advancedOpen, closeAdvanced]);

  useEffect(() => {
    if (!sortOpen) return;
    const focusable = sortSheetRef.current?.querySelectorAll<HTMLElement>(
      "button:not([disabled])",
    );
    focusable?.[0]?.focus();
    const onKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape") {
        setSortOpen(false);
        activeTriggerRef.current?.focus();
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
  }, [sortOpen]);

  const getAdvancedCount = useCallback(async () => {
    countController.current?.abort();
    const controller = new AbortController();
    countController.current = controller;
    const params = new URLSearchParams(baseQuery);
    ["minPrice", "maxPrice", "bathrooms", "types", "type", "amenities", "page", "pageSize"].forEach(
      (key) => params.delete(key),
    );
    if (draftFilters.minPrice) params.set("minPrice", draftFilters.minPrice);
    if (draftFilters.maxPrice) params.set("maxPrice", draftFilters.maxPrice);
    if (draftFilters.bathrooms) params.set("bathrooms", draftFilters.bathrooms);
    if (draftFilters.types.length) params.set("types", draftFilters.types.join(","));
    if (draftFilters.amenities.length) params.set("amenities", draftFilters.amenities.join(","));
    setCounting(true);
    setCountError(null);
    try {
      const response = await fetch(`/api/properties/count?${params.toString()}`, {
        cache: "no-store",
        signal: controller.signal,
      });
      const result = (await response.json()) as {
        success: boolean;
        data?: { totalItems: number };
        message: string;
      };
      if (!response.ok || !result.success || !result.data) {
        throw new Error(result.message || "Unable to preview this result count");
      }
      setPreviewCount(result.data.totalItems);
    } catch (error) {
      if (!(error instanceof DOMException && error.name === "AbortError")) {
        setPreviewCount(null);
        setCountError(
          error instanceof Error
            ? error.message
            : "Unable to preview this result count",
        );
      }
    } finally {
      if (countController.current === controller) setCounting(false);
    }
  }, [baseQuery, draftFilters]);

  useEffect(() => {
    if (!advancedOpen) return;
    if (countTimer.current) clearTimeout(countTimer.current);
    countTimer.current = setTimeout(() => void getAdvancedCount(), 300);
    return () => {
      if (countTimer.current) clearTimeout(countTimer.current);
    };
  }, [advancedOpen, countRetry, getAdvancedCount]);

  useEffect(
    () => () => {
      requestController.current?.abort();
      countController.current?.abort();
    },
    [],
  );

  const openAdvanced = (event: MouseEvent<HTMLButtonElement>) => {
    activeTriggerRef.current = event.currentTarget;
    setDraftFilters(appliedAdvancedFilters);
    setPreviewCount(pagination.totalItems);
    setCountError(null);
    setAdvancedOpen(true);
  };

  const applyAdvanced = () => {
    replaceQuery({
      minPrice: draftFilters.minPrice || null,
      maxPrice: draftFilters.maxPrice || null,
      bathrooms: draftFilters.bathrooms || null,
      types: draftFilters.types.length ? draftFilters.types.join(",") : null,
      amenities: draftFilters.amenities.length
        ? draftFilters.amenities.join(",")
        : null,
    });
    setAdvancedOpen(false);
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
      chips.push({ key: `type-${type}`, label: type, remove: { types: remaining.length ? remaining.join(",") : null } });
    });
    if (initialFilters.verified !== undefined) chips.push({ key: "verified", label: initialFilters.verified ? "Verified only" : "Unverified", remove: { verified: null } });
    if (initialFilters.period) chips.push({ key: "period", label: initialFilters.period === "month" ? "Monthly rent" : "Yearly rent", remove: { period: null } });
    if (initialFilters.bedrooms !== undefined) chips.push({ key: "bedrooms", label: `${initialFilters.bedrooms}+ bedrooms`, remove: { bedrooms: null } });
    if (initialFilters.bathrooms !== undefined) chips.push({ key: "bathrooms", label: `${initialFilters.bathrooms}+ bathrooms`, remove: { bathrooms: null } });
    if (initialFilters.minPrice !== undefined) chips.push({ key: "minPrice", label: `From ${formatCompactNaira(initialFilters.minPrice)}`, remove: { minPrice: null } });
    if (initialFilters.maxPrice !== undefined) chips.push({ key: "maxPrice", label: `Up to ${formatCompactNaira(initialFilters.maxPrice)}`, remove: { maxPrice: null } });
    initialFilters.amenities?.forEach((amenity) => {
      const remaining = initialFilters.amenities!.filter((item) => item !== amenity);
      chips.push({ key: `amenity-${amenity}`, label: amenity, remove: { amenities: remaining.length ? remaining.join(",") : null } });
    });
    return chips;
  }, [initialFilters]);

  const mapParams = new URLSearchParams(baseQuery);
  mapParams.delete("pageSize");
  const mapHref = mapParams.toString()
    ? `/properties/map?${mapParams.toString()}`
    : "/properties/map";
  const activeSort = initialFilters.sort || "recommended";
  const activeSortLabel = SORT_OPTIONS.find(([value]) => value === activeSort)?.[1] || "Recommended";

  function onSearchKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter") applySearch();
  }

  const chips = (
    <>
      {filterChips.map((chip) => (
        <button
          key={chip.key}
          type="button"
          onClick={() => replaceQuery(chip.remove)}
          className="inline-flex min-h-10 shrink-0 items-center gap-1.5 rounded-lg border border-forest-200 bg-forest-50 px-3 text-xs font-bold text-forest-900 transition hover:border-forest-500"
        >
          {chip.label}<X className="size-3.5" aria-hidden="true" />
        </button>
      ))}
    </>
  );

  return (
    <main id="main-content" className="min-h-screen bg-sand-50 pb-28 pt-16">
      <section className="border-b border-line bg-sand-100">
        <div className="stitch-container py-9 sm:py-11">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-forest-700">Verified rentals across Nigeria</p>
          <h1 className="mt-2 max-w-3xl text-3xl font-extrabold tracking-[-0.045em] text-ink sm:text-4xl">
            Find a home with the full cost in view.
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
            Search approved rentals and compare the costs that matter before you move.
          </p>
        </div>
      </section>

      <div className="sticky top-16 z-30 border-b border-line bg-sand-50/95 backdrop-blur-xl lg:static lg:bg-sand-100">
        <div className="stitch-container py-3 lg:pb-8 lg:pt-0">
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

          <div className="mt-2 grid grid-cols-4 gap-2 lg:hidden" aria-label="Property view controls">
            <button
              type="button"
              onClick={openAdvanced}
              aria-expanded={advancedOpen}
              className="inline-flex min-h-11 items-center justify-center gap-1.5 rounded-lg border border-line bg-white px-2 text-xs font-bold text-forest-900"
            >
              <SlidersHorizontal className="size-4" aria-hidden="true" /> Filters
            </button>
            <button
              type="button"
              onClick={(event) => {
                activeTriggerRef.current = event.currentTarget;
                setSortOpen(true);
              }}
              aria-expanded={sortOpen}
              className="inline-flex min-h-11 items-center justify-center gap-1.5 rounded-lg border border-line bg-white px-2 text-xs font-bold text-forest-900"
            >
              <ArrowDownUp className="size-4" aria-hidden="true" /> Sort
            </button>
            <span aria-current="page" className="inline-flex min-h-11 items-center justify-center gap-1.5 rounded-lg bg-forest-900 px-2 text-xs font-bold text-white">
              <List className="size-4" aria-hidden="true" /> List
            </span>
            <Link href={mapHref} onClick={() => persistState()} className="inline-flex min-h-11 items-center justify-center gap-1.5 rounded-lg border border-line bg-white px-2 text-xs font-bold text-forest-900">
              <Map className="size-4" aria-hidden="true" /> Map
            </Link>
          </div>

          {filterChips.length ? (
            <div className="-mx-1 mt-2 flex gap-2 overflow-x-auto px-1 pb-1 lg:hidden" aria-label="Applied filters">
              {chips}
            </div>
          ) : null}
        </div>
      </div>

      <div className="stitch-container grid gap-7 py-7 lg:grid-cols-[13rem_minmax(0,1fr)]">
        <aside className="hidden h-fit border-r border-line pr-5 lg:sticky lg:top-24 lg:block">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-extrabold text-ink">Quick filters</h2>
            <button type="button" onClick={() => router.replace("/properties", { scroll: false })} className="min-h-10 text-xs font-bold text-forest-700">Reset</button>
          </div>
          <div className="mt-4 space-y-5">
            <label className="flex min-h-11 items-center gap-3 text-sm font-semibold text-forest-900">
              <Checkbox
                checked={initialFilters.verified === true}
                onChange={() => replaceQuery({ verified: initialFilters.verified === true ? null : "true" })}
              />
              Verified only
            </label>
            <label className="block">
              <span className="mb-1.5 block text-xs font-bold text-forest-900">Rent period</span>
              <Select value={initialFilters.period || ""} onChange={(event) => replaceQuery({ period: event.target.value || null })}>
                <option value="">Any period</option>
                <option value="year">Yearly</option>
                <option value="month">Monthly</option>
              </Select>
            </label>
            <fieldset>
              <legend className="mb-2 text-xs font-bold text-forest-900">Bedrooms</legend>
              <div className="grid grid-cols-2 gap-2">
                {["", "1", "2", "3"].map((value) => (
                  <button
                    key={value || "any-bedrooms"}
                    type="button"
                    onClick={() => replaceQuery({ bedrooms: value || null })}
                    aria-pressed={(initialFilters.bedrooms === undefined ? "" : String(initialFilters.bedrooms)) === value}
                    className={`min-h-11 rounded-lg border text-xs font-bold ${(initialFilters.bedrooms === undefined ? "" : String(initialFilters.bedrooms)) === value ? "border-forest-700 bg-forest-700 text-white" : "border-line bg-white text-muted"}`}
                  >
                    {value ? `${value}${value === "3" ? "+" : ""}` : "Any"}
                  </button>
                ))}
              </div>
            </fieldset>
          </div>
        </aside>

        <section aria-busy={loadingNext} aria-describedby="property-result-status">
          <div className="rounded-xl border border-line bg-white p-3 sm:p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p id="property-result-status" className="text-sm font-semibold text-muted" aria-live="polite">
                <span className="font-extrabold tabular-nums text-forest-900">{pagination.totalItems}</span>{" "}
                {pagination.totalItems === 1 ? "property" : "properties"}
              </p>
              <div className="hidden items-center gap-2 lg:flex">
                <button type="button" onClick={openAdvanced} aria-expanded={advancedOpen} className="stitch-button stitch-button-secondary">
                  <SlidersHorizontal className="size-4" aria-hidden="true" /> More filters
                </button>
                <Select value={activeSort} onChange={(event) => replaceQuery({ sort: event.target.value === "recommended" ? null : event.target.value })} aria-label="Sort properties" className="min-w-44 font-semibold">
                  {SORT_OPTIONS.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                </Select>
                <Link href={mapHref} onClick={() => persistState()} className="stitch-button stitch-button-secondary shrink-0">
                  <Map className="size-4" aria-hidden="true" /> Show map
                </Link>
              </div>
            </div>
            {filterChips.length ? (
              <div className="mt-3 hidden flex-wrap items-center gap-2 lg:flex" aria-label="Applied filters">
                {chips}
                <button type="button" onClick={() => router.replace("/properties", { scroll: false })} className="inline-flex min-h-10 items-center gap-1.5 px-2 text-xs font-bold text-forest-700">
                  <RotateCcw className="size-3.5" aria-hidden="true" /> Clear all
                </button>
              </div>
            ) : null}
          </div>

          {properties.length ? (
            <div ref={resultsRef} className="mt-5 space-y-8">
              {batches.map((batch) => (
                <div key={batch.page} data-property-page={batch.page} className="scroll-mt-44 lg:scroll-mt-28">
                  <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
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
                        detailsHref={`/properties/${property.id}?returnTo=${encodeURIComponent(pageHref(baseQuery, lastVisiblePage))}`}
                      />
                    ))}
                  </div>
                </div>
              ))}
              {loadingNext ? (
                <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3" aria-label="Loading more properties">
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
          {!loadError && pagination.hasNextPage && isPaused ? (
            <div className="mt-8 text-center">
              <button type="button" onClick={() => {
                waitingForSentinelExit.current = true;
                setBlockEndPage(lastPage + 3);
                void loadNextPage();
              }} className="stitch-button">
                Continue browsing <ChevronRight className="size-4" aria-hidden="true" />
              </button>
              <p className="mt-2 text-xs text-muted">Loading pauses after every three displayed pages.</p>
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

      {advancedOpen ? (
        <div className="fixed inset-0 z-[110] bg-forest-950/45 backdrop-blur-sm" role="presentation" onMouseDown={(event) => {
          if (event.target === event.currentTarget) closeAdvanced();
        }}>
          <div ref={drawerRef} role="dialog" aria-modal="true" aria-label="More property filters" className="ml-auto h-full w-full overflow-y-auto bg-sand-50 p-5 shadow-[0_24px_80px_rgba(18,55,42,0.28)] sm:max-w-md sm:border-l sm:border-line">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-bold text-forest-700">Advanced search</p>
                <h2 className="text-xl font-extrabold text-ink">More filters</h2>
              </div>
              <button type="button" onClick={closeAdvanced} aria-label="Close filters" className="grid size-11 place-items-center rounded-lg border border-line bg-white text-forest-900">
                <X className="size-5" aria-hidden="true" />
              </button>
            </div>
            <div className="mt-5">
              <PropertyFilterPanel
                draft={draftFilters}
                onChange={setDraftFilters}
                onApply={applyAdvanced}
                onCancel={closeAdvanced}
                onReset={() => setDraftFilters(EMPTY_ADVANCED_FILTERS)}
                onRetryCount={() => setCountRetry((value) => value + 1)}
                resultCount={previewCount}
                counting={counting}
                countError={countError}
                idPrefix="advanced"
              />
            </div>
          </div>
        </div>
      ) : null}

      {sortOpen ? (
        <div className="fixed inset-0 z-[110] bg-forest-950/45 backdrop-blur-sm lg:hidden" role="presentation" onMouseDown={(event) => {
          if (event.target === event.currentTarget) {
            setSortOpen(false);
            activeTriggerRef.current?.focus();
          }
        }}>
          <div ref={sortSheetRef} role="dialog" aria-modal="true" aria-label="Sort properties" className="absolute inset-x-0 bottom-0 rounded-t-3xl bg-sand-50 p-5 shadow-[0_-24px_60px_rgba(18,55,42,0.24)]">
            <div className="flex items-center justify-between">
              <div><p className="text-xs font-bold text-forest-700">Current: {activeSortLabel}</p><h2 className="text-xl font-extrabold text-ink">Sort properties</h2></div>
              <button type="button" onClick={() => setSortOpen(false)} aria-label="Close sorting" className="grid size-11 place-items-center rounded-lg border border-line bg-white"><X className="size-5" /></button>
            </div>
            <div className="mt-4 space-y-2">
              {SORT_OPTIONS.map(([value, label]) => (
                <button key={value} type="button" onClick={() => {
                  replaceQuery({ sort: value === "recommended" ? null : value });
                  setSortOpen(false);
                }} aria-pressed={activeSort === value} className={`flex min-h-12 w-full items-center justify-between rounded-lg border px-4 text-left text-sm font-bold ${activeSort === value ? "border-forest-700 bg-forest-50 text-forest-900" : "border-line bg-white text-muted"}`}>
                  {label}{activeSort === value ? <Check className="size-4" aria-hidden="true" /> : null}
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : null}

      {compareIds.length ? (
        <div className="fixed inset-x-0 bottom-4 z-40 mx-auto flex w-[calc(100%-2rem)] max-w-xl items-center justify-between gap-3 rounded-xl border border-forest-300 bg-forest-950 px-4 py-3 text-white shadow-[0_18px_45px_rgba(18,55,42,0.28)]">
          <div className="flex min-w-0 items-center gap-3">
            <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-lime text-forest-950"><Scale className="size-4" aria-hidden="true" /></span>
            <div className="min-w-0"><p className="text-sm font-bold">{compareIds.length} of 4 selected</p><p className="truncate text-xs text-forest-100">Choose at least two homes to compare.</p></div>
          </div>
          <div className="flex items-center gap-2">
            <button type="button" onClick={() => setCompareIds([])} aria-label="Clear comparison" className="grid size-11 place-items-center rounded-lg text-forest-100 hover:bg-white/10"><X className="size-4" /></button>
            {compareIds.length >= 2 ? <Link href={`/compare?properties=${compareIds.join(",")}`} onClick={() => persistState()} className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-lime px-4 text-sm font-extrabold text-forest-950">Compare <Check className="size-4" /></Link> : null}
          </div>
        </div>
      ) : null}
    </main>
  );
}
