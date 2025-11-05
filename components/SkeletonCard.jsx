"use client";

export default function SkeletonCard({ count = 6 }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 py-6">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="animate-pulse rounded-2xl overflow-hidden bg-muted h-64"
        />
      ))}
    </div>
  );
}
