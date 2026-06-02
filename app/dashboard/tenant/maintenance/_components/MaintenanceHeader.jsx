"use client";
import { Plus } from "lucide-react";

export const MaintenanceHeader = ({ onNew }) => (
  <div className="flex flex-col sm:flex-row justify-between gap-4">
    <div>
      <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
        Maintenance Requests
      </h2>
      <p className="text-sm text-gray-500 dark:text-gray-400">
        Submit and track issues
      </p>
    </div>
    <button
      className="inline-flex items-center gap-2 rounded-xl bg-gray-900 text-white px-4 py-2.5 dark:bg-white dark:text-gray-900"
      onClick={onNew}
    >
      <Plus size={18} /> New Request
    </button>
  </div>
);
