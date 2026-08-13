import { z, ZodError } from "zod";
import { apiError } from "@/lib/api-response";
import { getCurrentProfile, isAccountOperational } from "@/lib/auth/current-profile";
import { leaseRouteParamsSchema } from "@/features/leases/contracts";
import { LeaseRepository } from "@/repositories/lease.repository";

const documentQuerySchema = z.object({ version: z.coerce.number().int().positive().optional() });

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const profile = await getCurrentProfile();
    if (!profile) return apiError("Authentication required", 401);
    if (!isAccountOperational(profile)) return apiError("Account access unavailable", 403);
    const { id } = leaseRouteParamsSchema.parse(await context.params);
    const query = documentQuerySchema.parse(Object.fromEntries(new URL(request.url).searchParams));
    const lease = await LeaseRepository.detail(profile, id);
    const version = query.version === undefined ? lease?.versions[0] : lease?.versions.find((item) => item.version === query.version);
    if (!lease || !version) return apiError("Agreement not found", 404);
    return new Response(`<!doctype html><html><head><meta charset="utf-8"><title>Lease agreement</title></head><body>${version.renderedAgreement}</body></html>`, { headers: { "Content-Type": "text/html; charset=utf-8", "Content-Disposition": `inline; filename="lease-${lease.id}-v${version.version}.html"`, "Cache-Control": "private, no-store, max-age=0", "X-Content-Type-Options": "nosniff" } });
  } catch (error) {
    if (error instanceof ZodError) return apiError("Invalid agreement request", 400);
    return apiError("Unable to load agreement", 500);
  }
}
