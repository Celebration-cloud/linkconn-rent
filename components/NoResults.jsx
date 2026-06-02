"use client";

import Link from "next/link";

import Button from "@/components/ui/Button";

export default function NoResults() {
  return (
    <div className="py-24 text-center">
      <h3 className="text-xl font-semibold mb-3">No properties found</h3>
      <p className="text-sm text-muted-foreground mb-6">
        Try adjusting your filters or search terms.
      </p>

      <div className="flex gap-3 justify-center">
        <Button onClick={() => history.back()}>Go Back</Button>
        <Link href="/properties">
          <Button variant="outline">Clear Filters</Button>
        </Link>
      </div>
    </div>
  );
}
