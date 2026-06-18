"use client";

import { motion } from "framer-motion";
import { MapPin, Bed, Bath, ShieldCheck, ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const properties = [
  {
    id: 1,
    name: "The Emerald Residences",
    location: "Ikoyi, Lagos",
    price: "₦4.5M",
    beds: 3,
    baths: 3,
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCVO_5exaFc5m1tVEn_KCpkSRqX2DtcO8kZPaRkT8Es9UaqupKPaKOuyCyPQjeNEyM06sN9PLd_67ytgSSm8bisXhXnIpErOmg6ufRfZ8lmUWCDUBoKbSbIfnRr-b_lP9moUS8MlbwaKPjXVDWQdk5ViKqfHUI6wZylQMbRjG0U_joe4jl2iP_GhvOObKUBcHU43VaRl9-m_yu_JunVLXDcGRKnOrJxKpxWAr2N6bIVF6vtDqh51RPNJHRCua6evpmAvrj8JRiQ4N8",
    verified: true,
  },
  {
    id: 2,
    name: "Oasis Duplex",
    location: "Maitama, Abuja",
    price: "₦8.0M",
    beds: 4,
    baths: 5,
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCHMBJhNormLQlkUL7tg2yZTrQaZkfitm2WVgNg6GKXRMsYYPiu3di44PpifFCA1ucajf8US-BS-FGcix5xkCWF5xNC95qiWLvqq0x257oYEn7DXOZ2F7vn-KFKh_lFENE1Fxqr9-PMUHkGLXTZnEALCq-qizdkd5N3DUkj9XDgeHQuws8V8D2_laluylFZVRm6IFmNxjsCKLvz6rWT0c4b8TdMP0i4O7Bson0JS8xeSu4A1jHQBTm6qotCN6IgzpL0npA47Rz4jns",
    verified: true,
  },
  {
    id: 3,
    name: "Urban Studio",
    location: "Lekki Phase 1, Lagos",
    price: "₦2.5M",
    beds: 1,
    baths: 1,
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAzBkN9r47Eop3GgZegSenvCa_GhpK23TlYL9_kxMA-h2VCiSUeV7PBlw2cMVnHNqTcNsFYszjzeCkzJHbFhi0aR_y2_9bM3VWHP3PS_BNgX8OF_1V0wxMNfgsd97IPit5Q5LynnU8R0vq52BhslhhYuKPzkdU0ZLJYVItARdWL2hAbTX7zYxXmMc6hpxnGCCJwnm7-Hq5_P6TvCa4b55-8-Rzq3VkF0B7d0vkwdP6Li9Rf8L-2zI6RXzF55d4u0WuLE0fw37UuCv8",
    verified: true,
  },
  {
    id: 4,
    name: "Tranquil Terraces",
    location: "Victoria Island, Lagos",
    price: "₦6.0M",
    beds: 3,
    baths: 4,
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDfsVJwXeq2levxa-7VBB1byC1ozmBocDSxgArRh_XFy4D7WvqWdtXr_CgQPn9S3I5U0JP_F8Ezv8a9bxnO_HAWyMGRlw7DbU80taFrWds3C3p8cu_b7nnDAKoa1QXaiKdz0kU640x3iOBq3IFF2XFoJPfoZE2kJOadP6_ETRWo9_bwPtb-V7C-szt6aCjml_vRt1KTGuxFyOo8DGpt3bieOdctdvw6Jyj6qWKeAfYBdTkyJ41hm0puATf4RYSyILDu5uiVqpcCZuA",
    verified: true,
  },
];

export default function Featured() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, scale: 0.95, y: 20 },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: { type: "spring", stiffness: 100, damping: 14 }
    }
  };

  return (
    <div className="w-full py-24 bg-slate-50/50 dark:bg-slate-900/40">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="flex items-end justify-between mb-12">
          <div className="text-left">
            <p className="text-green-600 dark:text-green-400 text-xs font-bold uppercase tracking-widest mb-2">Featured Homes</p>
            <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-3">Featured Properties</h2>
            <p className="text-slate-500 dark:text-slate-400 font-medium">Handpicked, highly-rated homes available now.</p>
          </div>
          <Link
            href="/properties"
            className="hidden sm:inline-flex items-center gap-2 text-sm font-bold text-green-600 dark:text-green-400 border border-green-200 dark:border-green-800 hover:bg-green-50 dark:hover:bg-green-950/30 px-4 py-2 rounded-full transition-all group"
          >
            View All
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        {/* Grid */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
        >
          {properties.map((property) => (
            <motion.div
              key={property.id}
              className="bg-white dark:bg-slate-800 rounded-3xl overflow-hidden border border-slate-100 dark:border-slate-700 card-shadow transition-all duration-300 hover:shadow-lg group cursor-pointer flex flex-col text-left"
              variants={cardVariants}
              whileHover={{ y: -6 }}
            >
              <div className="relative h-64 overflow-hidden w-full">
                <Image
                  alt={property.name}
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                  src={property.image}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  priority={property.id <= 2}
                />
                {property.verified && (
                  <div className="absolute top-4 left-4 bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-400 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 border border-green-200 dark:border-green-800 z-10">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                    Verified
                  </div>
                )}
              </div>
              <div className="p-6 flex-grow flex flex-col">
                <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
                  {property.name}
                </h4>
                <div className="flex items-center gap-1 text-slate-400 dark:text-slate-500 text-xs font-medium mb-4">
                  <MapPin className="w-3.5 h-3.5" />
                  {property.location}
                </div>
                
                {/* Specs & Price */}
                <div className="flex justify-between items-center border-t border-slate-50 dark:border-slate-700 pt-4 mt-auto">
                  <div className="flex items-center gap-4 text-xs font-bold text-slate-500 dark:text-slate-400">
                    <span className="flex items-center gap-1.5">
                      <Bed className="w-4 h-4 text-slate-300 dark:text-slate-600" />
                      {property.beds}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Bath className="w-4 h-4 text-slate-300 dark:text-slate-600" />
                      {property.baths}
                    </span>
                  </div>
                  <span className="text-lg font-bold text-green-600 dark:text-green-400">
                    {property.price}
                    <span className="text-xs font-normal text-slate-400">/yr</span>
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}

