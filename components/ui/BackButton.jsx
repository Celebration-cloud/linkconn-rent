"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import Button from "./Button";

export default function BackButton() {
  const router = useRouter();

  return (
    <Button
      className="flex items-center gap-1 text-sm text-default-600 hover:text-primary transition"
      onClick={() => router.back()}
    >
      <ArrowLeft size={16} />
      Back
    </Button>
  );
}
