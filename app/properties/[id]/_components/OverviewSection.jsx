"use client";

import { motion } from "framer-motion";
import { MapPin, Square, Bed, Bath, Banknote } from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

export default function OverviewSection({ property }) {
  const formattedPrice = new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(property.price);

  return (
    <motion.section
      id="Overview"
      variants={fadeUp}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true }}
      className="scroll-mt-24"
    >
      <h2 className="text-3xl font-bold mb-4 text-blue-900 dark:text-blue-400">
        About this property
      </h2>

      <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-sm sm:text-base">
        {property.description || "No description available for this property."}
      </p>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-6 text-sm text-gray-600 dark:text-gray-400">
        <div className="flex items-start gap-2">
          <MapPin size={16} className="mt-1 text-yellow-700" />
          <div>
            <div className="font-medium text-black dark:text-gray-200">
              Location
            </div>
            <div>
              {property.address || "N/A"}, {property.city || "N/A"},{" "}
              {property.state || "N/A"}
            </div>
          </div>
        </div>

        <div className="flex items-start gap-2">
          <Square size={16} className="mt-1 text-blue-700" />
          <div>
            <div className="font-medium text-black dark:text-gray-200">
              Size
            </div>
            <div>{property.size ? `${property.size} sqm` : "N/A"}</div>
          </div>
        </div>

        <div className="flex items-start gap-2">
          <Bed size={16} className="mt-1 text-blue-700" />
          <div>
            <div className="font-medium text-black dark:text-gray-200">
              Bedrooms
            </div>
            <div>{property.beds || "N/A"}</div>
          </div>
        </div>

        <div className="flex items-start gap-2">
          <Bath size={16} className="mt-1 text-blue-700" />
          <div>
            <div className="font-medium text-black dark:text-gray-200">
              Bathrooms
            </div>
            <div>{property.baths || "N/A"}</div>
          </div>
        </div>

        <div className="flex items-start gap-2">
          <Banknote size={16} className="mt-1 text-yellow-700" />
          <div>
            <div className="font-medium text-black dark:text-gray-200">
              Price
            </div>
            <div className="text-yellow-800 dark:text-yellow-600 font-semibold">
              {formattedPrice || "N/A"}
            </div>
          </div>
        </div>
      </div>
    </motion.section>
  );
}
