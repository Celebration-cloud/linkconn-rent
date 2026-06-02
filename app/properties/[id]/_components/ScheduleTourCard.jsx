"use client";

import { Calendar } from "lucide-react";
import { getLocalTimeZone, today } from "@internationalized/date";
import { DateRangePicker } from "@heroui/react";

export default function ScheduleTourCard({ selectedDate, setSelectedDate }) {
  return (
    <div className="bg-white dark:bg-black/70 backdrop-blur-lg rounded-2xl p-6 border border-gray-200 dark:border-white/10">
      <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
        Schedule Tour
      </h3>

      <div className="space-y-4">
        {/* Date Picker */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-2">
            Select Date
          </label>
          <DateRangePicker
            label="Tour date"
            value={selectedDate}
            onChange={setSelectedDate}
            minValue={today(getLocalTimeZone())}
            className="text-gray-900 dark:text-gray-100"
          />
        </div>

        {/* Schedule Button */}
        <button className="w-full bg-blue-900 hover:bg-blue-800 text-white font-medium py-3 px-6 rounded-lg transition flex items-center justify-center">
          <Calendar size={18} className="mr-2" />
          Schedule Tour
        </button>

        {/* Subtle trust note */}
        <p className="text-xs text-gray-600 dark:text-gray-500 text-center">
          Tour requests are reviewed by the agent before confirmation.
        </p>
      </div>
    </div>
  );
}
