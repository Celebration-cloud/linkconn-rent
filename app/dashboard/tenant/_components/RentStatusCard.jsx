"use client";

import Card from "./Card";
import Row from "./Row";

export default function RentStatusCard() {
  return (
    <Card>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Rent status
          </p>
          <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1">
            ₦1,450
          </p>
        </div>
        <span className="px-3 py-1 rounded-full text-sm font-medium bg-amber-100 dark:bg-amber-700/20 text-amber-700 dark:text-amber-300">
          Due
        </span>
      </div>

      <div className="mt-4 space-y-2 text-sm">
        <Row label="Due date" value="Feb 1, 2026" />
        <Row highlight label="Days left" value="5 days" />
      </div>

      <button className="mt-4 w-full bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white font-medium py-2.5 rounded-xl transition-colors">
        Pay now
      </button>
    </Card>
  );
}
