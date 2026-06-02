"use client";

export default function PaymentMethods({ methods, onAddMethod }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
      <h3 className="mb-4 font-semibold text-gray-900 dark:text-gray-100">
        Saved Payment Methods
      </h3>

      <div className="flex flex-wrap gap-3">
        {methods.map((method) => (
          <div
            key={method.id}
            className="flex min-w-[200px] flex-1 items-center gap-3 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 dark:border-gray-800 dark:bg-gray-800"
          >
            <div
              className={`flex h-6 w-10 items-center justify-center rounded ${
                method.type === "card"
                  ? "bg-blue-600 dark:bg-blue-500"
                  : "bg-gray-800 dark:bg-gray-700"
              }`}
            >
              <span className="text-xs font-bold text-white">
                {method.type === "card"
                  ? method.brand?.toUpperCase() || "CARD"
                  : "BANK"}
              </span>
            </div>

            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                {method.label}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {method.subLabel}
              </p>
            </div>

            {method.isDefault && (
              <span className="ml-auto rounded bg-gray-200 px-2 py-0.5 text-xs text-gray-600 dark:bg-gray-700 dark:text-gray-300">
                Default
              </span>
            )}
          </div>
        ))}

        <button
          onClick={onAddMethod}
          className="flex items-center justify-center gap-2 rounded-xl border-2 border-dashed border-gray-300 px-4 py-3 text-gray-600 transition-colors hover:border-gray-400 hover:text-gray-900 dark:border-gray-700 dark:text-gray-400 dark:hover:border-gray-500 dark:hover:text-gray-200"
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
              d="M12 6v6m0 0v6m0-6h6m-6 0H6"
            />
          </svg>
          Add Method
        </button>
      </div>
    </div>
  );
}
