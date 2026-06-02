import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

export function CollapsibleGroup({ title, color, items, setValue }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="mb-2">
      <div
        className={`flex items-center justify-between cursor-pointer font-semibold py-2 ${color}`}
        onClick={() => setOpen(!open)}
      >
        <span>{title}</span>
        <span className="text-sm text-muted-foreground">
          {open ? "−" : "+"}
        </span>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            animate={{ height: "auto", opacity: 1 }}
            className="pl-3 space-y-2"
            exit={{ height: 0, opacity: 0 }}
            initial={{ height: 0, opacity: 0 }}
          >
            {items.map((item) => (
              <div
                key={item.key}
                className="cursor-pointer text-sm text-foreground/80 hover:text-primary transition-colors"
                onClick={() =>
                  setValue("propertyType", item.key, { shouldValidate: true })
                }
              >
                {item.label}
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
