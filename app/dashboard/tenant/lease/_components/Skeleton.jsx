export const Skeleton = () => (
  <div className="space-y-4 max-w-6xl">
    {Array.from({ length: 3 }).map((_, i) => (
      <div
        key={i}
        className="h-32 rounded-2xl bg-gray-100 dark:bg-white/5 animate-pulse"
      />
    ))}
  </div>
);
