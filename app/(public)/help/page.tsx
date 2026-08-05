import type { Metadata } from "next";
import { HelpCenter } from "@/components/stitch/help-center";

export const metadata: Metadata = {
  title: "Help and support | LinkConn Rent",
  description:
    "Get help with rentals, verification, viewings, payments, leases and maintenance.",
};

export default function HelpPage() {
  return <HelpCenter />;
}
