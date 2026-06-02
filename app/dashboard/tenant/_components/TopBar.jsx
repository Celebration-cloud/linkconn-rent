"use client";

import { useState } from "react";
import { Bell } from "lucide-react";

export default function TopBar({ user, alerts }) {
  const [showAlerts, setShowAlerts] = useState(false);

  return (
    <header className="sticky top-0 z-30 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between h-16 px-4 lg:px-6">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Welcome back, {user?.name?.split(" ")[0]}
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {user?.unit} •{" "}
            {new Date().toLocaleDateString("en-US", {
              weekday: "long",
              month: "short",
              day: "numeric",
            })}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <button
              className="relative p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              onClick={() => setShowAlerts(!showAlerts)}
            >
              <Bell className="text-gray-700 dark:text-gray-300" />
              {alerts?.length > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
              )}
            </button>
            {showAlerts && (
              <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 py-2">
                <div className="px-4 py-2 border-b border-gray-100 dark:border-gray-700">
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                    Alerts
                  </h3>
                </div>
                {alerts?.map((alert) => (
                  <div
                    key={alert.id}
                    className={`px-4 py-3 border-l-4 ${
                      alert.type === "warning"
                        ? "border-amber-400 bg-amber-50 dark:bg-amber-700/20"
                        : "border-blue-400 bg-blue-50 dark:bg-blue-700/20"
                    }`}
                  >
                    <p className="text-sm text-gray-700 dark:text-gray-200">
                      {alert.text}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
