"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";

import PropertyGallery from "./_components/PropertyGallery";
import SectionNav from "./_components/SectionNav";
import OverviewSection from "./_components/OverviewSection";
import AmenitiesSection from "./_components/AmenitiesSection";
import LocationSection from "./_components/LocationSection";
import ReviewsSection from "./_components/ReviewsSection";
import SimilarProperties from "./_components/SimilarProperties";
import AgentContactCard from "./_components/AgentContactCard";
import ScheduleTourCard from "./_components/ScheduleTourCard";
import StickyBottomBar from "./_components/StickyBottomBar";

export default function PropertyDetailPage() {
  const { id } = useParams();
  const [property, setProperty] = useState(null);
  const [similar, setSimilar] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState("Overview");
  const [isFavorite, setIsFavorite] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);

  useEffect(() => {
    async function fetchPropertyAndSimilar() {
      try {
        // Fetch the main property
        const res = await fetch(`/api/properties/${id}`);

        if (!res.ok) throw new Error("Failed to fetch property");
        const data = await res.json();

        console.log("property data:", data);
        setProperty(data);

        // Once property is fetched, fetch similar properties
        if (data?.type) {
          const similarRes = await fetch(
            `/api/properties/similar?id=${data.type}`,
          );

          if (!similarRes.ok)
            throw new Error("Failed to fetch similar properties");
          const similarData = await similarRes.json();

          setSimilar(similarData);
        }
      } catch (err) {
        console.error("Error fetching property or similar:", err);
      } finally {
        setLoading(false);
      }
    }

    if (id) fetchPropertyAndSimilar();
  }, [id]);

  if (loading)
    return (
      <div className="text-center py-20 text-white/70 animate-pulse">
        Loading property...
      </div>
    );

  if (!property) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center text-white">
          <h2 className="text-2xl font-bold mb-4">Property Not Found</h2>
          <p className="text-gray-400">
            The property you're looking for doesn't exist.
          </p>
        </div>
      </div>
    );
  }

  // Map data from API structure
  const formattedProperty = {
    id: property.id,
    title: property.title,
    description: property.description,
    price: property.price,
    type: property.type,
    address: property.address,
    city: property.city,
    state: property.state,
    country: property.country,
    lat: property.lat,
    lng: property.lng,
    size: property.size,
    beds: property.beds,
    baths: property.baths,
    amenities: property.amenities,
    images: property.images,
    agent: {
      name: "Agent Name", // API doesn't have agent details
      phone: "+234 812 345 6789", // Placeholder
      email: "agent@example.com", // Placeholder
      rating: 4.9, // Placeholder
      responseTime: "within an hour", // Placeholder
    },
  };

  const type = property?.type?.toLowerCase();
  const glowColor =
    type === "luxury"
      ? "from-amber-400/10 via-orange-600/10 to-black"
      : type === "apartment"
        ? "from-blue-400/10 via-sky-600/10 to-black"
        : type === "villa"
          ? "from-emerald-400/10 via-green-600/10 to-black"
          : "from-purple-600/10 via-pink-600/10 to-black";

  const fadeUp = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  };

  const formattedPrice = new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(formattedProperty.price);

  const sections = ["Overview", "Amenities", "Location", "Reviews"];

  return (
    <div className="relative pb-24 md:pb-10 overflow-hidden bg-white dark:bg-black text-gray-900 dark:text-gray-100">
      {/* Ambient glow */}
      <div className="absolute inset-0 -z-10 bg-blue-900/10 dark:bg-blue-900/20 blur-[180px]" />

      <motion.div
        animate={{ opacity: [0.2, 0.4, 0.2], scale: [1, 1.05, 1] }}
        className="absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full bg-yellow-800/10 blur-[120px]"
        transition={{ duration: 8, repeat: Infinity }}
      />

      <motion.div
        animate={{ opacity: [0.2, 0.35, 0.2], scale: [1, 1.03, 1] }}
        className="absolute bottom-0 left-0 w-[500px] h-[500px] rounded-full bg-blue-800/10 blur-[150px]"
        transition={{ duration: 10, repeat: Infinity }}
      />

      {/* MAIN CONTENT */}
      <div className="relative z-10">
        <PropertyGallery property={formattedProperty} />

        <div className="sticky top-0 z-50 backdrop-blur-md border-b border-gray-200 dark:border-white/10 bg-white/80 dark:bg-black/70">
          <SectionNav sections={sections} />
        </div>

        <div className="max-w-6xl mx-auto grid md:grid-cols-[2fr_1fr] gap-10 mt-12 px-4">
          {/* LEFT COLUMN */}
          <div className="space-y-14">
            <OverviewSection property={formattedProperty} />

            <motion.div
              className="h-[2px] w-32 bg-yellow-700 rounded-full mt-6"
              initial={{ width: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              whileInView={{ width: "8rem" }}
            />

            <AmenitiesSection amenities={formattedProperty.amenities} />
            <LocationSection property={formattedProperty} />
            <ReviewsSection rating={formattedProperty.agent.rating} />
            <SimilarProperties similar={similar} />
          </div>

          {/* RIGHT COLUMN */}
          <motion.div
            className="hidden md:flex flex-col gap-8"
            initial="hidden"
            variants={fadeUp}
            viewport={{ once: true }}
            whileInView="show"
          >
            <AgentContactCard agent={formattedProperty.agent} />
            <ScheduleTourCard
              selectedDate={selectedDate}
              setSelectedDate={setSelectedDate}
            />
          </motion.div>
        </div>

        <motion.button
          className="fixed bottom-28 right-6 bg-blue-900 hover:bg-blue-800 text-white px-5 py-2.5 rounded-full shadow-lg transition-transform z-50 font-medium"
          whileHover={{ scale: 1.08 }}
          onClick={() => alert("Compare nearby listings coming soon!")}
        >
          Compare Nearby
        </motion.button>

        <StickyBottomBar
          formattedPrice={formattedPrice}
          isFavorite={isFavorite}
          propertyTitle={formattedProperty.title}
          setIsFavorite={setIsFavorite}
        />
      </div>
    </div>
  );
}
