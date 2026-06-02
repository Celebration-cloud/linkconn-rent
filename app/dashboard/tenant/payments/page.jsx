"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Download,
  Wallet,
  Check,
  X,
  CreditCard,
  Banknote,
  Plus,
} from "lucide-react";

// Status Badge Component
const StatusBadge = ({ status }) => {
  const statusConfig = {
    paid: {
      bg: "bg-emerald-100 dark:bg-emerald-900/30",
      text: "text-emerald-700 dark:text-emerald-300",
      icon: "✓",
      label: "Paid",
    },
    pending: {
      bg: "bg-amber-100 dark:bg-amber-900/30",
      text: "text-amber-700 dark:text-amber-300",
      icon: "◷",
      label: "Pending",
    },
    failed: {
      bg: "bg-red-100 dark:bg-red-900/30",
      text: "text-red-700 dark:text-red-300",
      icon: "✕",
      label: "Failed",
    },
    due: {
      bg: "bg-orange-100 dark:bg-orange-900/30",
      text: "text-orange-700 dark:text-orange-300",
      icon: "!",
      label: "Due",
    },
    in_progress: {
      bg: "bg-blue-100 dark:bg-blue-900/30",
      text: "text-blue-700 dark:text-blue-300",
      icon: "⟳",
      label: "In Progress",
    },
    open: {
      bg: "bg-amber-100 dark:bg-amber-900/30",
      text: "text-amber-700 dark:text-amber-300",
      icon: "○",
      label: "Open",
    },
    resolved: {
      bg: "bg-green-100 dark:bg-green-900/30",
      text: "text-green-700 dark:text-green-300",
      icon: "✓",
      label: "Resolved",
    },
  };
  const config = statusConfig[status] || statusConfig.pending;
  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}
    >
      <span className="w-3.5 h-3.5 flex items-center justify-center text-[10px]">
        {config.icon}
      </span>
      {config.label}
    </span>
  );
};

// Receipt Modal Component
const ReceiptModal = ({ payment, onClose }) => {
  const downloadReceipt = () => {
    const receiptContent = `═══════════════════════════════════════
PAYMENT RECEIPT
═══════════════════════════════════════
Receipt ID: ${payment.receiptId}
Date: ${new Date(payment.date).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
Time: ${new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
───────────────────────────────────────
BILLED TO
───────────────────────────────────────
Property: ${payment.property || "Sunset Gardens"}
Unit: ${payment.unit || "Apt 4B"}
Tenant: ${payment.tenant || "Alex Johnson"}
───────────────────────────────────────
PAYMENT DETAILS
───────────────────────────────────────
Description: ${payment.description}
Amount Paid: $${payment.amount.toLocaleString()}
Payment Method: ${payment.method}
Status: ${payment.status.toUpperCase()}
───────────────────────────────────────
SUMMARY
───────────────────────────────────────
Subtotal: $${payment.amount.toLocaleString()}
Tax: $0.00
Total: $${payment.amount.toLocaleString()}
═══════════════════════════════════════
Thank you for your payment!
═══════════════════════════════════════
This receipt was generated automatically.
For questions, contact property management.`;
    const blob = new Blob([receiptContent], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `receipt-${payment.receiptId}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
        <div className="bg-gradient-to-r from-gray-900 to-gray-800 dark:from-gray-800 dark:to-gray-900 p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold">Payment Receipt</h3>
                <p className="text-gray-400 text-sm">{payment.receiptId}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1 hover:bg-white/10 rounded-lg transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>
        <div className="p-6">
          <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-4 space-y-3 mb-6">
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400 text-sm">
                Description
              </span>
              <span className="font-medium text-gray-900 dark:text-white">
                {payment.description}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400 text-sm">
                Amount
              </span>
              <span className="font-semibold text-gray-900 dark:text-white">
                ${payment.amount.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400 text-sm">
                Date
              </span>
              <span className="text-gray-900 dark:text-white">
                {new Date(payment.date).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400 text-sm">
                Method
              </span>
              <span className="text-gray-900 dark:text-white">
                {payment.method}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400 text-sm">
                Status
              </span>
              <StatusBadge status={payment.status} />
            </div>
          </div>
          <button
            onClick={downloadReceipt}
            className="w-full bg-gray-900 hover:bg-gray-800 dark:bg-gray-700 dark:hover:bg-gray-600 text-white font-semibold py-3 px-4 rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            <Download size={18} />
            Download Receipt
          </button>
          <button
            onClick={onClose}
            className="w-full mt-3 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 font-medium py-3 px-4 rounded-xl transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

// Payment History Table Component
const PaymentHistoryTable = ({ history, onViewReceipt }) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
            <tr>
              <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Date
              </th>
              <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider hidden md:table-cell">
                Description
              </th>
              <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Amount
              </th>
              <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Status
              </th>
              <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider hidden sm:table-cell">
                Method
              </th>
              <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
            {history.map((payment) => (
              <tr
                key={payment.id}
                className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
              >
                <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                  {new Date(payment.date).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </td>
                <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300 hidden md:table-cell">
                  {payment.description}
                </td>
                <td className="px-6 py-4 text-sm font-semibold text-gray-900 dark:text-white">
                  ${payment.amount.toLocaleString()}
                </td>
                <td className="px-6 py-4">
                  <StatusBadge status={payment.status} />
                </td>
                <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300 hidden sm:table-cell">
                  {payment.method}
                </td>
                <td className="px-6 py-4">
                  <button
                    onClick={() => onViewReceipt(payment)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                  >
                    <Download size={14} />
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
};

// Skeleton Loader for Payment History
const PaymentHistorySkeleton = () => (
  <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 animate-pulse">
    {[1, 2, 3].map((i) => (
      <div
        key={i}
        className="flex items-center gap-4 py-3 border-b border-gray-100 dark:border-gray-700 last:border-b-0"
      >
        <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded" />
        <div className="h-4 flex-1 bg-gray-200 dark:bg-gray-700 rounded" />
        <div className="h-6 w-16 bg-gray-200 dark:bg-gray-700 rounded" />
      </div>
    ))}
  </div>
);

// Main Payments Page Component
const PaymentsPage = ({
  payment = {
    amount: 1850,
    dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0],
    lastPaid: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0],
    status: "due",
  },
  history = [
    {
      id: "1",
      receiptId: "RCPT-001",
      date: "2026-01-01",
      description: "January Rent",
      amount: 1450,
      status: "paid",
      method: "Card",
    },
    {
      id: "2",
      receiptId: "RCPT-002",
      date: "2025-12-01",
      description: "December Rent",
      amount: 1450,
      status: "paid",
      method: "Bank",
    },
    {
      id: "3",
      receiptId: "RCPT-003",
      date: "2025-11-01",
      description: "November Rent",
      amount: 1450,
      status: "pending",
      method: "Card",
    },
    {
      id: "4",
      receiptId: "RCPT-003",
      date: "2025-11-01",
      description: "November Rent",
      amount: 1450,
      status: "failed",
      method: "Card",
    },
  ],
  loading = false,
  onPaymentSubmit = null,
}) => {
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showReceiptModal, setShowReceiptModal] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [localHistory, setLocalHistory] = useState(history);
  const [selectedPaymentMethod, setSelectedPaymentMethod] =
    useState("credit-card");

//   useEffect(() => {
//     setLocalHistory(history);
//   }, [history]);

  const handlePayment = () => {
    setProcessing(true);
    setTimeout(() => {
      setProcessing(false);
      setPaymentSuccess(true);

      // Create new payment record
      const newPayment = {
        id: Date.now(),
        date: new Date().toISOString().split("T")[0],
        description: "January 2025 Rent",
        amount: payment.amount,
        status: "paid",
        method:
          selectedPaymentMethod === "credit-card"
            ? "Credit Card"
            : "Bank Transfer (ACH)",
        receiptId: `RCP-${new Date().getFullYear()}-${(new Date().getMonth() + 1).toString().padStart(2, "0")}${new Date().getDate().toString().padStart(2, "0")}`,
        property: "Sunset Gardens",
        unit: "Apt 4B",
        tenant: "Alex Johnson",
      };

      // Update local history
      setLocalHistory((prev) => [newPayment, ...prev]);

      // Optional callback if provided
      if (onPaymentSubmit) {
        onPaymentSubmit(newPayment);
      }

      setTimeout(() => {
        setShowPaymentModal(false);
        setPaymentSuccess(false);
      }, 2000);
    }, 1500);
  };

  const dueDate = new Date(payment.dueDate);
  const today = new Date();
  const daysUntilDue = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24));

  return (
    <div className="space-y-6 max-w-6xl mx-auto p-4 md:p-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Payments
        </h2>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          Manage your rent payments and view history
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl p-6 text-white">
          <p className="text-blue-100 text-sm font-medium">Amount Due</p>
          <p className="text-3xl font-bold mt-1">
            ${payment.amount.toLocaleString()}
          </p>
          <p className="text-blue-200 text-sm mt-4">
            Due{" "}
            {dueDate.toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
            })}
          </p>
          <div
            className={`mt-3 inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${daysUntilDue <= 5 ? "bg-amber-400/30 text-amber-100" : "bg-white/20 text-white"}`}
          >
            {daysUntilDue} days left
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">
            Last Payment
          </p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
            ${payment.amount.toLocaleString()}
          </p>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-4">
            {new Date(payment.lastPaid).toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 flex flex-col justify-center">
          <button
            onClick={() => setShowPaymentModal(true)}
            className="w-full bg-gray-900 hover:bg-gray-800 dark:bg-gray-700 dark:hover:bg-gray-600 text-white font-semibold py-3 px-4 rounded-xl transition-colors flex items-center justify-center gap-2 shadow-lg"
          >
            <Wallet size={18} />
            Pay Rent
          </button>
          <p className="text-gray-500 dark:text-gray-400 text-xs text-center mt-3">
            Secure payment via ACH or Card
          </p>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
          Saved Payment Methods
        </h3>
        <div className="flex flex-wrap gap-3">
          <div
            onClick={() => setSelectedPaymentMethod("credit-card")}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl border cursor-pointer transition-all ${
              selectedPaymentMethod === "credit-card"
                ? "border-blue-500 bg-blue-50 dark:bg-blue-900/30"
                : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 bg-gray-50 dark:bg-gray-900/50"
            }`}
          >
            <div className="w-10 h-6 bg-blue-600 rounded flex items-center justify-center">
              <span className="text-white text-xs font-bold">VISA</span>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                •••• 4242
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Expires 12/26
              </p>
            </div>
            <span
              className={`ml-auto text-xs px-2 py-0.5 rounded ${
                selectedPaymentMethod === "credit-card"
                  ? "bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300"
                  : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
              }`}
            >
              Default
            </span>
          </div>
          <div
            onClick={() => setSelectedPaymentMethod("bank-transfer")}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl border cursor-pointer transition-all ${
              selectedPaymentMethod === "bank-transfer"
                ? "border-blue-500 bg-blue-50 dark:bg-blue-900/30"
                : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 bg-gray-50 dark:bg-gray-900/50"
            }`}
          >
            <div className="w-10 h-6 bg-gray-800 rounded flex items-center justify-center">
              <span className="text-white text-xs font-bold">BANK</span>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                Chase •••• 6789
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                ACH Transfer
              </p>
            </div>
          </div>
          <button className="flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl hover:border-gray-400 hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors text-gray-500 dark:text-gray-400">
            <Plus size={18} />
            Add Method
          </button>
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900 dark:text-white">
            Payment History
          </h3>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {localHistory?.length} transactions
          </span>
        </div>

        {loading ? (
          <PaymentHistorySkeleton />
        ) : (
          <PaymentHistoryTable
            history={localHistory}
            onViewReceipt={setShowReceiptModal}
          />
        )}
      </div>

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Make Payment
                </h3>
                <button
                  onClick={() => setShowPaymentModal(false)}
                  className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                >
                  <X size={22} className="text-gray-500 dark:text-gray-400" />
                </button>
              </div>
            </div>

            {paymentSuccess ? (
              <div className="p-8 text-center">
                <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Check
                    size={28}
                    className="text-green-500 dark:text-green-400"
                  />
                </div>
                <h4 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  Payment Successful!
                </h4>
                <p className="text-gray-500 dark:text-gray-400">
                  Your payment of ${payment.amount.toLocaleString()} has been
                  processed.
                </p>
              </div>
            ) : (
              <>
                <div className="p-6 space-y-4">
                  <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-gray-600 dark:text-gray-300">
                        Rent Payment
                      </span>
                      <span className="font-semibold text-gray-900 dark:text-white">
                        ${payment.amount.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-500 dark:text-gray-400">
                        Due Date
                      </span>
                      <span className="text-gray-600 dark:text-gray-300">
                        {dueDate.toLocaleDateString("en-US", {
                          month: "long",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Payment Method
                    </label>
                    <div className="space-y-2">
                      <label
                        className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-colors ${
                          selectedPaymentMethod === "credit-card"
                            ? "border border-blue-500 bg-blue-50 dark:bg-blue-900/30"
                            : "border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-900/50"
                        }`}
                      >
                        <input
                          type="radio"
                          name="method"
                          checked={selectedPaymentMethod === "credit-card"}
                          onChange={() =>
                            setSelectedPaymentMethod("credit-card")
                          }
                          className="text-blue-600"
                        />
                        <div className="w-10 h-6 bg-blue-600 rounded flex items-center justify-center">
                          <span className="text-white text-xs font-bold">
                            VISA
                          </span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            •••• 4242
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            Credit Card
                          </p>
                        </div>
                      </label>
                      <label
                        className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-colors ${
                          selectedPaymentMethod === "bank-transfer"
                            ? "border border-blue-500 bg-blue-50 dark:bg-blue-900/30"
                            : "border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-900/50"
                        }`}
                      >
                        <input
                          type="radio"
                          name="method"
                          checked={selectedPaymentMethod === "bank-transfer"}
                          onChange={() =>
                            setSelectedPaymentMethod("bank-transfer")
                          }
                          className="text-blue-600"
                        />
                        <div className="w-10 h-6 bg-gray-800 rounded flex items-center justify-center">
                          <span className="text-white text-xs font-bold">
                            BANK
                          </span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            Chase •••• 6789
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            Bank Transfer (ACH)
                          </p>
                        </div>
                      </label>
                    </div>
                  </div>
                </div>

                <div className="p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
                  <button
                    onClick={handlePayment}
                    disabled={processing}
                    className="w-full bg-gray-900 hover:bg-gray-800 dark:bg-gray-700 dark:hover:bg-gray-600 disabled:bg-gray-400 disabled:dark:bg-gray-600 text-white font-semibold py-3 px-4 rounded-xl transition-colors flex items-center justify-center gap-2"
                  >
                    {processing ? (
                      <>
                        <svg
                          className="animate-spin w-5 h-5"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          />
                        </svg>
                        Processing...
                      </>
                    ) : (
                      <>Pay ${payment.amount.toLocaleString()}</>
                    )}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Receipt Modal */}
      {showReceiptModal && (
        <ReceiptModal
          payment={showReceiptModal}
          onClose={() => setShowReceiptModal(null)}
        />
      )}
    </div>
  );
};

export default PaymentsPage;
