"use client";

import type React from "react";
import { useState } from "react";
import { motion } from "framer-motion";
import { z } from "zod";
import { CheckCircle2, ExternalLink, Mail, MapPin, MessageCircle } from "lucide-react";
import { Input, Textarea } from "@/components/ui/form-controls";

// Zod schema for form validation
const contactSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters long"),
  email: z.string().email("Please enter a valid email address"),
  subject: z.string().min(3, "Subject must be at least 3 characters long"),
  message: z.string().min(10, "Message must be at least 10 characters long"),
});

type FormFields = z.infer<typeof contactSchema>;

export default function ContactClient() {
  const [fields, setFields] = useState<FormFields>({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const [errors, setErrors] = useState<Partial<Record<keyof FormFields, string>>>({});
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFields((prev) => ({ ...prev, [name]: value }));
    // Clear error for field on change
    if (errors[name as keyof FormFields]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    
    // Validate fields using Zod
    const validationResult = contactSchema.safeParse(fields);
    
    if (!validationResult.success) {
      const formattedErrors: Partial<Record<keyof FormFields, string>> = {};
      validationResult.error.errors.forEach((err) => {
        if (err.path[0]) {
          formattedErrors[err.path[0] as keyof FormFields] = err.message;
        }
      });
      setErrors(formattedErrors);
      return;
    }

    // Simulate form submission
    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setLoading(false);
    setSuccess(true);
    setFields({ name: "", email: "", subject: "", message: "" });
    setTimeout(() => setSuccess(false), 5000);
  };

  return (
    <div className="mx-auto max-w-5xl px-5 py-12 lg:px-8 space-y-12">
      {/* Header section */}
      <div className="text-center">
        <span className="text-xs font-bold uppercase tracking-widest text-brandgreen-600 bg-brandgreen-50 px-3.5 py-1.5 rounded-full">
          Get in Touch
        </span>
        <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-navy-950 sm:text-4xl">
          Contact Our Support Team
        </h1>
        <p className="mt-3 mx-auto max-w-xl text-sm leading-relaxed text-navy-500 font-semibold">
          Have questions about verification, listings, or escrow? Send us a message and our support team will reply in under 24 hours.
        </p>
      </div>

      {/* Grid: Contact Methods & Form */}
      <div className="grid gap-8 md:grid-cols-3">
        
        {/* Left Side: Contact Channels */}
        <div className="space-y-4 md:col-span-1">
          <div className="rounded-3xl border border-navy-100 bg-white p-5 shadow-sm">
            <MessageCircle className="size-6 text-primary" aria-hidden="true" />
            <h3 className="mt-3 text-sm font-extrabold text-navy-950">WhatsApp Chat</h3>
            <p className="mt-1 text-xs text-navy-500 font-semibold">Available Mon-Fri, 9am - 5pm.</p>
            <a
              href="https://wa.me/2348000000000"
              target="_blank"
              rel="noreferrer"
              className="mt-3 inline-block text-xs font-extrabold text-brandgreen-600 hover:underline"
            >
              <span className="inline-flex items-center gap-1">+234 (0) 800 000 0000 <ExternalLink className="size-3" aria-hidden="true" /></span>
            </a>
          </div>

          <div className="rounded-3xl border border-navy-100 bg-white p-5 shadow-sm">
            <Mail className="size-6 text-primary" aria-hidden="true" />
            <h3 className="mt-3 text-sm font-extrabold text-navy-950">Email Support</h3>
            <p className="mt-1 text-xs text-navy-500 font-semibold">Send complex questions or billing issues.</p>
            <a
              href="mailto:support@linkconn.rent"
              className="mt-3 inline-block text-xs font-extrabold text-brandgreen-600 hover:underline"
            >
              <span className="inline-flex items-center gap-1">support@linkconn.rent <ExternalLink className="size-3" aria-hidden="true" /></span>
            </a>
          </div>

          <div className="rounded-3xl border border-navy-100 bg-white p-5 shadow-sm">
            <MapPin className="size-6 text-primary" aria-hidden="true" />
            <h3 className="mt-3 text-sm font-extrabold text-navy-950">Office Address</h3>
            <p className="mt-1 text-xs text-navy-500 font-semibold">Visit our office for verification details.</p>
            <p className="mt-3 text-[11px] font-bold text-navy-700 leading-normal">
              12, Herbert Macaulay Way, Yaba, Lagos, Nigeria.
            </p>
          </div>
        </div>

        {/* Right Side: Form */}
        <div className="rounded-3xl border border-navy-100 bg-white p-6 shadow-sm md:col-span-2">
          <h3 className="text-lg font-extrabold text-navy-950">Send a Message</h3>
          <p className="mt-1 text-xs text-navy-500 font-semibold">
            Fill in the details below and we will get back to you shortly.
          </p>

          {success ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mt-6 rounded-2xl bg-brandgreen-50 border border-brandgreen-200 p-8 text-center"
            >
              <CheckCircle2 className="mx-auto size-7 text-success" aria-hidden="true" />
              <h4 className="mt-2 text-sm font-bold text-brandgreen-950">Message Sent!</h4>
              <p className="mt-1 text-[11px] text-brandgreen-700 leading-normal">
                Thank you for contacting us. A support representative will email you shortly.
              </p>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-navy-400">Full Name</label>
                  <Input
                    type="text"
                    name="name"
                    value={fields.name}
                    onChange={handleChange}
                    placeholder="Your Name"
                    className="mt-2 text-xs font-bold"
                    invalid={Boolean(errors.name)}
                  />
                  {errors.name && (
                    <p className="mt-1 text-[10px] font-bold text-red-500">{errors.name}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-navy-400">Email Address</label>
                  <Input
                    type="email"
                    name="email"
                    value={fields.email}
                    onChange={handleChange}
                    placeholder="you@example.com"
                    className="mt-2 text-xs font-bold"
                    invalid={Boolean(errors.email)}
                  />
                  {errors.email && (
                    <p className="mt-1 text-[10px] font-bold text-red-500">{errors.email}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-navy-400">Subject</label>
                <Input
                  type="text"
                  name="subject"
                  value={fields.subject}
                  onChange={handleChange}
                  placeholder="How can we help?"
                  className="mt-2 text-xs font-bold"
                  invalid={Boolean(errors.subject)}
                />
                {errors.subject && (
                  <p className="mt-1 text-[10px] font-bold text-red-500">{errors.subject}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-navy-400">Message Description</label>
                <Textarea
                  name="message"
                  value={fields.message}
                  onChange={handleChange}
                  rows={5}
                  placeholder="Enter details of your inquiry..."
                  className="mt-2 min-h-32 resize-none text-xs font-semibold"
                  invalid={Boolean(errors.message)}
                />
                {errors.message && (
                  <p className="mt-1 text-[10px] font-bold text-red-500">{errors.message}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-navy-950 py-3.5 text-xs font-extrabold text-white shadow-md transition-colors hover:bg-brandgreen-500 disabled:bg-navy-300 cursor-pointer"
              >
                {loading ? "Sending..." : "Submit Inquiry"}
              </button>
            </form>
          )}
        </div>

      </div>
    </div>
  );
}
