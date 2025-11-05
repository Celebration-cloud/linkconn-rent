"use client";
import { Textarea } from "@heroui/react";

export const AppTextarea = ({ label, placeholder, ...props }) => (
  <Textarea
    label={label}
    placeholder={placeholder}
    variant="bordered"
    {...props}
  />
);
