"use client";

import { Card, CardBody } from "@heroui/react";

const steps = [
  {
    step: "1",
    title: "Sign Up",
    desc: "Join as a tenant or landlord in seconds.",
  },
  {
    step: "2",
    title: "Add or Find Properties",
    desc: "List your home or search available rentals easily.",
  },
  {
    step: "3",
    title: "Manage Rent Digitally",
    desc: "Pay, track, and resolve issues from your dashboard.",
  },
];

export default function HowItWorks() {
  return (
    <div className="flex flex-col md:flex-row justify-center gap-6">
      {steps.map((s, i) => (
        <Card key={i} className="text-center p-6 flex-1">
          <CardBody>
            <div className="text-primary font-bold text-4xl mb-2">{s.step}</div>
            <h4 className="text-xl font-semibold mb-2">{s.title}</h4>
            <p className="text-default-600">{s.desc}</p>
          </CardBody>
        </Card>
      ))}
    </div>
  );
}
