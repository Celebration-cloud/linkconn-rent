"use client";

export default function Row({ label, value, highlight }) {
  return (
    <div className="flex justify-between">
      <span className="text-gray-500 dark:text-gray-400">{label}</span>
      <span
        className={
          highlight
            ? "font-medium text-amber-600 dark:text-amber-400"
            : "font-medium text-gray-900 dark:text-gray-100"
        }
      >
        {value}
      </span>
    </div>
  );
}
