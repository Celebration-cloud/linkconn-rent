"use client";

export default function PaymentModal({
payment,
dueDate,
processing,
paymentSuccess,
onClose,
onPay,
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-gray-900">
        {/* Header */}
        <div className="border-b border-gray-200 p-6 dark:border-gray-800">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Make Payment
            </h3>
            <button
              onClick={onClose}
              className="rounded-lg p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
            >
              ✕
            </button>
          </div>
        </div>
        {paymentSuccess ? (
          /* Success */
          <div className="p-8 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
              ✓
            </div>
            <h4 className="mb-2 text-xl font-semibold text-gray-900 dark:text-gray-100">
              Payment Successful
            </h4>
            <p className="text-gray-500 dark:text-gray-400">
              Your payment of ${payment?.amount?.toLocaleString()} was
              processed.
            </p>
          </div>
        ) : (
          <>
            {/* Details */}
            <div className="space-y-4 p-6">
              <div className="rounded-xl bg-gray-50 p-4 dark:bg-gray-800">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-400">
                    Rent Payment
                  </span>
                  <span className="font-semibold text-gray-900 dark:text-gray-100">
                    ${payment?.amount?.toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Due Date</span>
                  <span className="text-gray-600 dark:text-gray-300">
                    {dueDate.toLocaleDateString("en-US", {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                </div>
              </div>

              {/* Methods */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Payment Method
                </label>

                <div className="space-y-2">
                  <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-blue-500 bg-blue-50 p-3 dark:bg-blue-900/20">
                    <input type="radio" name="method" defaultChecked />
                    <div className="flex h-6 w-10 items-center justify-center rounded bg-blue-600">
                      <span className="text-xs font-bold text-white">VISA</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        •••• 4242
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Credit Card
                      </p>
                    </div>
                  </label>

                  <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-gray-200 p-3 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800">
                    <input type="radio" name="method" />
                    <div className="flex h-6 w-10 items-center justify-center rounded bg-gray-800">
                      <span className="text-xs font-bold text-white">BANK</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        Chase •••• 6789
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        ACH Transfer
                      </p>
                    </div>
                  </label>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="border-t border-gray-200 bg-gray-50 p-6 dark:border-gray-800 dark:bg-gray-900">
              <button
                onClick={onPay}
                disabled={processing}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-gray-900 px-4 py-3 font-semibold text-white hover:bg-gray-800 disabled:opacity-60 dark:bg-gray-100 dark:text-gray-900 dark:hover:bg-gray-200"
              >
                {processing
                  ? "Processing..."
                  : `Pay $${payment?.amount?.toLocaleString()}`}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}