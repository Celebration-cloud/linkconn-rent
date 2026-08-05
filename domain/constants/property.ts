export const NAIRA = "₦";

export function formatNaira(n: number) {
  return NAIRA + n.toLocaleString("en-NG");
}

export const PROPERTY_TYPES = [
  "Apartment",
  "Duplex",
  "Self-Contain",
  "Shared Apartment",
  "Studio",
  "Mansion",
  "Commercial",
];

export const CITIES = ["Lagos", "Abuja", "Port Harcourt", "Ibadan", "Enugu", "Kano"];

export const AMENITIES = [
  "24/7 Power",
  "Borehole Water",
  "Security",
  "Parking",
  "Air Conditioning",
  "Furnished",
  "Swimming Pool",
  "POP Ceiling",
  "Fitted Kitchen",
  "Wifi Ready",
];
