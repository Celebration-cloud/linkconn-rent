"use client";

import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { Upload } from "lucide-react";
import { Select, SelectItem } from "@heroui/select";
import { AppTextarea } from "@/components/ui/Textarea";
import { landlordPropertySchema } from "@/lib/zodSchemas";
import { useLandlordOnboardStore } from "@/store/useLandlordOnboardStore";

export default function LandlordPropertySetup() {
  const router = useRouter();
  const { property, setProperty, nextStep, step } = useLandlordOnboardStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
    const { identity, payout } = useLandlordOnboardStore();

    useEffect(() => {
      if (!identity) {
        router.replace("/onboarding/landlord"); // Step 1
      } else if (!property) {
        router.replace("/onboarding/landlord/property"); // Step 2
      } else if (!payout) {
        router.replace("/onboarding/landlord/payout"); // Step 3
      } else {
        router.replace("/onboarding/landlord/success"); // Completed
      }
    }, [identity, property, payout, router]);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(landlordPropertySchema),
    defaultValues: property || {
      title: "",
      type: "apartment",
      address: "",
      price: "",
      description: "",
      images: [],
    },
  });

  const onSubmit = (data) => {
    setIsSubmitting(true);

    // Save property data to Zustand
    setProperty(data);

    // Simulate API call or next step
    setTimeout(() => {
      setIsSubmitting(false);
      nextStep();
      router.push("/onboarding/landlord/payout");
    }, 500);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 25 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-2xl bg-card rounded-2xl p-6"
    >
      {/* Step tracker */}
      <div className="mb-4 flex justify-between items-center">
        <div
          className={`w-1/3 h-2 rounded ${step >= 1 ? "bg-primary" : "bg-gray-300"}`}
        />
        <div
          className={`w-1/3 h-2 rounded ${step >= 2 ? "bg-primary" : "bg-gray-300"}`}
        />
        <div
          className={`w-1/3 h-2 rounded ${step >= 3 ? "bg-primary" : "bg-gray-300"}`}
        />
      </div>

      <h1 className="text-2xl font-semibold mb-2 text-center">
        Add Your First Property
      </h1>
      <p className="text-center text-sm text-muted-foreground mb-8">
        Provide accurate details. Verification may take 24–48 hours.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Title */}
        <div>
          <label className="block mb-1 text-sm font-medium">
            Property Title
          </label>
          <Controller
            name="title"
            control={control}
            render={({ field }) => (
              <Input
                placeholder="e.g., 3-Bedroom Apartment at Lekki Phase 1"
                {...field}
              />
            )}
          />
          {errors.title && (
            <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>
          )}
        </div>

        {/* Type */}
        <div>
          <label className="block mb-1 text-sm font-medium">
            Property Type
          </label>
          <Controller
            name="type"
            control={control}
            render={({ field }) => (
              <Select
                selectedKeys={[field.value]}
                onSelectionChange={(keys) => field.onChange([...keys][0])}
              >
                <SelectItem key="apartment">Apartment</SelectItem>
                <SelectItem key="bungalow">Bungalow</SelectItem>
                <SelectItem key="duplex">Duplex</SelectItem>
                <SelectItem key="commercial">Commercial Building</SelectItem>
                <SelectItem key="land">Land / Plot</SelectItem>
              </Select>
            )}
          />
          {errors.type && (
            <p className="text-red-500 text-xs mt-1">{errors.type.message}</p>
          )}
        </div>

        {/* Address */}
        <div>
          <label className="block mb-1 text-sm font-medium">Address</label>
          <Controller
            name="address"
            control={control}
            render={({ field }) => (
              <Input
                placeholder="No 10, Adebayo Street, Lekki, Lagos"
                {...field}
              />
            )}
          />
          {errors.address && (
            <p className="text-red-500 text-xs mt-1">
              {errors.address.message}
            </p>
          )}
        </div>

        {/* Price */}
        <div>
          <label className="block mb-1 text-sm font-medium">
            Monthly Rent (₦)
          </label>
          <Controller
            name="price"
            control={control}
            render={({ field }) => (
              <Input placeholder="e.g., 250000" {...field} />
            )}
          />
          {errors.price && (
            <p className="text-red-500 text-xs mt-1">{errors.price.message}</p>
          )}
        </div>

        {/* Description */}
        <div>
          <label className="block mb-1 text-sm font-medium">
            Property Description
          </label>
          <Controller
            name="description"
            control={control}
            render={({ field }) => (
              <AppTextarea
                rows={4}
                placeholder="Describe this property (features, location, nearby facilities)"
                {...field}
              />
            )}
          />
          {errors.description && (
            <p className="text-red-500 text-xs mt-1">
              {errors.description.message}
            </p>
          )}
        </div>

        {/* Images */}
        <div>
          <label className="block mb-1 text-sm font-medium items-center gap-2">
            <Upload size={16} className="inline mr-1" /> Upload Property Images
            (3–5)
          </label>
          <Controller
            name="images"
            control={control}
            render={({ field }) => {
              const handleFileChange = (e) => {
                const files = Array.from(e.target.files);
                const updatedFiles = [...(field.value || []), ...files];

                // Validate file size
                const oversized = updatedFiles.some(
                  (file) => file.size > 3 * 1024 * 1024
                );
                if (oversized) {
                  alert("Each image must be under 3MB.");
                  return;
                }
                field.onChange(updatedFiles);
              };

              const handleDelete = (index) => {
                const newFiles = field.value.filter((_, i) => i !== index);
                field.onChange(newFiles);
              };

              return (
                <div>
                  <Input
                    type="file"
                    multiple={true}
                    accept="image/*"
                    onChange={handleFileChange}
                  />
                  {field.value && field.value.length > 0 && (
                    <div className="grid grid-cols-3 gap-3 mt-3">
                      {Array.from(field.value).map((file, i) => (
                        <div
                          key={i}
                          className="relative border rounded-lg overflow-hidden aspect-square group"
                        >
                          <img
                            src={URL.createObjectURL(file)}
                            alt={`Preview ${i + 1}`}
                            className="object-cover w-full h-full"
                          />
                          <p className="absolute bottom-0 bg-black/50 text-white text-[10px] px-1 py-0.5 w-full text-center">
                            {(file.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                          <button
                            type="button"
                            onClick={() => handleDelete(i)}
                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition"
                            title="Remove image"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            }}
          />
          {errors.images && (
            <p className="text-red-500 text-xs mt-1">{errors.images.message}</p>
          )}
        </div>

        <Button type="submit" className="w-full mt-4" disabled={isSubmitting}>
          {isSubmitting ? "Submitting..." : "Complete Onboarding"}
        </Button>
      </form>
    </motion.div>
  );
}
