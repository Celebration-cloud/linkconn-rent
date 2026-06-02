"use client";

import { Button } from "@heroui/react";
import Link from "next/link";

export default function CTA() {
  return (
    <section className="w-full text-center py-20 px-6 bg-primary/10 mt-16">
      <h2 className="text-3xl font-bold mb-4">
        Ready to simplify your rental life?
      </h2>
      <p className="text-default-600 mb-8">
        Get started with LinkConn Rent today and manage your properties smarter.
      </p>
      <Link href="/auth/signup">
        <Button color="primary" size="lg">
          Get Started
        </Button>
      </Link>
    </section>
  );
}
