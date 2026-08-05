export type LinkConnAsset = {
  src: string;
  alt: string;
  width: number;
  height: number;
  aspectRatio: "16:9" | "4:3" | "3:4";
  focalPoint: `${number}% ${number}%`;
  dominantColor: string;
  route: string;
  cropBehavior: "cover" | "contain";
  motion:
    | "hero-depth"
    | "image-drift"
    | "cinematic-reveal"
    | "gallery-shared-layout";
  reducedMotion: "static" | "opacity-only";
};

type AssetInput = Omit<
  LinkConnAsset,
  "width" | "height" | "aspectRatio" | "cropBehavior" | "reducedMotion"
>;

const landscape = (value: AssetInput): LinkConnAsset => ({
  ...value,
  width: 1672,
  height: 941,
  aspectRatio: "16:9",
  cropBehavior: "cover",
  reducedMotion: "opacity-only",
});

const property = (value: AssetInput): LinkConnAsset => ({
  ...value,
  width: 1448,
  height: 1086,
  aspectRatio: "4:3",
  cropBehavior: "cover",
  reducedMotion: "static",
});

const portrait = (value: AssetInput): LinkConnAsset => ({
  ...value,
  width: 1086,
  height: 1448,
  aspectRatio: "3:4",
  cropBehavior: "cover",
  reducedMotion: "opacity-only",
});

export const LINKCONN_ASSETS = {
  hero: landscape({
    src: "/images/generated/linkconn/homepage-hero-arrival.png",
    alt: "A Nigerian renter arriving at a modern Lagos apartment courtyard",
    focalPoint: "66% 50%",
    dominantColor: "#12372a",
    route: "/",
    motion: "hero-depth",
  }),
  verification: landscape({
    src: "/images/generated/linkconn/section-verification.png",
    alt: "A property owner and verification specialist reviewing an apartment",
    focalPoint: "40% 50%",
    dominantColor: "#f6f2e9",
    route: "/#verification",
    motion: "image-drift",
  }),
  costs: landscape({
    src: "/images/generated/linkconn/section-transparent-costs.png",
    alt: "A renter reviewing housing costs on a tablet beside keys and documents",
    focalPoint: "62% 50%",
    dominantColor: "#d7c6a5",
    route: "/#costs",
    motion: "cinematic-reveal",
  }),
  directViewing: landscape({
    src: "/images/generated/linkconn/section-direct-viewing.png",
    alt: "A Nigerian tenant viewing an apartment directly with its landlord",
    focalPoint: "64% 50%",
    dominantColor: "#12372a",
    route: "/#viewings",
    motion: "image-drift",
  }),
  payment: landscape({
    src: "/images/generated/linkconn/section-protected-payment.png",
    alt: "A tenant reviewing and signing a digital rental agreement at home",
    focalPoint: "36% 50%",
    dominantColor: "#08231a",
    route: "/#protected-payment",
    motion: "cinematic-reveal",
  }),
  neighborhoodDiscovery: landscape({
    src: "/images/generated/linkconn/section-neighborhood-discovery.png",
    alt: "A tree-lined Yaba residential street at blue hour",
    focalPoint: "56% 50%",
    dominantColor: "#102d27",
    route: "/#locations",
    motion: "image-drift",
  }),
  maintenance: landscape({
    src: "/images/generated/linkconn/section-maintenance-evidence.png",
    alt: "A tenant records evidence while a technician inspects a kitchen sink",
    focalPoint: "56% 54%",
    dominantColor: "#d6c09b",
    route: "/dashboard/maintenance",
    motion: "cinematic-reveal",
  }),
  tenantStory: landscape({
    src: "/images/generated/linkconn/section-tenant-story.png",
    alt: "A tenant relaxing in her newly rented apartment",
    focalPoint: "36% 48%",
    dominantColor: "#d5c4a7",
    route: "/#tenant-story",
    motion: "image-drift",
  }),
  landlordStory: landscape({
    src: "/images/generated/linkconn/section-landlord-story.png",
    alt: "A Nigerian landlord reviewing a property plan with a manager",
    focalPoint: "42% 52%",
    dominantColor: "#56624d",
    route: "/#landlord-story",
    motion: "cinematic-reveal",
  }),
  viewingSafety: landscape({
    src: "/images/generated/linkconn/section-viewing-safety.png",
    alt: "A renter attending a safe daylight apartment viewing",
    focalPoint: "42% 50%",
    dominantColor: "#d8c5a4",
    route: "/trust-and-safety",
    motion: "image-drift",
  }),
  listingWorkflow: landscape({
    src: "/images/generated/linkconn/section-listing-workflow.png",
    alt: "A property owner and photographer preparing an apartment listing",
    focalPoint: "54% 50%",
    dominantColor: "#293d2d",
    route: "/dashboard/properties/new",
    motion: "cinematic-reveal",
  }),
  finalArrival: landscape({
    src: "/images/generated/linkconn/section-final-arrival.png",
    alt: "An open doorway leading into a serene Nigerian home at golden hour",
    focalPoint: "50% 50%",
    dominantColor: "#5a3c20",
    route: "/#get-started",
    motion: "hero-depth",
  }),
  neighborhoodLagos: landscape({
    src: "/images/generated/linkconn/neighborhood-lagos-yaba.png",
    alt: "A lived-in residential street in Yaba, Lagos after rain",
    focalPoint: "54% 52%",
    dominantColor: "#46463a",
    route: "/properties?location=Lagos",
    motion: "image-drift",
  }),
  neighborhoodAbuja: landscape({
    src: "/images/generated/linkconn/neighborhood-abuja-gwarinpa.png",
    alt: "A leafy residential avenue in Abuja",
    focalPoint: "56% 48%",
    dominantColor: "#61704d",
    route: "/properties?location=Abuja",
    motion: "image-drift",
  }),
  neighborhoodIbadan: landscape({
    src: "/images/generated/linkconn/neighborhood-ibadan-bodija.png",
    alt: "A shaded residential street in Bodija, Ibadan",
    focalPoint: "58% 50%",
    dominantColor: "#4f4f31",
    route: "/properties?location=Ibadan",
    motion: "image-drift",
  }),
  neighborhoodPortHarcourt: landscape({
    src: "/images/generated/linkconn/neighborhood-port-harcourt.png",
    alt: "A Port Harcourt residential avenue after tropical rain",
    focalPoint: "52% 52%",
    dominantColor: "#384a35",
    route: "/properties?location=Port%20Harcourt",
    motion: "image-drift",
  }),
  propertyYabaLivingRoom: property({
    src: "/images/generated/linkconn/property-yaba-living-room.png",
    alt: "Sunlit living room in a Yaba apartment",
    focalPoint: "50% 50%",
    dominantColor: "#d6c4a3",
    route: "/properties",
    motion: "gallery-shared-layout",
  }),
  propertyGwarinpaTerrace: property({
    src: "/images/generated/linkconn/property-gwarinpa-terrace.png",
    alt: "Exterior of a contemporary Gwarinpa terrace",
    focalPoint: "50% 50%",
    dominantColor: "#8a765c",
    route: "/properties",
    motion: "gallery-shared-layout",
  }),
  propertyYabaStudio: property({
    src: "/images/generated/linkconn/property-yaba-studio.png",
    alt: "Compact furnished studio apartment in Yaba",
    focalPoint: "50% 50%",
    dominantColor: "#c7b697",
    route: "/properties",
    motion: "gallery-shared-layout",
  }),
  propertyWuseKitchen: property({
    src: "/images/generated/linkconn/property-wuse-kitchen.png",
    alt: "Bright fitted kitchen in a Wuse apartment",
    focalPoint: "50% 50%",
    dominantColor: "#d5c8ae",
    route: "/properties",
    motion: "gallery-shared-layout",
  }),
  propertyChobaCommonRoom: property({
    src: "/images/generated/linkconn/property-choba-common-room.png",
    alt: "Welcoming shared common room near Choba",
    focalPoint: "50% 50%",
    dominantColor: "#947c59",
    route: "/properties",
    motion: "gallery-shared-layout",
  }),
  propertyLagosBathroom: property({
    src: "/images/generated/linkconn/property-lagos-bathroom.png",
    alt: "Clean modern bathroom in a Lagos apartment",
    focalPoint: "50% 50%",
    dominantColor: "#b8ad99",
    route: "/properties",
    motion: "gallery-shared-layout",
  }),
  propertyLekkiBedroom: property({
    src: "/images/generated/linkconn/property-lekki-bedroom.png",
    alt: "Forest-toned primary bedroom in a Lekki apartment",
    focalPoint: "54% 52%",
    dominantColor: "#3a3f2d",
    route: "/properties",
    motion: "gallery-shared-layout",
  }),
  propertyAbujaBedroom: property({
    src: "/images/generated/linkconn/property-abuja-bedroom.png",
    alt: "Calm secondary bedroom in an Abuja terrace",
    focalPoint: "48% 50%",
    dominantColor: "#9d927b",
    route: "/properties",
    motion: "gallery-shared-layout",
  }),
  propertyLagosBalcony: property({
    src: "/images/generated/linkconn/property-lagos-balcony.png",
    alt: "Covered balcony overlooking a leafy Lagos neighborhood",
    focalPoint: "54% 48%",
    dominantColor: "#88775b",
    route: "/properties",
    motion: "gallery-shared-layout",
  }),
  propertySecureCompound: property({
    src: "/images/generated/linkconn/property-secure-compound.png",
    alt: "Secure landscaped parking court in a residential compound",
    focalPoint: "52% 50%",
    dominantColor: "#82755e",
    route: "/properties",
    motion: "gallery-shared-layout",
  }),
  propertyIbadanFlat: property({
    src: "/images/generated/linkconn/property-ibadan-flat.png",
    alt: "Renovated low-rise flat beneath mature trees in Ibadan",
    focalPoint: "56% 50%",
    dominantColor: "#756d52",
    route: "/properties",
    motion: "gallery-shared-layout",
  }),
  propertyPortHarcourtDuplex: property({
    src: "/images/generated/linkconn/property-port-harcourt-duplex.png",
    alt: "Rain-conscious modern duplex in Port Harcourt",
    focalPoint: "50% 50%",
    dominantColor: "#6b735d",
    route: "/properties",
    motion: "gallery-shared-layout",
  }),
  tenantAmaka: portrait({
    src: "/images/generated/linkconn/portrait-tenant-amaka.png",
    alt: "Amaka, a LinkConn Rent tenant, beside her apartment window",
    focalPoint: "48% 35%",
    dominantColor: "#a98f70",
    route: "/#tenant-story",
    motion: "cinematic-reveal",
  }),
  landlordAdekunle: portrait({
    src: "/images/generated/linkconn/portrait-landlord-adekunle.png",
    alt: "Adekunle, a LinkConn Rent landlord, in a property courtyard",
    focalPoint: "50% 34%",
    dominantColor: "#45463c",
    route: "/#landlord-story",
    motion: "cinematic-reveal",
  }),
  propertyManager: portrait({
    src: "/images/generated/linkconn/portrait-property-manager.png",
    alt: "A LinkConn Rent property manager in an apartment corridor",
    focalPoint: "50% 32%",
    dominantColor: "#224a3b",
    route: "/dashboard/calendar",
    motion: "cinematic-reveal",
  }),
  verificationReviewer: portrait({
    src: "/images/generated/linkconn/portrait-verification-reviewer.png",
    alt: "A housing verification reviewer examining a case",
    focalPoint: "50% 30%",
    dominantColor: "#1d2e22",
    route: "/admin/verification",
    motion: "cinematic-reveal",
  }),
} satisfies Record<string, LinkConnAsset>;

export const LINKCONN_ASSET_COUNT = Object.keys(LINKCONN_ASSETS).length;
