import type { Role, Permission, VerificationLevel } from "../types/auth";

export const ROLE_LABELS: Record<Role, { label: string; icon: string; color: string }> = {
  Guest: { label: "Guest", icon: "👤", color: "bg-navy-100 text-navy-700" },
  Tenant: { label: "Tenant", icon: "🔑", color: "bg-brandgreen-100 text-brandgreen-700" },
  Landlord: { label: "Landlord", icon: "🏠", color: "bg-amber-brand-100 text-amber-brand-700" },
  "Property Manager": { label: "Property Manager", icon: "📋", color: "bg-sky-100 text-sky-700" },
  Moderator: { label: "Moderator", icon: "🛡️", color: "bg-purple-100 text-purple-700" },
  Admin: { label: "Admin", icon: "⚙️", color: "bg-navy-800 text-white" },
  "Super Admin": { label: "Super Admin", icon: "👑", color: "bg-gradient-to-r from-amber-brand-500 to-red-500 text-white" },
};

export const VERIFICATION_LEVELS: Record<VerificationLevel, { label: string; color: string; description: string }> = {
  Unverified: { label: "Unverified", color: "bg-navy-100 text-navy-600", description: "Basic account created" },
  "Partially Verified": { label: "Partially Verified", color: "bg-amber-brand-100 text-amber-brand-700", description: "Email verified" },
  "Fully Verified": { label: "Fully Verified", color: "bg-brandgreen-100 text-brandgreen-700", description: "Email, phone & ID approved" },
  Trusted: { label: "Trusted", color: "bg-gradient-to-r from-brandgreen-500 to-emerald-500 text-white", description: "Verified identity + ownership + positive history" },
};

const PERM: Record<Role, Permission[]> = {
  Guest: ["properties.read"],
  Tenant: [
    "properties.read", "properties.save", "properties.contact",
    "profile.edit", "applications.manage", "payments.manage",
    "maintenance.manage", "reviews.manage",
  ],
  Landlord: [
    "properties.read", "properties.create", "properties.update",
    "applications.manage", "payments.manage", "maintenance.manage",
    "analytics.view", "profile.edit",
  ],
  "Property Manager": [
    "properties.read", "properties.create", "properties.update",
    "applications.manage", "payments.manage", "maintenance.manage",
    "analytics.view", "profile.edit",
  ],
  Moderator: [
    "properties.read", "properties.update", "properties.delete",
    "properties.verify", "users.read", "users.verify",
    "verification.manage", "reports.manage", "reviews.manage",
    "profile.edit",
  ],
  Admin: [
    "users.read", "users.create", "users.update", "users.delete", "users.verify",
    "properties.read", "properties.create", "properties.update", "properties.delete",
    "properties.feature", "properties.verify",
    "applications.manage", "payments.manage", "maintenance.manage",
    "reviews.manage", "analytics.view", "verification.manage",
    "reports.manage", "settings.manage", "content.manage",
    "profile.edit",
  ],
  "Super Admin": [
    "users.read", "users.create", "users.update", "users.delete", "users.verify",
    "properties.read", "properties.create", "properties.update", "properties.delete",
    "properties.feature", "properties.verify",
    "applications.manage", "payments.manage", "maintenance.manage",
    "reviews.manage", "analytics.view", "verification.manage",
    "reports.manage", "settings.manage", "content.manage",
    "audit.view", "profile.edit",
  ],
};

export function hasPermission(role: Role, perm: Permission): boolean {
  return PERM[role]?.includes(perm) ?? false;
}

export function getAllPermissions(): Permission[] {
  return [
    "users.read", "users.create", "users.update", "users.delete", "users.verify",
    "properties.read", "properties.create", "properties.update", "properties.delete",
    "properties.feature", "properties.verify",
    "applications.manage", "payments.manage", "maintenance.manage",
    "reviews.manage", "analytics.view", "verification.manage",
    "reports.manage", "settings.manage", "audit.view", "content.manage",
    "properties.save", "properties.contact", "profile.edit",
  ];
}
