import type { Maintenance, PaymentRow } from "../types/property";

export const MAINTENANCE: Maintenance[] = [
  { id: "1", title: "Leaking kitchen tap", property: "Lekki Duplex", status: "In Progress", date: "2 days ago", priority: "Medium" },
  { id: "2", title: "Faulty AC unit", property: "Wuse Apartment", status: "Pending", date: "5 hours ago", priority: "High" },
  { id: "3", title: "Repaint bedroom", property: "Gwarinpa House", status: "Completed", date: "1 week ago", priority: "Low" },
  { id: "4", title: "Generator servicing", property: "Lekki Duplex", status: "Closed", date: "2 weeks ago", priority: "Medium" },
];

export const PAYMENTS: PaymentRow[] = [
  { id: "1", tenant: "Chidi Okafor", property: "Lekki Duplex", amount: 4500000, due: "Jan 12, 2026", status: "Paid" },
  { id: "2", tenant: "Amaka Eze", property: "Wuse Apartment", amount: 2800000, due: "Feb 02, 2026", status: "Due" },
  { id: "3", tenant: "Tunde Bello", property: "Gwarinpa House", amount: 3200000, due: "Dec 28, 2025", status: "Overdue" },
  { id: "4", tenant: "Ngozi Ali", property: "Yaba Studio", amount: 950000, due: "Mar 15, 2026", status: "Due" },
];
