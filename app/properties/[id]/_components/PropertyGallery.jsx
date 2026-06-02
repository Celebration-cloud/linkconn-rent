"use client";

import { useRef } from "react";
import ImageGallery from "react-image-gallery";
import "react-image-gallery/styles/css/image-gallery.css";

export default function PropertyGallery({ property }) {
  if (!property) return null;

  const formattedPrice = new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(property.price);

  const galleryRef = useRef(null);

  const galleryItems = property.images.map((img) => ({
    original: img,
    thumbnail: img,
    originalClass: "rounded-3xl",
    thumbnailClass: "rounded-xl",
  }));

  const openFullscreen = () => {
    if (galleryRef.current) {
      galleryRef.current.fullScreen();
    }
  };

  return (
    <div className="relative w-full space-y-5 px-4 sm:px-6">
      {/* Main Gallery */}
      <div className="relative group rounded-3xl overflow-hidden shadow-[0_8px_40px_rgba(0,0,0,0.15)] dark:shadow-[0_8px_40px_rgba(0,0,0,0.4)]">
        <ImageGallery
          ref={galleryRef}
          additionalClass="rounded-3xl bg-white dark:bg-black"
          items={galleryItems}
          lazyLoad={true}
          showBullets={property.images.length > 1}
          showFullscreenButton={true}
          showPlayButton={false}
          thumbnailPosition="bottom"
        />

        {/* Floating Badges */}
        <div className="absolute top-3 left-3 flex gap-2">
          <span className="px-3 py-1 rounded-full bg-black/10 dark:bg-black/50 text-yellow-700 dark:text-yellow-500 text-xs font-semibold backdrop-blur-md">
            {property.images.length} photos
          </span>
          <button
            className="px-3 py-1 rounded-full bg-blue-900 text-white text-xs font-semibold shadow-lg"
            onClick={openFullscreen}
          >
            HD View
          </button>
        </div>
      </div>

      {/* Title + Price */}
      <div className="mt-2 space-y-1">
        <h1 className="text-2xl font-bold text-black dark:text-white">
          {property.title}
        </h1>
        <p className="text-xl font-semibold inline-block px-4 py-1 rounded-full shadow-md text-yellow-700 dark:text-yellow-500 bg-black/10 dark:bg-black/30">
          {formattedPrice}
        </p>
      </div>
    </div>
  );
}
