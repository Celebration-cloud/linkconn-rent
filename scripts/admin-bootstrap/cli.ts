import { createInterface } from "node:readline/promises";
import { readFile, unlink } from "node:fs/promises";
import { stdin as input, stdout as output } from "node:process";
import { loadEnvConfig } from "@next/env";
import { PrismaClient } from "@prisma/client";
import { generateBootstrapPassword, validateBootstrapDatabaseUrl } from "./utils";

loadEnvConfig(process.cwd());

const prisma = new PrismaClient();
const DEFAULT_EMAIL = "superadmin@linkconn.rent";
const OTP_WAIT_MS = 10 * 60 * 1000;

type JsonEnvelope<T> = { success: boolean; data: T; message: string };

class CookieJar {
  private readonly values = new Map<string, string>();

  capture(headers: Headers) {
    const setCookies = typeof headers.getSetCookie === "function"
      ? headers.getSetCookie()
      : [headers.get("set-cookie")].filter((value): value is string => Boolean(value));
    for (const setCookie of setCookies) {
      const [pair] = setCookie.split(";");
      const separator = pair.indexOf("=");
      if (separator <= 0) continue;
      const name = pair.slice(0, separator);
      const value = pair.slice(separator + 1);
      if (value) this.values.set(name, value);
      else this.values.delete(name);
    }
  }

  header() {
    return [...this.values].map(([name, value]) => `${name}=${value}`).join("; ");
  }
}

function normalizeEmail(value: string) {
  return value.trim().toLowerCase();
}

function databaseUrl() {
  return validateBootstrapDatabaseUrl(process.env.DATABASE_URL);
}

function baseUrl() {
  const value = process.env.ADMIN_BOOTSTRAP_BASE_URL || process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const url = new URL(value);
  if (!/^https?:$/.test(url.protocol)) throw new Error("ADMIN_BOOTSTRAP_BASE_URL must be HTTP or HTTPS");
  return url.origin;
}

async function request<T>(jar: CookieJar, path: string, init?: RequestInit): Promise<{ response: Response; body: JsonEnvelope<T> }> {
  const origin = baseUrl();
  const response = await fetch(`${origin}${path}`, {
    ...init,
    redirect: "manual",
    headers: {
      origin,
      ...(jar.header() ? { cookie: jar.header() } : {}),
      ...(init?.body ? { "content-type": "application/json" } : {}),
      ...init?.headers,
    },
  });
  jar.capture(response.headers);
  const responseText = await response.text();
  const body = responseText
    ? JSON.parse(responseText) as JsonEnvelope<T>
    : { success: response.ok, data: undefined as T, message: response.statusText };
  return { response, body };
}

async function receiveVerificationCode(email: string) {
  const otpFile = process.env.ADMIN_BOOTSTRAP_OTP_FILE;
  if (!otpFile) {
    const readline = createInterface({ input, output });
    const otp = (await readline.question(`Enter the 6-digit Neon verification code sent to ${email}: `)).trim();
    readline.close();
    return otp;
  }

  console.log(`[admin-bootstrap] verification code sent to ${email}; waiting for the secure OTP handoff`);
  const deadline = Date.now() + OTP_WAIT_MS;
  while (Date.now() < deadline) {
    try {
      const otp = (await readFile(otpFile, "utf8")).trim();
      await unlink(otpFile).catch(() => undefined);
      return otp;
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
      await new Promise((resolve) => setTimeout(resolve, 1_000));
    }
  }
  throw new Error("Timed out waiting for the Neon verification code");
}

async function preflight(email: string) {
  const url = databaseUrl();
  const rows = await prisma.$queryRaw<Array<{ database: string; server: string }>>`
    SELECT current_database()::text AS database, inet_server_addr()::text AS server
  `;
  if (!rows[0]?.database) throw new Error("Bootstrap refused: Neon database preflight returned no database");

  const existing = await prisma.profile.findUnique({ where: { email } });
  const otherSuperAdmin = await prisma.profile.findFirst({
    where: { role: "SuperAdmin", accountStatus: "Active", email: { not: email } },
    select: { email: true },
  });
  return { hostname: url.hostname, existing, otherSuperAdmin };
}

async function verifyCredential(email: string, password: string) {
  const jar = new CookieJar();
  const login = await request<{ user: { id: string; email: string; emailVerified: boolean }; url: string }>(jar, "/api/auth/custom/login", {
    method: "POST",
    body: JSON.stringify({ email, password, callbackURL: "/admin" }),
  });
  if (!login.response.ok || !login.body.success) throw new Error("Credential verification failed: Neon Auth rejected the login");
  if (!login.body.data.user.emailVerified) throw new Error("Credential verification failed: email is not verified");

  const profileResponse = await request<{ id: string; email: string; role: string; emailVerified: boolean }>(jar, "/api/profile/me");
  if (!profileResponse.response.ok || !profileResponse.body.success) throw new Error("Credential verification failed: profile mirror is unavailable");
  const profile = profileResponse.body.data;
  if (profile.id.toLowerCase() !== login.body.data.user.id.toLowerCase()) throw new Error("Credential verification failed: Neon Auth/Profile ID mismatch");
  if (normalizeEmail(profile.email) !== email || profile.role !== "SuperAdmin" || !profile.emailVerified) {
    throw new Error("Credential verification failed: Prisma Super Admin profile is inconsistent");
  }

  const admin = await fetch(`${baseUrl()}/admin`, { headers: { cookie: jar.header() }, redirect: "manual" });
  if (admin.status !== 200) throw new Error(`Credential verification failed: /admin returned ${admin.status}`);
  return { userId: profile.id };
}

async function bootstrap() {
  if (!process.argv.includes("--confirm")) throw new Error("Bootstrap requires --confirm");
  if (process.env.ADMIN_BOOTSTRAP_INBOX_CONFIRMED !== "true") {
    throw new Error("Set ADMIN_BOOTSTRAP_INBOX_CONFIRMED=true only after confirming access to the bootstrap mailbox");
  }
  const email = normalizeEmail(process.env.ADMIN_BOOTSTRAP_EMAIL || DEFAULT_EMAIL);
  const name = process.env.ADMIN_BOOTSTRAP_NAME?.trim() || "LinkConn Super Admin";
  const password = process.env.ADMIN_BOOTSTRAP_PASSWORD || generateBootstrapPassword();
  const state = await preflight(email);
  console.log(`[admin-bootstrap] connected to Neon pooler ${state.hostname}`);

  if (state.otherSuperAdmin) throw new Error("Bootstrap refused: a different active Super Admin already exists");
  if (state.existing?.role === "SuperAdmin" && state.existing.emailVerified && state.existing.onboardingComplete) {
    if (!process.env.ADMIN_BOOTSTRAP_PASSWORD) {
      console.log("[admin-bootstrap] account is already consistent; use password reset or provide ADMIN_BOOTSTRAP_PASSWORD to verify it");
      return;
    }
    await verifyCredential(email, password);
    console.log("[admin-bootstrap] existing Super Admin verified successfully");
    return;
  }
  if (state.existing) throw new Error("Bootstrap refused: the email already belongs to an incomplete or non-SuperAdmin profile");

  const jar = new CookieJar();
  const signup = await request<{ user: { id: string; email: string; emailVerified: boolean } }>(jar, "/api/auth/custom/signup", {
    method: "POST",
    body: JSON.stringify({ name, email, password, callbackURL: "/verify-email?next=/admin" }),
  });
  if (!signup.response.ok || !signup.body.success) throw new Error(`Neon Auth signup failed: ${signup.body.message}`);

  if (!signup.body.data.user.emailVerified) {
    const sent = await request<unknown>(jar, "/api/auth/custom/send-otp", {
      method: "POST",
      body: JSON.stringify({ email }),
    });
    if (!sent.response.ok || !sent.body.success) throw new Error(`Unable to send verification code: ${sent.body.message}`);
    const otp = await receiveVerificationCode(email);
    if (!/^\d{6}$/.test(otp)) throw new Error("Verification code must contain exactly 6 digits");
    const verified = await request<unknown>(jar, "/api/auth/custom/verify-email", {
      method: "POST",
      body: JSON.stringify({ email, otp }),
    });
    if (!verified.response.ok || !verified.body.success) throw new Error(`Email verification failed: ${verified.body.message}`);
  }

  const mirrored = await request<{ id: string; email: string; emailVerified: boolean }>(jar, "/api/profile/me");
  if (!mirrored.response.ok || !mirrored.body.success || !mirrored.body.data.emailVerified) {
    throw new Error("Bootstrap refused: verified Neon Auth identity was not mirrored into Prisma");
  }
  if (normalizeEmail(mirrored.body.data.email) !== email) throw new Error("Bootstrap refused: mirrored email mismatch");

  await prisma.$transaction(async (tx) => {
    const profile = await tx.profile.findUnique({ where: { id: mirrored.body.data.id } });
    if (!profile || normalizeEmail(profile.email) !== email) throw new Error("Bootstrap refused: mirrored profile identity mismatch");
    await tx.profile.update({
      where: { id: profile.id },
      data: {
        role: "SuperAdmin",
        accountStatus: "Active",
        verificationLevel: "Trusted",
        onboardingComplete: true,
        emailVerified: true,
      },
    });
    await tx.adminAuditEvent.create({
      data: {
        actorId: profile.id,
        action: "admin.bootstrap.created",
        targetType: "User",
        targetId: profile.id,
        resultingState: { email, role: "SuperAdmin" },
        reason: "Initial Super Admin bootstrap",
      },
    });
  });

  await verifyCredential(email, password);
  console.log("\nINITIAL SUPER ADMIN — COPY ONCE AND STORE SECURELY");
  console.log(`Email: ${email}`);
  console.log(`Password: ${password}`);
  console.log("The password is not stored by this script. Change it after first login.");
}

async function verify() {
  const email = normalizeEmail(process.env.ADMIN_BOOTSTRAP_EMAIL || DEFAULT_EMAIL);
  const password = process.env.ADMIN_BOOTSTRAP_PASSWORD;
  if (!password) throw new Error("ADMIN_BOOTSTRAP_PASSWORD is required for credential verification");
  await preflight(email);
  const result = await verifyCredential(email, password);
  console.log(`[admin-bootstrap] verified Neon Auth, Prisma mirror, and /admin access for user ${result.userId.slice(0, 8)}…`);
}

async function recoverPassword() {
  if (!process.argv.includes("--confirm")) throw new Error("Password recovery requires --confirm");
  if (process.env.ADMIN_BOOTSTRAP_INBOX_CONFIRMED !== "true") {
    throw new Error("Set ADMIN_BOOTSTRAP_INBOX_CONFIRMED=true only after confirming access to the bootstrap mailbox");
  }
  const email = normalizeEmail(process.env.ADMIN_BOOTSTRAP_EMAIL || DEFAULT_EMAIL);
  const password = process.env.ADMIN_BOOTSTRAP_PASSWORD || generateBootstrapPassword();
  const state = await preflight(email);
  if (
    !state.existing ||
    state.existing.role !== "SuperAdmin" ||
    !state.existing.emailVerified ||
    !state.existing.onboardingComplete
  ) {
    throw new Error("Password recovery refused: the Super Admin profile is not fully verified");
  }

  const jar = new CookieJar();
  const sent = await request<unknown>(jar, "/api/auth/email-otp/send-verification-otp", {
    method: "POST",
    body: JSON.stringify({ email, type: "forget-password" }),
  });
  if (!sent.response.ok) throw new Error("Unable to send the Neon password-reset code");
  const otp = await receiveVerificationCode(email);
  if (!/^\d{6}$/.test(otp)) throw new Error("Verification code must contain exactly 6 digits");
  const reset = await request<unknown>(jar, "/api/auth/email-otp/reset-password", {
    method: "POST",
    body: JSON.stringify({ email, otp, password }),
  });
  if (!reset.response.ok) throw new Error("Neon Auth rejected the password-reset code");

  await verifyCredential(email, password);
  console.log("\nINITIAL SUPER ADMIN — COPY ONCE AND STORE SECURELY");
  console.log(`Email: ${email}`);
  console.log(`Password: ${password}`);
  console.log("The password is not stored by this script. Change it after first login.");
}

const command = process.argv[2];
(command === "bootstrap"
  ? bootstrap()
  : command === "verify"
    ? verify()
    : command === "recover-password"
      ? recoverPassword()
      : Promise.reject(new Error("Use bootstrap, verify, or recover-password")))
  .catch((error) => {
    console.error(error instanceof Error ? error.message : "Admin bootstrap failed");
    process.exitCode = 1;
  })
  .finally(async () => prisma.$disconnect());
