import { ZodError } from "zod";
import { apiError, apiSuccess } from "@/lib/api-response";
import { getCurrentProfile, isAccountOperational } from "@/lib/auth/current-profile";
import { verifyCsrf } from "@/lib/security/csrf";
import { checkRateLimit, getClientIp } from "@/lib/security/rate-limiter";
import { ApplicationRepository } from "@/repositories/application.repository";
import { applicationMutationSchema } from "@/features/applications/contracts";

type Context = { params: Promise<{ id: string }> };
const privateNoStore = (response: Response) => { response.headers.set("Cache-Control", "private, no-store, max-age=0"); return response; };

export async function GET(_request: Request, context: Context) {
  try {
    const profile = await getCurrentProfile(); if (!profile) return apiError("Authentication required", 401);
    if (!isAccountOperational(profile)) return apiError("Account access unavailable", 403);
    const { id } = await context.params; const detail = await ApplicationRepository.detail(profile, id);
    if (!detail) return apiError("Application not found", 404);
    return privateNoStore(apiSuccess(detail, "Application loaded"));
  } catch (error) { console.error("[GET /api/applications/:id]", error); return apiError("Unable to load application", 500); }
}

export async function PATCH(request: Request, context: Context) {
  try {
    const profile = await getCurrentProfile(); if (!profile) return apiError("Authentication required", 401);
    if (!verifyCsrf(request)) return apiError("Security check failed", 403);
    if (!isAccountOperational(profile)) return apiError("Account access unavailable", 403);
    if (!checkRateLimit(getClientIp(request), `application-mutation:${profile.id}`, 30, 60 * 60 * 1000).allowed) return apiError("Too many application actions. Try again later", 429);
    const input = applicationMutationSchema.parse(await request.json()); const { id } = await context.params;
    return apiSuccess(await ApplicationRepository.transition(profile, id, input), "Application updated");
  } catch (error) {
    if (error instanceof ZodError) return apiError(error.issues[0]?.message ?? "Invalid application action", 400);
    if (error instanceof Error && error.message === "NOT_FOUND") return apiError("Application not found", 404);
    if (error instanceof Error && error.message === "FORBIDDEN") return apiError("Application access denied", 403);
    if (error instanceof Error && ["INVALID_TRANSITION", "CONFLICT", "IDEMPOTENCY_CONFLICT"].includes(error.message)) return apiError("This application changed. Refresh before trying again", 409);
    console.error("[PATCH /api/applications/:id]", error); return apiError("Unable to update application", 500);
  }
}
