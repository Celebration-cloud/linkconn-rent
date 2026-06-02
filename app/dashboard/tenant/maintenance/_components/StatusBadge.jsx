"use client";

export const StatusBadge = ({ status }) => {
  const map = {
    open: "bg-red-500/10 text-red-600 dark:text-red-400",
    in_progress: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
    resolved: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  };

  return (
    <span
      className={`px-2.5 py-1 rounded-full text-xs font-medium ${map[status]}`}
    >
      {status.replace("_", " ")}
    </span>
  );
};
