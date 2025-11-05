"use client";

import React from "react";
import { addToast } from "@heroui/react";
import { CheckCircle, XCircle, Info, AlertTriangle } from "lucide-react";

export const showToast = ({
  title = "",
  description = "",
  type = "success",
}) => {
  const icons = {
    success: (
      <CheckCircle className="h-5 w-5 text-green-500 dark:text-green-400" />
    ),
    error: <XCircle className="h-5 w-5 text-red-500 dark:text-red-400" />,
    info: <Info className="h-5 w-5 text-blue-500 dark:text-blue-400" />,
    warning: (
      <AlertTriangle className="h-5 w-5 text-yellow-500 dark:text-yellow-400" />
    ),
  };

  addToast({
    title: (
      <div className="flex items-center gap-2 font-semibold">
        {icons[type]}
        <span>{title}</span>
      </div>
    ),
    description: description && (
      <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
        {description}
      </p>
    ),
    className:
      "rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 p-3 transition-colors duration-200",
    timeout: 3500,
  });
};

// Optional component wrapper
export default function Toast({ title, description, type = "success" }) {
  React.useEffect(() => {
    if (title || description) showToast({ title, description, type });
  }, [title, description, type]);

  return null;
}
