"use client";

export default function ActionButton({ label }) {
  return (
    <button className="bg-white/20 dark:bg-gray-700/30 hover:bg-white/30 dark:hover:bg-gray-700/40 px-4 py-2 rounded-lg text-sm font-medium transition">
      {label}
    </button>
  );
}
