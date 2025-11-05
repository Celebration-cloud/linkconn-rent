"use client";

import { useEffect, useMemo, useState } from "react";
import { Accordion, AccordionItem } from "@heroui/react";
import { Select, SelectItem } from "@heroui/select";
import Input from "@/components/ui/Input";
import { Switch } from "@heroui/switch";
import Button from "@/components/ui/Button";
import { usePropertiesUI } from "@/hooks/usePropertiesUI";
import { siteConfig } from "@/config/site";

export default function PropertyFilters() {
  const { filters, setFilters } = usePropertiesUI();
  const [localFilters, setLocalFilters] = useState(filters);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setFilters(localFilters);
    }, 250);
    return () => clearTimeout(timeout);
  }, [localFilters, setFilters]);

  const typeOptions = useMemo(
    () => siteConfig.propertyTypes.flatMap((group) => group.items),
    []
  );

  const handleChange = (key, value) => {
    setLocalFilters((prev) => ({ ...prev, [key]: value }));
  };

  const resetFilters = () => {
    const reset = {
      q: "",
      type: "",
      category: "",
      purpose: "",
      status: "",
      state: "",
      city: "",
      minBeds: "",
      minBaths: "",
      minSize: "",
      maxSize: "",
      minPrice: "",
      maxPrice: "",
      verified: false,
      kitchen_available: false,
      toilet_available: false,
    };
    setLocalFilters(reset);
    setFilters(reset);
  };

  return (
    <div className="w-full space-y-4 styled-scrollbar overflow-y-auto max-h-[calc(100vh-8rem)]">
      <Accordion
        variant="shadow"
        defaultExpandedKeys={["general", "location", "pricing", "details"]}
        itemClasses={{
          base: "rounded-xl mb-2",
          title: "text-sm font-semibold",
          content: "space-y-3",
        }}
      >
        {/* General Section */}
        <AccordionItem key="general" title="General">
          <div>
            <label className="block text-sm mb-1">Purpose</label>
            <Select
              placeholder="Select purpose"
              selectedKeys={[localFilters.purpose]}
              onSelectionChange={(keys) =>
                handleChange("purpose", [...keys][0] || "")
              }
            >
              <SelectItem key="">All</SelectItem>
              <SelectItem key="rent">Rent</SelectItem>
              <SelectItem key="sale">Sale</SelectItem>
              <SelectItem key="lease">Lease</SelectItem>
            </Select>
          </div>

          <div>
            <label className="block text-sm mb-1">Status</label>
            <Select
              placeholder="Select status"
              selectedKeys={[localFilters.status]}
              onSelectionChange={(keys) =>
                handleChange("status", [...keys][0] || "")
              }
            >
              <SelectItem key="">All</SelectItem>
              <SelectItem key="available">Available</SelectItem>
              <SelectItem key="occupied">Occupied</SelectItem>
              <SelectItem key="pending">Pending</SelectItem>
            </Select>
          </div>

          <div>
            <label className="block text-sm mb-1">Category</label>
            <Select
              placeholder="Select category"
              selectedKeys={[localFilters.category]}
              onSelectionChange={(keys) =>
                handleChange("category", [...keys][0] || "")
              }
            >
              <SelectItem key="">All</SelectItem>
              <SelectItem key="residential">Residential</SelectItem>
              <SelectItem key="commercial">Commercial</SelectItem>
            </Select>
          </div>

          <div>
            <label className="block text-sm mb-1">Type</label>
            <Select
              placeholder="Select type"
              selectedKeys={[localFilters.type]}
              onSelectionChange={(keys) =>
                handleChange("type", [...keys][0] || "")
              }
            >
              <SelectItem key="">All Types</SelectItem>
              {typeOptions.map((item) => (
                <SelectItem key={item.key}>{item.label}</SelectItem>
              ))}
            </Select>
          </div>
        </AccordionItem>

        {/* Location */}
        <AccordionItem key="location" title="Location">
          <div>
            <label className="block text-sm mb-1">City</label>
            <Input
              placeholder="Enter city"
              value={localFilters.city}
              onChange={(e) => handleChange("city", e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm mb-1">State</label>
            <Input
              placeholder="Enter state"
              value={localFilters.state}
              onChange={(e) => handleChange("state", e.target.value)}
            />
          </div>
        </AccordionItem>

        {/* Price Range */}
        <AccordionItem key="pricing" title="Price Range (₦)">
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="block text-sm mb-1">Min</label>
              <Input
                placeholder="Min"
                type="number"
                value={localFilters.minPrice}
                onChange={(e) => handleChange("minPrice", e.target.value)}
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm mb-1">Max</label>
              <Input
                placeholder="Max"
                type="number"
                value={localFilters.maxPrice}
                onChange={(e) => handleChange("maxPrice", e.target.value)}
              />
            </div>
          </div>
        </AccordionItem>

        {/* Details */}
        <AccordionItem key="details" title="Property Details">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm mb-1">Min Beds</label>
              <Input
                placeholder="Beds"
                type="number"
                value={localFilters.minBeds}
                onChange={(e) => handleChange("minBeds", e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm mb-1">Min Baths</label>
              <Input
                placeholder="Baths"
                type="number"
                value={localFilters.minBaths}
                onChange={(e) => handleChange("minBaths", e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm mb-1">Min Size (sqm)</label>
              <Input
                placeholder="Min size"
                type="number"
                value={localFilters.minSize}
                onChange={(e) => handleChange("minSize", e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm mb-1">Max Size (sqm)</label>
              <Input
                placeholder="Max size"
                type="number"
                value={localFilters.maxSize}
                onChange={(e) => handleChange("maxSize", e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <label className="text-sm">Verified</label>
            <Switch
              isSelected={localFilters.verified}
              onValueChange={(v) => handleChange("verified", v)}
              size="sm"
            />
          </div>
        </AccordionItem>

        {/* Amenities */}
        <AccordionItem key="amenities" title="Amenities">
          <div className="flex items-center justify-between">
            <label className="text-sm">Kitchen Available</label>
            <Switch
              isSelected={localFilters.kitchen_available}
              onValueChange={(v) => handleChange("kitchen_available", v)}
              size="sm"
            />
          </div>

          <div className="flex items-center justify-between">
            <label className="text-sm">Toilet Available</label>
            <Switch
              isSelected={localFilters.toilet_available}
              onValueChange={(v) => handleChange("toilet_available", v)}
              size="sm"
            />
          </div>
        </AccordionItem>
      </Accordion>

      <div className="pt-2">
        <Button variant="outline" onClick={resetFilters} className="w-full">
          Reset Filters
        </Button>
      </div>
    </div>
  );
}
