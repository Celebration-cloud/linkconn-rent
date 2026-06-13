import { sql } from "./db.js";

export async function initializeDatabase() {
  try {
    console.log("🚀 Starting Neon Database Schema Initialization...");

    // 1. Create pgcrypto extension for UUID generation
    await sql`CREATE EXTENSION IF NOT EXISTS "pgcrypto";`;

    // 2. Create user_role ENUM type safely if it does not exist
    await sql`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
          CREATE TYPE user_role AS ENUM ('tenant', 'landlord', 'agent', 'admin');
        END IF;
      END$$;
    `;
    console.log("✅ User Role Enum type ready.");

    // 3. Create profiles table (separating custom app-specific metadata)
    await sql`
      CREATE TABLE IF NOT EXISTS profiles (
        id UUID PRIMARY KEY,
        email TEXT UNIQUE,
        role user_role NOT NULL DEFAULT 'tenant',
        full_name TEXT,
        phone TEXT,
        avatar_url TEXT,
        address TEXT,
        company_name TEXT,
        onboarded BOOLEAN DEFAULT FALSE,
        verified BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `;
    console.log("✅ Profiles table ready.");

    // Safe migration: Add new columns to profiles if they don't exist
    await sql`ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS email TEXT UNIQUE;`;
    await sql`ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS address TEXT;`;
    await sql`ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS company_name TEXT;`;
    await sql`ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS onboarded BOOLEAN DEFAULT FALSE;`;
    console.log("✅ Profiles table columns verified.");

    // 4. Create tenant_identity table referencing profiles
    await sql`
      CREATE TABLE IF NOT EXISTS tenant_identity (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
        id_type TEXT,
        id_upload TEXT,
        address TEXT,
        confirmed BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `;
    console.log("✅ Tenant Identity table ready.");

    // 4b. Create landlord_identity table referencing profiles
    await sql`
      CREATE TABLE IF NOT EXISTS landlord_identity (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
        id_type TEXT,
        id_file TEXT,
        land_doc TEXT,
        address TEXT,
        confirmed BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `;
    console.log("✅ Landlord Identity table ready.");

    // 5. Create tenant_employment table referencing profiles
    await sql`
      CREATE TABLE IF NOT EXISTS tenant_employment (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        tenant_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
        employment_status TEXT,
        company_name TEXT,
        monthly_income TEXT,
        occupation TEXT,
        payslip TEXT,
        confirmed BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `;
    console.log("✅ Tenant Employment table ready.");

    // 6. Create tenant_preferences table referencing profiles
    await sql`
      CREATE TABLE IF NOT EXISTS tenant_preferences (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        tenant_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
        location TEXT,
        min_budget TEXT,
        max_budget TEXT,
        property_type TEXT,
        move_in_date TEXT,
        agree_to_policy BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `;
    console.log("✅ Tenant Preferences table ready.");

    // 7. Create properties table referencing profiles
    await sql`
      CREATE TABLE IF NOT EXISTS properties (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        landlord_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
        title TEXT NOT NULL,
        type TEXT,
        address TEXT,
        price NUMERIC,
        description TEXT,
        images TEXT[],
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `;
    console.log("✅ Properties table ready.");

    // Safe migration: Add properties columns
    await sql`ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS type TEXT;`;
    await sql`ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS address TEXT;`;
    console.log("✅ Properties columns verified.");

    // 8. Create landlord_payouts table referencing profiles
    await sql`
      CREATE TABLE IF NOT EXISTS landlord_payouts (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        landlord_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
        bank TEXT NOT NULL,
        account_number TEXT NOT NULL,
        account_name TEXT NOT NULL,
        confirm_ownership BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `;
    console.log("✅ Landlord Payouts table ready.");

    // Safe migration: Add bank and confirm_ownership to landlord_payouts if they don't exist
    await sql`ALTER TABLE public.landlord_payouts ADD COLUMN IF NOT EXISTS bank TEXT;`;
    await sql`ALTER TABLE public.landlord_payouts ADD COLUMN IF NOT EXISTS confirm_ownership BOOLEAN DEFAULT FALSE;`;
    console.log("✅ Landlord Payouts columns verified.");

    // 9. Create Neon Auth synchronization trigger
    await sql`
      DO $$
      BEGIN
        IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'neon_auth' AND table_name = 'users') THEN
          -- Create trigger function
          CREATE OR REPLACE FUNCTION public.handle_new_user()
          RETURNS TRIGGER AS $func$
          BEGIN
            INSERT INTO public.profiles (id, email, role, full_name, phone, verified)
            VALUES (
              NEW.id,
              NEW.email,
              'tenant',
              NEW.name,
              NULL,
              FALSE
            )
            ON CONFLICT (id) DO UPDATE
            SET email = EXCLUDED.email,
                full_name = COALESCE(profiles.full_name, EXCLUDED.full_name);
            RETURN NEW;
          END;
          $func$ LANGUAGE plpgsql SECURITY DEFINER;

          -- Recreate trigger safely
          IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'on_auth_user_created') THEN
            CREATE TRIGGER on_auth_user_created
              AFTER INSERT ON neon_auth.users
              FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
          END IF;
        END IF;
      END$$;
    `;
    console.log("✅ Neon Auth DB user sync trigger ready.");

    console.log(
      "🎉 Neon Database Schema Initialization Completed Successfully!",
    );

    return { success: true };
  } catch (error) {
    console.error("❌ Neon Database Schema Initialization Failed:", error);

    return { success: false, error: error.message };
  }
}
