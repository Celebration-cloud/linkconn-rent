import { CheckCircle, Clock, XCircle } from "lucide-react";

export function StatusBadge({ status }) {
  if (status === "paid") {
    return (
      <span
        className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs
        bg-green-100 text-green-800
        dark:bg-green-900/30 dark:text-green-400"
      >
        <CheckCircle size={12} />
        Paid
      </span>
    );
  }

  if (status === "pending") {
    return (
      <span
        className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs
        bg-yellow-100 text-yellow-800
        dark:bg-yellow-900/30 dark:text-yellow-400"
      >
        <Clock size={12} />
        Pending
      </span>
    );
  }

  return (
    <span
      className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs
      bg-red-100 text-red-800
      dark:bg-red-900/30 dark:text-red-400"
    >
      <XCircle size={12} />
      Failed
    </span>
  );
}
