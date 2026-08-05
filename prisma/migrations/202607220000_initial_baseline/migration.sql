-- Baseline the database schema that existed before Prisma Migrate was adopted.
CREATE SCHEMA IF NOT EXISTS "public";

CREATE TYPE "public"."AppRole" AS ENUM ('Tenant', 'Landlord', 'PropertyManager', 'Moderator', 'Admin', 'SuperAdmin');
CREATE TYPE "public"."EmploymentType" AS ENUM ('Employed', 'SelfEmployed', 'Freelancer', 'Student', 'Unemployed', 'Retired');
CREATE TYPE "public"."IdDocStatus" AS ENUM ('NotSubmitted', 'Pending', 'Approved', 'Rejected');
CREATE TYPE "public"."IncomeRange" AS ENUM ('Below50k', 'Between50kAnd100k', 'Between100kAnd250k', 'Between250kAnd500k', 'Above500k');
CREATE TYPE "public"."PaymentStatus" AS ENUM ('Paid', 'Due', 'Overdue');
CREATE TYPE "public"."PropertyStatus" AS ENUM ('Available', 'Rented', 'UnderMaintenance', 'Archived');
CREATE TYPE "public"."RequestPriority" AS ENUM ('Low', 'Medium', 'High');
CREATE TYPE "public"."RequestStatus" AS ENUM ('Pending', 'InProgress', 'Completed', 'Closed');
CREATE TYPE "public"."VerificationLevel" AS ENUM ('Unverified', 'PartiallyVerified', 'FullyVerified', 'Trusted');

CREATE TABLE "public"."applications" (
  "id" TEXT NOT NULL,
  "propertyId" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'Pending',
  "message" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "applications_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "public"."landlord_profiles" (
  "id" TEXT NOT NULL,
  "profileId" TEXT NOT NULL,
  "businessName" TEXT,
  "propertyCount" INTEGER NOT NULL DEFAULT 0,
  "propertyTypesOffered" TEXT[] DEFAULT ARRAY[]::TEXT[],
  "ninStatus" "public"."IdDocStatus" NOT NULL DEFAULT 'NotSubmitted',
  "ninNumber" TEXT,
  "bankName" TEXT,
  "accountNumber" TEXT,
  "accountName" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "landlord_profiles_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "public"."maintenance_requests" (
  "id" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "description" TEXT,
  "propertyId" TEXT NOT NULL,
  "requesterId" TEXT NOT NULL,
  "status" "public"."RequestStatus" NOT NULL DEFAULT 'Pending',
  "priority" "public"."RequestPriority" NOT NULL DEFAULT 'Medium',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "maintenance_requests_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "public"."payments" (
  "id" TEXT NOT NULL,
  "propertyId" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "amount" DOUBLE PRECISION NOT NULL,
  "dueDate" TIMESTAMP(3) NOT NULL,
  "paidAt" TIMESTAMP(3),
  "status" "public"."PaymentStatus" NOT NULL DEFAULT 'Due',
  "reference" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "public"."profiles" (
  "id" TEXT NOT NULL,
  "phone" TEXT,
  "email" TEXT NOT NULL,
  "avatar" TEXT,
  "bio" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "emailVerified" BOOLEAN NOT NULL DEFAULT false,
  "firstName" TEXT NOT NULL DEFAULT '',
  "lastName" TEXT NOT NULL DEFAULT '',
  "location" TEXT,
  "onboardingComplete" BOOLEAN NOT NULL DEFAULT false,
  "twoFactorEnabled" BOOLEAN NOT NULL DEFAULT false,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "verificationLevel" "public"."VerificationLevel" NOT NULL DEFAULT 'Unverified',
  "role" "public"."AppRole" NOT NULL DEFAULT 'Tenant',
  CONSTRAINT "profiles_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "public"."properties" (
  "id" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "price" DOUBLE PRECISION NOT NULL,
  "location" TEXT NOT NULL,
  "images" TEXT[] DEFAULT ARRAY[]::TEXT[],
  "type" TEXT NOT NULL,
  "amenities" TEXT[] DEFAULT ARRAY[]::TEXT[],
  "area" DOUBLE PRECISION NOT NULL,
  "bathrooms" INTEGER NOT NULL,
  "bedrooms" INTEGER NOT NULL,
  "city" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "featured" BOOLEAN NOT NULL DEFAULT false,
  "ownerId" TEXT NOT NULL,
  "period" TEXT NOT NULL DEFAULT 'year',
  "rating" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
  "status" "public"."PropertyStatus" NOT NULL DEFAULT 'Available',
  "toilets" INTEGER NOT NULL,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  "verified" BOOLEAN NOT NULL DEFAULT false,
  CONSTRAINT "properties_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "public"."tenant_profiles" (
  "id" TEXT NOT NULL,
  "profileId" TEXT NOT NULL,
  "employmentType" "public"."EmploymentType" NOT NULL DEFAULT 'Employed',
  "employerName" TEXT,
  "jobTitle" TEXT,
  "incomeRange" "public"."IncomeRange" NOT NULL DEFAULT 'Below50k',
  "preferredLocations" TEXT[] DEFAULT ARRAY[]::TEXT[],
  "preferredTypes" TEXT[] DEFAULT ARRAY[]::TEXT[],
  "budgetMin" DOUBLE PRECISION,
  "budgetMax" DOUBLE PRECISION,
  "moveInDate" TIMESTAMP(3),
  "ninStatus" "public"."IdDocStatus" NOT NULL DEFAULT 'NotSubmitted',
  "ninNumber" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "tenant_profiles_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "landlord_profiles_profileId_key" ON "public"."landlord_profiles"("profileId" ASC);
CREATE UNIQUE INDEX "payments_reference_key" ON "public"."payments"("reference" ASC);
CREATE UNIQUE INDEX "profiles_email_key" ON "public"."profiles"("email" ASC);
CREATE UNIQUE INDEX "tenant_profiles_profileId_key" ON "public"."tenant_profiles"("profileId" ASC);

ALTER TABLE "public"."applications" ADD CONSTRAINT "applications_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "public"."properties"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "public"."applications" ADD CONSTRAINT "applications_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "public"."profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "public"."landlord_profiles" ADD CONSTRAINT "landlord_profiles_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "public"."profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "public"."maintenance_requests" ADD CONSTRAINT "maintenance_requests_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "public"."properties"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "public"."maintenance_requests" ADD CONSTRAINT "maintenance_requests_requesterId_fkey" FOREIGN KEY ("requesterId") REFERENCES "public"."profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "public"."payments" ADD CONSTRAINT "payments_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "public"."properties"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "public"."payments" ADD CONSTRAINT "payments_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "public"."profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "public"."properties" ADD CONSTRAINT "properties_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "public"."profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "public"."tenant_profiles" ADD CONSTRAINT "tenant_profiles_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "public"."profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
