import { PrismaClient, AppRole, RequestStatus, RequestPriority, PaymentStatus } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // 1. Clean existing data
  await prisma.adminAuditEvent.deleteMany({});
  await prisma.disputeNote.deleteMany({});
  await prisma.disputeCase.deleteMany({});
  await prisma.maintenanceActivity.deleteMany({});
  await prisma.verificationDocument.deleteMany({});
  await prisma.verificationSubmission.deleteMany({});
  await prisma.message.deleteMany({});
  await prisma.conversation.deleteMany({});
  await prisma.viewing.deleteMany({});
  await prisma.savedProperty.deleteMany({});
  await prisma.payment.deleteMany({});
  await prisma.maintenanceRequest.deleteMany({});
  await prisma.application.deleteMany({});
  await prisma.property.deleteMany({});
  await prisma.profile.deleteMany({});

  // 2. Create mock landlords
  const adeyemi = await prisma.profile.create({
    data: {
      id: "landlord_adeyemi",
      email: "adeyemi@estates.com",
      firstName: "Adeyemi",
      lastName: "Estates",
      role: AppRole.Landlord,
      verificationLevel: "Trusted",
      onboardingComplete: true,
      bio: "Premier property management and development group operating in Lagos.",
      location: "Lekki, Lagos",
    },
  });

  const capital = await prisma.profile.create({
    data: {
      id: "landlord_capital",
      email: "capital@homes.com",
      firstName: "Capital",
      lastName: "Homes Ltd",
      role: AppRole.Landlord,
      verificationLevel: "FullyVerified",
      onboardingComplete: true,
      bio: "Modern developments and affordable luxury flats in Abuja.",
      location: "Wuse, Abuja",
    },
  });

  const greenfield = await prisma.profile.create({
    data: {
      id: "landlord_greenfield",
      email: "greenfield@realty.com",
      firstName: "Greenfield",
      lastName: "Realty",
      role: AppRole.Landlord,
      verificationLevel: "FullyVerified",
      onboardingComplete: true,
      bio: "Spacious residential duplexes and terraced family homes.",
      location: "Gwarinpa, Abuja",
    },
  });

  const urbannest = await prisma.profile.create({
    data: {
      id: "landlord_urbannest",
      email: "urbannest@rent.com",
      firstName: "Urban",
      lastName: "Nest",
      role: AppRole.Landlord,
      verificationLevel: "FullyVerified",
      onboardingComplete: true,
      bio: "Smart studio solutions for urban professionals.",
      location: "Yaba, Lagos",
    },
  });

  const prestige = await prisma.profile.create({
    data: {
      id: "landlord_prestige",
      email: "prestige@prop.com",
      firstName: "Prestige",
      lastName: "Properties",
      role: AppRole.Landlord,
      verificationLevel: "Trusted",
      onboardingComplete: true,
      bio: "Elite luxury listings for high-net-worth individuals.",
      location: "Ikoyi, Lagos",
    },
  });

  const campus = await prisma.profile.create({
    data: {
      id: "landlord_campus",
      email: "campus@lodging.com",
      firstName: "Campus",
      lastName: "Lodgings",
      role: AppRole.Landlord,
      verificationLevel: "PartiallyVerified",
      onboardingComplete: true,
      bio: "Student-friendly affordable housing options near universities.",
      location: "Port Harcourt",
    },
  });

  // 3. Create tenants
  const chidi = await prisma.profile.create({
    data: {
      id: "tenant_chidi",
      email: "chidi.okafor@gmail.com",
      firstName: "Chidi",
      lastName: "Okafor",
      role: AppRole.Tenant,
      verificationLevel: "FullyVerified",
      onboardingComplete: true,
      phone: "+234 802 334 4556",
    },
  });

  const amaka = await prisma.profile.create({
    data: {
      id: "tenant_amaka",
      email: "amaka.eze@outlook.com",
      firstName: "Amaka",
      lastName: "Eze",
      role: AppRole.Tenant,
      verificationLevel: "PartiallyVerified",
      onboardingComplete: true,
      phone: "+234 905 112 3456",
    },
  });

  const tunde = await prisma.profile.create({
    data: {
      id: "tenant_tunde",
      email: "tunde.bello@yahoo.com",
      firstName: "Tunde",
      lastName: "Bello",
      role: AppRole.Tenant,
      verificationLevel: "FullyVerified",
      onboardingComplete: true,
      phone: "+234 703 998 8776",
    },
  });

  const ngozi = await prisma.profile.create({
    data: {
      id: "tenant_ngozi",
      email: "ngozi.ali@gmail.com",
      firstName: "Ngozi",
      lastName: "Ali",
      role: AppRole.Tenant,
      verificationLevel: "Unverified",
      onboardingComplete: false,
      phone: "+234 812 445 6677",
    },
  });

  const moderator = await prisma.profile.create({
    data: {
      id: "moderator_ada",
      email: "ada.moderator@linkconn.rent",
      firstName: "Ada",
      lastName: "Nwosu",
      role: AppRole.Moderator,
      verificationLevel: "Trusted",
      onboardingComplete: true,
    },
  });

  const admin = await prisma.profile.create({
    data: {
      id: "admin_linkconn",
      email: "admin@linkconn.rent",
      firstName: "LinkConn",
      lastName: "Admin",
      role: AppRole.Admin,
      verificationLevel: "Trusted",
      onboardingComplete: true,
    },
  });

  // 4. Create Properties
  const prop1 = await prisma.property.create({
    data: {
      title: "Modern 3-Bedroom Duplex",
      type: "Duplex",
      location: "Lekki Phase 1",
      city: "Lagos",
      price: 4500000,
      bedrooms: 3,
      bathrooms: 3,
      toilets: 4,
      area: 220,
      latitude: 6.4474,
      longitude: 3.4723,
      images: ["/images/prop1.jpg"],
      amenities: ["24/7 Power", "Security", "Parking", "Fitted Kitchen", "POP Ceiling"],
      houseRules: ["No smoking", "No short lets"],
      cautionFee: 450000,
      legalFee: 225000,
      agencyFee: 450000,
      serviceCharge: 300000,
      verified: true,
      featured: true,
      rating: 4.9,
      status: "Available",
      moderationStatus: "Approved",
      description: "A spacious, newly built duplex in a serene Lekki estate with uninterrupted power, ample parking and tight security.",
      ownerId: adeyemi.id,
    },
  });

  const prop2 = await prisma.property.create({
    data: {
      title: "Bright 2-Bedroom Apartment",
      type: "Apartment",
      location: "Wuse 2",
      city: "Abuja",
      price: 2800000,
      bedrooms: 2,
      bathrooms: 2,
      toilets: 3,
      area: 140,
      latitude: 9.0765,
      longitude: 7.4818,
      images: ["/images/prop2.jpg"],
      amenities: ["24/7 Power", "Borehole Water", "Air Conditioning", "Wifi Ready"],
      houseRules: ["Residential use only"],
      cautionFee: 280000,
      legalFee: 140000,
      agencyFee: 280000,
      serviceCharge: 200000,
      verified: true,
      featured: true,
      rating: 4.7,
      status: "Available",
      moderationStatus: "Approved",
      description: "Tastefully finished 2-bedroom apartment in the heart of Wuse 2, close to malls, banks and restaurants.",
      ownerId: capital.id,
    },
  });

  const prop3 = await prisma.property.create({
    data: {
      title: "Family Terraced House",
      type: "Duplex",
      location: "Gwarinpa",
      city: "Abuja",
      price: 3200000,
      bedrooms: 4,
      bathrooms: 4,
      toilets: 5,
      area: 260,
      latitude: 9.1157,
      longitude: 7.4051,
      images: ["/images/prop3.jpg"],
      amenities: ["Security", "Parking", "Borehole Water", "POP Ceiling"],
      verified: true,
      featured: false,
      rating: 4.6,
      status: "Available",
      moderationStatus: "Approved",
      description: "A comfortable terraced home perfect for families, located in a gated Gwarinpa estate with 24-hour security.",
      ownerId: greenfield.id,
    },
  });

  const prop4 = await prisma.property.create({
    data: {
      title: "Cozy Studio Apartment",
      type: "Studio",
      location: "Yaba",
      city: "Lagos",
      price: 950000,
      bedrooms: 1,
      bathrooms: 1,
      toilets: 1,
      area: 45,
      latitude: 6.5158,
      longitude: 3.3707,
      images: ["/images/prop4.jpg"],
      amenities: ["24/7 Power", "Wifi Ready", "Furnished"],
      verified: true,
      featured: false,
      rating: 4.5,
      status: "Available",
      moderationStatus: "Approved",
      description: "Smart, fully furnished studio ideal for young professionals, minutes from the tech hub in Yaba.",
      ownerId: urbannest.id,
    },
  });

  await prisma.property.create({
    data: {
      title: "Luxury 5-Bedroom Mansion",
      type: "Mansion",
      location: "Banana Island",
      city: "Lagos",
      price: 25000000,
      bedrooms: 5,
      bathrooms: 6,
      toilets: 7,
      area: 650,
      latitude: 6.4281,
      longitude: 3.4219,
      images: ["/images/prop5.jpg"],
      amenities: ["Swimming Pool", "24/7 Power", "Security", "Parking", "Furnished", "Air Conditioning"],
      verified: true,
      featured: true,
      rating: 5.0,
      status: "Available",
      moderationStatus: "Approved",
      description: "An exquisite waterfront mansion with private pool, smart-home features and round-the-clock concierge security.",
      ownerId: prestige.id,
    },
  });

  const prop6 = await prisma.property.create({
    data: {
      title: "Affordable Shared Room",
      type: "Shared Apartment",
      location: "Choba",
      city: "Port Harcourt",
      price: 480000,
      bedrooms: 1,
      bathrooms: 1,
      toilets: 2,
      area: 30,
      latitude: 4.8941,
      longitude: 6.9179,
      images: ["/images/prop6.jpg"],
      amenities: ["Wifi Ready", "Borehole Water", "Security"],
      verified: false,
      featured: false,
      rating: 4.2,
      status: "Available",
      moderationStatus: "Flagged",
      moderationReason: "Ownership evidence requires manual review",
      description: "Budget-friendly shared accommodation close to the University of Port Harcourt, perfect for students.",
      ownerId: campus.id,
    },
  });

  // 5. Seed Maintenance Requests
  const leakingTap = await prisma.maintenanceRequest.create({
    data: {
      title: "Leaking kitchen tap",
      propertyId: prop1.id,
      requesterId: chidi.id,
      status: RequestStatus.InProgress,
      priority: RequestPriority.Medium,
    },
  });

  await prisma.maintenanceActivity.createMany({
    data: [
      {
        requestId: leakingTap.id,
        actorId: chidi.id,
        toStatus: "Pending",
        note: "Request created with kitchen photos.",
      },
      {
        requestId: leakingTap.id,
        actorId: adeyemi.id,
        fromStatus: "Pending",
        toStatus: "InProgress",
        note: "Plumber assigned for tomorrow morning.",
      },
    ],
  });

  await prisma.maintenanceRequest.create({
    data: {
      title: "Faulty AC unit",
      propertyId: prop2.id,
      requesterId: amaka.id,
      status: RequestStatus.Pending,
      priority: RequestPriority.High,
    },
  });

  await prisma.maintenanceRequest.create({
    data: {
      title: "Repaint bedroom",
      propertyId: prop3.id,
      requesterId: tunde.id,
      status: RequestStatus.Completed,
      priority: RequestPriority.Low,
    },
  });

  // 6. Seed Payments
  await prisma.payment.create({
    data: {
      propertyId: prop1.id,
      tenantId: chidi.id,
      amount: 5925000,
      dueDate: new Date("2026-01-12"),
      status: PaymentStatus.Paid,
    },
  });

  await prisma.application.create({
    data: {
      propertyId: prop1.id,
      tenantId: chidi.id,
      status: "Accepted",
      score: 93,
      message: "Current tenancy used for maintenance and payment scenarios.",
    },
  });

  const application = await prisma.application.create({
    data: {
      propertyId: prop1.id,
      tenantId: amaka.id,
      status: "Shortlisted",
      score: 86,
      message: "I work in Victoria Island and would like a long-term home.",
    },
  });

  await prisma.savedProperty.create({
    data: { profileId: chidi.id, propertyId: prop2.id },
  });

  await prisma.viewing.create({
    data: {
      propertyId: prop1.id,
      tenantId: amaka.id,
      landlordId: adeyemi.id,
      scheduledAt: new Date("2026-08-05T10:00:00+01:00"),
      status: "Confirmed",
    },
  });

  const conversation = await prisma.conversation.create({
    data: {
      propertyId: prop1.id,
      applicationId: application.id,
      tenantId: amaka.id,
      landlordId: adeyemi.id,
    },
  });

  await prisma.message.createMany({
    data: [
      {
        conversationId: conversation.id,
        senderId: amaka.id,
        body: "Hello, is the apartment still available for an August move-in?",
        createdAt: new Date("2026-07-22T09:15:00+01:00"),
      },
      {
        conversationId: conversation.id,
        senderId: adeyemi.id,
        body: "Yes, it is. I can hold a viewing slot for Tuesday morning.",
        createdAt: new Date("2026-07-22T09:22:00+01:00"),
      },
    ],
  });

  await prisma.payment.create({
    data: {
      propertyId: prop2.id,
      tenantId: amaka.id,
      amount: 3700000,
      dueDate: new Date("2026-02-02"),
      status: PaymentStatus.Due,
    },
  });

  const verification = await prisma.verificationSubmission.create({
    data: {
      ownerId: ngozi.id,
      type: "Identity",
      status: "Pending",
      documentType: "NIN Slip",
      note: "Identity review scenario",
      submittedAt: new Date("2026-07-22T08:30:00+01:00"),
      documents: {
        create: [{ fileName: "ngozi-nin-slip.pdf", mimeType: "application/pdf", size: 245000 }],
      },
    },
  });

  const dispute = await prisma.disputeCase.create({
    data: {
      reference: "LC-8492",
      title: "Fake listing report",
      description: "Tenant reported that the listed address does not match the property shown during inspection.",
      category: "Fraud",
      priority: "High",
      status: "Investigating",
      reporterId: amaka.id,
      assignedToId: moderator.id,
      propertyId: prop6.id,
    },
  });

  await prisma.disputeNote.create({
    data: {
      disputeId: dispute.id,
      authorId: moderator.id,
      body: "Listing hidden from search while ownership evidence is reviewed.",
      internal: true,
    },
  });

  await prisma.adminAuditEvent.createMany({
    data: [
      {
        actorId: moderator.id,
        action: "verification.assigned",
        targetType: "Verification",
        targetId: verification.id,
        previousState: { assignedToId: null },
        resultingState: { assignedToId: moderator.id },
        reason: "Assigned from identity queue",
      },
      {
        actorId: admin.id,
        action: "property.moderated",
        targetType: "Property",
        targetId: prop6.id,
        previousState: { moderationStatus: "PendingReview" },
        resultingState: { moderationStatus: "Flagged" },
        reason: "Ownership evidence requires manual review",
      },
    ],
  });

  await prisma.payment.create({
    data: {
      propertyId: prop3.id,
      tenantId: tunde.id,
      amount: 3200000,
      dueDate: new Date("2025-12-28"),
      status: PaymentStatus.Overdue,
    },
  });

  await prisma.payment.create({
    data: {
      propertyId: prop4.id,
      tenantId: ngozi.id,
      amount: 950000,
      dueDate: new Date("2026-03-15"),
      status: PaymentStatus.Due,
    },
  });

  console.log("Database seeded successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
