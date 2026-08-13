import { ZodError } from "zod";
import { apiError, apiSuccess } from "@/lib/api-response";
import { getCurrentProfile, isAccountOperational } from "@/lib/auth/current-profile";
import { hasFreshAuthentication } from "@/lib/auth/fresh-auth";
import { isUniqueConstraintFor } from "@/lib/db/prisma-errors";
import { verifyCsrf } from "@/lib/security/csrf";
import { checkRateLimit, getClientIp } from "@/lib/security/rate-limiter";
import { getLeaseEvidenceSecret, hashLeaseEvidence } from "@/features/leases/agreement";
import { leaseAcceptSchema, leaseRouteParamsSchema } from "@/features/leases/contracts";
import { LeaseRepository } from "@/repositories/lease.repository";
type Context={params:Promise<{id:string}>};
export async function POST(request: Request, context: Context) {
  try {
    const profile = await getCurrentProfile();
    if (!profile) return apiError("Authentication required", 401);
    if (!verifyCsrf(request)) return apiError("Security check failed", 403);
    if (!isAccountOperational(profile)) return apiError("Account access unavailable", 403);
    if (!(await hasFreshAuthentication())) return apiError("Sign in again before accepting this agreement", 401);
    if (!checkRateLimit(getClientIp(request), `lease-accept:${profile.id}`, 10, 3_600_000).allowed) return apiError("Too many acceptance attempts. Try again later", 429);
    const { id } = leaseRouteParamsSchema.parse(await context.params);
    const input = leaseAcceptSchema.parse(await request.json());
    const evidence = hashLeaseEvidence(getClientIp(request), request.headers.get("user-agent") ?? "unknown", getLeaseEvidenceSecret());
    return apiSuccess(await LeaseRepository.accept(profile, id, { ...input, ...evidence }), "Lease acceptance recorded");
  } catch (error) {
    if (error instanceof ZodError) return apiError(error.issues[0]?.message ?? "Invalid acceptance", 400);
    if (error instanceof Error && error.message === "LEASE_EVIDENCE_SECRET_NOT_CONFIGURED") return apiError("Lease acceptance is temporarily unavailable", 503);
    if (error instanceof Error && error.message === "FORBIDDEN") return apiError("Only lease participants may accept", 403);
    if (error instanceof Error && error.message === "NOT_FOUND") return apiError("Lease not found", 404);
    if ((error instanceof Error && error.message === "LEASE_CONFLICT") || isUniqueConstraintFor(error, ["leaseVersionId", "party"]) || (typeof error === "object" && error !== null && "code" in error && error.code === "P2034")) return apiError("This version changed or was already accepted. Refresh and try again", 409);
    return apiError("Unable to accept lease", 500);
  }
}
