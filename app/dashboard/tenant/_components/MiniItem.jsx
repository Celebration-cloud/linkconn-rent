"use client";

export default function MiniItem({ title, status }) {
  return (
    <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-700 rounded-xl p-3 text-sm">
      <span className="font-medium text-gray-900 dark:text-gray-100">
        {title}
      </span>
      <span className="px-2 py-1 rounded-full bg-amber-100 dark:bg-amber-700/30 text-amber-700 dark:text-amber-300 text-xs">
        {status}
      </span>
    </div>
  );
}
