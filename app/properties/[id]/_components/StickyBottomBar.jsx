"use client";

import { Heart, Share2 } from "lucide-react";

export default function StickyBottomBar({
  formattedPrice,
  propertyTitle,
  isFavorite,
  setIsFavorite,
}) {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-black/95 backdrop-blur-lg border-t border-yellow-800/30 p-4 md:hidden z-40">
      <div className="flex items-center justify-between">
        {/* Price & Title */}
        <div>
          <div className="text-lg font-bold text-yellow-500">
            {formattedPrice}
          </div>
          <div className="text-sm text-gray-300">{propertyTitle}</div>
        </div>

        {/* Actions */}
        <div className="flex space-x-2">
          <button
            className="p-3 rounded-full bg-blue-900 text-white hover:bg-blue-800 transition-colors"
            onClick={() => setIsFavorite(!isFavorite)}
          >
            <Heart
              className={isFavorite ? "text-yellow-500" : ""}
              fill={isFavorite ? "#facc15" : "transparent"} // dark yellow highlight
              size={20}
            />
          </button>

          <button className="p-3 rounded-full bg-blue-900 text-white hover:bg-blue-800 transition-colors">
            <Share2 size={20} />
          </button>

          <button className="px-6 py-3 bg-yellow-800 text-black rounded-lg font-medium hover:bg-yellow-700 transition-colors">
            Book Tour
          </button>
        </div>
      </div>
    </div>
  );
}
