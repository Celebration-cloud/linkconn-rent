"use client";

import { useEffect, useMemo, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Accordion, AccordionItem } from "@heroui/react";
import { Select, SelectItem } from "@heroui/select";
import Input from "@/components/ui/Input";
import { Switch } from "@heroui/switch";
import Button from "@/components/ui/Button";
import { siteConfig } from "@/config/site";
import {
  fetchProperties,
  setFilters,
  setPage,
} from "@/lib/redux/slices/propertiesSlice";

export default function PropertyFilters() {
  const dispatch = useDispatch();
  const { filters } = useSelector((state) => state.properties);
  const [localFilters, setLocalFilters] = useState(filters);

  useEffect(() => {
    const timeout = setTimeout(() => {
      dispatch(setFilters(localFilters));
      dispatch(setPage(1));
      dispatch(fetchProperties());
    }, 250);
    return () => clearTimeout(timeout);
  }, [localFilters, dispatch]);

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
      states: [],
      city: "",
      cities: [],
      minBeds: "",
      maxBeds: "",
      minBaths: "",
      maxBaths: "",
      minSize: "",
      maxSize: "",
      minFloor: "",
      maxFloor: "",
      minFavorites: "",
      maxFavorites: "",
      minPrice: "",
      maxPrice: "",
      verified: false,
      kitchen: "",
      toilet: "",
      amenities: [],
    };
    setLocalFilters(reset);
    dispatch(setFilters(reset));
  };

  return (
    <div className="w-full space-y-4 styled-scrollbar overflow-y-auto max-h-[calc(100vh-8rem)]">
      <Accordion
        variant="shadow"
        defaultExpandedKeys={[
          "general",
          "location",
          "pricing",
          "details",
          "amenities",
        ]}
        itemClasses={{
          base: "rounded-xl mb-2",
          title: "text-sm font-semibold",
          content: "space-y-3",
        }}
      >
        {/* General */}
        <AccordionItem key="general" title="General">
          {["purpose", "status", "category", "type", "kitchen", "toilet"].map(
            (key) => {
              let options = [];
              if (key === "purpose") options = ["", "rent", "sale", "lease"];
              if (key === "status")
                options = ["", "available", "occupied", "pending"];
              if (key === "category")
                options = ["", "residential", "commercial"];
              if (key === "type")
                options = ["", ...typeOptions.map((t) => t.key)];
              if (key === "kitchen") options = ["", "standard", "modular"];
              if (key === "toilet") options = ["", "standard", "ensuite"];

              return (
                <div key={key}>
                  <label className="block text-sm mb-1">
                    {key.charAt(0).toUpperCase() + key.slice(1)}
                  </label>
                  <Select
                    placeholder={`Select ${key}`}
                    selectedKeys={[localFilters[key]]}
                    onSelectionChange={(keys) =>
                      handleChange(key, [...keys][0] || "")
                    }
                  >
                    {options.map((opt) => (
                      <SelectItem key={opt}>{opt || "All"}</SelectItem>
                    ))}
                  </Select>
                </div>
              );
            }
          )}
        </AccordionItem>

        {/* Location */}
        <AccordionItem key="location" title="Location">
          {["city", "state"].map((key) => (
            <div key={key}>
              <label className="block text-sm mb-1">
                {key.charAt(0).toUpperCase() + key.slice(1)}
              </label>
              <Input
                placeholder={`Enter ${key}`}
                value={localFilters[key]}
                onChange={(e) => handleChange(key, e.target.value)}
              />
            </div>
          ))}

          {/* Multi-city/state */}
          <div>
            <label className="block text-sm mb-1">States (Multi)</label>
            <Input
              placeholder="Comma separated states"
              value={localFilters.states.join(",")}
              onChange={(e) =>
                handleChange(
                  "states",
                  e.target.value.split(",").map((v) => v.trim())
                )
              }
            />
          </div>
          <div>
            <label className="block text-sm mb-1">Cities (Multi)</label>
            <Input
              placeholder="Comma separated cities"
              value={localFilters.cities.join(",")}
              onChange={(e) =>
                handleChange(
                  "cities",
                  e.target.value.split(",").map((v) => v.trim())
                )
              }
            />
          </div>
        </AccordionItem>

        {/* Pricing */}
        <AccordionItem key="pricing" title="Price & Favorites">
          <div className="grid grid-cols-2 gap-3">
            {["minPrice", "maxPrice", "minFavorites", "maxFavorites"].map(
              (key) => (
                <div key={key}>
                  <label className="block text-sm mb-1">
                    {key.replace(/([A-Z])/g, " $1")}
                  </label>
                  <Input
                    placeholder={key.replace(/([A-Z])/g, " ")}
                    type="number"
                    value={localFilters[key]}
                    onChange={(e) => handleChange(key, e.target.value)}
                  />
                </div>
              )
            )}
          </div>
        </AccordionItem>

        {/* Details */}
        <AccordionItem key="details" title="Property Details">
          <div className="grid grid-cols-2 gap-3">
            {[
              "minBeds",
              "maxBeds",
              "minBaths",
              "maxBaths",
              "minSize m²",
              "maxSize m²",
              "minFloor",
              "maxFloor",
            ].map((key) => (
              <div key={key}>
                <label className="block text-sm mb-1">
                  {key.replace(/([A-Z])/g, " $1")}
                </label>
                <Input
                  placeholder={key.replace(/([A-Z])/g, " ")}
                  type="number"
                  value={localFilters[key]}
                  onChange={(e) => handleChange(key, e.target.value)}
                />
              </div>
            ))}
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
          <div className="">
            {["amenities"].map((key) => (
              <div key={key} className="">
                <label className="block text-sm mb-1">
                  Amenities (comma separated)
                </label>
                <Input
                  placeholder="Pool, Gym, Garden..."
                  value={localFilters[key].join(",")}
                  className="w-full"
                  onChange={(e) =>
                    handleChange(
                      key,
                      e.target.value.split(",").map((v) => v.trim())
                    )
                  }
                />
              </div>
            ))}
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
