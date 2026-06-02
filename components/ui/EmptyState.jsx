"use client";
import { Button } from "@heroui/react";
import { FileIcon } from "lucide-react";

export const EmptyState = ({ title, message, action, onAction }) => (
  <div className="flex flex-col items-center justify-center text-center py-12 space-y-4">
    <FileIcon className="h-12 w-12 text-default-400" />
    <h3 className="text-lg font-semibold">{title}</h3>
    <p className="text-default-500">{message}</p>
    {action && (
      <Button color="primary" onPress={onAction}>
        {action}
      </Button>
    )}
  </div>
);
