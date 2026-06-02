"use client";
import { StatusBadge } from "./StatusBadge";

const priorityColors = {
  low: "bg-gray-500/10 text-gray-600 dark:text-gray-400",
  medium: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  high: "bg-red-500/10 text-red-600 dark:text-red-400",
};

export const MaintenanceCard = ({ request, onSelect }) => (
  <div
    className="rounded-2xl p-6 bg-white shadow-sm transition hover:shadow-md cursor-pointer dark:bg-white/5"
    onClick={() => onSelect(request)}
  >
    <div className="flex justify-between gap-4">
      <div>
        <div className="flex items-center gap-3">
          <h3 className="font-medium text-gray-900 dark:text-gray-100">
            {request.title}
          </h3>
          <span
            className={`px-2 py-0.5 rounded-full text-xs ${priorityColors[request.priority]}`}
          >
            {request.priority}
          </span>
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {request.category}
        </p>
        <p className="text-sm text-gray-600 dark:text-gray-300 mt-1 line-clamp-2">
          {request.description}
        </p>
      </div>

      <div className="text-right">
        <StatusBadge status={request.status} />
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
          {request.comments?.length ?? 0} comments
        </p>
      </div>
    </div>
  </div>
);
