"use client";

import { Card, CardBody, Image, Button } from "@heroui/react";
import { MapPin } from "lucide-react";

const properties = [
  {
    id: 1,
    name: "Luxury Apartment",
    price: "$800/mo",
    location: "Lagos, Nigeria",
    image: "/demo/house1.jpg",
  },
  {
    id: 2,
    name: "Modern Studio",
    price: "$500/mo",
    location: "Abuja, Nigeria",
    image: "/demo/house2.jpg",
  },
  {
    id: 3,
    name: "3-Bed Duplex",
    price: "$1200/mo",
    location: "Port Harcourt, Nigeria",
    image: "/demo/house3.jpg",
  },
];

export default function Featured() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {properties.map((property) => (
        <Card
          key={property.id}
          className="shadow-lg hover:scale-[1.02] transition-all"
        >
          <Image
            src={property.image}
            alt={property.name}
            className="w-full h-56 object-cover rounded-t-lg"
          />
          <CardBody>
            <h3 className="text-xl font-semibold mb-2">{property.name}</h3>
            <p className="text-default-600 mb-2 flex items-center gap-1">
              <MapPin size={16} />
              {property.location}
            </p>
            <p className="font-bold mb-4">{property.price}</p>
            <Button color="primary" fullWidth>
              View Details
            </Button>
          </CardBody>
        </Card>
      ))}
    </div>
  );
}
