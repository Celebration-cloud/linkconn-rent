import { supabaseServer } from "@/lib/superbaseServer";

export async function setupUserTable() {
  const tables = {
    users: [
      { name: "id", type: "uuid" },
      { name: "email", type: "text" },
      { name: "role", type: "text" },
      { name: "ref_id", type: "uuid" },
      { name: "created_at", type: "timestamptz" },
    ],
    landlords: [
      { name: "full_name", type: "text" },
      { name: "email", type: "text" },
      { name: "password", type: "text" },
      { name: "company_name", type: "text" },
      { name: "address", type: "text" },
      { name: "profile_pic", type: "text" },
      { name: "onboarded", type: "boolean" },
      { name: "role", type: "text" },
    ],
    agents: [
      { name: "full_name", type: "text" },
      { name: "email", type: "text" },
      { name: "password", type: "text" },
      { name: "agency_name", type: "text" },
      { name: "address", type: "text" },
      { name: "profile_pic", type: "text" },
      { name: "onboarded", type: "boolean" },
      { name: "role", type: "text" },
    ],
    tenants: [
      { name: "full_name", type: "text" },
      { name: "email", type: "text" },
      { name: "password", type: "text" },
      { name: "preferred_location", type: "text" },
      { name: "budget_range", type: "text" },
      { name: "move_in_date", type: "date" },
      { name: "address", type: "text" },
      { name: "profile_pic", type: "text" },
      { name: "onboarded", type: "boolean" },
      { name: "role", type: "text" },
    ],
  };

  for (const [tableName, columns] of Object.entries(tables)) {
    console.log(`🔧 Checking table: ${tableName}`);
    for (const col of columns) {
      const { error } = await supabaseServer.rpc("add_column_if_missing", {
        tbl: tableName,
        col: col.name,
        coltype: col.type,
      });
      if (error) console.error(`❌ ${tableName}.${col.name}:`, error.message);
      else console.log(`✅ ${tableName}.${col.name} ok`);
    }
  }

  return { status: "done" };
}
