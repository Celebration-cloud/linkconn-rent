import { ZodError } from "zod";
import { apiError, apiSuccess } from "@/lib/api-response";
import { getCurrentProfile, isAccountOperational } from "@/lib/auth/current-profile";
import { verifyCsrf } from "@/lib/security/csrf";
import { checkRateLimit, getClientIp } from "@/lib/security/rate-limiter";
import { SupportRepository } from "@/repositories/support.repository";
import { supportTicketSchema } from "@/schemas/operating-system";

export async function GET(_request: Request) {
  const profile = await getCurrentProfile();
  if (!profile) return apiError("Authentication required", 401);
  if (!isAccountOperational(profile)) return apiError("Account access unavailable", 403);
  const tickets = await SupportRepository.listForProfile(profile.id);
  const response = apiSuccess(tickets, "Support tickets loaded");
  response.headers.set("Cache-Control", "private, no-store, max-age=0");
  return response;
}

export async function POST(request: Request) {
  try {
    const profile = await getCurrentProfile();
    if (!profile) return apiError("Authentication required", 401);
    if (!verifyCsrf(request)) return apiError("Security check failed", 403);
    if (!isAccountOperational(profile)) return apiError("Account access unavailable", 403);
    if (!checkRateLimit(getClientIp(request), `support-create:${profile.id}`, 10, 3_600_000).allowed) return apiError("Too many support requests. Try again later", 429);
    const payload = await request.json();
    const input = supportTicketSchema.parse({
      ...payload,
      name: `${profile.firstName} ${profile.lastName}`.trim(),
      email: profile.email,
    });
    const ticket = await SupportRepository.create(profile, input);
    return apiSuccess(
      ticket,
      `Support request ${ticket.reference} has been received`,
      201,
    );
  } catch (error) {
    if (error instanceof ZodError) {
      return apiError(error.issues[0]?.message || "Invalid support request", 400);
    }
    console.error("[POST /api/support-tickets]", error);
    return apiError("Unable to create support request", 500);
  }
}
