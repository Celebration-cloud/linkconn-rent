import { ZodError, z } from "zod";
import { apiError, apiSuccess } from "@/lib/api-response";
import { getCurrentProfile, isAccountOperational } from "@/lib/auth/current-profile";
import { SupportRepository } from "@/repositories/support.repository";

const paramsSchema = z.object({ id: z.string().uuid() });

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const profile = await getCurrentProfile();
    if (!profile) return apiError("Authentication required", 401);
    if (!isAccountOperational(profile)) return apiError("Account access unavailable", 403);
    const { id } = paramsSchema.parse(await context.params);
    const detail = await SupportRepository.detailForProfile(profile.id, id);
    if (!detail) return apiError("Support ticket not found", 404);
    const response = apiSuccess(detail, "Support ticket loaded");
    response.headers.set("Cache-Control", "private, no-store, max-age=0");
    return response;
  } catch (error) {
    if (error instanceof ZodError) return apiError("Invalid support ticket id", 400);
    return apiError("Unable to load support ticket", 500);
  }
}
