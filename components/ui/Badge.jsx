"use client";
import { Badge } from "@heroui/react";

export const AppBadge = ({ text, color = "primary", ...props }) => (
  <Badge color={color} {...props}>
    {text}
  </Badge>
);
