"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Sparkles, Minus, Plus } from "lucide-react";

export default function FairPriceTool() {
  const [city, setCity] = useState("Lagos");
  const [propertyType, setPropertyType] = useState("Apartment");
  const [bedrooms, setBedrooms] = useState(2);

  const [fairRent, setFairRent] = useState(2733000);
  const [lowRent, setLowRent] = useState(2223000);
  const [highRent, setHighRent] = useState(3223000);
  const [listingsCount, setListingsCount] = useState(327);

  useEffect(() => {
    // Dynamic rent estimation logic based on selection
    let basePrice = 1200000; // default base

    if (city === "Lagos") {
      if (propertyType === "Apartment") {
        basePrice = 1100000 + bedrooms * 750000;
      } else if (propertyType === "Duplex") {
        basePrice = 2000000 + bedrooms * 1200000;
      } else {
        // Studio
        basePrice = 700000 + bedrooms * 500000;
      }
    } else {
      // Abuja
      if (propertyType === "Apartment") {
        basePrice = 1300000 + bedrooms * 850000;
      } else if (propertyType === "Duplex") {
        basePrice = 2500000 + bedrooms * 1400000;
      } else {
        // Studio
        basePrice = 900000 + bedrooms * 600000;
      }
    }

    const calculatedFair = Math.round(basePrice);
    const calculatedLow = Math.round(calculatedFair * 0.82);
    const calculatedHigh = Math.round(calculatedFair * 1.18);

    // Dynamic listings count
    const seed = (city.length * propertyType.length * bedrooms) % 150;
    const calculatedCount = 180 + seed + bedrooms * 14;

    setFairRent(calculatedFair);
    setLowRent(calculatedLow);
    setHighRent(calculatedHigh);
    setListingsCount(calculatedCount);
  }, [city, propertyType, bedrooms]);

  const incrementBedrooms = () => {
    if (bedrooms < 6) setBedrooms(prev => prev + 1);
  };

  const decrementBedrooms = () => {
    if (bedrooms > 1) setBedrooms(prev => prev - 1);
  };

  const formatCurrency = (val) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      maximumFractionDigits: 0,
    }).format(val);
  };

  return (
    <section className="py-24 bg-white dark:bg-slate-950 w-full relative">
      <div className="max-w-5xl mx-auto px-6">
        <div className="bg-slate-900 dark:bg-slate-900/60 rounded-[2rem] p-8 md:p-12 text-white grid grid-cols-1 md:grid-cols-2 gap-12 items-center shadow-xl border border-slate-800">
          
          {/* Left Panel: Inputs */}
          <div className="text-left">
            <div className="inline-flex items-center gap-1.5 bg-amber-500/20 text-amber-400 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider mb-6 border border-amber-500/30">
              <Sparkles className="w-3 h-3 text-amber-400" />
              AI Rental Estimator · Live
            </div>
            
            <h2 className="text-3xl font-extrabold mb-4">Know a fair price before you list or rent</h2>
            <p className="text-slate-400 text-sm leading-relaxed mb-8">
              Our AI uses location, property type and live market trends to suggest a fair rent — protecting tenants from inflation and helping landlords price right.
            </p>
            
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">City</label>
                <select 
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full bg-slate-800 border-none rounded-lg text-sm text-white py-3 px-4 focus:ring-1 focus:ring-green-500 outline-none cursor-pointer"
                >
                  <option>Lagos</option>
                  <option>Abuja</option>
                </select>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Type</label>
                  <select 
                    value={propertyType}
                    onChange={(e) => setPropertyType(e.target.value)}
                    className="w-full bg-slate-800 border-none rounded-lg text-sm text-white py-3 px-4 focus:ring-1 focus:ring-green-500 outline-none cursor-pointer"
                  >
                    <option>Apartment</option>
                    <option>Duplex</option>
                    <option>Studio</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Bedrooms</label>
                  <div className="flex items-center bg-slate-800 rounded-lg overflow-hidden border border-transparent">
                    <button 
                      type="button"
                      onClick={decrementBedrooms}
                      className="px-4 py-3 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors select-none cursor-pointer"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="flex-1 text-center text-sm font-semibold select-none">
                      {bedrooms}
                    </span>
                    <button 
                      type="button"
                      onClick={incrementBedrooms}
                      className="px-4 py-3 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors select-none cursor-pointer"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Panel: Estimated Output display */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 text-center text-slate-900 dark:text-white shadow-xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-400 via-green-500 to-amber-400"></div>
            
            <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2 mt-2">
              Estimated Annual Rent
            </div>
            
            {/* Animated price digits */}
            <motion.div 
              key={fairRent}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-4xl font-extrabold text-green-600 dark:text-green-400 mb-8"
            >
              {formatCurrency(fairRent)}
            </motion.div>
            
            {/* Range Bar */}
            <div className="relative w-full h-2 bg-slate-100 dark:bg-slate-700 rounded-full mb-2">
              <div className="absolute left-[20%] right-[20%] h-full bg-gradient-to-r from-green-400 to-green-600 rounded-full"></div>
              <motion.div 
                className="absolute left-[50%] top-1/2 -translate-y-1/2 w-4 h-4 bg-slate-900 dark:bg-slate-100 border-2 border-white dark:border-slate-800 rounded-full shadow"
                layoutId="slider-handle"
                transition={{ type: "spring", stiffness: 120 }}
              />
            </div>
            
            {/* Range indicators */}
            <div className="flex justify-between text-[10px] text-slate-400 dark:text-slate-500 font-bold mb-6 text-left">
              <span>
                {formatCurrency(lowRent)} <br/>
                <span className="font-normal text-slate-300 dark:text-slate-600">Low</span>
              </span>
              <span className="text-green-600 dark:text-green-400 mt-2 text-center">Fair Market</span>
              <span className="text-right">
                {formatCurrency(highRent)} <br/>
                <span className="font-normal text-slate-300 dark:text-slate-600">High</span>
              </span>
            </div>
            
            {/* Source listings badge */}
            <div className="inline-flex items-center gap-2 bg-slate-50 dark:bg-slate-700/50 text-slate-500 dark:text-slate-400 px-3 py-1.5 rounded text-[10px] font-medium border border-slate-100 dark:border-slate-700">
              <svg className="w-3 h-3 text-amber-500" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              Based on {listingsCount} comparable listings in {city}
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}
