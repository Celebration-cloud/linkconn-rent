import { motion } from "framer-motion";

export const LeaseTabs = ({ value, onChange }) => {
  const tabs = ["details", "rules", "documents"];

  return (
    <div className="relative flex gap-1 bg-gray-100 dark:bg-white/5 p-1 rounded-2xl w-fit">
      {tabs.map((t) => {
        const active = value === t;

        return (
          <button
            key={t}
            className="relative px-4 py-2 text-sm z-10"
            onClick={() => onChange(t)}
          >
            {active && (
              <motion.div
                className="absolute inset-0 rounded-xl bg-white dark:bg-gray-900 shadow"
                layoutId="tab-indicator"
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
              />
            )}
            <span
              className={`relative ${
                active ? "text-gray-900 dark:text-white" : "text-gray-500"
              }`}
            >
              {t[0].toUpperCase() + t.slice(1)}
            </span>
          </button>
        );
      })}
    </div>
  );
};
