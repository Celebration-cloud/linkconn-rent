"use client";

import { Calendar } from "lucide-react";

import Card from "./Card";
import InfoBox from "./InfoBox";

export default function LeaseCard() {
  return (
    <Card>
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-purple-100 dark:bg-purple-700/20 rounded-lg">
          <Calendar
            className="text-purple-600 dark:text-purple-300"
            size={18}
          />
        </div>
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Lease snapshot
          </p>
          <p className="font-semibold text-gray-900 dark:text-gray-100">
            Sunset Gardens
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <div className="flex justify-between text-sm mb-2">
            <span className="text-gray-500 dark:text-gray-400">
              Lease progress
            </span>
            <span className="font-medium text-gray-900 dark:text-gray-100">
              68%
            </span>
          </div>
          <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
            <div className="h-full bg-purple-600 dark:bg-purple-400 rounded-full w-[68%]" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <InfoBox label="End date" value="Dec 31, 2026" />
          <InfoBox label="Days left" value="362 days" />
        </div>
      </div>
    </Card>
  );
}
