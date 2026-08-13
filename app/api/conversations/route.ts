import { ZodError } from "zod";
import { apiError, apiSuccess } from "@/lib/api-response";
import { getCurrentProfile, hasRole, isAccountOperational } from "@/lib/auth/current-profile";
import { verifyCsrf } from "@/lib/security/csrf";
import { OperatingSystemRepository } from "@/repositories/operating-system.repository";
import { conversationCreateSchema } from "@/schemas/operating-system";
const privateNoStore = (response: Response) => { response.headers.set("Cache-Control", "private, no-store, max-age=0"); return response; };

export async function GET() {
  try {
    const profile = await getCurrentProfile();
    if (!profile) return apiError("Authentication required", 401);
    if (!isAccountOperational(profile)) return apiError("Account access unavailable", 403);
    const conversations =
      await OperatingSystemRepository.listConversations(profile.id);
    return privateNoStore(apiSuccess(conversations, "Conversations loaded"));
  } catch (error) {
    console.error("[GET /api/conversations]", error);
    return apiError("Unable to load conversations", 500);
  }
}

export async function POST(request: Request) {
  try {
    const profile = await getCurrentProfile();
    if (!profile) return apiError("Authentication required", 401);
    if (!verifyCsrf(request)) return apiError("Security check failed", 403);
    if (!isAccountOperational(profile)) return apiError("Account access unavailable", 403);
    if (!hasRole(profile, ["Tenant"])) {
      return apiError("Tenant access required", 403);
    }
    const input = conversationCreateSchema.parse(await request.json());
    const conversation =
      await OperatingSystemRepository.createOrFindConversation(
        profile.id,
        input.propertyId,
        input.applicationId,
      );
    return apiSuccess(conversation, "Conversation ready", 201);
  } catch (error) {
    if (error instanceof ZodError) return apiError(error.issues[0].message, 400);
    if (error instanceof Error && error.message === "NOT_FOUND") {
      return apiError("Property not found", 404);
    }
    if (error instanceof Error && error.message === "OWN_PROPERTY") {
      return apiError("You cannot start a tenant conversation on your property", 409);
    }
    console.error("[POST /api/conversations]", error);
    return apiError("Unable to start conversation", 500);
  }
}
