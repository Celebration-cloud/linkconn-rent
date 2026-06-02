"use client";

import { motion } from "framer-motion";
import { Card, CardBody, CardHeader } from "@heroui/react";
import { Button, Image } from "@heroui/react";
import { MapPin, Bed, Bath, Square } from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" },
  },
};

export default function SimilarProperties({ similar }) {
  return (
    <motion.div
      variants={fadeUp}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true }}
      className="mt-16"
    >
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-blue-900 dark:text-yellow-600">
          Similar Properties
        </h2>

        <Button
          className="hidden sm:flex px-6 py-2 bg-blue-900/10 dark:bg-blue-900/30 hover:bg-blue-900/20 dark:hover:bg-blue-900/40 text-blue-900 dark:text-yellow-500 rounded-xl border border-blue-900/20 dark:border-yellow-600/20 text-sm transition-all duration-300 font-medium"
          endContent={
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="ml-1"
            >
              <path d="M5 12h14" />
              <path d="m12 5 7 7-7 7" />
            </svg>
          }
        >
          View All
        </Button>
      </div>

      {/* Card Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {similar.map((item, index) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08 * index }}
            whileHover={{
              y: -3,
              scale: 1.01,
              boxShadow: "0 6px 20px -6px rgba(0,0,0,0.35)",
            }}
            className="group cursor-pointer"
          >
            <Card className="bg-white dark:bg-black border border-blue-900/10 dark:border-white/10 rounded-xl overflow-hidden transition-all duration-300">
              <CardHeader className="relative p-0">
                <Image
                  src={item.images[0]}
                  alt={item.title}
                  className="w-full h-28 object-cover group-hover:scale-105 transition-transform duration-500"
                  removeWrapper
                />

                <div className="absolute top-2 left-2">
                  <span className="px-2 py-0.5 text-[9px] bg-yellow-700 text-black font-semibold rounded-full">
                    {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
                  </span>
                </div>
              </CardHeader>

              <CardBody className="p-3 space-y-1.5">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
                  {item.title}
                </h3>

                <div className="flex items-center text-gray-500 text-[11px] truncate">
                  <MapPin
                    size={11}
                    className="mr-1 text-blue-900 dark:text-yellow-600 shrink-0"
                  />
                  <span>{item.city}</span>
                </div>

                <div className="flex justify-between items-center pt-1 border-t border-blue-900/10 dark:border-white/10">
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-blue-900 dark:text-yellow-600">
                      {new Intl.NumberFormat("en-NG", {
                        style: "currency",
                        currency: "NGN",
                        maximumFractionDigits: 0,
                      }).format(item.price)}
                    </span>

                    <div className="flex items-center text-gray-500 text-[10px] mt-0.5">
                      <Bed size={10} className="mr-1" />
                      <span>{item.beds}</span>
                      <span className="mx-1">•</span>
                      <Bath size={10} className="mr-1" />
                      <span>{item.baths}</span>
                    </div>
                  </div>

                  <div className="flex items-center text-gray-500 text-[10px]">
                    <Square size={10} className="mr-1" />
                    <span>{item.size} sqm</span>
                  </div>
                </div>
              </CardBody>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Mobile Button */}
      <div className="mt-10 text-center sm:hidden">
        <Button
          className="px-8 py-3 bg-blue-900/10 dark:bg-blue-900/30 hover:bg-blue-900/20 dark:hover:bg-blue-900/40 text-blue-900 dark:text-yellow-500 rounded-xl border border-blue-900/20 dark:border-yellow-600/20 transition-all duration-300 text-sm font-semibold"
          endContent={
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="ml-1"
            >
              <path d="M5 12h14" />
              <path d="m12 5 7 7-7 7" />
            </svg>
          }
        >
          Browse More
        </Button>
      </div>
    </motion.div>
  );
}
