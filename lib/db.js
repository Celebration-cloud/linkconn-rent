import fs from "fs";
import path from "path";

const DATA_DIR = path.join(process.cwd(), ".data");
const DB_FILE = path.join(DATA_DIR, "mock-db.json");

function ensureDir() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
}

function readDB() {
  ensureDir();
  if (!fs.existsSync(DB_FILE)) return { profiles: [] };
  return JSON.parse(fs.readFileSync(DB_FILE, "utf-8"));
}

function writeDB(data) {
  ensureDir();
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
}

const profiles = [];

async function executeQuery(text, args) {
  const db = readDB();
  const lower = text.replace(/\s+/g, " ").trim().toLowerCase();

  const stmt = lower.startsWith("create") ||
    lower.startsWith("alter") ||
    lower.startsWith("do $$") ||
    lower.startsWith("create or replace function") ||
    lower.startsWith("create extension");

  if (stmt) return [];

  // INSERT INTO profiles (...) VALUES (...) ON CONFLICT (id) DO UPDATE SET ... RETURNING *
  if (lower.includes("insert into profiles") && lower.includes("on conflict")) {
    const colMatch = text.match(/\(([^)]+)\)\s*VALUES/i);
    if (!colMatch) throw new Error("Cannot parse INSERT columns");

    const columns = colMatch[1]
      .split(",")
      .map((c) => c.trim().replace(/"/g, ""));
    const profile = {};

    columns.forEach((col, idx) => {
      profile[col] = args[idx] ?? null;
    });

    const existingIdx = db.profiles.findIndex(
      (p) => p.id === profile.id || p.email === profile.email
    );

    if (existingIdx !== -1) {
      db.profiles[existingIdx] = { ...db.profiles[existingIdx], ...profile };
      writeDB(db);
      return [db.profiles[existingIdx]];
    }

    if (!profile.id) profile.id = `mock-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    if (!profile.created_at) profile.created_at = new Date().toISOString();

    db.profiles.push(profile);
    writeDB(db);
    return [profile];
  }

  // SELECT ... FROM profiles WHERE email = $1 LIMIT 1
  if (lower.includes("from profiles") && lower.includes("where email")) {
    const email = args[0];
    const match = db.profiles.find((p) => p.email === email);
    return match ? [match] : [];
  }

  // SELECT ... FROM profiles WHERE id = $1 LIMIT 1
  if (lower.includes("from profiles") && lower.includes("where id")) {
    const id = args[0];
    const match = db.profiles.find((p) => p.id === id);
    return match ? [match] : [];
  }

  throw new Error(
    `Unhandled SQL query: ${text.substring(0, 200)}...\nArgs: ${JSON.stringify(args)}`
  );
}

function sql(strings, ...values) {
  let text = strings[0];
  for (let i = 0; i < values.length; i++) {
    text += `$${i + 1}` + strings[i + 1];
  }
  return executeQuery(text, values);
}

export { sql };
