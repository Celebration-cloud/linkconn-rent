"use client";

import { StatusBadge } from "./StatusBadge";

export default function ReceiptModal({ payment, onClose }) {
  const downloadReceipt = () => {
    const receiptContent = `═══════════════════════════════════════
PAYMENT RECEIPT
═══════════════════════════════════════

Receipt ID: ${payment.receiptId}
Date: ${new Date(payment.date).toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    })}
Time: ${new Date().toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    })}

───────────────────────────────────────
PAYMENT DETAILS
───────────────────────────────────────
Description: ${payment.description}
Amount Paid: $${payment.amount.toLocaleString()}
Payment Method: ${payment.method}
Status: ${payment.status.toUpperCase()}

───────────────────────────────────────
TOTAL
───────────────────────────────────────
$${payment.amount.toLocaleString()}

Thank you for your payment.
`;

    const blob = new Blob([receiptContent], { type: "text/plain" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");

    a.href = url;
    a.download = `receipt-${payment.receiptId}.txt`;
    a.click();

    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-md overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl dark:border-gray-800 dark:bg-gray-900">
        {/* Header */}
        <div className="bg-gray-900 p-6 text-white dark:bg-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold">Payment Receipt</h3>
              <p className="text-sm text-gray-400">{payment.receiptId}</p>
            </div>

            <button
              className="rounded-lg p-1 text-gray-400 hover:bg-white/10 hover:text-white"
              onClick={onClose}
            >
              ✕
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="mb-6 space-y-3 rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-800">
            <Row label="Description" value={payment.description} />
            <Row
              bold
              label="Amount"
              value={`$${payment.amount.toLocaleString()}`}
            />
            <Row
              label="Date"
              value={new Date(payment.date).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            />
            <Row label="Method" value={payment.method} />

            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Status
              </span>
              <StatusBadge status={payment.status} />
            </div>
          </div>

          {/* Actions */}
          <button
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-gray-900 py-3 font-semibold text-white hover:bg-gray-800 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-200"
            onClick={downloadReceipt}
          >
            Download Receipt
          </button>

          <button
            className="mt-3 w-full rounded-xl bg-gray-100 py-3 font-medium text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value, bold }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-gray-600 dark:text-gray-400">{label}</span>
      <span
        className={
          bold
            ? "font-semibold text-gray-900 dark:text-white"
            : "text-gray-900 dark:text-gray-200"
        }
      >
        {value}
      </span>
    </div>
  );
}
