"use client";

import { useState } from "react";
import type { ReactNode } from "react";
import Link from "next/link";
import { Logo } from "@/components/shared/icons";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  useForm,
  type Resolver,
  type UseFormRegisterReturn,
} from "react-hook-form";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  FileImage,
  Home,
  MapPin,
  ReceiptText,
  Save,
} from "lucide-react";
import { Input, Select, Textarea } from "@/components/ui/form-controls";
import {
  propertyDraftSchema,
  type PropertyDraftInput,
} from "@/schemas/operating-system";
import { formatNaira, getMoveInTotal } from "@/utils/map-property";
import { toastError, toastSuccess } from "@/stores/toast-store";

const STEPS = [
  { label: "Details", icon: Home },
  { label: "Location", icon: MapPin },
  { label: "Rent & fees", icon: ReceiptText },
  { label: "Media", icon: FileImage },
  { label: "Review", icon: Check },
] as const;

const DEFAULT_VALUES: PropertyDraftInput = {
  title: "",
  type: "Apartment",
  location: "",
  city: "Lagos",
  description: "",
  price: 0,
  period: "year",
  bedrooms: 1,
  bathrooms: 1,
  toilets: 1,
  area: 0,
  images: [],
  amenities: [],
  houseRules: [],
  cautionFee: 0,
  legalFee: 0,
  agencyFee: 0,
  serviceCharge: 0,
  publish: false,
};

export function ListingWizard({ initialStep = 0 }: { initialStep?: number }) {
  const [step, setStep] = useState(Math.min(Math.max(initialStep, 0), STEPS.length - 1));
  const [draftId, setDraftId] = useState<string>();
  const [saving, setSaving] = useState(false);
  const [imageText, setImageText] = useState("");
  const form = useForm<PropertyDraftInput>({
    resolver: zodResolver(propertyDraftSchema) as Resolver<PropertyDraftInput>,
    defaultValues: DEFAULT_VALUES,
    mode: "onBlur",
  });
  const values = form.watch();
  const total = getMoveInTotal(values);

  async function persist(publish = false) {
    setSaving(true);
    const valid = await form.trigger();
    if (!valid) {
      setSaving(false);
      const firstField = Object.keys(form.formState.errors)[0];
      toastError(
        "Complete the listing",
        firstField
          ? `Review the ${firstField} field before saving.`
          : "Review the highlighted fields.",
      );
      return;
    }
    const payload = {
      ...form.getValues(),
      id: draftId,
      images: imageText
        .split(/\r?\n/)
        .map((item) => item.trim())
        .filter(Boolean),
      publish,
    };
    const response = await fetch("/api/properties", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const result = (await response.json()) as {
      success: boolean;
      data?: { id: string };
      message: string;
    };
    setSaving(false);
    if (!result.success) {
      toastError("Listing not saved", result.message);
      return;
    }
    if (result.data?.id) setDraftId(result.data.id);
    toastSuccess(
      publish ? "Property published" : "Draft saved",
      result.message,
    );
  }

  return (
    <main id="main-content" className="min-h-[100dvh] bg-sand-50">
      <header className="border-b border-line bg-white">
        <div className="stitch-container flex min-h-20 items-center gap-4">
          <Link href="/dashboard" className="grid h-11 w-11 place-items-center rounded-full bg-sand-200" aria-label="Back to dashboard"><ArrowLeft className="h-5 w-5" /></Link>
          <div className="flex-1">
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-forest-700">List a property</p>
            <h1 className="text-xl font-extrabold text-ink">{STEPS[step].label}</h1>
          </div>
          <Link href="/" className="hidden size-11 place-items-center rounded-lg hover:bg-sand-100 sm:grid" aria-label="LinkConn Rent home"><Logo variant="mark" priority className="size-9" sizes="36px" /></Link>
          <button disabled={saving} onClick={() => void persist(false)} className="stitch-button-secondary"><Save className="h-4 w-4" /><span className="hidden sm:inline">Save draft</span></button>
        </div>
      </header>

      <div className="stitch-container py-7">
        <ol className="grid grid-cols-5 gap-2" aria-label="Listing progress">
          {STEPS.map((item, index) => {
            const Icon = item.icon;
            return (
              <li key={item.label}>
                <button onClick={() => setStep(index)} className={`flex min-h-14 w-full flex-col items-center justify-center gap-1 rounded-lg border px-2 text-[10px] font-bold transition sm:flex-row sm:text-xs ${index === step ? "border-forest-700 bg-forest-800 text-white" : index < step ? "border-forest-200 bg-forest-50 text-forest-800" : "border-line bg-white text-muted"}`}>
                  <Icon className="h-4 w-4" /><span className="hidden sm:inline">{item.label}</span><span className="sm:hidden">{index + 1}</span>
                </button>
              </li>
            );
          })}
        </ol>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_20rem]">
          <section className="rounded-xl border border-line bg-white p-5 sm:p-7">
            {step === 0 && (
              <div>
                <StepHeading title="Tell renters about the home" description="Start with the essentials. You can return to any step before publishing." />
                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  <Field label="Listing title" error={form.formState.errors.title?.message} className="sm:col-span-2"><Input {...form.register("title")} placeholder="Modern two-bedroom apartment" /></Field>
                  <Field label="Property type" error={form.formState.errors.type?.message}><Select {...form.register("type")}><option>Apartment</option><option>Duplex</option><option>Terrace</option><option>Detached house</option><option>Studio</option></Select></Field>
                  <Field label="Floor area (m²)" error={form.formState.errors.area?.message}><Input type="number" {...form.register("area", { valueAsNumber: true })} /></Field>
                  <Field label="Bedrooms" error={form.formState.errors.bedrooms?.message}><Input type="number" {...form.register("bedrooms", { valueAsNumber: true })} /></Field>
                  <Field label="Bathrooms" error={form.formState.errors.bathrooms?.message}><Input type="number" {...form.register("bathrooms", { valueAsNumber: true })} /></Field>
                  <Field label="Toilets" error={form.formState.errors.toilets?.message}><Input type="number" {...form.register("toilets", { valueAsNumber: true })} /></Field>
                  <Field label="Description" error={form.formState.errors.description?.message} className="sm:col-span-2"><Textarea className="min-h-36" {...form.register("description")} placeholder="Describe the home, its condition and the neighbourhood." /></Field>
                  <Field label="Amenities (comma separated)" className="sm:col-span-2"><Input value={values.amenities.join(", ")} onChange={(event) => form.setValue("amenities", event.target.value.split(",").map((item) => item.trim()).filter(Boolean))} placeholder="Generator, Security, Parking" /></Field>
                  <Field label="House rules (comma separated)" className="sm:col-span-2"><Input value={values.houseRules.join(", ")} onChange={(event) => form.setValue("houseRules", event.target.value.split(",").map((item) => item.trim()).filter(Boolean))} placeholder="No smoking, No short lets" /></Field>
                </div>
              </div>
            )}

            {step === 1 && (
              <div>
                <StepHeading title="Pin the property location" description="Coordinates power bounds search and the synchronized map experience." />
                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  <Field label="Street / neighbourhood" error={form.formState.errors.location?.message} className="sm:col-span-2"><Input {...form.register("location")} placeholder="Lekki Phase 1, Lagos" /></Field>
                  <Field label="City" error={form.formState.errors.city?.message}><Input {...form.register("city")} /></Field>
                  <Field label="Latitude" error={form.formState.errors.latitude?.message}><Input type="number" step="any" {...form.register("latitude", { setValueAs: (value) => value === "" ? undefined : Number(value) })} placeholder="6.4474" /></Field>
                  <Field label="Longitude" error={form.formState.errors.longitude?.message}><Input type="number" step="any" {...form.register("longitude", { setValueAs: (value) => value === "" ? undefined : Number(value) })} placeholder="3.4723" /></Field>
                </div>
                <div className="mt-5 rounded-xl bg-forest-50 p-5 text-sm leading-6 text-forest-900"><MapPin className="mb-3 h-5 w-5" />Leaflet uses these coordinates with the configured OpenStreetMap-compatible tile provider. The public pin remains approximate.</div>
              </div>
            )}

            {step === 2 && (
              <div>
                <StepHeading title="Set the rent and move-in fees" description="Give renters a transparent total before they apply." />
                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  <Field label="Rent amount" error={form.formState.errors.price?.message}><div className="relative"><span className="pointer-events-none absolute inset-y-0 left-0 z-10 flex w-9 items-center justify-center text-sm font-bold text-muted">₦</span><Input type="number" className="pl-8" {...form.register("price", { valueAsNumber: true })} /></div></Field>
                  <Field label="Billing period"><Select {...form.register("period")}><option value="year">Per year</option><option value="month">Per month</option></Select></Field>
                  <Field label="Caution fee"><MoneyInput register={form.register("cautionFee", { valueAsNumber: true })} /></Field>
                  <Field label="Legal fee"><MoneyInput register={form.register("legalFee", { valueAsNumber: true })} /></Field>
                  <Field label="Agency fee"><MoneyInput register={form.register("agencyFee", { valueAsNumber: true })} /></Field>
                  <Field label="Service charge"><MoneyInput register={form.register("serviceCharge", { valueAsNumber: true })} /></Field>
                </div>
              </div>
            )}

            {step === 3 && (
              <div>
                <StepHeading title="Add listing media" description="One URL or local public asset path per line. Final publication requires at least one usable image." />
                <label className="mt-6 block text-sm font-bold text-ink">Image sources
                  <Textarea value={imageText} onChange={(event) => setImageText(event.target.value)} className="mt-2 min-h-44" placeholder={"/images/prop1.jpg\nhttps://images.example.com/property.jpg"} />
                </label>
                <div className="mt-4 rounded-lg border border-line bg-sand-100 p-4 text-sm text-muted">Images are rendered using next/image. Local assets should live under public/.</div>
              </div>
            )}

            {step === 4 && (
              <div>
                <StepHeading title="Review your listing" description="Save a draft at any time or publish when all required details and media are ready." />
                <dl className="mt-6 divide-y divide-line rounded-xl border border-line">
                  {[
                    ["Title", values.title || "Not provided"],
                    ["Type", values.type],
                    ["Location", values.location || "Not provided"],
                    ["Bedrooms", String(values.bedrooms)],
                    ["Rent", `${formatNaira(values.price)} / ${values.period}`],
                    ["Move-in total", formatNaira(total)],
                    ["Images", String(imageText.split(/\r?\n/).filter(Boolean).length)],
                  ].map(([label, value]) => <div key={label} className="flex items-center justify-between gap-5 px-4 py-3"><dt className="text-sm text-muted">{label}</dt><dd className="text-right text-sm font-extrabold text-ink">{value}</dd></div>)}
                </dl>
                <button disabled={saving} onClick={() => void persist(true)} className="stitch-button mt-6 w-full"><Check className="h-4 w-4" /> Publish property</button>
              </div>
            )}

            <div className="mt-8 flex items-center justify-between border-t border-line pt-5">
              <button disabled={step === 0} onClick={() => setStep((current) => Math.max(0, current - 1))} className="stitch-button-secondary disabled:opacity-40"><ArrowLeft className="h-4 w-4" /> Back</button>
              {step < STEPS.length - 1 && <button onClick={() => setStep((current) => Math.min(STEPS.length - 1, current + 1))} className="stitch-button">Continue <ArrowRight className="h-4 w-4" /></button>}
            </div>
          </section>

          <aside className="h-fit rounded-xl border border-line bg-forest-900 p-5 text-white lg:sticky lg:top-5">
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-lime-300">Move-in summary</p>
            <div className="mt-5 space-y-3 text-sm">
              {[
                ["Rent", values.price],
                ["Caution fee", values.cautionFee],
                ["Legal fee", values.legalFee],
                ["Agency fee", values.agencyFee],
                ["Service charge", values.serviceCharge],
              ].map(([label, amount]) => <div key={label} className="flex justify-between gap-3 text-white/70"><span>{label}</span><strong className="text-white">{formatNaira(Number(amount))}</strong></div>)}
            </div>
            <div className="mt-5 border-t border-white/15 pt-5">
              <p className="text-xs text-white/60">Estimated move-in total</p>
              <p className="mt-1 text-2xl font-extrabold">{formatNaira(total)}</p>
            </div>
            <p className="mt-5 text-xs leading-5 text-white/55">This total is calculated from your database-backed fee fields and shown to renters on the property page.</p>
          </aside>
        </div>
      </div>
    </main>
  );
}

function StepHeading({ title, description }: { title: string; description: string }) {
  return <div><h2 className="text-2xl font-extrabold tracking-tight text-ink">{title}</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-muted">{description}</p></div>;
}

function Field({ label, error, className = "", children }: { label: string; error?: string; className?: string; children: ReactNode }) {
  return <label className={`block text-sm font-bold text-ink ${className}`}>{label}<span className="mt-2 block">{children}</span>{error && <span className="mt-1 block text-xs font-semibold text-red-700">{error}</span>}</label>;
}

function MoneyInput({ register }: { register: UseFormRegisterReturn }) {
  return <div className="relative"><span className="pointer-events-none absolute inset-y-0 left-0 z-10 flex w-9 items-center justify-center text-sm font-bold text-muted">₦</span><Input type="number" className="pl-8" {...register} /></div>;
}
