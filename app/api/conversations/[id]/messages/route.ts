import { ZodError } from "zod";
import { apiError, apiSuccess } from "@/lib/api-response";
import { getCurrentProfile, isAccountOperational } from "@/lib/auth/current-profile";
import { verifyCsrf } from "@/lib/security/csrf";
import { checkRateLimit, getClientIp } from "@/lib/security/rate-limiter";
import { OperatingSystemRepository } from "@/repositories/operating-system.repository";
import {
  messageCreateSchema,
  messageCursorSchema,
} from "@/schemas/operating-system";
const privateNoStore = (response: Response) => { response.headers.set("Cache-Control", "private, no-store, max-age=0"); return response; };

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const profile = await getCurrentProfile();
    if (!profile) return apiError("Authentication required", 401);
    if (!isAccountOperational(profile)) return apiError("Account access unavailable", 403);
    const query = messageCursorSchema.parse(
      Object.fromEntries(new URL(request.url).searchParams),
    );
    const { id } = await context.params;
    const messages = await OperatingSystemRepository.listMessages(
      profile.id,
      id,
      query.cursor ? new Date(query.cursor) : undefined,
      query.limit,
    );
    const nextCursor =
      messages.length === query.limit ? messages[0]?.createdAt ?? null : null;
    return privateNoStore(apiSuccess({ messages, nextCursor }, "Messages loaded"));
  } catch (error) {
    if (error instanceof ZodError) return apiError(error.issues[0].message, 400);
    if (error instanceof Error && error.message === "NOT_FOUND") {
      return apiError("Conversation not found", 404);
    }
    console.error("[GET /api/conversations/:id/messages]", error);
    return apiError("Unable to load messages", 500);
  }
}

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const profile = await getCurrentProfile();
    if (!profile) return apiError("Authentication required", 401);
    if (!verifyCsrf(request)) return apiError("Security check failed", 403);
    if (!isAccountOperational(profile)) return apiError("Account access unavailable", 403);
    if (!checkRateLimit(getClientIp(request), `message-send:${profile.id}`, 60, 60 * 60 * 1000).allowed) return apiError("Too many messages. Try again later", 429);
    const input = messageCreateSchema.parse(await request.json());
    const { id } = await context.params;
    const message = await OperatingSystemRepository.sendMessage(
      profile.id,
      id,
      input.body,
    );
    return apiSuccess(
      { ...message, clientId: input.clientId },
      "Message sent",
      201,
    );
  } catch (error) {
    if (error instanceof ZodError) return apiError(error.issues[0].message, 400);
    if (error instanceof Error && error.message === "NOT_FOUND") {
      return apiError("Conversation not found", 404);
    }
    console.error("[POST /api/conversations/:id/messages]", error);
    return apiError("Unable to send message", 500);
  }
}
