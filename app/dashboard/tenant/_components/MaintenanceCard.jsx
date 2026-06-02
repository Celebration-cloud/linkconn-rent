"use client";

import Card from "./Card";
import MiniItem from "./MiniItem";
import { Wrench } from "lucide-react";

export default function MaintenanceCard() {
  return (
    <Card>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-orange-100 dark:bg-orange-700/20 rounded-lg">
            <Wrench
              size={18}
              className="text-orange-600 dark:text-orange-300"
            />
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Maintenance
            </p>
            <p className="font-semibold text-gray-900 dark:text-gray-100">
              2 open requests
            </p>
          </div>
        </div>
        <button className="text-sm text-blue-600 dark:text-blue-400">
          View all
        </button>
      </div>

      <div className="space-y-3">
        <MiniItem title="Leaky faucet" status="In progress" />
        <MiniItem title="Heater issue" status="Pending" />
      </div>

      <button className="mt-4 w-full border-2 border-dashed border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 font-medium py-2.5 rounded-xl">
        New request
      </button>
    </Card>
  );
}
