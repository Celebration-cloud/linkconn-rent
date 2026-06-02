"use client";

import { StatusBadge } from "./StatusBadge";

export default function PaymentHistoryTable({ history, onViewReceipt }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="border-b border-gray-100 bg-gray-50 dark:border-gray-800 dark:bg-gray-800">
            <tr>
              <Header>Date</Header>
              <Header className="hidden md:table-cell">Description</Header>
              <Header>Amount</Header>
              <Header>Status</Header>
              <Header className="hidden sm:table-cell">Method</Header>
              <Header>Action</Header>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {history.map((payment) => (
              <tr
                key={payment.id}
                className="transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/60"
              >
                <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100">
                  {new Date(payment.date).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </td>

                <td className="hidden px-6 py-4 text-sm text-gray-600 dark:text-gray-400 md:table-cell">
                  {payment.description}
                </td>

                <td className="px-6 py-4 text-sm font-semibold text-gray-900 dark:text-gray-100">
                  ${payment.amount.toLocaleString()}
                </td>

                <td className="px-6 py-4">
                  <StatusBadge status={payment.status} />
                </td>

                <td className="hidden px-6 py-4 text-sm text-gray-600 dark:text-gray-400 sm:table-cell">
                  {payment.method}
                </td>

                <td className="px-6 py-4">
                  <button
                    className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium
                    text-blue-600 hover:bg-blue-50 hover:text-blue-700
                    dark:text-blue-400 dark:hover:bg-blue-500/10 dark:hover:text-blue-300"
                    onClick={() => onViewReceipt(payment)}
                  >
                    <svg
                      className="h-4 w-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                      />
                    </svg>
                    Receipt
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Header({ children, className = "" }) {
  return (
    <th
      className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider
      text-gray-500 dark:text-gray-400 ${className}`}
    >
      {children}
    </th>
  );
}
