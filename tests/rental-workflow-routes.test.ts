import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ getCurrentProfile: vi.fn(), applicationList: vi.fn(), applicationDetail: vi.fn(), applicationTransition: vi.fn(), viewingDetail: vi.fn(), viewingTransition: vi.fn(), verifyCsrf: vi.fn(() => true) }));
vi.mock("@/lib/auth/current-profile", () => ({ getCurrentProfile: mocks.getCurrentProfile, isAccountOperational: (profile: { accountStatus: string }) => profile.accountStatus !== "Suspended", hasRole: (profile: { role: string }, roles: string[]) => roles.includes(profile.role) }));
vi.mock("@/lib/security/csrf", () => ({ verifyCsrf: mocks.verifyCsrf }));
vi.mock("@/lib/security/rate-limiter", () => ({ checkRateLimit: () => ({ allowed: true }), getClientIp: () => "127.0.0.1" }));
vi.mock("@/repositories/application.repository", () => ({ ApplicationRepository: { list: mocks.applicationList, detail: mocks.applicationDetail, transition: mocks.applicationTransition } }));
vi.mock("@/repositories/viewing.repository", () => ({ ViewingRepository: { detail: mocks.viewingDetail, transition: mocks.viewingTransition } }));

import { GET as GET_APPLICATIONS } from "@/app/api/applications/route";
import { GET as GET_APPLICATION, PATCH as PATCH_APPLICATION } from "@/app/api/applications/[id]/route";
import { GET as GET_VIEWING, PATCH as PATCH_VIEWING } from "@/app/api/viewings/[id]/route";

const profile = { id: "tenant-1", role: "Tenant", accountStatus: "Active", email: "tenant@example.com", firstName: "Teni", lastName: "Tenant", onboardingComplete: true };
const context = { params: Promise.resolve({ id: "11111111-1111-4111-8111-111111111111" }) };

describe("rental workflow routes", () => {
  beforeEach(() => { vi.clearAllMocks(); mocks.getCurrentProfile.mockResolvedValue(profile); mocks.applicationList.mockResolvedValue([]); mocks.applicationDetail.mockResolvedValue({ id: "application-1" }); mocks.applicationTransition.mockResolvedValue({ status: "Withdrawn" }); mocks.viewingDetail.mockResolvedValue({ id: "viewing-1" }); mocks.viewingTransition.mockResolvedValue({ status: "Confirmed" }); });

  it("allows tenants to read their own compact application list privately", async () => {
    const response = await GET_APPLICATIONS();
    expect(response.status).toBe(200);
    expect(response.headers.get("cache-control")).toContain("no-store");
    expect(mocks.applicationList).toHaveBeenCalledWith(expect.objectContaining({ id: "tenant-1", role: "Tenant" }));
  });

  it("serves an addressable application detail and tenant withdrawal", async () => {
    expect((await GET_APPLICATION(new Request("http://localhost/api/applications/id"), context)).status).toBe(200);
    const response = await PATCH_APPLICATION(new Request("http://localhost:3000/api/applications/id", { method: "PATCH", headers: { origin: "http://localhost:3000", "content-type": "application/json" }, body: JSON.stringify({ action: "withdraw", expectedStatus: "Pending", idempotencyKey: "withdraw-application" }) }), context);
    expect(response.status).toBe(200);
    expect(mocks.applicationTransition).toHaveBeenCalledWith(expect.objectContaining({ id: "tenant-1" }), "11111111-1111-4111-8111-111111111111", expect.objectContaining({ action: "withdraw" }));
  });

  it("serves viewing detail and tenant reschedule acceptance", async () => {
    expect((await GET_VIEWING(new Request("http://localhost/api/viewings/id"), context)).status).toBe(200);
    const response = await PATCH_VIEWING(new Request("http://localhost:3000/api/viewings/id", { method: "PATCH", headers: { origin: "http://localhost:3000", "content-type": "application/json" }, body: JSON.stringify({ action: "accept_reschedule", expectedStatus: "Rescheduled", idempotencyKey: "accept-viewing-1" }) }), context);
    expect(response.status).toBe(200);
    expect(mocks.viewingTransition).toHaveBeenCalledWith(expect.objectContaining({ id: "tenant-1" }), "11111111-1111-4111-8111-111111111111", expect.objectContaining({ action: "accept_reschedule" }));
  });

  it("rejects workflow mutations without CSRF verification", async () => {
    mocks.verifyCsrf.mockReturnValueOnce(false);
    const response = await PATCH_APPLICATION(new Request("http://localhost/api/applications/id", { method: "PATCH", body: "{}" }), context);
    expect(response.status).toBe(403);
    expect(mocks.applicationTransition).not.toHaveBeenCalled();
  });
});
