"use client";

export const MaintenanceFilters = ({
  filter,
  setFilter,
}) => (
  <div className="flex gap-2 flex-wrap">
    {["all", "open", "in_progress", "resolved"].map((s) => (
      <button
        key={s}
        onClick={() => setFilter(s)}
        className={`px-4 py-2 rounded-xl text-sm transition ${
          filter === s
            ? "bg-gray-900 text-white dark:bg-white dark:text-gray-900"
            : "bg-gray-200/60 text-gray-700 dark:bg-white/5 dark:text-gray-300"
        }`}
      >
        {s === "all" ? "All" : s.replace("_", " ")}
      </button>
    ))}
  </div>
);
