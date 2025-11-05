"use client";

import Link from "next/link";
import { Heart, ShieldCheck, MapPin } from "lucide-react";
import {
  Image,
  Chip,
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Button,
} from "@heroui/react";

export default function PropertyCard({ property }) {
  const coverImage =
    property.images?.length > 0 ? property.images[0] : "/placeholder.jpg";
console.log("coverImage:", coverImage)
  return (
    <Card
      as={Link}
      href={`/properties/${property.slug || property.id}`}
      isPressable
      shadow="sm"
      className="rounded-2xl overflow-hidden hover:shadow-lg transition-all duration-200"
    >
      {/* Header - Image and badges */}
      <CardHeader className="relative p-0">
        <Image
          src={coverImage}
          alt={property.title}
          className="object-cover w-full h-52"
          loading="lazy"
          removeWrapper
        />

        {/* Favorite button */}
        <Button
          isIconOnly
          variant="flat"
          radius="full"
          size="sm"
          aria-label="Save"
          onPress={(e) => e.preventDefault()}
          className="absolute top-2 right-2 bg-white/80 dark:bg-black/60 backdrop-blur-md hover:bg-white/90 transition"
        >
          <Heart size={16} className="text-rose-500" />
        </Button>

        {/* Verified Badge */}
        {property.verified && (
          <Chip
            size="sm"
            color="success"
            variant="solid"
            startContent={<ShieldCheck size={12} />}
            className="absolute bottom-2 left-2"
          >
            Verified
          </Chip>
        )}
      </CardHeader>

      {/* Body - Property info */}
      <CardBody className="p-4 space-y-3">
        <div className="flex justify-between items-start">
          <h3 className="font-semibold text-base leading-tight text-foreground line-clamp-2">
            {property.title}
          </h3>
          <p className="font-bold text-primary whitespace-nowrap ml-2">
            ₦{Number(property.price).toLocaleString()}
          </p>
        </div>

        <div className="flex items-center text-sm text-muted-foreground">
          <MapPin size={14} className="mr-1 text-primary/70" />
          <span className="truncate">
            {property.address
              ? property.address
              : `${property.city}, ${property.state}`}
          </span>
        </div>

        <div className="flex flex-wrap gap-2 mt-2">
          <Chip size="sm" variant="flat">
            {property.beds} Beds
          </Chip>
          <Chip size="sm" variant="flat">
            {property.baths} Baths
          </Chip>
          <Chip size="sm" variant="flat">
            {property.size} m²
          </Chip>
          <Chip size="sm" variant="flat" className="capitalize">
            {property.type}
          </Chip>
        </div>
      </CardBody>

      {/* Footer - Purpose and Status */}
      <CardFooter className="flex justify-between p-4 pt-0">
        <Chip
          size="sm"
          color={property.purpose === "rent" ? "primary" : "secondary"}
          variant="flat"
          className="capitalize"
        >
          {property.purpose}
        </Chip>
        <Chip
          size="sm"
          color={
            property.status === "available"
              ? "success"
              : property.status === "pending"
                ? "warning"
                : "default"
          }
          variant="flat"
          className="capitalize"
        >
          {property.status}
        </Chip>
      </CardFooter>
    </Card>
  );
}
