import { ZodError } from "zod";
import { apiError, apiSuccess } from "@/lib/api-response";
import { getCurrentProfile } from "@/lib/auth/current-profile";
import { SupportRepository } from "@/repositories/support.repository";
import { supportTicketSchema } from "@/schemas/operating-system";

export async function GET() {
  const profile = await getCurrentProfile();
  if (!profile) return apiError("Authentication required", 401);
  const tickets = await SupportRepository.listForProfile(profile.id);
  return apiSuccess(tickets, "Support tickets loaded");
}

export async function POST(request: Request) {
  try {
    const profile = await getCurrentProfile();
    const input = supportTicketSchema.parse(await request.json());
    const ticket = await SupportRepository.create(input, profile?.id);
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
