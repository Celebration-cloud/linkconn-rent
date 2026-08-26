export type Property = {
  id: string;
  title: string;
  type: string;
  location: string;
  city: string;
  price: number;
  period: string;
  bedrooms: number;
  bathrooms: number;
  toilets: number;
  area: number;
  image: string;
  images?: string[];
  amenities: string[];
  houseRules?: string[];
  latitude?: number | null;
  longitude?: number | null;
  mappable?: boolean;
  cautionFee?: number;
  legalFee?: number;
  agencyFee?: number;
  serviceCharge?: number;
  moveInEstimate?: number | null;
  verified: boolean;
  featured: boolean;
  landlord: string;
  landlordId?: string;
  rating: number;
  status: "Available" | "Rented";
  description: string;
};

export type PropertyCostView = "rent" | "move-in";

export type Maintenance = {
  id: string;
  title: string;
  property: string;
  propertyId?: string;
  status: "Pending" | "In Progress" | "Completed" | "Closed";
  date: string;
  priority: "Low" | "Medium" | "High";
};

export type PaymentRow = {
  id: string;
  tenant: string;
  tenantId?: string;
  property: string;
  propertyId?: string;
  amount: number;
  due: string;
  status: "Paid" | "Due" | "Overdue";
};
