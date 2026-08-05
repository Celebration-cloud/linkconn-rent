export type Role =
  | "Guest"
  | "Tenant"
  | "Landlord"
  | "Property Manager"
  | "Moderator"
  | "Admin"
  | "Super Admin";

export type Permission =
  | "users.read"
  | "users.create"
  | "users.update"
  | "users.delete"
  | "users.verify"
  | "properties.read"
  | "properties.create"
  | "properties.update"
  | "properties.delete"
  | "properties.feature"
  | "properties.verify"
  | "applications.manage"
  | "payments.manage"
  | "maintenance.manage"
  | "reviews.manage"
  | "analytics.view"
  | "verification.manage"
  | "reports.manage"
  | "settings.manage"
  | "audit.view"
  | "content.manage"
  | "properties.save"
  | "properties.contact"
  | "profile.edit";

export type VerificationLevel = "Unverified" | "Partially Verified" | "Fully Verified" | "Trusted";
export type AccountReviewStatus = "NotSubmitted" | "Pending" | "Approved" | "Rejected";

export type TenantProfile = {
  occupation?: string;
  incomeRange?: string;
  preferredLocations: string[];
  preferredTypes: string[];
  rentalHistory: { id: string; property: string; from: string; to: string; status: string }[];
};

export type LandlordProfile = {
  businessName?: string;
  propertyCount: number;
  bankName?: string;
  accountNumber?: string;
  ownershipDocs: { name: string; status: "Pending" | "Approved" | "Rejected" }[];
  govId?: { name: string; status: "Pending" | "Approved" | "Rejected" };
};

export type NotificationItem = {
  id: string;
  title: string;
  body: string;
  type: "info" | "success" | "warning" | "payment" | "maintenance";
  time: string;
  read: boolean;
};

export type SessionDevice = {
  id: string;
  device: string;
  location: string;
  ip: string;
  lastActive: string;
  current: boolean;
};

export type AuthUser = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  avatar?: string;
  role: Role;
  emailVerified: boolean;
  phoneVerified: boolean;
  twoFactorEnabled: boolean;
  onboardingComplete: boolean;
  accountReviewStatus: AccountReviewStatus;
  accountReviewReason?: string;
  verificationLevel: VerificationLevel;
  createdAt: string;
  location?: string;
  bio?: string;
  tenant?: TenantProfile;
  landlord?: LandlordProfile;
  permissions?: Permission[];
};

export type AuthView =
  | "closed"
  | "pick"
  | "signup"
  | "role"
  | "verify"
  | "login"
  | "forgot"
  | "onboarding"
  | "success"
  | "account";

export type SignupData = {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone: string;
  role: Role;
};
