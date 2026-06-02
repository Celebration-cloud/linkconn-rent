"use client";

import { Button, Input } from "@heroui/react";
import { Search } from "lucide-react";

export default function Hero() {
  return (
    <section className="relative w-full flex flex-col items-center justify-center text-center py-24 px-6 bg-gradient-to-br from-primary/10 via-background to-secondary/10">
      <h1 className="text-5xl font-bold mb-4">
        Find your next home — fast, transparent, and verified.
      </h1>
      <p className="text-lg text-default-600 mb-8 max-w-2xl">
        Discover rentals, manage leases, and simplify rent payments — all in one
        place.
      </p>

      <div className="flex flex-col md:flex-row gap-3 w-full max-w-2xl bg-content2 p-4 rounded-xl shadow-lg">
        <Input placeholder="Location" variant="bordered" />
        <Input placeholder="Property Type" variant="bordered" />
        <Input placeholder="Price Range" variant="bordered" />
        <Button color="primary" endContent={<Search size={18} />}>
          Search
        </Button>
      </div>
    </section>
  );
}
