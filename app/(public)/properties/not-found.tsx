import Link from 'next/link';

export default function PropertyNotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6 px-4 text-center">
      <div className="space-y-2">
        <h2 className="text-3xl font-bold text-foreground">Property Not Found</h2>
        <p className="text-muted-foreground max-w-md">
          The property you are looking for does not exist or has been removed from our listings.
        </p>
      </div>
      <Link
        href="/properties"
        className="rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:opacity-90 transition-opacity"
      >
        Browse Properties
      </Link>
    </div>
  );
}
