import { sql } from "../lib/db.js";

async function main() {
  try {
    const result = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `;

    console.log(
      "Tables in public schema:",
      result.map((r) => r.table_name),
    );

    // Also check if users has any records or its schema
    try {
      const usersCols = await sql`
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = 'users'
      `;

      console.log(
        "Columns in 'users' table:",
        usersCols.map((c) => `${c.column_name} (${c.data_type})`),
      );
    } catch (e) {
      console.log("Could not query 'users' columns:", e.message);
    }

    try {
      const profilesCols = await sql`
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = 'profiles'
      `;

      console.log(
        "Columns in 'profiles' table:",
        profilesCols.map((c) => `${c.column_name} (${c.data_type})`),
      );
    } catch (e) {
      console.log("Could not query 'profiles' columns:", e.message);
    }
  } catch (err) {
    console.error("Error listing tables:", err);
  }
}

main();
