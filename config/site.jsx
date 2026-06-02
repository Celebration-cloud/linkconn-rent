// site.jsx

export const siteConfig = {
  name: "LinkConn Rent",
  slogan: "Find Your Perfect Home",
  logo: "https://eqmwsmfbuwvauqlbexau.supabase.co/storage/v1/object/public/Linkconn%20Rent/ChatGPT%20Image%20Oct%2025,%202025,%2007_27_10%20AM.png",
  description:
    "LinkConn Rent helps landlords, agents, and tenants manage rentals, automate payments, and simplify property life — all in one platform.",

  // ─────────────────────────────
  // 🧭 NAVIGATION ITEMS
  // ─────────────────────────────
  navItems: [
    { label: "Home", href: "/" },
    { label: "Properties", href: "/properties" },
    { label: "Agents", href: "/agents" },
    { label: "How It Works", href: "/how-it-works" },
    { label: "About", href: "/about" },
    { label: "Contact", href: "/contact" },
  ],

  // ─────────────────────────────
  // 📋 USER MENU
  // ─────────────────────────────
  navMenuItems: [
    { label: "Dashboard", href: "/dashboard" },
    { label: "My Rentals", href: "/dashboard/rentals" },
    { label: "Payments", href: "/dashboard/payments" },
    { label: "Maintenance Requests", href: "/dashboard/maintenance" },
    { label: "Profile", href: "/dashboard/profile" },
    { label: "Settings", href: "/dashboard/settings" },
    { label: "Help & Support", href: "/support" },
    { label: "Logout", href: "/auth/logout" },
  ],
  propertyTypes: [
    {
      category: "Residential",
      color: "text-blue-600",
      items: [
        { key: "1-room-self-contain", label: "1 Room Self Contain" },
        { key: "room-and-parlour", label: "Room & Parlour (Mini Flat)" },
        { key: "2-bedroom-flat", label: "2 Bedroom Flat" },
        { key: "3-bedroom-flat", label: "3 Bedroom Flat" },
        { key: "4-bedroom-flat", label: "4 Bedroom Flat" },
        { key: "bungalow", label: "Bungalow" },
      ],
    },
    {
      category: "Houses",
      color: "text-green-600",
      items: [
        { key: "semi-detached-duplex", label: "Semi-Detached Duplex" },
        { key: "fully-detached-duplex", label: "Fully Detached Duplex" },
        { key: "terrace-duplex", label: "Terrace Duplex" },
      ],
    },
    {
      category: "Luxury & Special",
      color: "text-purple-600",
      items: [
        { key: "penthouse", label: "Penthouse" },
        { key: "mansion", label: "Mansion" },
        { key: "serviced-apartment", label: "Serviced Apartment" },
        { key: "shortlet", label: "Shortlet Apartment" },
      ],
    },
    {
      category: "Commercial",
      color: "text-amber-600",
      items: [
        { key: "office-space", label: "Office Space" },
        { key: "shop", label: "Shop" },
        { key: "warehouse", label: "Warehouse" },
        { key: "event-hall", label: "Event Hall" },
        { key: "hotel", label: "Hotel / Lodge" },
        { key: "restaurant-bar", label: "Restaurant / Bar Space" },
      ],
    },
  ],

  // ─────────────────────────────
  // 🌐 LINKS
  // ─────────────────────────────
  links: {
    github: "https://github.com/heroui-inc/heroui",
    twitter: "https://twitter.com/hero_ui",
    docs: "https://heroui.com",
    discord: "https://discord.gg/9b6yyZKmH4",
    sponsor: "https://patreon.com/jrgarciadev",
    support: "mailto:support@linkconnrent.com",
  },

  // ─────────────────────────────
  // ⚙️ PLATFORM ROUTES
  // ─────────────────────────────
  routes: {
    auth: {
      login: "/auth/login",
      signup: "/auth/signup",
      onboarding: "/auth/onboarding",
    },
    dashboard: {
      landlord: "/dashboard/landlord",
      agent: "/dashboard/agent",
      tenant: "/dashboard/tenant",
    },
  },

  // ─────────────────────────────
  // 💎 BRAND COLORS
  // ─────────────────────────────
  theme: {
    primary: "#0B3D91", // Deep blue for trust
    accent: "#D4AF37", // Gold for premium feel
    lightBg: "#F9FAFB",
    darkBg: "#0B1120",
  },

  // ─────────────────────────────
  // 🏢 COMPANY INFO
  // ─────────────────────────────
  company: {
    email: "support@linkconnrent.com",
    phone: "+234 800 123 4567",
    address: "45 Adeola Street, Victoria Island, Lagos, Nigeria",
    copyright: `© ${new Date().getFullYear()} LinkConn Rent — All rights reserved.`,
  },
};
