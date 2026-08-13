import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ profile: vi.fn(), csrf: vi.fn(), rate: vi.fn(), createMaintenance: vi.fn(), listMaintenance: vi.fn(), updateMaintenance: vi.fn(), createSupport: vi.fn(), listSupport: vi.fn() }));
vi.mock("@/lib/auth/current-profile", () => ({ getCurrentProfile: mocks.profile, isAccountOperational: (profile: { accountStatus: string }) => profile.accountStatus !== "Suspended" }));
vi.mock("@/lib/security/csrf", () => ({ verifyCsrf: mocks.csrf }));
vi.mock("@/lib/security/rate-limiter", () => ({ getClientIp: () => "127.0.0.1", checkRateLimit: mocks.rate }));
vi.mock("@/repositories/tenant-operations.repository", () => ({ TenantOperationsRepository: { createMaintenance: mocks.createMaintenance, listMaintenance: mocks.listMaintenance, updateMaintenance: mocks.updateMaintenance } }));
vi.mock("@/repositories/support.repository", () => ({ SupportRepository: { create: mocks.createSupport, listForProfile: mocks.listSupport } }));

import { GET as getMaintenance, POST as createMaintenance } from "@/app/api/maintenance/route";
import { PATCH as updateMaintenance } from "@/app/api/maintenance/[id]/route";
import { GET as getSupport, POST as createSupport } from "@/app/api/support-tickets/route";

const profile = { id: "tenant-1", firstName: "Teni", lastName: "Tenant", email: "teni@example.com", role: "Tenant", accountStatus: "Active" };
const maintenanceBody = { propertyId: "11111111-1111-4111-8111-111111111111", title: "Leaking kitchen tap", description: "Water is collecting below the kitchen sink.", priority: "High" };
const supportBody = { name: "Different Name", email: "other@example.com", category: "Maintenance", subject: "Repair follow-up", message: "I need an update about the repair request." };

describe("Task 6 operation route security", () => {
  beforeEach(() => { vi.clearAllMocks(); mocks.profile.mockResolvedValue(profile); mocks.csrf.mockReturnValue(true); mocks.rate.mockReturnValue({ allowed: true }); mocks.listMaintenance.mockResolvedValue([]); mocks.listSupport.mockResolvedValue([]); mocks.createMaintenance.mockResolvedValue({ id: "request-1" }); mocks.createSupport.mockResolvedValue({ id: "ticket-1", reference: "LCR-260813-ABC123" }); });

  it.each([["maintenance", createMaintenance, maintenanceBody], ["support", createSupport, supportBody]] as const)("requires CSRF for %s creation", async (_name, handler, body) => {
    mocks.csrf.mockReturnValue(false);
    const response = await handler(new Request("http://localhost/api/resource", { method: "POST", body: JSON.stringify(body) }));
    expect(response.status).toBe(403);
  });

  it.each([["maintenance", createMaintenance, maintenanceBody], ["support", createSupport, supportBody]] as const)("rejects suspended accounts for %s creation", async (_name, handler, body) => {
    mocks.profile.mockResolvedValue({ ...profile, accountStatus: "Suspended" });
    const response = await handler(new Request("http://localhost/api/resource", { method: "POST", body: JSON.stringify(body) }));
    expect(response.status).toBe(403);
  });

  it("requires authentication for support creation and passes authoritative profile context", async () => {
    mocks.profile.mockResolvedValue(null);
    expect((await createSupport(new Request("http://localhost/api/support-tickets", { method: "POST", body: JSON.stringify(supportBody) }))).status).toBe(401);
    mocks.profile.mockResolvedValue(profile);
    await createSupport(new Request("http://localhost/api/support-tickets", { method: "POST", body: JSON.stringify(supportBody) }));
    expect(mocks.createSupport).toHaveBeenCalledWith(profile, expect.objectContaining({ subject: "Repair follow-up" }));
  });

  it.each([["maintenance", getMaintenance], ["support", getSupport]] as const)("marks authenticated %s reads private and uncached", async (_name, handler) => {
    const response = await handler(new Request("http://localhost/api/resource"));
    expect(response.headers.get("cache-control")).toBe("private, no-store, max-age=0");
  });

  it("rejects an invalid maintenance status filter", async () => {
    expect((await getMaintenance(new Request("http://localhost/api/maintenance?status=Invented"))).status).toBe(400);
    expect(mocks.listMaintenance).not.toHaveBeenCalled();
  });

  it("maps a stale maintenance transition claim to conflict", async () => {
    mocks.updateMaintenance.mockRejectedValue(new Error("OPERATION_CONFLICT"));
    const response = await updateMaintenance(new Request("http://localhost/api/maintenance/request-1", { method: "PATCH", body: JSON.stringify({ status: "InProgress" }) }), { params: Promise.resolve({ id: "request-1" }) });
    expect(response.status).toBe(409);
  });
});
