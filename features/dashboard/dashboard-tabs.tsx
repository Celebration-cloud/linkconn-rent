"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useAuth } from "@/providers/auth-provider";
import { ROLE_LABELS, VERIFICATION_LEVELS } from "@/domain/constants/permissions";
import { Input } from "@/features/auth/input";
import { Textarea } from "@/components/ui/form-controls";
import { Check } from "@/components/shared/icons";
import type { Role } from "@/domain/types/auth";
import {
  BadgeCheck,
  Building2,
  ChartNoAxesCombined,
  CheckCircle2,
  CircleAlert,
  CircleDollarSign,
  Clock3,
  FileText,
  Heart,
  House,
  Info,
  MapPin,
  MessageSquare,
  Monitor,
  Plus,
  Settings,
  TriangleAlert,
  Users,
  UserRound,
  WalletCards,
  Wrench,
} from "lucide-react";

/* ============ OVERVIEW ============ */
export function OverviewTab() {
  const { user, closeAuth, setActiveAccountTab } = useAuth();
  const router = useRouter();

  if (!user) return null;
  const isLandlord = user.role === "Landlord" || user.role === "Property Manager";
  const isAdmin = user.role === "Admin" || user.role === "Super Admin" || user.role === "Moderator";

  const stats = isLandlord
    ? [
        { label: "Properties", value: user.landlord?.propertyCount || 0, icon: House, tone: "bg-primary-soft text-primary" },
        { label: "Occupancy", value: "82%", icon: ChartNoAxesCombined, tone: "bg-primary-soft text-primary" },
        { label: "Income (YTD)", value: "₦18.4M", icon: WalletCards, tone: "bg-surface-subtle text-info" },
        { label: "Inquiries", value: 27, icon: MessageSquare, tone: "bg-info-soft text-info" },
      ]
    : isAdmin
    ? [
        { label: "Total Users", value: "12,480", icon: Users, tone: "bg-primary-soft text-primary" },
        { label: "Total Properties", value: "3,240", icon: Building2, tone: "bg-primary-soft text-primary" },
        { label: "Revenue", value: "₦45.2M", icon: WalletCards, tone: "bg-surface-subtle text-info" },
        { label: "Pending Verifications", value: 142, icon: Clock3, tone: "bg-warning-soft text-warning" },
      ]
    : [
        { label: "Saved Homes", value: 6, icon: Heart, tone: "bg-primary-soft text-primary" },
        { label: "Applications", value: 2, icon: FileText, tone: "bg-primary-soft text-primary" },
        { label: "Rent Paid", value: "₦4.5M", icon: WalletCards, tone: "bg-surface-subtle text-info" },
        { label: "Open Requests", value: 1, icon: Wrench, tone: "bg-warning-soft text-warning" },
      ];

  const activity = [
    { icon: MessageSquare, title: "New inquiry on Lekki Duplex", time: "2h ago", ok: true },
    { icon: CircleDollarSign, title: "Rent payment received — ₦4,500,000", time: "1d ago", ok: true },
    { icon: Wrench, title: "Maintenance request: Leaking kitchen tap", time: "2d ago", ok: false },
    { icon: BadgeCheck, title: "Listing verified — 3-Bed Duplex, Lekki", time: "4d ago", ok: true },
  ];

  const go = (tab: string) => setActiveAccountTab(tab);
  const browse = () => {
    closeAuth();
    router.push("/#discover");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-navy-950">Welcome back, {user.firstName}! 👋</h1>
        <p className="mt-1 text-sm text-navy-500">Here&apos;s what&apos;s happening with your {user.role.toLowerCase()} account.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="relative overflow-hidden rounded-2xl border border-navy-100 bg-white p-5 shadow-sm"
          >
            <div className={`grid size-10 place-items-center rounded-xl ${s.tone}`}><s.icon className="size-5" aria-hidden="true" /></div>
            <div className="mt-2 text-2xl font-extrabold text-navy-950">{s.value}</div>
            <div className="text-xs font-medium text-navy-500">{s.label}</div>
          </motion.div>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border border-navy-100 bg-white p-5 shadow-sm lg:col-span-2">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-navy-900">Recent activity</h3>
            <span className="text-[11px] text-navy-400">Last 7 days</span>
          </div>
          <div className="mt-4 space-y-3">
            {activity.map((a, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="flex items-center gap-3 rounded-xl bg-navy-50 p-3"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-primary shadow-sm"><a.icon className="size-4" aria-hidden="true" /></div>
                <div className="flex-1">
                  <div className="text-sm font-semibold text-navy-900">{a.title}</div>
                  <div className="text-[11px] text-navy-500">{a.time}</div>
                </div>
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${a.ok ? "bg-brandgreen-100 text-brandgreen-700" : "bg-amber-brand-100 text-amber-brand-700"}`}>
                  {a.ok ? "Done" : "Attention"}
                </span>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-navy-100 bg-gradient-to-br from-navy-900 to-navy-700 p-5 text-white shadow-sm">
          <h3 className="text-sm font-bold">Quick actions</h3>
          <p className="mt-1 text-xs text-navy-200">Jump right into what matters.</p>
          <div className="mt-4 space-y-2">
            {isLandlord || isAdmin ? (
              <>
                <button onClick={() => alert("Opening relevant flow...")} className="flex w-full items-center gap-2 rounded-xl bg-brandgreen-500 px-3 py-2.5 text-sm font-bold text-white hover:bg-brandgreen-600 cursor-pointer">
                  <Plus className="size-4" aria-hidden="true" /> {isLandlord ? "Add new property" : "Review verifications"}
                </button>
                <button onClick={() => go("applications")} className="flex w-full items-center gap-2 rounded-xl bg-white/10 px-3 py-2.5 text-sm font-bold text-white hover:bg-white/20 cursor-pointer">
                  <FileText className="size-4" aria-hidden="true" /> Applications
                </button>
                <button onClick={() => go("payments")} className="flex w-full items-center gap-2 rounded-xl bg-white/10 px-3 py-2.5 text-sm font-bold text-white hover:bg-white/20 cursor-pointer">
                  <WalletCards className="size-4" aria-hidden="true" /> Track payments
                </button>
                <button onClick={() => go("admin")} className="flex w-full items-center gap-2 rounded-xl bg-white/10 px-3 py-2.5 text-sm font-bold text-white hover:bg-white/20 cursor-pointer">
                  <Settings className="size-4" aria-hidden="true" /> Admin tools
                </button>
              </>
            ) : (
              <>
                <button onClick={browse} className="flex w-full items-center gap-2 rounded-xl bg-brandgreen-500 px-3 py-2.5 text-sm font-bold text-white hover:bg-brandgreen-600 cursor-pointer">
                  <House className="size-4" aria-hidden="true" /> Browse homes
                </button>
                <button onClick={() => go("saved")} className="flex w-full items-center gap-2 rounded-xl bg-white/10 px-3 py-2.5 text-sm font-bold text-white hover:bg-white/20 cursor-pointer">
                  <Heart className="size-4" aria-hidden="true" /> Saved homes
                </button>
                <button onClick={() => go("applications")} className="flex w-full items-center gap-2 rounded-xl bg-white/10 px-3 py-2.5 text-sm font-bold text-white hover:bg-white/20 cursor-pointer">
                  <FileText className="size-4" aria-hidden="true" /> Applications
                </button>
                <button onClick={() => go("payments")} className="flex w-full items-center gap-2 rounded-xl bg-white/10 px-3 py-2.5 text-sm font-bold text-white hover:bg-white/20 cursor-pointer">
                  <WalletCards className="size-4" aria-hidden="true" /> Pay rent
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ============ PROFILE ============ */
export function ProfileTab() {
  const { user, updateProfile } = useAuth();
  const [firstName, setFirstName] = useState(user?.firstName || "");
  const [lastName, setLastName] = useState(user?.lastName || "");
  const [email, setEmail] = useState(user?.email || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [location, setLocation] = useState(user?.location || "");
  const [bio, setBio] = useState(user?.bio || "");
  const [occupation, setOccupation] = useState(user?.tenant?.occupation || "");
  const [income, setIncome] = useState(user?.tenant?.incomeRange || "");
  const [business, setBusiness] = useState(user?.landlord?.businessName || "");
  const [saved, setSaved] = useState(false);

  const save = () => {
    updateProfile({
      firstName, lastName, email, phone, location, bio,
      tenant: user?.tenant ? { ...user.tenant, occupation, incomeRange: income } : undefined,
      landlord: user?.landlord ? { ...user.landlord, businessName: business } : undefined,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  if (!user) return null;
  const initials = (firstName[0] || "") + (lastName[0] || "");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-navy-950">My Profile</h1>
          <p className="mt-1 text-sm text-navy-500">Keep your information up to date.</p>
        </div>
        <div className="flex items-center gap-2">
          {saved && (
            <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-1 rounded-full bg-brandgreen-100 px-3 py-1 text-xs font-bold text-brandgreen-700">
              <Check className="h-3.5 w-3.5" /> Saved
            </motion.span>
          )}
          <button onClick={save} className="rounded-xl bg-navy-900 px-5 py-2.5 text-sm font-bold text-white hover:bg-brandgreen-600 cursor-pointer">Save changes</button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-2xl border border-navy-100 bg-white p-6 text-center shadow-sm lg:col-span-1">
          <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-forest-800 text-2xl font-bold text-white">
            {initials.toUpperCase()}
          </div>
          <div className="mt-4 text-lg font-bold text-navy-900">{firstName} {lastName}</div>
          <div className="text-xs text-navy-500">{email}</div>
          <div className="mt-3 flex flex-wrap justify-center gap-1.5">
            <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold ${ROLE_LABELS[user.role].color}`}><UserRound className="size-3" aria-hidden="true" /> {user.role}</span>
            <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${VERIFICATION_LEVELS[user.verificationLevel].color}`}>{VERIFICATION_LEVELS[user.verificationLevel].label}</span>
          </div>
          <button className="mt-4 w-full rounded-xl border border-navy-200 bg-white py-2 text-xs font-bold text-navy-700 hover:bg-navy-50 cursor-pointer">Upload photo</button>
        </div>

        <div className="space-y-4 rounded-2xl border border-navy-100 bg-white p-6 shadow-sm lg:col-span-2">
          <h3 className="text-sm font-bold text-navy-900">Personal information</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="First name" value={firstName} onChange={setFirstName} required />
            <Input label="Last name" value={lastName} onChange={setLastName} required />
            <Input label="Email" type="email" value={email} onChange={setEmail} required />
            <Input label="Phone" value={phone} onChange={(v) => setPhone(v.replace(/[^\d+\s-]/g, ""))} />
            <Input label="Location" value={location} onChange={setLocation} placeholder="e.g. Lekki, Lagos" />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-navy-400">Bio</label>
            <Textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={3}
              placeholder="Tell other users a bit about yourself..."
              className="min-h-24"
            />
          </div>

          {user.role === "Tenant" && (
            <>
              <h3 className="pt-3 text-sm font-bold text-navy-900">Tenant details</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <Input label="Occupation" value={occupation} onChange={setOccupation} placeholder="e.g. Software Engineer" />
                <Input label="Monthly income" value={income} onChange={setIncome} placeholder="e.g. ₦400,000" />
              </div>
            </>
          )}

          {(user.role === "Landlord" || user.role === "Property Manager") && (
            <>
              <h3 className="pt-3 text-sm font-bold text-navy-900">Landlord details</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <Input label="Business name (optional)" value={business} onChange={setBusiness} placeholder="e.g. Prestige Properties" />
                <Input label="Property count" value={String(user.landlord?.propertyCount || 0)} onChange={() => {}} />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

/* ============ VERIFICATION ============ */
export function VerificationTab() {
  const { user, updateProfile } = useAuth();
  const [submitting, setSubmitting] = useState<string | null>(null);

  const submit = (step: string, level: any) => {
    setSubmitting(step);
    setTimeout(() => {
      if (user) updateProfile({ verificationLevel: level, phoneVerified: level !== "Partially Verified" });
      setSubmitting(null);
    }, 1500);
  };

  const steps = [
    { id: "email", title: "Email verification", desc: "Confirm your email address", done: user?.emailVerified, next: "Partially Verified" },
    { id: "phone", title: "Phone verification", desc: "Verify your phone number via SMS", done: user?.phoneVerified, next: "Fully Verified" },
    { id: "id", title: "Government ID", desc: "Upload a valid ID (NIN, PVC, Driver's License, Passport)", done: user?.verificationLevel === "Fully Verified" || user?.verificationLevel === "Trusted", next: "Fully Verified" },
    { id: "ownership", title: "Property ownership", desc: "Upload title documents for your listings", done: user?.verificationLevel === "Trusted", next: "Trusted", landlordOnly: true },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-navy-950">Verification</h1>
        <p className="mt-1 text-sm text-navy-500">Complete all steps to earn the Trusted badge.</p>
      </div>

      <div className="rounded-2xl border border-navy-100 bg-gradient-to-br from-brandgreen-50 to-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs font-bold uppercase tracking-widest text-brandgreen-600">Current level</div>
            <div className="mt-1 text-2xl font-extrabold text-navy-950">{user?.verificationLevel}</div>
          </div>
          <span className={`rounded-full px-4 py-2 text-sm font-bold ${VERIFICATION_LEVELS[user?.verificationLevel || "Unverified"].color}`}>
            {VERIFICATION_LEVELS[user?.verificationLevel || "Unverified"].description}
          </span>
        </div>
        <div className="mt-4 h-2 overflow-hidden rounded-full bg-white">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${(steps.filter((s) => s.done).length / (steps.filter(s => !s.landlordOnly || user?.role === "Landlord" || user?.role === "Property Manager").length)) * 100}%` }}
            transition={{ duration: 0.8 }}
            className="h-full bg-primary"
          />
        </div>
        <div className="mt-2 text-xs text-navy-500">
          {steps.filter((s) => s.done).length} of {steps.filter(s => !s.landlordOnly || user?.role === "Landlord" || user?.role === "Property Manager").length} steps complete
        </div>
      </div>

      <div className="space-y-3">
        {steps.map((s, i) => {
          if (s.landlordOnly && user?.role !== "Landlord" && user?.role !== "Property Manager") return null;
          return (
            <motion.div
              key={s.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="flex items-center gap-4 rounded-2xl border border-navy-100 bg-white p-5 shadow-sm"
            >
              <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-lg font-bold ${s.done ? "bg-brandgreen-500 text-white" : "bg-navy-100 text-navy-500"}`}>
                {s.done ? <Check className="h-6 w-6" /> : i + 1}
              </div>
              <div className="flex-1">
                <div className="text-sm font-bold text-navy-900">{s.title}</div>
                <div className="text-xs text-navy-500">{s.desc}</div>
              </div>
              {s.done ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-success-soft px-3 py-1 text-xs font-bold text-success"><CheckCircle2 className="size-3" aria-hidden="true" /> Completed</span>
              ) : (
                <button
                  onClick={() => submit(s.id, s.next as any)}
                  disabled={submitting === s.id}
                  className="rounded-xl bg-navy-900 px-4 py-2 text-xs font-bold text-white hover:bg-brandgreen-600 disabled:opacity-60 cursor-pointer"
                >
                  {submitting === s.id ? "Processing…" : "Start"}
                </button>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

/* ============ SAVED ============ */
export function SavedTab() {
  const saved = [
    { id: 1, title: "Modern 3-Bedroom Duplex", location: "Lekki Phase 1, Lagos", price: "₦4,500,000/yr", img: "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=600&q=80" },
    { id: 2, title: "Bright 2-Bedroom Apartment", location: "Wuse 2, Abuja", price: "₦2,800,000/yr", img: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=600&q=80" },
    { id: 3, title: "Family Terraced House", location: "Gwarinpa, Abuja", price: "₦3,200,000/yr", img: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=600&q=80" },
    { id: 4, title: "Cozy Studio Apartment", location: "Yaba, Lagos", price: "₦950,000/yr", img: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=600&q=80" },
  ];
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-navy-950">Saved Homes</h1>
          <p className="mt-1 text-sm text-navy-500">{saved.length} properties in your shortlist.</p>
        </div>
        <button className="rounded-xl border border-navy-200 bg-white px-4 py-2 text-xs font-bold text-navy-700 hover:bg-navy-50 cursor-pointer">Compare selected</button>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {saved.map((p, i) => (
          <motion.div
            key={p.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="group overflow-hidden rounded-2xl border border-navy-100 bg-white shadow-sm transition-shadow hover:shadow-lg"
          >
            <div className="relative h-40 overflow-hidden bg-sand-200">
              <Image
                src={p.img}
                alt={p.title}
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute bottom-3 left-3 rounded-lg bg-navy-950/80 px-3 py-1 text-xs font-bold text-white">{p.price}</div>
              <button className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-error text-white shadow-md cursor-pointer" aria-label="Remove saved property">
                <Heart className="size-4" fill="currentColor" aria-hidden="true" />
              </button>
            </div>
            <div className="p-4">
              <div className="text-sm font-bold text-navy-900">{p.title}</div>
              <div className="inline-flex items-center gap-1 text-xs text-navy-500"><MapPin className="size-3" aria-hidden="true" /> {p.location}</div>
              <div className="mt-3 flex gap-2">
                <button className="flex-1 rounded-xl bg-brandgreen-500 py-2 text-xs font-bold text-white hover:bg-brandgreen-600 cursor-pointer">Contact</button>
                <button className="flex-1 rounded-xl border border-navy-200 bg-white py-2 text-xs font-bold text-navy-700 hover:bg-navy-50 cursor-pointer">View</button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

/* ============ APPLICATIONS ============ */
export function ApplicationsTab() {
  const apps = [
    { id: 1, property: "Modern 3-Bedroom Duplex", landlord: "Adeyemi Estates", status: "Approved", date: "Jan 12, 2026", amount: "₦4,500,000" },
    { id: 2, property: "Bright 2-Bedroom Apartment", landlord: "Capital Homes Ltd", status: "Pending", date: "Feb 03, 2026", amount: "₦2,800,000" },
    { id: 3, property: "Cozy Studio Apartment", landlord: "UrbanNest", status: "Rejected", date: "Dec 15, 2025", amount: "₦950,000" },
  ];
  const statusStyle: Record<string, string> = {
    Approved: "bg-brandgreen-100 text-brandgreen-700",
    Pending: "bg-amber-brand-100 text-amber-brand-700",
    Rejected: "bg-red-100 text-red-600",
  };
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-navy-950">Applications</h1>
        <p className="mt-1 text-sm text-navy-500">Track your rental applications.</p>
      </div>
      <div className="overflow-hidden rounded-2xl border border-navy-100 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-navy-50 text-xs font-bold uppercase tracking-wide text-navy-500">
            <tr>
              <th className="px-5 py-3">Property</th>
              <th className="px-5 py-3 hidden md:table-cell">Landlord</th>
              <th className="px-5 py-3 hidden md:table-cell">Date</th>
              <th className="px-5 py-3">Amount</th>
              <th className="px-5 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {apps.map((a) => (
              <tr key={a.id} className="border-t border-navy-100 hover:bg-navy-50/50">
                <td className="px-5 py-4 font-semibold text-navy-900">{a.property}</td>
                <td className="px-5 py-4 text-navy-600 hidden md:table-cell">{a.landlord}</td>
                <td className="px-5 py-4 text-navy-500 hidden md:table-cell">{a.date}</td>
                <td className="px-5 py-4 font-bold text-navy-900">{a.amount}</td>
                <td className="px-5 py-4">
                  <span className={`rounded-full px-3 py-1 text-xs font-bold ${statusStyle[a.status]}`}>{a.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ============ PAYMENTS ============ */
export function PaymentsTab() {
  const rows = [
    { id: 1, ref: "LC-2601-001", date: "Jan 12, 2026", amount: "₦4,500,000", method: "Paystack", status: "Paid" },
    { id: 2, ref: "LC-2602-002", date: "Feb 02, 2026", amount: "₦2,800,000", method: "Flutterwave", status: "Due" },
    { id: 3, ref: "LC-2512-015", date: "Dec 28, 2025", amount: "₦3,200,000", method: "Bank Transfer", status: "Overdue" },
    { id: 4, ref: "LC-2603-004", date: "Mar 15, 2026", amount: "₦950,000", method: "Paystack", status: "Paid" },
  ];
  const statusStyle: Record<string, string> = {
    Paid: "bg-brandgreen-100 text-brandgreen-700",
    Due: "bg-amber-brand-100 text-amber-brand-700",
    Overdue: "bg-red-100 text-red-600",
  };
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-navy-950">Payments</h1>
          <p className="mt-1 text-sm text-navy-500">Track rent, receipts and transactions.</p>
        </div>
        <button className="rounded-xl bg-brandgreen-500 px-5 py-2.5 text-sm font-bold text-white hover:bg-brandgreen-600 cursor-pointer">+ Pay rent</button>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { label: "Total paid", value: "₦8,250,000", color: "from-primary to-primary-hover" },
          { label: "Upcoming", value: "₦2,800,000", color: "from-warning to-amber-brand-600" },
          { label: "Overdue", value: "₦3,200,000", color: "from-error to-red-700" },
        ].map((s) => (
          <div key={s.label} className="relative overflow-hidden rounded-2xl border border-navy-100 bg-white p-5 shadow-sm">
            <div className={`absolute -right-8 -top-8 h-24 w-24 rounded-full bg-gradient-to-br ${s.color} opacity-20`} />
            <div className="text-xs font-medium text-navy-500">{s.label}</div>
            <div className="mt-1 text-2xl font-extrabold text-navy-950">{s.value}</div>
          </div>
        ))}
      </div>

      <div className="overflow-hidden rounded-2xl border border-navy-100 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-navy-50 text-xs font-bold uppercase tracking-wide text-navy-500">
            <tr>
              <th className="px-5 py-3">Reference</th>
              <th className="px-5 py-3 hidden md:table-cell">Date</th>
              <th className="px-5 py-3 hidden md:table-cell">Method</th>
              <th className="px-5 py-3">Amount</th>
              <th className="px-5 py-3">Status</th>
              <th className="px-5 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-t border-navy-100 hover:bg-navy-50/50">
                <td className="px-5 py-4 font-mono text-xs text-navy-700">{r.ref}</td>
                <td className="px-5 py-4 text-navy-600 hidden md:table-cell">{r.date}</td>
                <td className="px-5 py-4 text-navy-600 hidden md:table-cell">{r.method}</td>
                <td className="px-5 py-4 font-bold text-navy-900">{r.amount}</td>
                <td className="px-5 py-4">
                  <span className={`rounded-full px-3 py-1 text-xs font-bold ${statusStyle[r.status]}`}>{r.status}</span>
                </td>
                <td className="px-5 py-4 text-right">
                  <button className="text-xs font-bold text-brandgreen-600 hover:underline cursor-pointer">Receipt</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ============ MAINTENANCE ============ */
export function MaintenanceTab() {
  const [showNew, setShowNew] = useState(false);
  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState("Medium");
  const [requests, setRequests] = useState([
    { id: 1, title: "Leaking kitchen tap", property: "Lekki Duplex", status: "In Progress", priority: "Medium", date: "2 days ago" },
    { id: 2, title: "Faulty AC unit", property: "Wuse Apartment", status: "Pending", priority: "High", date: "5 hours ago" },
    { id: 3, title: "Repaint bedroom", property: "Gwarinpa House", status: "Completed", priority: "Low", date: "1 week ago" },
    { id: 4, title: "Generator servicing", property: "Lekki Duplex", status: "Closed", priority: "Medium", date: "2 weeks ago" },
  ]);
  const statusStyle: Record<string, string> = {
    Pending: "bg-amber-brand-100 text-amber-brand-700",
    "In Progress": "bg-info-soft text-info",
    Completed: "bg-brandgreen-100 text-brandgreen-700",
    Closed: "bg-navy-100 text-navy-500",
  };

  const submit = () => {
    if (!title) return;
    setRequests([{ id: Date.now(), title, property: "Lekki Duplex", status: "Pending", priority, date: "Just now" }, ...requests]);
    setTitle("");
    setShowNew(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-navy-950">Maintenance</h1>
          <p className="mt-1 text-sm text-navy-500">Report issues and track repairs.</p>
        </div>
        <button onClick={() => setShowNew(!showNew)} className="rounded-xl bg-brandgreen-500 px-5 py-2.5 text-sm font-bold text-white hover:bg-brandgreen-600 cursor-pointer">
          {showNew ? "Cancel" : "+ New request"}
        </button>
      </div>

      <AnimatePresence>
        {showNew && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden rounded-2xl border border-navy-100 bg-white p-5 shadow-sm"
          >
            <h3 className="text-sm font-bold text-navy-900">Submit a new request</h3>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <Input label="Issue title" value={title} onChange={setTitle} placeholder="e.g. Leaking bathroom tap" />
              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-navy-400">Priority</label>
                <div className="flex gap-2">
                  {["Low", "Medium", "High"].map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setPriority(p)}
                      className={`flex-1 rounded-xl py-2.5 text-xs font-bold transition-colors cursor-pointer ${
                        priority === p ? "bg-navy-900 text-white" : "bg-white border border-navy-200 text-navy-700"
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <button onClick={submit} className="mt-4 rounded-xl bg-brandgreen-500 px-5 py-2.5 text-sm font-bold text-white hover:bg-brandgreen-600 cursor-pointer">Submit request</button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-3">
        {requests.map((r, i) => (
          <motion.div
            key={r.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.03 }}
            className="flex items-center gap-4 rounded-2xl border border-navy-100 bg-white p-5 shadow-sm"
          >
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-warning-soft text-warning"><Wrench className="size-5" aria-hidden="true" /></div>
            <div className="flex-1">
              <div className="text-sm font-bold text-navy-900">{r.title}</div>
              <div className="text-xs text-navy-500">
                {r.property} · {r.date} · {r.priority} priority
              </div>
            </div>
            <span className={`rounded-full px-3 py-1 text-xs font-bold ${statusStyle[r.status]}`}>{r.status}</span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

/* ============ NOTIFICATIONS ============ */
export function NotificationsTab() {
  const { notifications, markNotificationRead, markAllNotificationsRead } = useAuth();
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-navy-950">Notifications</h1>
          <p className="mt-1 text-sm text-navy-500">
            {notifications.filter((n) => !n.read).length} unread · {notifications.length} total
          </p>
        </div>
        <button onClick={markAllNotificationsRead} className="rounded-xl border border-navy-200 bg-white px-4 py-2 text-xs font-bold text-navy-700 hover:bg-navy-50 cursor-pointer">Mark all read</button>
      </div>
      <div className="space-y-2">
        {notifications.map((n, i) => (
          <motion.div
            key={n.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.03 }}
            onClick={() => markNotificationRead(n.id)}
            className={`flex cursor-pointer items-start gap-3 rounded-2xl border p-4 transition-colors hover:shadow-sm ${
              !n.read ? "border-brandgreen-200 bg-brandgreen-50/40" : "border-navy-100 bg-white"
            }`}
          >
            <div
              className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm ${
                n.type === "success" ? "bg-success-soft text-success" :
                n.type === "warning" ? "bg-warning-soft text-warning" :
                n.type === "payment" ? "bg-primary-soft text-primary" :
                n.type === "maintenance" ? "bg-surface-subtle text-info" :
                "bg-info-soft text-info"
              }`}
            >
              {n.type === "success" ? <CheckCircle2 className="size-4" aria-hidden="true" /> : n.type === "warning" ? <CircleAlert className="size-4" aria-hidden="true" /> : n.type === "payment" ? <CircleDollarSign className="size-4" aria-hidden="true" /> : n.type === "maintenance" ? <Wrench className="size-4" aria-hidden="true" /> : <Info className="size-4" aria-hidden="true" />}
            </div>
            <div className="flex-1">
              <div className="text-sm font-bold text-navy-900">{n.title}</div>
              <div className="text-xs text-navy-600">{n.body}</div>
              <div className="mt-1 text-[10px] text-navy-400">{n.time}</div>
            </div>
            {!n.read && <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-brandgreen-500" />}
          </motion.div>
        ))}
      </div>
    </div>
  );
}

/* ============ SECURITY ============ */
export function SecurityTab() {
  const { user, toggle2fa } = useAuth();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [current, setCurrent] = useState("");
  const [changed, setChanged] = useState(false);

  const change = () => {
    if (!current || password.length < 8 || password !== confirm) return;
    setChanged(true);
    setTimeout(() => {
      setChanged(false);
      setPassword("");
      setConfirm("");
      setCurrent("");
    }, 2000);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-navy-950">Security</h1>
        <p className="mt-1 text-sm text-navy-500">Keep your account safe and secure.</p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-navy-100 bg-white p-6 shadow-sm">
          <h3 className="text-sm font-bold text-navy-900">Change password</h3>
          <p className="mt-1 text-xs text-navy-500">Last changed 3 months ago.</p>
          <div className="mt-4 space-y-3">
            <Input label="Current password" type="password" value={current} onChange={setCurrent} showPasswordToggle required />
            <Input label="New password" type="password" value={password} onChange={setPassword} showPasswordToggle required />
            <Input label="Confirm new password" type="password" value={confirm} onChange={setConfirm} showPasswordToggle required />
          </div>
          <button onClick={change} className="mt-4 w-full rounded-xl bg-navy-900 py-3 text-sm font-bold text-white hover:bg-brandgreen-600 cursor-pointer">
            {changed ? <span className="inline-flex items-center gap-1"><CheckCircle2 className="size-4" aria-hidden="true" /> Password updated</span> : "Update password"}
          </button>
        </div>

        <div className="space-y-4">
          <div className="rounded-2xl border border-navy-100 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-navy-900">Two-Factor Authentication</h3>
                <p className="mt-1 text-xs text-navy-500">Extra layer of security at every login.</p>
              </div>
              <button
                onClick={() => toggle2fa(!user?.twoFactorEnabled)}
                className={`relative h-7 w-12 rounded-full transition-colors cursor-pointer ${user?.twoFactorEnabled ? "bg-brandgreen-500" : "bg-navy-200"}`}
              >
                <motion.span layout className={`absolute top-0.5 h-6 w-6 rounded-full bg-white shadow ${user?.twoFactorEnabled ? "left-[22px]" : "left-0.5"}`} />
              </button>
            </div>
          </div>

          <div className="rounded-2xl border border-navy-100 bg-white p-6 shadow-sm">
            <h3 className="text-sm font-bold text-navy-900">Active sessions</h3>
            <p className="mt-1 text-xs text-navy-500">Devices logged into your account.</p>
            <div className="mt-4 space-y-2">
              {[
                { device: "MacBook Pro · Chrome", location: "Lagos, Nigeria", current: true },
                { device: "iPhone 15 · Safari", location: "Lagos, Nigeria", current: false },
              ].map((d) => (
                <div key={d.device} className="flex items-center justify-between rounded-xl bg-navy-50 p-3">
                  <div>
                    <div className="text-xs font-bold text-navy-900">{d.device}</div>
                    <div className="text-[10px] text-navy-500">{d.location}</div>
                  </div>
                  {d.current ? (
                    <span className="rounded-full bg-brandgreen-100 px-2 py-0.5 text-[10px] font-bold text-brandgreen-700">Current</span>
                  ) : (
                    <button className="text-[10px] font-bold text-red-600 hover:underline cursor-pointer">Sign out</button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
            <h3 className="text-sm font-bold text-red-700">Danger zone</h3>
            <p className="mt-1 text-xs text-red-600">Permanently delete your account and all data.</p>
            <button className="mt-3 rounded-xl border border-red-300 bg-white px-4 py-2 text-xs font-bold text-red-600 hover:bg-red-100 cursor-pointer">Delete account</button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ============ DEVICES ============ */
export function DevicesTab() {
  const { devices } = useAuth();
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-navy-950">Active Devices</h1>
        <p className="mt-1 text-sm text-navy-500">Devices currently signed in to your account.</p>
      </div>
      <div className="space-y-3">
        {devices.map((d, i) => (
          <motion.div
            key={d.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="flex items-center gap-4 rounded-2xl border border-navy-100 bg-white p-5 shadow-sm"
          >
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-info-soft text-info"><Monitor className="size-5" aria-hidden="true" /></div>
            <div className="flex-1">
              <div className="text-sm font-bold text-navy-900">{d.device}</div>
              <div className="text-xs text-navy-500">
                {d.location} · IP: {d.ip}
              </div>
              <div className="text-[10px] text-navy-400">Last active: {d.lastActive}</div>
            </div>
            {d.current ? (
              <span className="rounded-full bg-brandgreen-100 px-3 py-1 text-xs font-bold text-brandgreen-700">Current</span>
            ) : (
              <button className="rounded-xl border border-red-200 bg-white px-3 py-1.5 text-xs font-bold text-red-600 hover:bg-red-50 cursor-pointer">Sign out</button>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}

/* ============ ADMIN ============ */
export function AdminTab() {
  const { user } = useAuth();
  const isSuper = user?.role === "Super Admin";

  const stats = [
    { label: "Total Users", value: "12,480", trend: "+8.2%", icon: Users, tone: "bg-primary-soft text-primary" },
    { label: "Total Properties", value: "3,240", trend: "+4.1%", icon: Building2, tone: "bg-primary-soft text-primary" },
    { label: "Revenue", value: "₦45.2M", trend: "+12.4%", icon: WalletCards, tone: "bg-surface-subtle text-info" },
    { label: "Pending Verifications", value: "142", trend: "-3.1%", icon: Clock3, tone: "bg-warning-soft text-warning" },
    { label: "Open Reports", value: "28", trend: "+1.4%", icon: TriangleAlert, tone: "bg-error-soft text-error" },
    { label: "Active Sessions", value: "4,128", trend: "+5.7%", icon: Monitor, tone: "bg-info-soft text-info" },
  ];

  const verifQueue = [
    { id: 1, user: "Chidi Okafor", type: "Identity", submitted: "2h ago", status: "Pending" },
    { id: 2, user: "Amaka Eze", type: "Property Ownership", submitted: "5h ago", status: "Pending" },
    { id: 3, user: "Tunde Bello", type: "Identity", submitted: "1d ago", status: "Pending" },
    { id: 4, user: "Ngozi Ali", type: "Property Ownership", submitted: "2d ago", status: "In Review" },
  ];

  const reports = [
    { id: 1, type: "Fake listing", target: "3-Bed Duplex, Lekki", reporter: "Chidi Okafor", status: "Open" },
    { id: 2, type: "Scam attempt", target: "Landlord: Capital Homes", reporter: "Amaka Eze", status: "Open" },
    { id: 3, type: "Inaccurate photos", target: "Studio, Yaba", reporter: "Tunde Bello", status: "Resolved" },
  ];

  const usersList = [
    { id: 1, name: "Chidi Okafor", email: "chidi@example.com", role: "Tenant", status: "Active" },
    { id: 2, name: "Amaka Eze", email: "amaka@example.com", role: "Landlord", status: "Active" },
    { id: 3, name: "Tunde Bello", email: "tunde@example.com", role: "Tenant", status: "Suspended" },
    { id: 4, name: "Ngozi Ali", email: "ngozi@example.com", role: "Landlord", status: "Active" },
  ];

  const statusStyle: Record<string, string> = {
    Pending: "bg-amber-brand-100 text-amber-brand-700",
    "In Review": "bg-info-soft text-info",
    Approved: "bg-brandgreen-100 text-brandgreen-700",
    Rejected: "bg-red-100 text-red-600",
    Open: "bg-amber-brand-100 text-amber-brand-700",
    Resolved: "bg-brandgreen-100 text-brandgreen-700",
    Active: "bg-brandgreen-100 text-brandgreen-700",
    Suspended: "bg-red-100 text-red-600",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-navy-950">Admin Dashboard {isSuper ? "· Super Admin" : ""}</h1>
          <p className="mt-1 text-sm text-navy-500">Full platform control and moderation tools.</p>
        </div>
        {isSuper && (
          <div className="flex gap-2">
            <button className="rounded-xl border border-navy-200 bg-white px-4 py-2 text-xs font-bold text-navy-700 hover:bg-navy-50 cursor-pointer">System settings</button>
            <button className="rounded-xl bg-navy-900 px-4 py-2 text-xs font-bold text-white hover:bg-brandgreen-600 cursor-pointer">Audit logs</button>
          </div>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="relative overflow-hidden rounded-2xl border border-navy-100 bg-white p-5 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div className={`grid size-10 place-items-center rounded-xl ${s.tone}`}><s.icon className="size-5" aria-hidden="true" /></div>
              <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${s.trend.startsWith("+") ? "bg-brandgreen-100 text-brandgreen-700" : "bg-red-100 text-red-600"}`}>{s.trend}</span>
            </div>
            <div className="mt-2 text-2xl font-extrabold text-navy-950">{s.value}</div>
            <div className="text-xs font-medium text-navy-500">{s.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Verification queue */}
      <div className="rounded-2xl border border-navy-100 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-navy-900">Verification Queue</h3>
          <span className="text-xs text-navy-500">{verifQueue.length} items</span>
        </div>
        <div className="mt-4 space-y-2">
          {verifQueue.map((v) => (
            <div key={v.id} className="flex items-center gap-3 rounded-xl bg-navy-50 p-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-sm font-bold text-navy-700 shadow-sm">{v.user[0]}</div>
              <div className="flex-1">
                <div className="text-sm font-bold text-navy-900">{v.user}</div>
                <div className="text-[11px] text-navy-500">
                  {v.type} · {v.submitted}
                </div>
              </div>
              <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${statusStyle[v.status]}`}>{v.status}</span>
              <div className="flex gap-1">
                <button className="rounded-lg bg-brandgreen-500 px-2.5 py-1 text-[10px] font-bold text-white hover:bg-brandgreen-600 cursor-pointer">Approve</button>
                <button className="rounded-lg bg-red-500 px-2.5 py-1 text-[10px] font-bold text-white hover:bg-red-600 cursor-pointer">Reject</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Reports */}
      <div className="rounded-2xl border border-navy-100 bg-white p-6 shadow-sm">
        <h3 className="text-sm font-bold text-navy-900">Reports & Complaints</h3>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-navy-50 text-xs font-bold uppercase tracking-wide text-navy-500">
              <tr>
                <th className="px-4 py-2">Type</th>
                <th className="px-4 py-2">Target</th>
                <th className="px-4 py-2 hidden md:table-cell">Reporter</th>
                <th className="px-4 py-2">Status</th>
                <th className="px-4 py-2"></th>
              </tr>
            </thead>
            <tbody>
              {reports.map((r) => (
                <tr key={r.id} className="border-t border-navy-100">
                  <td className="px-4 py-3 font-semibold text-navy-900">{r.type}</td>
                  <td className="px-4 py-3 text-navy-600">{r.target}</td>
                  <td className="px-4 py-3 text-navy-600 hidden md:table-cell">{r.reporter}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${statusStyle[r.status]}`}>{r.status}</span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button className="text-xs font-bold text-brandgreen-600 hover:underline cursor-pointer">Review</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* User management */}
      <div className="rounded-2xl border border-navy-100 bg-white p-6 shadow-sm">
        <h3 className="text-sm font-bold text-navy-900">User Management</h3>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-navy-50 text-xs font-bold uppercase tracking-wide text-navy-500">
              <tr>
                <th className="px-4 py-2">User</th>
                <th className="px-4 py-2 hidden md:table-cell">Email</th>
                <th className="px-4 py-2">Role</th>
                <th className="px-4 py-2">Status</th>
                <th className="px-4 py-2"></th>
              </tr>
            </thead>
            <tbody>
              {usersList.map((u) => (
                <tr key={u.id} className="border-t border-navy-100">
                  <td className="px-4 py-3 font-semibold text-navy-900">{u.name}</td>
                  <td className="px-4 py-3 text-navy-600 hidden md:table-cell">{u.email}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${ROLE_LABELS[u.role as Role]?.color || "bg-navy-100 text-navy-700"}`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${statusStyle[u.status]}`}>{u.status}</span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-1">
                      <button className="rounded-lg bg-navy-900 px-2.5 py-1 text-[10px] font-bold text-white hover:bg-brandgreen-600 cursor-pointer">Edit</button>
                      <button className="rounded-lg bg-red-500 px-2.5 py-1 text-[10px] font-bold text-white hover:bg-red-600 cursor-pointer">Suspend</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Platform content */}
      {isSuper && (
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-navy-100 bg-white p-6 shadow-sm">
            <h3 className="text-sm font-bold text-navy-900">Content Management</h3>
            <p className="mt-1 text-xs text-navy-500">FAQs, Terms, Help Center, announcements.</p>
            <div className="mt-4 grid grid-cols-2 gap-2">
              {["FAQs", "Terms of Service", "Privacy Policy", "Help Center", "Announcements", "Blog"].map((c) => (
                <button key={c} className="rounded-xl border border-navy-200 bg-white px-3 py-2 text-xs font-bold text-navy-700 hover:bg-navy-50 cursor-pointer">
                  {c}
                </button>
              ))}
            </div>
          </div>
          <div className="rounded-2xl border border-navy-100 bg-white p-6 shadow-sm">
            <h3 className="text-sm font-bold text-navy-900">Monetization</h3>
            <p className="mt-1 text-xs text-navy-500">Subscriptions, verification fees, ad revenue.</p>
            <div className="mt-4 space-y-2">
              {[
                { label: "Premium subscribers", value: "1,248", amount: "₦112.3M" },
                { label: "Verification fees", value: "3,240", amount: "₦16.2M" },
                { label: "Sponsored listings", value: "142", amount: "₦28.4M" },
              ].map((m) => (
                <div key={m.label} className="flex items-center justify-between rounded-xl bg-navy-50 p-3">
                  <div>
                    <div className="text-xs font-bold text-navy-900">{m.label}</div>
                    <div className="text-[10px] text-navy-500">{m.value} items</div>
                  </div>
                  <div className="text-sm font-extrabold text-brandgreen-600">{m.amount}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
