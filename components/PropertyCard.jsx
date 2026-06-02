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

  return (
    <Card
      isPressable
      as={Link}
      className="rounded-2xl overflow-hidden hover:shadow-lg transition-all duration-200"
      href={`/properties/${property.slug || property.id}`}
      shadow="sm"
    >
      {/* Header - Image and badges */}
      <CardHeader className="relative p-0">
        <Image
          removeWrapper
          alt={property.title}
          className="object-cover w-full h-52 z-0"
          loading="lazy"
          src={coverImage}
        />

        {/* Favorite button */}
        <Button
          isIconOnly
          aria-label="Save"
          className="absolute top-2 right-2 bg-white/80 dark:bg-black/60 backdrop-blur-md hover:bg-white/90 transition"
          radius="full"
          size="sm"
          variant="flat"
          onPress={(e) => e.preventDefault()}
        >
          <Heart className="text-rose-500" size={16} />
        </Button>

        {/* Verified Badge */}
        {property.verified && (
          <Chip
            className="absolute bottom-2 left-2"
            color="success"
            size="sm"
            startContent={<ShieldCheck size={12} />}
            variant="solid"
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
          <MapPin className="mr-1 text-primary/70" size={14} />
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
          <Chip className="capitalize" size="sm" variant="flat">
            {property.type}
          </Chip>
        </div>
      </CardBody>

      {/* Footer - Purpose and Status */}
      <CardFooter className="flex justify-between p-4 pt-0">
        <Chip
          className="capitalize"
          color={property.purpose === "rent" ? "primary" : "secondary"}
          size="sm"
          variant="flat"
        >
          {property.purpose}
        </Chip>
        <Chip
          className="capitalize"
          color={
            property.status === "available"
              ? "success"
              : property.status === "pending"
                ? "warning"
                : "default"
          }
          size="sm"
          variant="flat"
        >
          {property.status}
        </Chip>
      </CardFooter>
    </Card>
  );
}
