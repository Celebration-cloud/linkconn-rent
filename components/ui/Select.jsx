"use client";
import { Select, SelectItem } from "@heroui/react";

export const AppSelect = ({ label, options, ...props }) => (
  <Select label={label} {...props}>
    {options.map((opt) => (
      <SelectItem key={opt.value} value={opt.value}>
        {opt.label}
      </SelectItem>
    ))}
  </Select>
);
