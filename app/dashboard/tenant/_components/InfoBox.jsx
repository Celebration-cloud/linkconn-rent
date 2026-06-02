"use client";

export default function InfoBox({ label, value }) {
  return (
    <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-3">
      <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
      <p className="font-semibold text-gray-900 dark:text-gray-100">{value}</p>
    </div>
  );
}
