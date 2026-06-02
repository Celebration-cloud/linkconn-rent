"use client";

export function PaymentsHeader({
payment,
dueDate,
daysUntilDue,
setShowPaymentModal,
}) {
  return (
    <div className="mb-8 space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Payments
        </h2>
        <p className="mt-1 text-gray-500 dark:text-gray-400">
          Manage your rent payments and view history
        </p>
      </div>
      {/* Payment Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {/* Amount Due */}
        <div className="rounded-2xl bg-gradient-to-br from-blue-600 to-blue-700 p-6 text-white dark:from-blue-500 dark:to-blue-600">
          <p className="text-sm font-medium text-blue-100">Amount Due</p>

          <p className="mt-1 text-3xl font-bold">
            ${payment?.amount?.toLocaleString()}
          </p>

          <p className="mt-4 text-sm text-blue-200">
            Due{" "}
            {dueDate.toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
            })}
          </p>

          <div
            className={`mt-3 inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
              daysUntilDue <= 5
                ? "bg-amber-400/30 text-amber-100"
                : "bg-white/20 text-white"
            }`}
          >
            {daysUntilDue} days left
          </div>
        </div>

        {/* Last Payment */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
            Last Payment
          </p>

          <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-gray-100">
            ${payment?.amount?.toLocaleString()}
          </p>

          <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
            {payment?.lastPaid
              ? new Date(payment.lastPaid).toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })
              : "—"}
          </p>
        </div>

        {/* Pay Rent */}
        <div className="flex flex-col justify-center rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <button
            onClick={() => setShowPaymentModal(true)}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-gray-900 px-4 py-3 font-semibold text-white hover:bg-gray-800 dark:bg-gray-100 dark:text-gray-900 dark:hover:bg-gray-200"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
              />
            </svg>
            Pay Rent
          </button>

          <p className="mt-3 text-center text-xs text-gray-500 dark:text-gray-400">
            Secure payment via ACH or Card
          </p>
        </div>
      </div>
    </div>
  );
}