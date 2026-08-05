"use client";

import type React from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Image from "next/image";
import { Bed, Bath, Area, Pin, Star, Verified, Check, Chat, ArrowLeft, Heart } from "@/components/shared/icons";
import { formatNaira } from "@/domain/constants/property";
import type { Property } from "@/domain/types/property";
import { useRequireAuth } from "@/hooks/use-require-auth";
import PropertyCard from "@/components/shared/property-card";
import { Input, Select, Textarea } from "@/components/ui/form-controls";
import { CalendarDays, MessageCircle } from "lucide-react";

export default function PropertyDetailsClient({
  property,
  relatedProperties,
}: {
  property: Property;
  relatedProperties: Property[];
}) {
  const router = useRouter();
  const { requireAuth } = useRequireAuth();
  
  // Interactive mock states
  const [selectedImage, setSelectedImage] = useState(property.image);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [messageText, setMessageText] = useState("");
  const [messageSuccess, setMessageSuccess] = useState(false);
  const [saved, setSaved] = useState(false);

  // Generate 4 mock image thumbnails for the gallery using the main image or subtle variants
  const images = [
    property.image,
    "/images/hero.jpg", // interior mockup 1
    "/images/dashboard-bg.jpg", // interior mockup 2
    property.image, // fall back
  ];

  const handleMessageSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim()) return;
    
    requireAuth(() => {
      setMessageSuccess(true);
      setMessageText("");
      setTimeout(() => setMessageSuccess(false), 5000);
    });
  };

  const handleBooking = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDate || !selectedTime) return;

    requireAuth(() => {
      setBookingSuccess(true);
      setTimeout(() => setBookingSuccess(false), 6000);
    });
  };

  return (
    <div className="mx-auto max-w-7xl px-5 py-8 lg:px-8">
      {/* Back button */}
      <button
        onClick={() => router.back()}
        className="mb-6 flex items-center gap-2 text-sm font-bold text-navy-700 hover:text-navy-950 transition-colors cursor-pointer"
      >
        <ArrowLeft className="h-4 w-4" /> Back to listings
      </button>

      {/* Main Grid */}
      <div className="grid gap-8 lg:grid-cols-3">
        {/* Left 2 Columns: Media Gallery & Specs details */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Gallery Block */}
          <div className="overflow-hidden rounded-3xl border border-navy-100 bg-white p-3 shadow-sm">
            <div className="relative aspect-video w-full overflow-hidden rounded-2xl">
              <Image
                src={selectedImage}
                alt={property.title}
                fill
                sizes="(max-width: 1024px) 100vw, 66vw"
                className="object-cover transition-all duration-500"
              />
              <div className="absolute inset-x-0 top-0 flex items-start justify-between p-4">
                <div className="flex flex-wrap gap-2">
                  {property.featured && (
                    <span className="rounded-full bg-amber-brand-500 px-3.5 py-1.5 text-xs font-bold uppercase tracking-wide text-white shadow-lg">
                      Featured
                    </span>
                  )}
                  {property.verified && (
                    <span className="flex items-center gap-1 rounded-full bg-white/95 px-3 py-1.5 text-xs font-bold text-brandgreen-700 shadow-lg backdrop-blur">
                      <Verified className="h-4 w-4" /> Verified Direct Listing
                    </span>
                  )}
                </div>
                <button
                  onClick={() => requireAuth(() => setSaved((s) => !s))}
                  className={`flex h-10 w-10 items-center justify-center rounded-full shadow-lg backdrop-blur transition-all cursor-pointer ${
                    saved ? "bg-error text-white" : "bg-white/90 text-navy-600 hover:text-error hover:scale-105"
                  }`}
                  aria-label={saved ? "Remove from saved properties" : "Save property"}
                >
                  <Heart className="size-5" filled={saved} />
                </button>
              </div>
            </div>
            {/* Gallery Thumbnails */}
            <div className="mt-3 grid grid-cols-4 gap-2">
              {images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedImage(img)}
                  className={`relative aspect-video overflow-hidden rounded-xl border-2 transition-all cursor-pointer ${
                    selectedImage === img ? "border-brandgreen-500 scale-[0.98]" : "border-transparent hover:opacity-80"
                  }`}
                >
                  <Image
                    src={img}
                    alt={`${property.title}, view ${i + 1}`}
                    fill
                    sizes="25vw"
                    className="object-cover"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Details Overview Block */}
          <div className="rounded-3xl border border-navy-100 bg-white p-6 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-4 border-b border-navy-100 pb-5">
              <div>
                <span className="rounded-md bg-navy-50 px-2.5 py-1 text-xs font-semibold text-navy-600">
                  {property.type}
                </span>
                <h1 className="mt-3 text-2xl font-extrabold text-navy-950 sm:text-3xl">
                  {property.title}
                </h1>
                <p className="mt-2 flex items-center gap-1.5 text-sm font-semibold text-navy-500">
                  <Pin className="h-4.5 w-4.5 text-brandgreen-500 shrink-0" />
                  {property.location}, {property.city}
                </p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-black text-brandgreen-600">
                  {formatNaira(property.price)}
                </div>
                <div className="text-xs font-bold text-navy-500 uppercase tracking-wider mt-1">
                  per {property.period}
                </div>
              </div>
            </div>

            {/* Quick Specs Cards */}
            <div className="mt-6 grid grid-cols-3 gap-4">
              {[
                { icon: Bed, label: "Bedrooms", val: property.bedrooms },
                { icon: Bath, label: "Bathrooms", val: property.bathrooms },
                { icon: Area, label: "Total Area", val: `${property.area} m²` },
              ].map((s) => (
                <div key={s.label} className="rounded-2xl bg-navy-50/70 p-4 text-center">
                  <s.icon className="mx-auto h-5.5 w-5.5 text-navy-500" />
                  <div className="mt-2 text-xl font-extrabold text-navy-950">{s.val}</div>
                  <div className="text-[11px] font-bold text-navy-400 uppercase tracking-wider mt-1">{s.label}</div>
                </div>
              ))}
            </div>

            {/* Description section */}
            <div className="mt-6">
              <h3 className="text-base font-extrabold text-navy-900">About this Property</h3>
              <p className="mt-3 text-sm leading-relaxed text-navy-600 font-medium">
                {property.description}
              </p>
            </div>

            {/* Amenities Grid */}
            <div className="mt-8 border-t border-navy-100 pt-6">
              <h3 className="text-base font-extrabold text-navy-900">Amenities & Features</h3>
              <div className="mt-4 grid gap-3 grid-cols-2 sm:grid-cols-3">
                {property.amenities.map((a) => (
                  <span
                    key={a}
                    className="flex items-center gap-2 rounded-xl bg-brandgreen-50/50 border border-brandgreen-100 px-3.5 py-2 text-xs font-bold text-brandgreen-800"
                  >
                    <Check className="h-4 w-4 text-brandgreen-600 shrink-0" />
                    {a}
                  </span>
                ))}
              </div>
            </div>

            {/* Landlord information block */}
            <div className="mt-8 border-t border-navy-100 pt-6">
              <div className="flex flex-col gap-4 rounded-2xl border border-navy-100 bg-navy-50/40 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-navy-950 text-sm font-extrabold text-white">
                    {property.landlord.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <div className="text-sm font-extrabold text-navy-950">{property.landlord}</div>
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-brand-600 mt-0.5">
                      <Star className="h-3.5 w-3.5" /> {property.rating} · Verified Direct Landlord
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-brandgreen-100 px-3 py-1 text-xs font-extrabold text-brandgreen-800 uppercase tracking-wider">
                    {property.status}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right 1 Column: Actions & Viewing widgets */}
        <div className="space-y-6">
          
          {/* Scheduling widget */}
          <div className="rounded-3xl border border-navy-100 bg-white p-6 shadow-sm">
            <h3 className="text-lg font-extrabold text-navy-950">Book a Viewing</h3>
            <p className="mt-1.5 text-xs text-navy-500 font-semibold">
              Select a suitable date to view this property physically. No agent needed.
            </p>

            {bookingSuccess ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mt-5 rounded-2xl bg-brandgreen-50 border border-brandgreen-200 p-4 text-center"
              >
                <CalendarDays className="mx-auto size-7 text-success" aria-hidden="true" />
                <h4 className="mt-2 text-sm font-bold text-brandgreen-950">Viewing Requested!</h4>
                <p className="mt-1 text-[11px] text-brandgreen-700 leading-normal">
                  We&apos;ve notified <span className="font-extrabold">{property.landlord}</span>. They will confirm the viewing date in your chat.
                </p>
              </motion.div>
            ) : (
              <form onSubmit={handleBooking} className="mt-5 space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-navy-400">Choose Date</label>
                  <Input
                    type="date"
                    required
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="mt-2 text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-navy-400">Choose Time</label>
                  <Select
                    required
                    value={selectedTime}
                    onChange={(e) => setSelectedTime(e.target.value)}
                    className="mt-2 text-xs font-bold"
                  >
                    <option value="">Select slot</option>
                    <option value="09:00">09:00 AM</option>
                    <option value="11:00">11:00 AM</option>
                    <option value="13:00">01:00 PM</option>
                    <option value="15:00">03:00 PM</option>
                    <option value="17:00">05:00 PM</option>
                  </Select>
                </div>
                <button
                  type="submit"
                  className="w-full rounded-xl bg-navy-950 py-3 text-xs font-extrabold text-white shadow-md transition-colors hover:bg-brandgreen-500 cursor-pointer"
                >
                  Request Schedule
                </button>
              </form>
            )}
          </div>

          {/* Secure Messaging Box */}
          <div className="rounded-3xl border border-navy-100 bg-white p-6 shadow-sm">
            <h3 className="text-lg font-extrabold text-navy-950">Secure Chat</h3>
            <p className="mt-1.5 text-xs text-navy-500 font-semibold">
              Chat directly with the property manager. Keep negotiations scam-free.
            </p>

            {messageSuccess ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mt-5 rounded-2xl bg-brandgreen-50 border border-brandgreen-200 p-4 text-center"
              >
                <MessageCircle className="mx-auto size-7 text-success" aria-hidden="true" />
                <h4 className="mt-2 text-sm font-bold text-brandgreen-950">Message Sent!</h4>
                <p className="mt-1 text-[11px] text-brandgreen-700 leading-normal">
                  Check your <span className="font-extrabold">Dashboard Inbox</span> to continue the conversation.
                </p>
              </motion.div>
            ) : (
              <form onSubmit={handleMessageSend} className="mt-5 space-y-4">
                <div>
                  <Textarea
                    rows={4}
                    required
                    placeholder={`Write a message to ${property.landlord}...`}
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    className="min-h-28 resize-none text-xs font-semibold"
                  />
                </div>
                <button
                  type="submit"
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-brandgreen-500 py-3 text-xs font-extrabold text-white shadow-md shadow-brandgreen-500/20 hover:bg-brandgreen-600 cursor-pointer"
                >
                  <Chat className="h-4.5 w-4.5" />
                  Message Landlord
                </button>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* Similar Properties Section */}
      <div className="mt-16 border-t border-navy-100 pt-10">
        <h2 className="text-xl font-extrabold tracking-tight text-navy-950 sm:text-2xl">
          Similar listings you might like
        </h2>
        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {relatedProperties.slice(0, 3).map((p) => (
            <PropertyCard
              key={p.id}
              p={p}
              saved={false}
              onToggle={() => {}}
              onOpen={() => router.push(`/properties/${p.id}`)}
            />
          ))}
          {relatedProperties.length === 0 && (
            <div className="col-span-full rounded-2xl bg-navy-50/50 py-10 text-center text-xs font-semibold text-navy-400">
              No matching listings in this area.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
