// runDbInit.js
import fs from "fs";
import path from "path";

// Load environment variables manually
try {
  const envPath = path.resolve(process.cwd(), ".env");

  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, "utf-8");

    envContent.split("\n").forEach((line) => {
      const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);

      if (match) {
        const key = match[1];
        let value = match[2] || "";

        if (value.startsWith('"') && value.endsWith('"')) {
          value = value.substring(1, value.length - 1);
        } else if (value.startsWith("'") && value.endsWith("'")) {
          value = value.substring(1, value.length - 1);
        }
        process.env[key] = value;
      }
    });
  }
} catch (e) {
  console.error("Failed to load .env file:", e);
}

async function run() {
  console.log("⚡ Executing database initialization...");
  const { initializeDatabase } = await import("./dbInit.js");
  const result = await initializeDatabase();

  if (result.success) {
    console.log("🚀 Database tables set up successfully!");
    process.exit(0);
  } else {
    console.error("❌ Database setup failed:", result.error);
    process.exit(1);
  }
}

run();
