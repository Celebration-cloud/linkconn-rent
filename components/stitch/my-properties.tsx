"use client";

import Image from "next/image";
import Link from "next/link";
import {
  Building2,
  CheckCircle2,
  Copy,
  ExternalLink,
  Eye,
  FileText,
  Filter,
  Grid,
  Heart,
  LayoutGrid,
  List,
  MapPin,
  MoreHorizontal,
  Plus,
  Search,
  ShieldCheck,
  TrendingUp,
  Users,
  Wrench,
} from "lucide-react";
import { Input } from "@/components/ui/form-controls";
import { useEffect, useMemo, useState } from "react";
import { toastError, toastSuccess } from "@/stores/toast-store";
import { formatNaira } from "@/utils/map-property";

interface OwnedProperty {
  id: string;
  title: string;
  location: string;
  price: number;
  status: string;
  moderationStatus: string;
  images: string[];
  _count: { applications: number; maintenance: number };
}

export function MyProperties() {
  const [items, setItems] = useState<OwnedProperty[]>([]);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("All");
  const [viewMode, setViewMode] = useState<"grid" | "list">("list");
  const [loading, setLoading] = useState(true);

  async function load() {
    try {
      const response = await fetch("/api/properties/mine", { cache: "no-store" });
      const result = (await response.json()) as {
        success: boolean;
        data?: OwnedProperty[];
        message: string;
      };
      if (result.success) {
        setItems(result.data || []);
      } else {
        toastError("Properties unavailable", result.message);
      }
    } catch {
      toastError("Connection error", "Unable to load properties");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  const filtered = useMemo(
    () =>
      items.filter(
        (item) =>
          item.title.toLowerCase().includes(query.toLowerCase()) &&
          (filter === "All" || item.status === filter)
      ),
    [items, query, filter]
  );

  async function action(id: string, value: "publish" | "archive" | "duplicate") {
    try {
      const response = await fetch(`/api/properties/${id}/actions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: value }),
      });
      const result = (await response.json()) as { success: boolean; message: string };
      if (result.success) {
        toastSuccess("Property updated", result.message);
        await load();
      } else {
        toastError("Action failed", result.message);
      }
    } catch {
      toastError("Error", "Could not complete action");
    }
  }

  const rentedCount = items.filter((item) => item.status === "Rented").length;
  const occupancyRate = items.length ? Math.round((rentedCount / items.length) * 100) : 0;
  const monthlyRevenue = items
    .filter((item) => item.status === "Rented")
    .reduce((total, item) => total + item.price / 12, 0);
  const totalIssues = items.reduce((total, item) => total + item._count.maintenance, 0);
  const totalApps = items.reduce((total, item) => total + item._count.applications, 0);

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      {/* Top Banner */}
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-2xl border border-line bg-gradient-to-r from-forest-900 via-forest-800 to-forest-950 p-6 text-white shadow-sm">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-forest-700/60 px-2.5 py-0.5 text-xs font-bold text-forest-100">
            <Building2 className="size-3.5 text-lime" />
            <span>Landlord Portfolio</span>
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
            My Properties
          </h1>
          <p className="text-xs text-forest-200 sm:text-sm">
            Publish listings, monitor occupancy, track tenant applications, and adjust rental terms.
          </p>
        </div>
        <Link
          href="/dashboard/properties/new"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-lime px-4 py-2.5 text-xs font-extrabold text-forest-950 shadow-sm hover:bg-lime/90 transition-all active:scale-[0.98] shrink-0"
        >
          <Plus className="size-4" /> Add new property
        </Link>
      </header>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <PropertyMetric
          label="Total properties"
          value={String(items.length)}
          icon={Building2}
          tone="default"
        />
        <PropertyMetric
          label="Occupancy rate"
          value={`${occupancyRate}%`}
          icon={TrendingUp}
          tone="accent"
        />
        <PropertyMetric
          label="Est. monthly revenue"
          value={formatNaira(monthlyRevenue)}
          icon={Building2}
          tone="success"
        />
        <PropertyMetric
          label="Active inquiries"
          value={String(totalApps)}
          icon={Users}
          tone="warning"
        />
      </div>

      {/* Filter and View Controls Bar */}
      <div className="flex flex-col gap-3 rounded-xl border border-line bg-white p-3 shadow-xs sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted" />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search by title, location or city..."
            className="pl-9"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto">
          {["All", "Available", "Rented", "Draft", "Archived"].map((value) => (
            <button
              key={value}
              onClick={() => setFilter(value)}
              className={`min-h-9 shrink-0 rounded-lg px-3 text-xs font-bold transition-colors ${
                filter === value
                  ? "bg-forest-800 text-white"
                  : "border border-line bg-sand-50 text-muted hover:bg-white hover:text-ink"
              }`}
            >
              {value}
            </button>
          ))}

          <div className="h-6 w-px bg-line shrink-0 mx-1" />

          <div className="flex items-center rounded-lg border border-line bg-sand-50 p-0.5">
            <button
              type="button"
              onClick={() => setViewMode("list")}
              title="List view"
              className={`p-1.5 rounded-md transition-colors ${
                viewMode === "list" ? "bg-white text-forest-900 shadow-xs" : "text-muted hover:text-ink"
              }`}
            >
              <List className="size-4" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode("grid")}
              title="Grid view"
              className={`p-1.5 rounded-md transition-colors ${
                viewMode === "grid" ? "bg-white text-forest-900 shadow-xs" : "text-muted hover:text-ink"
              }`}
            >
              <LayoutGrid className="size-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Properties List/Grid */}
      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="h-64 animate-pulse rounded-2xl bg-sand-200" />
          ))}
        </div>
      ) : filtered.length ? (
        viewMode === "list" ? (
          <div className="overflow-hidden rounded-2xl border border-line bg-white shadow-xs divide-y divide-line">
            {filtered.map((item) => (
              <article
                key={item.id}
                className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-sand-50/60 transition-colors"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  {item.images[0] ? (
                    <Image
                      src={item.images[0]}
                      alt={item.title}
                      width={88}
                      height={68}
                      className="h-16 w-22 rounded-xl object-cover border border-line shrink-0"
                    />
                  ) : (
                    <div className="grid h-16 w-22 place-items-center rounded-xl bg-sand-200 text-muted shrink-0">
                      <Building2 className="size-6" />
                    </div>
                  )}

                  <div className="min-w-0 space-y-1">
                    <div className="flex items-center gap-2">
                      <h2 className="truncate text-sm font-extrabold text-ink">{item.title}</h2>
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-extrabold ${
                          item.status === "Available"
                            ? "bg-forest-50 text-forest-800 ring-1 ring-forest-600/20"
                            : item.status === "Rented"
                            ? "bg-forest-100 text-forest-900 ring-1 ring-forest-700/20"
                            : "bg-sand-200 text-ink"
                        }`}
                      >
                        {item.status}
                      </span>
                    </div>

                    <p className="flex items-center gap-1 truncate text-xs text-muted">
                      <MapPin className="size-3 text-muted shrink-0" /> {item.location}
                    </p>

                    <div className="flex items-center gap-3 text-[11px] font-semibold text-muted">
                      <span className="flex items-center gap-1">
                        <Users className="size-3 text-forest-700" /> {item._count.applications} application(s)
                      </span>
                      <span>·</span>
                      <span className="flex items-center gap-1">
                        <Wrench className="size-3 text-amber-700" /> {item._count.maintenance} issue(s)
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-4 border-t border-line sm:border-0 pt-3 sm:pt-0">
                  <div className="text-left sm:text-right">
                    <p className="text-sm font-black text-ink">
                      {formatNaira(item.price)}
                      <span className="text-xs font-normal text-muted"> / yr</span>
                    </p>
                    <p className="text-[10px] text-muted">
                      {formatNaira(Math.round(item.price / 12))} / mo
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <Link
                      href={`/properties/${item.id}`}
                      target="_blank"
                      className="grid size-9 place-items-center rounded-xl border border-line bg-white text-muted hover:text-ink hover:border-forest-400 transition-colors"
                      title="View public listing"
                    >
                      <Eye className="size-4" />
                    </Link>
                    <button
                      type="button"
                      onClick={() => void action(item.id, "duplicate")}
                      className="grid size-9 place-items-center rounded-xl border border-line bg-white text-muted hover:text-ink hover:border-forest-400 transition-colors"
                      title="Duplicate property"
                    >
                      <Copy className="size-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        void action(item.id, item.status === "Archived" ? "publish" : "archive")
                      }
                      className="grid size-9 place-items-center rounded-xl border border-line bg-white text-muted hover:text-ink hover:border-forest-400 transition-colors"
                      title={item.status === "Archived" ? "Unarchive property" : "Archive property"}
                    >
                      <MoreHorizontal className="size-4" />
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((item) => (
              <article
                key={item.id}
                className="overflow-hidden rounded-2xl border border-line bg-white shadow-xs transition-shadow hover:shadow-md"
              >
                <div className="relative h-44 w-full bg-sand-200">
                  {item.images[0] ? (
                    <Image
                      src={item.images[0]}
                      alt={item.title}
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="object-cover"
                    />
                  ) : (
                    <div className="grid h-full place-items-center text-muted">
                      <Building2 className="size-8" />
                    </div>
                  )}
                  <span
                    className={`absolute top-3 left-3 rounded-full px-2.5 py-0.5 text-xs font-bold backdrop-blur-xs ${
                      item.status === "Available"
                        ? "bg-forest-800 text-white"
                        : item.status === "Rented"
                        ? "bg-forest-950 text-white"
                        : "bg-ink/80 text-white"
                    }`}
                  >
                    {item.status}
                  </span>
                </div>

                <div className="p-4 space-y-3">
                  <div>
                    <h2 className="truncate text-sm font-extrabold text-ink">{item.title}</h2>
                    <p className="flex items-center gap-1 truncate text-xs text-muted mt-0.5">
                      <MapPin className="size-3 text-muted shrink-0" /> {item.location}
                    </p>
                  </div>

                  <div className="flex items-center justify-between border-t border-line pt-3">
                    <div>
                      <p className="text-sm font-black text-ink">
                        {formatNaira(item.price)}
                        <span className="text-[11px] font-normal text-muted"> / yr</span>
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <Link
                        href={`/properties/${item.id}`}
                        target="_blank"
                        className="grid size-8 place-items-center rounded-lg border border-line text-muted hover:text-ink"
                        title="View listing"
                      >
                        <Eye className="size-3.5" />
                      </Link>
                      <button
                        type="button"
                        onClick={() => void action(item.id, "duplicate")}
                        className="grid size-8 place-items-center rounded-lg border border-line text-muted hover:text-ink"
                        title="Duplicate"
                      >
                        <Copy className="size-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )
      ) : (
        <div className="rounded-2xl border border-dashed border-line bg-white p-12 text-center">
          <Building2 className="mx-auto size-10 text-muted" />
          <h2 className="mt-3 text-base font-extrabold text-ink">No properties found</h2>
          <p className="mt-1 text-xs text-muted max-w-sm mx-auto">
            {query || filter !== "All"
              ? "Try clearing your search or filter criteria to see all listings."
              : "You have not created any property listings yet. Add your first property to start receiving verified tenant applications."}
          </p>
          <Link
            href="/dashboard/properties/new"
            className="stitch-button mt-5 inline-flex justify-center text-xs font-bold"
          >
            <Plus className="size-4" /> Add your first property
          </Link>
        </div>
      )}
    </div>
  );
}

function PropertyMetric({
  label,
  value,
  icon: Icon,
  tone = "default",
}: {
  label: string;
  value: string;
  icon: typeof Building2;
  tone?: "default" | "accent" | "warning" | "success";
}) {
  const toneClasses = {
    default: "border-line bg-white",
    accent: "border-forest-300 bg-forest-50/60",
    warning: "border-amber-200 bg-amber-50/50",
    success: "border-forest-200 bg-forest-50/50",
  };

  return (
    <article className={`rounded-2xl border p-4 shadow-xs ${toneClasses[tone]}`}>
      <div className="flex items-center justify-between">
        <p className="text-xs font-bold uppercase tracking-wider text-muted">{label}</p>
        <Icon className="size-4 text-forest-700" />
      </div>
      <p className="mt-2 text-xl font-black tabular-nums text-ink">{value}</p>
    </article>
  );
}
