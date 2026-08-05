export default function AdminOverviewLoading() {
  return (
    <div className="p-7">
      <div className="mx-auto max-w-7xl">
        <div className="h-56 animate-pulse rounded-3xl bg-sand-200" />
        <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, index) => (
            <div
              key={index}
              className="h-36 animate-pulse rounded-2xl bg-sand-200"
            />
          ))}
        </div>
      </div>
    </div>
  );
}
