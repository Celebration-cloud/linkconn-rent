"use client";

import { Card, CardBody } from "@heroui/react";
import { Home, ShieldCheck, Cpu } from "lucide-react";

const reasons = [
  {
    icon: Home,
    title: "Digital Rent Management",
    desc: "Pay, track, and store rent info effortlessly in one dashboard.",
  },
  {
    icon: ShieldCheck,
    title: "Verified Agents",
    desc: "Browse properties managed by trusted and vetted professionals.",
  },
  {
    icon: Cpu,
    title: "Smart Automation",
    desc: "Get AI-powered insights and reminders for rent and repairs.",
  },
];

export default function WhyChoose() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {reasons.map((item, i) => (
        <Card key={i} className="text-center p-6 hover:bg-content1 transition">
          <CardBody>
            <item.icon size={36} className="mx-auto mb-4 text-primary" />
            <h4 className="text-xl font-semibold mb-2">{item.title}</h4>
            <p className="text-default-600">{item.desc}</p>
          </CardBody>
        </Card>
      ))}
    </div>
  );
}
