"use client";

export const Skeleton = () => (
  <div className="space-y-4 max-w-6xl">
    {Array.from({ length: 4 }).map((_, i) => (
      <div
        key={i}
        className="h-24 rounded-2xl bg-gray-200/60 dark:bg-white/5 animate-pulse"
      />
    ))}
  </div>
);
