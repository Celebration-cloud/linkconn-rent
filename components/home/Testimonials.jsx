"use client";

import { Card, CardHeader, CardBody } from "@heroui/react";
import Image from "next/image";

const testimonials = [
  {
    name: "Ada E.",
    comment: "I’ve automated my rent reminders — this platform just works.",
    avatar: "/avatars/ada.png",
  },
  {
    name: "Tunde K.",
    comment: "Managing tenants has never been easier. Love the dashboard!",
    avatar: "/avatars/tunde.png",
  },
  {
    name: "Maria O.",
    comment: "LinkConn Rent keeps me organized every month.",
    avatar: "/avatars/maria.png",
  },
];

export default function Testimonials() {
  return (
    <section className="py-16 bg-default-50">
      <h2 className="text-2xl font-semibold text-center mb-8">
        What our users say
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto px-4">
        {testimonials.map((t, i) => (
          <Card
            key={i}
            className="shadow-md rounded-2xl hover:scale-[1.02] transition-transform"
          >
            <CardHeader className="flex items-center gap-3">
              <Image
                alt={t.name}
                className="rounded-full"
                height={48}
                src={t.avatar}
                width={48}
              />
              <span className="font-medium">{t.name}</span>
            </CardHeader>
            <CardBody className="text-default-600 text-sm">
              “{t.comment}”
            </CardBody>
          </Card>
        ))}
      </div>
    </section>
  );
}
