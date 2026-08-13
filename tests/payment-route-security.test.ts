import { beforeEach, describe, expect, it, vi } from "vitest";
const mocks=vi.hoisted(()=>({profile:vi.fn(),csrf:vi.fn(),getPayment:vi.fn()}));
vi.mock("@/lib/auth/current-profile",()=>({getCurrentProfile:mocks.profile,isAccountOperational:(p:{accountStatus:string})=>p.accountStatus!=="Suspended"}));
vi.mock("@/lib/security/csrf",()=>({verifyCsrf:mocks.csrf}));
vi.mock("@/repositories/tenant-operations.repository",()=>({TenantOperationsRepository:{getOwnedPayment:mocks.getPayment}}));
vi.mock("@/services/payments/paystack-rent",()=>({initializeRentPayment:vi.fn(),verifyRentPayment:vi.fn()}));
import { POST as initialize } from "@/app/api/payments/[id]/initialize/route";
import { POST as verify } from "@/app/api/payments/[id]/verify/route";
describe("payment mutation security",()=>{beforeEach(()=>{vi.clearAllMocks();mocks.profile.mockResolvedValue({id:"tenant-1",role:"Tenant",accountStatus:"Active"});mocks.csrf.mockReturnValue(false);});it.each([["initialize",initialize],["verify",verify]] as const)("requires CSRF for %s",async(_name,handler)=>{const response=await handler(new Request("http://localhost/api/payments/payment-1",{method:"POST",body:JSON.stringify(_name==="verify"?{reference:"reference-1"}:{channel:"card"})}),{params:Promise.resolve({id:"payment-1"})});expect(response.status).toBe(403);expect(mocks.getPayment).not.toHaveBeenCalled();});it("rejects a suspended operational account",async()=>{mocks.csrf.mockReturnValue(true);mocks.profile.mockResolvedValue({id:"tenant-1",role:"Tenant",accountStatus:"Suspended"});const response=await initialize(new Request("http://localhost/api/payments/payment-1",{method:"POST",body:JSON.stringify({channel:"card"})}),{params:Promise.resolve({id:"payment-1"})});expect(response.status).toBe(403);});});
