"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

import { LeaseDetails } from "./LeaseDetails";
import { LeaseDocuments } from "./LeaseDocuments";
import { LeaseTabs } from "./LeaseTabs";
import { LeaseRules } from "./LeaseRules";
export default function LeaseClient({ data }) {
  const router = useRouter();
  const params = useSearchParams();

  const tab = params.get("tab") ?? "details";

  const setTab = (next) => {
    router.push(`?tab=${next}`, { scroll: false });
  };

  return (
    <div className="max-w-6xl space-y-6">
      <header>
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
          Lease Information
        </h2>
        <p className="text-gray-500 dark:text-gray-400">
          Your contract, rules, and documents
        </p>
      </header>

      <LeaseTabs value={tab} onChange={setTab} />

      <AnimatePresence mode="wait">
        {tab === "details" && (
          <Motion key="details">
            <LeaseDetails details={data.details} />
          </Motion>
        )}

        {tab === "rules" && (
          <Motion key="rules">
            <LeaseRules rules={data.houseRules} />
          </Motion>
        )}

        {tab === "documents" && (
          <Motion key="documents">
            <LeaseDocuments docs={data.documents} />
          </Motion>
        )}
      </AnimatePresence>
    </div>
  );
}

const Motion = ({ children }) => (
  <motion.div
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -8 }}
    initial={{ opacity: 0, y: 12 }}
    transition={{ duration: 0.2, ease: "easeOut" }}
  >
    {children}
  </motion.div>
);
